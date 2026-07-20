# PawPal Complete Package

PawPal is a professional pet care platform packaged for web and mobile app use. It includes pet profiles, BMI, vaccines, medicines, prescriptions, doctor appointments, doctor login, video consultation preview, caregivers, community, adoption, travel, expenses, payments, reminders, and PetChat AI.

## Web

Open `index.html` directly in a browser, or run the local backend:

```sh
node backend/server.js
```

Then open:

```text
http://localhost:8787
```

The backend stores PawPal data in:

```text
backend/data/pawpal-db.json
```

## Android App

Open the `android/` folder in Android Studio and run the `app` configuration.

The included Android project bundles the same PawPal web experience inside a native WebView and supports camera, microphone, maps, local storage, and backend sync.

If the ready APK is included in `releases/`, install it on an Android phone for quick testing.

## iOS App

Open this Xcode project:

```text
ios/PawPal/PawPal.xcodeproj
```

The iOS app bundles the same PawPal experience and includes camera, microphone, local backend, and external map support.

## Notes

For production, host the backend behind HTTPS, add real authentication, and store medical records in a secured database.
