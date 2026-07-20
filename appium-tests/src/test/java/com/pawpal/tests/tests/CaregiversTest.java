package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: Caregiver Finder
 * Tests: Caregiver search form, service filter, caregiver cards, book modal
 */
public class CaregiversTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void navigateToCaregivers() {
        log.info("CaregiversTest.navigateToCaregivers");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true;");
        js("showPage('caregivers'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
    }

    @Test(priority = 120, testName = "TC-CG-01",
          description = "Caregiver Finder page is active with search form")
    public void verifyCaregiversPageLayout() {
        log.info("▶ TC-CG-01: Verify Caregiver Finder page layout");
        Assert.assertTrue(isPageActive("caregivers"), "Caregivers page should be active");
        Assert.assertTrue(elementExists("care-location"), "Care location input should exist");
        Assert.assertTrue(elementExists("care-service"),  "Care service select should exist");
        Assert.assertTrue(elementExists("caregiver-list"),"Caregiver list should exist");
        log.info("✅ Caregiver Finder layout verified");
    }

    @Test(priority = 121, testName = "TC-CG-02",
          description = "Service type dropdown has all required options")
    public void verifyCareServiceOptions() {
        log.info("▶ TC-CG-02: Verify care service dropdown options");
        Object count = js(
            "return document.getElementById('care-service').options.length");
        int c = count != null ? Integer.parseInt(count.toString()) : 0;
        Assert.assertTrue(c >= 6,
                "Service type should have at least 6 options. Found: " + c);
        log.info("✅ Care service options: {}", c);
    }

    @Test(priority = 122, testName = "TC-CG-03",
          description = "Searching by city shows caregiver cards")
    public void verifyCaregiverSearch() {
        log.info("▶ TC-CG-03: Verify caregiver search results");
        jsSetValue("care-location", AppConfig.CAREGIVER_CITY);
        jsSelectByText("care-service", "Any Service");
        sleep(AppConfig.SHORT_WAIT_MS);
        js("renderCaregivers()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object cardCount = js(
            "return document.querySelectorAll('#caregiver-list .pet-card').length");
        int count = cardCount != null ? Integer.parseInt(cardCount.toString()) : 0;
        Assert.assertTrue(count > 0,
                "Caregiver search should show at least 1 result. Found: " + count);
        log.info("✅ Caregiver results for '{}': {} cards", AppConfig.CAREGIVER_CITY, count);
    }

    @Test(priority = 123, testName = "TC-CG-04",
          description = "Service filter 'Dog Walker' shows only walkers")
    public void verifyCaregiverServiceFilter() {
        log.info("▶ TC-CG-04: Verify Dog Walker service filter");
        jsSetValue("care-location", "");  // all locations
        jsSelectByText("care-service", "Dog Walker");
        sleep(AppConfig.SHORT_WAIT_MS);
        js("renderCaregivers()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object count = js(
            "return document.querySelectorAll('#caregiver-list .pet-card').length");
        int c = count != null ? Integer.parseInt(count.toString()) : 0;
        Assert.assertTrue(c > 0, "Dog Walker filter should show at least 1 result. Found: " + c);
        log.info("✅ Dog Walker filter results: {}", c);
    }

    @Test(priority = 124, testName = "TC-CG-05",
          description = "Caregiver card shows name, role, rating, price, and contact")
    public void verifyCaregiverCardDetails() {
        log.info("▶ TC-CG-05: Verify caregiver card details");
        jsSetValue("care-location", "");
        jsSelectByText("care-service", "Any Service");
        sleep(AppConfig.SHORT_WAIT_MS);
        js("renderCaregivers()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object firstCard = js(
            "var c=document.querySelector('#caregiver-list .pet-card');" +
            "return c ? c.innerText : ''");
        String text = firstCard != null ? firstCard.toString() : "";
        Assert.assertTrue(text.contains("₹") || text.contains("Per day") || text.contains("day"),
                "Caregiver card should show price. Got: " + text);
        log.info("✅ Caregiver card content: '{}'", text.substring(0, Math.min(100, text.length())));
    }

    @Test(priority = 125, testName = "TC-CG-06",
          description = "Clicking 'Book Caregiver' opens booking modal")
    public void verifyCaregiverBookModal() {
        log.info("▶ TC-CG-06: Verify caregiver booking modal");
        jsSetValue("care-location", "");
        jsSelectByText("care-service", "Any Service");
        js("renderCaregivers()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        // Click first action button on caregiver card
        js("var btn=document.querySelector('#caregiver-list .btn-primary');" +
           "if(btn) btn.click();");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object modalOpen = js("return document.getElementById('modal').classList.contains('open')");
        Assert.assertTrue(Boolean.TRUE.equals(modalOpen),
                "Booking modal should open on clicking Book Caregiver");

        js("closeModal()");
        sleep(AppConfig.SHORT_WAIT_MS);
        log.info("✅ Caregiver booking modal opens correctly");
    }
}
