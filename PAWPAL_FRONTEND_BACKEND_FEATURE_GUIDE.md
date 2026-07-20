# PawPal Website Frontend + Backend Feature Guide

This file explains the PawPal website features in a brief step-by-step method.

## 1. Main Files

Frontend webpage:

`pawpal.html`

Mobile webpage copy:

`PawPal-Mobile-App.html`

Backend server:

`backend/server.js`

Backend database file:

`backend/data/pawpal-db.json`

## 2. Start the Website With Backend

1. Open Terminal.
2. Go to the PawPal project folder:

```sh
cd /Users/surya/Documents/pawpal
```

3. Start the backend:

```sh
node backend/server.js
```

4. Open this website link:

```text
http://127.0.0.1:8787/PawPal-Mobile-App.html
```

## 3. Frontend Features

### Home Page

1. Open the website.
2. View PawPal introduction.
3. Click `Get Started` to move to login.

### Login Page

1. Click `Login`.
2. Enter user details.
3. Click `Continue to Pet Details`.
4. The pet details page opens.

### New User Register Page

1. On Login page, click `Register New User`.
2. A separate register page opens.
3. Enter:
   - Mail ID
   - Password
   - Confirm Password
4. Click `Register`.
5. The website returns to Login page.

### Pet Details Page

1. Enter pet type, breed, name, age, weight, licence number, location, and health concern.
2. Click `Calculate BMI & Open Dashboard`.
3. Dashboard opens with pet profile and BMI.

### Dashboard

1. View pet profile.
2. View BMI score.
3. View licence number.
4. View next vaccine and appointment details.
5. Open health tracker, map, expenses, and PetChat.

### Health Tracker

1. View BMI details.
2. Add vaccine records.
3. Add medicine records.
4. Save prescription notes.
5. Select appointment date.
6. View pet location map.

### Activity Log

1. Enter activity name.
2. Enter activity time in minutes.
3. Click `Add Activity`.
4. Activity appears in history.

### Training

1. Open Training page.
2. View training suggestions based on pet type and breed.
3. Mark training as done.

### Products

1. Open Pet Products page.
2. View product list.
3. Click `Place Order`.
4. Product cost is added to expenses.

### Expenses

1. Enter expense title.
2. Enter amount.
3. Click `Add Expense`.
4. Total expense updates.

### Caregivers

1. Enter location.
2. Select service type.
3. Search caregivers.
4. View caregiver details and hire options.

### Community

1. Write a community post.
2. Click `Post`.
3. Like, comment, and share community posts.

### Adoption

1. View adoption pets.
2. Click `Meet Pet`.
3. Enter meeting details.
4. Confirm meeting request.

### Travel

1. Enter city.
2. Select hotels, restaurants, or parks.
3. Search pet-friendly places.
4. View maps and hotel booking options.

### Doctor Appointment

1. View doctor list.
2. Open doctor profile.
3. Select online or offline appointment.
4. Book appointment slot.
5. Use call or video consultation option.

### PetChat AI

1. Click chat button.
2. Ask pet care questions.
3. Receive demo AI guidance for food, health, medicine, travel, adoption, and training.

## 4. Backend Features

### Backend Health Check

Endpoint:

```text
GET /api/health
```

Purpose:

Checks whether backend is running.

### Save and Load App State

Endpoint:

```text
GET /api/state
PUT /api/state
```

Purpose:

Stores owner, pet, health, expenses, appointments, community, reminders, and other app data.

### Login Save

Endpoint:

```text
POST /api/login
```

Purpose:

Saves user login or registration details into backend state.

### Orders

Endpoint:

```text
POST /api/orders
```

Purpose:

Stores product order details.

### Doctor Bookings

Endpoint:

```text
POST /api/bookings
```

Purpose:

Stores doctor appointment bookings.

### Reminders

Endpoint:

```text
POST /api/reminders
```

Purpose:

Stores appointment or travel reminders.

### Adoption Meetings

Endpoint:

```text
POST /api/adoption-meetings
```

Purpose:

Stores adoption meeting requests.

### Caregiver Bookings

Endpoint:

```text
POST /api/caregiver-bookings
```

Purpose:

Stores caregiver hire requests.

### Maps

Endpoints:

```text
GET /api/maps/resolve
GET /api/maps/embed
```

Purpose:

Creates map search, direction, and embed links for pet location and travel features.

## 5. Data Storage

The backend saves data in:

```text
backend/data/pawpal-db.json
```

This file stores:

- Owner details
- Pet profile
- Vaccines
- Medicines
- Prescriptions
- Expenses
- Activities
- Appointments
- Posts
- Orders
- Adoption meetings
- Caregiver bookings
- Reminders

## 6. Selenium Testing

Selenium test folder:

```text
selenium-e2e-node
```

Run tests:

```sh
cd /Users/surya/Documents/pawpal/selenium-e2e-node
npm test
```

Test output:

```text
selenium-e2e-node/reports/test-results.json
selenium-e2e-node/reports/PawPal_E2E_Excel_Analysis.xlsx
```

## 7. Short Full Flow

1. Start backend.
2. Open website.
3. Register new user.
4. Return to login page.
5. Login.
6. Enter pet details.
7. Open dashboard.
8. Use health, activity, products, expenses, caregivers, community, adoption, travel, doctors, and chat.
9. Backend stores the data.
10. Run Selenium tests.
11. Open Excel report.

## 8. Important Note

This guide is for the website frontend and backend. Android app files do not need to be edited for this website guide.
