/**
 * TEST SUITE 03 — Pet Onboarding
 * Covers: pet form fields, type selector, breed suggestion, BMI calculation, form submit
 */

const { buildDriver, runTest, waitForElement, safeClick, typeInto, elementExists, navigateToPage, By, until, CONFIG } = require('../utils/driver');

const SUITE = 'Pet Onboarding';

// Helper to login and reach onboarding
async function setupToOnboarding(driver) {
  await driver.get(CONFIG.BASE_URL);
  await driver.sleep(400);
  await driver.executeScript("activatePage('login')");
  await driver.sleep(300);

  const fields = {
    'owner-name': 'Surya Testing',
    'owner-phone': '9876543210',
    'owner-email': 'surya.test@gmail.com',
    'owner-password': 'Test@9999',
  };
  for (const [id, val] of Object.entries(fields)) {
    const el = await driver.findElement(By.id(id));
    await el.clear();
    await el.sendKeys(val);
  }
  const continueBtn = await driver.findElement(By.id('continue-pet-details'));
  await driver.executeScript('arguments[0].click();', continueBtn);
  await driver.sleep(600);
}

async function runSuite() {
  const driver = await buildDriver();
  const results = [];

  console.log(`\n🐾 Running Suite: ${SUITE}`);
  console.log('─'.repeat(50));

  try {
    await setupToOnboarding(driver);

    // ─── TC-03-01: Onboarding page visible ────────────────────────────────────
    results.push(await runTest(driver, 'Pet onboarding page is visible', SUITE, async () => {
      const page = await driver.findElement(By.id('onboarding-page'));
      const classes = await page.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Onboarding page not active');
    }));

    // ─── TC-03-02: Pet Type dropdown present ──────────────────────────────────
    results.push(await runTest(driver, 'Pet Type dropdown is present with options', SUITE, async () => {
      const select = await waitForElement(driver, By.id('pet-type'));
      const options = await select.findElements(By.css('option'));
      if (options.length < 3) throw new Error(`Expected at least 3 pet types, got ${options.length}`);
    }));

    // ─── TC-03-03: Breed field present ────────────────────────────────────────
    results.push(await runTest(driver, 'Pet Breed input field is present', SUITE, async () => {
      const breedField = await waitForElement(driver, By.id('pet-breed'));
      const placeholder = await breedField.getAttribute('placeholder');
      if (!placeholder) throw new Error('Pet breed field has no placeholder');
    }));

    // ─── TC-03-04: Pet Name field ─────────────────────────────────────────────
    results.push(await runTest(driver, 'Pet Name input field accepts text', SUITE, async () => {
      const nameField = await waitForElement(driver, By.id('pet-name'));
      await nameField.clear();
      await nameField.sendKeys('Bruno');
      const val = await nameField.getAttribute('value');
      if (val !== 'Bruno') throw new Error(`Pet name mismatch: "${val}"`);
    }));

    // ─── TC-03-05: Age field is number type ───────────────────────────────────
    results.push(await runTest(driver, 'Age field is of type number', SUITE, async () => {
      const ageField = await waitForElement(driver, By.id('pet-age'));
      const type = await ageField.getAttribute('type');
      if (type !== 'number') throw new Error(`Age field type should be 'number', got "${type}"`);
    }));

    // ─── TC-03-06: Weight field is number type ────────────────────────────────
    results.push(await runTest(driver, 'Weight field is of type number', SUITE, async () => {
      const weightField = await waitForElement(driver, By.id('pet-weight'));
      const type = await weightField.getAttribute('type');
      if (type !== 'number') throw new Error(`Weight field type should be 'number', got "${type}"`);
    }));

    // ─── TC-03-07: Licence field present ─────────────────────────────────────
    results.push(await runTest(driver, 'Licence number field is present', SUITE, async () => {
      const licenceField = await waitForElement(driver, By.id('pet-licence'));
      const placeholder = await licenceField.getAttribute('placeholder');
      if (!placeholder.includes('PET')) throw new Error(`Licence placeholder wrong: "${placeholder}"`);
    }));

    // ─── TC-03-08: Location field present ─────────────────────────────────────
    results.push(await runTest(driver, 'Location field is present', SUITE, async () => {
      const locField = await waitForElement(driver, By.id('pet-location'));
      const placeholder = await locField.getAttribute('placeholder');
      if (!placeholder) throw new Error('Location field has no placeholder');
    }));

    // ─── TC-03-09: Breed auto-suggestion on type change ──────────────────────
    results.push(await runTest(driver, 'Selecting Cat auto-suggests Cat breed', SUITE, async () => {
      const select = await driver.findElement(By.id('pet-type'));
      // Select Cat
      const options = await select.findElements(By.css('option'));
      for (const opt of options) {
        const text = await opt.getText();
        if (text === 'Cat') {
          await opt.click();
          break;
        }
      }
      // Trigger onchange event
      await driver.executeScript("suggestBreed()");
      await driver.sleep(300);
      const breedField = await driver.findElement(By.id('pet-breed'));
      const val = await breedField.getAttribute('value');
      // Cat should suggest something cat-related
      if (!val || val.length === 0) throw new Error('No breed auto-suggested for Cat');
    }));

    // ─── TC-03-10: Fill all pet fields ─────────────────────────────────────────
    results.push(await runTest(driver, 'All pet form fields can be filled', SUITE, async () => {
      const petTypeSelect = await driver.findElement(By.id('pet-type'));
      const options = await petTypeSelect.findElements(By.css('option'));
      for (const opt of options) {
        const text = await opt.getText();
        if (text === 'Dog') { await opt.click(); break; }
      }
      await driver.executeScript("suggestBreed()");
      await driver.sleep(200);

      const nameField = await driver.findElement(By.id('pet-name'));
      await nameField.clear();
      await nameField.sendKeys('Bruno');

      const ageField = await driver.findElement(By.id('pet-age'));
      await ageField.clear();
      await ageField.sendKeys('3');

      const weightField = await driver.findElement(By.id('pet-weight'));
      await weightField.clear();
      await weightField.sendKeys('18');

      const licenceField = await driver.findElement(By.id('pet-licence'));
      await licenceField.clear();
      await licenceField.sendKeys('CHN-PET-2026-1024');

      const locField = await driver.findElement(By.id('pet-location'));
      await locField.clear();
      await locField.sendKeys('Chennai, Tamil Nadu');

      const concernField = await driver.findElement(By.id('pet-concern'));
      await concernField.clear();
      await concernField.sendKeys('Weight control, skin care');
    }));

    // ─── TC-03-11: Calculate BMI button present ───────────────────────────────
    results.push(await runTest(driver, 'Calculate BMI & Open Dashboard button is present', SUITE, async () => {
      const btn = await waitForElement(driver, By.id('calculate-bmi-dashboard'));
      const text = await btn.getText();
      if (!text.includes('BMI')) throw new Error(`BMI button text wrong: "${text}"`);
    }));

    // ─── TC-03-12: Submit pet form opens dashboard ────────────────────────────
    results.push(await runTest(driver, 'Submitting pet form navigates to Dashboard', SUITE, async () => {
      const btn = await driver.findElement(By.id('calculate-bmi-dashboard'));
      await driver.executeScript('arguments[0].click();', btn);
      await driver.sleep(800);

      const dashPage = await driver.findElement(By.id('dashboard-page'));
      const classes = await dashPage.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Dashboard page did not activate after pet form submit');
    }));

    // ─── TC-03-13: Health concern field ──────────────────────────────────────
    results.push(await runTest(driver, 'Health Concern field accepts text input', SUITE, async () => {
      // Navigate back to onboarding
      await driver.executeScript("showPage('onboarding')");
      await driver.sleep(400);
      const concernField = await waitForElement(driver, By.id('pet-concern'));
      await concernField.clear();
      await concernField.sendKeys('Skin allergy, weight management');
      const val = await concernField.getAttribute('value');
      if (!val.includes('allergy')) throw new Error(`Concern field value mismatch: "${val}"`);
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
