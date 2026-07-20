package com.pawpal.tests.utils;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * ScreenshotHelper — captures screenshots from the active WebView context.
 */
public class ScreenshotHelper {

    private static final Logger log = LoggerFactory.getLogger(ScreenshotHelper.class);
    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss_SSS");

    /**
     * Capture a screenshot and save it to the screenshots folder.
     *
     * @param testName descriptive name prefix for the file
     * @return absolute path of saved screenshot, or empty string on failure
     */
    public static String capture(String testName) {
        try {
            File src = ((TakesScreenshot) BaseTest.driver).getScreenshotAs(OutputType.FILE);
            String fileName = testName.replaceAll("[^a-zA-Z0-9_]", "_")
                    + "_" + LocalDateTime.now().format(FMT) + ".png";
            File dest = new File(AppConfig.SCREENSHOTS_DIR, fileName);
            new File(AppConfig.SCREENSHOTS_DIR).mkdirs();
            FileUtils.copyFile(src, dest);
            log.debug("Screenshot saved: {}", dest.getAbsolutePath());
            return dest.getAbsolutePath();
        } catch (Exception e) {
            log.warn("Screenshot capture failed: {}", e.getMessage());
            return "";
        }
    }
}
