import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const rootDir = "/Users/surya/Documents/pawpal";
const outputDir = path.join(rootDir, "outputs", "qa-approval-excel", "separate-files");

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
    const methodBlocks = [...classMatch[2].matchAll(/<test-method\b([^>]*)>([\s\S]*?)<\/test-method>/g)];
    for (const methodMatch of methodBlocks) {
      const tag = methodMatch[1];
      if (getAttr(tag, "is-config") === "true") continue;
      const body = methodMatch[2];
      rows.push([
        rows.length + 1,
        className,
        getAttr(tag, "name"),
        getAttr(tag, "description"),
        getAttr(tag, "status") || "UNKNOWN",
        Number(getAttr(tag, "duration-ms") || 0),
        firstLine(getCdata(body, "message")) || "Passed",
        "appium-tests/target/surefire-reports/testng-results.xml"
      ]);
    }
  }
  return rows;
}

function addTitle(sheet, title, subtitle, columnCount) {
  sheet.getRangeByIndexes(0, 0, 1, columnCount).merge();
  sheet.getCell(0, 0).values = [[title]];
  sheet.getCell(0, 0).format.fill.color = "#0F2437";
  sheet.getCell(0, 0).format.font.color = "#FFFFFF";
  sheet.getCell(0, 0).format.font.bold = true;
  sheet.getCell(0, 0).format.font.size = 16;
  sheet.getCell(0, 0).format.rowHeight = 30;
  sheet.getRangeByIndexes(1, 0, 1, columnCount).merge();
  sheet.getCell(1, 0).values = [[subtitle]];
  sheet.getCell(1, 0).format.fill.color = "#EAF2F8";
  sheet.getCell(1, 0).format.font.bold = true;
}

function styleTable(sheet, startRow, rows, widths, statusColumnIndex = null) {
  const rowCount = rows.length;
  const colCount = rows[0].length;
  const range = sheet.getRangeByIndexes(startRow, 0, rowCount, colCount);
  range.values = rows;
  range.format.font.name = "Aptos";
  range.format.font.size = 10;
  range.format.wrapText = true;
  range.format.verticalAlignment = "Top";
  range.format.borders = { preset: "outside", style: "medium", color: "#A6B2C0" };

  const header = sheet.getRangeByIndexes(startRow, 0, 1, colCount);
  header.format.fill.color = "#17324D";
  header.format.font.color = "#FFFFFF";
  header.format.font.bold = true;
  header.format.horizontalAlignment = "Center";
  header.format.rowHeight = 26;

  const bodyRows = Math.max(rowCount - 1, 1);
  const body = sheet.getRangeByIndexes(startRow + 1, 0, bodyRows, colCount);
  body.format.borders = { preset: "inside", style: "thin", color: "#D8DEE8" };

  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, Math.max(startRow + rowCount, 1), 1).format.columnWidth = width;
  });

  if (statusColumnIndex !== null) {
    for (let row = startRow + 1; row < startRow + rowCount; row += 1) {
      const cell = sheet.getCell(row, statusColumnIndex);
      const status = cell.values[0][0];
      if (status === "PASS" || status === "Passed") {
        cell.format.fill.color = "#DDF4E6";
        cell.format.font.color = "#17623A";
      } else if (status === "FAIL" || status === "Failed") {
        cell.format.fill.color = "#FCE4E4";
        cell.format.font.color = "#9C1C1C";
      } else if (status === "PENDING") {
        cell.format.fill.color = "#FFF2CC";
        cell.format.font.color = "#7A5200";
      }
      cell.format.font.bold = true;
    }
  }
}

async function exportWorkbook(fileName, title, subtitle, summaryRows, testRows, widths, statusColumnIndex, previewRange) {
  const workbook = Workbook.create();
  const summary = workbook.worksheets.add("Summary");
  const tests = workbook.worksheets.add("Line By Line Tests");
  for (const sheet of [summary, tests]) sheet.showGridLines = false;

  addTitle(summary, title, subtitle, Math.max(summaryRows[0].length, 6));
  styleTable(summary, 3, summaryRows, [32, 20, 18, 18, 18, 42], 5);
  summary.freezePanes.freezeRows(4);

  addTitle(tests, `${title} - Line By Line`, "Every test case is listed on a separate row with status and evidence.", testRows[0].length);
  styleTable(tests, 3, testRows, widths, statusColumnIndex);
  tests.freezePanes.freezeRows(4);

  await workbook.render({ sheetName: "Summary", range: "A1:F12", scale: 1, format: "png" });
  await workbook.render({ sheetName: "Line By Line Tests", range: previewRange, scale: 1, format: "png" });
  const errors = await workbook.inspect({
    kind: "match",
    searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
    options: { useRegex: true, maxResults: 20 },
    summary: `${fileName} formula error scan`
  });
  console.log(`${fileName}: ${errors.ndjson.split("\n")[0] || "No formula errors"}`);

  await fs.mkdir(outputDir, { recursive: true });
  const output = await SpreadsheetFile.exportXlsx(workbook);
  const filePath = path.join(outputDir, fileName);
  await output.save(filePath);
  return filePath;
}

const selenium = JSON.parse(await readText("selenium-e2e-node/reports/test-results.json"));
const seleniumRows = [
  ["No.", "Suite", "Test Case", "Status", "Duration MS", "Notes", "Run Timestamp", "Evidence File"],
  ...selenium.map((item, index) => [
    index + 1,
    item.suite,
    item.test,
    item.status,
    Number(item.durationMs || 0),
    item.notes || "Passed",
    item.timestamp || "",
    "selenium-e2e-node/reports/test-results.json"
  ])
];
const seleniumPassed = selenium.filter((item) => item.status === "PASS").length;

const appiumXml = await readText("appium-tests/target/surefire-reports/testng-results.xml");
const appiumDataRows = buildAppiumRows(appiumXml);
const appiumRows = [
  ["No.", "Suite/Class", "Test Case", "Description", "Status", "Duration MS", "Failure / Notes", "Evidence File"],
  ...appiumDataRows
];
const appiumPassed = appiumDataRows.filter((row) => row[4] === "PASS").length;
const appiumFailed = appiumDataRows.filter((row) => row[4] === "FAIL").length;

const load = JSON.parse(await readText("reports/load-tests/baseline-2026-07-05T16-31-46-190Z.json"));
const loadDataRows = [
  [1, "Overall", `${load.virtualUsers} virtual users for ${load.durationSeconds} seconds`, "PASS", load.requests, load.failures, `${load.requestsPerSecond} requests/sec, p95 ${load.responseTimeMs.p95} ms`, "reports/load-tests/baseline-2026-07-05T16-31-46-190Z.json"],
  ...Object.entries(load.endpoints).map(([endpoint, result], index) => [
    index + 2,
    endpoint,
    "Endpoint availability under baseline load",
    result.failures === 0 ? "PASS" : "FAIL",
    result.requests,
    result.failures,
    result.failures === 0 ? "All requests returned successful response" : "Failures observed",
    "reports/load-tests/baseline-2026-07-05T16-31-46-190Z.json"
  ])
];
const loadRows = [
  ["No.", "Endpoint / Metric", "Test Case", "Status", "Requests", "Failures", "Result / Notes", "Evidence File"],
  ...loadDataRows
];
const loadPassed = loadDataRows.filter((row) => row[3] === "PASS").length;
const loadFailed = loadDataRows.filter((row) => row[3] === "FAIL").length;

const databaseDataRows = [
  [1, "Dependency vulnerability scan", "PENDING", "High", "Run dependency audit and attach report showing no unresolved critical/high issues.", "Pending"],
  [2, "API authorization test", "PENDING", "High", "Confirm protected data cannot be read or changed without authorization.", "Pending"],
  [3, "Database direct access check", "PENDING", "High", "Confirm database cannot be downloaded or accessed publicly.", "Pending"],
  [4, "Sensitive data exposure review", "PENDING", "High", "Confirm passwords, tokens, and private values are not exposed in API responses/logs.", "Pending"],
  [5, "CORS production hardening", "PENDING", "Medium", "Restrict allowed origins for production domain instead of allowing all origins.", "backend/server.js"],
  [6, "Input validation test", "PENDING", "Medium", "Confirm malformed input cannot corrupt state or crash the server.", "Pending"],
  [7, "Secrets management check", "PENDING", "Medium", "Confirm secrets are stored outside source code.", "Pending"],
  [8, "Backup and recovery evidence", "PENDING", "Medium", "Document backup and restore process for production database.", "Pending"]
];
const databaseRows = [
  ["No.", "Security Test Case", "Status", "Severity", "Required Evidence / Notes", "Evidence File"],
  ...databaseDataRows
];

const files = [];
files.push(await exportWorkbook(
  "PawPal_Web_Selenium_Test_Cases_Line_By_Line.xlsx",
  "PawPal Web Selenium Test Cases",
  "Web automation evidence: all recorded Selenium test cases are listed line by line.",
  [
    ["Metric", "Total", "Passed", "Failed", "Pending", "Approval Status"],
    ["Web Selenium E2E", selenium.length, seleniumPassed, selenium.length - seleniumPassed, 0, seleniumPassed === selenium.length ? "Passed" : "Action Required"]
  ],
  seleniumRows,
  [8, 24, 64, 14, 14, 24, 24, 48],
  3,
  "A1:H35"
));

files.push(await exportWorkbook(
  "PawPal_Mobile_Appium_Test_Cases_Line_By_Line.xlsx",
  "PawPal Mobile Appium Test Cases",
  "Android automation evidence: every Appium test case is listed line by line with actual status.",
  [
    ["Metric", "Total", "Passed", "Failed", "Pending", "Approval Status"],
    ["Mobile Android Appium E2E", appiumDataRows.length, appiumPassed, appiumFailed, 0, appiumFailed === 0 ? "Passed" : "Action Required"]
  ],
  appiumRows,
  [8, 26, 38, 64, 14, 14, 64, 48],
  4,
  "A1:H35"
));

files.push(await exportWorkbook(
  "PawPal_Load_Test_Cases_Line_By_Line.xlsx",
  "PawPal Load Test Cases",
  "Baseline load evidence: overall load and endpoint checks are listed separately.",
  [
    ["Metric", "Total", "Passed", "Failed", "Pending", "Approval Status"],
    ["Load Test", loadDataRows.length, loadPassed, loadFailed, 0, loadFailed === 0 ? "Passed" : "Action Required"]
  ],
  loadRows,
  [8, 50, 42, 14, 16, 12, 52, 52],
  3,
  "A1:H12"
));

files.push(await exportWorkbook(
  "PawPal_Database_Vulnerability_Test_Cases_Line_By_Line.xlsx",
  "PawPal Database Vulnerability Test Cases",
  "Database security checklist: each required vulnerability test is listed separately.",
  [
    ["Metric", "Total", "Passed", "Failed", "Pending", "Approval Status"],
    ["Database Vulnerability Test", databaseDataRows.length, 0, 0, databaseDataRows.length, "Pending Evidence"]
  ],
  databaseRows,
  [8, 42, 14, 14, 72, 32],
  2,
  "A1:F12"
));

console.log(JSON.stringify(files, null, 2));
