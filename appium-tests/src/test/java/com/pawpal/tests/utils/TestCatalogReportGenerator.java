package com.pawpal.tests.utils;

import com.pawpal.tests.tests.*;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.lang.reflect.Method;
import java.util.Arrays;

/** Generates the reference-style catalog for all 539 configured Appium cases. */
public final class TestCatalogReportGenerator {

    private static final Class<?>[] TEST_CLASSES = {
            ActivityLogTest.class, AdoptionTest.class, CaregiversTest.class,
            CommunityTest.class, DashboardTest.class, DataDrivenValidationTest.class,
            DoctorAppointmentTest.class, DoctorLoginTest.class, ExpenseTrackerTest.class,
            HealthTrackerTest.class, HomePageTest.class, LoginTest.class,
            NavigationTest.class, OnboardingTest.class, PetChatTest.class,
            ProductsTrainingTest.class, RegistrationTest.class, TravelTest.class
    };

    private TestCatalogReportGenerator() {}

    public static void main(String[] args) throws Exception {
        int count = 0;

        for (Class<?> testClass : TEST_CLASSES) {
            Object instance = testClass.getDeclaredConstructor().newInstance();
            String module = testClass.getSimpleName().replace("Test", "");

            for (Method method : testClass.getDeclaredMethods()) {
                Test test = method.getAnnotation(Test.class);
                if (test == null || !test.enabled()) continue;

                if (test.dataProvider().isEmpty()) {
                    record(module, test.testName(), method.getName(), test.description(), null);
                    count++;
                    continue;
                }

                Object[][] rows = invokeProvider(instance, testClass, test.dataProvider());
                for (int i = 0; i < rows.length; i++) {
                    String indexedId = test.testName() + "-" + String.format("%03d", i + 1);
                    record(module, indexedId, method.getName(), test.description(), rows[i]);
                    count++;
                }
            }
        }

        if (count != 539) {
            throw new IllegalStateException("Expected 539 cases but discovered " + count);
        }

        ExcelReporter.generateReport(
                "PawPal_539_Test_Case_Report.xlsx",
                "PawPal Android Appium - 539 E2E Test Case Catalog");
        System.out.println("Generated reference-style catalog with " + count + " test cases.");
    }

    private static Object[][] invokeProvider(Object instance, Class<?> testClass,
                                             String providerName) throws Exception {
        for (Method candidate : testClass.getDeclaredMethods()) {
            DataProvider provider = candidate.getAnnotation(DataProvider.class);
            if (provider != null && providerName.equals(provider.name())) {
                return (Object[][]) candidate.invoke(instance);
            }
        }
        throw new IllegalStateException("Missing data provider: " + providerName);
    }

    private static void record(String module, String id, String methodName,
                               String description, Object[] parameters) {
        String name = methodName;
        if (parameters != null) name += " " + Arrays.toString(parameters);
        if (description != null && !description.isBlank()) name += " - " + description;
        ExcelReporter.record(module, id, name, "READY", 0,
                "Not executed. Run ./run_tests.sh with an Android device or emulator.");
    }
}
