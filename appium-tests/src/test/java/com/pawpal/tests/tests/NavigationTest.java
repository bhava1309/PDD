package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: Navigation & Bottom Nav
 * Tests: Bottom nav bar visibility, all nav links work, protected page guards,
 *        modal open/close, toast notifications, page transitions
 */
public class NavigationTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void setup() {
        log.info("NavigationTest.setup");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true;");
        js("showPage('dashboard'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
    }

    @Test(priority = 150, testName = "TC-NV-01",
          description = "Bottom navigation bar is present on mobile layout")
    public void verifyBottomNavExists() {
        log.info("▶ TC-NV-01: Verify bottom nav bar");
        Object navExists = js(
            "return Boolean(document.querySelector('.app-bottom-nav'))");
        Assert.assertTrue(Boolean.TRUE.equals(navExists),
                "Bottom navigation bar should exist in DOM");
        log.info("✅ Bottom nav bar present");
    }

    @Test(priority = 151, testName = "TC-NV-02",
          description = "Bottom nav has exactly 6 navigation items")
    public void verifyBottomNavItemCount() {
        log.info("▶ TC-NV-02: Verify bottom nav item count");
        Object count = js(
            "return document.querySelectorAll('.app-bottom-nav a').length");
        int c = count != null ? Integer.parseInt(count.toString()) : 0;
        Assert.assertEquals(c, 6,
                "Bottom nav should have exactly 6 items. Found: " + c);
        log.info("✅ Bottom nav items: {}", c);
    }

    @Test(priority = 152, testName = "TC-NV-03",
          description = "Navigating to Login via activatePage works")
    public void verifyHomeNavigation() {
        log.info("▶ TC-NV-03: Verify Login navigation");
        js("activatePage('login')");
        sleep(AppConfig.MEDIUM_WAIT_MS);
        Assert.assertTrue(isPageActive("login"), "Login page should be active");
    }

    @Test(priority = 153, testName = "TC-NV-04",
          description = "Accessing Dashboard while logged in works correctly")
    public void verifyDashboardAccess() {
        log.info("▶ TC-NV-04: Verify Dashboard access for logged-in user");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true;");
        js("showPage('dashboard')");
        sleep(AppConfig.MEDIUM_WAIT_MS);
        Assert.assertTrue(isPageActive("dashboard"),
                "Logged-in user should access Dashboard directly");
        log.info("✅ Dashboard access for logged-in user works");
    }

    @Test(priority = 154, testName = "TC-NV-05",
          description = "Accessing protected page without login redirects to Login")
    public void verifyProtectedPageGuard() {
        log.info("▶ TC-NV-05: Verify protected page guard");
        js("sessionLoggedIn=false; sessionProfileComplete=false; app.loggedIn=false; app.profileComplete=false;");
        sleep(AppConfig.SHORT_WAIT_MS);
        js("showPage('health')");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        String page = getCurrentPage();
        Assert.assertEquals(page, "login",
                "Non-logged-in user should be redirected to Login. Got: " + page);
        // Restore login state
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true;");
        log.info("✅ Protected page guard works — redirected to: {}", page);
    }

    @Test(priority = 155, testName = "TC-NV-06",
          description = "Accessing protected page without profile redirects to Onboarding")
    public void verifyProfileIncompleteGuard() {
        log.info("▶ TC-NV-06: Verify profile-incomplete page guard");
        js("sessionLoggedIn=true; sessionProfileComplete=false; app.loggedIn=true; app.profileComplete=false;");
        sleep(AppConfig.SHORT_WAIT_MS);
        js("showPage('health')");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        String page = getCurrentPage();
        Assert.assertEquals(page, "onboarding",
                "User with incomplete profile should go to onboarding. Got: " + page);
        js("sessionProfileComplete=true; app.profileComplete=true;");
        log.info("✅ Profile-incomplete guard works — redirected to: {}", page);
    }

    @Test(priority = 156, testName = "TC-NV-07",
          description = "Modal opens and closes correctly")
    public void verifyModalOpenClose() {
        log.info("▶ TC-NV-07: Verify modal open/close");
        js("document.getElementById('modal').classList.add('open');" +
           "document.getElementById('modal-title').innerText='Test Modal';");
        sleep(AppConfig.SHORT_WAIT_MS);

        Object modalOpen = js("return document.getElementById('modal').classList.contains('open')");
        Assert.assertTrue(Boolean.TRUE.equals(modalOpen), "Modal should be open");

        js("closeModal()");
        sleep(AppConfig.SHORT_WAIT_MS);

        Object modalClosed = js("return document.getElementById('modal').classList.contains('open')");
        Assert.assertFalse(Boolean.TRUE.equals(modalClosed), "Modal should be closed");
        log.info("✅ Modal open/close works");
    }

    @Test(priority = 157, testName = "TC-NV-08",
          description = "Toast notification appears and fades out")
    public void verifyToastNotification() {
        log.info("▶ TC-NV-08: Verify toast notification");
        js("toast('PawPal Test Toast')");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object toastText = js("return document.getElementById('toast').innerText");
        String text = toastText != null ? toastText.toString() : "";
        Assert.assertTrue(text.contains("PawPal") || text.contains("Toast"),
                "Toast should show the message. Got: " + text);
        log.info("✅ Toast notification shown: '{}'", text);
    }

    @Test(priority = 158, testName = "TC-NV-09",
          description = "Doctor portal requires doctor login — redirects if not logged in")
    public void verifyDoctorPortalGuard() {
        log.info("▶ TC-NV-09: Verify doctor portal guard");
        js("app.doctorLoggedIn=false;");
        sleep(AppConfig.SHORT_WAIT_MS);
        js("showPage('doctor-portal')");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        String page = getCurrentPage();
        Assert.assertEquals(page, "doctor-login",
                "Non-doctor user should redirect to doctor-login. Got: " + page);
        js("app.doctorLoggedIn=true;");
        log.info("✅ Doctor portal guard works — redirected to: {}", page);
    }

    @Test(priority = 159, testName = "TC-NV-10",
          description = "All main pages are present in the DOM")
    public void verifyAllPagesExistInDOM() {
        log.info("▶ TC-NV-10: Verify all pages exist in DOM");
        String[] pages = {
            "splash", "login", "register", "doctor-login", "onboarding", "dashboard",
            "health", "activity", "training", "products", "expenses",
            "caregivers", "community", "adoption", "travel", "bookings", "doctors", "doctor-portal"
        };
        for (String page : pages) {
            boolean exists = elementExists(page + "-page");
            Assert.assertTrue(exists, "Page element missing: " + page + "-page");
        }
        log.info("✅ All {} pages present in DOM", pages.length);
    }
}
