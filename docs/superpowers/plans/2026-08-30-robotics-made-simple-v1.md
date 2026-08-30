# Robotics, Made Simple V1 Implementation Plan

> **For agentic workers:** Implement these checkbox tasks in order and review each acceptance check before continuing.

**Goal:** Build one local, single-page flow that turns four project inputs into an understandable static parts plan and captures “Already have/Need” plus usefulness feedback.

**Architecture:** A Vite React page owns the form, a small in-file catalogue, plan generation, part selections, and feedback state. V1 has no login, external database, API call, or deployment; the result is explicitly labelled as a demo catalogue.

**Tech Stack:** React, Vite, plain CSS

**Spec:** `IDEA_SCOPE.md`

## Global Constraints

- Do not deploy before user confirmation.
- One page and one end-to-end flow; no login.
- Require project idea, intended behaviors, country, and budget before showing parts.
- Show parts first, then allow “Already have” or “Need.”
- Do not claim live stock, prices, AI generation, or verified compatibility.
- Require adult help before connecting or powering hardware.

---

### Task 1: Replace the unrelated landing page

**Files:**
- Modify: `index.html`
- Modify: `src/main.jsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: Four required form strings: `project`, `behaviors`, `country`, `budget`.
- Produces: A submitted project brief and a visible parts-plan state.

- [ ] Replace Patchwork branding and metadata with Robotics, Made Simple.
- [ ] Build one responsive page with a short product explanation beside the input form.
- [ ] Prevent submission until all four fields contain values.
- [ ] Keep labels, keyboard focus, errors, and mobile layout accessible.
- [ ] Run `npm run build`; expected result: exit code 0.

### Task 2: Complete the static parts-plan flow

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: The submitted project brief.
- Produces: A demo plan containing part name, purpose, check-before-buying note, selection, first build stage, and feedback.

- [ ] Add a small static catalogue suitable for the current V1 category.
- [ ] Tailor visible explanations to the submitted project and intended behaviors without claiming AI.
- [ ] Label the output “Demo catalogue—not live AI or verified buying advice.”
- [ ] Add mutually exclusive “Already have” and “Need” controls for every suggested part.
- [ ] Show progress as selections are made and summarize the “Need” list.
- [ ] Add “Useful” and “Needs work” feedback with a visible confirmation.
- [ ] Allow the user to edit inputs and create another plan.
- [ ] Run `npm run build`; expected result: exit code 0.

### Task 3: Verify the local V1

**Files:**
- Test: production build output in `dist/`

**Interfaces:**
- Consumes: The completed React app.
- Produces: Evidence that the app builds and the key copy and controls exist.

- [ ] Confirm the build output contains the Robotics, Made Simple title.
- [ ] Confirm source contains all four required inputs, both ownership choices, feedback controls, demo disclosure, and adult-safety copy.
- [ ] Confirm no Patchwork product copy remains in source or HTML.
- [ ] Report that browser interaction is untested if no browser runner is available.
