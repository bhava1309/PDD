package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * TC Module: Login / Registration
 * Tests: Form fields, validation, successful login flow
 */
public class LoginTest extends BaseTest {

    @Test(priority = 10, testName = "TC-LG-01",
          description = "Login page is displayed with all required fields")
    public void verifyLoginPageElements() {
        log.info("▶ TC-LG-01: Verify Login page elements");
        js("activatePage('login')");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Assert.assertTrue(isPageActive("login"), "Login page should be active");
        Assert.assertTrue(elementExists("owner-email"),    "Email field should exist");
        Assert.assertTrue(elementExists("owner-password"), "Password field should exist");
        Assert.assertTrue(elementExists("continue-pet-details"), "Continue button should exist");
        log.info("✅ All login form fields present");
    }

    @Test(priority = 11, testName = "TC-LG-02",
          description = "Empty form submission shows validation errors")
    public void verifyEmptyFormValidation() {
        log.info("▶ TC-LG-02: Verify empty form validation");
        js("activatePage('login')");
        sleep(AppConfig.SHORT_WAIT_MS);

        // Clear all fields
        jsSetValue("owner-email",    "");
        jsSetValue("owner-password", "");
        sleep(AppConfig.SHORT_WAIT_MS);

        // Click Continue
        jsClick("continue-pet-details");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        // At least one error should be shown
        Object errorCount = js(
            "return document.querySelectorAll('.field-error.show').length");
        int count = errorCount != null ? Integer.parseInt(errorCount.toString()) : 0;
        Assert.assertTrue(count > 0,
                "Should show validation errors for empty form, found: " + count);
        log.info("✅ Empty form shows {} validation error(s)", count);
    }

    @Test(priority = 12, testName = "TC-LG-03",
          description = "Login page provides a separate New User registration action")
    public void verifyNewUserRegistrationAction() {
        log.info("▶ TC-LG-03: Verify New User registration action");
        js("activatePage('login')");
        sleep(AppConfig.SHORT_WAIT_MS);
        Object action = js("return Array.from(document.querySelectorAll('#login-page button'))" +
                ".some(function(b){return b.innerText.includes('Register New User')})");
        Assert.assertEquals(action, Boolean.TRUE, "Register New User action should exist");
    }

    @Test(priority = 13, testName = "TC-LG-04",
          description = "Invalid email (non-gmail) shows error")
    public void verifyInvalidEmailValidation() {
        log.info("▶ TC-LG-04: Verify invalid email validation");
        js("activatePage('login')");
        sleep(AppConfig.SHORT_WAIT_MS);

        jsSetValue("owner-email",    "not-an-email");
        jsSetValue("owner-password", AppConfig.OWNER_PASSWORD);
        sleep(AppConfig.SHORT_WAIT_MS);

        jsClick("continue-pet-details");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object emailErrorVisible = js(
            "var e=document.getElementById('owner-email-error');" +
            "return e && e.classList.contains('show');");
        Assert.assertTrue(Boolean.TRUE.equals(emailErrorVisible),
                "Email error should be visible for invalid email");
    }

    @Test(priority = 14, testName = "TC-LG-05",
          description = "Weak password shows error")
    public void verifyWeakPasswordValidation() {
        log.info("▶ TC-LG-05: Verify weak password validation");
        js("activatePage('login')");
        sleep(AppConfig.SHORT_WAIT_MS);

        jsSetValue("owner-email",    AppConfig.OWNER_EMAIL);
        jsSetValue("owner-password", "weakpass");  // no capital/number/special
        sleep(AppConfig.SHORT_WAIT_MS);

        jsClick("continue-pet-details");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object pwErrorVisible = js(
            "var e=document.getElementById('owner-password-error');" +
            "return e && e.classList.contains('show');");
        Assert.assertTrue(Boolean.TRUE.equals(pwErrorVisible),
                "Password error should be visible for weak password");
        log.info("✅ Weak password correctly triggers validation error");
    }

    @Test(priority = 15, testName = "TC-LG-06",
          description = "Valid login details navigate to Pet Details (Onboarding)")
    public void verifySuccessfulLogin() {
        log.info("▶ TC-LG-06: Verify successful login navigates to onboarding");
        js("activatePage('login')");
        sleep(AppConfig.SHORT_WAIT_MS);

        jsSetValue("owner-email",    AppConfig.OWNER_EMAIL);
        jsSetValue("owner-password", AppConfig.OWNER_PASSWORD);
        sleep(AppConfig.SHORT_WAIT_MS);

        jsClick("continue-pet-details");
        sleep(AppConfig.PAGE_LOAD_WAIT_SECS * 100L);  // 3s

        String currentPage = getCurrentPage();
        boolean onOnboarding = "onboarding".equals(currentPage);
        boolean onDashboard  = "dashboard".equals(currentPage);
        Assert.assertTrue(onOnboarding || onDashboard,
                "After valid login should go to onboarding or dashboard. Got: " + currentPage);
        log.info("✅ Successful login navigated to: {}", currentPage);
    }
}
