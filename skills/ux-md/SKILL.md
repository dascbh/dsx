---
name: ux-md
description: "Creates, updates or evaluates the project's UX.md (how the interface is organized and behaves; 100-point rubric, gates and drift): extracts it from code by classifying each screen into an archetype, defines it for a new project, or audits it with the linter, score, drift, ux-lint and review. Use when UX.md is missing, screens of the same type diverge, drift reports UX.md as stale, or someone asks to evaluate it."
---

# UX.md: create, update, evaluate

> **DSX root:** two levels above this skill's base directory. Paths under `knowledge/`, `templates/`, `tools/`, `examples/`, `archetypes/` are relative to it; paths without a prefix (`UX.md`, `.dsx/`, `src/`) belong to the user's project.

Contract (schema, 13 sections, version and freshness, deviations, score and gates, drift U1–U6, rules T/F/S/C/L): `knowledge/foundations/ux-md.md`. Rubric: `evals/rubrics/ux-md.yaml`. Template: `templates/UX.md`. Approved example: `examples/UX.md`. Screen-type catalog: `archetypes/` (one card per id).

**Principle:** `DESIGN.md` says how the screen **looks**; `UX.md` says **what type of screen it is, where everything goes and how it behaves**. Its value lies in what it keeps the agent from guessing: where the primary action sits, when to confirm, what to show when empty, how to go back.

## UX.md and the UX blueprint

`UX.md` is the **product** contract: conventions every screen follows. The **objective** contract is the UX blueprint (`templates/ux-blueprint.md`), written into the front demand's Forward design family (`specs/<demand-id>/design/intended-model.md`, `flow.md`, `ia.md`). Keep them apart: UX.md never lists one objective's scenarios, and a blueprint cites UX.md policies by key instead of restating them. When a blueprint needs something UX.md forbids, record a deviation in UX.md (`deviations` + D… table) or revise UX.md in the same cycle; never let the two disagree silently. `tools/ux-lint/blueprint.mjs check` verifies the blueprint against the captures and the flow map; `ux-md-drift.mjs` keeps verifying UX.md against the product.

## Choose the mode

- No `UX.md` and there is a product/code → **Mode A: extract**
- No `UX.md` and the project is new → **Mode B: define**
- `UX.md` exists → **Mode C: evaluate** (then fix the gaps)

## Mode A — Extract from code

1. **Maps first.** If `.dsx/maps/` does not exist or is stale, run the `map-ux` skill. Read `ui-map` (screens, dialogs, components), `flows` (navigation graph), `tasks` (steps and confirmations), `journey` (persona and moments) and `domain` (entity vocabulary). An item under `uncertain` is not a fact: confirm it with `confirm-maps` or mark it "(inferred)".
2. **Flow map with evidence.** For each module, make sure there is a `.dsx/maps/flows-<module>.json` with `screens`, `transitions` (`trigger` + `evidence` `file:line`) and `journeys` (format in `knowledge/foundations/ux-md.md`). A transition with no evidence in the code does not go in.
3. **Captures from code.** If the project has a capture-from-code skill (DSX's `capture-from-code`, or the project's own), capture the main screens and their states as HTML. They are the input of the screen ux-lint and the reference for "how it is today". Never rebuild an existing screen from a text description.
4. **Classify each screen into an archetype.** For each route/dialog in the map, read the cards in `archetypes/` and pick the one whose `quando-usar` matches the screen's **task** (not its looks). IF none matches → THEN record the deviation in section 5 with the reason. IF the screen does two tasks of different types → THEN record it as a deviation and propose splitting it.
5. **Derive the policies from what the code already does.** Count, do not assume: where the primary action sits on screens of the same type, how many primary actions per region, button order in dialogs, whether irreversible actions ask for confirmation, how success shows up (toast, inline), which states each screen handles, how forms validate. The majority becomes the policy in the front matter; note the evidence (file or screen) in the prose.
6. **Inconsistencies become "Don't".** Every divergence between screens of the same archetype (e.g. primary action in the footer on one list and at the top on another; dialog over dialog; "Confirmar" on a destructive action) goes into the "Don't" block with the screen where it appears. Recurring problems that were solved well become "Do".
7. **Structured deviations.** Each screen that differs from its card on purpose goes into the "Declared deviations" table in section 5 **and** into the `deviations` block of the front matter, with `screens` (map ids), `rules` (the ux-lint rules the deviation explains: L9 for a missing region, T3 for another screen's `h1`, F1 for an intentional dead end…), `reason` and `decided-by`. Debt that should be fixed is not a deviation: it goes under "Don't".
8. **Verification selectors.** Fill in `verification.selectors` with the kit's real classes (e.g. MUI's contained button, shadcn's destructive variant) by looking at the captures.
9. **Glossary.** One glossary per vocabulary: if the product has modules with their own terms, use `content.glossary: { default: …, <module>: … }`.
10. **Ask the user** only what the code cannot answer: persona, what is critical to get wrong, what the experience never does, forbidden terms.
11. `version: 1.0.0`, `format: alpha`, `updated` set to today. Validate (Mode C, steps 1 to 3).

## Mode B — Define for a new project

1. Interview in a single round: persona and main task, frequency and context (desktop 8 h/day? phone on the move?), what is expensive to get wrong, what the product never does.
2. Choose `product.register` with `knowledge/design-system/choosing-a-design-system.md`. The register constrains the archetypes: IF `operational` → THEN operational list, master-detail, editor with panel and monitoring dashboard are the base; IF `consumer` or `brand` → THEN prefer few screens per task, step-by-step wizard and public decision page; IF `editorial` → THEN document with viewer and library. Confirm against the `register` field of each card.
3. List the screens from the tasks (one main task per screen) and assign each one's archetype in the front matter.
4. Settle the open policies (primary action position, confirmation, feedback, validation) by consulting the matching patterns in `patterns/` (skill `patterns`). Pick one option and write down why.
5. Fill in `templates/UX.md` completely. No section may be left with only a comment. "Do and don't" comes from concrete risks of the task until there is a real problem; revise it after the first test.

## Writing rules (apply to A and B)

- Observable criterion instead of adjective: ~~"intuitive navigation"~~ → "every non-root screen has a breadcrumb and a back button; maximum depth 3".
- Area and button names exactly as they appear on screen.
- Section 5 is a table: screen | archetype | variation | deviation. Every screen in the front matter appears in it.
- Do not restate the patterns: cite the id (`patterns/actions/action-placement.md`) and say which option the product settled on.
- Do not invent screens that do not exist, nor policies the code contradicts, without recording the contradiction.
- **Version:** on every change bump `version` (archetype, policy or deviation → minor; text only → patch; navigation model or `register` → major) and `updated`, in the same commit as the UI change that motivated it.

## Mode C — Evaluate

**Step 1 — Format (automatic):**
```bash
node <DSX>/tools/lint-ux-md.mjs UX.md          # --json for machines
```
Any ERROR fails. "No card" warnings point to an archetype that has no reference in the catalog yet.

**Step 2 — Score, gates and drift (automatic):**
```bash
node <DSX>/tools/lint-ux-md.mjs UX.md --score --map .dsx/maps/flows-<module>.json --screens <captures-folder>
node <DSX>/tools/ux-lint/ux-md-drift.mjs UX.md --module <module> --root .
```
100-point score by criterion (screen coverage, policies with evidence, states, flows, glossary, do/don't, selectors, freshness, deviations) and gates: `lint`, `essential-coverage`, `policy-fidelity`, `connected-to-agent` (code) and `no-conflict` (judge). Any ✘ gate fails, regardless of the score. Bands as in `DESIGN.md`: 90–100 robust · 75–89 usable with gaps · 60–74 revise · < 60 high risk. Drift U1–U6 is a correction to the document (missing archetype, screen that disappeared, policy most screens do not follow, state without a capture, stale `updated`, expired deviation).

**Step 3 — Screen and flow (automatic, objective gate):**
```bash
node <DSX>/tools/ux-lint/screen.mjs <captures-folder> --ux UX.md
node <DSX>/tools/ux-lint/flow.mjs .dsx/maps/flows-<module>.json --ux UX.md
```
Findings of severity ≥ 3 must be fixed before delivery or become registered debt with an owner. Record them in `.dsx/findings` and decide through the register: run with `--json`, `node <DSX>/tools/ux-lint/findings.mjs register --module <m> --screen screen.json --flow flow.json --root <repo>`, and handle decisions through the register (`findings.mjs page`/`decide`, contract in `knowledge/foundations/ux-findings.md`). Registered debt = an `open` or `ignored` item with a reason; `findings.mjs check` in CI keeps it from getting worse.

**Step 4 — Judgment (skill `review-ux` and `eval-judge` with `evals/rubrics/ux-md.yaml`, `judge-criteria`):** what the machine does not measure.
- Does the assigned archetype match each screen's task? (Read the card's `quando-usar` and `evitar-quando`.)
- Are the front matter policies what the product actually does, or are they aspirations? An unrecorded contradiction fails.
- Do "Do and don't" come from real problems (screen, finding, ticket) or are they generic?
- Cognitive walkthrough of the main journeys over the captures, using section 11 as the script.
- Is each deviation in `deviations` a product decision with a reason, or disguised debt?

**Step 5 — Controlled generation** (acceptance test, as in `DESIGN.md`): ask for a new screen of an archetype already in use with only `UX.md`, `DESIGN.md` and the code. Every action position, confirmation, state or label the agent had to invent is a gap in `UX.md`.

**Mode C output:**
```
Gates: lint ✔/✘ · coverage ✔/✘ · fidelity ✔/✘ · connection ✔/✘ · conflicts ✔/✘
Score: NN/100 (band) · version X.Y.Z · updated YYYY-MM-DD
By criterion: <criterion> NN/weight — evidence
Drift: U… (what to change in UX.md)
Screen/flow findings: id, rule, severity, fix (or deviation to declare)
Gaps revealed by controlled generation: …
Proposed diff to UX.md (with the new version): …
```

## Checklist

- [ ] Every screen and dialog in the map is in the front matter `archetypes` or declared as a deviation in section 5.
- [ ] Policies backed by evidence (Mode A) or by the pattern that justifies them (Mode B).
- [ ] Inconsistencies found became "Don't" entries with the source screen.
- [ ] `lint-ux-md.mjs` with no error; screen and flow `ux-lint` run and recorded in `.dsx/findings/<module>/`; severity ≥ 3 handled.
- [ ] Deviations in the section 5 table and in the `deviations` block (same ids); `rules` filled in when the deviation explains a finding.
- [ ] `version` (semver) and `updated` bumped in the same commit as the UI change.
- [ ] `lint-ux-md.mjs --score` with code gates ✔ and `ux-md-drift.mjs` with no finding (or each finding turned into a fix in the file).
- [ ] Context block in the project's `CLAUDE.md`/`AGENTS.md` (skill `init`, step 6): "before creating or changing UI, read `DESIGN.md` (how it looks) and `UX.md` (what type of screen, where everything goes, how it behaves)".
