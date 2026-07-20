# PawPal Android APK Code Guide

## What to Open in Android Studio

Open this folder in Android Studio:

`android`

The Android app entry point is:

`android/app/src/main/java/com/pawpal/app/MainActivity.java`

The APK user interface and app logic are bundled as one file:

`android/app/src/main/assets/index.html`

A GitHub-friendly copy of the same single-file app is also provided at:

`PawPal-Android-App-SingleFile.html`

## Built APK

The latest generated APK is:

`PawPal-Android-Install.apk`

The Gradle debug output APK is:

`android/app/build/outputs/apk/debug/app-debug.apk`

## How the APK Is Different From the Webpage

The webpage and APK are no longer the same visual experience.

The Android APK uses:

- Android-only fixed top app bar.
- Left hamburger drawer with Pet Products, Expenses, Training, Caregivers, Health, Community, Adoption, Travel, and Doctor Appointment.
- Android-style bottom navigation.
- Compact mobile-first cards and 8px controls.
- App-only splash launch with the PawPal logo.
- Android permissions for camera, microphone, and location.

The Android-only code is inside:

`android/app/src/main/assets/index.html`

## Backend Code

PawPal uses Supabase through REST calls from the bundled single-file app.

Backend configuration lives in the `supabaseConfig` object:

- `url`: Supabase project URL.
- `key`: Supabase anon key.
- `table`: `pawpal_state`.
- `rowId`: shared app state row.

Backend functions:

- `supabaseRequest()` sends REST calls to Supabase.
- `readCloudState()` loads saved PawPal data.
- `writeCloudState()` saves owner, pet, appointments, expenses, reminders, community, travel, and caregiver data.
- `syncBackendSoon()` batches saves after user actions.
- `initBackend()` loads online state when the app starts.
- `pullBackendState()` refreshes cloud state while the app is open.

The SQL needed for Supabase is in:

`SUPABASE_SETUP.sql`

## Feature Map

- Splash logo animation: `.splash-page`, `.splash-logo`, `finishSplash()`.
- Login validation: `validateLoginDetails()`.
- Doctor login validation: `validateDoctorLoginDetails()`.
- Pet profile save: `savePet()`.
- BMI: `calcBMI()` and `renderDashboard()`.
- Pet portfolio: `dashboard-page` and `renderDashboard()`.
- Add pet details: `onboarding-page`.
- Health tracker: `health-page`, `renderHealth()`, `addVaccine()`, `addMedicine()`, `savePrescription()`.
- Device location: `useDeviceLocation()` plus Android geolocation permission in `MainActivity.java`.
- Google Maps links: `openGoogleMap()`, `mapEmbedUrl()`, `launchMap()`.
- Daily activity: `activity-page`, `addActivity()`, `renderActivities()`.
- Reminders: `scheduleReminder()`, `checkReminderNotifications()`, `showReminders()`.
- Pet products: `products-page`, `renderProducts()`, `orderProduct()`.
- Expenses: `expenses-page`, `addExpense()`, `renderExpenses()`.
- Caregivers: `caregivers-page`, `renderCaregivers()`, `bookCaregiver()`.
- Community: `community-page`, `renderCommunity()`, `addPost()`, `addComment()`.
- Adoption: `adoption-page`, `renderAdoption()`, `bookAdoptionMeet()`.
- Travel hotels: `travel-page`, `renderTravel()`, `bookTravel()`.
- Doctor appointment: `doctors-page`, `renderDoctors()`, `bookDoctorAppointment()`.
- Online meeting: `startVideoConsultation()` uses camera and microphone.
- Doctor portal: `doctor-portal-page`, `renderDoctorPortal()`, `openPet360()`.
- PetChat AI: `toggleChat()`, `sendChat()`, `buildPetChatReply()`.
- Payment flow: `openPaymentGateway()` records payment and supports Razorpay test configuration.

## Android Native Wrapper

`MainActivity.java` loads the single-file app from:

`file:///android_asset/index.html`

It enables:

- JavaScript.
- Local storage.
- Camera permission for video consultation.
- Microphone permission for online appointment.
- Geolocation permission for pet location.
- External Google Maps opening.

## Build Command

From the `android` folder:

`./gradlew :app:assembleDebug`

The APK will be created at:

`android/app/build/outputs/apk/debug/app-debug.apk`
