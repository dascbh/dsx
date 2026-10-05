---
name: figma-proposals
description: "Explores alternatives on page 09 · Propostas from the DSX and critiques what design drew there before it becomes code. Use to visualize options in Figma or to get a second opinion on a proposal."
---

# Proposals in Figma: explore and critique before pulling

> **DSX root:** two levels above this skill's base directory. Paths under `knowledge/`, `patterns/`, `tools/`, `templates/` are relative to it; paths without a prefix (`design/`, `.dsx/`, `src/`) belong to the user's project.

The mirror (`figma-mirror`) describes **the present** and is never redesigned. The `09 · Propostas` page is the place for **the possible future**: where alternatives are explored and where design leaves what it wants to see become code. This skill covers both directions of that page.

| Mode | Who draws | Output |
|---|---|---|
| **A — Explore** | the agent, from the DSX | 2–3 alternatives in `09 · Propostas`, each with a hypothesis and a trade-off |
| **B — Critique** | design (a person) | pre-flight report per proposal: go / adjust / send back |

## Preconditions

- Cycle set up (`figma-init`) and foundations in the file (`figma-foundations`): proposals are built with the **kit's variables and components**, never with loose values.
- Read `design/figma-sync.md`. **Mode A writes to the file:** only with `turn: code`, or with `turn: design` if design itself asked for the exploration — in that case, ask the person to pass the turn (`figma-turn`) or draw only after they confirm; the guard blocks writes during design's turn, and that is intentional. **Mode B only reads:** it runs on any turn.
- Load the official `figma-use` skill before any `use_figma`.

## Mode A — Explore alternatives

1. **Frame the problem** in 3 lines: for whom, main task, what the current version does badly (with evidence: a `review-ux` finding, research data, a user request). With no declared problem, there is nothing to compare.
2. **Formulate 2–3 genuinely different hypotheses** — not three color variations. Examples: "dense table with fixed filters" × "cards with a summary and detail in a panel" × "list grouped by status". Each one consults the catalog (`patterns/index.json`) and cites the patterns it applies.
3. **Build them in Figma**, one alternative per frame, side by side, next to a **referenced** (not edited) copy of the current frame. Use the file's kit and variables; real text (`ux-writing`), realistic data volume, and at least one non-ideal state (empty or error) per alternative.
4. **Name** each one `Proposta · <screen> · A — <hypothesis in 3–5 words>` and write the hypothesis, the patterns used and the main trade-off in a note next to each frame.
5. **Verify the render**: a screenshot of each alternative; contrast of the new pairs with `node tools/contrast.mjs`; targets ≥ 44px; hierarchy (one primary action per region).
6. **Record** one line in `design/figma-changelog.jsonl` (`direction: "code->figma"`, `summary: "propostas: <tela>"`) and list the proposals under `## Open proposals` in `figma-sync.md`.
7. **Recommend** one, with the deciding criterion (e.g. "A, if the dominant task is comparing; B, if it is following one item") and what to validate with real people (`research` skill) before deciding. Proposals are hypotheses, not evidence.

## Mode B — Critique what design drew

For each frame in `09 · Propostas` (or the ones the user points to):

1. **Read without editing**: `get_screenshot` + `get_design_context` (or the snapshot in `MODE='full'` with `TARGETS`). Delegate to the `figma-reader` subagent if there are many frames.
2. **Compare with the corresponding current frame** and list what changes.
3. **Apply the DSX lenses**, in this order, citing the source of each finding:
   - **Tokens:** are fills/strokes bound to variables (`@color/...` in the snapshot)? A raw value in a proposal = a disguised token change, or drift.
   - **Contrast and not-color-alone:** `tools/contrast.mjs` on each new pair; a state communicated by color alone fails (`patterns/accessibility/not-color-alone.md`).
   - **Interaction patterns:** each decision against `patterns/index.json` — error in a toast, modal with a long form, disabled button with no reason, auto-advancing carousel…
   - **Heuristics and hierarchy:** `review-ux` skill (task walkthrough, severity 0–4).
   - **Text:** `ux-writing` skill (glossary, verb + object, error messages).
   - **Kit:** does the proposal create a component/variant that does not exist? That is a product decision, not a screen decision (`figma-conventions`, reuse vs create).
   - **What Figma does not show:** empty/loading/error states, focus, keyboard, narrow width. Absence in the frame is not an order to remove it from the code — but note what needs to be drawn.
4. **Verdict per proposal:**
   - **Go** → ready for `figma-pull`, with the expected classification (`token` / `primitive` / `composition` / `text` / `new pattern`).
   - **Adjust** → goes ahead with specific changes (list them; design makes the adjustments, in Figma).
   - **Send back** → hits a gate (contrast, not-color-alone, an `avoid` pattern, a finding recorded as intentional). Reason in one line, to go under `## Rejected` if design agrees.

## Output

```
Mode: A (explore) | B (critique)   Turn: <current turn>   Frames: <n>

[A] Alternatives
| Proposal | Hypothesis | Patterns | Trade-off | Verification |
Recommendation: … · Validate with people: …

[B] Pre-flight
| Proposal | Verdict | Expected class | Findings (sev) | Source |
Gates triggered: …
Needs to be drawn before pulling: …
```

Do not bring anything into code in this skill. The way back is `figma-pull`, which reapplies the gates to the real diff.
