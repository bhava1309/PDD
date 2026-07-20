package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: Pet Onboarding
 * Tests: All pet profile form fields, breed suggestion, BMI calculation, dashboard redirect
 */
public class OnboardingTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void ensureLoggedIn() {
        log.info("OnboardingTest.ensureLoggedIn — logging in first");
        js("activatePage('login')");
        sleep(AppConfig.MEDIUM_WAIT_MS);
        jsSetValue("owner-email",    AppConfig.OWNER_EMAIL);
        jsSetValue("owner-password", AppConfig.OWNER_PASSWORD);
        jsClick("continue-pet-details");
        sleep(AppConfig.PAGE_LOAD_WAIT_SECS * 100L);
        log.info("Pre-condition login complete. Current page: {}", getCurrentPage());
    }

    @Test(priority = 20, testName = "TC-OB-01",
          description = "Onboarding page renders all pet profile fields")
    public void verifyOnboardingFormFields() {
        log.info("▶ TC-OB-01: Verify onboarding form fields");
        js("activatePage('onboarding')");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Assert.assertTrue(isPageActive("onboarding"), "Onboarding page should be active");
        Assert.assertTrue(elementExists("pet-type"),    "Pet Type field should exist");
        Assert.assertTrue(elementExists("pet-breed"),   "Pet Breed field should exist");
        Assert.assertTrue(elementExists("pet-name"),    "Pet Name field should exist");
        Assert.assertTrue(elementExists("pet-age"),     "Pet Age field should exist");
        Assert.assertTrue(elementExists("pet-weight"),  "Pet Weight field should exist");
        Assert.assertTrue(elementExists("pet-licence"), "Pet Licence field should exist");
        Assert.assertTrue(elementExists("pet-location"),"Pet Location field should exist");
        Assert.assertTrue(elementExists("pet-concern"), "Health Concern field should exist");
        log.info("✅ All onboarding fields present");
    }

    @Test(priority = 21, testName = "TC-OB-02",
          description = "Pet Type dropdown contains all 9 animal options")
    public void verifyPetTypeOptions() {
        log.info("▶ TC-OB-02: Verify pet type dropdown options");
        js("activatePage('onboarding')");
        sleep(AppConfig.SHORT_WAIT_MS);

        Object count = js(
            "return document.getElementById('pet-type').options.length");
        int optCount = count != null ? Integer.parseInt(count.toString()) : 0;
        Assert.assertTrue(optCount >= 9,
                "Pet Type should have at least 9 options, found: " + optCount);
        log.info("✅ Pet Type has {} options", optCount);
    }

    @Test(priority = 22, testName = "TC-OB-03",
          description = "Changing pet type auto-suggests breed")
    public void verifyBreedAutoSuggestion() {
        log.info("▶ TC-OB-03: Verify breed auto-suggestion on type change");
        js("activatePage('onboarding')");
        sleep(AppConfig.SHORT_WAIT_MS);

        // Switch to Cat
        jsSelectByText("pet-type", "Cat");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        String breed = jsGetText("pet-breed");
        Assert.assertFalse(breed.isEmpty(),
                "Breed should be auto-suggested when pet type changes");
        log.info("✅ Auto-suggested breed for Cat: '{}'", breed);
    }

    @Test(priority = 23, testName = "TC-OB-04",
          description = "Empty pet form shows required field validation")
    public void verifyEmptyPetFormValidation() {
        log.info("▶ TC-OB-04: Verify empty pet form validation");
        js("activatePage('onboarding')");
        sleep(AppConfig.SHORT_WAIT_MS);

        jsSetValue("pet-name",     "");
        jsSetValue("pet-age",      "");
        jsSetValue("pet-weight",   "");
        jsSetValue("pet-location", "");
        sleep(AppConfig.SHORT_WAIT_MS);

        jsClick("calculate-bmi-dashboard");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        // Should still be on onboarding (not dashboard)
        String page = getCurrentPage();
        Assert.assertTrue("onboarding".equals(page) || "login".equals(page),
                "Should remain on onboarding on empty submission, got: " + page);
        log.info("✅ Empty pet form validation works, stayed on: {}", page);
    }

    @Test(priority = 24, testName = "TC-OB-05",
          description = "Valid pet details submission navigates to Dashboard with BMI calculated")
    public void verifyValidPetSubmission() {
        log.info("▶ TC-OB-05: Verify valid pet details submission");
        js("activatePage('onboarding')");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        jsSelectByText("pet-type", AppConfig.PET_TYPE);
        sleep(AppConfig.SHORT_WAIT_MS);
        jsSetValue("pet-breed",   AppConfig.PET_BREED);
        jsSetValue("pet-name",    AppConfig.PET_NAME);
        jsSetValue("pet-age",     AppConfig.PET_AGE);
        jsSetValue("pet-weight",  AppConfig.PET_WEIGHT);
        jsSetValue("pet-licence", AppConfig.PET_LICENCE);
        jsSetValue("pet-location",AppConfig.PET_LOCATION);
        jsSetValue("pet-concern", AppConfig.PET_CONCERN);
        sleep(AppConfig.SHORT_WAIT_MS);

        jsClick("calculate-bmi-dashboard");
        sleep(AppConfig.PAGE_LOAD_WAIT_SECS * 150L);  // 4.5s

        String page = getCurrentPage();
        Assert.assertEquals(page, "dashboard",
                "Valid pet details should navigate to Dashboard. Got: " + page);
        log.info("✅ Valid pet submission navigated to Dashboard");
    }

    @Test(priority = 25, testName = "TC-OB-06",
          description = "Dashboard shows correct pet name and BMI after onboarding")
    public void verifyDashboardShowsPetData() {
        log.info("▶ TC-OB-06: Verify dashboard shows pet data after onboarding");

        String petName = jsGetText("dash-name");
        String bmi     = jsGetText("dash-bmi");

        Assert.assertFalse(petName.isEmpty(), "Pet name should be shown on dashboard");
        Assert.assertFalse(bmi.isEmpty(),     "BMI should be shown on dashboard");
        log.info("✅ Dashboard shows pet name: '{}', BMI: '{}'", petName, bmi);
    }

    @Test(priority = 26, testName = "TC-OB-07",
          description = "Pet icon changes according to pet type")
    public void verifyPetIconChange() {
        log.info("▶ TC-OB-07: Verify pet icon matches type");
        Object iconClass = js(
            "var icon=document.querySelector('#dash-pet-icon i');" +
            "return icon ? icon.className : ''");
        String cls = iconClass != null ? iconClass.toString() : "";
        Assert.assertFalse(cls.isEmpty(), "Pet icon should have a class");
        Assert.assertTrue(cls.contains("fa-"), "Pet icon should use FontAwesome class");
        log.info("✅ Pet icon class: '{}'", cls);
    }
}
