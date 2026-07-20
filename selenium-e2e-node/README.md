# PawPal Selenium E2E Suite

This folder contains the separate Node.js Selenium test suite for PawPal.

## Run

```sh
npm test
```

The runner starts the PawPal backend, opens the web app in Chrome, executes 420 end-to-end checks, and writes:

- `reports/test-results.json`
- `reports/PawPal_E2E_Excel_Analysis.xlsx`

## Scope

The suite covers home, login, new-user registration as a separate page, pet details, dashboard, health, activity, community, adoption, travel, doctors, chat, backend health, assets, local persistence, and mobile navigation contracts.
