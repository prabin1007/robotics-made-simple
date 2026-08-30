# V1 Test Results

## Run summary

| Field | Result |
|---|---|
| Run completed | 2026-08-30 23:26:39 IST |
| Application | Local working tree at `http://127.0.0.1:4173/` |
| Base Git commit | `8b18c4f` plus uncommitted V1 changes |
| Browser | Google Chrome 152.0.7977.64, headless |
| Test runner | Playwright |
| Tests | 15 |
| Passed | 13 |
| Failed | 2 |
| Result | **FAIL — two P0 issues must be fixed before release** |

Each timestamp below is the recorded test start time converted to India Standard Time (IST, UTC+05:30).

## Individual results

| ID | Timestamp (IST) | Duration | Result | Evidence |
|---|---|---:|---|---|
| FORM-01 Default Bangalore location | 2026-08-30 23:22:21 | 30.3s | PASS | Default was `Bangalore, India`; no location notice. |
| FORM-02 Required-field validation | 2026-08-30 23:22:53 | 9.0s | PASS | Missing required answers blocked plan creation and showed one alert. |
| FORM-03 Reset clears form, plan, and choices | 2026-08-30 23:23:02 | 7.4s | PASS | Reset cleared project, behaviour, budget, result and choices; Bangalore remained. |
| LOC-02 Other city warns but still lists parts | 2026-08-30 23:23:10 | 7.0s | PASS | Mumbai warning appeared; 13 parts remained; Bengaluru stores stayed hidden. |
| MATCH-01 Basic movement returns complete base plan | 2026-08-30 23:23:17 | 6.9s | PASS | 13 base parts; no partial-plan warning. |
| MATCH-02 Voice command adds Bluetooth module | 2026-08-30 23:23:24 | 5.4s | PASS | 14 parts; HC-05 and phone speech-recognition note appeared. |
| MATCH-03 Obstacle avoidance adds ultrasonic sensor | 2026-08-30 23:23:30 | 5.2s | PASS | 14 parts; HC-SR04 appeared. |
| UNKNOWN-01 Unknown behaviours produce partial plan | 2026-08-30 23:23:35 | 5.6s | PASS | Face recognition and GPS were both named as unmatched; buying warning appeared. |
| UNKNOWN-02 Flying robot shows platform warning | 2026-08-30 23:23:41 | 6.3s | PASS | Partial plan stated that V1 supports wheeled ground robots. |
| UNKNOWN-03 Thermal sensing does not substitute DHT11 | 2026-08-30 23:23:48 | 12.9s | **FAIL** | Thermal warning appeared, but DHT11 was also listed. Expected zero DHT11 results; received one. See `test-results/v1-core-UNKNOWN-03-Thermal-sensing-does-not-substitute-DHT11/`. |
| OWN-02 Need all selects all base parts and total | 2026-08-30 23:24:09 | 12.3s | PASS | 13 Need-list entries; total ₹5,346. |
| OWN-03 Already have all gives truthful empty summary | 2026-08-30 23:24:23 | 29.9s | **FAIL** | Page said “Mark parts above as Need” after all 13 were marked Already have. Expected confirmation that every listed part is already owned. See `test-results/v1-core-OWN-03-Already-have-all-gives-truthful-empty-summary/`. |
| PRICE-01 Arduino shows verified V5 estimate details | 2026-08-30 23:25:09 | 15.7s | PASS | ₹206 estimate, ₹161–₹267 range, High confidence, dated 2026-08-30. |
| PRICE-03 Base total compares with budget | 2026-08-30 23:25:26 | 8.1s | PASS | ₹5,346 total and ₹346 above the ₹5,000 budget limit. |
| MOBILE-01 Core flow fits 375px viewport | 2026-08-30 23:25:34 | 10.0s | PASS | Core flow and budget result remained visible with no horizontal overflow. |

## Release blockers

### 1. Object-temperature request incorrectly adds DHT11

The phrase `Find warm objects using object temperature` triggers the generic `temperature` rule and adds DHT11. DHT11 measures nearby air and must not be shown as the sensor for finding warm objects.

Expected fix: object-temperature and thermal phrases must bypass the DHT11 rule while keeping the partial-plan warning.

### 2. Already-have-all summary is misleading

When every displayed part is marked `Already have`, the counter is complete but the Need-list message still asks the user to mark parts.

Expected fix: when all parts are marked and none are needed, show `You already have every listed part.`

## Release blocker retest — 2026-08-30 23:54:54 IST

Both blockers were fixed and checked again in Chrome through Playwright:

| Test | Result | Verified behaviour |
|---|---|---|
| UNKNOWN-03 Thermal sensing does not substitute DHT11 | **PASS** | Object-temperature requests keep the partial-plan warning and do not list DHT11. |
| OWN-03 Already have all gives truthful empty summary | **PASS** | When every part is owned, the summary says nothing needs to be bought. |

The complete V1 test set was then rerun: **15 passed, 0 failed**.

## Source artifacts

- Machine-readable report: `v1-test-results.json`
- Automated cases: `tests/v1-core.spec.js`
- Failure screenshots, page snapshots, and traces: `test-results/`
