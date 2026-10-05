---
name: review-ux
description: "Usability review of a screen or flow: Nielsen heuristics with severity 0–4, cognitive walkthrough, hierarchy, states, text and patterns. Use for \"review this screen\", a UX audit or before delivery."
---

# UX review

> **DSX root:** two levels above this skill's base directory. Paths under `knowledge/`, `patterns/`, `templates/` are relative to it.

References: `knowledge/foundations/nielsen-heuristics.md`, `usability-evaluation.md`, `psychology-and-laws.md`, `visual-hierarchy.md`, `patterns/index.json`.

**Honest limit:** an expert review (human or agent) **finds likely problems; it does not prove** that real people will have the problem or that the fix works. For expensive decisions, recommend testing with users (skill `research`).

## 1. Frame (before looking at details)

Write in 3 lines:
- **For whom** the screen is (persona/role) and **in what context** (device, frequency, hurry).
- **Main task** the screen must enable, with start and end.
- **What the screen promises** (what it says it is, through its own text and hierarchy).

If you cannot answer, that is already the first finding (lack of clarity of purpose).

IF the project has a `UX.md` → THEN read it first: the archetype declared for the screen (and the card in `archetypes/`), the action, confirmation and feedback policies, the deviations (`deviations`) that cite the screen and the "Don'ts". A divergence between the screen and `UX.md` is a finding; an archetype that does not match the task is too. A divergence covered by a declared deviation is **not** a finding about the screen — at most, a finding about the deviation (weak reason, expired, disguised debt).
IF the project has no `UX.md` → THEN review against the DSX patterns and record its absence as the first finding (with no declared archetype, the review has nothing to compare against); suggest the `ux-md` skill.
IF `node <DSX>/tools/ux-lint/ux-md-drift.mjs UX.md --module <m> --root .` reports drift → THEN say in the report that `UX.md` is out of date on that point and do not treat the stale rule as truth.

## 2. Objective gate (ux-lint)

If there is an HTML capture of the screen and a flow map (`.dsx/maps/flows-<module>.json`), run before judging:

```bash
node <DSX>/tools/ux-lint/screen.mjs <captures> --ux UX.md        # T1–T7: primaries per region, dialog order, h1, labels, destructive, forbidden terms
node <DSX>/tools/ux-lint/flow.mjs .dsx/maps/flows-<module>.json --ux UX.md   # F1–F5: dead ends, orphans, long journey, stacked dialogs, return
```

The findings go into the report with the rule and the severity the tool assigned. The judgment below covers what it does not measure (archetype fit, clarity, cognitive load).

**Record in `.dsx/findings` and decide through the register** (contract: `knowledge/foundations/ux-findings.md`): run the checkers with `--json` and `node <DSX>/tools/ux-lint/findings.mjs register --module <m> --screen screen.json --flow flow.json [--text text.json] --root <repo>` (it reads the deviations in `<repo>/UX.md`: a covered finding becomes `accepted-deviation`, with the reason, and is not counted as open). The report cites each finding's id; the owner decides on the page (`findings.mjs page`) or in chat (`findings.mjs decide`), and the next review starts from `findings.mjs status` (regressions and decided-but-not-applied items) instead of starting from scratch.

## 2.1 Inspect the rendered screen

Prefer the running interface (browser/screenshot) over the code. Check: desktop and 320px width, light and dark theme, keyboard, states (empty, loading, error). If there is only code, say so in the report — confidence is lower.

## 3. Cognitive walkthrough of the main task

For **each step** of the task, answer:
1. Will the person **try** to do the right thing (do they know this step exists)?
2. Will they **notice** that the right action is available?
3. Will they **associate** the action with the result they want (does the label say what they think)?
4. After acting, will they **understand** from the feedback that they made progress?

Each "no" is a finding. Count steps and clicks: unnecessary effort is a finding.

## 4. Heuristic pass

Go through the 10 heuristics using the audit questions in `knowledge/foundations/nielsen-heuristics.md`. Pay special attention to:
- **H1 Visibility of system status:** every process > 1s has feedback; empty states explain the next step.
- **H3 User control and freedom:** is there undo/cancel/back without losing data?
- **H5 Error prevention:** does the interface prevent the error before complaining about it?
- **H9 Error recovery:** does the message say what happened and how to fix it?

Then, the complementary lenses:
- **Hierarchy:** the "squint test" — is the most important element the strongest? One primary action per region?
- **Fitts/Hick:** frequent targets large and close; few competing options in the main decision.
- **Cognitive load:** does the person need to remember something from another screen? Is there internal jargon?
- **Patterns:** for each interaction decision (modal, toast, validation, table…), compare with the matching card in `patterns/` and cite the id when there is a deviation.
- **Dark patterns:** any item in `knowledge/foundations/dark-patterns.md` is severity ≥ 3.

## 5. Severity

| Score | Meaning | Criterion |
|---|---|---|
| 0 | Not a problem | Aesthetic disagreement with no impact |
| 1 | Cosmetic | Fix if there is time left |
| 2 | Minor | Slows down or annoys; low priority |
| 3 | Major | Makes the person err or give up in some of the cases; high priority |
| 4 | Catastrophe | Blocks the task, causes loss of data/money or excludes people using assistive technology; fix before launch |

Severity = **frequency × impact × persistence**. An accessibility barrier that blocks the task is always 4.

## 6. Report

Use `templates/heuristic-report.md`. Rules:
- Each finding: **where** (screen/element), **what happens**, **why it is a problem** (heuristic/pattern/law), **severity**, a concrete **proposed fix**.
- Order by severity; group findings with the same root cause.
- At most 3 findings of severity ≤ 1 (do not drown what matters).
- Include **what is good** (up to 3 items) — it preserves correct decisions in the next iteration.
- If the fix depends on an assumption about the user, mark it `[hypothesis — validate with research]`.

For a review free of the builder's bias, delegate to the `ux-reviewer` subagent passing **only** the screen/route and the audience — never your construction reasoning.
