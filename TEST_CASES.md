# Robotics, Made Simple — V1 Test Cases

## Purpose

Use this checklist before each GitHub push and Vercel deployment. Test in a desktop browser and a mobile-width browser. Unless a test says otherwise, use:

- Project: `Dog-shaped robot with hidden wheels`
- Location: `Bangalore, India`
- Budget: `₹3,000–₹5,000`

The current base moving-robot plan contains 13 parts. Its V5 planning estimate is ₹5,346. Price totals treat each CSV school-project price as one purchase line that covers the displayed quantity or pack.

## Release gate

Do not release if any P0 test fails.

| ID | Priority | Test | Input or action | Expected result |
|---|---|---|---|---|
| FORM-01 | P0 | Default location | Open the page in a new tab | Location is prefilled with `Bangalore, India`. No location warning appears. |
| FORM-02 | P0 | Required answers | Leave project, behaviour, or budget empty and submit | No plan appears. One clear error asks for all four answers. |
| FORM-03 | P0 | Reset | Fill the form, create a plan, make ownership choices, then select `Reset` | Project, behaviour, plan, ownership choices, feedback, and errors clear. Location returns to `Bangalore, India`. |
| FORM-04 | P1 | Example | Select `Use dog robot example` | All four fields are filled; location is `Bangalore, India`; no plan is created until submit. |
| LOC-01 | P0 | Bangalore stores | Submit with `Bangalore, India` | Parts plan appears and exactly the store-directory records are shown—not hundreds of part-search rows. |
| LOC-02 | P0 | Other Indian city | Enter `Mumbai, India` | A notice says local-store coverage is currently Bangalore-only. Submission is not blocked. Parts still appear. Bengaluru stores do not appear. |
| LOC-03 | P1 | Outside India | Enter `London, UK` | Parts still appear. Page warns that local stores are Bangalore-only and seller/price data is India-focused. |
| MATCH-01 | P0 | Basic movement | Behaviour: `Move forward, turn left, then stop` | Base 13-part plan appears. It is not labelled partial. |
| MATCH-02 | P0 | Voice command | Behaviour: `Hear left or right and move in that direction` | `COM-001 HC-05 Bluetooth Module` is added. Plan explains that a phone performs speech recognition. |
| MATCH-03 | P0 | Obstacle avoidance | Behaviour: `Avoid obstacles` | `SNS-001 HC-SR04 Ultrasonic Sensor` is added. |
| MATCH-04 | P1 | Line following | Behaviour: `Follow a black line` | `SNS-003 IR Line Sensor` is added. |
| MATCH-05 | P1 | Environment sensors | Test separately with `detect light`, `measure temperature and humidity`, `detect motion`, `react to a clap`, and `detect tilt` | Adds SNS-004, SNS-005, SNS-006, SNS-008, and SNS-009 respectively. Each unrelated sensor stays absent. |
| MATCH-06 | P1 | Outputs | Test separately with `show text on a screen` and `sound an alarm` | Adds OUT-005 and OUT-003 respectively. |
| UNKNOWN-01 | P0 | Unknown behaviour | Behaviour: `Recognise faces and send GPS location` | Heading says `Your partial starting plan`. Banner names both unmatched requirements and says not to buy parts for them yet. Supported base parts may still appear. |
| UNKNOWN-02 | P0 | Unsupported platform | Project: `Flying bird robot`; behaviour: `Fly to a window` | Partial-plan banner says V1 supports ground robots with wheels. It must not present the base list as a complete flying-robot plan. |
| UNKNOWN-03 | P0 | Thermal sensing | Behaviour: `Find warm objects using object temperature` | Partial-plan banner explains that selecting a thermal camera/computer is not safely handled. DHT11 must not be presented as the solution for object temperature. |
| UNKNOWN-04 | P1 | Misspelling or gibberish | Behaviour: `reconise persun and locat hm` | Page does not crash. It shows the text as unmatched instead of claiming a complete plan. |
| OWN-01 | P0 | Need one part | Mark only Arduino Uno as `Need`; mark every other part `Already have` | Need list contains only Arduino Uno. Estimate is ₹206. Marked counter equals total parts. |
| OWN-02 | P0 | Need all | Select `I need all parts` for a basic movement plan | Every displayed part becomes `Need`; Need list contains 13 parts; estimate is ₹5,346. Individual choices remain editable. |
| OWN-03 | P0 | Already have all | Mark every part `Already have` | Need list is empty and explains that no listed purchases are needed. It must not tell the user to mark more parts. |
| PRICE-01 | P0 | Per-part estimate | Inspect Arduino Uno | Shows planning estimate ₹206, range ₹161–₹267, High confidence, and date 2026-08-30. It does not call this a live price. |
| PRICE-02 | P0 | Ignore blank offers | Inspect parts without a direct-priced offer | No ₹0 price lead appears. Tentative V5 estimate may still appear. |
| PRICE-03 | P0 | Base total versus budget | Basic movement; mark all Need; budget `₹3,000–₹5,000` | Total is ₹5,346 and result says about ₹346 above the budget limit. |
| PRICE-04 | P0 | Voice total versus budget | Built-in dog example; mark all Need; budget `₹3,000–₹5,000` | Total is ₹5,746 and result says about ₹746 above the budget limit. |
| PRICE-05 | P1 | Budget shorthand | Repeat PRICE-03 with budget `3k-5k` | Same result as `₹3,000–₹5,000`. |
| PRICE-06 | P1 | One-number budget | Basic plan; mark all Need; budget `6000` | Treated as a ₹6,000 upper limit; estimate is within budget. |
| PRICE-07 | P1 | Invalid budget | Budget `not sure yet`; create plan and mark a part Need | Parts remain usable. Budget box asks for a number or range and does not show a false comparison. |
| PRICE-08 | P0 | Quantity assumption | Inspect jumper wires and motors, then mark all Need | Total adds each displayed purchase-line estimate once; it does not multiply a ₹250 wire-pack estimate by quantity 10. Assumption is visible below total. |
| PRICE-09 | P1 | Live updates | Toggle one part between `Need` and `Already have` | Need list and all three totals update immediately and by exactly that part's estimate/range. |
| GUIDE-01 | P1 | Available guide | Open `How this part works` for a part with a guide | Image loads, stays inside the card, has useful alternative text, and opens full-size. |
| GUIDE-02 | P1 | Missing guide | Inspect a V5 part without a visual guide | Page remains usable and does not show a broken image. |
| LINK-01 | P1 | Buying searches | Open seller searches | They open in a new tab and are labelled searches—not guaranteed products or stock. |
| SAFE-01 | P0 | Price honesty | Inspect part price and total areas | Page consistently says estimate/range/confidence/date. It never says checkout total, live stock, verified compatibility, or guaranteed price. |
| SAFE-02 | P0 | Partial-plan safety | Submit any unmatched requirement | Warning appears before the parts list and is visually stronger than normal notes. |
| MOBILE-01 | P1 | Mobile form | Test around 375 px width | Reset and example controls do not overlap. Location notice wraps without horizontal scrolling. |
| MOBILE-02 | P1 | Mobile total | Mark parts Need around 375 px width | Total, range, comparison, and assumptions remain readable without horizontal scrolling. |
| A11Y-01 | P1 | Keyboard | Use Tab, Shift+Tab, Enter, and Space through the form, details, ownership choices, and buttons | Focus is visible; native controls work; no mouse is required. |
| A11Y-02 | P1 | Screen-reader status | Trigger validation, partial plan, location notice, feedback, and budget comparison | Errors and important status changes are announced without repeating the entire page. |

## Known-risk checks

These deserve special attention because the source data is tentative:

- 285 of 334 V5 part estimates are marked Low confidence.
- Some ranges are very broad. The typical school-project estimate leads; the range must remain visible.
- The CSV does not explicitly say whether price is per unit or per pack. V1 assumes one school-project price per displayed purchase line.
- Prices are dated 2026-08-30 and must never be described as live.
- External seller and map links can fail independently; the parts plan must remain usable.

## Test record

For each test run, record:

| Field | Value |
|---|---|
| Date and time | |
| Tester | |
| Version or Git commit | |
| Browser and device | |
| Passed | |
| Failed | |
| Blocked | |
| Most important failure | |

