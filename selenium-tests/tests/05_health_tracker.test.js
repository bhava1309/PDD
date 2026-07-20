/**
 * TEST SUITE 05 — Health Tracker Page
 * Covers: BMI display, vaccine list, medicine list, prescription, calendar, map
 */

const { buildDriver, runTest, waitForElement, elementExists, navigateToPage, loginAsUser, By, until, CONFIG } = require('../utils/driver');

const SUITE = 'Health Tracker';

async function runSuite() {
  const driver = await buildDriver();
  const results = [];

  console.log(`\n❤️  Running Suite: ${SUITE}`);
  console.log('─'.repeat(50));

  try {
    await driver.get(CONFIG.BASE_URL);
    await driver.sleep(400);
    await loginAsUser(driver);
    await driver.executeScript("activatePage('health'); renderAll();");
    await driver.sleep(600);

    // ─── TC-05-01: Health page visible ────────────────────────────────────────
    results.push(await runTest(driver, 'Health Tracker page is visible', SUITE, async () => {
      const page = await driver.findElement(By.id('health-page'));
      const classes = await page.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Health page is not active');
    }));

    // ─── TC-05-02: Health page title ──────────────────────────────────────────
    results.push(await runTest(driver, 'Health Tracker h2 heading is present', SUITE, async () => {
      const heading = await waitForElement(driver, By.css('#health-page h2'));
      const text = await heading.getText();
      if (!text.includes('Health')) throw new Error(`Health heading wrong: "${text}"`);
    }));

    // ─── TC-05-03: BMI card visible ───────────────────────────────────────────
    results.push(await runTest(driver, 'BMI health card is visible', SUITE, async () => {
      const bmiCard = await waitForElement(driver, By.id('health-bmi'));
      const displayed = await bmiCard.isDisplayed();
      if (!displayed) throw new Error('BMI stat not visible in health tracker');
    }));

    // ─── TC-05-04: BMI value populated ───────────────────────────────────────
    results.push(await runTest(driver, 'BMI value is populated with data', SUITE, async () => {
      const bmiEl = await driver.findElement(By.id('health-bmi'));
      const text = await bmiEl.getText();
      if (!text || text.length === 0) throw new Error('BMI value is empty');
    }));

    // ─── TC-05-05: BMI advice visible ────────────────────────────────────────
    results.push(await runTest(driver, 'BMI advice paragraph is displayed', SUITE, async () => {
      const advice = await waitForElement(driver, By.id('bmi-advice'));
      // Wait for JS to populate
      await driver.sleep(600);
      const displayed = await advice.isDisplayed();
      if (!displayed) throw new Error('BMI advice not visible');
    }));

    // ─── TC-05-06: Vaccine list visible ───────────────────────────────────────
    results.push(await runTest(driver, 'Vaccine list section is present', SUITE, async () => {
      const vaccineList = await waitForElement(driver, By.id('vaccine-list'));
      const displayed = await vaccineList.isDisplayed();
      if (!displayed) throw new Error('Vaccine list is not visible');
    }));

    // ─── TC-05-07: Vaccine input field present ────────────────────────────────
    results.push(await runTest(driver, 'Add Vaccine input field is present', SUITE, async () => {
      const input = await waitForElement(driver, By.id('new-vaccine'));
      const placeholder = await input.getAttribute('placeholder');
      if (!placeholder.includes('Vaccine')) throw new Error(`Wrong placeholder: "${placeholder}"`);
    }));

    // ─── TC-05-08: Add vaccine functionality ──────────────────────────────────
    results.push(await runTest(driver, 'Can add a new vaccine to the list', SUITE, async () => {
      const vaccineInput = await driver.findElement(By.id('new-vaccine'));
      await vaccineInput.clear();
      await vaccineInput.sendKeys('Bordetella - Jun 2026');

      const addBtn = await driver.findElement(By.xpath("//button[contains(text(),'Add Vaccine')]"));
      await driver.executeScript('arguments[0].click();', addBtn);
      await driver.sleep(400);

      const vaccineList = await driver.findElement(By.id('vaccine-list'));
      const items = await vaccineList.findElements(By.css('li'));
      if (items.length === 0) throw new Error('No vaccines in list after adding');
    }));

    // ─── TC-05-09: Medicine list present ─────────────────────────────────────
    results.push(await runTest(driver, 'Medicine list section is present', SUITE, async () => {
      const medList = await waitForElement(driver, By.id('medicine-list'));
      const displayed = await medList.isDisplayed();
      if (!displayed) throw new Error('Medicine list is not visible');
    }));

    // ─── TC-05-10: Add medicine functionality ─────────────────────────────────
    results.push(await runTest(driver, 'Can add a new medicine to the list', SUITE, async () => {
      const medInput = await driver.findElement(By.id('new-medicine'));
      await medInput.clear();
      await medInput.sendKeys('Doxycycline - 100mg daily');

      const addBtn = await driver.findElement(By.xpath("//button[contains(text(),'Add Medicine')]"));
      await driver.executeScript('arguments[0].click();', addBtn);
      await driver.sleep(400);

      const medList = await driver.findElement(By.id('medicine-list'));
      const items = await medList.findElements(By.css('li'));
      if (items.length === 0) throw new Error('No medicines in list after adding');
    }));

    // ─── TC-05-11: Prescription textarea present ──────────────────────────────
    results.push(await runTest(driver, 'Prescription textarea is present', SUITE, async () => {
      const textarea = await waitForElement(driver, By.id('prescription-text'));
      const displayed = await textarea.isDisplayed();
      if (!displayed) throw new Error('Prescription textarea not visible');
    }));

    // ─── TC-05-12: Can type prescription ─────────────────────────────────────
    results.push(await runTest(driver, 'Can type in prescription notes field', SUITE, async () => {
      const textarea = await driver.findElement(By.id('prescription-text'));
      await textarea.clear();
      await textarea.sendKeys('Dr. Priya Sharma - Omega-3 supplementation recommended. Follow-up in 30 days.');
      const val = await textarea.getAttribute('value');
      if (!val.includes('Omega')) throw new Error('Prescription text not saved in textarea');
    }));

    // ─── TC-05-13: Save prescription button ──────────────────────────────────
    results.push(await runTest(driver, 'Save Prescription button is present and clickable', SUITE, async () => {
      const saveBtn = await driver.findElement(By.xpath("//button[contains(text(),'Save Prescription')]"));
      const displayed = await saveBtn.isDisplayed();
      if (!displayed) throw new Error('Save Prescription button not visible');
      await driver.executeScript('arguments[0].click();', saveBtn);
      await driver.sleep(300);
    }));

    // ─── TC-05-14: Appointment calendar visible ───────────────────────────────
    results.push(await runTest(driver, 'Appointment calendar grid is displayed', SUITE, async () => {
      const calendar = await waitForElement(driver, By.id('calendar-grid'));
      const displayed = await calendar.isDisplayed();
      if (!displayed) throw new Error('Calendar grid not visible');
    }));

    // ─── TC-05-15: Calendar has day cells ─────────────────────────────────────
    results.push(await runTest(driver, 'Calendar contains date cells', SUITE, async () => {
      const dates = await driver.findElements(By.css('.calendar-date'));
      if (dates.length < 7) throw new Error(`Too few calendar dates: ${dates.length}`);
    }));

    // ─── TC-05-16: Calendar click schedules appointment ──────────────────────
    results.push(await runTest(driver, 'Clicking a calendar date updates appointment event text', SUITE, async () => {
      const dates = await driver.findElements(By.css('.calendar-date'));
      if (dates.length > 0) {
        await driver.executeScript('arguments[0].click();', dates[5]);
        await driver.sleep(400);
        const eventEl = await driver.findElement(By.id('calendar-event'));
        const text = await eventEl.getText();
        // text should have changed from default
        if (!text || text.length === 0) throw new Error('Calendar event text is empty after click');
      }
    }));

    // ─── TC-05-17: Pet location map visible ───────────────────────────────────
    results.push(await runTest(driver, 'Pet location map section is visible', SUITE, async () => {
      const mapBox = await waitForElement(driver, By.css('#health-page .map-box'));
      const displayed = await mapBox.isDisplayed();
      if (!displayed) throw new Error('Map box is not visible');
    }));

    // ─── TC-05-18: Edit Pet Profile button present ───────────────────────────
    results.push(await runTest(driver, 'Edit Pet Profile button is present in BMI card', SUITE, async () => {
      const editBtn = await waitForElement(driver, By.xpath("//button[contains(text(),'Edit Pet Profile')]"));
      const text = await editBtn.getText();
      if (!text.includes('Edit')) throw new Error(`Wrong button text: "${text}"`);
    }));

  } finally {
    await driver.quit();
  }

  return results;
}

if (require.main === module) {
  runSuite().then(results => {
    const pass = results.filter(r => r.status === 'PASS').length;
    console.log(`\n📊 ${SUITE}: ${pass}/${results.length} passed`);
  }).catch(console.error);
}

module.exports = { runSuite, SUITE };
