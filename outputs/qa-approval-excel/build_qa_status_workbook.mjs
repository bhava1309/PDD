import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const rootDir = "/Users/surya/Documents/pawpal";
const outputDir = path.join(rootDir, "outputs", "qa-approval-excel");
const outputPath = path.join(outputDir, "PawPal_QA_Test_Status_Line_By_Line.xlsx");

const readText = async (relativePath) => fs.readFile(path.join(rootDir, relativePath), "utf8");
const decodeXml = (value = "") =>
  String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

function getAttr(tag, name) {
  const match = tag.match(new RegExp(`${name}="([^"]*)"`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function getCdata(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`, "i"));
  return match ? decodeXml(match[1].trim()) : "";
}

function firstLine(text) {
  return String(text || "").split("\n")[0].trim();
}

function buildAppiumRows(xml) {
  const rows = [];
  const classBlocks = [...xml.matchAll(/<class name="([^"]+)">([\s\S]*?)<\/class>/g)];
  for (const classMatch of classBlocks) {
    const className = classMatch[1].split(".").pop();
    const classBody = classMatch[2];
    const methodBlocks = [...classBody.matchAll(/<test-method\b([^>]*)>([\s\S]*?)<\/test-method>/g)];
    for (const methodMatch of methodBlocks) {
      const tag = methodMatch[1];
      if (getAttr(tag, "is-config") === "true") continue;
      const body = methodMatch[2];
      const status = getAttr(tag, "status") || "UNKNOWN";
      const durationMs = Number(getAttr(tag, "duration-ms") || 0);
      rows.push([
        rows.length + 1,
        "Mobile Appium",
        className,
        getAttr(tag, "name"),
        getAttr(tag, "description"),
        status,
        durationMs,
        firstLine(getCdata(body, "message")),
        "appium-tests/target/surefire-reports/testng-results.xml"
      ]);
    }
  }
  return rows;
}

function statusDecision(status) {
  if (status === "PASS" || status === "Passed") return "Approved";
  if (status === "FAIL" || status === "Failed") return "Fix and re-test";
  if (status === "PENDING") return "Pending evidence";
  return "Review required";
}

function addSheet(workbook, name, rows, widths = []) {
  const sheet = workbook.worksheets.add(name);
  sheet.showGridLines = false;
  sheet.getRangeByIndexes(0, 0, rows.length, rows[0].length).values = rows;
  sheet.freezePanes.freezeRows(1);

  const used = sheet.getRangeByIndexes(0, 0, rows.length, rows[0].length);
  used.format.font.name = "Aptos";
  used.format.font.size = 10;
  used.format.wrapText = true;
  used.format.verticalAlignment = "Top";

  const header = sheet.getRangeByIndexes(0, 0, 1, rows[0].length);
  header.format.fill.color = "#17324D";
  header.format.font.color = "#FFFFFF";
  header.format.font.bold = true;
  header.format.horizontalAlignment = "Center";
  header.format.rowHeight = 28;

  const body = sheet.getRangeByIndexes(1, 0, Math.max(rows.length - 1, 1), rows[0].length);
  body.format.borders = { preset: "inside", style: "thin", color: "#D8DEE8" };
  used.format.borders = { preset: "outside", style: "medium", color: "#9AA8B8" };
  used.format.autofitRows();

  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, rows.length, 1).format.columnWidth = width;
  });
  return sheet;
}

function addStatusFill(sheet, statusColumnIndex, rowCount) {
  for (let row = 1; row < rowCount; row += 1) {
    const status = sheet.getCell(row, statusColumnIndex).values[0][0];
    const range = sheet.getCell(row, statusColumnIndex);
    if (status === "PASS" || status === "Passed") {
      range.format.fill.color = "#DDF4E6";
      range.format.font.color = "#17623A";
      range.format.font.bold = true;
    } else if (status === "FAIL" || status === "Failed") {
      range.format.fill.color = "#FCE4E4";
      range.format.font.color = "#9C1C1C";
      range.format.font.bold = true;
    } else if (status === "PENDING") {
      range.format.fill.color = "#FFF2CC";
      range.format.font.color = "#7A5200";
      range.format.font.bold = true;
    }
  }
}

const selenium = JSON.parse(await readText("selenium-e2e-node/reports/test-results.json"));
const seleniumRows = [
  ["No.", "Test Area", "Suite", "Test Case", "Status", "Duration MS", "Notes", "Run Timestamp", "Evidence File"],
  ...selenium.map((item, index) => [
    index + 1,
    "Web Selenium",
    item.suite,
    item.test,
    item.status,
    Number(item.durationMs || 0),
    item.notes || statusDecision(item.status),
    item.timestamp || "",
    "selenium-e2e-node/reports/test-results.json"
  ])
];

const appiumXml = await readText("appium-tests/target/surefire-reports/testng-results.xml");
const appiumRows = [
  ["No.", "Test Area", "Suite/Class", "Test Case", "Description", "Status", "Duration MS", "Failure / Notes", "Evidence File"],
  ...buildAppiumRows(appiumXml)
];

const load = JSON.parse(await readText("reports/load-tests/baseline-2026-07-05T16-31-46-190Z.json"));
const loadRows = [
  ["No.", "Test Area", "Endpoint / Metric", "Test Case", "Status", "Requests", "Failures", "Result / Notes", "Evidence File"],
  [1, "Load Test", "Overall", `${load.virtualUsers} virtual users for ${load.durationSeconds} seconds`, load.failures === 0 ? "PASS" : "FAIL", load.requests, load.failures, `${load.requestsPerSecond} requests/sec, p95 ${load.responseTimeMs.p95} ms`, "reports/load-tests/baseline-2026-07-05T16-31-46-190Z.json"],
  ...Object.entries(load.endpoints).map(([endpoint, result], index) => [
    index + 2,
    "Load Test",
    endpoint,
    "Endpoint availability under baseline load",
    result.failures === 0 ? "PASS" : "FAIL",
    result.requests,
    result.failures,
    result.failures === 0 ? "All requests returned successful response" : "Failures observed",
    "reports/load-tests/baseline-2026-07-05T16-31-46-190Z.json"
  ])
];

const databaseRows = [
  ["No.", "Test Area", "Security Test Case", "Status", "Severity", "Required Evidence / Notes", "Evidence File"],
  [1, "Database Vulnerability", "Dependency vulnerability scan", "PENDING", "High", "Run dependency audit and attach report showing no unresolved critical/high issues.", "Pending"],
  [2, "Database Vulnerability", "API authorization test", "PENDING", "High", "Confirm protected data cannot be read or changed without authorization.", "Pending"],
  [3, "Database Vulnerability", "Database direct access check", "PENDING", "High", "Confirm database cannot be downloaded or accessed publicly.", "Pending"],
  [4, "Database Vulnerability", "Sensitive data exposure review", "PENDING", "High", "Confirm passwords, tokens, and private values are not exposed in API responses/logs.", "Pending"],
  [5, "Database Vulnerability", "CORS production hardening", "PENDING", "Medium", "Restrict allowed origins for production domain instead of allowing all origins.", "backend/server.js"],
  [6, "Database Vulnerability", "Input validation test", "PENDING", "Medium", "Confirm malformed input cannot corrupt state or crash the server.", "Pending"],
  [7, "Database Vulnerability", "Secrets management check", "PENDING", "Medium", "Confirm secrets are stored outside source code.", "Pending"],
  [8, "Database Vulnerability", "Backup and recovery evidence", "PENDING", "Medium", "Document backup and restore process for production database.", "Pending"]
];

const webPassed = selenium.filter((x) => x.status === "PASS").length;
const webFailed = selenium.length - webPassed;
const appiumPassed = appiumRows.slice(1).filter((x) => x[5] === "PASS").length;
const appiumFailed = appiumRows.slice(1).filter((x) => x[5] === "FAIL").length;
const loadPassed = loadRows.slice(1).filter((x) => x[4] === "PASS").length;
const loadFailed = loadRows.slice(1).filter((x) => x[4] === "FAIL").length;

const summaryRows = [
  ["PawPal QA Test Status Workbook", "", "", "", "", ""],
  ["Prepared Date", "2026-07-17", "", "", "", ""],
  ["Application", "PawPal Web, Android APK, Backend API, Database", "", "", "", ""],
  ["", "", "", "", "", ""],
  ["Test Area", "Total", "Passed", "Failed", "Pending", "Approval Status"],
  ["Web Selenium E2E", selenium.length, webPassed, webFailed, 0, webFailed === 0 ? "Passed" : "Action Required"],
  ["Mobile Android Appium E2E", appiumRows.length - 1, appiumPassed, appiumFailed, 0, appiumFailed === 0 ? "Passed" : "Action Required"],
  ["Load Test", loadRows.length - 1, loadPassed, loadFailed, 0, loadFailed === 0 ? "Passed" : "Action Required"],
  ["Database Vulnerability Test", databaseRows.length - 1, 0, 0, databaseRows.length - 1, "Pending Evidence"],
  ["", "", "", "", "", ""],
  ["Overall Recommendation", "Conditional approval for staging/UAT. Production approval after Appium failures and database vulnerability evidence are closed.", "", "", "", ""]
];

const workbook = Workbook.create();
const summarySheet = addSheet(workbook, "Summary", summaryRows, [30, 22, 14, 14, 14, 28]);
summarySheet.getRange("A1:F1").merge();
summarySheet.getRange("A1").format.fill.color = "#0F2437";
summarySheet.getRange("A1").format.font.color = "#FFFFFF";
summarySheet.getRange("A1").format.font.bold = true;
summarySheet.getRange("A1").format.font.size = 16;
summarySheet.getRange("A11:F11").merge();
summarySheet.getRange("A11").format.fill.color = "#FFF2CC";
summarySheet.getRange("A11").format.font.bold = true;
summarySheet.getRange("B5:E9").format.horizontalAlignment = "Center";

const seleniumSheet = addSheet(workbook, "Web Selenium Tests", seleniumRows, [8, 18, 24, 58, 14, 14, 24, 22, 46]);
addStatusFill(seleniumSheet, 4, seleniumRows.length);

const appiumSheet = addSheet(workbook, "Mobile Appium Tests", appiumRows, [8, 18, 26, 36, 58, 14, 14, 64, 46]);
addStatusFill(appiumSheet, 5, appiumRows.length);

const loadSheet = addSheet(workbook, "Load Tests", loadRows, [8, 16, 48, 38, 14, 16, 12, 46, 48]);
addStatusFill(loadSheet, 4, loadRows.length);

const databaseSheet = addSheet(workbook, "Database Security Tests", databaseRows, [8, 24, 40, 14, 14, 70, 30]);
addStatusFill(databaseSheet, 3, databaseRows.length);

const visualChecks = [
  { sheetName: "Summary", range: "A1:F11" },
  { sheetName: "Web Selenium Tests", range: "A1:I35" },
  { sheetName: "Mobile Appium Tests", range: "A1:I35" },
  { sheetName: "Load Tests", range: "A1:I10" },
  { sheetName: "Database Security Tests", range: "A1:G10" }
];

for (const check of visualChecks) {
  await workbook.render({ ...check, scale: 1, format: "png" });
}

const errorScan = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 20 },
  summary: "final formula error scan"
});
console.log(errorScan.ndjson);

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath);
