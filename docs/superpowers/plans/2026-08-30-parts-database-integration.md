# Parts Database Integration Implementation Plan

> **For agentic workers:** Implement these checkbox tasks in order and review each acceptance check before continuing.

**Goal:** Replace the hand-written V1 catalogue with the supplied CSV database and expose useful source, price-lead, and local-store information without overstating accuracy.

**Architecture:** Vite imports the three CSV files as raw text. A focused data module parses and indexes them once at module load; the React page asks that module for a project plan and renders the returned records. The original `RoboticsPartDB` folder remains the single editable source so future CSV improvements flow into the app without copying files.

**Tech Stack:** React, Vite, plain JavaScript, CSV files

**Spec:** `IDEA_SCOPE.md`

## Global Constraints

- Do not deploy before user confirmation.
- Do not rename, delete, or overwrite the supplied CSV files.
- Do not call price leads direct buying links.
- Do not claim live stock, current prices, verified compatibility, or true AI generation.
- Preserve the four-input, one-page, no-login flow.

---

### Task 1: Parse and index the supplied CSVs

**Files:**
- Create: `src/data/partsDatabase.js`
- Read: `RoboticsPartDB/robotics_parts_directory_v2_buy_links.csv`
- Read: `RoboticsPartDB/robotics_online_offers_seed.csv`
- Read: `RoboticsPartDB/robotics_local_stores_bengaluru_seed.csv`

**Interfaces:**
- Produces: `databaseStats`, `buildPartsPlan(brief)`, and `getLocalStores(country)`.

- [ ] Parse quoted CSV fields without adding a dependency.
- [ ] Index parts and offers by `part_id` for direct lookup.
- [ ] Select the beginner wheeled-robot base and add behavior-specific parts.
- [ ] Keep sound sensors out of word-recognition plans and explain the phone/Bluetooth route.
- [ ] Return explicit catalogue gaps for unsupported behavior terms.
- [ ] Return Bengaluru stores only for Bengaluru or India inputs.

### Task 2: Render database-backed recommendations

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `databaseStats`, `buildPartsPlan(brief)`, and `getLocalStores(country)`.
- Produces: Part cards with database details, search links, price leads, plan notes, and local stores.

- [ ] Remove the hand-written catalogue from the React component.
- [ ] Show database counts in the page and label the result database-guided.
- [ ] Render database quantity, voltage, skill level, common mistake, safety note, and seller search links.
- [ ] Render observed prices as dated leads, not live prices or direct links.
- [ ] Render plan notes and catalogue gaps before the parts list.
- [ ] Show relevant Bengaluru store leads after the “Need” list.
- [ ] Preserve “Already have/Need,” progress, summary, edit, and feedback behavior.

### Task 3: Verify

**Files:**
- Test: production output in `dist/`

**Interfaces:**
- Consumes: The database-backed app.
- Produces: A successful production build and source-level coverage checks.

- [ ] Run `npm run build`; expected result: exit code 0.
- [ ] Confirm all three CSVs are imported and all 52 parts parse.
- [ ] Confirm the dog/voice example includes Bluetooth and excludes the sound sensor.
- [ ] Confirm the page contains price-lead, non-live-price, database-guided, and adult-safety language.
- [ ] Confirm no deployment command ran.
