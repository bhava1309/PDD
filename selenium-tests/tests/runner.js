/**
 * PawPal Selenium E2E Test Runner
 * Orchestrates all test suites, collects results, and generates Excel report
 */

const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');
const { generateReport } = require('../reports/generate_report');

// Import all test suites
const suites = [
  require('./01_home_page.test'),
  require('./02_login_page.test'),
  require('./03_pet_onboarding.test'),
  require('./04_dashboard.test'),
  require('./05_health_tracker.test'),
  require('./06_activity_log.test'),
  require('./07_community.test'),
  require('./08_adoption.test'),
  require('./09_travel.test'),
  require('./10_doctors.test'),
  require('./11_doctor_login.test'),
  require('./12_chat.test'),
];

const REPORT_DIR = path.join(__dirname, '..', 'reports');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

// ─── Utilities ─────────────────────────────────────────────────────────────────
function ensureDirs() {
  [REPORT_DIR, SCREENSHOTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

function printBanner() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          🐾  PawPal E2E Selenium Test Suite  🐾              ║');
  console.log('║          Complete Web Application Quality Assurance           ║');
  console.log('║          12 Suites  |  150 Test Cases  |  Full Coverage       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`\n  ⏱  Started: ${new Date().toLocaleString()}`);
  console.log(`  🌐 Target:  http://localhost:3000`);
  console.log(`  🖥️  Suites:  ${suites.length} test suites`);
  console.log('');
}

function printSummary(allResults, duration) {
  const total = allResults.length;
  const passed = allResults.filter(r => r.status === 'PASS').length;
  const failed = allResults.filter(r => r.status === 'FAIL').length;
  const rate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    📊 TEST RUN SUMMARY                       ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Tests   : ${String(total).padEnd(42)} ║`);
  console.log(`║  ✅ Passed     : ${String(passed).padEnd(42)} ║`);
  console.log(`║  ❌ Failed     : ${String(failed).padEnd(42)} ║`);
  console.log(`║  📈 Pass Rate  : ${String(rate + '%').padEnd(42)} ║`);
  console.log(`║  ⏱  Duration   : ${String((duration / 1000).toFixed(2) + 's').padEnd(42)} ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    allResults.filter(r => r.status === 'FAIL').forEach((r, i) => {
      console.log(`  ${i + 1}. [${r.suite}] ${r.test}`);
      if (r.error) console.log(`     → ${r.error}`);
    });
  }
  console.log('');
}

function startLocalServer() {
  console.log('🌐 Starting local HTTP server on port 3000...');
  try {
    // Check if server is already running
    const http = require('http');
    return new Promise((resolve) => {
      const req = http.get('http://localhost:3000', (res) => {
        console.log('  ✅ Server already running on port 3000');
        resolve(null);
      });
      req.on('error', () => {
        // Start server
        const server = spawn('npx', ['http-server', path.join(__dirname, '../..'), '-p', '3000', '--silent', '--cors'], {
          detached: true,
          stdio: 'ignore',
        });
        server.unref();
        console.log('  ✅ Local server started (PID: ' + server.pid + ')');
        setTimeout(() => resolve(server), 2000);
      });
      req.setTimeout(2000, () => {
        req.destroy();
      });
    });
  } catch (e) {
    console.warn('  ⚠️  Could not start server automatically. Please start it manually with: npx http-server ../ -p 3000');
    return Promise.resolve(null);
  }
}

// ─── Main Runner ───────────────────────────────────────────────────────────────
async function runAllSuites() {
  ensureDirs();
  printBanner();

  const serverProcess = await startLocalServer();
  await new Promise(r => setTimeout(r, 1500));

  const allResults = [];
  const startTime = Date.now();

  const selectedSuites = process.argv.slice(2);
  const suitesToRun = selectedSuites.length > 0
    ? suites.filter(s => selectedSuites.some(arg => s.SUITE.toLowerCase().includes(arg.toLowerCase())))
    : suites;

  console.log(`\n🚀 Running ${suitesToRun.length} test suite(s)...\n`);

  for (const suite of suitesToRun) {
    try {
      const results = await suite.runSuite();
      allResults.push(...results);
    } catch (err) {
      console.error(`\n💥 Suite "${suite.SUITE}" crashed: ${err.message}`);
      allResults.push({
        suite: suite.SUITE,
        test: 'Suite Initialization',
        status: 'FAIL',
        duration: 0,
        error: `Suite crashed: ${err.message}`,
        screenshot: '',
        timestamp: new Date().toISOString(),
      });
    }

    // Cooldown between suites — gives OS time to free Chrome memory/processes
    await new Promise(r => setTimeout(r, 3000));
  }

  const totalDuration = Date.now() - startTime;
  printSummary(allResults, totalDuration);

  // Save raw results JSON
  const jsonPath = path.join(REPORT_DIR, 'test_results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(allResults, null, 2));
  console.log(`\n💾 Raw results saved: ${jsonPath}`);

  // Generate Excel report
  const dayjs = require('dayjs');
  const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
  const xlsxPath = path.join(REPORT_DIR, `PawPal_E2E_Report_${timestamp}.xlsx`);

  try {
    await generateReport(allResults, xlsxPath);
    console.log(`\n📊 Excel Report: ${xlsxPath}`);
    console.log('\n🎉 Test run complete! Open the Excel report for full analysis.\n');

    // Auto-open on macOS
    if (process.platform === 'darwin') {
      execSync(`open "${xlsxPath}"`, { stdio: 'ignore' });
    }
  } catch (reportErr) {
    console.error('⚠️  Could not generate Excel report:', reportErr.message);
  }

  return allResults;
}

runAllSuites().catch(err => {
  console.error('\n💥 Fatal runner error:', err);
  process.exit(1);
});
