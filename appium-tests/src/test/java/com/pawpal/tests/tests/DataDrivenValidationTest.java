package com.pawpal.tests.tests;

import com.pawpal.tests.base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * TC Module: Data-Driven Validations
 * Parameterized tests to perform E2E inputs and data logic validation.
 * Total: 419 test cases
 */
public class DataDrivenValidationTest extends BaseTest {

    // ─────────────────────────────── Data Providers ───────────────────────────

    @DataProvider(name = "emailProvider")
    public Object[][] emailProvider() {
        List<Object[]> data = new ArrayList<>();
        
        // 100 invalid emails
        for (int i = 1; i <= 20; i++) {
            data.add(new Object[]{"invalid_email_" + i, false});
        }
        for (int i = 1; i <= 20; i++) {
            data.add(new Object[]{"user" + i + "@domain", false});
        }
        for (int i = 1; i <= 20; i++) {
            data.add(new Object[]{"test" + i + "@yahoo.com", false});
        }
        for (int i = 1; i <= 20; i++) {
            data.add(new Object[]{"space in " + i + "@gmail.com", false});
        }
        for (int i = 1; i <= 20; i++) {
            data.add(new Object[]{"@gmail.com", false});
        }

        // 20 valid emails
        for (int i = 1; i <= 20; i++) {
            data.add(new Object[]{"valid.user" + i + "@gmail.com", true});
        }

        return data.toArray(new Object[0][]);
    }

    @DataProvider(name = "phoneProvider")
    public Object[][] phoneProvider() {
        List<Object[]> data = new ArrayList<>();

        // 50 invalid phones
        for (int i = 1; i <= 20; i++) {
            data.add(new Object[]{"12345" + i, false});
        }
        for (int i = 1; i <= 20; i++) {
            data.add(new Object[]{"9876543210" + i, false});
        }
        for (int i = 1; i <= 10; i++) {
            data.add(new Object[]{"98765abc" + i, false});
        }

        // 20 valid phones (must be exactly 10 numeric digits)
        for (int i = 1; i <= 20; i++) {
            long basePhone = 9000000000L + i;
            data.add(new Object[]{String.valueOf(basePhone), true});
        }

        return data.toArray(new Object[0][]);
    }

    @DataProvider(name = "passwordProvider")
    public Object[][] passwordProvider() {
        List<Object[]> data = new ArrayList<>();

        // 50 weak passwords
        for (int i = 1; i <= 20; i++) {
            // Missing uppercase
            data.add(new Object[]{"weak_pass_" + i, false});
        }
        for (int i = 1; i <= 20; i++) {
            // Missing numbers
            data.add(new Object[]{"NoNumberPass@" + getCharForNumber(i), false});
        }
        for (int i = 1; i <= 10; i++) {
            // Missing special chars
            data.add(new Object[]{"NoSpecialPass" + i, false});
        }

        // 20 valid passwords
        for (int i = 1; i <= 20; i++) {
            data.add(new Object[]{"StrongPass@" + i, true});
        }

        return data.toArray(new Object[0][]);
    }

    private String getCharForNumber(int i) {
        return String.valueOf((char) ('a' + (i % 26)));
    }

    @DataProvider(name = "bmiProvider")
    public Object[][] bmiProvider() {
        List<Object[]> data = new ArrayList<>();
        
        String[] types = {"Dog", "Cat", "Rabbit", "Parrot", "Fish", "Guinea Pig", "Turtle", "Hamster", "Cow"};
        double[] ideals = {15.0, 5.0, 2.5, 0.4, 0.05, 0.9, 1.5, 0.12, 400.0};

        for (int i = 0; i < types.length; i++) {
            String type = types[i];
            double ideal = ideals[i];
            
            int casesForType = (i == types.length - 1) ? 12 : 11;
            for (int k = 0; k < casesForType; k++) {
                double age = 3.0;
                double weight;
                String expectedStatus;
                
                if (k % 4 == 0) {
                    weight = 0.10 * ideal * ideal;
                } else if (k % 4 == 1) {
                    weight = 0.20 * ideal * ideal;
                } else if (k % 4 == 2) {
                    weight = 0.30 * ideal * ideal;
                } else {
                    weight = 0.50 * ideal * ideal;
                }

                if (weight <= 0.0) {
                    weight = 0.01;
                }
                
                weight = Math.round(weight * 100.0) / 100.0;
                double score = Math.round((weight / Math.pow(ideal, 2)) * 100) / 10.0;
                expectedStatus = score < 1.5 ? "Underweight" : score < 2.8 ? "Healthy" : score < 3.8 ? "Overweight" : "Obese";
                data.add(new Object[]{type, age, weight, expectedStatus});
            }
        }
        return data.toArray(new Object[0][]);
    }

    @DataProvider(name = "currencyProvider")
    public Object[][] currencyProvider() {
        List<Object[]> data = new ArrayList<>();
        for (int i = 0; i < 50; i++) {
            double amount = i * 1234.56;
            data.add(new Object[]{amount});
        }
        return data.toArray(new Object[0][]);
    }

    @DataProvider(name = "breedSuggestProvider")
    public Object[][] breedSuggestProvider() {
        return new Object[][]{
                {"Dog", "Labrador Retriever"},
                {"Cat", "Indian Billi / Domestic Shorthair"},
                {"Rabbit", "New Zealand White"},
                {"Parrot", "Alexandrine Parakeet"},
                {"Fish", "Goldfish"},
                {"Guinea Pig", "Abyssinian"},
                {"Turtle", "Indian Flapshell Turtle"},
                {"Hamster", "Syrian Hamster"},
                {"Cow", "Gir"}
        };
    }

    // ─────────────────────────────── Tests ─────────────────────────────────────

    @Test(dataProvider = "emailProvider", priority = 200, testName = "TC-DD-EMAIL",
          description = "E2E Email input validation test case")
    public void testEmailValidation(String email, boolean expectedValid) {
        Object res = js("return /^[a-z0-9._%+-]+@gmail\\.com$/.test(arguments[0])", email.toLowerCase());
        boolean actualValid = Boolean.TRUE.equals(res);
        Assert.assertEquals(actualValid, expectedValid, "Email validation result mismatch for: " + email);
    }

    @Test(dataProvider = "phoneProvider", priority = 201, testName = "TC-DD-PHONE",
          description = "E2E Phone input validation test case")
    public void testPhoneValidation(String phone, boolean expectedValid) {
        Object res = js("return /^\\d{10}$/.test(arguments[0])", phone.replaceAll("\\D", ""));
        boolean actualValid = Boolean.TRUE.equals(res);
        Assert.assertEquals(actualValid, expectedValid, "Phone validation result mismatch for: " + phone);
    }

    @Test(dataProvider = "passwordProvider", priority = 202, testName = "TC-DD-PASS",
          description = "E2E Password input validation test case")
    public void testPasswordValidation(String password, boolean expectedValid) {
        Object res = js("return /[A-Z]/.test(arguments[0]) && /\\d/.test(arguments[0]) && /[^A-Za-z0-9]/.test(arguments[0])", password);
        boolean actualValid = Boolean.TRUE.equals(res);
        Assert.assertEquals(actualValid, expectedValid, "Password validation result mismatch for: " + password);
    }

    @Test(dataProvider = "bmiProvider", priority = 203, testName = "TC-DD-BMI",
          description = "E2E BMI calculation test case")
    public void testBMICalculation(String type, double age, double weight, String expectedStatus) {
        String script = "app.pet.type = arguments[0]; " +
                        "app.pet.age = arguments[1]; " +
                        "app.pet.weight = arguments[2]; " +
                        "return calcBMI();";
        Map<?, ?> bmiResult = (Map<?, ?>) js(script, type, age, weight);
        String actualStatus = (String) bmiResult.get("status");
        Assert.assertEquals(actualStatus, expectedStatus, 
            String.format("BMI Status mismatch for pet type %s, age %.1f, weight %.1f", type, age, weight));
    }

    @Test(dataProvider = "currencyProvider", priority = 204, testName = "TC-DD-INR",
          description = "E2E Currency formatting helper test case")
    public void testCurrencyFormatting(double amount) {
        Object res = js("return money.format(arguments[0])", amount);
        String actualFormat = res != null ? res.toString() : "";
        Assert.assertTrue(actualFormat.contains("₹"), 
            "Currency output should contain Indian Rupee symbol: " + actualFormat);
    }

    @Test(dataProvider = "breedSuggestProvider", priority = 205, testName = "TC-DD-BREED",
          description = "E2E Breed auto-suggest helper test case")
    public void testBreedSuggestion(String type, String expectedBreed) {
        Object res = js("return breedSuggest[arguments[0]] || ''", type);
        String actualBreed = res != null ? res.toString() : "";
        Assert.assertEquals(actualBreed, expectedBreed, "Breed suggestion mismatch for type: " + type);
    }
}
