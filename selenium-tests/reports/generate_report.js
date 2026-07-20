/**
 * PawPal E2E Test Report Generator
 * Generates a beautiful multi-sheet Excel report using ExcelJS
 */

const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');

// ─── Colors & Styles ─────────────────────────────────────────────────────────
const COLORS = {
  PRIMARY: '6C63FF',
  PASS_BG: 'E8F5E9',
  PASS_FG: '1B5E20',
  FAIL_BG: 'FFEBEE',
  FAIL_FG: 'B71C1C',
  HEADER_BG: '1A237E',
  HEADER_FG: 'FFFFFF',
  SUBHEADER_BG: '3949AB',
  SUBHEADER_FG: 'FFFFFF',
  TITLE_BG: '6C63FF',
  TITLE_FG: 'FFFFFF',
  STRIPE_ODD: 'FAFAFE',
  STRIPE_EVEN: 'FFFFFF',
  BORDER: 'C5CAE9',
  SUMMARY_PASS: 'A5D6A7',
  SUMMARY_FAIL: 'EF9A9A',
  SUMMARY_TOTAL: 'CE93D8',
};

function hexColor(hex) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + hex } };
}

function border() {
  const side = { style: 'thin', color: { argb: 'FF' + COLORS.BORDER } };
  return { top: side, left: side, bottom: side, right: side };
}

function headerFont(size = 11) {
  return { name: 'Calibri', size, bold: true, color: { argb: 'FF' + COLORS.HEADER_FG } };
}

function cellFont(size = 10, bold = false, color = '212121') {
  return { name: 'Calibri', size, bold, color: { argb: 'FF' + color } };
}

// ─── Main Report Generator ────────────────────────────────────────────────────
async function generateReport(allResults, outputPath) {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'PawPal QA - Selenium Test Suite';
  workbook.lastModifiedBy = 'Automated Test Runner';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;

  const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const totalTests = allResults.length;
  const passCount = allResults.filter(r => r.status === 'PASS').length;
  const failCount = allResults.filter(r => r.status === 'FAIL').length;
  const passRate = totalTests > 0 ? ((passCount / totalTests) * 100).toFixed(1) : 0;
  const totalDuration = allResults.reduce((sum, r) => sum + (r.duration || 0), 0);

  // ─── Sheet 1: Executive Summary ───────────────────────────────────────────
  const summarySheet = workbook.addWorksheet('📊 Executive Summary', {
    properties: { tabColor: { argb: 'FF' + COLORS.PRIMARY } },
    pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true },
  });

  summarySheet.columns = [
    { key: 'a', width: 32 },
    { key: 'b', width: 24 },
    { key: 'c', width: 18 },
    { key: 'd', width: 18 },
    { key: 'e', width: 18 },
  ];

  // Title block
  summarySheet.mergeCells('A1:E1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = '🐾 PawPal Web App — End-to-End Test Report';
  titleCell.font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF' + COLORS.TITLE_FG } };
  titleCell.fill = hexColor(COLORS.TITLE_BG);
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.border = border();
  summarySheet.getRow(1).height = 40;

  summarySheet.mergeCells('A2:E2');
  const subTitle = summarySheet.getCell('A2');
  subTitle.value = `Generated: ${timestamp} | Tool: Selenium WebDriver + Node.js`;
  subTitle.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF6C63FF' } };
  subTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  subTitle.fill = hexColor('EDE7F6');
  summarySheet.getRow(2).height = 22;

  summarySheet.addRow([]);

  // KPI row headers
  const kpiHeaderRow = summarySheet.addRow(['Metric', 'Value', '', '', '']);
  kpiHeaderRow.getCell(1).font = headerFont();
  kpiHeaderRow.getCell(1).fill = hexColor(COLORS.SUBHEADER_BG);
  kpiHeaderRow.getCell(2).font = headerFont();
  kpiHeaderRow.getCell(2).fill = hexColor(COLORS.SUBHEADER_BG);
  kpiHeaderRow.height = 22;

  const kpiData = [
    ['Total Test Cases', totalTests],
    ['Tests Passed ✅', passCount],
    ['Tests Failed ❌', failCount],
    ['Pass Rate', `${passRate}%`],
    ['Total Duration', `${(totalDuration / 1000).toFixed(2)}s`],
    ['Report Date', timestamp],
    ['Application', 'PawPal — Complete Pet Care Platform'],
    ['Test Framework', 'Selenium WebDriver 4.x + Node.js'],
    ['Browser', 'Google Chrome'],
    ['Environment', 'Local Development (http://localhost:3000)'],
  ];

  kpiData.forEach((item, idx) => {
    const row = summarySheet.addRow([item[0], item[1], '', '', '']);
    const isEven = idx % 2 === 0;
    row.getCell(1).fill = hexColor(isEven ? COLORS.STRIPE_ODD : COLORS.STRIPE_EVEN);
    row.getCell(2).fill = hexColor(isEven ? COLORS.STRIPE_ODD : COLORS.STRIPE_EVEN);
    row.getCell(1).font = cellFont(10, true);
    row.getCell(2).font = cellFont(10, false);
    row.getCell(1).border = border();
    row.getCell(2).border = border();
    row.height = 20;

    // Colour KPI cells
    if (item[0].includes('Passed')) row.getCell(2).font = cellFont(10, true, COLORS.PASS_FG);
    if (item[0].includes('Failed')) row.getCell(2).font = cellFont(10, true, COLORS.FAIL_FG);
    if (item[0].includes('Pass Rate')) {
      const rate = parseFloat(passRate);
      row.getCell(2).font = cellFont(10, true, rate >= 80 ? COLORS.PASS_FG : COLORS.FAIL_FG);
    }
  });

  summarySheet.addRow([]);

  // Suite summary table
  const suiteHeader = summarySheet.addRow(['Test Suite', 'Total', 'Passed', 'Failed', 'Pass Rate']);
  suiteHeader.eachCell(cell => {
    cell.font = headerFont();
    cell.fill = hexColor(COLORS.HEADER_BG);
    cell.alignment = { horizontal: 'center' };
    cell.border = border();
  });
  suiteHeader.height = 20;

  // Group by suite
  const suiteMap = {};
  allResults.forEach(r => {
    if (!suiteMap[r.suite]) suiteMap[r.suite] = { total: 0, pass: 0, fail: 0 };
    suiteMap[r.suite].total++;
    r.status === 'PASS' ? suiteMap[r.suite].pass++ : suiteMap[r.suite].fail++;
  });

  Object.entries(suiteMap).forEach(([suite, data], idx) => {
    const rate = ((data.pass / data.total) * 100).toFixed(0) + '%';
    const row = summarySheet.addRow([suite, data.total, data.pass, data.fail, rate]);
    const isEven = idx % 2 === 0;
    row.getCell(1).fill = hexColor(isEven ? 'F3F0FF' : COLORS.STRIPE_EVEN);
    row.getCell(2).fill = hexColor(isEven ? 'F3F0FF' : COLORS.STRIPE_EVEN);
    row.getCell(3).fill = hexColor(COLORS.PASS_BG);
    row.getCell(4).fill = hexColor(data.fail > 0 ? COLORS.FAIL_BG : COLORS.PASS_BG);
    row.getCell(5).fill = hexColor(data.fail > 0 ? COLORS.FAIL_BG : COLORS.PASS_BG);
    row.getCell(3).font = cellFont(10, true, COLORS.PASS_FG);
    row.getCell(4).font = cellFont(10, true, data.fail > 0 ? COLORS.FAIL_FG : COLORS.PASS_FG);
    row.getCell(5).font = cellFont(10, true, data.fail > 0 ? COLORS.FAIL_FG : COLORS.PASS_FG);
    row.eachCell(cell => { cell.border = border(); cell.alignment = { horizontal: 'center' }; });
    row.getCell(1).alignment = { horizontal: 'left' };
    row.height = 20;
  });

  // Totals row
  const totalRow = summarySheet.addRow(['TOTAL', totalTests, passCount, failCount, `${passRate}%`]);
  totalRow.eachCell(cell => {
    cell.font = headerFont(11);
    cell.fill = hexColor(COLORS.HEADER_BG);
    cell.border = border();
    cell.alignment = { horizontal: 'center' };
  });
  totalRow.getCell(1).alignment = { horizontal: 'left' };
  totalRow.height = 22;

  // ─── Sheet 2: Detailed Test Results ─────────────────────────────────────────
  const detailSheet = workbook.addWorksheet('📋 Test Results', {
    properties: { tabColor: { argb: 'FF3949AB' } },
    views: [{ state: 'frozen', ySplit: 3 }],
  });

  detailSheet.columns = [
    { key: 'no', header: '#', width: 6 },
    { key: 'suite', header: 'Test Suite', width: 25 },
    { key: 'test', header: 'Test Name', width: 45 },
    { key: 'status', header: 'Status', width: 10 },
    { key: 'duration', header: 'Duration (ms)', width: 15 },
    { key: 'error', header: 'Error / Notes', width: 50 },
    { key: 'timestamp', header: 'Timestamp', width: 25 },
  ];

  // Sheet title
  detailSheet.mergeCells('A1:G1');
  const detailTitle = detailSheet.getCell('A1');
  detailTitle.value = '📋 Detailed Test Case Results — PawPal E2E Test Suite';
  detailTitle.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FF' + COLORS.TITLE_FG } };
  detailTitle.fill = hexColor(COLORS.SUBHEADER_BG);
  detailTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  detailSheet.getRow(1).height = 32;

  // Column headers
  const detailHeaders = ['#', 'Test Suite', 'Test Name / Description', 'Status', 'Duration (ms)', 'Error / Notes', 'Timestamp'];
  const headerRow = detailSheet.addRow(detailHeaders);
  headerRow.eachCell(cell => {
    cell.font = headerFont();
    cell.fill = hexColor(COLORS.HEADER_BG);
    cell.alignment = { horizontal: 'center', wrapText: true };
    cell.border = border();
  });
  headerRow.height = 22;

  // Data rows
  allResults.forEach((result, idx) => {
    const isPass = result.status === 'PASS';
    const row = detailSheet.addRow([
      idx + 1,
      result.suite,
      result.test,
      result.status,
      result.duration || 0,
      result.error || '—',
      result.timestamp || '',
    ]);

    const isEven = idx % 2 === 0;
    row.eachCell((cell, colNumber) => {
      cell.border = border();
      cell.font = cellFont(10);
      cell.alignment = { vertical: 'middle', wrapText: colNumber === 3 || colNumber === 6 };

      if (colNumber === 1) { // #
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = hexColor(isEven ? 'EDE7F6' : 'F3E5F5');
      } else if (colNumber === 4) { // Status
        cell.fill = hexColor(isPass ? COLORS.PASS_BG : COLORS.FAIL_BG);
        cell.font = cellFont(10, true, isPass ? COLORS.PASS_FG : COLORS.FAIL_FG);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 5) { // Duration
        cell.numFmt = '#,##0';
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.fill = hexColor(isEven ? COLORS.STRIPE_ODD : COLORS.STRIPE_EVEN);
      } else if (colNumber === 6) { // Error
        cell.fill = hexColor(isPass ? COLORS.PASS_BG : COLORS.FAIL_BG);
        cell.font = cellFont(9, false, isPass ? '4CAF50' : COLORS.FAIL_FG);
      } else {
        cell.fill = hexColor(isEven ? COLORS.STRIPE_ODD : COLORS.STRIPE_EVEN);
      }
    });
    row.height = 20;
  });

  // ─── Sheet 3: Failure Analysis ────────────────────────────────────────────
  const failSheet = workbook.addWorksheet('❌ Failure Analysis', {
    properties: { tabColor: { argb: 'FFB71C1C' } },
    views: [{ state: 'frozen', ySplit: 2 }],
  });

  failSheet.columns = [
    { key: 'no', width: 6 },
    { key: 'suite', width: 25 },
    { key: 'test', width: 40 },
    { key: 'error', width: 60 },
    { key: 'duration', width: 15 },
    { key: 'screenshot', width: 30 },
  ];

  failSheet.mergeCells('A1:F1');
  const failTitle = failSheet.getCell('A1');
  failTitle.value = '❌ Failure Analysis Report — Tests That Need Attention';
  failTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  failTitle.fill = hexColor('C62828');
  failTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  failSheet.getRow(1).height = 30;

  const failHeaders = ['#', 'Suite', 'Test Name', 'Error Description', 'Duration (ms)', 'Screenshot'];
  const failHeaderRow = failSheet.addRow(failHeaders);
  failHeaderRow.eachCell(cell => {
    cell.font = headerFont();
    cell.fill = hexColor('C62828');
    cell.border = border();
    cell.alignment = { horizontal: 'center' };
  });
  failHeaderRow.height = 20;

  const failures = allResults.filter(r => r.status === 'FAIL');
  if (failures.length === 0) {
    const noFailRow = failSheet.addRow(['', '', '🎉 All tests passed! No failures to report.', '', '', '']);
    failSheet.mergeCells(`C${noFailRow.number}:F${noFailRow.number}`);
    noFailRow.getCell(3).font = cellFont(12, true, COLORS.PASS_FG);
    noFailRow.getCell(3).fill = hexColor(COLORS.PASS_BG);
    noFailRow.height = 28;
  } else {
    failures.forEach((result, idx) => {
      const row = failSheet.addRow([
        idx + 1,
        result.suite,
        result.test,
        result.error || 'Unknown error',
        result.duration || 0,
        result.screenshot || '—',
      ]);
      const isEven = idx % 2 === 0;
      row.eachCell((cell, col) => {
        cell.border = border();
        cell.fill = hexColor(isEven ? 'FFEBEE' : 'FFF3F3');
        cell.font = cellFont(10);
        cell.alignment = { vertical: 'middle', wrapText: true };
        if (col === 4) cell.font = cellFont(9, false, COLORS.FAIL_FG);
        if (col === 5) { cell.numFmt = '#,##0'; cell.alignment = { horizontal: 'right' }; }
      });
      row.height = 22;
    });
  }

  // ─── Sheet 4: Pass Analysis ───────────────────────────────────────────────
  const passSheet = workbook.addWorksheet('✅ Passed Tests', {
    properties: { tabColor: { argb: 'FF1B5E20' } },
    views: [{ state: 'frozen', ySplit: 2 }],
  });

  passSheet.columns = [
    { key: 'no', width: 6 },
    { key: 'suite', width: 25 },
    { key: 'test', width: 50 },
    { key: 'duration', width: 15 },
    { key: 'timestamp', width: 25 },
  ];

  passSheet.mergeCells('A1:E1');
  const passTitle = passSheet.getCell('A1');
  passTitle.value = '✅ All Passed Tests — PawPal E2E Quality Assurance';
  passTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  passTitle.fill = hexColor('1B5E20');
  passTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  passSheet.getRow(1).height = 30;

  const passHeaders = ['#', 'Suite', 'Test Name', 'Duration (ms)', 'Executed At'];
  const passHeaderRow = passSheet.addRow(passHeaders);
  passHeaderRow.eachCell(cell => {
    cell.font = headerFont();
    cell.fill = hexColor('2E7D32');
    cell.border = border();
    cell.alignment = { horizontal: 'center' };
  });
  passHeaderRow.height = 20;

  const passes = allResults.filter(r => r.status === 'PASS');
  passes.forEach((result, idx) => {
    const row = passSheet.addRow([
      idx + 1,
      result.suite,
      result.test,
      result.duration || 0,
      result.timestamp || '',
    ]);
    const isEven = idx % 2 === 0;
    row.eachCell((cell, col) => {
      cell.border = border();
      cell.fill = hexColor(isEven ? COLORS.PASS_BG : 'F1F8E9');
      cell.font = cellFont(10);
      cell.alignment = { vertical: 'middle' };
      if (col === 4) { cell.numFmt = '#,##0'; cell.alignment = { horizontal: 'right' }; }
    });
    row.height = 19;
  });

  // ─── Sheet 5: Suite Metrics ───────────────────────────────────────────────
  const metricsSheet = workbook.addWorksheet('📈 Suite Metrics', {
    properties: { tabColor: { argb: 'FF0288D1' } },
  });

  metricsSheet.columns = [
    { key: 'suite', width: 28 },
    { key: 'total', width: 12 },
    { key: 'pass', width: 12 },
    { key: 'fail', width: 12 },
    { key: 'rate', width: 12 },
    { key: 'avgDuration', width: 18 },
    { key: 'maxDuration', width: 18 },
    { key: 'health', width: 16 },
  ];

  metricsSheet.mergeCells('A1:H1');
  const metricsTitle = metricsSheet.getCell('A1');
  metricsTitle.value = '📈 Suite Performance Metrics — Detailed Analysis';
  metricsTitle.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  metricsTitle.fill = hexColor('0277BD');
  metricsTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  metricsSheet.getRow(1).height = 30;

  const mHeaders = ['Test Suite', 'Total', '✅ Passed', '❌ Failed', 'Pass Rate', 'Avg Duration (ms)', 'Max Duration (ms)', 'Health Status'];
  const mHeaderRow = metricsSheet.addRow(mHeaders);
  mHeaderRow.eachCell(cell => {
    cell.font = headerFont();
    cell.fill = hexColor('01579B');
    cell.border = border();
    cell.alignment = { horizontal: 'center', wrapText: true };
  });
  mHeaderRow.height = 22;

  Object.entries(suiteMap).forEach(([suite, data], idx) => {
    const suiteResults = allResults.filter(r => r.suite === suite);
    const durations = suiteResults.map(r => r.duration || 0);
    const avgDur = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b) / durations.length) : 0;
    const maxDur = durations.length > 0 ? Math.max(...durations) : 0;
    const rate = (data.pass / data.total) * 100;
    const health = rate === 100 ? '🟢 Healthy' : rate >= 80 ? '🟡 Warning' : '🔴 Critical';

    const row = metricsSheet.addRow([suite, data.total, data.pass, data.fail, `${rate.toFixed(0)}%`, avgDur, maxDur, health]);
    const isEven = idx % 2 === 0;

    row.eachCell((cell, col) => {
      cell.border = border();
      cell.fill = hexColor(isEven ? 'E3F2FD' : COLORS.STRIPE_EVEN);
      cell.font = cellFont(10);
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (col === 1) cell.alignment = { horizontal: 'left' };
      if (col === 3) { cell.fill = hexColor(COLORS.PASS_BG); cell.font = cellFont(10, true, COLORS.PASS_FG); }
      if (col === 4) { cell.fill = hexColor(data.fail > 0 ? COLORS.FAIL_BG : COLORS.PASS_BG); cell.font = cellFont(10, true, data.fail > 0 ? COLORS.FAIL_FG : COLORS.PASS_FG); }
      if (col === 5) { cell.font = cellFont(10, true, rate >= 80 ? COLORS.PASS_FG : COLORS.FAIL_FG); }
      if (col === 6 || col === 7) { cell.numFmt = '#,##0'; cell.alignment = { horizontal: 'right' }; }
    });
    row.height = 20;
  });

  // ─── Save workbook ────────────────────────────────────────────────────────
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  await workbook.xlsx.writeFile(outputPath);
  console.log(`\n📊 Excel report saved: ${outputPath}`);
  return outputPath;
}

// Standalone: load results from JSON and generate
if (require.main === module) {
  const jsonPath = path.join(__dirname, 'test_results.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ No test_results.json found. Run the test suite first.');
    process.exit(1);
  }
  const results = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const outputPath = path.join(__dirname, `PawPal_E2E_Report_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);
  generateReport(results, outputPath)
    .then(() => console.log('✅ Report generation complete'))
    .catch(console.error);
}

module.exports = { generateReport };
