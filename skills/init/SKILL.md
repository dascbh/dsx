---
name: init
description: "Installs the DSX in a project: detects stack, tokens and components, creates or evaluates DESIGN.md (how it looks) and UX.md (how it is organized and behaves), connects both to the agents' context (CLAUDE.md, AGENTS.md, Cursor, Copilot) and suggests gates. Use the first time the DSX runs in a repository."
---

# Initialize the DSX in a project

> **DSX root:** two levels above this skill's base directory. Paths under `templates/`, `tools/`, `examples/`, `archetypes/` are relative to it.

## 1. Discover (without asking what the code answers)

Survey and note:
- UI framework (React/Vue/Svelte/HTML), styling (Tailwind v3/v4, CSS Modules, styled, MUI, CSS vars), presence of a dark theme.
- Where things live: tokens/theme, shared components, pages/routes, visual/a11y tests.
- Existing agent context files: `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/`, `.github/copilot-instructions.md`, `DESIGN.md`, `UX.md`.
- Screens and dialogs (routes, page components, dialogs) and whether there is a flow map (`.dsx/maps/flows-<module>.json`) and screen captures.
- Implicit glossary: the 10–20 most frequent domain terms in the UI strings.

For medium or large projects, first run the `map-ux` skill (structure, UI, flows, tasks, journey, domain and actual design system in `.dsx/maps/`) and, if there are questions marked `uncertain`, `confirm-maps`. The steps below then read the maps instead of rediscovering.

## 2. Ask (one round, only what is missing)

- Product and audience in one sentence; context of use (device, frequency).
- Desired density (compact / medium / airy) and tone of voice.
- What must **never** happen in the interface (e.g. "never hide fees", "never a modal in checkout").
- What is critical to get wrong in the main task, and implementation terms that never appear on screen (they go into `UX.md`).

## 3. DESIGN.md

- Does not exist → skill `design-md` (Mode A if there is UI, Mode B for a new project). Starting point: `templates/DESIGN.md`; quality reference: `examples/DESIGN.md`.
- Exists → skill `design-md` Mode C (evaluate) and record the score.

## 4. UX.md

`UX.md` is `DESIGN.md`'s pair: it says what type of screen each one is, where everything goes and how it behaves. It carries the same weight: without it, the `build-ui` skill stops.

- Does not exist → skill `ux-md` (**Mode A** if there is UI: maps, captures, each screen classified into an archetype from `archetypes/`, policies counted in the code; **Mode B** for a new project). Starting point: `templates/UX.md` (with `version: 1.0.0`, `format: alpha`); quality reference: `examples/UX.md`.
- Exists → skill `ux-md` **Mode C** (evaluate) and record the score:
  ```bash
  node <DSX>/tools/lint-ux-md.mjs UX.md --score --map .dsx/maps/flows-<module>.json --screens <captures>
  node <DSX>/tools/ux-lint/ux-md-drift.mjs UX.md --module <module> --root .
  ```
- Project with several modules with different vocabularies: `content.glossary` per module (`{ default: …, <module>: … }`).
- Already known deviations (a screen that differs from its archetype on purpose) go into the `deviations` block with the rules they silence.

## 5. Tokens

- Project without semantic tokens → skill `tokens`. Keep the stack's native format (e.g. CSS vars + `@theme` in Tailwind v4), applying the three layers.
- Project with tokens → only check the contrast of the essential pairs.

## 6. Connect to the agents (single source, never duplicate)

`DESIGN.md` and `UX.md` are the sources. The other files **point** to them. Add (or create) only the block below, adapting the paths:

**`AGENTS.md`** (read by several agents) and **`CLAUDE.md`** (in Claude Code, it can import with `@AGENTS.md`, `@DESIGN.md` or `@UX.md`):
```markdown
## Interface and design
- Before creating or changing UI, read `DESIGN.md` (how it looks) and `UX.md` (what type of screen, where everything goes, how it behaves), and the tokens in `<tokens-path>`.
- Every screen has an archetype in the "Screen archetypes" section of `UX.md`; a new screen without an archetype: propose one and record it before building.
- Use only semantic tokens and components from `<components-path>`; justify any new component.
- Interaction decisions (modal, toast, validation, table…) follow `UX.md` and, where it does not settle them, the DSX pattern catalog.
- Every screen implements the `states` in `UX.md` (loading, empty, error, no access, success) and the archetype's states.
- Changed UI behavior (screen, archetype, action, state, flow): update `UX.md` in the same commit, with `version` and `updated`.
- Before finishing: `node <DSX>/tools/lint-raw-values.mjs <changed-folders>` with no occurrences and `node <DSX>/tools/ux-lint/screen.mjs <capture> --ux UX.md` with no severity ≥ 3.
```

Write this block in the language of the project's agent context files; product text inside the UI follows the project's language.

**`.cursor/rules/design.mdc`** (only if the team uses Cursor) — see `docs/integrations.md`; use `globs` to apply only to UI files and reference `DESIGN.md` and `UX.md` instead of copying rules.

**`.github/copilot-instructions.md`** (only if the team uses Copilot) — the same block, short.

Do not load visual context in tasks that are not UI (migrations, infra): that is why the tool rules use `globs`.

## 6b. Forward projects

If the project runs Forward (`fde.config.toml` exists), the DSX plugs into its pipeline instead of adding a parallel one (`knowledge/foundations/product-pipeline-ux.md`):

- UI/UX criteria go in the cycle plan's `## Acceptance criteria` (fields `kind`, `metric`, scope, `scenario`, `baseline`, `target`, `counter-metric`, `method`, `sample`, `decision`); check them with `tools/ux-lint/criteria.mjs check`.
- The UX blueprint of each front demand lives in `specs/<demand-id>/design/` (`templates/ux-blueprint.md`); UX.md stays the product-level contract.
- Variations export to `specs/<demand-id>/design/alternatives.md`; audit results with `--criteria-out` go under `evals/`; heuristic findings go to `reviews/<demand-id>/findings.toml` citing USE/DOM principle ids.
- Add to the agent context block: "UI quality, UX quality and design-system adherence are separate verdicts; there is no single UX score; unknown is never pass."

## 7. Gates

Suggest to the user (do not install dependencies without asking):
- CI: `node <DSX>/tools/build-tokens.mjs --check` (if using DTCG tokens), `lint-raw-values` on the UI folders, `lint-design-md`, `lint-ux-md` and `ux-md-drift.mjs --fail-at 2` (UX.md in sync with the map and the captures).
- UX findings register with a lock: `node <DSX>/tools/ux-lint/findings.mjs check --module <m> …` (deviations declared in `UX.md` do not count).
- Visual regression and axe with Playwright, if Playwright is already there.

## 8. Figma (optional)

If the team uses Figma, offer to set up the cycle after the foundation: `figma-init` → `figma-push` (guide in `docs/figma-flow.md`). Requires the official Figma MCP connected.

## 9. Report

```
Stack: …   Tokens: <where> (<layers>)   Components: <where> (N)
DESIGN.md: created/evaluated — score NN/100, gates ✔/✘
UX.md: created/evaluated — version X.Y.Z, score NN/100, gates ✔/✘, drift N finding(s), screens with archetype N/M
Context connected in: AGENTS.md ✔ CLAUDE.md ✔ Cursor — Copilot — (DESIGN.md and UX.md)
Initial drift: X/1000 lines
Forward: <detected | not used> · criteria format and blueprint path explained (if detected)
Recommended next steps (max. 5): …
```
