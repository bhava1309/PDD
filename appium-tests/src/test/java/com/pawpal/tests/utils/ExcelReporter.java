package com.pawpal.tests.utils;

import com.pawpal.tests.config.AppConfig;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileOutputStream;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Generates the PawPal Appium Excel report in the same workbook structure as
 * the provided E2E reference report:
 * Summary, Passed Tests, Failed Tests, Execution Log and Test Details.
 */
public class ExcelReporter {

    private static final Logger log = LoggerFactory.getLogger(ExcelReporter.class);
    private static final List<TestRecord> records = new ArrayList<>();
    private static final long SUITE_START = System.currentTimeMillis();
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_INSTANT;
    private static final DateTimeFormatter LOG_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static class TestRecord {
        public final String module;
        public final String tcId;
        public final String testName;
        public final String status;
        public final long durationMs;
        public final String errorMsg;
        public final String timestamp;

        public TestRecord(String module, String tcId, String testName,
                          String status, long durationMs, String errorMsg) {
            this.module = module;
            this.tcId = tcId;
            this.testName = testName;
            this.status = normalizeStatus(status);
            this.durationMs = durationMs;
            this.errorMsg = errorMsg == null || errorMsg.isBlank()
                    ? "None - test passed successfully."
                    : errorMsg;
            this.timestamp = LocalDateTime.now(ZoneId.systemDefault()).format(LOG_TIME);
        }
    }

    public static synchronized void record(String module, String tcId,
                                           String testName, String status,
                                           long durationMs, String errorMsg) {
        TestRecord rec = new TestRecord(module, tcId, testName, status, durationMs, errorMsg);
        records.add(rec);
        log.info("[{}] {} | {} | {}ms", rec.status, module, testName, durationMs);
    }

    public static synchronized void generateReport() {
        generateReport(AppConfig.EXCEL_REPORT_NAME,
                "PawPal Android Appium - Full E2E Workflow");
    }

    public static synchronized void generateReport(String fileName, String suiteName) {
        try {
            new File(AppConfig.REPORTS_DIR).mkdirs();
            String filePath = AppConfig.REPORTS_DIR + File.separator + fileName;

            try (XSSFWorkbook wb = new XSSFWorkbook();
                 FileOutputStream fos = new FileOutputStream(filePath)) {
                Styles styles = new Styles(wb);
                buildSummary(wb, styles, suiteName);
                buildPassedTests(wb, styles);
                buildFailedTests(wb, styles);
                buildExecutionLog(wb, styles);
                buildTestDetails(wb, styles);
                wb.write(fos);
            }

            log.info("Excel report saved: {}", filePath);
        } catch (Exception e) {
            log.error("Failed to generate Excel report", e);
        }
    }

    private static void buildSummary(XSSFWorkbook wb, Styles st, String suiteName) {
        XSSFSheet sheet = wb.createSheet("Summary");
        String[] headers = {"Test Suite", "Total Tests", "Passed", "Failed", "Pass Rate %", "Duration (sec)", "Start Time", "End Time"};
        writeHeader(sheet, st, headers);

        long total = records.size();
        long passed = records.stream().filter(r -> "PASSED".equals(r.status)).count();
        long failed = records.stream().filter(r -> "FAILED".equals(r.status)).count();
        double passRate = total == 0 ? 0.0 : Math.round((passed * 10000.0) / total) / 100.0;
        double durationSec = Math.round(((System.currentTimeMillis() - SUITE_START) / 1000.0) * 100.0) / 100.0;

        Row row = sheet.createRow(1);
        Object[] values = {
                suiteName,
                total,
                passed,
                failed,
                passRate,
                durationSec,
                ISO.format(Instant.ofEpochMilli(SUITE_START)),
                ISO.format(Instant.now())
        };
        writeRow(row, values, st.normal);
        autoSize(sheet, headers.length);
    }

    private static void buildPassedTests(XSSFWorkbook wb, Styles st) {
        XSSFSheet sheet = wb.createSheet("Passed Tests");
        String[] headers = {"No.", "Category", "Test Name", "Time (sec)", "Status"};
        writeHeader(sheet, st, headers);

        int rowNum = 1;
        int count = 1;
        for (TestRecord rec : records) {
            if (!"PASSED".equals(rec.status)) continue;
            Row row = sheet.createRow(rowNum++);
            writeRow(row, new Object[]{count++, rec.module, rec.testName, seconds(rec.durationMs), rec.status}, st.passed);
        }
        autoSize(sheet, headers.length);
    }

    private static void buildFailedTests(XSSFWorkbook wb, Styles st) {
        XSSFSheet sheet = wb.createSheet("Failed Tests");
        String[] headers = {"No.", "Category", "Test Name", "Error", "Status", "Timestamp"};
        writeHeader(sheet, st, headers);

        int rowNum = 1;
        int count = 1;
        for (TestRecord rec : records) {
            if (!"FAILED".equals(rec.status)) continue;
            Row row = sheet.createRow(rowNum++);
            writeRow(row, new Object[]{count++, rec.module, rec.testName, limit(rec.errorMsg, 500), rec.status, rec.timestamp}, st.failed);
        }
        autoSize(sheet, headers.length);
    }

    private static void buildExecutionLog(XSSFWorkbook wb, Styles st) {
        XSSFSheet sheet = wb.createSheet("Execution Log");
        String[] headers = {"Timestamp", "Level", "Message"};
        writeHeader(sheet, st, headers);

        int rowNum = 1;
        for (TestRecord rec : records) {
            String level = "FAILED".equals(rec.status) ? "ERROR" : "INFO";
            String message = "[" + rec.module + "] " + rec.testName + " -> " + rec.status + " in " + seconds(rec.durationMs) + "s";
            if ("FAILED".equals(rec.status)) message += ": " + limit(rec.errorMsg, 400);
            Row row = sheet.createRow(rowNum++);
            writeRow(row, new Object[]{rec.timestamp, level, message}, "ERROR".equals(level) ? st.failed : st.passed);
        }
        autoSize(sheet, headers.length);
    }

    private static void buildTestDetails(XSSFWorkbook wb, Styles st) {
        XSSFSheet sheet = wb.createSheet("Test Details");
        String[] headers = {"No.", "Category", "Test Name", "Status", "Error Details"};
        writeHeader(sheet, st, headers);

        int rowNum = 1;
        int count = 1;
        for (TestRecord rec : records) {
            Row row = sheet.createRow(rowNum++);
            CellStyle style = "FAILED".equals(rec.status) ? st.failed : st.passed;
            writeRow(row, new Object[]{count++, rec.module, rec.testName, rec.status, limit(rec.errorMsg, 800)}, style);
        }
        autoSize(sheet, headers.length);
    }

    private static void writeHeader(Sheet sheet, Styles st, String[] headers) {
        sheet.createFreezePane(0, 1);
        sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, headers.length - 1));
        Row row = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(st.header);
        }
    }

    private static void writeRow(Row row, Object[] values, CellStyle style) {
        for (int i = 0; i < values.length; i++) {
            Cell cell = row.createCell(i);
            Object value = values[i];
            if (value instanceof Number) {
                cell.setCellValue(((Number) value).doubleValue());
            } else {
                cell.setCellValue(value == null ? "" : value.toString());
            }
            cell.setCellStyle(style);
        }
    }

    private static void autoSize(Sheet sheet, int columns) {
        for (int i = 0; i < columns; i++) {
            sheet.autoSizeColumn(i);
            int width = sheet.getColumnWidth(i);
            int max = i == 2 || i == 3 || i == 4 ? 18000 : 9000;
            sheet.setColumnWidth(i, Math.min(Math.max(width + 800, 2800), max));
        }
    }

    private static double seconds(long ms) {
        return Math.round((ms / 1000.0) * 100.0) / 100.0;
    }

    private static String limit(String value, int max) {
        if (value == null) return "";
        return value.length() <= max ? value : value.substring(0, max);
    }

    private static String normalizeStatus(String status) {
        if (status == null) return "FAILED";
        String normalized = status.trim().toUpperCase();
        if ("PASS".equals(normalized)) return "PASSED";
        if ("FAIL".equals(normalized)) return "FAILED";
        if ("SKIP".equals(normalized)) return "FAILED";
        return normalized;
    }

    private static class Styles {
        final CellStyle header;
        final CellStyle passed;
        final CellStyle failed;
        final CellStyle normal;

        Styles(XSSFWorkbook wb) {
            XSSFFont headerFont = wb.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            header = wb.createCellStyle();
            header.setFont(headerFont);
            ((XSSFCellStyle) header).setFillForegroundColor(new XSSFColor(new java.awt.Color(31, 56, 100), null));
            header.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            header.setAlignment(HorizontalAlignment.CENTER);
            header.setVerticalAlignment(VerticalAlignment.CENTER);

            passed = wb.createCellStyle();
            ((XSSFCellStyle) passed).setFillForegroundColor(new XSSFColor(new java.awt.Color(198, 239, 206), null));
            passed.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            passed.setWrapText(true);
            passed.setVerticalAlignment(VerticalAlignment.TOP);

            failed = wb.createCellStyle();
            ((XSSFCellStyle) failed).setFillForegroundColor(new XSSFColor(new java.awt.Color(255, 199, 206), null));
            failed.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            failed.setWrapText(true);
            failed.setVerticalAlignment(VerticalAlignment.TOP);

            normal = wb.createCellStyle();
            normal.setWrapText(true);
            normal.setVerticalAlignment(VerticalAlignment.TOP);
        }
    }
}
