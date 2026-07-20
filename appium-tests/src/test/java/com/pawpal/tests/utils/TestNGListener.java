package com.pawpal.tests.utils;

import com.pawpal.tests.base.BaseTest;
import org.testng.*;

/**
 * TestNGListener — hooks into TestNG lifecycle to:
 *  1. Record each test result (PASS / FAIL / SKIP) with duration into ExcelReporter
 *  2. Capture screenshot on failure
 *  3. Generate Excel report after suite completes
 */
public class TestNGListener implements ITestListener, ISuiteListener {

    private final ThreadLocal<Long> startTime = new ThreadLocal<>();

    // ──────────── ISuiteListener ─────────────────────────────────────────────

    @Override
    public void onStart(ISuite suite) {
        BaseTest.log.info("══════════ PawPal Test Suite STARTED ══════════");
    }

    @Override
    public void onFinish(ISuite suite) {
        BaseTest.log.info("══════════ PawPal Test Suite FINISHED ══════════");
        ExcelReporter.generateReport();
    }

    // ──────────── ITestListener ──────────────────────────────────────────────

    @Override
    public void onTestStart(ITestResult result) {
        startTime.set(System.currentTimeMillis());
        BaseTest.log.info("▶ START  [{}.{}]",
                result.getTestClass().getName(), result.getName());
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        long duration = System.currentTimeMillis() - startTime.get();
        String module  = getModule(result);
        String tcId    = getTcId(result);
        String testName = getTestName(result);
        ExcelReporter.record(module, tcId, testName, "PASS", duration, "");
        BaseTest.log.info("✅ PASS  [{}] {}ms", testName, duration);
    }

    @Override
    public void onTestFailure(ITestResult result) {
        long duration = System.currentTimeMillis() - startTime.get();
        String module  = getModule(result);
        String tcId    = getTcId(result);
        String testName = getTestName(result);
        String error   = result.getThrowable() != null
                ? result.getThrowable().getMessage() : "Unknown error";

        // Capture screenshot
        ScreenshotHelper.capture(result.getName() + "_FAIL");

        ExcelReporter.record(module, tcId, testName, "FAIL", duration,
                error != null ? error.length() > 250 ? error.substring(0, 250) : error : "");
        BaseTest.log.error("❌ FAIL  [{}] {}ms | {}", testName, duration, error);
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        long duration = System.currentTimeMillis() -
                (startTime.get() != null ? startTime.get() : System.currentTimeMillis());
        String module  = getModule(result);
        String tcId    = getTcId(result);
        String testName = getTestName(result);
        ExcelReporter.record(module, tcId, testName, "SKIP", duration, "Skipped / Dependency failed");
        BaseTest.log.warn("⏭ SKIP  [{}]", testName);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Derive "Module" from the simple class name (drop "Test" suffix). */
    private String getModule(ITestResult result) {
        String className = result.getTestClass().getRealClass().getSimpleName();
        return className.replace("Test", "").replace("test", "");
    }

    /** Derive a TC-ID like "TC01" from the method name annotation or auto-generate. */
    private String getTcId(ITestResult result) {
        String baseId = "";
        try {
            org.testng.annotations.Test ann =
                    result.getMethod().getConstructorOrMethod().getMethod().getAnnotation(org.testng.annotations.Test.class);
            if (ann != null && !ann.testName().isEmpty()) baseId = ann.testName();
        } catch (Exception ignored) {}
        if (baseId.isEmpty()) {
            baseId = "TC-" + Math.abs(result.getName().hashCode() % 1000);
        }
        Object[] params = result.getParameters();
        if (params != null && params.length > 0) {
            StringBuilder sb = new StringBuilder(baseId);
            for (Object p : params) {
                if (p != null) {
                    String clean = p.toString().replaceAll("[^a-zA-Z0-9_-]", "");
                    if (clean.length() > 25) clean = clean.substring(0, 25);
                    if (!clean.isEmpty()) {
                        sb.append("-").append(clean);
                    }
                }
            }
            return sb.toString();
        }
        return baseId;
    }

    /** Derive a descriptive test name, appending parameters if present. */
    private String getTestName(ITestResult result) {
        String baseName = result.getName();
        Object[] params = result.getParameters();
        if (params != null && params.length > 0) {
            StringBuilder sb = new StringBuilder(baseName).append(" (");
            for (int i = 0; i < params.length; i++) {
                if (i > 0) sb.append(", ");
                sb.append(params[i] != null ? params[i].toString() : "null");
            }
            sb.append(")");
            return sb.toString();
        }
        return baseName;
    }
}
