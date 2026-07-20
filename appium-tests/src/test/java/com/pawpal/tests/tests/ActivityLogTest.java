package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: Activity Log
 * Tests: Add activity, activity list rendering, activity history, empty validation
 */
public class ActivityLogTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void navigateToActivity() {
        log.info("ActivityLogTest.navigateToActivity");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true;");
        js("showPage('activity'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
    }

    @Test(priority = 55, testName = "TC-AL-01",
          description = "Activity Log page is displayed with Log and History panels")
    public void verifyActivityPageLayout() {
        log.info("▶ TC-AL-01: Verify Activity Log layout");
        Assert.assertTrue(isPageActive("activity"), "Activity page should be active");

        Assert.assertTrue(elementExists("activity-name"),
                "Activity name input should exist");
        Assert.assertTrue(elementExists("activity-mins"),
                "Activity minutes input should exist");
        Assert.assertTrue(elementExists("activity-list"),
                "Activity list should exist");
        log.info("✅ Activity Log page layout verified");
    }

    @Test(priority = 56, testName = "TC-AL-02",
          description = "Default activities are shown in history")
    public void verifyDefaultActivities() {
        log.info("▶ TC-AL-02: Verify default activity history");
        Object count = js(
            "return document.querySelectorAll('#activity-list li').length");
        int c = count != null ? Integer.parseInt(count.toString()) : 0;
        Assert.assertTrue(c > 0, "Should have at least 1 default activity");
        log.info("✅ Default activities: {} items", c);
    }

    @Test(priority = 57, testName = "TC-AL-03",
          description = "Adding a valid activity appends it to history list")
    public void verifyAddActivity() {
        log.info("▶ TC-AL-03: Add new activity");
        int before = Integer.parseInt(
            js("return document.querySelectorAll('#activity-list li').length").toString());

        jsSetValue("activity-name", AppConfig.ACTIVITY_NAME);
        jsSetValue("activity-mins", AppConfig.ACTIVITY_MINS);
        sleep(AppConfig.SHORT_WAIT_MS);
        js("addActivity()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        int after = Integer.parseInt(
            js("return document.querySelectorAll('#activity-list li').length").toString());

        Assert.assertTrue(after > before,
                "Activity list should grow. Before=" + before + " After=" + after);

        Object listText = js("return document.getElementById('activity-list').innerText");
        Assert.assertTrue(listText != null &&
                listText.toString().toLowerCase().contains("evening"),
                "Added activity should appear in list");
        log.info("✅ Activity added. List: {} → {}", before, after);
    }

    @Test(priority = 58, testName = "TC-AL-04",
          description = "Empty activity name does not add blank entry")
    public void verifyEmptyActivityNotAdded() {
        log.info("▶ TC-AL-04: Empty activity name rejected");
        jsSetValue("activity-name", "");
        jsSetValue("activity-mins", "20");
        int before = Integer.parseInt(
            js("return document.querySelectorAll('#activity-list li').length").toString());
        js("addActivity()");
        sleep(AppConfig.SHORT_WAIT_MS);
        int after = Integer.parseInt(
            js("return document.querySelectorAll('#activity-list li').length").toString());
        Assert.assertEquals(after, before, "Empty activity name should not be added");
        log.info("✅ Empty activity name correctly rejected");
    }

    @Test(priority = 59, testName = "TC-AL-05",
          description = "Activity with minutes=0 does not add entry")
    public void verifyZeroMinutesActivityNotAdded() {
        log.info("▶ TC-AL-05: Zero minutes activity rejected");
        jsSetValue("activity-name", "Test Activity");
        jsSetValue("activity-mins", "0");
        int before = Integer.parseInt(
            js("return document.querySelectorAll('#activity-list li').length").toString());
        js("addActivity()");
        sleep(AppConfig.SHORT_WAIT_MS);
        int after = Integer.parseInt(
            js("return document.querySelectorAll('#activity-list li').length").toString());
        Assert.assertEquals(after, before, "Activity with 0 minutes should not be added");
        log.info("✅ Zero-minute activity correctly rejected");
    }
}
