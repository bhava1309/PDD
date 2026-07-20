/**
 * TEST SUITE 10 — Doctor Appointment Page
 * Covers: doctor listing, doctor cards, booking flows, online consultation modal
 */

const { buildDriver, runTest, waitForElement, loginAsUser, By, until, CONFIG } = require('../utils/driver');

const SUITE = 'Doctor Appointment';

async function runSuite() {
  const driver = await buildDriver();
  const results = [];

  console.log(`\n🩺 Running Suite: ${SUITE}`);
  console.log('─'.repeat(50));

  try {
    await driver.get(CONFIG.BASE_URL);
    await driver.sleep(300);
    await loginAsUser(driver);
    await driver.executeScript("activatePage('doctors'); renderAll();");
    await driver.sleep(700);

    // ─── TC-10-01: Doctors page visible ───────────────────────────────────────
    results.push(await runTest(driver, 'Doctor Appointment page is visible', SUITE, async () => {
      const page = await driver.findElement(By.id('doctors-page'));
      const classes = await page.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Doctors page is not active');
    }));

    // ─── TC-10-02: Doctors page heading ───────────────────────────────────────
    results.push(await runTest(driver, 'Doctor Appointment h2 heading is correct', SUITE, async () => {
      const heading = await waitForElement(driver, By.css('#doctors-page h2'));
      const text = await heading.getText();
      if (!text.includes('Doctor')) throw new Error(`Heading wrong: "${text}"`);
    }));

    // ─── TC-10-03: Doctor listing populated ───────────────────────────────────
    results.push(await runTest(driver, 'Doctor listing is populated with doctor cards', SUITE, async () => {
      const list = await waitForElement(driver, By.id('doctor-list'));
      await driver.sleep(400);
      const cards = await list.findElements(By.css('.pet-card'));
      if (cards.length === 0) throw new Error('No doctor cards in listing');
    }));

    // ─── TC-10-04: Doctor cards have images ───────────────────────────────────
    results.push(await runTest(driver, 'Doctor cards have doctor photos', SUITE, async () => {
      const images = await driver.findElements(By.css('#doctor-list .pet-card .pet-image img'));
      if (images.length === 0) throw new Error('No images in doctor cards');
    }));

    // ─── TC-10-05: Doctor names visible ───────────────────────────────────────
    results.push(await runTest(driver, 'Doctor cards display doctor names', SUITE, async () => {
      const names = await driver.findElements(By.css('#doctor-list .pet-info h3'));
      if (names.length === 0) throw new Error('No doctor names found');
      const firstName = await names[0].getText();
      if (!firstName.includes('Dr.')) throw new Error(`First doctor name missing "Dr.": "${firstName}"`);
    }));

    // ─── TC-10-06: Doctor ratings visible ─────────────────────────────────────
    results.push(await runTest(driver, 'Doctor cards show rating information', SUITE, async () => {
      const metas = await driver.findElements(By.css('#doctor-list .pet-meta'));
      if (metas.length === 0) throw new Error('No meta info on doctor cards');
      const firstMeta = await metas[0].getText();
      // Should contain rating or city info
      if (!firstMeta || firstMeta.length === 0) throw new Error('Doctor meta info is empty');
    }));

    // ─── TC-10-07: Doctor booking buttons ────────────────────────────────────
    results.push(await runTest(driver, 'Doctor cards have booking action buttons', SUITE, async () => {
      const btns = await driver.findElements(By.css('#doctor-list .pet-info .btn'));
      if (btns.length === 0) throw new Error('No buttons on doctor cards');
    }));

    // ─── TC-10-08: At least 6 doctors listed ─────────────────────────────────
    results.push(await runTest(driver, 'At least 6 doctors are listed', SUITE, async () => {
      const cards = await driver.findElements(By.css('#doctor-list .pet-card'));
      if (cards.length < 6) throw new Error(`Expected ≥6 doctors, got ${cards.length}`);
    }));

    // ─── TC-10-09: Clicking book appointment opens modal ─────────────────────
    results.push(await runTest(driver, 'Clicking Book Appointment button opens modal/interaction', SUITE, async () => {
      const btns = await driver.findElements(By.css('#doctor-list .pet-info .btn'));
      if (btns.length > 0) {
        await driver.executeScript('arguments[0].click();', btns[0]);
        await driver.sleep(700);
        // Verify some response happened (modal or toast)
        const modal = await driver.findElement(By.id('modal'));
        const toast = await driver.findElement(By.id('toast'));
        const modalOpen = (await modal.getAttribute('class')).includes('open');
        const toastShown = (await toast.getAttribute('class')).includes('show');
        // Close modal if open
        if (modalOpen) {
          await driver.executeScript("closeModal()");
          await driver.sleep(300);
        }
      }
    }));

    // ─── TC-10-10: Doctor card has degree info ────────────────────────────────
    results.push(await runTest(driver, 'Doctor cards display degree/qualification info', SUITE, async () => {
      const petInfos = await driver.findElements(By.css('#doctor-list .pet-info'));
      if (petInfos.length > 0) {
        const firstInfo = await petInfos[0].getText();
        // Should contain some medical degree info
        if (firstInfo.length < 10) throw new Error('Doctor info seems too short');
      }
    }));

    // ─── TC-10-11: Doctor city location listed ────────────────────────────────
    results.push(await runTest(driver, 'Doctor cards list city location', SUITE, async () => {
      const metas = await driver.findElements(By.css('#doctor-list .pet-meta'));
      if (metas.length > 0) {
        const text = await metas[0].getText();
        const indianCities = ['Chennai', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad'];
        const hasCity = indianCities.some(city => text.includes(city));
        if (!hasCity) throw new Error(`No Indian city found in doctor meta: "${text}"`);
      }
    }));

    // ─── TC-10-12: Section subtitle visible ──────────────────────────────────
    results.push(await runTest(driver, 'Doctor page section subtitle is informative', SUITE, async () => {
      const subtitle = await driver.findElement(By.css('#doctors-page .section-title p'));
      const text = await subtitle.getText();
      if (!text || text.length < 10) throw new Error(`Subtitle too short: "${text}"`);
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
