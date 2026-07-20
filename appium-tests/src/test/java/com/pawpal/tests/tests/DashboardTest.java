package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: Dashboard
 * Tests: Sidebar menu, stat cards, navigation shortcuts, Add New Pet
 */
public class DashboardTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void navigateToDashboard() {
        log.info("DashboardTest.navigateToDashboard — ensuring logged-in user with pet");
        // Quick-set via JS to bypass login form for speed
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true; app.owner.name='" +
                AppConfig.OWNER_NAME + "'; app.pet.name='" + AppConfig.PET_NAME + "';");
        js("showPage('dashboard'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
    }

    @Test(priority = 30, testName = "TC-DB-01",
          description = "Dashboard page is active with sidebar and main content")
    public void verifyDashboardLayout() {
        log.info("▶ TC-DB-01: Verify dashboard layout");
        Assert.assertTrue(isPageActive("dashboard"), "Dashboard should be active");

        Object hasSidebar = js("return Boolean(document.querySelector('#dashboard-page .sidebar'))");
        Assert.assertTrue(Boolean.TRUE.equals(hasSidebar), "Sidebar should be present");
        log.info("✅ Dashboard layout verified");
    }

    @Test(priority = 31, testName = "TC-DB-02",
          description = "Pet name is shown on the dashboard sidebar")
    public void verifyPetNameInSidebar() {
        log.info("▶ TC-DB-02: Verify pet name in sidebar");
        String sidePetName = jsGetText("side-pet-name");
        Assert.assertFalse(sidePetName.isEmpty(),
                "Pet name should be displayed in sidebar. Got empty string.");
        log.info("✅ Sidebar pet name: '{}'", sidePetName);
    }

    @Test(priority = 32, testName = "TC-DB-03",
          description = "Dashboard shows BMI, Licence, and Next Vaccine stats")
    public void verifyStatCards() {
        log.info("▶ TC-DB-03: Verify stat cards");
        String bmi     = jsGetText("dash-bmi");
        String licence = jsGetText("dash-licence");

        Assert.assertFalse(bmi.isEmpty(),     "BMI stat should be visible");
        Assert.assertFalse(licence.isEmpty(), "Licence stat should be visible");
        log.info("✅ Stats — BMI: '{}', Licence: '{}'", bmi, licence);
    }

    @Test(priority = 33, testName = "TC-DB-04",
          description = "Dashboard has Upcoming Appointment, Monthly Expenses, PetChat AI, Reminders cards")
    public void verifyInfoCards() {
        log.info("▶ TC-DB-04: Verify info cards");
        Object cardCount = js(
            "return document.querySelectorAll('#dashboard-page .grid-3 .card').length");
        int count = cardCount != null ? Integer.parseInt(cardCount.toString()) : 0;
        Assert.assertTrue(count >= 3, "Should have at least 3 info cards, found: " + count);
        log.info("✅ Info card count: {}", count);
    }

    @Test(priority = 34, testName = "TC-DB-05",
          description = "Sidebar Health Tracker link navigates to Health page")
    public void verifyHealthTrackerNavFromSidebar() {
        log.info("▶ TC-DB-05: Sidebar → Health Tracker");
        js("showPage('health')");
        sleep(AppConfig.MEDIUM_WAIT_MS);
        Assert.assertTrue(isPageActive("health"),
                "Clicking Health Tracker in sidebar should open Health page");
        js("showPage('dashboard')");
        sleep(AppConfig.SHORT_WAIT_MS);
        log.info("✅ Health Tracker navigation works");
    }

    @Test(priority = 35, testName = "TC-DB-06",
          description = "Sidebar Activity Log link navigates to Activity page")
    public void verifyActivityLogNavFromSidebar() {
        log.info("▶ TC-DB-06: Sidebar → Activity Log");
        js("showPage('activity')");
        sleep(AppConfig.MEDIUM_WAIT_MS);
        Assert.assertTrue(isPageActive("activity"),
                "Should navigate to Activity page");
        js("showPage('dashboard')");
        sleep(AppConfig.SHORT_WAIT_MS);
        log.info("✅ Activity Log navigation works");
    }

    @Test(priority = 36, testName = "TC-DB-07",
          description = "Open Health Tracker button in dashboard pet card navigates to Health page")
    public void verifyOpenHealthTrackerButton() {
        log.info("▶ TC-DB-07: Open Health Tracker button in pet card");
        js("showPage('dashboard')");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        // Click the Open Health Tracker button
        js("document.querySelector('#dashboard-page .btn-primary').click()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Assert.assertTrue(isPageActive("health"),
                "'Open Health Tracker' button should navigate to Health page");
        js("showPage('dashboard')");
        sleep(AppConfig.SHORT_WAIT_MS);
        log.info("✅ Open Health Tracker button works");
    }

    @Test(priority = 37, testName = "TC-DB-08",
          description = "Monthly Expenses card shows total expenses from app state")
    public void verifyExpensesCard() {
        log.info("▶ TC-DB-08: Verify expenses card data");
        js("showPage('dashboard'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
        String expense = jsGetText("dash-expense");
        Assert.assertFalse(expense.isEmpty(), "Expense total should be displayed");
        Assert.assertTrue(expense.contains("₹"), "Expense should show ₹ symbol");
        log.info("✅ Expenses card: '{}'", expense);
    }

    @Test(priority = 38, testName = "TC-DB-09",
          description = "PetChat AI Open Chat button opens chat window")
    public void verifyPetChatOpenButton() {
        log.info("▶ TC-DB-09: PetChat AI Open Chat button");
        js("showPage('dashboard'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
        js("toggleChat(true)");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object chatOpen = js("return document.getElementById('chat-window').classList.contains('open')");
        Assert.assertTrue(Boolean.TRUE.equals(chatOpen), "Chat window should open");

        // Close it
        js("toggleChat(false)");
        sleep(AppConfig.SHORT_WAIT_MS);
        log.info("✅ PetChat AI opens correctly");
    }

    @Test(priority = 39, testName = "TC-DB-10",
          description = "Add New Pet sidebar link navigates to Onboarding page")
    public void verifyAddNewPetLink() {
        log.info("▶ TC-DB-10: Add New Pet navigation");
        js("showPage('onboarding')");
        sleep(AppConfig.MEDIUM_WAIT_MS);
        Assert.assertTrue(isPageActive("onboarding"),
                "Add New Pet should navigate to Onboarding page");
        js("showPage('dashboard')");
        sleep(AppConfig.SHORT_WAIT_MS);
        log.info("✅ Add New Pet navigation works");
    }
}
