/**
 * PawPal Selenium Test Suite - Driver & Utility Setup
 * Shared WebDriver factory and common test helpers
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// ─── Configuration ─────────────────────────────────────────────────────────────
const CONFIG = {
  BASE_URL: 'http://localhost:3000',
  TIMEOUT: 15000,          // 15s element wait
  PAGE_LOAD: 40000,        // 40s page load
  IMPLICIT_WAIT: 3000,
  HEADLESS: process.env.HEADLESS === 'true',
  BROWSER: process.env.BROWSER || 'chrome',
  SCREENSHOT_DIR: './screenshots',
  REPORT_DIR: './reports',
};

// ─── Driver Factory ────────────────────────────────────────────────────────────
async function buildDriver() {
  const options = new chrome.Options();

  if (CONFIG.HEADLESS) {
    options.addArguments('--headless=new');
  }

  options.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1440,900',
    '--disable-extensions',
    '--disable-web-security',
    '--allow-running-insecure-content',
    '--no-zygote',
    '--disable-features=VizDisplayCompositor',
    '--memory-pressure-off',
    '--js-flags=--max-old-space-size=512',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-sync',
    '--disable-translate',
    '--metrics-recording-only',
    '--safebrowsing-disable-auto-update'
  );

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({
    implicit: CONFIG.IMPLICIT_WAIT,
    pageLoad: CONFIG.PAGE_LOAD,
    script: 30000,
  });

  await driver.manage().window().maximize();
  return driver;
}

// ─── Test Helpers ──────────────────────────────────────────────────────────────

/**
 * Wait for an element to be visible and return it
 */
async function waitForElement(driver, locator, timeout = CONFIG.TIMEOUT) {
  return driver.wait(until.elementIsVisible(
    await driver.wait(until.elementLocated(locator), timeout)
  ), timeout);
}

/**
 * Safe click: scroll into view then click
 */
async function safeClick(driver, locator) {
  const el = await waitForElement(driver, locator);
  await driver.executeScript('arguments[0].scrollIntoView({block:"center"});', el);
  await driver.sleep(200);
  await el.click();
  return el;
}

/**
 * Type into input after clearing it
 */
async function typeInto(driver, locator, text) {
  const el = await waitForElement(driver, locator);
  await el.clear();
  await el.sendKeys(text);
  return el;
}

/**
 * Check if element exists without throwing
 */
async function elementExists(driver, locator, timeout = 3000) {
  try {
    await driver.wait(until.elementLocated(locator), timeout);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get element text safely
 */
async function getText(driver, locator, fallback = '') {
  try {
    const el = await driver.findElement(locator);
    return await el.getText();
  } catch {
    return fallback;
  }
}

/**
 * Navigate to a page via JS (app.showPage)
 */
async function navigateToPage(driver, pageName) {
  await driver.executeScript(`showPage('${pageName}')`);
  await driver.sleep(500);
}

/**
 * Bypass UI login by directly setting app state.
 * Call this before navigating to any protected page (dashboard, health, etc.)
 */
async function loginAsUser(driver) {
  await driver.executeScript(`
    app.loggedIn = true;
    app.profileComplete = true;
    app.owner = { name: 'Test User', phone: '9876543210', email: 'test@gmail.com' };
    app.pet = app.pet || {};
    app.pet.name  = app.pet.name  || 'Bruno';
    app.pet.type  = app.pet.type  || 'Dog';
    app.pet.breed = app.pet.breed || 'Labrador';
    app.pet.age   = app.pet.age   || 3;
    app.pet.weight= app.pet.weight|| 25;
    app.pet.bmi   = app.pet.bmi   || 2.4;
    app.pet.licence = app.pet.licence || 'CHN-PET-2026';
    app.pet.location = app.pet.location || 'Chennai, Tamil Nadu';
    app.pet.concern  = app.pet.concern  || 'None';
    renderAll();
  `);
  await driver.sleep(400);
}

/**
 * Take a screenshot and save it
 */
async function takeScreenshot(driver, name) {
  const fs = require('fs');
  const path = require('path');
  const dir = CONFIG.SCREENSHOT_DIR;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const data = await driver.takeScreenshot();
  const filePath = path.join(dir, `${name}_${Date.now()}.png`);
  fs.writeFileSync(filePath, data, 'base64');
  return filePath;
}

/**
 * Assert with descriptive output; returns result object
 */
function assert(condition, testName, message) {
  return {
    testName,
    passed: !!condition,
    message: condition ? `✅ PASS: ${message}` : `❌ FAIL: ${message}`,
    error: condition ? null : message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Run a single test case safely and return a result object
 */
async function runTest(driver, testName, suiteName, testFn) {
  const start = Date.now();
  let screenshotPath = '';
  try {
    await testFn();
    const duration = Date.now() - start;
    console.log(`  ✅ ${testName} (${duration}ms)`);
    return {
      suite: suiteName,
      test: testName,
      status: 'PASS',
      duration,
      error: '',
      screenshot: '',
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    const duration = Date.now() - start;
    try {
      screenshotPath = await takeScreenshot(driver, testName.replace(/\s+/g, '_'));
    } catch (_) {}
    console.log(`  ❌ ${testName} (${duration}ms): ${err.message}`);
    return {
      suite: suiteName,
      test: testName,
      status: 'FAIL',
      duration,
      error: err.message,
      screenshot: screenshotPath,
      timestamp: new Date().toISOString(),
    };
  }
}

// ─── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  CONFIG,
  buildDriver,
  waitForElement,
  safeClick,
  typeInto,
  elementExists,
  getText,
  navigateToPage,
  loginAsUser,
  takeScreenshot,
  assert,
  runTest,
  By,
  until,
  Key,
};
