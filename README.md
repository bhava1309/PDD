# PawPal

PawPal is a mobile-ready pet care app built from a single HTML experience. It includes pet profiles, BMI, vaccines, medicines, prescriptions, appointments, caregivers, community, adoption, travel, expenses, and PetChat AI.

The Android build also includes a doctor workflow: separate doctor login, doctor profile dashboard, today's patient appointments, Dog 360 patient records, prescription notes, and camera-enabled video consultation screens.

## Run locally

Start the PawPal backend and web app from this folder:

```sh
node backend/server.js
```

Then open `http://localhost:8787` in a browser. The backend saves the app profile, pet details, vaccines, medicines, expenses, activities, community posts, bookings, adoption meetings, caregiver hires, and product orders in `backend/data/pawpal-db.json`.

## Android app

An Android WebView project is included in `android/`. It bundles the working PawPal app from `android/app/src/main/assets/index.html`, so it works offline with local device storage and can sync to the backend when a reachable API URL is configured.

Use this ready install file for testing on a phone:

```text
/Users/surya/Documents/pawpal/PawPal-Android-Install.apk
```

For beginner-friendly phone installation and backend connection steps, open:

```text
/Users/surya/Documents/pawpal/ANDROID_INSTALL_AND_BACKEND_GUIDE.txt
```

To build it, install Android Studio or Android SDK + Gradle, then open the `android/` folder in Android Studio and run the `app` configuration. The generated APK will be under `android/app/build/outputs/apk/`.

## iOS app

A native iOS Xcode project is included in `ios/PawPal/`. It bundles the same PawPal app, uses the PawPal icon, supports camera and microphone permissions for video consultation, allows local backend HTTP access, and opens map links externally.

Open this in Xcode:

```text
/Users/surya/Documents/pawpal/ios/PawPal/PawPal.xcodeproj
```

Beginner iPhone installation steps are in:

```text
/Users/surya/Documents/pawpal/IOS_INSTALL_GUIDE.txt
```

## Capacitor option

The project also keeps Capacitor config for future native wrappers:

```sh
npm run build:web
npm run cap:add:android
npm run cap:sync
```

This machine currently needs `npm`/`npx` and Android build tools installed before the Capacitor commands can run.

## Notes

The built-in PetChat behavior is browser-based demo logic, so it works without an API key. For production, put the backend behind HTTPS, add account authentication, and store medical records in a secured database.

## QA verification

The repository includes separate verification suites and Excel reports for:

- Website Selenium E2E testing
- Android Appium testing
- Backend vulnerability testing
- API baseline/load testing

The GitHub Actions workflow at `.github/workflows/unified_reports.yml` runs deployment verification, backend checks, frontend build validation, API load testing, Selenium E2E testing, and report consolidation on every push to `main` and on pull requests. Detailed reports are available in `outputs/` and in each workflow run's artifacts.
