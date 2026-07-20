/**
 * TEST SUITE 09 — Travel Page
 * Covers: travel search, location input, type filter, map, travel result cards
 */

const { buildDriver, runTest, waitForElement, loginAsUser, By, until, CONFIG } = require('../utils/driver');

const SUITE = 'Pet-Friendly Travel';

async function runSuite() {
  const driver = await buildDriver();
  const results = [];

  console.log(`\n✈️  Running Suite: ${SUITE}`);
  console.log('─'.repeat(50));

  try {
    await driver.get(CONFIG.BASE_URL);
    await driver.sleep(300);
    await loginAsUser(driver);
    await driver.executeScript("activatePage('travel'); renderAll();");
    await driver.sleep(600);

    // ─── TC-09-01: Travel page visible ────────────────────────────────────────
    results.push(await runTest(driver, 'Travel page is visible', SUITE, async () => {
      const page = await driver.findElement(By.id('travel-page'));
      const classes = await page.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Travel page is not active');
    }));

    // ─── TC-09-02: Travel page heading ────────────────────────────────────────
    results.push(await runTest(driver, 'Travel page h2 heading is correct', SUITE, async () => {
      const heading = await waitForElement(driver, By.css('#travel-page h2'));
      const text = await heading.getText();
      if (!text.includes('Travel')) throw new Error(`Heading wrong: "${text}"`);
    }));

    // ─── TC-09-03: Travel location input ─────────────────────────────────────
    results.push(await runTest(driver, 'Travel location input field is present', SUITE, async () => {
      const input = await waitForElement(driver, By.id('travel-location'));
      const placeholder = await input.getAttribute('placeholder');
      if (!placeholder.includes('city')) throw new Error(`Placeholder wrong: "${placeholder}"`);
    }));

    // ─── TC-09-04: Travel type dropdown ───────────────────────────────────────
    results.push(await runTest(driver, 'Travel type filter dropdown is present with options', SUITE, async () => {
      const select = await waitForElement(driver, By.id('travel-type'));
      const options = await select.findElements(By.css('option'));
      if (options.length < 3) throw new Error(`Too few options: ${options.length}`);
    }));

    results.push(await runTest(driver, 'Search travel button is present', SUITE, async () => {
      // Scope to travel-page to avoid matching Caregivers section's Search button
      const travelPage = await driver.findElement(By.id('travel-page'));
      const btn = await travelPage.findElement(By.css('.btn'));
      const displayed = await btn.isDisplayed();
      if (!displayed) throw new Error('Search button not visible on travel page');
    }));

    // ─── TC-09-06: Map section visible ────────────────────────────────────────
    results.push(await runTest(driver, 'Travel map section is displayed', SUITE, async () => {
      const mapBox = await waitForElement(driver, By.css('#travel-page .map-box'));
      const displayed = await mapBox.isDisplayed();
      if (!displayed) throw new Error('Travel map box not visible');
    }));

    // ─── TC-09-07: Travel map frame present ───────────────────────────────────
    results.push(await runTest(driver, 'Travel map iframe is present', SUITE, async () => {
      const mapFrame = await waitForElement(driver, By.id('travel-map-frame'));
      const displayed = await mapFrame.isDisplayed();
      if (!displayed) throw new Error('Travel map iframe not visible');
    }));

    // ─── TC-09-08: Fill travel location and search ────────────────────────────
    results.push(await runTest(driver, 'Can type location and trigger search', SUITE, async () => {
      const locationInput = await driver.findElement(By.id('travel-location'));
      await locationInput.clear();
      await locationInput.sendKeys('Mumbai');
      const val = await locationInput.getAttribute('value');
      if (!val.includes('Mumbai')) throw new Error(`Location not set: "${val}"`);

      const searchBtn = await driver.findElement(By.css('#travel-page .btn'));
      await driver.executeScript('arguments[0].click();', searchBtn);
      await driver.sleep(600);
    }));

    // ─── TC-09-09: Travel results appear ─────────────────────────────────────
    results.push(await runTest(driver, 'Travel search results are populated', SUITE, async () => {
      const results_container = await driver.findElement(By.id('travel-results'));
      await driver.sleep(400);
      const cards = await results_container.findElements(By.css('.pet-card'));
      if (cards.length === 0) throw new Error('No travel result cards after search');
    }));

    // ─── TC-09-10: Travel results have names ─────────────────────────────────
    results.push(await runTest(driver, 'Travel result cards display place names', SUITE, async () => {
      const names = await driver.findElements(By.css('#travel-results .pet-info h3'));
      if (names.length === 0) throw new Error('No place names in travel results');
      const firstText = await names[0].getText();
      if (!firstText || firstText.length === 0) throw new Error('First travel result name is empty');
    }));

    // ─── TC-09-11: Filter by Hotels ──────────────────────────────────────────
    results.push(await runTest(driver, 'Can filter travel results by Hotels type', SUITE, async () => {
      const select = await driver.findElement(By.id('travel-type'));
      const options = await select.findElements(By.css('option'));
      for (const opt of options) {
        const text = await opt.getText();
        if (text === 'Hotels') { await opt.click(); break; }
      }
      const searchBtn = await driver.findElement(By.css('#travel-page .btn'));
      await driver.executeScript('arguments[0].click();', searchBtn);
      await driver.sleep(600);
    }));

    // ─── TC-09-12: Map pin location title visible ─────────────────────────────
    results.push(await runTest(driver, 'Map pin title text is visible', SUITE, async () => {
      const mapTitle = await waitForElement(driver, By.id('travel-map-title'));
      const text = await mapTitle.getText();
      if (!text || text.length === 0) throw new Error('Travel map title is empty');
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
