package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/** End-to-end checks for the separate New User registration page. */
public class RegistrationTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void openLoginPage() {
        navigateTo("login");
    }

    @Test(priority = 16, testName = "TC-RG-01",
          description = "Register New User opens a separate registration page")
    public void verifySeparateRegistrationPage() {
        js("showRegisterForm(null)");
        sleep(AppConfig.SHORT_WAIT_MS);
        Assert.assertTrue(isPageActive("register"), "Registration page should be active");
        Assert.assertFalse(isPageActive("login"), "Login page should not remain active");
    }

    @Test(priority = 17, testName = "TC-RG-02",
          description = "Registration page contains email, password and confirm password fields")
    public void verifyRegistrationFields() {
        Assert.assertTrue(elementExists("register-owner-email"));
        Assert.assertTrue(elementExists("register-owner-password"));
        Assert.assertTrue(elementExists("register-confirm-password"));
    }

    @Test(priority = 18, testName = "TC-RG-03",
          description = "Invalid registration values remain on the registration page")
    public void verifyRegistrationValidation() {
        jsSetValue("register-owner-email", "invalid-email");
        jsSetValue("register-owner-password", "123");
        jsSetValue("register-confirm-password", "456");
        js("registerNewUser(null)");
        sleep(AppConfig.SHORT_WAIT_MS);
        Assert.assertTrue(isPageActive("register"));
        Assert.assertTrue(jsGetText("register-message").toLowerCase().contains("correct"));
    }

    @Test(priority = 19, testName = "TC-RG-04",
          description = "Mismatched passwords are rejected")
    public void verifyPasswordMismatchValidation() {
        jsSetValue("register-owner-email", "newuser@gmail.com");
        jsSetValue("register-owner-password", "Register@123");
        jsSetValue("register-confirm-password", "Different@123");
        js("registerNewUser(null)");
        sleep(AppConfig.SHORT_WAIT_MS);
        Object visible = js("return document.getElementById('register-confirm-password-error')" +
                ".classList.contains('show')");
        Assert.assertEquals(visible, Boolean.TRUE);
    }

    @Test(priority = 20, testName = "TC-RG-05",
          description = "Valid registration returns to login with the new credentials filled")
    public void verifySuccessfulRegistrationReturnsToLogin() {
        String email = "newuser@gmail.com";
        String password = "Register@123";
        jsSetValue("register-owner-email", email);
        jsSetValue("register-owner-password", password);
        jsSetValue("register-confirm-password", password);
        js("registerNewUser(null)");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Assert.assertTrue(isPageActive("login"), "Successful registration should return to login");
        Assert.assertEquals(jsGetText("owner-email"), email);
        Assert.assertEquals(jsGetText("owner-password"), password);
    }

    @Test(priority = 21, testName = "TC-RG-06",
          description = "Registered account is saved in local app storage")
    public void verifyRegisteredAccountPersistence() {
        Object saved = js("return localStorage.getItem('pawpal.registeredUser')");
        Assert.assertNotNull(saved, "Registered account should be stored");
        Assert.assertTrue(saved.toString().contains("newuser@gmail.com"));
    }
}
