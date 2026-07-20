# PawPal Webpage Step-by-Step Guide

This guide is only for the webpage version of PawPal. It does not require changing the Android app files.

## 1. Open the Webpage Directly

1. Go to this file:
   `/Users/surya/Documents/pawpal/pawpal.html`
2. Double-click it, or open it in a browser.
3. The PawPal webpage will open as a local HTML file.

Alternative webpage file:

`/Users/surya/Documents/pawpal/PawPal-Mobile-App.html`

## 2. Use the Login Page

1. Click `Login`.
2. Enter the existing user details.
3. Click `Continue to Pet Details`.
4. The page will open the pet details form.

## 3. Register a New User

1. Open the Login page.
2. Click `Register New User`.
3. A new register page will open.
4. Enter:
   - Mail ID
   - Password
   - Confirm Password
5. Click `Register`.
6. After registration, the webpage returns to the Login page.
7. Login using the registered mail ID and password.

## 4. Enter Pet Details

1. After login, the pet details page opens.
2. Enter:
   - Pet type
   - Breed
   - Pet name
   - Age
   - Weight
   - Licence number
   - Location
   - Health concern
3. Click `Calculate BMI & Open Dashboard`.
4. The dashboard will open.

## 5. Run With Backend

Use this when you want the webpage to save and load data through the backend.

1. Open Terminal.
2. Go to the PawPal folder:

```sh
cd /Users/surya/Documents/pawpal
```

3. Start the backend:

```sh
node backend/server.js
```

4. Open this URL in the browser:

```text
http://127.0.0.1:8787/PawPal-Mobile-App.html
```

## 6. Run Selenium Tests for Webpage

1. Go to the Selenium folder:

```sh
cd /Users/surya/Documents/pawpal/selenium-e2e-node
```

2. Run the tests:

```sh
npm test
```

3. After the test finishes, open the Excel report:

`/Users/surya/Documents/pawpal/selenium-e2e-node/reports/PawPal_E2E_Excel_Analysis.xlsx`

## 7. Important Files

Main webpage:

`/Users/surya/Documents/pawpal/pawpal.html`

Mobile webpage copy:

`/Users/surya/Documents/pawpal/PawPal-Mobile-App.html`

Backend:

`/Users/surya/Documents/pawpal/backend/server.js`

Selenium tests:

`/Users/surya/Documents/pawpal/selenium-e2e-node`

Excel report:

`/Users/surya/Documents/pawpal/selenium-e2e-node/reports/PawPal_E2E_Excel_Analysis.xlsx`

## 8. Note

The Android folder is not needed for this webpage guide. Do not edit:

`/Users/surya/Documents/pawpal/android`
