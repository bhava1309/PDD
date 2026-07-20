/**
 * TEST SUITE 06 — Activity Log
 * Covers: activity log page, log form, history display
 */

const { buildDriver, runTest, waitForElement, loginAsUser, By, until, CONFIG } = require('../utils/driver');

const SUITE = 'Activity Log';

async function runSuite() {
  const driver = await buildDriver();
  const results = [];

  console.log(`\n🏃 Running Suite: ${SUITE}`);
  console.log('─'.repeat(50));

  try {
    await driver.get(CONFIG.BASE_URL);
    await driver.sleep(300);
    await loginAsUser(driver);
    await driver.executeScript("activatePage('activity'); renderAll();");
    await driver.sleep(500);

    // ─── TC-06-01: Activity page visible ──────────────────────────────────────
    results.push(await runTest(driver, 'Activity Log page is visible', SUITE, async () => {
      const page = await driver.findElement(By.id('activity-page'));
      const classes = await page.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Activity Log page is not active');
    }));

    // ─── TC-06-02: Activity page title ────────────────────────────────────────
    results.push(await runTest(driver, 'Activity Log h2 heading is correct', SUITE, async () => {
      const heading = await waitForElement(driver, By.css('#activity-page h2'));
      const text = await heading.getText();
      if (!text.includes('Activity')) throw new Error(`Heading wrong: "${text}"`);
    }));

    // ─── TC-06-03: Activity name input present ────────────────────────────────
    results.push(await runTest(driver, 'Activity name input field is present', SUITE, async () => {
      const input = await waitForElement(driver, By.id('activity-name'));
      const displayed = await input.isDisplayed();
      if (!displayed) throw new Error('Activity name input not visible');
    }));

    // ─── TC-06-04: Activity minutes input present ─────────────────────────────
    results.push(await runTest(driver, 'Activity minutes input is numeric type', SUITE, async () => {
      const minsInput = await waitForElement(driver, By.id('activity-mins'));
      const type = await minsInput.getAttribute('type');
      if (type !== 'number') throw new Error(`Minutes input type wrong: "${type}"`);
    }));

    // ─── TC-06-05: Add Activity button present ────────────────────────────────
    results.push(await runTest(driver, 'Add Activity button is visible', SUITE, async () => {
      const btn = await waitForElement(driver, By.xpath("//button[contains(text(),'Add Activity')]"));
      const displayed = await btn.isDisplayed();
      if (!displayed) throw new Error('Add Activity button not visible');
    }));

    // ─── TC-06-06: Fill activity form ─────────────────────────────────────────
    results.push(await runTest(driver, 'Can fill activity name and minutes fields', SUITE, async () => {
      const nameInput = await driver.findElement(By.id('activity-name'));
      await nameInput.clear();
      await nameInput.sendKeys('Evening walk');
      const val = await nameInput.getAttribute('value');
      if (!val.includes('walk')) throw new Error(`Activity name not set: "${val}"`);

      const minsInput = await driver.findElement(By.id('activity-mins'));
      await minsInput.clear();
      await minsInput.sendKeys('45');
      const minsVal = await minsInput.getAttribute('value');
      if (minsVal !== '45') throw new Error(`Minutes not set: "${minsVal}"`);
    }));

    // ─── TC-06-07: Add activity adds to list ──────────────────────────────────
    results.push(await runTest(driver, 'Adding an activity appears in Activity History list', SUITE, async () => {
      const nameInput = await driver.findElement(By.id('activity-name'));
      await nameInput.clear();
      await nameInput.sendKeys('Morning jog');

      const minsInput = await driver.findElement(By.id('activity-mins'));
      await minsInput.clear();
      await minsInput.sendKeys('30');

      const addBtn = await driver.findElement(By.xpath("//button[contains(text(),'Add Activity')]"));
      await driver.executeScript('arguments[0].click();', addBtn);
      await driver.sleep(400);

      const activityList = await driver.findElement(By.id('activity-list'));
      const items = await activityList.findElements(By.css('li'));
      if (items.length === 0) throw new Error('Activity list is empty after adding');
    }));

    // ─── TC-06-08: Activity history panel ────────────────────────────────────
    results.push(await runTest(driver, 'Activity History panel is visible', SUITE, async () => {
      const historyPanel = await driver.findElement(By.css('#activity-page .panel:last-child'));
      const displayed = await historyPanel.isDisplayed();
      if (!displayed) throw new Error('Activity History panel not visible');
    }));

    // ─── TC-06-09: Two panels in grid layout ──────────────────────────────────
    results.push(await runTest(driver, 'Two panel grid layout is displayed', SUITE, async () => {
      const panels = await driver.findElements(By.css('#activity-page .panel'));
      if (panels.length < 2) throw new Error(`Expected 2 panels, got ${panels.length}`);
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
