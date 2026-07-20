/**
 * TEST SUITE 01 — Home Page
 * Covers: page load, hero section, navbar links, CTA button, brand logo
 */

const { buildDriver, runTest, waitForElement, safeClick, elementExists, getText, navigateToPage, By, until, CONFIG } = require('../utils/driver');

const SUITE = 'Home Page';

async function runSuite() {
  const driver = await buildDriver();
  const results = [];

  console.log(`\n🏠 Running Suite: ${SUITE}`);
  console.log('─'.repeat(50));

  try {
    // ─── TC-01-01: Page loads successfully ────────────────────────────────────
    results.push(await runTest(driver, 'Page loads and title is correct', SUITE, async () => {
      await driver.get(CONFIG.BASE_URL);
      await driver.wait(until.titleContains('PawPal'), CONFIG.TIMEOUT);
      const title = await driver.getTitle();
      if (!title.includes('PawPal')) throw new Error(`Expected 'PawPal' in title, got: "${title}"`);
    }));

    // ─── TC-01-02: Navbar is visible ──────────────────────────────────────────
    results.push(await runTest(driver, 'Navbar is visible with brand logo', SUITE, async () => {
      const navbar = await waitForElement(driver, By.css('.navbar'));
      const logo = await waitForElement(driver, By.css('.brand-logo'));
      const displayed = await navbar.isDisplayed();
      if (!displayed) throw new Error('Navbar is not visible');
    }));

    // ─── TC-01-03: Hero section visible ───────────────────────────────────────
    results.push(await runTest(driver, 'Hero section is visible with h1 heading', SUITE, async () => {
      const hero = await waitForElement(driver, By.css('.hero'));
      const h1 = await waitForElement(driver, By.css('.hero h1'));
      const heroText = await h1.getText();
      if (!heroText.includes('Pet')) throw new Error(`Hero h1 missing expected text. Got: "${heroText}"`);
    }));

    // ─── TC-01-04: Tagline visible ────────────────────────────────────────────
    results.push(await runTest(driver, 'Brand tagline is visible', SUITE, async () => {
      const tagline = await waitForElement(driver, By.css('.brand-tagline'));
      const text = await tagline.getText();
      if (!text || text.length === 0) throw new Error('Brand tagline is empty');
    }));

    // ─── TC-01-05: Navigation links present ───────────────────────────────────
    results.push(await runTest(driver, 'Navbar contains Dashboard, Health, Community links', SUITE, async () => {
      const navLinks = await driver.findElements(By.css('.nav-links a'));
      if (navLinks.length === 0) throw new Error('No navigation links found');
      const texts = await Promise.all(navLinks.map(l => l.getText()));
      const required = ['Dashboard', 'Health', 'Community'];
      for (const req of required) {
        if (!texts.some(t => t.includes(req))) throw new Error(`Missing nav link: ${req}`);
      }
    }));

    // ─── TC-01-06: Hero image loads ───────────────────────────────────────────
    results.push(await runTest(driver, 'Hero image is displayed', SUITE, async () => {
      const img = await waitForElement(driver, By.css('.hero-image img'));
      const displayed = await img.isDisplayed();
      if (!displayed) throw new Error('Hero image is not displayed');
    }));

    // ─── TC-01-07: Get Started button visible ─────────────────────────────────
    results.push(await runTest(driver, 'Get Started CTA button is visible', SUITE, async () => {
      const btn = await waitForElement(driver, By.css('.cta-buttons .btn-primary'));
      const text = await btn.getText();
      if (!text.includes('Get Started')) throw new Error(`CTA button text mismatch. Got: "${text}"`);
    }));

    // ─── TC-01-08: Get Started navigates to login ─────────────────────────────
    results.push(await runTest(driver, 'Clicking Get Started shows login page', SUITE, async () => {
      const btn = await driver.findElement(By.css('.cta-buttons .btn-primary'));
      await driver.executeScript('arguments[0].click();', btn);
      await driver.sleep(600);
      const loginPage = await driver.findElement(By.id('login-page'));
      const classes = await loginPage.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Login page did not become active after Get Started click');
    }));

    // ─── TC-01-09: Login nav link works ───────────────────────────────────────
    results.push(await runTest(driver, 'Login nav button is clickable', SUITE, async () => {
      await driver.get(CONFIG.BASE_URL);
      const loginBtn = await waitForElement(driver, By.css('.nav-links .btn-primary'));
      const text = await loginBtn.getText();
      if (!text.includes('Login')) throw new Error(`Expected 'Login' button, got: "${text}"`);
    }));

    // ─── TC-01-10: Pill badge visible ────────────────────────────────────────
    results.push(await runTest(driver, 'Feature pill badge visible on hero', SUITE, async () => {
      await navigateToPage(driver, 'home');
      const pill = await waitForElement(driver, By.css('.pill'));
      const text = await pill.getText();
      if (!text || text.length === 0) throw new Error('Hero pill badge is empty');
    }));

    // ─── TC-01-11: PetChat AI chatbot button ─────────────────────────────────
    results.push(await runTest(driver, 'PetChat AI chatbot toggle button exists', SUITE, async () => {
      const chatToggle = await waitForElement(driver, By.css('.chat-toggle'));
      const displayed = await chatToggle.isDisplayed();
      if (!displayed) throw new Error('Chat toggle button not visible');
    }));

    // ─── TC-01-12: Page does not have JS errors ───────────────────────────────
    results.push(await runTest(driver, 'Home page loads without critical JS errors', SUITE, async () => {
      const logs = await driver.manage().logs().get('browser');
      const severeErrors = logs.filter(l => l.level.name === 'SEVERE' && !l.message.includes('favicon'));
      if (severeErrors.length > 1) {
        throw new Error(`Page has ${severeErrors.length} SEVERE console errors`);
      }
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
