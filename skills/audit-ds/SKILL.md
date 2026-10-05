---
name: audit-ds
description: "Audits the health of a design system in code: tokens, raw-value drift, duplicated components, states, accessibility and maturity, with a prioritized plan. Use when the UI is inconsistent, before a redesign or when inheriting a project."
---

# Design system audit

> **DSX root:** two levels above this skill's base directory. Paths under `knowledge/`, `tools/`, `templates/` are relative to it.

References: `knowledge/design-system/governance-and-maturity.md`, `components.md`, `tokens.md`, `accessibility.md`.

## 1. Inventory (measured, not estimated)

Start from `.dsx/maps/design-system.json` if it exists (skill `map-ux`); otherwise, delegate to the `design-system-extractor` subagent, which writes that file. Its `hazards[]` (duplicated hex, off-palette color, duplicated radius/shadow, mode-conditioned color, unloaded font, canvas text with a different font) go straight into the diagnosis. If the project has a Figma file, `figma-coverage` tells what is missing on each side. Collect:

- **Tokens:** where they are defined, how many per category, whether there is a semantic layer, whether there is a dark theme.
- **Drift:**
  ```bash
  node tools/lint-raw-values.mjs src --json > drift.json   # occurrences and drift_per_1000_lines
  ```
  List the 10 most frequent raw colors and the token that should replace each.
- **Components:** list of the shared kit; for each, number of uses (grep for imports) and number of parallel implementations (e.g. 3 different buttons).
- **States:** component × state matrix (default, hover, visible focus, active, disabled, loading, error, empty). Mark ✔/✘/n.a.
- **Accessibility per component:** accessible name, keyboard, contrast — minimum sample: button, field, select, modal, tabs, table, toast.
- **Documentation:** is there a DESIGN.md (how it looks) and a UX.md (what type of screen, where everything goes, how it behaves)? Scores for each (`lint-design-md.mjs`; `lint-ux-md.mjs --score`) and UX.md drift (`tools/ux-lint/ux-md-drift.mjs`). Storybook/catalog? Does the documentation say when to use and when not to use?
- **Governance:** owner, versioning, contribution process, changelog.

## 2. Diagnosis

Classify each problem:

| Type | Example | Severity |
|---|---|---|
| Foundation | no semantic layer; contrast failing on an essential pair | high |
| Drift | 40 raw colors; 3 competing spacing scales | high if > 5/1000 lines |
| Duplication | `Button`, `Btn`, `PrimaryButton` | medium |
| Missing states | field with no error state, list with no empty state | high in a critical flow |
| Accessibility | modal without focus trap; icon without a name | high (blocking = critical) |
| Documentation | component with no usage criterion | medium |
| Governance | no owner / no version | medium |

## 3. Maturity

| Level | Description | Signal |
|---|---|---|
| 0 — Ad hoc | styles per screen | no tokens |
| 1 — Library | reusable components, repeated values | primitive-only or loose tokens |
| 2 — System | layered tokens, kit with states, usage docs | drift < 5/1000 lines |
| 3 — Governed | owner, version, contribution, a11y in CI, adoption metrics | automated visual/a11y regression |
| 4 — Agent-readable | DESIGN.md and UX.md approved (≥ 90, gates ✔, UX.md with no drift), patterns and automatic gates used by agents | controlled generation with no invented looks or behavior |

## 4. Remediation plan

Default order (each step unlocks the next):
1. Fix the failing contrast pairs (skill `tokens`).
2. Create/organize the semantic layer; map the most frequent raw colors to tokens.
3. Consolidate duplicates into the most used component; deprecate the others with a migration path.
4. Complete the states in the components of critical flows.
5. Write/update DESIGN.md (skill `design-md`) and UX.md (skill `ux-md`) and connect both to the agents (skill `init`, step 6). The per-module behavior audit is the `audit-ux` skill.
6. Put gates in CI: `tools/build-tokens.mjs --check`, `lint-raw-values`, `lint-ux-md` and `ux-md-drift.mjs`, axe.

## Separate adherence verdict (Forward contract)

Design-system adherence is a verdict of its own, separate from UI and UX quality (`data/pipeline-quality.json`, `ds_adherence`; Forward `design-system-lifecycle.md`). For each changed consumer give pass/fail/unknown/not-applicable with the pinned foundation revision, scope and evidence, per check: **tokens and kit** (raw-value and duplicate search with documented exceptions — `tools/lint-raw-values.mjs`), **semantics** (glossary, status/action meaning, object/cardinality; rule C2), **rendered parity** (reference/wireframe comparison across states, themes, viewports), **interaction and accessibility** (keyboard, focus, zoom, APG, axe; `tools/contrast.mjs`, rule L8) and **adoption** (consumers migrated, deprecations, rollback, explicit debt with owner and revisit trigger). No aggregate score compensates a failed check; maturity level and drift per 1,000 lines are diagnostics, not the verdict. Classify the state per subsystem (absent, implicit, fragmented, explicit) and record the inventory in the Forward discovery file `discovery/<objective>-design-system.md`, with the source revision of each item. When a cycle plan declares DS criteria (`kind: ds`), record the results as evidence for `audit.mjs --criteria` (`--evidence`).

## Output

```
Maturity: level N (<name>) — evidence: …
Drift: X occurrences in Y lines (Z/1000) — top 5 raw values → suggested token
Components: N in the kit; duplicates: …; critical missing states: …
Accessibility: blockers: …
Plan (max. 8 items, in order): item — effort (S/M/L) — impact
DS adherence (separate verdict): tokens/kit <v> · semantics <v> · rendered parity <v> · interaction/a11y <v> · adoption <v> — foundation <path>@<sha>
Metric to track: drift/1000 lines, % of screens using only the kit, DESIGN.md score, UX.md score and % of screens with an archetype
```
