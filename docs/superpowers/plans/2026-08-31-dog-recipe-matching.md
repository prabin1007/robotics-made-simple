# Dog Recipe Matching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace keyword-built BOMs with one fixed dog-animaloid recipe and clearly label exact, partial, and unavailable matches.

**Architecture:** Store one recipe header and its BOM as CSV records linked to existing part IDs. A small deterministic matcher checks whether the project is a wheeled dog with phone-assisted left/right voice control; the current UI renders the fixed BOM and explains any mismatch.

**Tech Stack:** React, Vite, CSV data imported as text, Playwright browser tests.

**Spec:** Approved conversation scope: one dog-shaped animaloid, hidden wheels, phone-assisted “left” and “right” commands, recipe remains Draft until physically verified.

## Global Constraints

- Support only `ANIMALOID-DOG-2WD-VOICE-V1`.
- Exact matching must not depend on broad part keywords such as `distance`.
- Partial and unavailable requests must not be presented as validated.
- Keep existing ownership, price, tutorial, location and budget behaviour.
- Do not add AI, API calls, substitutions or a general compatibility engine.

---

### Task 1: Lock recipe data and expected matching behaviour

**Files:**
- Create: `RoboticsPartDB/robot_recipes_v1.csv`
- Create: `RoboticsPartDB/robot_recipe_bom_v1.csv`
- Modify: `tests/v1-core.spec.js`

**Interfaces:**
- Consumes: Existing part IDs from `robotics_parts_directory_v5_school_project_prices.csv`.
- Produces: One recipe record and fourteen exact BOM rows consumed by `buildPartsPlan(brief)`.

- [ ] Add the Draft dog recipe with its supported outcome, assumptions and validation note.
- [ ] Add fourteen BOM rows using the current movement base plus `COM-001`.
- [ ] Add failing browser tests for exact matching, “short distance” not adding a sensor, extra behaviours becoming partial, and non-dog projects being unavailable.
- [ ] Run `npm run test:v1` and confirm the new recipe tests fail before implementation.

### Task 2: Implement deterministic recipe resolution

**Files:**
- Modify: `src/data/partsDatabase.js`
- Test: `tests/v1-core.spec.js`

**Interfaces:**
- Consumes: `brief.project`, `brief.behaviors`, recipe CSV and BOM CSV.
- Produces: `plan.recipe`, `plan.matchType`, fixed `plan.parts`, `plan.unsupportedRequirements`, and `plan.isPartial`.

- [ ] Import and parse the two recipe CSVs.
- [ ] Resolve exact dog voice-direction requests to the fixed fourteen-part BOM.
- [ ] Resolve dog requests with missing or extra behaviour as partial while retaining the fixed reference BOM and stop-before-buying warning.
- [ ] Resolve non-dog projects as unavailable with no BOM.
- [ ] Run the focused recipe tests and confirm they pass.

### Task 3: Explain the match in the result screen

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/styles.css`
- Test: `tests/v1-core.spec.js`

**Interfaces:**
- Consumes: `plan.recipe` and `plan.matchType`.
- Produces: A visible recipe panel with recipe ID, Draft status, exact/partial/unavailable wording and validation limitation.

- [ ] Render the recipe panel above the safety disclosure.
- [ ] Use green styling for an exact recipe match and orange styling for partial or unavailable results.
- [ ] Preserve mobile layout and ownership/budget behaviour for the fixed BOM.
- [ ] Run all V1 browser tests and `npm run build`.
- [ ] Check `git diff --check` and leave changes local for review.

## Self-review

- The plan covers stored recipe data, fixed BOM selection, exact/partial/unavailable handling, UI explanation and regression tests.
- It intentionally excludes physical validation and compatibility substitutions; the UI must therefore show Draft rather than Validated.
- All named return fields are produced by `buildPartsPlan(brief)` and consumed by the result screen.
