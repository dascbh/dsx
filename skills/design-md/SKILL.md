---
name: design-md
description: "Creates, updates or evaluates the project's DESIGN.md (100-point rubric and gates): extracts it from code, defines it for a new project or audits the existing one. Use when DESIGN.md is missing, agents generate inconsistent UI or someone asks to evaluate it."
---

# DESIGN.md: create, update, evaluate

> **DSX root:** two levels above this skill's base directory. Paths under `knowledge/`, `templates/`, `tools/`, `examples/` are relative to it.

Full reference: `knowledge/design-system/design-md.md`. Template: `templates/DESIGN.md`. Filled-in, approved example: `examples/DESIGN.md`.

**Principle:** the file's value lies in what it **keeps the agent from guessing**. A value without intent is half the job: the YAML says *what*, the prose says *when, why and where not to use it*.

## Choose the mode

- No DESIGN.md and there is a product/code → **Mode A: extract**
- No DESIGN.md and the project is new → **Mode B: define**
- DESIGN.md exists → **Mode C: evaluate** (then fix the gaps)

## Mode A — Extract from an existing product

1. **Real inventory**: if `.dsx/maps/design-system.json` exists (skill `map-ux`), start from it — it already carries tokens per adapter (MUI, Tailwind v3/v4, CSS vars, DTCG), values in use, drift `hazards[]` and a draft front matter. Otherwise, delegate to the `design-system-extractor` subagent. Survey: token source (CSS vars, Tailwind/MUI theme, `*.tokens.json`), colors actually used (count occurrences), font/space/radius scales, shared components and their states.
2. **Name by role, not by looks**: `primary`, `text-secondary`, `danger` — never `blue-500` in the front matter. Values used only once are drift candidates, not tokens.
3. **Write the prose with evidence**: for each rule, where it came from (file, screen). Mark with `(inferred)` everything you deduced without seeing it explicitly.
4. **Do/Don't from real mistakes**: inconsistencies found in the inventory become "Don't".
5. **Ask the user** only what the code cannot answer: personality, target density, what must never happen.
6. Validate ("Validation" step below).

## Mode B — Define for a new project

1. Interview in a single round: product type and use (task x showcase), audience and context of use (mobile on the move? desktop 8h/day?), density, 1 brand color, tone of voice.
2. Generate the base with the tools (details in the `tokens` skill):
   ```bash
   node tools/palette.mjs "<brand-color>" --format dtcg
   node tools/type-scale.mjs --base 16 --ratio major-third   # 1.2 for dense; 1.333 for editorial
   node tools/spacing-scale.mjs --base 4
   ```
3. Assign semantic roles and check **every text/background pair** with `tools/contrast.mjs` **before** writing the file.
4. Fill in `templates/DESIGN.md` completely. No section may be left with only a comment.

## Writing rules (apply to A and B)

- Replace adjectives with observable criteria: ~~"modern and clean"~~ → "at most one accent color per viewport; hierarchy through typography and space; no shadow on cards".
- Colors: table **Role | Token | Where it appears | Where it NEVER appears**.
- Typography: **hierarchy** rules ("h1 is the page's single title"), not just sizes.
- Components: variants + **all states** (default, hover, focus, active, disabled, loading, error, empty, success) + contraindications.
- Accessibility: numbers (contrast, touch target, zoom), never "should be accessible".
- Include the **Agent Instructions** section: *when* to consult it, *what* to preserve, *how* to validate.
- Do not invent components that do not exist in production. Do not contradict the tokens.

## Mode C — Evaluate (100-point rubric)

**Step 1 — Objective gates (automatic):**
```bash
node tools/lint-design-md.mjs DESIGN.md
```
Any ERROR fails, regardless of the score.

**Step 2 — Judgment gates** (automatic failure if any of them fails):
1. Contradicts the real product/tokens without a recorded justification.
2. Essential color pairs below the WCAG minimum.
3. The file does not reach the agent's context (it is not referenced in CLAUDE.md/AGENTS.md/tool rules).
4. Conflicting instructions for the same context (e.g. DESIGN.md says one thing, `.cursor/rules` says another).

**Step 3 — Score**, with evidence per criterion:

| Criterion | Weight | Question |
|---|---:|---|
| Fidelity to source | 15 | Do tokens and components match the product (sample 5 screens/files)? |
| Technical validity | 10 | Passes the linter, references resolve? |
| Semantic tokens | 10 | Names by function, coherent scales, no duplication? |
| Intent and prose | 15 | Does the prose explain decisions the value alone does not? |
| Components and states | 15 | Do core components have variants and all states? |
| Accessibility | 15 | Verifiable rules with numbers? |
| Responsiveness | 8 | Mobile, long content, empty/error/loading? |
| Guardrails | 5 | Specific "Don'ts", tied to real mistakes? |
| Agent operation | 4 | Demonstrably loaded into the agent's context? |
| Maintenance | 3 | Owner, date, review routine? |

Bands: **90–100** robust · **75–89** usable with gaps · **60–74** revise before it becomes an authority · **< 60** high risk (the agent will invent core decisions).

**Step 4 — Controlled generation** (acceptance test): ask for a new screen using only DESIGN.md and the project's code. List what the agent had to invent (color, spacing, state, component). Each invention is a gap in the file.

**Mode C output:**
```
Gates: lint ✔/✘ · fidelity ✔/✘ · contrast ✔/✘ · connection ✔/✘ · conflicts ✔/✘
Score: NN/100 (band)
By criterion: <criterion> NN/weight — evidence
Gaps revealed by controlled generation: …
Prioritized fixes (max. 7): …
```

## Promote a design option

When the new DESIGN.md was prepared as a design option (skill `design-lab`: candidates in `.dsx/design-options/`, compared on real screens), it becomes official only through `node tools/design-md/lab.mjs promote <name>`: DSX linter and official linter must pass, the previous file is kept as `previous-<date>.md`, the active pointer is cleared. Then update the code theme in the same change (DESIGN.md describes, the theme renders; `design.theme_gate` runs the project's DESIGN.md × theme check) and evaluate the promoted file with Mode C.

## Validation (all modes)

1. `node tools/lint-design-md.mjs DESIGN.md` with no errors.
2. If the project uses DTCG tokens: `node tools/build-tokens.mjs` with no contrast failures, and the front matter values match `tokens/build/*.json`.
3. Connect it to the agent — the `init` skill does this, in a single block together with `DESIGN.md`'s pair, `UX.md` (skill `ux-md`); minimum: one line in `CLAUDE.md`/`AGENTS.md` saying "Before creating or changing UI, read `DESIGN.md` (how it looks) and `UX.md` (what type of screen, where everything goes, how it behaves)".
4. Record `owner` and `updated` in the front matter.
