# Robotics, Made Simple — Build Week Idea Scope

**Build Week:** 29 August–5 September 2026  
**Primary track:** AI Agent as a Service  
**Track risk:** The current database-guided V1 is not yet an AI agent. Add AI selection or explanation only after the complete catalogue flow is observed working; do not claim the AI track before that exists.
**Status:** Idea approved; scope locked  
**Time available:** 5–6 hours on Sunday; 2–3 hours per day from Monday onward

## Product lock

**One-sentence product:** After a grade 6–8 student has chosen an animal-like robotics project, Robotics, Made Simple uses a beginner-parts catalogue to suggest a parts plan, explain why each part is needed, and identify the first build stage.

**Person:** A parent helping a grade 6–8 child who has finalized a school robotics project but has not yet worked out what to buy or how to build it.

**Pain:** Parts stores are too technical, general videos do not match the child's project, and scattered information does not let the child build independently.

**Required outcome:** Starting from a finalized animal-like robot idea, the child and parent receive an understandable starting parts plan, can separate parts they own from parts they need, and know that the recommendations are not yet verified.

**Core action:** Parent or child enters the finalized project, intended behaviors, country, and budget range → V1 matches those answers to the supplied parts catalogue and shows purpose, specifications, compatibility concerns, and the first build stage → user marks each suggested part as “Already have” or “Need.”

**Required input gate:** The product must collect all four items below before suggesting any parts:

1. Finalized animal-like robot project idea
2. Intended behaviors—what the robot must do
3. Country, so recommendations can reflect the user's market without claiming live availability
4. Budget range

The parts plan is based on these four answers. The product must not ask which parts the user owns until after it displays the suggested list.

**Locked V1 category:** Animal-like beginner robots. V1 does not discover or choose the project; the user arrives with a finalized project idea.

**Long-term direction:** Improve and verify the parts catalogue, then let AI select and explain catalogue parts for beginner robotics projects beyond animal-like robots.

## Evidence labels

- **Stated by founder:** The founder personally experienced the difficulty of explaining C programming, how robot parts work, and which parts are available for a grade 6–8 school project. Current research is scattered across the web. Reachable testers include parents, children doing robotics projects, coworkers, and WhatsApp groups.
- **Inference to test:** Parents and children with a finalized animal-like robot project will find a clearly labelled, database-guided parts plan useful enough to continue, even before every recommendation is verified.
- **Verified from a source:** Nothing yet. Do not present an inference as a verified claim.

## Scope boundary

### V1 does

- Collect the finalized animal-like robot description, intended behaviors, country, and budget range before showing any recommendation.
- Match the four inputs to the supplied CSV parts catalogue using explicit V1 rules.
- Let the user mark every suggested part as “Already have” or “Need”; do not require an inventory before showing recommendations.
- Explain each part in language suitable for grades 6–8.
- State the basic specification the buyer should check and any possible compatibility concern.
- Label every V1 plan prominently: “Database-guided demo—not live AI, live prices, or verified buying advice. Check specifications with an adult before buying or powering hardware.”
- Never claim live price, stock, guaranteed compatibility, or electrical safety.
- Never recommend mains electricity; keep V1 to low-voltage beginner components and require adult involvement before connecting or powering hardware.
- Show how the suggested parts connect at a high level and identify the first build stage.
- Record plans created, parts viewed, stopping points, and whether the plan was useful.
- Store the four inputs, catalogue output, “Already have” or “Need” selections, and usefulness feedback in Convex so repeated useful suggestions can improve later matching.

### V1 does not

- Support robotics projects outside the animal-like category.
- Choose or invent the project for the child.
- Design a complete robot automatically or guarantee that an untested combination will work.
- Provide build videos, wiring instructions, or C code in the first V1 flow.
- Check live stock or prices, sell parts, or connect to suppliers.
- Use live AI generation in the first database-guided V1.
- Offer an open-ended chatbot, course library, community, teacher dashboard, or mobile app.
- Add payments, team accounts, or polished branding.
- Guarantee electrical safety. Every guide must tell the child to involve an adult before connecting or powering hardware.

### Fixed cuts

If a feature does not directly help a parent and child turn a finalized animal-like robot idea into an understandable parts plan, it goes to the parking lot. No project-discovery tool or second project category enters V1 before three observed sessions are complete.

## Gate 0 — test the riskiest assumption before building

**Assumption:** Once a child has finalized an animal-like robot project, the parent and child will find a clearly labelled, database-guided parts plan useful enough to decide what they already have and what they may need.

**30-minute no-code test:**

1. Ask one reachable parent for their child's finalized animal-like robot idea, intended behaviors, country, and budget range. Do not ask for an inventory first.
2. Use the supplied CSV catalogue to make one plain parts plan from those four answers. Include suggested parts, why each is needed, specifications to check, possible compatibility concerns, and the first build stage. Label the whole plan “Database-guided demo—not verified buying advice.”
3. Give it to the parent and child without explaining the content.
4. Ask them to mark each suggested part as “Already have” or “Need,” then mark anything they would not buy or still do not understand.
5. Observe where they pause, ask for help, or distrust a recommendation. Stop after 30 minutes.

**Pass:** The parent and child can mark every part as “Already have” or “Need,” explain why each is suggested, identify what must be checked before buying, and still rate the unverified plan useful without a spoken explanation.

**Fail:** They cannot connect the recommendations to their finalized project, cannot tell which parts work together, or need the maker to translate the plan.

**Decision after the test:**

- If it passes, build the same parts-planning flow on the web.
- If it fails because of wording or order, revise the document once and repeat for no more than 30 minutes.
- If it still fails, do not add features. Reduce V1 to explaining and checking the smallest confusing part choice.

## Six fixed milestones

### 1. Saturday, 29 August — choose and lock the idea

**Tasks:** Record the person, current pain, required outcome, core action, and exclusions in this file.

**Acceptance test:** A reader can state who it serves, what the child completes, and what will not be built without asking the founder.

**If behind, cut to this:** Keep only the one-sentence product, person, pain, required outcome, and one explicit non-goal.

### 2. Sunday, 30 August — validate first, then ship one ugly complete flow

**Tasks:** Run Gate 0 before building. First deploy one ugly, hard-coded, complete input-to-plan flow and push it to the public GitHub repository. After that flow passes in a private browser window, connect the supplied CSV catalogue so supported behaviors produce database-guided plans. Deploy to Vercel. Use Convex only for the inputs, catalogue plan, “Already have” or “Need” selections, stopping points, and usefulness response.

**Acceptance test:** From the public Vercel URL, a new user must provide the finalized animal-like robot idea, intended behaviors, country, and budget range before any parts appear. The catalogue then produces a plan labelled “Database-guided demo—not live AI, live prices, or verified buying advice.” The user can understand why each part is suggested, see what must be checked, mark every part as “Already have” or “Need,” and mark whether the plan was useful. A second input with a supported different behavior produces relevant different parts. The public GitHub repository contains the deployed version, and the input, output, selections, and feedback appear in Convex. The flow works in a private browser window without its maker explaining it.

**If behind, cut to this:** One fixed animal-like robot example, one catalogue-backed parts plan labelled “not verified buying advice,” plain explanations, possible compatibility concerns, and two buttons: “I don't understand this part” and “This plan is useful.” Deploy that complete flow; cut sign-in, AI, videos, and all visual polish.

### 3. Monday, 31 August — watch three people use it

**Tasks:** Schedule and conduct sessions with the project partner's parent, one other parent of a grade 6–8 child, and one coworker who is a parent or has beginner robotics experience. Ask parents for permission before involving a child. Give each tester the link, do not demonstrate the flow, and record the first stopping point and whether they would act on the parts plan.

**Acceptance test:** Three sessions have a date, participant label, finalized project input, first stopping point, help requested, parts accepted or rejected, and usefulness result. At least one session includes both a parent and child.

**If behind, cut to this:** Run two live child sessions and one parent walkthrough on Monday. Do not replace observation with opinions or a survey.

### 4. Tuesday, 1 September — invite users where they already gather

**Tasks:** Send direct invitations in the relevant school or parents' WhatsApp groups, subject to group rules. State that V1 supports animal-like beginner robots only. Track each invitation, reply, plan start, completed plan, and usefulness response. Follow up directly with interested parents.

**Acceptance test:** At least five direct invitations are sent and recorded. The count of replies, link opens, plan starts, and completed parts plans can be shown separately; zero is a valid recorded result.

**If behind, cut to this:** Send three individual WhatsApp invitations to parents and record their replies. Do not spend the evening writing a broad social-media campaign.

### 5. Wednesday, 2 September–Friday, 4 September — fix the largest observed blocker

**Tasks:** Rank stopping points by how many users hit them and whether they prevent completion. Choose one blocker only. Fix it, deploy it, and invite the affected users to retry. Repeat only after the first fix is observed in use.

**Acceptance test:** One named blocker is supported by session evidence, one new version addressing it is live, and at least one affected user has retried the changed step. Before-and-after completion results are recorded without claiming improvement when the sample is inconclusive.

**If behind, cut to this:** Rewrite or re-record the single confusing step, deploy it, and watch one user retry. Add no new behavior and no new project.

### 6. Saturday, 5 September — verify, capture evidence, and submit

**Morning tasks, completed before 11:00 AM IST:**

1. Open the production URL in a private browser window and complete the full flow.
2. Confirm the public GitHub repository opens and matches the deployed product.
3. Confirm the recorded numbers can be reproduced from the stored events and session notes.
4. Capture screenshots of the live flow and the numbers.
5. Prepare an honest summary separating invitations, starts, completions, repeat use, and parent requests.
6. Submit the live Vercel URL, public GitHub repository, and numbers before 11:00 AM IST.
7. Prepare the 3:00 PM demo around one child, one blocker, one shipped fix, and the measured result.

**Acceptance test:** The submitted URLs work for a signed-out visitor, screenshots are saved, every stated number has supporting evidence, and submission is confirmed before 11:00 AM IST.

**If behind, cut to this:** Freeze product changes. Verify the one complete flow, capture the available honest numbers even if they are zero, take screenshots, and submit. Demo polish comes only after submission.

## Measurement sheet

Record counts separately; never combine them into a vague “users” number.

| Measure | Definition |
|---|---|
| Invited | A parent or child received a direct invitation. |
| Replied | The invited person sent any response. |
| Started | The user submitted or opened a project input. |
| Stuck | The user reported confusion or stopped during an observed session. |
| Completed | The user reached the end of the parts plan. |
| Independent completion | The user understood the parts plan without a spoken explanation from its maker. |
| Parts already owned | Suggested parts marked “Already have.” |
| Parts needed | Suggested parts marked “Need.” |
| Retried | Returned after the blocker was changed. |
| Parent request | A parent asked for another project or behavior. |

## User-session record

For each session, record only:

- Date and participant label
- Child or parent
- Finalized animal-like project and intended behaviors
- Started: yes/no
- First stopping point
- Spoken help needed: yes/no
- Completed: yes/no
- One exact user comment, only with permission
- Follow-up action

## Parking lot

Every feature suggested during the week goes here first. Nothing moves out before the current milestone's acceptance test passes.

- Wheeled home helper V2: a minimal 2WD platform carrying up to 100 g on a flat indoor floor, controlled by phone-assisted voice commands (`forward`, `left`, `right`, `stop`). Draft recipe: `docs/V2_WHEELED_HOME_HELPER_RECIPE.md`.
- Additional robot projects or behaviors
- More boards, motors, or sensors
- AI selection and explanation grounded in the parts catalogue
- Generated or personalised videos
- Live supplier stock and pricing
- Shopping links or affiliate revenue
- Open-ended robotics chat
- Parent and teacher dashboards
- Accounts, payments, community, courses, and mobile app
- Visual polish beyond what is needed for comprehension

## Scope-change rule

A new request enters V1 only if all three are true:

1. An observed user could not turn the finalized animal-like project into an understandable parts plan without it.
2. It addresses the most common completion blocker.
3. It can be built, deployed, and retested inside the current day's available time.

Otherwise, add it to the parking lot and continue the current milestone.

## Next single action

Ask one reachable parent for their child's finalized animal-like robot idea, intended behaviors, country, and budget range. Do not ask which parts they own yet.
