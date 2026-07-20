package com.pawpal.tests.config;

/**
 * PawPal Appium Test Configuration
 * Central config for device, app, and timeouts.
 */
public class AppConfig {

    // ─── Appium Server ────────────────────────────────────────────────────────
    public static final String APPIUM_SERVER_URL   = System.getProperty("appium.server",
            "http://127.0.0.1:4723");

    // ─── APK Path (update if needed) ─────────────────────────────────────────
    public static final String APK_PATH            = System.getProperty("apk.path",
            "/Users/surya/Documents/pawpal/PawPal-Android-Install.apk");

    // ─── Device (change to match your emulator / real device) ─────────────────
    public static final String DEVICE_NAME         = System.getProperty("device.name",
            "emulator-5554");
    public static final String PLATFORM_VERSION    = System.getProperty("platform.version",
            "17");
    public static final String AUTOMATION_NAME     = "UIAutomator2";
    public static final String PLATFORM_NAME       = "Android";
    public static final String APP_PACKAGE         = "com.pawpal.app";
    public static final String APP_ACTIVITY        = ".MainActivity";

    // ─── Timeouts ─────────────────────────────────────────────────────────────
    public static final int IMPLICIT_WAIT_SECS     = 10;
    public static final int EXPLICIT_WAIT_SECS     = 20;
    public static final int PAGE_LOAD_WAIT_SECS    = 30;
    public static final int WEBVIEW_SETTLE_MS      = 2500;
    public static final int UIAUTOMATOR_LAUNCH_TIMEOUT_MS = 120000;
    public static final int UIAUTOMATOR_INSTALL_TIMEOUT_MS = 120000;
    public static final int ADB_EXEC_TIMEOUT_MS    = 120000;
    public static final int SHORT_WAIT_MS          = 1000;
    public static final int MEDIUM_WAIT_MS         = 2000;

    // ─── Test Data ────────────────────────────────────────────────────────────
    public static final String OWNER_NAME          = "Surya Tester";
    public static final String OWNER_PHONE         = "9876543210";
    public static final String OWNER_EMAIL         = "suryatest@gmail.com";
    public static final String OWNER_PASSWORD      = "Test@1234";

    public static final String PET_TYPE            = "Dog";
    public static final String PET_BREED           = "Labrador Retriever";
    public static final String PET_NAME            = "Bruno";
    public static final String PET_AGE             = "3";
    public static final String PET_WEIGHT          = "18";
    public static final String PET_LICENCE         = "CHN-PET-2026-1024";
    public static final String PET_LOCATION        = "Chennai, Tamil Nadu";
    public static final String PET_CONCERN         = "Weight control";

    public static final String DOCTOR_NAME         = "Dr. Priya Sharma";
    public static final String DOCTOR_PHONE        = "9876512001";
    public static final String DOCTOR_EMAIL        = "priya@gmail.com";
    public static final String DOCTOR_PASSWORD     = "Doctor@1234";

    public static final String VACCINE_NAME        = "Bordetella - due 20 Jul 2026";
    public static final String MEDICINE_NAME       = "Probiotic - 5ml after dinner";
    public static final String PRESCRIPTION_TEXT   = "Rest for 3 days, avoid strenuous activity.";
    public static final String ACTIVITY_NAME       = "Evening Walk";
    public static final String ACTIVITY_MINS       = "30";
    public static final String EXPENSE_TITLE       = "Vaccination";
    public static final String EXPENSE_AMOUNT      = "750";
    public static final String COMMUNITY_POST      = "PawPal E2E test post - Bruno is doing great!";
    public static final String TRAVEL_CITY         = "Chennai";
    public static final String CAREGIVER_CITY      = "Chennai";

    // ─── Report Paths ────────────────────────────────────────────────────────
    public static final String REPORTS_DIR         = "test-output/reports";
    public static final String EXCEL_REPORT_NAME   = "PawPal_E2E_Test_Report.xlsx";
    public static final String EXTENT_REPORT_NAME  = "PawPal_ExtentReport.html";
    public static final String SCREENSHOTS_DIR     = "test-output/screenshots";
}
