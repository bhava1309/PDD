# PawPal Android Appium E2E Testing

This is a separate test project. It does not modify the PawPal Android source or APK.

## Coverage

- App launch and home page
- User login validation and successful login
- Separate New User registration page and return to login
- Pet details onboarding
- Dashboard and navigation
- Health, BMI, vaccine, medicine, prescription and calendar
- Activity and expense tracking
- Community posts
- Adoption
- Travel search
- Doctor appointments and doctor login
- Caregivers
- Products and training
- PetChat
- Data-driven validation combinations

The suite contains more than 400 executions when the data-driven combinations run.

## One-time setup

1. Open Android Studio Device Manager.
2. Start the `Pixel_10` emulator, or connect an Android phone with USB debugging enabled.
3. Ensure Java, Maven, Node.js, Appium 2 and the Appium UiAutomator2 driver are installed.
4. If UiAutomator2 is missing, run `appium driver install uiautomator2` once.

## Run all tests

From this folder:

```bash
./run_tests.sh
```

To select another APK or device:

```bash
./run_tests.sh --apk "/absolute/path/PawPal.apk" --device "emulator-5554"
```

The runner detects the Android version and starts the local Appium server when needed.
It also enables automatic matching of ChromeDriver to the Android System WebView.
Use a different port if another Appium server is already running:

```bash
./run_tests.sh --server "http://127.0.0.1:4725"
```

## Reports

- Excel analysis: `test-output/reports/PawPal_E2E_Test_Report.xlsx`
- TestNG HTML: `target/surefire-reports/emailable-report.html`
- Failure screenshots: `test-output/screenshots/`
- Appium log: `test-output/appium-server.log`
- Test console log: `test-output/console.log`

The Excel workbook contains a cover page, module summary, pass/fail/skip totals, execution time and detailed test results.
