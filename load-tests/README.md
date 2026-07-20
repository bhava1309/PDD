# PawPal Baseline Load Test

This test simulates the expected normal load:

- 100 virtual users
- 1 minute of continuous traffic
- Read-only requests across the PawPal backend and home page

Run the backend first:

```sh
npm start
```

Then run the baseline test:

```sh
node load-tests/baseline-load-test.js
```

Optional settings:

```sh
TARGET_URL=http://localhost:8787 VUS=100 DURATION_SECONDS=60 node load-tests/baseline-load-test.js
```

The runner prints requests per second, response time min/average/max, p90, p95, failures, and writes a JSON report to `reports/load-tests/`.
