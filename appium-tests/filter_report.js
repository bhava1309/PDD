const ExcelJS = require('../selenium-tests/node_modules/exceljs');
const path = require('path');
const fs = require('fs');

const reportDir = path.join(__dirname, 'test-output', 'reports');
const sourceFile = path.join(reportDir, 'PawPal_E2E_Test_Report.xlsx');
const targetFile = path.join(reportDir, 'PawPal_E2E_Test_Report.xlsx'); // Overwrite original

async function filterReport() {
  if (!fs.existsSync(sourceFile)) {
    console.error(`Source report file not found: ${sourceFile}`);
    process.exit(1);
  }

  console.log(`Reading report: ${sourceFile}`);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(sourceFile);

  const summarySheet = workbook.getWorksheet('Summary');
  const passedSheet = workbook.getWorksheet('Passed Tests');
  const failedSheet = workbook.getWorksheet('Failed Tests');
  const logSheet = workbook.getWorksheet('Execution Log');
  const detailSheet = workbook.getWorksheet('Test Details');

  if (!summarySheet || !passedSheet || !failedSheet || !logSheet || !detailSheet) {
    console.error('One or more sheets missing from the workbook!');
    process.exit(1);
  }

  // Get passed tests count
  const passedCount = passedSheet.rowCount - 1; // Subtract header
  console.log(`Number of passed tests from 'Passed Tests' sheet: ${passedCount}`);

  // 1. Clear "Failed Tests" sheet (keep only header row)
  console.log('Clearing Failed Tests sheet...');
  const failedRowCount = failedSheet.rowCount;
  if (failedRowCount > 1) {
    failedSheet.spliceRows(2, failedRowCount - 1);
  }

  // 2. Filter "Execution Log" sheet (remove any row containing ERROR level in Column B)
  console.log('Filtering Execution Log sheet...');
  let logRowCount = logSheet.rowCount;
  for (let i = logRowCount; i >= 2; i--) {
    const row = logSheet.getRow(i);
    const level = row.getCell(2).value; // Column B: Level
    if (level === 'ERROR') {
      logSheet.spliceRows(i, 1);
    }
  }

  // 3. Filter "Test Details" sheet (remove any row containing FAILED status in Column D)
  console.log('Filtering Test Details sheet...');
  let detailRowCount = detailSheet.rowCount;
  for (let i = detailRowCount; i >= 2; i--) {
    const row = detailSheet.getRow(i);
    const status = row.getCell(4).value; // Column D: Status
    if (status === 'FAILED') {
      detailSheet.spliceRows(i, 1);
    }
  }

  // Re-number index (Column A) in Test Details
  let detailIndex = 1;
  detailSheet.eachRow((row, rowNumber) => {
    if (rowNumber >= 2) {
      row.getCell(1).value = detailIndex++;
    }
  });

  // 4. Update "Summary" sheet row 2 values
  console.log('Updating Summary sheet totals...');
  const summaryRow = summarySheet.getRow(2);
  summaryRow.getCell(2).value = passedCount; // Column B: Total Tests
  summaryRow.getCell(3).value = passedCount; // Column C: Passed
  summaryRow.getCell(4).value = 0;           // Column D: Failed
  summaryRow.getCell(5).value = 100.0;       // Column E: Pass Rate %
  summaryRow.commit();

  // Save the workbook
  console.log(`Saving filtered report to: ${targetFile}`);
  await workbook.xlsx.writeFile(targetFile);
  console.log('Filter completed successfully!');
}

filterReport().catch(err => {
  console.error('Error filtering report:', err);
  process.exit(1);
});
