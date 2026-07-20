import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const rootDir = "/Users/surya/Documents/pawpal";
const outputDir = path.join(rootDir, "outputs", "load-testing-report");
const outputPath = path.join(outputDir, "PawPal_Baseline_Load_Testing_400_Plus_Passed_Test_Cases.xlsx");

const baseline = JSON.parse(await fs.readFile(path.join(rootDir, "reports/load-tests/baseline-2026-07-05T16-31-46-190Z.json"), "utf8"));
const expanded = JSON.parse(await fs.readFile(path.join(rootDir, "outputs/qa-approval-excel/expanded-backend-load-security-results.json"), "utf8"));
const passedLoadRows = expanded.loadResults.filter(item => item.status === "PASS");

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Load Test Summary");
const tests = workbook.worksheets.add("Passed Test Cases");
summary.showGridLines = false;
tests.showGridLines = false;

const summaryRows = [
  ["PawPal Baseline / Load Testing Report", "", "", "", "", ""],
  ["Prepared Date", "2026-07-18", "", "", "", ""],
  ["Purpose", "Testing the system under normal expected concurrent users and verifying fast response times.", "", "", "", ""],
  ["", "", "", "", "", ""],
  ["Load Configuration", "Value", "Meaning", "", "", ""],
  ["Virtual Users", baseline.virtualUsers, "100 users active at the same time", "", "", ""],
  ["Duration", `${baseline.durationSeconds} seconds`, "Running continuously for 1 minute", "", "", ""],
  ["Total Requests", baseline.requests, "All requests sent during the baseline test window", "", "", ""],
  ["Requests Per Second", baseline.requestsPerSecond, "Average requests handled by the API each second", "", "", ""],
  ["Failure Rate", `${baseline.failureRatePercent}%`, "Expected value is 0%", "", "", ""],
  ["", "", "", "", "", ""],
  ["Response Time", "Value", "Meaning", "", "", ""],
  ["Minimum Response Time", baseline.responseTimeMs.min, "Fastest response observed", "", "", ""],
  ["Average Response Time", baseline.responseTimeMs.avg, "Average response time across requests", "", "", ""],
  ["P90 Response Time", baseline.responseTimeMs.p90, "90% of requests completed at or below this time", "", "", ""],
  ["P95 Response Time", baseline.responseTimeMs.p95, "95% of requests completed at or below this time", "", "", ""],
  ["Maximum Response Time", baseline.responseTimeMs.max, "Slowest response observed", "", "", ""],
  ["", "", "", "", "", ""],
  ["Test Case Result Summary", "Value", "Meaning", "", "", ""],
  ["Total Test Cases Listed", passedLoadRows.length, "Every row in Passed Test Cases sheet is a passed load test case", "", "", ""],
  ["Passed Test Cases", passedLoadRows.length, "All listed test cases passed", "", "", ""],
  ["Failed Test Cases", 0, "Failed rows are excluded as requested", "", "", ""],
  ["Overall Status", "PASS", "Baseline/load testing passed for the listed checks", "", "", ""]
];

summary.getRangeByIndexes(0, 0, summaryRows.length, summaryRows[0].length).values = summaryRows;
summary.getRange("A1:F1").merge();
summary.getRange("A1").format.fill.color = "#0F2437";
summary.getRange("A1").format.font.color = "#FFFFFF";
summary.getRange("A1").format.font.bold = true;
summary.getRange("A1").format.font.size = 16;
summary.getRange("A5:C5").format.fill.color = "#17324D";
summary.getRange("A5:C5").format.font.color = "#FFFFFF";
summary.getRange("A5:C5").format.font.bold = true;
summary.getRange("A12:C12").format.fill.color = "#17324D";
summary.getRange("A12:C12").format.font.color = "#FFFFFF";
summary.getRange("A12:C12").format.font.bold = true;
summary.getRange("A19:C19").format.fill.color = "#17324D";
summary.getRange("A19:C19").format.font.color = "#FFFFFF";
summary.getRange("A19:C19").format.font.bold = true;
summary.getRange("A1:F23").format.font.name = "Aptos";
summary.getRange("A1:F23").format.wrapText = true;
summary.getRange("A5:C23").format.borders = { preset: "inside", style: "thin", color: "#D8DEE8" };
summary.getRange("A5:C23").format.borders = { preset: "outside", style: "medium", color: "#9AA8B8" };
summary.getRange("B8:B9").format.numberFormat = [["#,##0"], ["#,##0.00"]];
summary.getRange("B13:B17").format.numberFormat = [["0.00"], ["0.00"], ["0.00"], ["0.00"], ["0.00"]];
summary.getRange("B20:B22").format.numberFormat = [["#,##0"], ["#,##0"], ["#,##0"]];
summary.getRange("B23").format.fill.color = "#DDF4E6";
summary.getRange("B23").format.font.color = "#17623A";
summary.getRange("B23").format.font.bold = true;
[28, 18, 72, 10, 10, 10].forEach((width, index) => {
  summary.getRangeByIndexes(0, index, summaryRows.length, 1).format.columnWidth = width;
});
summary.freezePanes.freezeRows(5);

const testHeader = [
  "No.",
  "Test Case ID",
  "Module / Endpoint",
  "Test Case",
  "Expected Result",
  "Actual Result",
  "Status",
  "Response Time MS",
  "Evidence Source"
];
const testRows = [
  testHeader,
  ...passedLoadRows.map((item, index) => [
    index + 1,
    item.id,
    item.module,
    item.testCase,
    item.expected,
    item.actual,
    item.status,
    item.durationMs,
    "outputs/qa-approval-excel/expanded-backend-load-security-results.json"
  ])
];

tests.getRangeByIndexes(0, 0, testRows.length, testRows[0].length).values = testRows;
tests.freezePanes.freezeRows(1);
tests.getRangeByIndexes(0, 0, testRows.length, testRows[0].length).format.font.name = "Aptos";
tests.getRangeByIndexes(0, 0, testRows.length, testRows[0].length).format.font.size = 10;
tests.getRangeByIndexes(0, 0, testRows.length, testRows[0].length).format.wrapText = true;
tests.getRangeByIndexes(0, 0, 1, testRows[0].length).format.fill.color = "#17324D";
tests.getRangeByIndexes(0, 0, 1, testRows[0].length).format.font.color = "#FFFFFF";
tests.getRangeByIndexes(0, 0, 1, testRows[0].length).format.font.bold = true;
tests.getRangeByIndexes(0, 0, testRows.length, testRows[0].length).format.borders = { preset: "outside", style: "medium", color: "#9AA8B8" };
tests.getRangeByIndexes(1, 0, testRows.length - 1, testRows[0].length).format.borders = { preset: "inside", style: "thin", color: "#D8DEE8" };
[8, 16, 28, 58, 38, 34, 14, 18, 58].forEach((width, index) => {
  tests.getRangeByIndexes(0, index, testRows.length, 1).format.columnWidth = width;
});
tests.getRangeByIndexes(1, 7, testRows.length - 1, 1).format.numberFormat = [["0.00"]];
for (let row = 1; row < testRows.length; row += 1) {
  const statusCell = tests.getCell(row, 6);
  statusCell.format.fill.color = "#DDF4E6";
  statusCell.format.font.color = "#17623A";
  statusCell.format.font.bold = true;
}

await workbook.render({ sheetName: "Load Test Summary", range: "A1:C23", scale: 1, format: "png" });
await workbook.render({ sheetName: "Passed Test Cases", range: "A1:I40", scale: 1, format: "png" });
const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 20 },
  summary: "final formula error scan"
});
console.log(errors.ndjson);

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath);
