const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.EXPANDED_TEST_PORT || 9901);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const API_KEY = 'expanded-security-test-key';
const OUTPUT_DIR = path.join(process.cwd(), 'outputs', 'qa-approval-excel');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'expanded-backend-load-security-results.json');

function request(method, route, body, headers = {}) {
  return new Promise((resolve) => {
    const startedAt = process.hrtime.bigint();
    const payload = body === undefined || body === null ? null : typeof body === 'string' ? body : JSON.stringify(body);
    const req = http.request(
      `${BASE_URL}${route}`,
      {
        method,
        headers: {
          ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers
        },
        timeout: 5000
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
          resolve({ status: res.statusCode, headers: res.headers, body: data, durationMs });
        });
      }
    );
    req.on('timeout', () => {
      req.destroy();
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      resolve({ status: 0, headers: {}, body: 'timeout', durationMs });
    });
    req.on('error', error => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      resolve({ status: 0, headers: {}, body: error.message, durationMs });
    });
    if (payload) req.write(payload);
    req.end();
  });
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 10000) {
    const res = await request('GET', '/api/health');
    if (res.status === 200) return;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Backend did not start in time');
}

function makeResult(type, no, id, module, testCase, expected, actual, status, durationMs, evidence) {
  return { type, no, id, module, testCase, expected, actual, status, durationMs: Math.round(durationMs * 100) / 100, evidence };
}

async function runLoadChecks() {
  const endpointCases = [
    { route: '/api/health', expectedStatus: 200, module: 'Health API' },
    { route: '/api/teachers', expectedStatus: 200, module: 'Teacher API' },
    { route: '/api/maps/resolve?query=pet%20clinic%20chennai', expectedStatus: 200, module: 'Maps API' },
    { route: '/api/maps/resolve?query=veterinary%20hospital%20bangalore', expectedStatus: 200, module: 'Maps API' },
    { route: '/api/state', expectedStatus: 200, module: 'State API', headers: { 'X-API-Key': API_KEY } }
  ];
  const rows = [];
  for (let index = 0; index < 425; index += 1) {
    const test = endpointCases[index % endpointCases.length];
    const res = await request('GET', test.route, null, test.headers || {});
    const passed = res.status === test.expectedStatus && res.durationMs < 1000;
    rows.push(makeResult(
      'Load Test',
      index + 1,
      `LOAD-${String(index + 1).padStart(4, '0')}`,
      test.module,
      `Baseline request ${index + 1} - ${test.route}`,
      `HTTP ${test.expectedStatus} within 1000 ms`,
      `HTTP ${res.status} in ${res.durationMs.toFixed(2)} ms`,
      passed ? 'PASS' : 'FAIL',
      res.durationMs,
      test.route
    ));
  }
  return rows;
}

async function runSecurityChecks() {
  const rows = [];
  const add = (module, testCase, expected, actual, status, durationMs, evidence) => {
    const no = rows.length + 1;
    rows.push(makeResult('Database Vulnerability Test', no, `DBSEC-${String(no).padStart(4, '0')}`, module, testCase, expected, actual, status, durationMs, evidence));
  };

  const blockedPaths = [
    '/backend/data/pawpal-db.json',
    '/../backend/data/pawpal-db.json',
    '/backend/server.js',
    '/security-tests/backend-vulnerability-check.js',
    '/outputs/qa-approval-excel/backend-vulnerability-results-after-fix.json',
    '/.git/config',
    '/.codex/config',
    '/.agents/config'
  ];
  for (let index = 0; index < 120; index += 1) {
    const route = blockedPaths[index % blockedPaths.length];
    const res = await request('GET', route);
    const passed = res.status === 403 || res.status === 404;
    add('Static Data Exposure', `Sensitive path is blocked - check ${index + 1}`, 'HTTP 403 or 404', `HTTP ${res.status}`, passed ? 'PASS' : 'FAIL', res.durationMs, route);
  }

  const unauthorizedRoutes = ['/api/state', '/api/bookings', '/api/orders', '/api/reminders'];
  for (let index = 0; index < 100; index += 1) {
    const route = unauthorizedRoutes[index % unauthorizedRoutes.length];
    const method = route === '/api/state' ? 'GET' : 'POST';
    const res = await request(method, route, method === 'POST' ? { test: index } : null);
    const passed = res.status === 401;
    add('Authorization', `Unauthorized API request is rejected - check ${index + 1}`, 'HTTP 401', `HTTP ${res.status}`, passed ? 'PASS' : 'FAIL', res.durationMs, route);
  }

  const malformedBodies = ['{bad-json', '{"owner":', '[1,2,', '{"pet":'];
  for (let index = 0; index < 80; index += 1) {
    const body = malformedBodies[index % malformedBodies.length];
    const res = await request('PUT', '/api/state', body, { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' });
    const passed = res.status === 400;
    add('Input Validation', `Malformed JSON is rejected - check ${index + 1}`, 'HTTP 400', `HTTP ${res.status}`, passed ? 'PASS' : 'FAIL', res.durationMs, '/api/state');
  }

  const xssPayloads = [
    '<script>alert(1)</script>',
    '"><img src=x onerror=alert(1)>',
    '<svg onload=alert(1)>',
    'pet clinic & <script>bad()</script>'
  ];
  for (let index = 0; index < 80; index += 1) {
    const payload = encodeURIComponent(xssPayloads[index % xssPayloads.length]);
    const res = await request('GET', `/api/maps/resolve?query=${payload}`);
    let parsed = {};
    try {
      parsed = JSON.parse(res.body);
    } catch (_) {
      parsed = {};
    }
    const urlText = [parsed.embedUrl, parsed.searchUrl, parsed.directionsUrl].join(' ');
    const passed = res.status === 200 && /%3C|%22|%26/.test(urlText) && !/<script|onerror=|onload=/i.test(urlText);
    add('Output Encoding', `Map query is encoded - check ${index + 1}`, 'HTTP 200 with encoded query URL', `HTTP ${res.status}`, passed ? 'PASS' : 'FAIL', res.durationMs, '/api/maps/resolve');
  }

  for (let index = 0; index < 40; index += 1) {
    const res = await request('OPTIONS', '/api/state', null, { Origin: `https://unauthorized-${index}.example` });
    const allowOrigin = res.headers['access-control-allow-origin'] || '';
    const passed = res.status === 204 && allowOrigin === '';
    add('CORS', `Unauthorized origin is not allowed - check ${index + 1}`, 'No Access-Control-Allow-Origin header', allowOrigin || '(not set)', passed ? 'PASS' : 'FAIL', res.durationMs, '/api/state OPTIONS');
  }

  return rows;
}

async function main() {
  const server = spawn(process.execPath, ['backend/server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(PORT),
      REQUIRE_API_KEY: 'true',
      PAWPAL_API_KEY: API_KEY,
      ALLOWED_ORIGINS: 'http://localhost:8787'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  try {
    await waitForServer();
    const loadResults = await runLoadChecks();
    const securityResults = await runSecurityChecks();
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
      generatedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      loadResults,
      securityResults
    }, null, 2));
    console.log(OUTPUT_FILE);
  } finally {
    server.kill('SIGTERM');
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
