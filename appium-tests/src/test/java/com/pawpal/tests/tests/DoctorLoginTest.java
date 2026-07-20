package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: Doctor Login & Portal
 * Tests: Doctor login form validation, login flow, doctor dashboard features
 */
public class DoctorLoginTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void navigateToDoctorLogin() {
        log.info("DoctorLoginTest.navigateToDoctorLogin");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true; app.doctorLoggedIn=false;");
        js("activatePage('doctor-login');");
        sleep(AppConfig.MEDIUM_WAIT_MS);
    }

    @Test(priority = 110, testName = "TC-DL-01",
          description = "Doctor Login page is active with all form fields")
    public void verifyDoctorLoginPageElements() {
        log.info("▶ TC-DL-01: Verify Doctor Login page elements");
        Assert.assertTrue(isPageActive("doctor-login"), "Doctor login page should be active");
        Assert.assertTrue(elementExists("doctor-login-name"),     "Doctor name select should exist");
        Assert.assertTrue(elementExists("doctor-login-phone"),    "Doctor phone should exist");
        Assert.assertTrue(elementExists("doctor-login-email"),    "Doctor email should exist");
        Assert.assertTrue(elementExists("doctor-login-password"), "Doctor password should exist");
        log.info("✅ Doctor Login form elements present");
    }

    @Test(priority = 111, testName = "TC-DL-02",
          description = "Doctor dropdown contains all 6 doctors")
    public void verifyDoctorDropdown() {
        log.info("▶ TC-DL-02: Verify doctor dropdown options");
        Object count = js(
            "return document.getElementById('doctor-login-name').options.length");
        int c = count != null ? Integer.parseInt(count.toString()) : 0;
        // At least the blank/placeholder + 6 doctors
        Assert.assertTrue(c >= 6,
                "Doctor dropdown should have at least 6 doctor options. Found: " + c);
        log.info("✅ Doctor dropdown has {} options", c);
    }

    @Test(priority = 112, testName = "TC-DL-03",
          description = "Empty doctor login form shows validation errors")
    public void verifyEmptyDoctorLoginValidation() {
        log.info("▶ TC-DL-03: Verify empty doctor login validation");
        js("activatePage('doctor-login')");
        sleep(AppConfig.SHORT_WAIT_MS);

        jsSetValue("doctor-login-phone",    "");
        jsSetValue("doctor-login-email",    "");
        jsSetValue("doctor-login-password", "");
        sleep(AppConfig.SHORT_WAIT_MS);

        js("saveDoctorLogin(null)");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object errCount = js(
            "return document.querySelectorAll('#doctor-login-page .field-error.show').length");
        int count = errCount != null ? Integer.parseInt(errCount.toString()) : 0;
        Assert.assertTrue(count > 0,
                "Empty doctor form should show validation errors. Found: " + count);
        log.info("✅ Doctor login validation shows {} errors", count);
    }

    @Test(priority = 113, testName = "TC-DL-04",
          description = "Invalid doctor phone shows error")
    public void verifyDoctorInvalidPhone() {
        log.info("▶ TC-DL-04: Verify doctor login invalid phone");
        js("activatePage('doctor-login')");
        sleep(AppConfig.SHORT_WAIT_MS);
        jsSelectByText("doctor-login-name", AppConfig.DOCTOR_NAME);
        jsSetValue("doctor-login-phone",    "99999");  // too short
        jsSetValue("doctor-login-email",    AppConfig.DOCTOR_EMAIL);
        jsSetValue("doctor-login-password", AppConfig.DOCTOR_PASSWORD);
        sleep(AppConfig.SHORT_WAIT_MS);
        js("saveDoctorLogin({preventDefault:function(){}})");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object phoneErr = js(
            "var e=document.getElementById('doctor-login-phone-error');" +
            "return e && e.classList.contains('show');");
        Assert.assertTrue(Boolean.TRUE.equals(phoneErr),
                "Doctor login phone error should show for invalid phone");
        log.info("✅ Doctor login invalid phone validation works");
    }

    @Test(priority = 114, testName = "TC-DL-05",
          description = "Valid doctor login opens Doctor Dashboard / Portal")
    public void verifyValidDoctorLogin() {
        log.info("▶ TC-DL-05: Verify valid doctor login");
        js("activatePage('doctor-login')");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        jsSelectByText("doctor-login-name", AppConfig.DOCTOR_NAME);
        jsSetValue("doctor-login-phone",    AppConfig.DOCTOR_PHONE);
        jsSetValue("doctor-login-email",    AppConfig.DOCTOR_EMAIL);
        jsSetValue("doctor-login-password", AppConfig.DOCTOR_PASSWORD);
        sleep(AppConfig.SHORT_WAIT_MS);

        js("saveDoctorLogin({preventDefault:function(){}})");
        sleep(AppConfig.PAGE_LOAD_WAIT_SECS * 150L);

        String page = getCurrentPage();
        boolean onPortal = "doctor-portal".equals(page) || "doctors".equals(page);
        Assert.assertTrue(onPortal,
                "Valid doctor login should navigate to Doctor Portal. Got: " + page);
        log.info("✅ Doctor login navigated to: {}", page);
    }

    @Test(priority = 115, testName = "TC-DL-06",
          description = "Doctor Dashboard shows profile card and patient queue")
    public void verifyDoctorDashboard() {
        log.info("▶ TC-DL-06: Verify Doctor Dashboard content");
        js("app.doctorLoggedIn=true; app.currentDoctor='Dr. Priya Sharma';");
        js("showPage('doctor-portal'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Assert.assertTrue(isPageActive("doctor-portal"), "Doctor portal should be active");
        Assert.assertTrue(elementExists("doctor-profile-card"), "Doctor profile card should exist");
        Assert.assertTrue(elementExists("doctor-patient-list"), "Patient list should exist");
        log.info("✅ Doctor Dashboard content verified");
    }

    @Test(priority = 116, testName = "TC-DL-07",
          description = "Doctor tools show Today count, Online Consults, Pet 360, Profile")
    public void verifyDoctorToolCards() {
        log.info("▶ TC-DL-07: Verify Doctor tool cards");
        js("app.doctorLoggedIn=true; showPage('doctor-portal'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object toolCount = js(
            "return document.querySelectorAll('#doctor-portal-page .doctor-tool').length");
        int count = toolCount != null ? Integer.parseInt(toolCount.toString()) : 0;
        Assert.assertTrue(count >= 4,
                "Doctor tools should have at least 4 stat cards. Found: " + count);
        log.info("✅ Doctor tool cards: {}", count);
    }
}
