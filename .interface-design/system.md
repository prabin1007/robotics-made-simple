# Robotics, Made Simple — Interface System

## Direction and feel

The interface should feel like a clear school robotics workbench: instructional, mechanical, encouraging, and honest about uncertainty. It serves a parent and grade 6–8 child turning a finalised animal-like robot idea into an understandable parts plan.

The page's visual signature is the blue robot blueprint paired with graph-paper structure. Keep this signature; do not replace it with generic SaaS gradients, floating glass cards, stock robot art, or decorative dashboard charts.

## Domain vocabulary

- Project brief
- Parts plan
- Brain, movement, power, sensing, communication, connections, and tools
- Already have / Need
- Common mistake
- Safety note
- Catalogue gap
- First build stage

Use plain language first. A technical part name may appear, but explain it in the same card.

## Color tokens

- `--ink: #102a43` — blueprint ink and primary text
- `--soft: #3d5870` — supporting explanations
- `--blue: #1356a2` — actions and technical structure
- `--dark: #0b376b` — blueprint surface and strong instructional panels
- `--orange: #f0642b` — emphasis, warnings, and the single warm accent
- `--orange-soft: #fff0e7` — caution surface
- `--sky: #dceeff` — selected states and secondary surfaces
- `--paper: #f6f9fc` — graph-paper canvas
- `--line: #b9c9d8` — structural borders
- `--green: #167354` — completed or successful state only

Keep the page predominantly paper and blue. Orange is scarce and meaningful.

## Typography

- Display: `Archivo Black`, falling back to `Arial Black`, `Impact`, then sans-serif.
- Body: `Atkinson Hyperlegible`, falling back to Arial and sans-serif.
- Labels and measurements: `IBM Plex Mono`, falling back to monospace.
- Display headings use tight tracking around `-0.04em`.
- Body copy uses roughly `1.5–1.6` line height.
- Utility labels are 10–12px, uppercase, tracked, and never used for long prose.

Always include local fallbacks because external web fonts may fail.

## Layout and spacing

- Base spacing unit: 4px; use multiples of 4 where practical.
- Main content width: `1160px`, with 24px desktop side space and 14px mobile side space.
- Hero: two balanced columns on desktop, one column below 900px.
- Planner: explanatory column plus form on desktop, one column below 900px.
- Parts are a vertical work list, not a card grid; the sequence matters.
- Dense controls use 8–16px spacing. Major stages use 56–120px separation.

## Depth and surfaces

Use a workshop-print depth system:

- Canvas: graph-paper background.
- Working surface: white with a dark 2px structural border.
- Selected state: sky-blue fill with blue border.
- Important action: blue or orange fill with a small offset solid shadow.
- Warning or uncertainty: orange-soft surface with an orange edge.

Do not mix rounded glass cards, soft floating shadows, and the existing sharp mechanical system.

## Hierarchy

Each stage has one focal action:

1. Hero: “Make a parts plan.”
2. Project form: “Create my parts plan.”
3. Parts list: ownership decisions and “I need all parts.”
4. Summary: the generated Need list.
5. Feedback: Useful / Needs work.

The active task wins through strong color and position. Explanations remain quieter in `--soft`.

## Reusable component patterns

### Primary action

- Native `<button>` or `<a>`.
- Minimum height: 40px; prefer 44px for main actions.
- Blue or orange fill, white text, dark 2px border.
- Hover darkens; active state scales to `0.97`.
- Visible orange focus ring.

### Bulk parts action

- Label: `I need all parts`.
- Location: top-right of the parts list beside the marked counter.
- Marks every displayed part as `Need` in one action.
- Individual ownership choices remain editable afterward.
- Disabled label: `All parts marked as needed` only while every displayed part is `Need`.
- Disabled state uses sky fill, line border, and soft text.

### Ownership choice

- Native radio inputs with two choices: `Already have` and `Need`.
- Selected choice uses sky fill, blue border, and stronger text.
- Never ask for owned parts before showing the suggested list.

### Part row

- Sequence number, category initial, catalogue information, and ownership controls.
- Show part name, kid-friendly explanation, quantity, skill level, voltage, and compatibility.
- Put common mistake and safety details inside native `<details>`.
- Price observations must say `Price lead`, include the checked date, and state that they are not live prices or direct product links.
- Seller links are labelled searches, not purchase promises.

### Part metaphor

- Use the `PartMetaphor` component in every part row, after the kid-friendly explanation and before the fact chips.
- Draw the icon as an inline `<svg>` using simple shapes only. Do not use image files or an icon library.
- Use these teaching comparisons: sensor = eyes, Arduino or controller = brain, motor driver = power manager, motors = muscles, and battery or power = energy.
- Use `support part = building block` when a part does not match one of the five main comparisons.
- Put one plain-text comparison beside the icon. Treat it as a learning aid, not a technical claim.
- Use `--blue` for the main stroke, `--orange` for the detail, and `--sky` for the background.
- Keep the icon and text in a row on desktop. Below 600px, stack the icon above the text.
- Give the SVG `role="img"` and an accurate `aria-label` so screen readers can explain it.

### Disclosure and catalogue gap

- Every result states: `Database-guided demo—not live AI, live prices, or verified buying advice.`
- Adult supervision is required before buying, connecting, or powering hardware.
- Missing capabilities are shown as `Catalogue gap`; never silently substitute a different sensor.

### Store lead

- Show store name, category, recorded rating, and checked date.
- State that it is not a stock confirmation and users should call before travelling.

## Motion and accessibility

- Keep interaction transitions near 150ms and name the animated properties.
- Respect `prefers-reduced-motion`.
- Use native buttons, links, radio inputs, details, labels, and fieldsets.
- Preserve visible keyboard focus.
- Keep action hit areas at least 40px high, preferably 44px.
- Check desktop and mobile layouts after every meaningful interface change.

## Product truth rules

- The current V1 is database-guided, not live AI.
- Do not claim live price, stock, verified compatibility, or direct product links without evidence.
- The CSV folder remains the editable source of catalogue data.
- New features do not enter the interface unless they help a user complete the parts-plan flow.
