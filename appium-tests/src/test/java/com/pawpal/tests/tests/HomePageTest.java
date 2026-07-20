package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * TC Module: App Launch
 * Tests the Android app's login-first launch experience.
 */
public class HomePageTest extends BaseTest {

    @Test(priority = 1, testName = "TC-HP-01",
          description = "Verify app launches and login page is displayed")
    public void verifyAppLaunchAndHomePage() {
        log.info("▶ TC-HP-01: Verify app launches and login page is displayed");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Assert.assertTrue(isPageActive("login"),
                "Login page should be active on app launch. Current page: " + getCurrentPage());
    }

    @Test(priority = 2, testName = "TC-HP-02",
          description = "Verify login heading is present")
    public void verifyHeroHeading() {
        log.info("▶ TC-HP-02: Verify hero section heading");
        Object heading = js("var h=document.querySelector('#login-page h2');" +
                "return h ? h.innerText : ''");
        String text = heading != null ? heading.toString() : "";
        Assert.assertFalse(text.isEmpty(), "Hero h1 should not be empty");
        Assert.assertTrue(text.toLowerCase().contains("login"),
                "Heading should identify the login page. Got: " + text);
        log.info("✅ Hero heading: '{}'", text);
    }

    @Test(priority = 3, testName = "TC-HP-03",
          description = "Verify Continue to Pet Details button exists")
    public void verifyGetStartedButton() {
        log.info("▶ TC-HP-03: Verify Get Started button");
        Object btnCount = js(
                "return document.querySelectorAll('#continue-pet-details').length");
        int count = btnCount != null ? Integer.parseInt(btnCount.toString()) : 0;
        Assert.assertTrue(count > 0, "Continue button should be present");
        log.info("✅ Get Started button found (count={})", count);
    }

    @Test(priority = 4, testName = "TC-HP-04",
          description = "Verify app logo/brand is displayed")
    public void verifyBrandLogo() {
        log.info("▶ TC-HP-04: Verify PawPal brand logo");
        Object logoExists = js(
                "return Boolean(document.querySelector('.brand-logo'))");
        Assert.assertTrue(Boolean.TRUE.equals(logoExists), "PawPal logo should be present");
        log.info("✅ Brand logo present");
    }

    @Test(priority = 5, testName = "TC-HP-05",
          description = "Verify navigation links are rendered")
    public void verifyNavLinks() {
        log.info("▶ TC-HP-05: Verify navigation links");
        Object navCount = js(
                "return document.querySelectorAll('.nav-links a').length");
        int count = navCount != null ? Integer.parseInt(navCount.toString()) : 0;
        Assert.assertTrue(count >= 6,
                "Should have at least 6 nav links, found: " + count);
        log.info("✅ Nav links count: {}", count);
    }

    @Test(priority = 6, testName = "TC-HP-06",
          description = "Register New User opens the separate registration page")
    public void verifyGetStartedNavigation() {
        log.info("▶ TC-HP-06: Open separate registration page");
        js("activatePage('login')");
        sleep(AppConfig.MEDIUM_WAIT_MS);
        js("showRegisterForm(null)");
        sleep(AppConfig.MEDIUM_WAIT_MS);
        Assert.assertTrue(isPageActive("register"),
                "Register New User should open registration. Current: " + getCurrentPage());
        js("showLoginForm(null)");
    }
}
