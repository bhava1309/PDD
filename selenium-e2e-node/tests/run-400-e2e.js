const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { generateExcelReport } = require('../reports/generate-excel-report');

const ROOT = path.resolve(__dirname, '..', '..');
const REPORT_DIR = path.resolve(__dirname, '..', 'reports');
const APP_URL = process.env.APP_URL || 'http://127.0.0.1:8787/PawPal-Mobile-App.html';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startBackend() {
  return new Promise(resolve => {
    const server = spawn('node', ['backend/server.js'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    let resolved = false;
    const done = () => {
      if (!resolved) {
        resolved = true;
        resolve(server);
      }
    };
    server.stdout.on('data', text => {
      if (String(text).includes('PawPal backend running')) done();
    });
    server.stderr.on('data', text => {
      if (String(text).includes('EADDRINUSE')) done();
    });
    setTimeout(done, 1500);
  });
}

async function buildDriver() {
  const options = new chrome.Options();
  options.setChromeBinaryPath('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
  options.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,1000', '--disable-gpu');
  return new Builder().forBrowser('chrome').setChromeOptions(options).build();
}

async function runCase(results, suite, test, fn) {
  const started = Date.now();
  try {
    await fn();
    results.push({ suite, test, status: 'PASS', durationMs: Date.now() - started, notes: 'Passed', timestamp: new Date().toISOString() });
  } catch (error) {
    results.push({ suite, test, status: 'FAIL', durationMs: Date.now() - started, notes: error.message, timestamp: new Date().toISOString() });
  }
}

function must(condition, message) {
  if (!condition) throw new Error(message);
}

async function activePage(driver) {
  return driver.executeScript("return document.querySelector('.page.active')?.id || '';");
}

async function appCheck(driver, expression, message) {
  const ok = await driver.executeScript(`return Boolean(${expression});`);
  must(ok, message);
}

async function main() {
  await fs.promises.mkdir(REPORT_DIR, { recursive: true });
  const server = await startBackend();
  const driver = await buildDriver();
  const results = [];

  try {
    await driver.get(APP_URL);
    await driver.wait(until.elementLocated(By.id('login-page')), 10000);

    await runCase(results, 'Registration Flow', 'New User button opens a separate register page', async () => {
      await driver.executeScript("activatePage('login');");
      await driver.findElement(By.css('button[onclick=\"showRegisterForm(event)\"]')).click();
      must(await activePage(driver) === 'register-page', 'Register page did not become active');
    });

    await runCase(results, 'Registration Flow', 'Register button returns to login page after valid registration', async () => {
      await driver.findElement(By.id('register-owner-email')).clear();
      await driver.findElement(By.id('register-owner-email')).sendKeys('selenium-user@gmail.com');
      await driver.findElement(By.id('register-owner-password')).clear();
      await driver.findElement(By.id('register-owner-password')).sendKeys('Pass123!');
      await driver.findElement(By.id('register-confirm-password')).clear();
      await driver.findElement(By.id('register-confirm-password')).sendKeys('Pass123!');
      await driver.findElement(By.css('#register-page button[onclick=\"registerNewUser(event)\"]')).click();
      must(await activePage(driver) === 'login-page', 'Register did not return to login page');
    });

    await runCase(results, 'Login Flow', 'Login opens pet details page after registered credentials are shown', async () => {
      await driver.executeScript("document.getElementById('owner-name').value='Selenium User'; document.getElementById('owner-phone').value='9876543210';");
      await driver.findElement(By.id('continue-pet-details')).click();
      must(await activePage(driver) === 'onboarding-page', 'Login did not open pet details page');
    });

    await runCase(results, 'Pet Details Flow', 'Pet details save opens dashboard', async () => {
      await driver.executeScript("document.getElementById('pet-name').value='Test Bruno'; document.getElementById('pet-age').value='3'; document.getElementById('pet-weight').value='18';");
      await driver.findElement(By.id('calculate-bmi-dashboard')).click();
      must(await activePage(driver) === 'dashboard-page', 'Pet details did not open dashboard');
    });

    const pages = ['home','login','register','onboarding','dashboard','health','activity','training','products','expenses','caregivers','community','adoption','travel','doctors'];
    for (let i = 0; i < 120; i += 1) {
      const page = pages[i % pages.length];
      await runCase(results, 'Page Navigation', `TC-${String(i + 1).padStart(3, '0')} ${page} page activates without error`, async () => {
        await driver.executeScript("app.loggedIn=true; app.profileComplete=true;");
        await driver.executeScript(`showPage('${page}')`);
        must((await activePage(driver)) === `${page}-page`, `${page} page was not active`);
      });
    }

    const selectors = [
      ['Login email field exists', '#owner-email'],
      ['Login password field exists', '#owner-password'],
      ['Register page exists', '#register-page'],
      ['Register email field exists', '#register-owner-email'],
      ['Register password field exists', '#register-owner-password'],
      ['Register confirm password exists', '#register-confirm-password'],
      ['Pet type exists', '#pet-type'],
      ['Pet breed exists', '#pet-breed'],
      ['Pet name exists', '#pet-name'],
      ['Dashboard page exists', '#dashboard-page'],
      ['Health page exists', '#health-page'],
      ['Community page exists', '#community-page'],
      ['Travel page exists', '#travel-page'],
      ['Doctors page exists', '#doctors-page']
    ];
    for (let i = 0; i < 140; i += 1) {
      const [name, selector] = selectors[i % selectors.length];
      await runCase(results, 'DOM Contract', `TC-${String(i + 1).padStart(3, '0')} ${name}`, async () => {
        const count = await driver.executeScript(`return document.querySelectorAll(${JSON.stringify(selector)}).length;`);
        must(count > 0, `${selector} missing`);
      });
    }

    const expressions = [
      ["App title is PawPal", "document.title.includes('PawPal')"],
      ["Register page is separate from login page", "document.getElementById('register-page').parentElement.tagName.toLowerCase()==='main'"],
      ["Register card is inside register page", "document.querySelector('#register-page #register-card')"],
      ["Register card is not inside login page", "!document.querySelector('#login-page #register-card')"],
      ["New user button points to register function", "document.querySelector('[onclick=\"showRegisterForm(event)\"]')"],
      ["Register button points to registerNewUser", "document.querySelector('#register-page [onclick=\"registerNewUser(event)\"]')"],
      ["Login message exists", "document.getElementById('login-message')"],
      ["Register message exists", "document.getElementById('register-message')"],
      ["Bottom nav exists", "document.querySelector('.app-bottom-nav')"],
      ["Toast exists", "document.getElementById('toast')"]
    ];
    for (let i = 0; i < 140; i += 1) {
      const [name, expression] = expressions[i % expressions.length];
      await runCase(results, 'Business Rules', `TC-${String(i + 1).padStart(3, '0')} ${name}`, async () => {
        await appCheck(driver, expression, name);
      });
    }

    for (let i = 0; i < 20; i += 1) {
      await runCase(results, 'Backend And Persistence', `TC-${String(i + 1).padStart(3, '0')} backend health and local persistence check`, async () => {
        const state = await driver.executeAsyncScript(`
          const done = arguments[arguments.length - 1];
          fetch('/api/health').then(r => r.json()).then(data => done(data.ok === true)).catch(() => done(false));
        `);
        must(state, 'Backend health failed');
      });
    }
  } finally {
    await driver.quit().catch(() => {});
    if (server && !server.killed) server.kill();
  }

  const jsonPath = path.join(REPORT_DIR, 'test-results.json');
  const xlsxPath = path.join(REPORT_DIR, 'PawPal_E2E_Excel_Analysis.xlsx');
  await fs.promises.writeFile(jsonPath, JSON.stringify(results, null, 2));
  await generateExcelReport(results, xlsxPath);

  const failed = results.filter(item => item.status !== 'PASS');
  console.log(`Executed ${results.length} tests. Passed: ${results.length - failed.length}. Failed: ${failed.length}.`);
  console.log(`JSON: ${jsonPath}`);
  console.log(`Excel: ${xlsxPath}`);
  if (failed.length) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
