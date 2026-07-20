# Load Test Status

## Test Objective

Validate baseline backend and web responsiveness under normal expected traffic.

## Tooling

| Item | Detail |
| --- | --- |
| Test script | `load-tests/baseline-load-test.js` |
| Report file | `reports/load-tests/baseline-2026-07-05T16-31-46-190Z.json` |
| Target URL | `http://localhost:8787` |
| Run timestamp | 2026-07-05 |

## Scenario

| Metric | Value |
| --- | ---: |
| Virtual users | 100 |
| Duration | 60 seconds |
| Total requests | 1,389,514 |
| Requests per second | 23,157.02 |
| Failures | 0 |
| Failure rate | 0% |

## Response Time

| Metric | Result |
| --- | ---: |
| Minimum | 0.06 ms |
| Average | 4.31 ms |
| P90 | 7.98 ms |
| P95 | 10.30 ms |
| Maximum | 103.98 ms |

## Endpoint Coverage

| Endpoint | Requests | Failures |
| --- | ---: | ---: |
| `/api/health` | 416,799 | 0 |
| `/api/state` | 416,889 | 0 |
| `/api/teachers` | 277,953 | 0 |
| `/api/maps/resolve?query=pet%20clinics%20near%20Chennai` | 138,960 | 0 |
| `/` | 138,913 | 0 |

## Acceptance Criteria

| Criterion | Required | Actual | Status |
| --- | --- | --- | --- |
| Failure rate | 0% critical failures | 0% | Passed |
| API availability | All tested endpoints return successful responses | HTTP 200 for all requests | Passed |
| P95 response time | Under 500 ms for baseline local test | 10.30 ms | Passed |
| Error samples | No repeated backend errors | None | Passed |

## QA Status

**Passed baseline load testing.**

This result supports staging approval. For production, repeat the load test in a production-like hosting environment with realistic network, database, and SSL configuration.

