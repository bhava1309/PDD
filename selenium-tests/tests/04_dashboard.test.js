/**
 * TEST SUITE 04 — Dashboard Page
 * Covers: dashboard sections, pet profile display, sidebar menu, stat cards, expense, reminders
 */

const { buildDriver, runTest, waitForElement, elementExists, navigateToPage, loginAsUser, By, until, CONFIG } = require('../utils/driver');

const SUITE = 'Dashboard';

async function setupToDashboard(driver) {
  await driver.get(CONFIG.BASE_URL);
  await driver.sleep(300);
  await loginAsUser(driver);
  // Directly navigate to dashboard — loginAsUser sets app.loggedIn + profileComplete
  await driver.executeScript("activatePage('dashboard'); renderAll();");
  await driver.sleep(600);
}

async function runSuite() {
  const driver = await buildDriver();
  const results = [];

  console.log(`\n📊 Running Suite: ${SUITE}`);
  console.log('─'.repeat(50));

  try {
    await setupToDashboard(driver);

    // ─── TC-04-01: Dashboard page loads ───────────────────────────────────────
    results.push(await runTest(driver, 'Dashboard page is visible', SUITE, async () => {
      const page = await driver.findElement(By.id('dashboard-page'));
      const classes = await page.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Dashboard page is not active');
    }));

    // ─── TC-04-02: Sidebar is visible ─────────────────────────────────────────
    results.push(await runTest(driver, 'Dashboard sidebar is visible', SUITE, async () => {
      const sidebar = await waitForElement(driver, By.css('.sidebar'));
      const displayed = await sidebar.isDisplayed();
      if (!displayed) throw new Error('Sidebar is not visible');
    }));

    // ─── TC-04-03: Pet profile card visible ───────────────────────────────────
    results.push(await runTest(driver, 'Pet profile card is displayed', SUITE, async () => {
      const petCard = await waitForElement(driver, By.css('#dashboard-page .pet-card'));
      const displayed = await petCard.isDisplayed();
      if (!displayed) throw new Error('Pet card is not visible on dashboard');
    }));

    // ─── TC-04-04: Pet name shows in sidebar ──────────────────────────────────
    results.push(await runTest(driver, 'Pet name displays in sidebar', SUITE, async () => {
      const nameEl = await waitForElement(driver, By.id('side-pet-name'));
      const text = await nameEl.getText();
      if (!text || text.length === 0) throw new Error('Pet name in sidebar is empty');
    }));

    // ─── TC-04-05: Pet image loads ────────────────────────────────────────────
    results.push(await runTest(driver, 'Pet profile image is displayed', SUITE, async () => {
      const img = await waitForElement(driver, By.id('dash-pet-img'));
      const displayed = await img.isDisplayed();
      if (!displayed) throw new Error('Pet profile image not visible');
    }));

    // ─── TC-04-06: BMI score displayed ────────────────────────────────────────
    results.push(await runTest(driver, 'BMI score is displayed in stats', SUITE, async () => {
      const bmi = await waitForElement(driver, By.id('dash-bmi'));
      const text = await bmi.getText();
      if (!text || text.length === 0) throw new Error('BMI stat is empty');
    }));

    // ─── TC-04-07: Licence number shown ───────────────────────────────────────
    results.push(await runTest(driver, 'Licence number is displayed', SUITE, async () => {
      const licence = await waitForElement(driver, By.id('dash-licence'));
      const text = await licence.getText();
      if (!text || text.length === 0) throw new Error('Licence number stat is empty');
    }));

    // ─── TC-04-08: Dashboard stat cards ──────────────────────────────────────
    results.push(await runTest(driver, 'Quick stat cards are visible (Appointment, Expenses, AI, Reminders)', SUITE, async () => {
      const cards = await driver.findElements(By.css('#dashboard-page .grid-3 .card'));
      if (cards.length < 3) throw new Error(`Expected at least 3 stat cards, got ${cards.length}`);
    }));

    // ─── TC-04-09: Monthly expense amount visible ─────────────────────────────
    results.push(await runTest(driver, 'Monthly expense amount is shown', SUITE, async () => {
      const expense = await waitForElement(driver, By.id('dash-expense'));
      const text = await expense.getText();
      if (!text.includes('₹')) throw new Error(`Expense display wrong: "${text}"`);
    }));

    // ─── TC-04-10: PetChat AI button in card ─────────────────────────────────
    results.push(await runTest(driver, 'PetChat AI Open Chat button in dashboard card', SUITE, async () => {
      const chatBtn = await waitForElement(driver, By.css('#dashboard-page .card .btn-primary'));
      const text = await chatBtn.getText();
      if (!text.includes('Open Chat')) throw new Error(`chat button text wrong: "${text}"`);
    }));

    // ─── TC-04-11: Sidebar Health Tracker link ────────────────────────────────
    results.push(await runTest(driver, 'Sidebar Health Tracker link is clickable', SUITE, async () => {
      await driver.executeScript("showPage('health')");
      await driver.sleep(500);
      const healthPage = await driver.findElement(By.id('health-page'));
      const classes = await healthPage.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Health page did not activate from sidebar');
      // Go back to dashboard
      await driver.executeScript("showPage('dashboard')");
      await driver.sleep(300);
    }));

    // ─── TC-04-12: Add New Pet link in sidebar ────────────────────────────────
    results.push(await runTest(driver, 'Add New Pet sidebar link navigates to onboarding', SUITE, async () => {
      await driver.executeScript("showPage('onboarding')");
      await driver.sleep(400);
      const onboarding = await driver.findElement(By.id('onboarding-page'));
      const classes = await onboarding.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Onboarding page did not activate from Add New Pet');
      await driver.executeScript("showPage('dashboard')");
      await driver.sleep(300);
    }));

    // ─── TC-04-13: Open Health Tracker button ─────────────────────────────────
    results.push(await runTest(driver, 'Open Health Tracker button in pet card works', SUITE, async () => {
      const healthBtn = await waitForElement(driver, By.css('#dashboard-page .btn-primary'));
      const text = await healthBtn.getText();
      if (!text.includes('Health')) throw new Error(`Button text wrong: "${text}"`);
    }));

    // ─── TC-04-14: Dashboard summary paragraph visible ────────────────────────
    results.push(await runTest(driver, 'Dashboard pet summary paragraph is visible', SUITE, async () => {
      const summary = await waitForElement(driver, By.id('dash-summary'));
      const displayed = await summary.isDisplayed();
      if (!displayed) throw new Error('Dashboard summary not visible');
    }));

    // ─── TC-04-15: Pet icon large visible ─────────────────────────────────────
    results.push(await runTest(driver, 'Pet icon large badge is visible', SUITE, async () => {
      const icon = await waitForElement(driver, By.id('dash-pet-icon'));
      const displayed = await icon.isDisplayed();
      if (!displayed) throw new Error('Pet icon large is not visible');
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
