# V1 Release Blockers Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the two failed V1 release tests so thermal object sensing never recommends DHT11 and an all-owned plan shows a truthful empty summary.

**Architecture:** Keep the existing database-guided rules and React state. Add one explicit distinction between nearby-air temperature and remote object temperature in `partsDatabase.js`; add one derived `allPartsMarked` state in `main.jsx`. Do not add AI, new parts, new dependencies, or new screens.

**Tech Stack:** React, Vite, CSV-backed parts data, Playwright with installed Chrome.

**Spec:** `test results.md` and `TEST_CASES.md`, specifically `UNKNOWN-03` and `OWN-03`.

## Global Constraints

- DHT11 may be recommended for room/ambient/air temperature or humidity.
- DHT11 must not be recommended as a way to find warm objects or measure remote object temperature.
- Thermal object requests remain partial plans with the existing stop-before-buying warning.
- Parts must continue to display even when a plan is partial.
- The Need-list empty message must distinguish “nothing marked yet” from “everything marked Already have.”
- No GitHub push or Vercel deployment until both failed tests and all other V1 tests pass.

---

## Failure analysis

### Failure 1: Thermal request adds DHT11

`src/data/partsDatabase.js:67` maps the broad word `temperature` directly to `SNS-005`. The selection loop at lines 168–170 adds DHT11 before the thermal-object check at lines 182–184 adds a catalogue gap. Both branches therefore run for `Find warm objects using object temperature`: the warning is correct, but the part list contradicts it.

The fix is not to remove temperature support. It is to separate two jobs:

- Nearby-air job: humidity, room temperature, ambient temperature, air temperature → DHT11.
- Remote-object job: thermal, heat source, warm object, object temperature → partial plan, no DHT11 substitution.

### Failure 2: All-owned plan uses the untouched-state message

`src/main.jsx:274` renders one empty message whenever `neededParts.length === 0`. That state has two meanings:

- The user has not marked any ownership choices.
- The user marked every part `Already have`.

The component already has the information needed to distinguish them, but it does not calculate `allPartsMarked`.

---

### Task 1: Separate air-temperature matching from thermal-object matching

**Files:**
- Modify: `src/data/partsDatabase.js:63-88, 160-184`
- Test: `tests/v1-core.spec.js:84-88`

**Interfaces:**
- Consumes: lower-cased combined project and behaviour text in `buildPartsPlan(brief)`.
- Produces: `asksForThermalObject: boolean`, `asksForAirTemperature: boolean`, and the existing `selectedIds`, `gaps`, and `isPartial` output.

- [ ] **Step 1: Strengthen the failing browser test**

Keep `UNKNOWN-03` and add two assertions: the plan remains partial and its parts list still contains the 13 safe base parts.

```js
test('UNKNOWN-03 Thermal sensing does not substitute DHT11', async ({ page }) => {
  await submitPlan(page, { behavior: 'Find warm objects using object temperature' });
  await expect(page.getByRole('heading', { name: 'Your partial starting plan' })).toBeVisible();
  await expect(page.locator('.partial-plan')).toContainText('thermal-camera options');
  await expect(page.locator('.part-card')).toHaveCount(13);
  await expect(page.getByRole('heading', { name: 'DHT11 Module' })).toHaveCount(0);
});
```

- [ ] **Step 2: Add an air-temperature regression test**

```js
test('MATCH-05 Room temperature still adds DHT11', async ({ page }) => {
  await submitPlan(page, { behavior: 'Measure room temperature and humidity' });
  await expect(page.getByRole('heading', { name: 'DHT11 Module' })).toBeVisible();
  await expect(page.locator('.partial-plan')).toHaveCount(0);
});
```

- [ ] **Step 3: Run the two tests and verify current behaviour**

Run:

```powershell
npx playwright test tests/v1-core.spec.js --grep "Thermal sensing|Room temperature"
```

Expected before implementation: thermal test FAILS because DHT11 count is 1; room-temperature test PASSES.

- [ ] **Step 4: Replace the broad temperature feature rule with explicit classification**

Remove this entry from `FEATURE_RULES`:

```js
{ words: ['temperature', 'humidity'], partId: 'SNS-005' },
```

Add constants near the other rules:

```js
const THERMAL_OBJECT_WORDS = ['thermal', 'heat source', 'warm object', 'object temperature'];
const AIR_TEMPERATURE_WORDS = ['humidity', 'ambient temperature', 'room temperature', 'air temperature'];
```

In `buildPartsPlan`, calculate the two meanings before applying feature rules:

```js
const asksForThermalObject = hasAny(text, THERMAL_OBJECT_WORDS);
const asksForAirTemperature = hasAny(text, AIR_TEMPERATURE_WORDS)
  || (text.includes('temperature') && !asksForThermalObject);

if (asksForAirTemperature) selectedIds.add('SNS-005');
```

Use the same thermal boolean for the warning:

```js
if (asksForThermalObject) {
  gaps.push('The expanded catalogue contains thermal-camera options, but this V1 cannot safely choose the exact camera, computer and power setup for a beginner build. DHT11 is not a substitute because it measures nearby air.');
}
```

This still supports generic `measure temperature` while preventing object-temperature substitution. A combined request for room temperature and warm-object sensing may include DHT11 for the room-temperature portion and must remain partial for the warm-object portion.

- [ ] **Step 5: Run the targeted tests**

Run:

```powershell
npx playwright test tests/v1-core.spec.js --grep "Thermal sensing|Room temperature"
```

Expected: both PASS.

- [ ] **Step 6: Commit the independent thermal fix**

```powershell
git add -- src/data/partsDatabase.js tests/v1-core.spec.js
git commit -m "Fix thermal requirement matching"
```

---

### Task 2: Distinguish untouched ownership from all-owned

**Files:**
- Modify: `src/main.jsx:125-132, 273-275`
- Test: `tests/v1-core.spec.js:97-104`

**Interfaces:**
- Consumes: `parts` and the `choices` object whose values are `have`, `need`, or absent.
- Produces: `allPartsMarked: boolean` and one of three summary states: Need list, all-owned message, or untouched/incomplete message.

- [ ] **Step 1: Keep the failing all-owned test and add the untouched-state test**

```js
test('OWN-01 Untouched plan asks for ownership choices', async ({ page }) => {
  await submitPlan(page);
  await expect(page.locator('.empty-summary')).toContainText('Mark parts above as “Need”');
});
```

Keep the existing `OWN-03` expectation:

```js
await expect(page.locator('.empty-summary'))
  .toContainText('already have every listed part', { ignoreCase: true });
```

- [ ] **Step 2: Run the two ownership tests and verify current behaviour**

Run:

```powershell
npx playwright test tests/v1-core.spec.js --grep "Untouched plan|Already have all"
```

Expected before implementation: untouched test PASSES; all-owned test FAILS with the current “Mark parts” text.

- [ ] **Step 3: Add the derived completion state**

Place this next to `neededParts` and `allPartsNeeded`:

```js
const allPartsMarked = parts.length > 0
  && parts.every((part) => choices[part.part_id] === 'have' || choices[part.part_id] === 'need');
```

Do not use only `Object.keys(choices).length`; checking the displayed part IDs prevents stale or unrelated keys from producing a false complete state.

- [ ] **Step 4: Render the correct empty-state copy**

Replace the single empty paragraph with this conditional:

```jsx
{neededParts.length ? (
  // Keep the existing Need list, totals, comparison, and assumption unchanged.
) : (
  <p className="empty-summary">
    {allPartsMarked
      ? 'You already have every listed part. Nothing from this plan needs to be added to your shopping list.'
      : 'Mark parts above as “Need” and they will appear here with an estimated total.'}
  </p>
)}
```

- [ ] **Step 5: Run the targeted ownership tests**

Run:

```powershell
npx playwright test tests/v1-core.spec.js --grep "Untouched plan|Already have all|Need all"
```

Expected: untouched, all-owned, and Need-all tests PASS.

- [ ] **Step 6: Commit the independent ownership fix**

```powershell
git add -- src/main.jsx tests/v1-core.spec.js
git commit -m "Clarify all-owned parts summary"
```

---

### Task 3: Run the V1 release gate and update evidence

**Files:**
- Modify: `test results.md`
- Generated: `v1-test-results.json`
- Test: `tests/v1-core.spec.js`

**Interfaces:**
- Consumes: both fixes and the complete V1 browser suite.
- Produces: timestamped pass/fail evidence for the release decision.

- [ ] **Step 1: Run the production build**

```powershell
npm run build
```

Expected: Vite build completes. The existing large-bundle warning is allowed for this fix because neither task expands the database or bundle.

- [ ] **Step 2: Start the local test server**

```powershell
npm run dev -- --host 127.0.0.1 --port 4173
```

Expected: Vite reports `http://127.0.0.1:4173/`.

- [ ] **Step 3: Run the complete V1 suite**

```powershell
npx playwright test tests/v1-core.spec.js
```

Expected: all original 15 V1 cases plus the two new regressions PASS. No failure screenshots or traces are produced for this run.

- [ ] **Step 4: Update the timestamped result report**

Replace the summary and individual results in `test results.md` using the new `v1-test-results.json` timestamps. Preserve the old failed-run facts in a short `Previous run` section:

```markdown
## Previous run

The 2026-08-30 run had 13 passes and 2 failures: UNKNOWN-03 and OWN-03. Both are covered by regression tests in this run.
```

The new report must state the exact tested commit or `plus uncommitted changes` honestly.

- [ ] **Step 5: Confirm the release gate**

Run:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors. Review the status and stage only the two fixes, tests, and updated results. Do not include unrelated artifacts.

- [ ] **Step 6: Commit the verified result**

```powershell
git add -- src/data/partsDatabase.js src/main.jsx tests/v1-core.spec.js "test results.md" v1-test-results.json
git commit -m "Verify V1 release blocker fixes"
```

Do not push or deploy until the user explicitly requests GitHub and Vercel updates.

---

## Self-review

- Spec coverage: UNKNOWN-03, OWN-03, the untouched summary state, normal room-temperature matching, full-suite rerun, and timestamped evidence are covered.
- Scope control: no AI, catalogue expansion, new UI component, dependency change, or deployment is included.
- Type consistency: `asksForThermalObject`, `asksForAirTemperature`, and `allPartsMarked` are defined once and used with boolean semantics.
- Safety: the plan preserves parts for supported behaviour while preventing DHT11 from being presented as a remote thermal sensor.

