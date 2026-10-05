---
name: arrange-screen
description: "Proposes 2–3 arrangements for a screen, new or existing, from its archetype and variations; shows them in Stitch next to the current screen captured from code, the owner chooses, and the screen is built and re-verified. Use to rearrange, reorganize or lay out a screen."
argument-hint: "<route, screen file or description of the new screen>"
---

# Arrange screen

> **DSX root:** two levels above this skill's base directory. Paths under `knowledge/`, `patterns/`, `tools/`, `archetypes/` are relative to it; paths without a prefix (`UX.md`, `DESIGN.md`, `.dsx/`, `.stitch/`, `src/`) belong to the user's project.

**Arrangement** = where each thing on the screen goes (regions, primary action, filters, panel), not how it looks. Looks stay in `DESIGN.md`. This skill does not choose for the owner: it shows comparable options, with the cost of each, and builds the one chosen.

## 1. Frame the screen

1. Read the project's `UX.md` (if it exists) and `DESIGN.md`. Without `UX.md`, proceed with what the code shows and suggest the `ux-md` skill at the end.
2. Write in 3 lines: **for whom**, **main task** (start and end) and **frequency**. For an existing screen, use the flow map (`.dsx/maps/flows-<module>.json`) to know where the person comes from and where they go.
3. **Identify the archetype.** IF the screen is in the "Screen archetypes" section of `UX.md` → THEN use that one. OTHERWISE read the `quando-usar`/`evitar-quando` of the cards in `archetypes/` and choose by task type. IF two tasks of different types compete for the screen → THEN say so before arranging; splitting may be the best proposal.
4. Read `archetypes/<id>.md` in full: regions, primary action, states, patterns, **variations** and anti-patterns.

## 2. Diagnose the current screen (existing screen only)

1. Capture the screen from code with the project's capture skill (DSX's `capture-from-code`, or the project's harness), in the states that matter (with data, empty, error).
2. Run the objective gate on the capture and keep the output:
   ```bash
   node <DSX>/tools/ux-lint/screen.mjs <capture.html> --ux UX.md
   ```
3. List what the current screen does against the card: missing or extra region, misplaced primary action, absent state, anti-pattern present. Each item cites the ux-lint T* rule or the card item.

## 3. Propose 2–3 arrangements

Start from the card's **variations** (and from the deviations already declared in `UX.md`). For each arrangement, deliver:

| Field | Content |
|---|---|
| Name | the variation's name in the card, or "current, adjusted" |
| Region map | short ASCII diagram |
| Favors | the task or persona that gains (e.g. handling a batch of 40 items) |
| Worsens | the honest cost (e.g. the detail takes one more click) |
| Resolves | T* rules and diagnosis items that stop failing |
| Breaks UX.md? | policy that would need to change (record as a deviation if the owner chooses it) |

Rules: at most 3 arrangements; one of them may be "current with minimal adjustments" when the existing screen is close to the card; never propose an arrangement that violates `actions.primary-per-region`, the mandatory states or accessibility.

## 4. Show in Stitch

Use the `stitch` skill (and the official ones for the mechanics).

1. **Existing screen:** upload the code capture as the "Current" screen. **Never generate the current screen from text** (`generate_screen_from_text`): text reinterprets it and the comparison loses its value.
2. **Arrangements:** these may be generated or edited in Stitch, because they are proposals. Start from the current screen (editing) when it exists, to isolate the change of arrangement; use the design system synced from `DESIGN.md`.
3. Critique each arrangement with the critique step of the `stitch` skill (`tools/stitch/analyze-html.mjs`) before showing it.
4. Present side by side: Current | Arrangement 1 | Arrangement 2 (| Arrangement 3), with the table from step 3 below.

## 5. Ask the owner to choose

Ask which arrangement to follow, in one message, with the recommendation and the reason in one sentence. Do not build before the answer. IF the owner asks for a mix of two → THEN describe the resulting arrangement and confirm. IF the choice breaks `UX.md` → THEN record the deviation in section 5 (or propose changing the policy) in the same delivery.

## 6. Build and re-verify

1. Build with the `build-ui` skill (the project's components and tokens; Stitch's HTML is a reference, never pasted code).
2. Recapture the screen and run again:
   ```bash
   node <DSX>/tools/ux-lint/screen.mjs <new-capture.html> --ux UX.md
   ```
   No new finding; the findings the arrangement promised to solve are gone.
3. Update `UX.md` if the screen changed archetype, variation or deviation, and run `node <DSX>/tools/lint-ux-md.mjs UX.md`.

## Output

```
Screen: … | Archetype: … | Task: …
Diagnosis: <findings with rule/card>
Arrangements: 1 … (favors/worsens/resolves) · 2 … · 3 …
Stitch: <project/screens>
Owner's choice: … | Deviation recorded: …
Re-verification: ux-lint before N findings → after M; lint-ux-md OK
```

## Checklist

- [ ] Archetype identified by task and card read.
- [ ] Current screen came from the code capture, not from text.
- [ ] 2–3 arrangements, each with favors, worsens and rules it resolves.
- [ ] Owner's choice recorded before building.
- [ ] Screen ux-lint run afterwards; `UX.md` updated if the archetype or deviation changed.


## Pilot lessons (document editor with panel, 2026-10-02)

- **`edit_screens` over the code capture is the best path for arranging an existing screen:** Stitch edits the HTML itself with DOM operations and keeps the product's real CSS — the arrangement comes out looking like the product, not reinterpreted.
- **Always edit a copy:** sometimes the edit changes the source screen in place. Upload the capture once as "Current" and one copy per arrangement ("Arrangement N · base"); ask in the prompt to "create a NEW version".
- Screens created by editing may have no position on the canvas: create the instance (`PATCH …?updateMask=screenInstances`) when organizing the row "Current · Arrangement 1 · Arrangement 2 · Arrangement 3".
- **Re-verify each arrangement with `tools/ux-lint/screen.mjs`** by downloading the generated HTML: the proposal must clear the findings that motivated the rearrangement and not create others (in the pilot, one arrangement solved T1/T3 and created a T4 — a select field without a label).
- Look at the whole capture: a primary action in the footer of a scrolling panel may end up below the fold; when building, pin the footer.
