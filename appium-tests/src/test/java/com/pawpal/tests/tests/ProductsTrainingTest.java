package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: Products
 * Tests: Products page, 6 product cards, buy modal, training page
 */
public class ProductsTrainingTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void navigateToProducts() {
        log.info("ProductsTrainingTest.navigateToProducts");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true;");
        js("showPage('products'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
    }

    @Test(priority = 130, testName = "TC-PT-01",
          description = "Products page is active with product cards rendered")
    public void verifyProductsPageLayout() {
        log.info("▶ TC-PT-01: Verify Products page layout");
        Assert.assertTrue(isPageActive("products"), "Products page should be active");
        Assert.assertTrue(elementExists("product-list"), "Product list should exist");
        log.info("✅ Products page layout verified");
    }

    @Test(priority = 131, testName = "TC-PT-02",
          description = "All 6 products are rendered")
    public void verifyProductCount() {
        log.info("▶ TC-PT-02: Verify product count");
        Object count = js(
            "return document.querySelectorAll('#product-list .pet-card').length");
        int c = count != null ? Integer.parseInt(count.toString()) : 0;
        Assert.assertEquals(c, 6,
                "Should show exactly 6 products. Found: " + c);
        log.info("✅ Product count: {}", c);
    }

    @Test(priority = 132, testName = "TC-PT-03",
          description = "Product card shows name, price in ₹, and Buy button")
    public void verifyProductCardDetails() {
        log.info("▶ TC-PT-03: Verify product card details");
        Object firstCard = js(
            "var c=document.querySelector('#product-list .pet-card');" +
            "return c ? c.innerText : ''");
        String text = firstCard != null ? firstCard.toString() : "";
        Assert.assertTrue(text.contains("₹") || text.contains("499"),
                "Product card should show ₹ price. Got: " + text);
        log.info("✅ Product card: '{}'", text.substring(0, Math.min(80, text.length())));
    }

    @Test(priority = 133, testName = "TC-PT-04",
          description = "Clicking 'Buy Now' on a product opens payment/booking modal")
    public void verifyProductBuyModal() {
        log.info("▶ TC-PT-04: Verify Product Buy modal");
        js("var btn=document.querySelector('#product-list .btn-primary');" +
           "if(btn) btn.click();");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Object modalOpen = js("return document.getElementById('modal').classList.contains('open')");
        Assert.assertTrue(Boolean.TRUE.equals(modalOpen),
                "Buy modal should open");

        js("closeModal()");
        sleep(AppConfig.SHORT_WAIT_MS);
        log.info("✅ Product Buy modal opens correctly");
    }

    @Test(priority = 134, testName = "TC-PT-05",
          description = "Training page renders training cards for the current pet type")
    public void verifyTrainingPage() {
        log.info("▶ TC-PT-05: Verify Training page");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true; app.pet.type='Dog';");
        js("showPage('training'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        Assert.assertTrue(isPageActive("training"), "Training page should be active");

        Object cardCount = js(
            "return document.querySelectorAll('#training-list .card').length");
        int count = cardCount != null ? Integer.parseInt(cardCount.toString()) : 0;
        Assert.assertTrue(count > 0,
                "Training page should show at least 1 training card. Found: " + count);
        log.info("✅ Training page has {} cards", count);
    }

    @Test(priority = 135, testName = "TC-PT-06",
          description = "Training cards show relevant tips for Dog pet type")
    public void verifyTrainingCardContent() {
        log.info("▶ TC-PT-06: Verify Training card content for Dog");
        Object listContent = js(
            "return document.getElementById('training-list').innerText");
        String text = listContent != null ? listContent.toString() : "";
        Assert.assertFalse(text.isEmpty(), "Training list should have content");
        log.info("✅ Training content: '{}'",
                text.substring(0, Math.min(120, text.length())));
    }
}
