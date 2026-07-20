/**
 * TEST SUITE 11 — Doctor Login Page
 * Covers: doctor login form, dropdown, validation, dashboard access
 */

const { buildDriver, runTest, waitForElement, By, until, CONFIG } = require('../utils/driver');

const SUITE = 'Doctor Login';

async function runSuite() {
  const driver = await buildDriver();
  const results = [];

  console.log(`\n👨‍⚕️  Running Suite: ${SUITE}`);
  console.log('─'.repeat(50));

  try {
    await driver.get(CONFIG.BASE_URL);
    await driver.sleep(300);
    await driver.executeScript("showPage('doctor-login')");
    await driver.sleep(600);

    // ─── TC-11-01: Doctor Login page visible ──────────────────────────────────
    results.push(await runTest(driver, 'Doctor Login page is visible', SUITE, async () => {
      const page = await driver.findElement(By.id('doctor-login-page'));
      const classes = await page.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Doctor Login page is not active');
    }));

    // ─── TC-11-02: Doctor Login heading ───────────────────────────────────────
    results.push(await runTest(driver, 'Doctor Login h2 heading is present', SUITE, async () => {
      const heading = await waitForElement(driver, By.css('#doctor-login-page h2'));
      const text = await heading.getText();
      if (!text.includes('Doctor')) throw new Error(`Heading wrong: "${text}"`);
    }));

    // ─── TC-11-03: Doctor name dropdown ───────────────────────────────────────
    results.push(await runTest(driver, 'Doctor name dropdown select is present with options', SUITE, async () => {
      const select = await waitForElement(driver, By.id('doctor-login-name'));
      const options = await select.findElements(By.css('option'));
      if (options.length === 0) throw new Error('No options in doctor dropdown');
    }));

    // ─── TC-11-04: Doctor login phone field ───────────────────────────────────
    results.push(await runTest(driver, 'Doctor login phone field is present', SUITE, async () => {
      const phone = await waitForElement(driver, By.id('doctor-login-phone'));
      const displayed = await phone.isDisplayed();
      if (!displayed) throw new Error('Doctor phone field not visible');
    }));

    // ─── TC-11-05: Doctor clinic email field ──────────────────────────────────
    results.push(await runTest(driver, 'Doctor clinic email field is present', SUITE, async () => {
      const email = await waitForElement(driver, By.id('doctor-login-email'));
      const type = await email.getAttribute('type');
      if (type !== 'email') throw new Error(`Email field type wrong: "${type}"`);
    }));

    // ─── TC-11-06: Doctor password field ──────────────────────────────────────
    results.push(await runTest(driver, 'Doctor password field is masked', SUITE, async () => {
      const pass = await waitForElement(driver, By.id('doctor-login-password'));
      const type = await pass.getAttribute('type');
      if (type !== 'password') throw new Error(`Password field type wrong: "${type}"`);
    }));

    // ─── TC-11-07: Open Doctor Dashboard button ────────────────────────────────
    results.push(await runTest(driver, 'Open Doctor Dashboard button is present', SUITE, async () => {
      const btn = await waitForElement(driver, By.xpath("//button[contains(text(),'Open Doctor Dashboard')]"));
      const displayed = await btn.isDisplayed();
      if (!displayed) throw new Error('Doctor Dashboard button not visible');
    }));

    // ─── TC-11-08: Can select a doctor from dropdown ─────────────────────────
    results.push(await runTest(driver, 'Can select a doctor from the dropdown', SUITE, async () => {
      const select = await driver.findElement(By.id('doctor-login-name'));
      const options = await select.findElements(By.css('option'));
      if (options.length > 0) {
        await options[0].click();
        const selectedVal = await select.getAttribute('value');
        if (!selectedVal || selectedVal.length === 0) throw new Error('No doctor selected after clicking option');
      }
    }));

    // ─── TC-11-09: Fill doctor phone ──────────────────────────────────────────
    results.push(await runTest(driver, 'Can fill doctor phone number field', SUITE, async () => {
      const phone = await driver.findElement(By.id('doctor-login-phone'));
      await phone.clear();
      await phone.sendKeys('9876512001');
      const val = await phone.getAttribute('value');
      if (val !== '9876512001') throw new Error(`Phone value wrong: "${val}"`);
    }));

    // ─── TC-11-10: Fill doctor email ──────────────────────────────────────────
    results.push(await runTest(driver, 'Can fill doctor clinic email field', SUITE, async () => {
      const email = await driver.findElement(By.id('doctor-login-email'));
      await email.clear();
      await email.sendKeys('priya.sharma@gmail.com');
      const val = await email.getAttribute('value');
      if (!val.includes('gmail')) throw new Error(`Email value wrong: "${val}"`);
    }));

    // ─── TC-11-11: Fill doctor password ──────────────────────────────────────
    results.push(await runTest(driver, 'Can fill doctor password field', SUITE, async () => {
      const pass = await driver.findElement(By.id('doctor-login-password'));
      await pass.clear();
      await pass.sendKeys('Doctor@1234');
      const val = await pass.getAttribute('value');
      if (val !== 'Doctor@1234') throw new Error('Doctor password not set correctly');
    }));

    // ─── TC-11-12: Doctor login opens portal ─────────────────────────────────
    results.push(await runTest(driver, 'Valid doctor login opens Doctor Portal dashboard', SUITE, async () => {
      const loginBtn = await driver.findElement(By.xpath("//button[contains(text(),'Open Doctor Dashboard')]"));
      await driver.executeScript('arguments[0].click();', loginBtn);
      await driver.sleep(800);

      const portalPage = await driver.findElement(By.id('doctor-portal-page'));
      const classes = await portalPage.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Doctor portal page did not activate after login');
    }));

    // ─── TC-11-13: Doctor portal has patient list ─────────────────────────────
    results.push(await runTest(driver, 'Doctor portal shows patient list section', SUITE, async () => {
      const patientList = await waitForElement(driver, By.id('doctor-patient-list'));
      const displayed = await patientList.isDisplayed();
      if (!displayed) throw new Error('Doctor patient list not visible');
    }));

    // ─── TC-11-14: Doctor portal profile card ────────────────────────────────
    results.push(await runTest(driver, 'Doctor portal displays doctor profile card', SUITE, async () => {
      const profileCard = await waitForElement(driver, By.id('doctor-profile-card'));
      const displayed = await profileCard.isDisplayed();
      if (!displayed) throw new Error('Doctor profile card not visible');
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
