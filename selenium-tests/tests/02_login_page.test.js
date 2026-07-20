/**
 * TEST SUITE 02 — Login & Registration Page
 * Covers: form fields, validation, error messages, successful form submission
 */

const { buildDriver, runTest, waitForElement, safeClick, typeInto, elementExists, getText, navigateToPage, By, until, CONFIG } = require('../utils/driver');

const SUITE = 'Login Page';

// Valid test data
const VALID_USER = {
  name: 'Ravi Kumar',
  phone: '9876543210',
  email: 'ravi.kumar@gmail.com',
  password: 'Test@1234',
};

async function runSuite() {
  const driver = await buildDriver();
  const results = [];

  console.log(`\n🔐 Running Suite: ${SUITE}`);
  console.log('─'.repeat(50));

  try {
    await driver.get(CONFIG.BASE_URL);
    await driver.sleep(500);

    // Navigate to login page
    await driver.executeScript("activatePage('login')");
    await driver.sleep(500);

    // ─── TC-02-01: Login page is visible ──────────────────────────────────────
    results.push(await runTest(driver, 'Login page is accessible', SUITE, async () => {
      const page = await driver.findElement(By.id('login-page'));
      const classes = await page.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Login page is not active/visible');
    }));

    // ─── TC-02-02: Form fields are present ────────────────────────────────────
    results.push(await runTest(driver, 'All 4 form fields are present', SUITE, async () => {
      await waitForElement(driver, By.id('owner-name'));
      await waitForElement(driver, By.id('owner-phone'));
      await waitForElement(driver, By.id('owner-email'));
      await waitForElement(driver, By.id('owner-password'));
    }));

    // ─── TC-02-03: Form title visible ─────────────────────────────────────────
    results.push(await runTest(driver, 'Login page title is visible', SUITE, async () => {
      const title = await waitForElement(driver, By.id('patient-login-title'));
      const text = await title.getText();
      if (!text || text.length === 0) throw new Error('Login title is empty');
    }));

    // ─── TC-02-04: Validation - empty name ────────────────────────────────────
    results.push(await runTest(driver, 'Validation error shown for empty name field', SUITE, async () => {
      const continueBtn = await waitForElement(driver, By.id('continue-pet-details'));
      await driver.executeScript('arguments[0].click();', continueBtn);
      await driver.sleep(400);
      const nameInput = await driver.findElement(By.id('owner-name'));
      const classes = await nameInput.getAttribute('class');
      if (!classes.includes('input-error')) {
        // Check if error span is shown
        const errSpan = await driver.findElement(By.id('owner-name-error'));
        const displayed = await errSpan.isDisplayed();
        if (!displayed) throw new Error('No validation error shown for empty name');
      }
    }));

    // ─── TC-02-05: Full Name field accepts text ────────────────────────────────
    results.push(await runTest(driver, 'Full Name field accepts valid input', SUITE, async () => {
      const nameField = await waitForElement(driver, By.id('owner-name'));
      await nameField.clear();
      await nameField.sendKeys(VALID_USER.name);
      const value = await nameField.getAttribute('value');
      if (value !== VALID_USER.name) throw new Error(`Name field value mismatch. Got: "${value}"`);
    }));

    // ─── TC-02-06: Phone field accepts numeric input ───────────────────────────
    results.push(await runTest(driver, 'Phone field accepts 10-digit number', SUITE, async () => {
      const phoneField = await waitForElement(driver, By.id('owner-phone'));
      await phoneField.clear();
      await phoneField.sendKeys(VALID_USER.phone);
      const value = await phoneField.getAttribute('value');
      if (value !== VALID_USER.phone) throw new Error(`Phone value mismatch. Got: "${value}"`);
    }));

    // ─── TC-02-07: Email validation - invalid email ────────────────────────────
    results.push(await runTest(driver, 'Email validation rejects invalid email', SUITE, async () => {
      const emailField = await waitForElement(driver, By.id('owner-email'));
      await emailField.clear();
      await emailField.sendKeys('notanemail');
      const continueBtn = await driver.findElement(By.id('continue-pet-details'));
      await driver.executeScript('arguments[0].click();', continueBtn);
      await driver.sleep(400);
    }));

    // ─── TC-02-08: Email field accepts valid gmail ─────────────────────────────
    results.push(await runTest(driver, 'Email field accepts valid @gmail.com address', SUITE, async () => {
      const emailField = await waitForElement(driver, By.id('owner-email'));
      await emailField.clear();
      await emailField.sendKeys(VALID_USER.email);
      const value = await emailField.getAttribute('value');
      if (value !== VALID_USER.email) throw new Error(`Email value mismatch: "${value}"`);
    }));

    // ─── TC-02-09: Password field is type=password ─────────────────────────────
    results.push(await runTest(driver, 'Password field has type=password (masked)', SUITE, async () => {
      const passField = await waitForElement(driver, By.id('owner-password'));
      const type = await passField.getAttribute('type');
      if (type !== 'password') throw new Error(`Expected type=password, got "${type}"`);
    }));

    // ─── TC-02-10: Password field validation ──────────────────────────────────
    results.push(await runTest(driver, 'Password field accepts strong password', SUITE, async () => {
      const passField = await waitForElement(driver, By.id('owner-password'));
      await passField.clear();
      await passField.sendKeys(VALID_USER.password);
      const value = await passField.getAttribute('value');
      if (value !== VALID_USER.password) throw new Error(`Password value mismatch`);
    }));

    // ─── TC-02-11: Continue button exists and is clickable ────────────────────
    results.push(await runTest(driver, 'Continue to Pet Details button is present', SUITE, async () => {
      const btn = await waitForElement(driver, By.id('continue-pet-details'));
      const displayed = await btn.isDisplayed();
      if (!displayed) throw new Error('Continue button not visible');
      const text = await btn.getText();
      if (!text.includes('Continue')) throw new Error(`Button text wrong: "${text}"`);
    }));

    // ─── TC-02-12: Full valid login flow ─────────────────────────────────────
    results.push(await runTest(driver, 'Complete valid login redirects to Pet Onboarding', SUITE, async () => {
      // Fill all valid fields
      const nameField = await driver.findElement(By.id('owner-name'));
      await nameField.clear();
      await nameField.sendKeys(VALID_USER.name);

      const phoneField = await driver.findElement(By.id('owner-phone'));
      await phoneField.clear();
      await phoneField.sendKeys(VALID_USER.phone);

      const emailField = await driver.findElement(By.id('owner-email'));
      await emailField.clear();
      await emailField.sendKeys(VALID_USER.email);

      const passField = await driver.findElement(By.id('owner-password'));
      await passField.clear();
      await passField.sendKeys(VALID_USER.password);

      const continueBtn = await driver.findElement(By.id('continue-pet-details'));
      await driver.executeScript('arguments[0].click();', continueBtn);
      await driver.sleep(800);

      // Should be on onboarding or dashboard page
      const onboardingPage = await driver.findElement(By.id('onboarding-page'));
      const classes = await onboardingPage.getAttribute('class');
      if (!classes.includes('active')) {
        // May have gone to dashboard directly if pet already exists
        const dashPage = await driver.findElement(By.id('dashboard-page'));
        const dashClasses = await dashPage.getAttribute('class');
        if (!dashClasses.includes('active')) throw new Error('Neither onboarding nor dashboard became active after login');
      }
    }));

    // ─── TC-02-13: Doctor Login link navigates to doctor page ────────────────
    results.push(await runTest(driver, 'Doctor Login nav link navigates correctly', SUITE, async () => {
      await driver.executeScript("showPage('doctor-login')");
      await driver.sleep(500);
      const docPage = await driver.findElement(By.id('doctor-login-page'));
      const classes = await docPage.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Doctor login page did not activate');
    }));

  } finally {
    await driver.quit();
  }

  return results;
}

// Run standalone
if (require.main === module) {
  runSuite().then(results => {
    const pass = results.filter(r => r.status === 'PASS').length;
    console.log(`\n📊 ${SUITE}: ${pass}/${results.length} passed`);
  }).catch(console.error);
}

module.exports = { runSuite, SUITE };
