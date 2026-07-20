import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const rootDir = "/Users/surya/Documents/pawpal";
const outputDir = path.join(rootDir, "outputs", "qa-approval-excel", "line-by-line-only");
const outputPath = path.join(outputDir, "PawPal_All_Testing_Master_Summary_Report.xlsx");

const readJson = async relativePath => JSON.parse(await fs.readFile(path.join(rootDir, relativePath), "utf8"));
const selenium = await readJson("selenium-e2e-node/reports/test-results.json");
const expanded = await readJson("outputs/qa-approval-excel/expanded-backend-load-security-results.json");
const audit = await readJson("outputs/qa-approval-excel/selenium-tests-npm-audit-final.json");
const appiumXml = await fs.readFile(path.join(rootDir, "appium-tests/target/surefire-reports/testng-results.xml"), "utf8");
const appiumHead = appiumXml.match(/<testng-results[^>]+>/)?.[0] || "";
const getCount = name => Number(appiumHead.match(new RegExp(`${name}="(\\d+)"`))?.[1] || 0);
const auditCounts = audit.metadata?.vulnerabilities || {};

const rows = [
  ["PawPal All Testing Master Summary Report", "", "", "", "", "", ""],
  ["Prepared Date", "2026-07-17", "", "", "", "", ""],
  ["", "", "", "", "", "", ""],
  ["Test Area", "Total Test Cases", "Passed", "Failed", "Pending", "Overall Status", "Detailed Report"],
  [
    "Web Selenium Testing",
    selenium.length,
    selenium.filter(item => item.status === "PASS").length,
    selenium.filter(item => item.status !== "PASS").length,
    0,
    selenium.every(item => item.status === "PASS") ? "PASS" : "FAIL",
    "PawPal_Web_Selenium_Every_Test_Case_Status.xlsx"
  ],
  [
    "Mobile Appium Testing - Full Actual Result",
    getCount("total"),
    getCount("passed"),
    getCount("failed"),
    getCount("skipped"),
    getCount("failed") === 0 ? "PASS" : "FAIL",
    "PawPal_Mobile_Appium_Every_Test_Case_Status.xlsx"
  ],
  [
    "Mobile Appium Testing - Passed Cases Only",
    getCount("passed"),
    getCount("passed"),
    0,
    0,
    "PASS",
    "PawPal_Mobile_Appium_Passed_Test_Cases_Only.xlsx"
  ],
  [
    "Load Testing",
    expanded.loadResults.length,
    expanded.loadResults.filter(item => item.status === "PASS").length,
    expanded.loadResults.filter(item => item.status !== "PASS").length,
    0,
    expanded.loadResults.every(item => item.status === "PASS") ? "PASS" : "FAIL",
    "PawPal_Load_Test_Every_Test_Case_Status.xlsx"
  ],
  [
    "Database Vulnerability Testing",
    expanded.securityResults.length + 1,
    expanded.securityResults.filter(item => item.status === "PASS").length + (((auditCounts.critical || 0) === 0 && (auditCounts.high || 0) === 0) ? 1 : 0),
    expanded.securityResults.filter(item => item.status !== "PASS").length + (((auditCounts.critical || 0) === 0 && (auditCounts.high || 0) === 0) ? 0 : 1),
    0,
    expanded.securityResults.every(item => item.status === "PASS") && (auditCounts.critical || 0) === 0 && (auditCounts.high || 0) === 0 ? "PASS" : "FAIL",
    "PawPal_Database_Vulnerability_Every_Test_Case_Status.xlsx"
  ],
  ["", "", "", "", "", "", ""],
  ["Important Note", "The full Appium evidence still contains 14 failed tests. The passed-only Appium file lists the 525 Android tests that passed, but it is not a replacement for fixing the failed Appium cases.", "", "", "", "", ""]
];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Master Summary");
sheet.showGridLines = false;
sheet.getRangeByIndexes(0, 0, rows.length, rows[0].length).values = rows;
sheet.getRange("A1:G1").merge();
sheet.getRange("A1").format.fill.color = "#0F2437";
sheet.getRange("A1").format.font.color = "#FFFFFF";
sheet.getRange("A1").format.font.bold = true;
sheet.getRange("A1").format.font.size = 16;
sheet.getRange("A4:G4").format.fill.color = "#17324D";
sheet.getRange("A4:G4").format.font.color = "#FFFFFF";
sheet.getRange("A4:G4").format.font.bold = true;
sheet.getRange("A1:G11").format.font.name = "Aptos";
sheet.getRange("A1:G11").format.wrapText = true;
sheet.getRange("A4:G9").format.borders = { preset: "all", style: "thin", color: "#D8DEE8" };
sheet.getRange("A11:G11").merge();
sheet.getRange("A11").format.fill.color = "#FFF2CC";
sheet.getRange("A11").format.font.bold = true;
[34, 18, 14, 14, 14, 16, 56].forEach((width, index) => {
  sheet.getRangeByIndexes(0, index, rows.length, 1).format.columnWidth = width;
});
for (let row = 4; row <= 8; row += 1) {
  const statusCell = sheet.getCell(row, 5);
  const status = statusCell.values[0][0];
  statusCell.format.font.bold = true;
  if (status === "PASS") {
    statusCell.format.fill.color = "#DDF4E6";
    statusCell.format.font.color = "#17623A";
  } else {
    statusCell.format.fill.color = "#FCE4E4";
    statusCell.format.font.color = "#9C1C1C";
  }
}

await workbook.render({ sheetName: "Master Summary", range: "A1:G11", scale: 1, format: "png" });
await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath);
