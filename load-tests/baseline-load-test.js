#!/usr/bin/env node

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:8787';
const VUS = Number(process.env.VUS || 100);
const DURATION_SECONDS = Number(process.env.DURATION_SECONDS || 60);
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 10_000);
const REPORT_DIR = process.env.REPORT_DIR || path.join(process.cwd(), 'reports', 'load-tests');

const scenarios = [
  { method: 'GET', path: '/api/health', weight: 3 },
  { method: 'GET', path: '/api/state', weight: 3 },
  { method: 'GET', path: '/api/teachers', weight: 2 },
  { method: 'GET', path: '/api/maps/resolve?query=pet%20clinics%20near%20Chennai', weight: 1 },
  { method: 'GET', path: '/', weight: 1 }
];

const weightedRequests = scenarios.flatMap(scenario => Array.from({ length: scenario.weight }, () => scenario));
const baseUrl = new URL(TARGET_URL);
const client = baseUrl.protocol === 'https:' ? https : http;
const keepAliveAgent = new client.Agent({ keepAlive: true, maxSockets: VUS * 2 });

const results = [];
const startedAt = new Date();
const endAt = performance.now() + DURATION_SECONDS * 1000;

function percentile(sorted, value) {
  if (!sorted.length) return 0;
  const index = Math.ceil((value / 100) * sorted.length) - 1;
  return sorted[Math.min(Math.max(index, 0), sorted.length - 1)];
}

function chooseScenario(vu, iteration) {
  return weightedRequests[(vu + iteration) % weightedRequests.length];
}

function sendRequest(scenario) {
  return new Promise(resolve => {
    const started = performance.now();
    const requestUrl = new URL(scenario.path, baseUrl);
    const req = client.request(requestUrl, {
      method: scenario.method,
      agent: keepAliveAgent,
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
        Accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
        'User-Agent': 'PawPal baseline-load-test'
      }
    }, res => {
      res.resume();
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 400,
          status: res.statusCode,
          path: scenario.path,
          durationMs: performance.now() - started
        });
      });
    });

    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', error => {
      resolve({
        ok: false,
        status: 0,
        path: scenario.path,
        error: error.message,
        durationMs: performance.now() - started
      });
    });
    req.end();
  });
}

async function runVirtualUser(vu) {
  let iteration = 0;
  while (performance.now() < endAt) {
    const scenario = chooseScenario(vu, iteration);
    results.push(await sendRequest(scenario));
    iteration += 1;
  }
}

function summarize() {
  const finishedAt = new Date();
  const elapsedSeconds = (finishedAt.getTime() - startedAt.getTime()) / 1000;
  const durations = results.map(result => result.durationMs).sort((a, b) => a - b);
  const failures = results.filter(result => !result.ok);
  const byStatus = results.reduce((acc, result) => {
    const key = String(result.status);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const byPath = results.reduce((acc, result) => {
    acc[result.path] = acc[result.path] || { requests: 0, failures: 0 };
    acc[result.path].requests += 1;
    if (!result.ok) acc[result.path].failures += 1;
    return acc;
  }, {});

  const totalDuration = durations.reduce((sum, value) => sum + value, 0);
  const summary = {
    targetUrl: TARGET_URL,
    virtualUsers: VUS,
    durationSeconds: DURATION_SECONDS,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    requests: results.length,
    requestsPerSecond: Number((results.length / elapsedSeconds).toFixed(2)),
    failures: failures.length,
    failureRatePercent: Number(((failures.length / Math.max(results.length, 1)) * 100).toFixed(2)),
    responseTimeMs: {
      min: Number((durations[0] || 0).toFixed(2)),
      avg: Number((totalDuration / Math.max(durations.length, 1)).toFixed(2)),
      p90: Number(percentile(durations, 90).toFixed(2)),
      p95: Number(percentile(durations, 95).toFixed(2)),
      max: Number((durations[durations.length - 1] || 0).toFixed(2))
    },
    statusCodes: byStatus,
    endpoints: byPath,
    sampleFailures: failures.slice(0, 10)
  };

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, `baseline-${startedAt.toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(reportPath, `${JSON.stringify(summary, null, 2)}\n`);
  return { summary, reportPath };
}

async function main() {
  console.log(`Baseline load test: ${VUS} virtual users for ${DURATION_SECONDS}s`);
  console.log(`Target: ${TARGET_URL}`);
  await Promise.all(Array.from({ length: VUS }, (_, index) => runVirtualUser(index)));
  keepAliveAgent.destroy();
  const { summary, reportPath } = summarize();

  console.log('');
  console.log(`Requests per second: ${summary.requestsPerSecond} req/sec`);
  console.log(`Total requests: ${summary.requests}`);
  console.log(`Failures: ${summary.failures} (${summary.failureRatePercent}%)`);
  console.log(`Response time: avg ${summary.responseTimeMs.avg}ms, min ${summary.responseTimeMs.min}ms, max ${summary.responseTimeMs.max}ms`);
  console.log(`p90: ${summary.responseTimeMs.p90}ms, p95: ${summary.responseTimeMs.p95}ms`);
  console.log(`Report: ${reportPath}`);

  if (summary.failures > 0) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
