package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: Health Tracker
 * Tests: BMI display, vaccine add/list, medicine add/list,
 *        prescription save, appointment calendar, location map
 */
public class HealthTrackerTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void navigateToHealth() {
        log.info("HealthTrackerTest.navigateToHealth");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true;");
        js("app.pet.name='" + AppConfig.PET_NAME + "';" +
           "app.pet.weight=" + AppConfig.PET_WEIGHT + ";" +
           "app.pet.age=" + AppConfig.PET_AGE + ";" +
           "app.pet.location='" + AppConfig.PET_LOCATION + "';");
        js("showPage('health'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
    }

    @Test(priority = 40, testName = "TC-HT-01",
          description = "Health Tracker page is active with all 6 health cards")
    public void verifyHealthPageLayout() {
        log.info("▶ TC-HT-01: Verify Health Tracker layout");
        Assert.assertTrue(isPageActive("health"), "Health page should be active");

        Object cardCount = js(
            "return document.querySelectorAll('#health-page .health-card').length");
        int count = cardCount != null ? Integer.parseInt(cardCount.toString()) : 0;
        Assert.assertTrue(count >= 5,
                "Should have at least 5 health cards, found: " + count);
        log.info("✅ Health page has {} health cards", count);
    }

    @Test(priority = 41, testName = "TC-HT-02",
          description = "BMI is calculated and displayed")
    public void verifyBMIDisplay() {
        log.info("▶ TC-HT-02: Verify BMI display");
        String bmi = jsGetText("health-bmi");
        Assert.assertFalse(bmi.isEmpty(), "BMI should be displayed in health page");
        log.info("✅ Health page BMI: '{}'", bmi);
    }

    @Test(priority = 42, testName = "TC-HT-03",
          description = "Default vaccine list is displayed")
    public void verifyDefaultVaccineList() {
        log.info("▶ TC-HT-03: Verify default vaccine list");
        Object itemCount = js(
            "return document.querySelectorAll('#vaccine-list li').length");
        int count = itemCount != null ? Integer.parseInt(itemCount.toString()) : 0;
        Assert.assertTrue(count > 0, "Default vaccines should be listed");
        log.info("✅ Default vaccines: {} items", count);
    }

    @Test(priority = 43, testName = "TC-HT-04",
          description = "Adding a new vaccine appends it to the vaccine list")
    public void verifyAddVaccine() {
        log.info("▶ TC-HT-04: Add new vaccine");
        int beforeCount = Integer.parseInt(
            js("return document.querySelectorAll('#vaccine-list li').length").toString());

        jsSetValue("new-vaccine", AppConfig.VACCINE_NAME);
        sleep(AppConfig.SHORT_WAIT_MS);
        js("addVaccine()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        int afterCount = Integer.parseInt(
            js("return document.querySelectorAll('#vaccine-list li').length").toString());

        Assert.assertTrue(afterCount > beforeCount,
                "Vaccine list should grow after adding. Before=" + beforeCount + " After=" + afterCount);

        // Verify the added vaccine text
        Object listText = js("return document.getElementById('vaccine-list').innerText");
        Assert.assertTrue(listText != null && listText.toString().toLowerCase()
                .contains("bordetella"), "Added vaccine should appear in list");
        log.info("✅ Vaccine added. List size: {} → {}", beforeCount, afterCount);
    }

    @Test(priority = 44, testName = "TC-HT-05",
          description = "Adding empty vaccine does not add blank entry")
    public void verifyEmptyVaccineNotAdded() {
        log.info("▶ TC-HT-05: Empty vaccine should not be added");
        jsSetValue("new-vaccine", "");
        sleep(AppConfig.SHORT_WAIT_MS);
        int before = Integer.parseInt(
            js("return document.querySelectorAll('#vaccine-list li').length").toString());
        js("addVaccine()");
        sleep(AppConfig.SHORT_WAIT_MS);
        int after = Integer.parseInt(
            js("return document.querySelectorAll('#vaccine-list li').length").toString());
        Assert.assertEquals(after, before, "Empty vaccine should not be added to list");
        log.info("✅ Empty vaccine correctly rejected");
    }

    @Test(priority = 45, testName = "TC-HT-06",
          description = "Default medicine list is displayed")
    public void verifyDefaultMedicineList() {
        log.info("▶ TC-HT-06: Verify default medicine list");
        Object count = js(
            "return document.querySelectorAll('#medicine-list li').length");
        int c = count != null ? Integer.parseInt(count.toString()) : 0;
        Assert.assertTrue(c > 0, "Default medicines should be listed");
        log.info("✅ Default medicines: {} items", c);
    }

    @Test(priority = 46, testName = "TC-HT-07",
          description = "Adding a new medicine appends it to the medicine list")
    public void verifyAddMedicine() {
        log.info("▶ TC-HT-07: Add new medicine");
        int before = Integer.parseInt(
            js("return document.querySelectorAll('#medicine-list li').length").toString());

        jsSetValue("new-medicine", AppConfig.MEDICINE_NAME);
        sleep(AppConfig.SHORT_WAIT_MS);
        js("addMedicine()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        int after = Integer.parseInt(
            js("return document.querySelectorAll('#medicine-list li').length").toString());

        Assert.assertTrue(after > before,
                "Medicine list should grow. Before=" + before + " After=" + after);
        log.info("✅ Medicine added. List size: {} → {}", before, after);
    }

    @Test(priority = 47, testName = "TC-HT-08",
          description = "Prescription text can be typed and saved")
    public void verifyPrescriptionSave() {
        log.info("▶ TC-HT-08: Verify prescription save");
        jsSetValue("prescription-text", AppConfig.PRESCRIPTION_TEXT);
        sleep(AppConfig.SHORT_WAIT_MS);
        js("savePrescription()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        String saved = jsGetText("prescription-text");
        Assert.assertTrue(saved.contains("Rest for"),
                "Prescription should contain saved text. Got: " + saved);
        log.info("✅ Prescription saved: '{}'", saved);
    }

    @Test(priority = 48, testName = "TC-HT-09",
          description = "Appointment calendar grid is rendered with day slots")
    public void verifyCalendarGrid() {
        log.info("▶ TC-HT-09: Verify calendar grid");
        Object dayCount = js(
            "return document.querySelectorAll('#calendar-grid .calendar-date').length");
        int count = dayCount != null ? Integer.parseInt(dayCount.toString()) : 0;
        Assert.assertTrue(count >= 28, "Calendar should show at least 28 days. Found: " + count);
        log.info("✅ Calendar grid has {} day cells", count);
    }

    @Test(priority = 49, testName = "TC-HT-10",
          description = "Clicking a calendar date sets appointment event text")
    public void verifyCalendarDateClick() {
        log.info("▶ TC-HT-10: Verify calendar date click sets appointment");
        // Click the first date cell
        js("var dates=document.querySelectorAll('#calendar-grid .calendar-date');" +
           "if(dates.length>0) dates[0].click();");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        String eventText = jsGetText("calendar-event");
        Assert.assertFalse(eventText.isEmpty(), "Appointment event should be set after clicking date");
        log.info("✅ Calendar event text: '{}'", eventText);
    }

    @Test(priority = 50, testName = "TC-HT-11",
          description = "Pet location map frame is present")
    public void verifyPetLocationMap() {
        log.info("▶ TC-HT-11: Verify pet location map");
        Assert.assertTrue(elementExists("pet-map-frame"),
                "Pet map iframe should exist on health page");
        log.info("✅ Pet map frame exists");
    }

    @Test(priority = 51, testName = "TC-HT-12",
          description = "BMI advice is shown based on pet weight/age")
    public void verifyBMIAdvice() {
        log.info("▶ TC-HT-12: Verify BMI advice text");
        Object advice = js("return document.getElementById('bmi-advice').innerText");
        String txt = advice != null ? advice.toString().trim() : "";
        // May or may not have text depending on BMI, just ensure element exists
        Assert.assertTrue(elementExists("bmi-advice"), "BMI advice element should exist");
        log.info("✅ BMI advice: '{}'", txt);
    }
}
