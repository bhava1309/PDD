/**
 * TEST SUITE 07 — Community Page
 * Covers: community feed, post form, add post functionality, post display
 */

const { buildDriver, runTest, waitForElement, loginAsUser, By, until, CONFIG } = require('../utils/driver');

const SUITE = 'Community';

async function runSuite() {
  const driver = await buildDriver();
  const results = [];

  console.log(`\n👥 Running Suite: ${SUITE}`);
  console.log('─'.repeat(50));

  try {
    await driver.get(CONFIG.BASE_URL);
    await driver.sleep(300);
    await loginAsUser(driver);
    await driver.executeScript("activatePage('community'); renderAll();");
    await driver.sleep(500);

    // ─── TC-07-01: Community page visible ─────────────────────────────────────
    results.push(await runTest(driver, 'Community page is visible', SUITE, async () => {
      const page = await driver.findElement(By.id('community-page'));
      const classes = await page.getAttribute('class');
      if (!classes.includes('active')) throw new Error('Community page is not active');
    }));

    // ─── TC-07-02: Community heading ──────────────────────────────────────────
    results.push(await runTest(driver, 'Community h2 heading is present', SUITE, async () => {
      const heading = await waitForElement(driver, By.css('#community-page h2'));
      const text = await heading.getText();
      if (!text.includes('Community')) throw new Error(`Heading wrong: "${text}"`);
    }));

    // ─── TC-07-03: Post creation textarea present ─────────────────────────────
    results.push(await runTest(driver, 'Post creation textarea is visible', SUITE, async () => {
      const textarea = await waitForElement(driver, By.id('new-post'));
      const displayed = await textarea.isDisplayed();
      if (!displayed) throw new Error('Post textarea not visible');
    }));

    // ─── TC-07-04: Post button present ────────────────────────────────────────
    results.push(await runTest(driver, 'Post button is visible', SUITE, async () => {
      const postBtn = await waitForElement(driver, By.xpath("//button[contains(text(),'Post')]"));
      const displayed = await postBtn.isDisplayed();
      if (!displayed) throw new Error('Post button not visible');
    }));

    // ─── TC-07-05: Community feed present ─────────────────────────────────────
    results.push(await runTest(driver, 'Community feed container is present', SUITE, async () => {
      const feed = await waitForElement(driver, By.id('community-feed'));
      const displayed = await feed.isDisplayed();
      if (!displayed) throw new Error('Community feed not visible');
    }));

    // ─── TC-07-06: Type in post textarea ──────────────────────────────────────
    results.push(await runTest(driver, 'Can type in post creation textarea', SUITE, async () => {
      const textarea = await driver.findElement(By.id('new-post'));
      await textarea.clear();
      await textarea.sendKeys('My pet Bruno had a wonderful walk today! Great day at the park.');
      const val = await textarea.getAttribute('value');
      if (!val.includes('Bruno')) throw new Error(`Textarea value mismatch: "${val}"`);
    }));

    // ─── TC-07-07: Adding a post shows in feed ────────────────────────────────
    results.push(await runTest(driver, 'Adding a post shows it in community feed', SUITE, async () => {
      const textarea = await driver.findElement(By.id('new-post'));
      await textarea.clear();
      await textarea.sendKeys('Testing community post - PawPal QA #selenium');

      const postBtn = await driver.findElement(By.xpath("//button[contains(text(),'Post')]"));
      await driver.executeScript('arguments[0].click();', postBtn);
      await driver.sleep(600);

      const feed = await driver.findElement(By.id('community-feed'));
      const posts = await feed.findElements(By.css('.post'));
      if (posts.length === 0) throw new Error('No posts in community feed after posting');
    }));

    // ─── TC-07-08: Post has header with avatar ────────────────────────────────
    results.push(await runTest(driver, 'Community posts have post headers', SUITE, async () => {
      const postHeaders = await driver.findElements(By.css('#community-feed .post-header'));
      if (postHeaders.length === 0) throw new Error('No post headers found in community feed');
    }));

    // ─── TC-07-09: Post has action buttons ────────────────────────────────────
    results.push(await runTest(driver, 'Community posts have action buttons (Like, Comment, Share)', SUITE, async () => {
      const postActions = await driver.findElements(By.css('#community-feed .post-actions'));
      if (postActions.length === 0) throw new Error('No post action bars found');
    }));

    // ─── TC-07-10: Textarea placeholder text ──────────────────────────────────
    results.push(await runTest(driver, 'Post textarea has meaningful placeholder', SUITE, async () => {
      const textarea = await driver.findElement(By.id('new-post'));
      const placeholder = await textarea.getAttribute('placeholder');
      if (!placeholder || placeholder.length === 0) throw new Error('No placeholder on post textarea');
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
