package com.pawpal.tests.base;

import com.pawpal.tests.config.AppConfig;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeSuite;
import org.testng.SkipException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.net.URL;
import java.time.Duration;
import java.util.Set;

/**
 * BaseTest — boots / tears down the AndroidDriver once per suite.
 * All page-object tests extend this class.
 */
public class BaseTest {

    public static final Logger log = LoggerFactory.getLogger(BaseTest.class);

    /** Single driver instance shared across the entire test suite. */
    public static AndroidDriver driver;
    protected static WebDriverWait wait;

    // Context names used in Appium for switching
    private static final String NATIVE_APP = "NATIVE_APP";

    // ─────────────────────────────── Suite Setup ──────────────────────────────

    @BeforeSuite(alwaysRun = true)
    public void startDriver() throws Exception {
        log.info("=== Starting PawPal Appium session ===");

        // Ensure output dirs exist
        new File(AppConfig.REPORTS_DIR).mkdirs();
        new File(AppConfig.SCREENSHOTS_DIR).mkdirs();

        UiAutomator2Options options = new UiAutomator2Options()
                .setDeviceName(AppConfig.DEVICE_NAME)
                .setPlatformVersion(AppConfig.PLATFORM_VERSION)
                .setApp(AppConfig.APK_PATH)
                .setAppPackage(AppConfig.APP_PACKAGE)
                .setAppActivity(AppConfig.APP_ACTIVITY)
                .setAutoGrantPermissions(true)
                .setNoReset(false)
                .setFullReset(false)
                .setUiautomator2ServerLaunchTimeout(Duration.ofMillis(
                        AppConfig.UIAUTOMATOR_LAUNCH_TIMEOUT_MS))
                .setUiautomator2ServerInstallTimeout(Duration.ofMillis(
                        AppConfig.UIAUTOMATOR_INSTALL_TIMEOUT_MS))
                .setAdbExecTimeout(Duration.ofMillis(AppConfig.ADB_EXEC_TIMEOUT_MS))
                .setNewCommandTimeout(Duration.ofSeconds(120));

        try {
            driver = new AndroidDriver(
                    new URL(AppConfig.APPIUM_SERVER_URL),
                    options
            );
        } catch (Exception e) {
            log.error("Appium environment setup failed: {}", e.getMessage());
            throw new SkipException(
                    "Appium session could not start. Check the emulator/device, Appium server, " +
                    "UiAutomator2 driver, and APK path. Root cause: " + e.getMessage(), e);
        }

        driver.manage().timeouts()
                .implicitlyWait(Duration.ofSeconds(AppConfig.IMPLICIT_WAIT_SECS));

        wait = new WebDriverWait(driver, Duration.ofSeconds(AppConfig.EXPLICIT_WAIT_SECS));

        // Wait for the WebView to fully load
        sleep(AppConfig.WEBVIEW_SETTLE_MS);
        switchToWebView();

        log.info("Driver started. Current context: {}", driver.getContext());
    }

    // ─────────────────────────────── Suite Teardown ───────────────────────────

    @AfterSuite(alwaysRun = true)
    public void stopDriver() {
        if (driver != null) {
            log.info("=== Quitting Appium session ===");
            driver.quit();
        }
    }

    // ─────────────────────────────── Context Helpers ──────────────────────────

    /**
     * Switches to the first available WEBVIEW context.
     * PawPal is a WebView app, so all element interactions happen in WEBVIEW context.
     */
    protected void switchToWebView() {
        int maxAttempts = 10;
        for (int i = 0; i < maxAttempts; i++) {
            Set<String> contexts = driver.getContextHandles();
            log.debug("Available contexts (attempt {}): {}", i + 1, contexts);
            for (String ctx : contexts) {
                if (ctx.startsWith("WEBVIEW")) {
                    try {
                        driver.context(ctx);
                        log.info("Switched to context: {}", ctx);
                        sleep(AppConfig.SHORT_WAIT_MS);
                        return;
                    } catch (Exception e) {
                        throw new SkipException(
                                "WebView context was found but ChromeDriver could not attach. " +
                                "Start Appium with chromedriver_autodownload enabled. Root cause: " +
                                e.getMessage(), e);
                    }
                }
            }
            sleep(1500);
        }
        throw new SkipException("PawPal WebView context was not available after startup.");
    }

    protected void switchToNative() {
        driver.context(NATIVE_APP);
        log.debug("Switched to NATIVE_APP context");
    }

    // ─────────────────────────────── JS Helpers ───────────────────────────────

    /** Execute JavaScript inside the WebView. */
    protected Object js(String script, Object... args) {
        requireDriver();
        return ((JavascriptExecutor) driver).executeScript(script, args);
    }

    private void requireDriver() {
        if (driver == null) {
            throw new SkipException("Appium driver is unavailable because suite setup did not complete.");
        }
    }

    /** Navigate to a page using the app's JS showPage() function. */
    protected void navigateTo(String pageId) {
        js("showPage('" + pageId + "')");
        sleep(AppConfig.MEDIUM_WAIT_MS);
        log.debug("Navigated to page: {}", pageId);
    }

    /** Click a button using its id via JavaScript (more reliable in WebView). */
    protected void jsClick(String elementId) {
        js("document.getElementById('" + elementId + "').click()");
        sleep(AppConfig.SHORT_WAIT_MS);
    }

    /** Set an input field value using JS and also fire the 'input' event. */
    protected void jsSetValue(String elementId, String value) {
        js("var el=document.getElementById('" + elementId + "');" +
                "el.value='" + escapeJs(value) + "';" +
                "el.dispatchEvent(new Event('input',{bubbles:true}));" +
                "el.dispatchEvent(new Event('change',{bubbles:true}));");
    }

    /** Read the text content of an element by id. */
    protected String jsGetText(String elementId) {
        Object result = js("var el=document.getElementById('" + elementId + "');" +
                "return el ? (el.value || el.innerText || el.textContent || '') : '';");
        return result != null ? result.toString().trim() : "";
    }

    /** Check if a page is currently visible (has class 'active'). */
    protected boolean isPageActive(String pageId) {
        Object result = js("var p=document.getElementById('" + pageId + "-page');" +
                "return p && p.classList.contains('active');");
        return Boolean.TRUE.equals(result);
    }

    /** Check if an element exists in the DOM. */
    protected boolean elementExists(String elementId) {
        Object result = js("return Boolean(document.getElementById('" + elementId + "'))");
        return Boolean.TRUE.equals(result);
    }

    /** Get current page id (the page with class 'active'). */
    protected String getCurrentPage() {
        Object result = js("var active=document.querySelector('.page.active');" +
                "return active ? active.id.replace('-page','') : '';");
        return result != null ? result.toString() : "";
    }

    /** Select an option in a <select> by value or text. */
    protected void jsSelectByText(String selectId, String optionText) {
        js("var sel=document.getElementById('" + selectId + "');" +
                "for(var i=0;i<sel.options.length;i++){" +
                "  if(sel.options[i].text==='" + escapeJs(optionText) + "'){" +
                "    sel.selectedIndex=i;" +
                "    sel.dispatchEvent(new Event('change',{bubbles:true}));" +
                "    break;" +
                "  }" +
                "}");
    }

    // ─────────────────────────────── Utility ──────────────────────────────────

    protected void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private String escapeJs(String value) {
        return value.replace("\\", "\\\\").replace("'", "\\'");
    }
}
