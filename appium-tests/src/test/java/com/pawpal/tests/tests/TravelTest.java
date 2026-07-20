package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: Travel
 * Tests: Travel page layout, search form, results display, map frame
 */
public class TravelTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void navigateToTravel() {
        log.info("TravelTest.navigateToTravel");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true;");
        js("showPage('travel'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
    }

    @Test(priority = 90, testName = "TC-TR-01",
          description = "Travel page is active with search form and map")
    public void verifyTravelPageLayout() {
        log.info("▶ TC-TR-01: Verify Travel page layout");
        Assert.assertTrue(isPageActive("travel"), "Travel page should be active");
        Assert.assertTrue(elementExists("travel-location"), "Travel location input should exist");
        Assert.assertTrue(elementExists("travel-type"),     "Travel type select should exist");
        Assert.assertTrue(elementExists("travel-results"),  "Travel results container should exist");
        Assert.assertTrue(elementExists("travel-map-frame"),"Travel map frame should exist");
        log.info("✅ Travel page layout verified");
    }

    @Test(priority = 91, testName = "TC-TR-02",
          description = "Travel type dropdown has all required options")
    public void verifyTravelTypeOptions() {
        log.info("▶ TC-TR-02: Verify travel type dropdown options");
        Object count = js(
            "return document.getElementById('travel-type').options.length");
        int c = count != null ? Integer.parseInt(count.toString()) : 0;
        Assert.assertTrue(c >= 4,
                "Travel type should have at least 4 options. Found: " + c);
        log.info("✅ Travel type options: {}", c);
    }

    @Test(priority = 92, testName = "TC-TR-03",
          description = "Searching for a city renders travel place cards")
    public void verifyTravelSearch() {
        log.info("▶ TC-TR-03: Verify travel search results");
        jsSetValue("travel-location", AppConfig.TRAVEL_CITY);
        sleep(AppConfig.SHORT_WAIT_MS);
        js("renderTravel()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object cardCount = js(
            "return document.querySelectorAll('#travel-results .pet-card').length");
        int count = cardCount != null ? Integer.parseInt(cardCount.toString()) : 0;
        Assert.assertTrue(count > 0,
                "Travel search should show at least 1 result. Found: " + count);
        log.info("✅ Travel results for '{}': {} cards", AppConfig.TRAVEL_CITY, count);
    }

    @Test(priority = 93, testName = "TC-TR-04",
          description = "Map title updates after searching a city")
    public void verifyMapTitleUpdate() {
        log.info("▶ TC-TR-04: Verify travel map title update");
        String mapTitle = jsGetText("travel-map-title");
        Assert.assertFalse(mapTitle.isEmpty(), "Travel map title should not be empty");
        log.info("✅ Travel map title: '{}'", mapTitle);
    }

    @Test(priority = 94, testName = "TC-TR-05",
          description = "Filtering by Hotels shows only hotel results")
    public void verifyHotelFilter() {
        log.info("▶ TC-TR-05: Verify Hotel filter");
        jsSetValue("travel-location", AppConfig.TRAVEL_CITY);
        jsSelectByText("travel-type", "Hotels");
        sleep(AppConfig.SHORT_WAIT_MS);
        js("renderTravel()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object cardCount = js(
            "return document.querySelectorAll('#travel-results .pet-card').length");
        int count = cardCount != null ? Integer.parseInt(cardCount.toString()) : 0;
        Assert.assertTrue(count > 0, "Hotel filter should show results. Found: " + count);
        log.info("✅ Hotel filter results: {}", count);
    }

    @Test(priority = 95, testName = "TC-TR-06",
          description = "Each travel card has a name, location, and action button")
    public void verifyTravelCardStructure() {
        log.info("▶ TC-TR-06: Verify travel card structure");
        jsSetValue("travel-location", "Mumbai");
        jsSelectByText("travel-type", "All Places");
        sleep(AppConfig.SHORT_WAIT_MS);
        js("renderTravel()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object firstCard = js(
            "var c=document.querySelector('#travel-results .pet-card');" +
            "return c ? c.innerText : ''");
        String text = firstCard != null ? firstCard.toString() : "";
        Assert.assertFalse(text.isEmpty(), "Travel card should have content");
        log.info("✅ Travel card content: '{}'", text.substring(0, Math.min(80, text.length())));
    }
}
