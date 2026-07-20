package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: PetChat AI
 * Tests: Chat toggle, send message, response received, chat clear/close
 */
public class PetChatTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void openChatWindow() {
        log.info("PetChatTest.openChatWindow");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true;");
        js("showPage('dashboard'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
        js("toggleChat(true)");
        sleep(AppConfig.MEDIUM_WAIT_MS);
    }

    @Test(priority = 140, testName = "TC-PC-01",
          description = "PetChat window opens when toggle is clicked")
    public void verifyChatWindowOpens() {
        log.info("▶ TC-PC-01: Verify chat window opens");
        Object chatOpen = js("return document.getElementById('chat-window').classList.contains('open')");
        Assert.assertTrue(Boolean.TRUE.equals(chatOpen), "Chat window should be open");
        log.info("✅ Chat window is open");
    }

    @Test(priority = 141, testName = "TC-PC-02",
          description = "Chat window shows initial greeting bubble")
    public void verifyInitialGreeting() {
        log.info("▶ TC-PC-02: Verify initial chat greeting");
        Object bubbleCount = js(
            "return document.querySelectorAll('#chat-body .bubble').length");
        int count = bubbleCount != null ? Integer.parseInt(bubbleCount.toString()) : 0;
        Assert.assertTrue(count > 0, "Chat should have initial greeting bubble");

        Object greeting = js(
            "var b=document.querySelector('#chat-body .bubble');" +
            "return b ? b.innerText : ''");
        String text = greeting != null ? greeting.toString() : "";
        Assert.assertTrue(text.contains("PetChat") || text.contains("pet") || text.contains("Hi"),
                "Greeting should mention PetChat or pet. Got: " + text);
        log.info("✅ Initial greeting: '{}'", text.substring(0, Math.min(80, text.length())));
    }

    @Test(priority = 142, testName = "TC-PC-03",
          description = "Typing and sending a message adds user bubble to chat")
    public void verifySendMessage() {
        log.info("▶ TC-PC-03: Send chat message");
        int before = Integer.parseInt(
            js("return document.querySelectorAll('#chat-body .bubble').length").toString());

        jsSetValue("chat-input", "What food is good for my Labrador?");
        sleep(AppConfig.SHORT_WAIT_MS);
        js("sendChat()");
        sleep(AppConfig.PAGE_LOAD_WAIT_SECS * 200L);  // 6s for AI response

        int after = Integer.parseInt(
            js("return document.querySelectorAll('#chat-body .bubble').length").toString());

        Assert.assertTrue(after > before,
                "Bubble count should increase after sending message. Before=" + before + " After=" + after);
        log.info("✅ Chat message sent. Bubbles: {} → {}", before, after);
    }

    @Test(priority = 143, testName = "TC-PC-04",
          description = "Chat input is cleared after sending a message")
    public void verifyChatInputCleared() {
        log.info("▶ TC-PC-04: Verify chat input is cleared after send");
        String inputValue = jsGetText("chat-input");
        Assert.assertTrue(inputValue == null || inputValue.isEmpty(),
                "Chat input should be cleared after sending. Got: " + inputValue);
        log.info("✅ Chat input cleared after send");
    }

    @Test(priority = 144, testName = "TC-PC-05",
          description = "AI bot responds with a text bubble (not empty)")
    public void verifyBotResponse() {
        log.info("▶ TC-PC-05: Verify bot response bubble");
        Object lastBubble = js(
            "var bubbles=document.querySelectorAll('#chat-body .bubble');" +
            "return bubbles.length > 0 ? bubbles[bubbles.length-1].innerText : ''");
        String resp = lastBubble != null ? lastBubble.toString().trim() : "";
        Assert.assertFalse(resp.isEmpty(), "Bot should respond with non-empty text");
        log.info("✅ Bot response: '{}'", resp.substring(0, Math.min(100, resp.length())));
    }

    @Test(priority = 145, testName = "TC-PC-06",
          description = "Chat window closes when close button is clicked")
    public void verifyChatCloses() {
        log.info("▶ TC-PC-06: Verify chat window closes");
        js("toggleChat(false)");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object chatOpen = js("return document.getElementById('chat-window').classList.contains('open')");
        Assert.assertFalse(Boolean.TRUE.equals(chatOpen), "Chat window should be closed");
        log.info("✅ Chat window closed successfully");
    }

    @Test(priority = 146, testName = "TC-PC-07",
          description = "Pressing Enter key in chat input sends message")
    public void verifyEnterKeySendsMessage() {
        log.info("▶ TC-PC-07: Verify Enter key sends message");
        js("toggleChat(true)");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        int before = Integer.parseInt(
            js("return document.querySelectorAll('#chat-body .bubble').length").toString());

        jsSetValue("chat-input", "What vaccines does a puppy need?");
        sleep(AppConfig.SHORT_WAIT_MS);

        // Simulate Enter key press
        js("var evt=new KeyboardEvent('keydown',{key:'Enter',bubbles:true});" +
           "document.getElementById('chat-input').dispatchEvent(evt);");
        sleep(AppConfig.PAGE_LOAD_WAIT_SECS * 150L);

        int after = Integer.parseInt(
            js("return document.querySelectorAll('#chat-body .bubble').length").toString());
        Assert.assertTrue(after > before,
                "Enter key should send message. Before=" + before + " After=" + after);

        js("toggleChat(false)");
        sleep(AppConfig.SHORT_WAIT_MS);
        log.info("✅ Enter key sends message. Bubbles: {} → {}", before, after);
    }
}
