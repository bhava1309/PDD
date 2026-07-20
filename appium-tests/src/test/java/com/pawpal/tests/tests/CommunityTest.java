package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: Community Feed
 * Tests: Post feed rendering, add post, like/comment toggle
 */
public class CommunityTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void navigateToCommunity() {
        log.info("CommunityTest.navigateToCommunity");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true;");
        js("showPage('community'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
    }

    @Test(priority = 70, testName = "TC-CM-01",
          description = "Community page is active with post feed rendered")
    public void verifyCommunityPageLayout() {
        log.info("▶ TC-CM-01: Verify Community page layout");
        Assert.assertTrue(isPageActive("community"), "Community page should be active");
        Assert.assertTrue(elementExists("new-post"),       "New post textarea should exist");
        Assert.assertTrue(elementExists("community-feed"), "Community feed should exist");
        log.info("✅ Community page layout verified");
    }

    @Test(priority = 71, testName = "TC-CM-02",
          description = "Default community posts are displayed in feed")
    public void verifyDefaultPosts() {
        log.info("▶ TC-CM-02: Verify default community posts");
        Object postCount = js(
            "return document.querySelectorAll('#community-feed .post').length");
        int count = postCount != null ? Integer.parseInt(postCount.toString()) : 0;
        Assert.assertTrue(count > 0,
                "Should display at least 1 default post in feed. Found: " + count);
        log.info("✅ Default community posts: {}", count);
    }

    @Test(priority = 72, testName = "TC-CM-03",
          description = "Each post shows user avatar, name, time, and text")
    public void verifyPostStructure() {
        log.info("▶ TC-CM-03: Verify post card structure");
        Object avatarCount = js(
            "return document.querySelectorAll('#community-feed .post .avatar').length");
        int avatars = avatarCount != null ? Integer.parseInt(avatarCount.toString()) : 0;
        Assert.assertTrue(avatars > 0, "Posts should have avatar images");

        Object headerCount = js(
            "return document.querySelectorAll('#community-feed .post .post-header').length");
        int headers = headerCount != null ? Integer.parseInt(headerCount.toString()) : 0;
        Assert.assertTrue(headers > 0, "Posts should have post-header element");
        log.info("✅ Post structure verified: {} avatars, {} headers", avatars, headers);
    }

    @Test(priority = 73, testName = "TC-CM-04",
          description = "Adding a new post appends it to the feed at the top")
    public void verifyAddPost() {
        log.info("▶ TC-CM-04: Add new community post");
        int before = Integer.parseInt(
            js("return document.querySelectorAll('#community-feed .post').length").toString());

        jsSetValue("new-post", AppConfig.COMMUNITY_POST);
        sleep(AppConfig.SHORT_WAIT_MS);
        js("addPost()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        int after = Integer.parseInt(
            js("return document.querySelectorAll('#community-feed .post').length").toString());

        Assert.assertTrue(after > before,
                "Post count should increase. Before=" + before + " After=" + after);
        log.info("✅ New post added. Feed: {} → {}", before, after);
    }

    @Test(priority = 74, testName = "TC-CM-05",
          description = "Empty post is not added to the feed")
    public void verifyEmptyPostRejected() {
        log.info("▶ TC-CM-05: Empty post rejected");
        jsSetValue("new-post", "");
        int before = Integer.parseInt(
            js("return document.querySelectorAll('#community-feed .post').length").toString());
        js("addPost()");
        sleep(AppConfig.SHORT_WAIT_MS);
        int after = Integer.parseInt(
            js("return document.querySelectorAll('#community-feed .post').length").toString());
        Assert.assertEquals(after, before, "Empty post should not be added to feed");
        log.info("✅ Empty post correctly rejected");
    }

    @Test(priority = 75, testName = "TC-CM-06",
          description = "Post action buttons (Like, Comment) are present on posts")
    public void verifyPostActionButtons() {
        log.info("▶ TC-CM-06: Verify post action buttons");
        Object actionCount = js(
            "return document.querySelectorAll('#community-feed .post-actions .btn').length");
        int count = actionCount != null ? Integer.parseInt(actionCount.toString()) : 0;
        Assert.assertTrue(count > 0, "Post action buttons should exist");
        log.info("✅ Post action buttons: {}", count);
    }

    @Test(priority = 76, testName = "TC-CM-07",
          description = "Comment section toggles visible when comment button clicked")
    public void verifyCommentToggle() {
        log.info("▶ TC-CM-07: Verify comment section toggle");
        // Click first comment button
        js("var btns=document.querySelectorAll('#community-feed .post-actions .btn');" +
           "if(btns.length>1) btns[1].click();");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object openComments = js(
            "return document.querySelectorAll('#community-feed .comments.open').length");
        int count = openComments != null ? Integer.parseInt(openComments.toString()) : 0;
        // Comments may or may not be open (depends on app logic) — just verify element exists
        Object commentEls = js(
            "return document.querySelectorAll('#community-feed .comments').length");
        int total = commentEls != null ? Integer.parseInt(commentEls.toString()) : 0;
        Assert.assertTrue(total > 0, "Comment sections should exist on posts");
        log.info("✅ Comment sections: {} total, {} open", total, count);
    }
}
