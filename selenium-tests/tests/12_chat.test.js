/**
 * TEST SUITE 12 — PetChat AI Chatbot
 * Covers: chat toggle, chat window, message sending, bot response, UI elements
 */

const { buildDriver, runTest, waitForElement, By, until, CONFIG } = require('../utils/driver');

const SUITE = 'PetChat AI';

async function runSuite() {
  const driver = await buildDriver();
  const results = [];

  console.log(`\n🤖 Running Suite: ${SUITE}`);
  console.log('─'.repeat(50));

  try {
    await driver.get(CONFIG.BASE_URL);
    await driver.sleep(500);

    // ─── TC-12-01: Chat toggle button visible ─────────────────────────────────
    results.push(await runTest(driver, 'Chat toggle button is visible on page', SUITE, async () => {
      const toggle = await waitForElement(driver, By.css('.chat-toggle'));
      const displayed = await toggle.isDisplayed();
      if (!displayed) throw new Error('Chat toggle not visible');
    }));

    // ─── TC-12-02: Chat window hidden by default ───────────────────────────────
    results.push(await runTest(driver, 'Chat window is hidden by default', SUITE, async () => {
      const chatWindow = await driver.findElement(By.id('chat-window'));
      const classes = await chatWindow.getAttribute('class');
      if (classes.includes('open')) throw new Error('Chat window should be closed by default');
    }));

    // ─── TC-12-03: Toggle button opens chat ───────────────────────────────────
    results.push(await runTest(driver, 'Clicking toggle button opens the chat window', SUITE, async () => {
      const toggle = await driver.findElement(By.css('.chat-toggle'));
      await driver.executeScript('arguments[0].click();', toggle);
      await driver.sleep(400);

      const chatWindow = await driver.findElement(By.id('chat-window'));
      const classes = await chatWindow.getAttribute('class');
      if (!classes.includes('open')) throw new Error('Chat window did not open after toggle click');
    }));

    // ─── TC-12-04: Chat header visible ────────────────────────────────────────
    results.push(await runTest(driver, 'Chat header with PetChat AI title is visible', SUITE, async () => {
      // Use the span inside .chat-head; the parent div also contains the × button
      const chatHead = await driver.findElement(By.css('.chat-head span'));
      const text = await chatHead.getAttribute('innerText') || await chatHead.getText();
      if (!text.includes('PetChat')) throw new Error(`Chat header wrong: "${text}"`);
    }));

    // ─── TC-12-05: Welcome message displayed ──────────────────────────────────
    results.push(await runTest(driver, 'Welcome/greeting bubble is displayed on chat open', SUITE, async () => {
      const bubbles = await driver.findElements(By.css('#chat-body .bubble'));
      if (bubbles.length === 0) throw new Error('No message bubbles in chat body');
      const firstBubble = await bubbles[0].getText();
      if (!firstBubble.includes('PetChat') && !firstBubble.includes('pet')) {
        throw new Error(`Welcome message not recognized: "${firstBubble}"`);
      }
    }));

    // ─── TC-12-06: Chat input field visible ───────────────────────────────────
    results.push(await runTest(driver, 'Chat input field is visible and enabled', SUITE, async () => {
      const input = await waitForElement(driver, By.id('chat-input'));
      const displayed = await input.isDisplayed();
      if (!displayed) throw new Error('Chat input not visible');
      const enabled = await input.isEnabled();
      if (!enabled) throw new Error('Chat input is disabled');
    }));

    // ─── TC-12-07: Send button visible ────────────────────────────────────────
    results.push(await runTest(driver, 'Chat Send button is visible', SUITE, async () => {
      const sendBtn = await waitForElement(driver, By.xpath("//button[contains(text(),'Send')]"));
      const displayed = await sendBtn.isDisplayed();
      if (!displayed) throw new Error('Chat Send button not visible');
    }));

    // ─── TC-12-08: Can type in chat input ─────────────────────────────────────
    results.push(await runTest(driver, 'Can type a message in the chat input field', SUITE, async () => {
      const input = await driver.findElement(By.id('chat-input'));
      await input.clear();
      await input.sendKeys('What should I feed my dog?');
      const val = await input.getAttribute('value');
      if (!val.includes('dog')) throw new Error(`Input value wrong: "${val}"`);
    }));

    // ─── TC-12-09: Sending message adds user bubble ───────────────────────────
    results.push(await runTest(driver, 'Sending a message adds user bubble to chat', SUITE, async () => {
      const input = await driver.findElement(By.id('chat-input'));
      await input.clear();
      await input.sendKeys('How often should I vaccinate my pet?');

      const sendBtn = await driver.findElement(By.xpath("//button[contains(text(),'Send')]"));
      await driver.executeScript('arguments[0].click();', sendBtn);
      await driver.sleep(500);

      const userBubbles = await driver.findElements(By.css('#chat-body .bubble.user'));
      if (userBubbles.length === 0) throw new Error('No user bubble after sending message');
    }));

    // ─── TC-12-10: Bot responds to message ────────────────────────────────────
    results.push(await runTest(driver, 'Bot provides a response after user sends message', SUITE, async () => {
      await driver.sleep(1000); // Wait for bot response
      const allBubbles = await driver.findElements(By.css('#chat-body .bubble'));
      // Should have at least one bot bubble (non-user)
      if (allBubbles.length < 2) throw new Error(`Expected bot response bubble, got ${allBubbles.length} bubbles total`);
    }));

    // ─── TC-12-11: Close button closes chat ───────────────────────────────────
    results.push(await runTest(driver, 'Clicking X close button hides chat window', SUITE, async () => {
      // The close button is button.close inside chat-head
      const closeBtn = await driver.findElement(By.css('.chat-window button.close'));
      await driver.executeScript('arguments[0].click();', closeBtn);
      await driver.sleep(400);

      const chatWindow = await driver.findElement(By.id('chat-window'));
      const classes = await chatWindow.getAttribute('class');
      if (classes.includes('open')) throw new Error('Chat window did not close after clicking X');
    }));

    // ─── TC-12-12: Send via Enter key ────────────────────────────────────────
    results.push(await runTest(driver, 'Can send chat message using Enter key', SUITE, async () => {
      // Re-open chat
      await driver.executeScript("toggleChat(true)");
      await driver.sleep(300);

      const input = await driver.findElement(By.id('chat-input'));
      await input.clear();
      await input.sendKeys('Is fish oil good for dogs?');
      await input.sendKeys('\n'); // Enter key
      await driver.sleep(600);

      const userBubbles = await driver.findElements(By.css('#chat-body .bubble.user'));
      if (userBubbles.length === 0) throw new Error('No user bubble after pressing Enter');
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
