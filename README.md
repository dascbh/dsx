# DSX — Design System eXperience for AI agents

An open **design system, UI and UX framework built to be used by AI agents**: instead of documentation for people to read, it brings procedures agents execute (skills), decisions agents look up (patterns), reference agents load on demand (knowledge) and **tools that verify** what was done (tokens, contrast, DESIGN.md, UX.md, drift).

The premise: generating interfaces became cheap; **judging and keeping coherence** became expensive. DSX gives the agent the missing criteria — and gives reviewers a way to check.

## What is here

| Folder | Contents |
|---|---|
| [`skills/`](skills) | 34 skills. **Core:** `init`, `design-md`, `ux-md`, `tokens`, `build-ui`, `arrange-screen`, `rethink-ux`, `patterns`, `review-ux`, `audit-ux`, `accessibility`, `ux-writing`, `ux-ia`, `research`, `discovery`, `audit-ds`, `evals`. **Mapping:** `map-ux`, `confirm-maps`. **Capture from code:** `capture-from-code`. **Stitch:** `stitch`. **Figma:** `figma-init`, `figma-push`, `figma-foundations`, `figma-mirror`, `figma-proposals`, `figma-diff`, `figma-pull`, `figma-first`, `figma-turn`, `figma-cycle`, `figma-coverage`, `figma-conventions`. The old Portuguese skill names remain as deprecated alias stubs (`docs/renames-2026-10.md`) |
| [`agents/`](agents) | 11 subagents: `ux-reviewer`, `design-system-extractor`, `eval-judge`, `figma-reader`, `spec-analyzer` and the project, UI, flow, task, journey and domain mappers. The old names remain as deprecated alias stubs |
| [`hooks/`](hooks) | `turn-guard`: prevents re-mirroring Figma over the design's refinement |
| [`patterns/`](patterns) | 77 interaction patterns — forms, feedback, actions, navigation, data, modals, authentication, accessibility, UX writing, AI, e-commerce — each with a rule, an IF→THEN decision tree, accessibility, microcopy and a checklist |
| [`knowledge/`](knowledge) | ~40 reference documents in 4 areas: [foundations](knowledge/foundations), [design system](knowledge/design-system), [research](knowledge/research), [AI](knowledge/ia) |
| [`tokens/`](tokens) | W3C DTCG tokens in 3 layers (primitive → semantic → component), light/dark themes, verified contrast pairs |
| [`tools/`](tools) | Dependency-free Node tools: token build, contrast, OKLCH palette, type and spacing scales, linters for DESIGN.md and UX.md (with a 100-point score), raw values, patterns and archetypes; in [`tools/ux-lint/`](tools/ux-lint) the UX checkers (text, screen, flow, layout, states, consistency), UX.md × product drift and the findings registry; in [`tools/figma/`](tools/figma) file snapshot and diff, helper prelude and the DTCG tokens ↔ Figma variables bridges |
| [`templates/`](templates) | DESIGN.md, UX.md, pattern, component, brief, research plan/script/report, persona, JTBD, OST, assumptions map, heuristic report |
| [`evals/`](evals) | Rubrics (generated UI, DESIGN.md, UX.md, AI feature) and test cases |
| [`examples/`](examples) | Reference DESIGN.md and UX.md, passing the linters |

## Getting started

**Claude Code (plugin):**
```bash
/plugin marketplace add <path-or-url-of-this-repository>
/plugin install dsx@headlabs-dsx
```
Then, in your project: `/dsx:init`.

**Other agents (Cursor, Copilot, Codex, Gemini CLI…):** see [`docs/integrations.md`](docs/integrations.md). The universal entry point is [`AGENTS.md`](AGENTS.md).

**Tools (Node ≥ 20, no `npm install`):**
```bash
npm run build:tokens                         # builds tokens/build/tokens.css and checks contrast
node tools/palette.mjs "#3d5afe"             # color ramp with contrast per step
node tools/lint-design-md.mjs DESIGN.md      # validates your project's DESIGN.md
node tools/lint-ux-md.mjs UX.md --score      # validates and scores the UX.md (100-point score and gates)
node tools/ux-lint/ux-md-drift.mjs UX.md --module <m> --root .   # does the UX.md still describe the screens?
node tools/lint-raw-values.mjs src           # finds raw values (design system drift)
npm run check                                # full framework check
```

## How the pieces fit

```
               ┌───────────── project source of truth ───────────────┐
               │  DESIGN.md (how it looks) + UX.md (how it behaves)   │
               │       + tokens (DTCG) + components + archetypes/     │
               └───────────────▲───────────────────────┬─────────────┘
                               │ create/evaluate/drift │ reads
 init · design-md · ux-md ·    │                       ▼
 tokens                        │
                               │            build-ui ──looks up──► patterns/
   audit-ds · audit-ux ────────┘                 │                 knowledge/
                                                 ▼
                         review-ux · accessibility · ux-writing · ux-ia
                                                 │
                                                 ▼
                       tools/ (objective gates) + evals/ (gates and scores)
```

Before building, `discovery` and `research` make sure the problem is the right one; afterwards, `research` validates with real people.

In Forward projects, the DSX plugs into the unified product pipeline without a parallel workflow: UI quality (5 metrics), UX quality (5 dimensions) and design-system adherence as separate verdicts against criteria declared in the cycle plan (`tools/ux-lint/criteria.mjs`, `audit.mjs --criteria`), the UX blueprint per objective (`templates/ux-blueprint.md`, `tools/ux-lint/blueprint.mjs`), falsifiable hypotheses in variation manifests and provenance on generated artifacts. See `knowledge/foundations/product-pipeline-ux.md`.

## Stitch: generate and iterate screens without manual editing

With the Google Stitch MCP and the official skills installed, the `stitch` skill closes the **generate → critique → iterate → bring in** loop with agents only. It syncs the project's DESIGN.md with Stitch and checks what it preserved (`tools/stitch/design-system.mjs`), generates screens and variants from the problem and the catalog patterns, critiques each screen with the DSX gates (`tools/stitch/analyze-html.mjs`: color roles, contrast, accessibility) and the UX lenses, applies only the critiques you accepted and brings the chosen one into code with the project's real tokens and components.

## Figma: push, explore, pull

DSX keeps a **continuous cycle between code and Figma**: it pushes the project to Figma (tokens become variables in 3 collections with Light/Dark modes, one screen per route, dialogs and states), lets you explore and refine there — including asking the agent for alternatives on the `09 · Propostas` page — and pulls back into code **at the right layer** (token → component → screen), through the same contrast, pattern, accessibility and text gates. A diff versioned in git says exactly what changed, and a hook prevents anyone from re-mirroring over the design's refinement.

Full guide: [`docs/figma-flow.md`](docs/figma-flow.md). Requires the official Figma MCP.

## Principles

Summary of [`docs/principles.md`](docs/principles.md): people before pixels · honest interface, no dark patterns · labeled evidence (synthetic = hypothesis) · one source of truth · system before improvisation · every state, always · reversibility proportional to risk · verify, don't assume · human judgment where it matters · less, but clear.

## Contributing

See the "Maintaining the framework" section of [`AGENTS.md`](AGENTS.md). All content is written in our own words; patterns cite public sources by name (WCAG, WAI-ARIA APG, Nielsen Norman Group, Baymard, Material, Carbon, GOV.BR, GOV.UK), never by copying.
