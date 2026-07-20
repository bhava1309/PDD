const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function generateExcelReport(results, outputPath) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PawPal Selenium E2E';
  workbook.created = new Date();

  const summary = workbook.addWorksheet('Summary');
  const detail = workbook.addWorksheet('Test Results');
  const suites = workbook.addWorksheet('Suite Analysis');

  const total = results.length;
  const passed = results.filter(item => item.status === 'PASS').length;
  const failed = total - passed;
  const passRate = total ? passed / total : 0;

  summary.columns = [
    { header: 'Metric', key: 'metric', width: 32 },
    { header: 'Value', key: 'value', width: 28 }
  ];
  summary.addRows([
    { metric: 'Application', value: 'PawPal Web Application' },
    { metric: 'Framework', value: 'Selenium WebDriver + Node.js' },
    { metric: 'Total Test Cases', value: total },
    { metric: 'Passed', value: passed },
    { metric: 'Failed', value: failed },
    { metric: 'Pass Rate', value: passRate },
    { metric: 'Generated At', value: new Date().toISOString() }
  ]);
  summary.getCell('B6').numFmt = '0.0%';

  detail.columns = [
    { header: '#', key: 'id', width: 8 },
    { header: 'Suite', key: 'suite', width: 24 },
    { header: 'Test Case', key: 'test', width: 70 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Duration Ms', key: 'durationMs', width: 14 },
    { header: 'Notes', key: 'notes', width: 70 },
    { header: 'Timestamp', key: 'timestamp', width: 26 }
  ];
  results.forEach((item, index) => detail.addRow({ id: index + 1, ...item }));

  const suiteMap = new Map();
  results.forEach(item => {
    const current = suiteMap.get(item.suite) || { suite: item.suite, total: 0, passed: 0, failed: 0, duration: 0 };
    current.total += 1;
    current.duration += item.durationMs || 0;
    if (item.status === 'PASS') current.passed += 1;
    else current.failed += 1;
    suiteMap.set(item.suite, current);
  });
  suites.columns = [
    { header: 'Suite', key: 'suite', width: 28 },
    { header: 'Total', key: 'total', width: 10 },
    { header: 'Passed', key: 'passed', width: 10 },
    { header: 'Failed', key: 'failed', width: 10 },
    { header: 'Pass Rate', key: 'passRate', width: 14 },
    { header: 'Duration Ms', key: 'duration', width: 14 }
  ];
  [...suiteMap.values()].forEach(item => suites.addRow({ ...item, passRate: item.total ? item.passed / item.total : 0 }));

  [summary, detail, suites].forEach(sheet => {
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6C63FF' } };
    sheet.getRow(1).alignment = { horizontal: 'center' };
    sheet.eachRow(row => row.eachCell(cell => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE9ECEF' } },
        left: { style: 'thin', color: { argb: 'FFE9ECEF' } },
        bottom: { style: 'thin', color: { argb: 'FFE9ECEF' } },
        right: { style: 'thin', color: { argb: 'FFE9ECEF' } }
      };
      cell.alignment = { vertical: 'middle', wrapText: true };
    }));
  });

  detail.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const status = row.getCell(4).value;
    row.getCell(4).font = { bold: true, color: { argb: status === 'PASS' ? 'FF1B5E20' : 'FFB71C1C' } };
    row.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: status === 'PASS' ? 'FFE8F5E9' : 'FFFFEBEE' } };
  });
  suites.getColumn(5).numFmt = '0.0%';

  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
  await workbook.xlsx.writeFile(outputPath);
  return outputPath;
}

if (require.main === module) {
  const resultsPath = path.join(__dirname, 'test-results.json');
  const outputPath = path.join(__dirname, 'PawPal_E2E_Excel_Analysis.xlsx');
  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  generateExcelReport(results, outputPath).then(file => console.log(file));
}

module.exports = { generateExcelReport };
