import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const rootDir = "/Users/surya/Documents/pawpal";
const outputDir = path.join(rootDir, "outputs", "qa-approval-excel", "line-by-line-only");

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

function expectedFromStatus(status, description, fallback) {
  if (description) return description;
  return fallback || (status === "PASS" ? "Test should complete successfully" : "Test should meet expected validation");
}

function actualResult(status, note) {
  if (status === "PASS") return "Passed as expected";
  if (status === "FAIL") return note || "Failed during execution";
  if (status === "PENDING") return "Not executed / evidence pending";
  return note || "Review required";
}

function buildAppiumRows(xml) {
  const rows = [];
  const classBlocks = [...xml.matchAll(/<class name="([^"]+)">([\s\S]*?)<\/class>/g)];
  for (const classMatch of classBlocks) {
    const moduleName = classMatch[1].split(".").pop();
    const methodBlocks = [...classMatch[2].matchAll(/<test-method\b([^>]*)>([\s\S]*?)<\/test-method>/g)];
    for (const methodMatch of methodBlocks) {
      const tag = methodMatch[1];
      if (getAttr(tag, "is-config") === "true") continue;
      const body = methodMatch[2];
      const status = getAttr(tag, "status") || "UNKNOWN";
      const description = getAttr(tag, "description");
      const failure = firstLine(getCdata(body, "message"));
      rows.push([
        rows.length + 1,
        `APP-${String(rows.length + 1).padStart(4, "0")}`,
        moduleName,
        getAttr(tag, "name"),
        expectedFromStatus(status, description, "Android app feature should work as designed"),
        actualResult(status, failure),
        status,
        Number(getAttr(tag, "duration-ms") || 0),
        "appium-tests/target/surefire-reports/testng-results.xml"
      ]);
    }
  }
  return rows;
}

function styleSheet(sheet, rows, widths, statusColumnIndex) {
  sheet.showGridLines = false;
  sheet.freezePanes.freezeRows(1);
  const range = sheet.getRangeByIndexes(0, 0, rows.length, rows[0].length);
  range.values = rows;
  range.format.font.name = "Aptos";
  range.format.font.size = 10;
  range.format.wrapText = true;
  range.format.verticalAlignment = "Top";
  range.format.borders = { preset: "outside", style: "medium", color: "#9AA8B8" };

  const header = sheet.getRangeByIndexes(0, 0, 1, rows[0].length);
  header.format.fill.color = "#17324D";
  header.format.font.color = "#FFFFFF";
  header.format.font.bold = true;
  header.format.horizontalAlignment = "Center";
  header.format.rowHeight = 30;

  const body = sheet.getRangeByIndexes(1, 0, Math.max(rows.length - 1, 1), rows[0].length);
  body.format.borders = { preset: "inside", style: "thin", color: "#D8DEE8" };

  widths.forEach((width, index) => {
    sheet.getRangeByIndexes(0, index, rows.length, 1).format.columnWidth = width;
  });

  for (let row = 1; row < rows.length; row += 1) {
    const cell = sheet.getCell(row, statusColumnIndex);
    const status = cell.values[0][0];
    if (status === "PASS") {
      cell.format.fill.color = "#DDF4E6";
      cell.format.font.color = "#17623A";
    } else if (status === "FAIL") {
      cell.format.fill.color = "#FCE4E4";
      cell.format.font.color = "#9C1C1C";
    } else if (status === "PENDING") {
      cell.format.fill.color = "#FFF2CC";
      cell.format.font.color = "#7A5200";
    }
    cell.format.font.bold = true;
  }
}

async function exportLineWorkbook(fileName, rows, widths, statusColumnIndex, previewRange) {
  const workbook = Workbook.create();
  const sheet = workbook.worksheets.add("Every Test Case");
  styleSheet(sheet, rows, widths, statusColumnIndex);
  await workbook.render({ sheetName: "Every Test Case", range: previewRange, scale: 1, format: "png" });
  const scan = await workbook.inspect({
    kind: "match",
    searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
    options: { useRegex: true, maxResults: 20 },
    summary: `${fileName} formula error scan`
  });
  console.log(`${fileName}: ${scan.ndjson.split("\n")[0] || "No formula errors"}`);
  await fs.mkdir(outputDir, { recursive: true });
  const output = await SpreadsheetFile.exportXlsx(workbook);
  const filePath = path.join(outputDir, fileName);
  await output.save(filePath);
  return filePath;
}

const header = ["No.", "Test Case ID", "Module / Suite", "Test Case", "What It Checks / Expected Result", "Actual Result", "Status", "Duration MS", "Evidence File"];

const selenium = JSON.parse(await readText("selenium-e2e-node/reports/test-results.json"));
const seleniumRows = [
  header,
  ...selenium.map((item, index) => [
    index + 1,
    `WEB-${String(index + 1).padStart(4, "0")}`,
    item.suite,
    item.test,
    expectedFromStatus(item.status, "", item.test),
    actualResult(item.status, item.notes),
    item.status,
    Number(item.durationMs || 0),
    "selenium-e2e-node/reports/test-results.json"
  ])
];

const appiumXml = await readText("appium-tests/target/surefire-reports/testng-results.xml");
const appiumRows = [header, ...buildAppiumRows(appiumXml)];
const appiumPassedOnlyRows = [header, ...appiumRows.slice(1).filter(row => row[6] === "PASS").map((row, index) => [
  index + 1,
  `APP-PASS-${String(index + 1).padStart(4, "0")}`,
  row[2],
  row[3],
  row[4],
  row[5],
  row[6],
  row[7],
  row[8]
])];

const expanded = JSON.parse(await readText("outputs/qa-approval-excel/expanded-backend-load-security-results.json"));
const loadRows = [
  header,
  ...expanded.loadResults.map(item => [
    item.no,
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

const backendSecurity = JSON.parse(await readText("outputs/qa-approval-excel/backend-vulnerability-results-after-fix.json"));
const audit = JSON.parse(await readText("outputs/qa-approval-excel/selenium-tests-npm-audit-final.json"));
const auditCounts = audit.metadata?.vulnerabilities || {};
const databaseRows = [
  header,
  ...expanded.securityResults.map((item, index) => [
    index + 1,
    item.id,
    item.module,
    item.testCase,
    item.expected,
    item.actual,
    item.status,
    item.durationMs,
    "outputs/qa-approval-excel/expanded-backend-load-security-results.json"
  ]),
  [
    expanded.securityResults.length + 1,
    `DBSEC-${String(expanded.securityResults.length + 1).padStart(4, "0")}`,
    "Dependency Vulnerability",
    "npm dependency audit",
    "No unresolved critical or high dependency vulnerabilities should remain before deployment",
    `${auditCounts.critical || 0} critical, ${auditCounts.high || 0} high, ${auditCounts.moderate || 0} moderate, ${auditCounts.low || 0} low findings. Remaining findings: ${Object.keys(audit.vulnerabilities || {}).join(", ") || "none"}`,
    (auditCounts.critical || 0) === 0 && (auditCounts.high || 0) === 0 ? "PASS" : "FAIL",
    0,
    "outputs/qa-approval-excel/selenium-tests-npm-audit-final.json"
  ]
];

const widths = [8, 16, 26, 46, 64, 56, 14, 14, 48];
const files = [];
files.push(await exportLineWorkbook("PawPal_Web_Selenium_Every_Test_Case_Status.xlsx", seleniumRows, widths, 6, "A1:I40"));
files.push(await exportLineWorkbook("PawPal_Mobile_Appium_Every_Test_Case_Status.xlsx", appiumRows, widths, 6, "A1:I40"));
files.push(await exportLineWorkbook("PawPal_Mobile_Appium_Passed_Test_Cases_Only.xlsx", appiumPassedOnlyRows, widths, 6, "A1:I40"));
files.push(await exportLineWorkbook("PawPal_Load_Test_Every_Test_Case_Status.xlsx", loadRows, widths, 6, "A1:I12"));
files.push(await exportLineWorkbook("PawPal_Database_Vulnerability_Every_Test_Case_Status.xlsx", databaseRows, widths, 6, "A1:I12"));
console.log(JSON.stringify(files, null, 2));
