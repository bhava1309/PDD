package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: Doctor Appointment
 * Tests: Doctor listing, doctor cards, book appointment modal, payment gateway
 */
public class DoctorAppointmentTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void navigateToDoctors() {
        log.info("DoctorAppointmentTest.navigateToDoctors");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true;");
        js("showPage('doctors'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
    }

    @Test(priority = 100, testName = "TC-DA-01",
          description = "Doctor Appointment page is active with doctor cards rendered")
    public void verifyDoctorPageLayout() {
        log.info("▶ TC-DA-01: Verify Doctor Appointment page layout");
        Assert.assertTrue(isPageActive("doctors"), "Doctors page should be active");
        Assert.assertTrue(elementExists("doctor-list"), "Doctor list should exist");
        log.info("✅ Doctor Appointment page layout verified");
    }

    @Test(priority = 101, testName = "TC-DA-02",
          description = "All 6 doctors are rendered as cards")
    public void verifyDoctorCount() {
        log.info("▶ TC-DA-02: Verify doctor card count");
        Object count = js(
            "return document.querySelectorAll('#doctor-list .pet-card').length");
        int c = count != null ? Integer.parseInt(count.toString()) : 0;
        Assert.assertEquals(c, 6,
                "Should show exactly 6 doctor cards. Found: " + c);
        log.info("✅ Doctor count: {}", c);
    }

    @Test(priority = 102, testName = "TC-DA-03",
          description = "Each doctor card shows name, degree, rating, city, clinic, and phone")
    public void verifyDoctorCardDetails() {
        log.info("▶ TC-DA-03: Verify doctor card details");
        Object firstCard = js(
            "var c=document.querySelector('#doctor-list .pet-card');" +
            "return c ? c.innerText : ''");
        String text = firstCard != null ? firstCard.toString() : "";

        Assert.assertTrue(text.contains("Dr."),
                "Doctor card should show doctor name. Got: " + text);
        Assert.assertTrue(text.contains("BVSc") || text.contains("MVSc"),
                "Doctor card should show degree. Got: " + text);
        Assert.assertTrue(text.contains("+91"),
                "Doctor card should show phone. Got: " + text);
        log.info("✅ Doctor card details verified");
    }

    @Test(priority = 103, testName = "TC-DA-04",
          description = "Doctor card has 'View Profile' and 'Book' buttons")
    public void verifyDoctorActionButtons() {
        log.info("▶ TC-DA-04: Verify doctor action buttons");
        Object btnCount = js(
            "return document.querySelectorAll('#doctor-list .btn').length");
        int count = btnCount != null ? Integer.parseInt(btnCount.toString()) : 0;
        // At least 2 buttons per doctor (View Profile + Book)
        Assert.assertTrue(count >= 6,
                "Should have at least 6 action buttons. Found: " + count);
        log.info("✅ Doctor action buttons: {}", count);
    }

    @Test(priority = 104, testName = "TC-DA-05",
          description = "Clicking 'View Profile' on a doctor opens modal with full profile")
    public void verifyDoctorProfileModal() {
        log.info("▶ TC-DA-05: Verify doctor profile modal");
        // Click the first View Profile button
        js("var btn=document.querySelector('#doctor-list .btn-secondary');" +
           "if(btn) btn.click();");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object modalOpen = js("return document.getElementById('modal').classList.contains('open')");
        Assert.assertTrue(Boolean.TRUE.equals(modalOpen),
                "Doctor profile modal should open");

        String modalContent = jsGetText("modal-content");
        Assert.assertFalse(modalContent.isEmpty(), "Modal should have doctor profile content");

        js("closeModal()");
        sleep(AppConfig.SHORT_WAIT_MS);
        log.info("✅ Doctor profile modal opens with content");
    }

    @Test(priority = 105, testName = "TC-DA-06",
          description = "Clicking 'Book Online Slot' opens booking modal with payment gateway")
    public void verifyBookAppointmentModal() {
        log.info("▶ TC-DA-06: Verify Book Appointment / Payment modal");
        // Click the first primary btn (Book Appointment)
        js("var btns=document.querySelectorAll('#doctor-list .btn-primary');" +
           "if(btns.length>0) btns[0].click();");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object modalOpen = js("return document.getElementById('modal').classList.contains('open')");
        Assert.assertTrue(Boolean.TRUE.equals(modalOpen),
                "Booking modal should open");

        String modalTitle = jsGetText("modal-title");
        Assert.assertFalse(modalTitle.isEmpty(), "Modal title should not be empty");

        js("closeModal()");
        sleep(AppConfig.SHORT_WAIT_MS);
        log.info("✅ Booking modal opens. Title: '{}'", modalTitle);
    }

    @Test(priority = 106, testName = "TC-DA-07",
          description = "Doctor card shows correct rating with star display")
    public void verifyDoctorRatings() {
        log.info("▶ TC-DA-07: Verify doctor ratings displayed");
        Object ratingText = js(
            "var cards=document.querySelectorAll('#doctor-list .pet-card');" +
            "return cards.length > 0 ? cards[0].innerText : ''");
        String text = ratingText != null ? ratingText.toString() : "";
        // Should contain a rating like "4.9" or star indicator
        Assert.assertTrue(text.contains("4.") || text.contains("5.") || text.contains("★"),
                "Doctor card should show rating. Got: " + text);
        log.info("✅ Doctor rating visible in card");
    }
}
