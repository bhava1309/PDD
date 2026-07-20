package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import com.pawpal.tests.config.AppConfig;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * TC Module: Expense Tracker
 * Tests: Add expense, total update, expense list, empty validation
 */
public class ExpenseTrackerTest extends BaseTest {

    @BeforeClass(alwaysRun = true)
    public void navigateToExpenses() {
        log.info("ExpenseTrackerTest.navigateToExpenses");
        js("sessionLoggedIn=true; sessionProfileComplete=true; app.loggedIn=true; app.profileComplete=true;");
        js("showPage('expenses'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);
    }

    @Test(priority = 60, testName = "TC-ET-01",
          description = "Expense Tracker page is active with Add and View panels")
    public void verifyExpensesPageLayout() {
        log.info("▶ TC-ET-01: Verify Expense Tracker layout");
        Assert.assertTrue(isPageActive("expenses"), "Expenses page should be active");
        Assert.assertTrue(elementExists("expense-title"),  "Expense title field should exist");
        Assert.assertTrue(elementExists("expense-amount"), "Expense amount field should exist");
        Assert.assertTrue(elementExists("expense-list"),   "Expense list should exist");
        Assert.assertTrue(elementExists("expense-total"),  "Expense total should exist");
        log.info("✅ Expense Tracker layout verified");
    }

    @Test(priority = 61, testName = "TC-ET-02",
          description = "Default expenses are shown in the list with total")
    public void verifyDefaultExpenses() {
        log.info("▶ TC-ET-02: Verify default expenses");
        Object itemCount = js(
            "return document.querySelectorAll('#expense-list li').length");
        int count = itemCount != null ? Integer.parseInt(itemCount.toString()) : 0;
        Assert.assertTrue(count > 0, "Default expenses should be listed");

        String total = jsGetText("expense-total");
        Assert.assertTrue(total.contains("₹"),
                "Total should contain ₹ symbol. Got: " + total);
        log.info("✅ Default expenses: {} items, Total: '{}'", count, total);
    }

    @Test(priority = 62, testName = "TC-ET-03",
          description = "Adding valid expense increases list count and total")
    public void verifyAddExpense() {
        log.info("▶ TC-ET-03: Add new expense");
        String totalBefore = jsGetText("expense-total");
        int listBefore = Integer.parseInt(
            js("return document.querySelectorAll('#expense-list li').length").toString());

        jsSetValue("expense-title",  AppConfig.EXPENSE_TITLE);
        jsSetValue("expense-amount", AppConfig.EXPENSE_AMOUNT);
        sleep(AppConfig.SHORT_WAIT_MS);
        js("addExpense()");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        int listAfter = Integer.parseInt(
            js("return document.querySelectorAll('#expense-list li').length").toString());
        String totalAfter = jsGetText("expense-total");

        Assert.assertTrue(listAfter > listBefore,
                "Expense list should grow. Before=" + listBefore + " After=" + listAfter);
        Assert.assertNotEquals(totalAfter, totalBefore,
                "Total should change after adding expense");
        log.info("✅ Expense added. Items: {} → {}, Total: {} → {}",
                listBefore, listAfter, totalBefore, totalAfter);
    }

    @Test(priority = 63, testName = "TC-ET-04",
          description = "Empty expense title is rejected")
    public void verifyEmptyExpenseTitleRejected() {
        log.info("▶ TC-ET-04: Empty expense title rejected");
        jsSetValue("expense-title",  "");
        jsSetValue("expense-amount", "500");
        int before = Integer.parseInt(
            js("return document.querySelectorAll('#expense-list li').length").toString());
        js("addExpense()");
        sleep(AppConfig.SHORT_WAIT_MS);
        int after = Integer.parseInt(
            js("return document.querySelectorAll('#expense-list li').length").toString());
        Assert.assertEquals(after, before, "Empty expense title should not be added");
        log.info("✅ Empty expense title rejected");
    }

    @Test(priority = 64, testName = "TC-ET-05",
          description = "Zero amount expense is rejected")
    public void verifyZeroAmountExpenseRejected() {
        log.info("▶ TC-ET-05: Zero amount expense rejected");
        jsSetValue("expense-title",  "Test Item");
        jsSetValue("expense-amount", "0");
        int before = Integer.parseInt(
            js("return document.querySelectorAll('#expense-list li').length").toString());
        js("addExpense()");
        sleep(AppConfig.SHORT_WAIT_MS);
        int after = Integer.parseInt(
            js("return document.querySelectorAll('#expense-list li').length").toString());
        Assert.assertEquals(after, before, "Zero amount expense should not be added");
        log.info("✅ Zero amount expense rejected");
    }

    @Test(priority = 65, testName = "TC-ET-06",
          description = "Expense total reflects in Dashboard monthly expenses card")
    public void verifyExpenseTotalOnDashboard() {
        log.info("▶ TC-ET-06: Verify expense total on dashboard");
        js("showPage('dashboard'); renderAll();");
        sleep(AppConfig.MEDIUM_WAIT_MS);

        String dashExpense = jsGetText("dash-expense");
        Assert.assertFalse(dashExpense.isEmpty(), "Dashboard should show expense total");
        Assert.assertTrue(dashExpense.contains("₹"),
                "Dashboard expense should contain ₹. Got: " + dashExpense);
        log.info("✅ Dashboard expense total: '{}'", dashExpense);
    }
}
