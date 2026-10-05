---
name: discovery
description: "Product discovery before building: frames the problem, JTBD, opportunity solution tree, assumption map, cheapest test and a brief with metrics. Use when the request arrives as a ready-made solution or at the start of a feature."
---

# Product discovery

> **DSX root:** two levels above this skill's base directory. The `knowledge/` and `templates/` paths are relative to it.

References: `knowledge/research/discovery-and-strategy.md`, `metrics-and-roi.md`; templates `jtbd.md`, `opportunity-solution-tree.md`, `assumption-map.md`, `brief.md`.

**Rule:** discovery reduces the risk of building the wrong thing. It ends when the next decision is clear — not when the document looks nice.

## 1. Frame the problem

Answer with evidence (or mark `[no evidence]`):
- **Who** has the problem (segment, role, context)?
- **What** is the problem, in terms of observed behavior — not a missing solution? ~~"We lack a dashboard"~~ → "Managers spend 2h a week building the report by hand."
- **Why now?** What is the cost of not solving it?
- **How will we know** we solved it? (outcome metric, not delivery metric)

If the request came in as a solution, rewrite it as a problem and confirm with whoever asked.

## 2. Job to be done

`templates/jtbd.md`: **When** <situation>, **I want** <motivation>, **so that** <expected outcome>. Include functional, emotional and social dimensions, and the solutions the person "hires" today (including spreadsheets, WhatsApp, doing nothing).

## 3. Opportunity solution tree

`templates/opportunity-solution-tree.md`: **desired outcome** (1 metric) → **opportunities** (needs/pains heard from users) → **solutions** (≥ 3 per chosen opportunity) → **experiments** (test the solution's assumptions). Compare solutions with each other; never evaluate just one.

## 4. Assumptions

`templates/assumption-map.md`: list what must be true for each solution to work, in the categories desirability, viability (business), feasibility (technical), usability and ethics. Place them on **importance × evidence**. Test the **important ones with little evidence** first.

## 5. The cheapest test that answers

| Assumption | Test |
|---|---|
| Do people want this? | fake door / landing page with measurement, problem interview |
| Do they understand the proposal? | concept test (5–8 people) |
| Can they use it? | prototype + usability test |
| Will they pay / adopt? | pre-sale, pilot, concierge MVP |
| Can it be built? | technical spike |

Define **before** the test: what counts as success and what you will do if it fails. A fake door requires an honest notice right after the click and must not collect payment.

## 6. Brief

`templates/brief.md`, one page: problem and evidence · people and job · expected outcome and metric (with a baseline) · scope **and negative scope** (what is left out) · open assumptions and how they will be tested · risks (including accessibility and ethics) · constraints.

## What an agent can and cannot do

- **Can:** rewrite solution requests as problems, draft JTBD/OST/assumption map, generate solution alternatives, suggest experiments, calculate samples and metrics.
- **Cannot:** claim a problem exists or is frequent without data, "validate" a solution with synthetic users, choose the business outcome for the team.
