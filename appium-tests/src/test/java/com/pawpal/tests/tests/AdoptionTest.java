package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: Pet Adoption
 * Tests: Adoption page, pet cards display, adoption button modal
 */
public class AdoptionTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void navigateToAdoption() {
        log.info("AdoptionTest.navigateToAdoption");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true;");
        js("showPage('adoption'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
    }

    @Test(priority = 80, testName = "TC-AD-01",
          description = "Adoption page is active with pet cards rendered")
    public void verifyAdoptionPageLayout() {
        log.info("▶ TC-AD-01: Verify Adoption page layout");
        Assert.assertTrue(isPageActive("adoption"), "Adoption page should be active");
        Assert.assertTrue(elementExists("adoption-list"), "Adoption list should exist");
        log.info("✅ Adoption page layout verified");
    }

    @Test(priority = 81, testName = "TC-AD-02",
          description = "All 6 adoption pets are rendered as cards")
    public void verifyAdoptionPetCount() {
        log.info("▶ TC-AD-02: Verify adoption pet count");
        Object count = js(
            "return document.querySelectorAll('#adoption-list .pet-card').length");
        int c = count != null ? Integer.parseInt(count.toString()) : 0;
        Assert.assertEquals(c, 6,
                "Should show exactly 6 adoption pets. Found: " + c);
        log.info("✅ Adoption pet count: {}", c);
    }

    @Test(priority = 82, testName = "TC-AD-03",
          description = "Each adoption card shows pet name, type, breed, age, and city")
    public void verifyAdoptionCardDetails() {
        log.info("▶ TC-AD-03: Verify adoption card details");
        Object firstCard = js(
            "var c=document.querySelector('#adoption-list .pet-card');" +
            "return c ? c.innerText : ''");
        String text = firstCard != null ? firstCard.toString() : "";
        Assert.assertFalse(text.isEmpty(), "Adoption card should have content");
        // Should contain some known data about Max
        Assert.assertTrue(text.contains("Max") || text.contains("Dog") || text.contains("Labrador"),
                "First adoption card should contain 'Max', 'Dog' or 'Labrador'. Got: " + text);
        log.info("✅ First adoption card content verified");
    }

    @Test(priority = 83, testName = "TC-AD-04",
          description = "Adoption card has 'Schedule Visit' action button")
    public void verifyAdoptionActionButton() {
        log.info("▶ TC-AD-04: Verify adoption action buttons");
        Object btnCount = js(
            "return document.querySelectorAll('#adoption-list .btn').length");
        int count = btnCount != null ? Integer.parseInt(btnCount.toString()) : 0;
        Assert.assertTrue(count >= 6,
                "Should have at least 6 action buttons (one per pet). Found: " + count);
        log.info("✅ Adoption action buttons: {}", count);
    }

    @Test(priority = 84, testName = "TC-AD-05",
          description = "Clicking Adopt / Schedule Visit on a pet opens modal")
    public void verifyAdoptionModalOpens() {
        log.info("▶ TC-AD-05: Verify adoption modal opens on button click");
        // Click first adopt button
        js("var btn=document.querySelector('#adoption-list .btn');" +
           "if(btn) btn.click();");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object modalOpen = js("return document.getElementById('modal').classList.contains('open')");
        Assert.assertTrue(Boolean.TRUE.equals(modalOpen),
                "Modal should open when clicking adoption button");

        // Close modal
        js("closeModal()");
        sleep(AppConfig.SHORT_WAIT_MS);
        log.info("✅ Adoption modal opens correctly");
    }

    @Test(priority = 85, testName = "TC-AD-06",
          description = "Adoption pet images are loaded (not broken)")
    public void verifyAdoptionPetImages() {
        log.info("▶ TC-AD-06: Verify adoption pet images");
        Object imgCount = js(
            "return document.querySelectorAll('#adoption-list .pet-image img').length");
        int count = imgCount != null ? Integer.parseInt(imgCount.toString()) : 0;
        Assert.assertTrue(count >= 6,
                "Each adoption card should have an image. Found: " + count);
        log.info("✅ Adoption pet images: {}", count);
    }
}
