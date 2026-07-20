# PawPal Selenium E2E Test Suite

Complete End-to-End automated testing for the PawPal web application using Selenium WebDriver + Node.js. All tests are saved in the `selenium-tests/` folder and generate a rich, multi-sheet Excel report.

## 📁 Folder Structure

```
selenium-tests/
├── package.json                 ← Node.js dependencies & npm scripts
├── README.md                    ← This file
├── utils/
│   └── driver.js                ← Shared WebDriver factory & test helpers
├── tests/
│   ├── runner.js                ← Main runner (runs all 15 suites)
│   ├── 01_home_page.test.js     ← Home page tests (12 cases)
│   ├── 02_login_page.test.js    ← Login/Registration tests (13 cases)
│   ├── 03_pet_onboarding.test.js← Pet profile onboarding tests (13 cases)
│   ├── 04_dashboard.test.js     ← Dashboard tests (15 cases)
│   ├── 05_health_tracker.test.js← Health tracker tests (18 cases)
│   ├── 06_activity_log.test.js  ← Activity log tests (9 cases)
│   ├── 07_community.test.js     ← Community page tests (10 cases)
│   ├── 08_adoption.test.js      ← Pet adoption tests (10 cases)
│   ├── 09_travel.test.js        ← Travel page tests (12 cases)
│   ├── 10_doctors.test.js       ← Doctor appointment tests (12 cases)
│   ├── 11_doctor_login.test.js  ← Doctor login tests (14 cases)
│   ├── 12_chat.test.js          ← PetChat AI tests (12 cases)
│   ├── 13_caregivers.test.js    ← Caregivers page tests (12 cases)
│   ├── 14_expenses.test.js      ← Expense Tracker tests (12 cases)
│   └── 15_products.test.js      ← Pet Products tests (12 cases)
├── reports/
│   ├── generate_report.js       ← Excel report generator (5 sheets)
│   ├── test_results.json        ← Raw JSON results (auto-generated)
│   └── PawPal_E2E_Report_*.xlsx ← Excel reports (auto-generated)
└── screenshots/                  ← Failure screenshots (auto-generated)
```

## 📊 Test Coverage

| Suite | Test Cases | Features Covered |
|-------|-----------|-----------------|
| Home Page | 12 | Hero, Navbar, CTA, Chatbot toggle, JS errors |
| Login Page | 13 | Form validation, field inputs, login flow |
| Pet Onboarding | 13 | Pet type, breed, BMI, dashboard nav |
| Dashboard | 15 | Sidebar, pet card, stats, quick actions |
| Health Tracker | 18 | BMI, vaccines, medicines, calendar, map |
| Activity Log | 9 | Form inputs, history list |
| Community | 10 | Post creation, feed display |
| Pet Adoption | 10 | Listings, cards, booking |
| Travel | 12 | Search, map, results, filters |
| Doctor Appointment | 12 | Listing, cards, booking modal |
| Doctor Login | 14 | Form, dropdown, portal access |
| PetChat AI | 12 | Toggle, messages, bot response |
| Pet Caregivers | 12 | Search, cards, profile modal |
| Expense Tracker | 12 | Add expense, total, list rendering |
| Pet Products | 12 | Listing, cards, prices, order flow |
| **TOTAL** | **186** | **Full End-to-End Coverage** |

## 🚀 Setup & Installation

### Prerequisites

1. **Node.js** (v18+): Download from https://nodejs.org
2. **Google Chrome**: Latest version installed
3. **ChromeDriver**: Auto-installed via `chromedriver` npm package

### Step 1: Install Dependencies

```bash
cd selenium-tests
npm install
```

### Step 2: Run All Tests (with browser visible)

```bash
npm test
```

### Step 3: Run All Tests in Headless Mode (no browser window)

```bash
npm run test:headless
# or:
HEADLESS=true npm test
```

This will:
1. Auto-start the HTTP server on port 3000
2. Run all 15 test suites sequentially (186 tests)
3. Capture screenshots of any failures
4. Generate an Excel report automatically
5. Auto-open the report on macOS

### Step 4: View Report

Report location: `selenium-tests/reports/PawPal_E2E_Report_YYYY-MM-DD_HH-mm-ss.xlsx`

## 📊 Excel Report Sheets (5 Sheets)

| Sheet | Contents |
|-------|---------|
| 📊 Executive Summary | KPIs, pass/fail counts, suite-level table |
| 📋 Test Results | Every test case with status, duration, error |
| ❌ Failure Analysis | Only failed tests with full error details |
| ✅ Passed Tests | All passing test cases with timestamps |
| 📈 Suite Metrics | Per-suite performance with health status |

## 🔧 Run Individual Suites

```bash
npm run test:home        # Home page tests only
npm run test:login       # Login page tests only
npm run test:pet         # Pet onboarding tests only
npm run test:dashboard   # Dashboard tests only
npm run test:health      # Health tracker tests only
npm run test:activity    # Activity log tests only
npm run test:community   # Community tests only
npm run test:adoption    # Adoption tests only
npm run test:travel      # Travel page tests only
npm run test:doctors     # Doctor appointment tests only
npm run test:doctor-login# Doctor login tests only
npm run test:chat        # PetChat AI tests only
npm run test:caregivers  # Caregivers tests only
npm run test:expenses    # Expense tracker tests only
npm run test:products    # Pet products tests only
```

## 🔧 Configuration Options

```bash
# Run in headless mode (no browser window)
HEADLESS=true npm test

# Run only specific suites by name keyword
node tests/runner.js Home Login Dashboard

# Regenerate report from last saved JSON
npm run report
```

## 🐛 Troubleshooting

**ChromeDriver version mismatch:**
```bash
npm install chromedriver@latest
```

**Connection refused (localhost:3000):**
```bash
npx http-server ../ -p 3000
```

**Tests failing on CI/server:**
```bash
HEADLESS=true npm test
```
