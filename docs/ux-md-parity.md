# UX.md × DESIGN.md parity (DSX 0.7)

Owner's decision: `UX.md` has the same importance and the same update dynamics as `DESIGN.md`. `DESIGN.md` says how the interface **looks**; `UX.md` says **what kind of screen each one is, where each thing goes and how it behaves**. This inventory starts from `grep -rn "DESIGN.md"` (outside `references/`) and records, for every place where `DESIGN.md` is handled, the `UX.md` equivalent.

Legend: **already existed** (the equivalent was there before 0.7) · **created now** (added in 0.7) · **not applicable** (with the reason).

## Core pieces

| Where DESIGN.md is handled | UX.md equivalent | Status |
|---|---|---|
| `design-md` skill (Modes A/B/C, rubric, gates) | `ux-md` skill: Modes A/B/C; Mode C gained a 100-point score, gates, drift, controlled generation and output in the same format | already existed; updated now |
| 100-point rubric + 5 gates (`evals/rubrics/design-md.yaml`) | `evals/rubrics/ux-md.yaml`: 9 criteria computed by code (adding up to 100), 5 gates (`lint`, `essential-coverage`, `policy-fidelity`, `connected-to-agent`, `no-conflict`) and `judge-criteria` for the judge | created now |
| `tools/lint-design-md.mjs` linter | `tools/lint-ux-md.mjs` (already validated the format); now also `--score` (score per criterion, bands and gates) and validation of `deviations`, semver `version` and the per-module glossary. DESIGN.md has no score computed by code: the UX.md one goes further | already existed; `--score` created now |
| Drift check (code × front matter: `lint-raw-values`, `hazards[]` from `design-system-extractor`) | `tools/ux-lint/ux-md-drift.mjs` (U1–U6: screen without an archetype, screen archetype that disappeared, policy most screens do not follow, state without a capture, stale `updated`, expired deviation); prerequisite with a warning in `audit.mjs` | created now |
| `owner`/`updated`/`version: alpha` (format) | `version` becomes the document's semver (minor: policy, archetype, deviation; patch: text; major: navigation/register), `format: alpha` for the format, `updated` required in practice (freshness in the score and in drift). `version: alpha` is accepted with a warning | created now |
| `templates/DESIGN.md` | `templates/UX.md`: version/format, comment on when to bump, `deviations` block, "Declared deviations" table, per-module glossary, "same change, same commit" instruction | already existed; updated now |
| `examples/DESIGN.md` | `examples/UX.md`: `version: 1.4.0`, `format: alpha`, inline glossary, `deviations` D1–D3 and patterns cited as evidence | already existed; updated now |
| `knowledge/design-system/design-md.md` | `knowledge/foundations/ux-md.md`: new sections "Version and freshness", "Declared deviations", "Score and gates", "UX.md × product drift", "Glossary per module"; `design-md.md` now points to its pair | already existed; updated now |
| Findings registry (DESIGN.md has none) | A deviation declared in `UX.md` silences the finding it covers: status `accepted-deviation` in `findings.mjs` (not counted as open nor in the lock, shown on the page with the reason, reopened if the deviation is removed or expires); `knowledge/foundations/ux-findings.md` updated | created now |

## Skills

| Skill | How it handles DESIGN.md | UX.md equivalent | Status |
|---|---|---|---|
| `init` | creates/evaluates DESIGN.md and wires it into the agents' context | step 4 "UX.md" (Mode A/B/C with `--score` and drift); the `CLAUDE.md`/`AGENTS.md` context block says "before creating or changing UI, read `DESIGN.md` (how it looks) and `UX.md` (what kind of screen, where each thing goes, how it behaves)"; CI gates with `lint-ux-md` and `ux-md-drift`; report with the UX.md score | created now |
| `build-ui` | stops without DESIGN.md | stops without UX.md (sends to `init`/`ux-md` Mode A); reads the screen's archetype and deviations before building; final gate with `ux-lint` (screen, states), `lint-ux-md` and drift; "behavior changed, update UX.md in the same commit"; report with archetype and version | created now |
| `design-md` | is the DESIGN.md skill | validation step 3 joins both in one block | created now |
| `ux-md` | — | the UX.md skill | already existed; updated now |
| `review-ux` | (did not mention it) | reads the screen's deviations (a covered divergence is not a finding), a missing UX.md is the first finding, drift makes the rule stale; registry with `accepted-deviation` | already existed; updated now |
| `audit-ds` | DESIGN.md in documentation, maturity level 4, plan and metric | UX.md and drift in documentation; level 4 requires DESIGN.md **and** UX.md ≥ 90 with no drift; plan and CI with `lint-ux-md`/`ux-md-drift`; metric "UX.md score and % of screens with an archetype". The per-module behavior counterpart is `audit-ux` | created now |
| `audit-ux` | — | prerequisite "UX.md up to date" (drift), deviation instead of several `ignore`, per-module glossary passed through | already existed; updated now |
| `patterns` | DESIGN.md beats a pattern, with the divergence pointed out | UX.md picks among the pattern's options and applies to the whole archetype; a recurring decision goes into UX.md (minor version) instead of screen by screen | created now |
| `stitch` | syncs DESIGN.md with Stitch and critiques colors | the prompt describes the archetype and the UX.md policies (Stitch does not import UX.md); `ux-lint/screen.mjs` on the generated HTML; when bringing it in, UX.md updated if the screen is new. Design system sync stays DESIGN.md only: **not applicable** to UX.md because Stitch has nowhere to store it | created now (part) |
| `choose-ds` | builds DESIGN.md from the reference | uses `product.register`/`density` from UX.md when it exists (another register = major UX.md version); screens shown cover the main archetypes | created now |
| `evals` | `design-md.yaml` rubric, compare DESIGN.md versions | `ux-md.yaml` rubric, `lint-ux-md --score` and `ux-lint` as code evaluators, UX.md among the compared versions | created now |
| `arrange-screen` | reads DESIGN.md for the look | already read UX.md (archetype, deviations, "Does it break UX.md?") | already existed |
| `ux-writing` | glossary in DESIGN.md or docs | glossary from UX.md's `content.glossary`, per module, with `--module` in `text.mjs`/`consistency.mjs` | already existed; updated now |
| `figma-cycle` | gate "new usage rule → DESIGN.md in the same round" | gate "behavior change → UX.md in the same round" | created now |
| `figma-pull` | class "new pattern → DESIGN.md"; a new usage rule is documentation | class "behavior" → UX.md + `ux-lint`; same documentation rule | created now |
| `figma-first` | the foundation becomes tokens + DESIGN.md before the 1st screen | screens become UX.md (Mode B) before the 1st screen — without it, `build-ui` stops | created now |
| `figma-push` | DESIGN.md is a mandatory prerequisite | UX.md is a **non-blocking** prerequisite: it gives the states per screen (states + archetype) and the grouping by archetype | created now |
| `figma-foundations` | DESIGN.md + tokens → Figma variables | not applicable: variables are appearance; nothing in UX.md becomes a variable |
| `figma-mirror` | source of the mirror's foundations | not applicable: it mirrors the code's appearance; states and archetype arrive through `figma-push` |
| `figma-init` | source of truth for the push (DESIGN.md + tokens) | not applicable: cycle registry; behavior comes in through the `figma-cycle`/`figma-pull` gates |
| `figma-conventions` | component description comes from DESIGN.md | not applicable: a component usage rule is visual; a screen rule lives in UX.md and does not go to the component |
| `tokens` | updates DESIGN.md's front matter and Colors | not applicable: tokens have no behavior |

## Agents, tools, tests

| Where | UX.md equivalent | Status |
|---|---|---|
| `agents/eval-judge.md` | accepts UX.md as an artifact and `judge-criteria` | created now |
| `agents/ux-reviewer.md` | compares behavior with the declared archetype; a deviation is not a finding; runs `screen.mjs` | created now |
| `agents/project-mapper.md`, `ui-mapper.md` | detect `UX.md` alongside `DESIGN.md` | created now |
| `agents/journey-mapper.md` | reads persona, tasks and journeys from UX.md | created now |
| `agents/design-system-extractor.md` | not applicable: it extracts the visual design system (`design-system.json`); UX.md comes from the UI and flow maps through the `ux-md` skill, Mode A |
| `tools/ux-lint/audit.mjs` | drift as a prerequisite (warning "UX.md out of date: …", item `ux-fresh`) and a "UX.md × product" section in the report; `--module` passed to text and consistency; accepted deviations counted apart | created now |
| `tools/ux-lint/findings.mjs` | `accepted-deviation`, `--ux`, `deviations` in the registry, page with the reason | created now |
| `tools/ux-lint/consistency.mjs`, `text.mjs` | `--module` picks the glossary (`lib/glossary.mjs`); in text, canonical terms with a capital letter in the middle are proper names in X10 | created now |
| `tools/lib/yaml-lite.mjs` | block lists (`- id: D1`), for the `deviations` block | created now |
| `tools/references.mjs` | not applicable: public library of third-party DESIGN.md files; there is no UX.md equivalent |
| `tools/stitch/design-system.mjs` | not applicable: Stitch only imports DESIGN.md |
| `tools/stitch/analyze-html.mjs` | the behavior equivalent is `ux-lint/screen.mjs` on the generated HTML (`stitch` skill) | created now (through the procedure, no new tool) |
| DESIGN.md tests (`tools.test.mjs`, `stitch.test.mjs`, `legacy-cli.test.mjs`) | `lint-ux-md.test.mjs` (existed) and `ux-md-parity.test.mjs` (score, drift, accepted deviation, per-module glossary, audit) | created now |
| `hooks/` | not applicable: the only hook guards the Figma turn; DESIGN.md has no hook either |

## Documents

| Where | UX.md equivalent | Status |
|---|---|---|
| `README.md` | UX.md as a core piece (source of truth, tools, templates, examples, evals, diagram) | created now |
| `AGENTS.md` | routing (`init` without UX.md, `ux-md` with score/drift/deviations, `build-ui` stops without both) and tools (`--score`, `ux-md-drift`, `--module`, `--ux`) | created now |
| `docs/integrations.md` | `@UX.md`, the `init` step 6 block, Cursor and Copilot | created now |
| `docs/principles.md` | "One source of truth": UX.md defines behavior | created now |
| `docs/figma-flow.md` | the foundation in code includes UX.md | created now |
| `docs/renames-2026-10.md` | `version: alpha` → semver + `format: alpha` | created now |
| `knowledge/design-system/design-system-for-ai.md`, `README.md` | "Behavior" layer (UX.md) between visual and operation | created now |
| `knowledge/design-system/governance-and-maturity.md` | UX.md at level 4 | created now |
| `knowledge/ia/experience-debt.md`, `knowledge/ia/README.md` | UX.md among the context documents every generation reads | created now |
| `knowledge/design-system/components.md`, `color.md`, `choosing-a-design-system.md` | not applicable: they cover components, color and visual style |
| `knowledge/ia/evals.md`, `evidence-and-sources.md` | not applicable: general rubric and evidence rules, which already apply to UX.md |
| `CLAUDE.md` (DSX's own) | not applicable: it mentions DESIGN.md only as an external-format exception in naming; UX.md follows the general rule (kebab-case), already described |
| `data/gap-analysis/web-design-rules.json` | not applicable: third-party gap analysis about a visual decision (icon) |

## Deliberately left out

- Drift (U1–U6) does not go into the findings registry: it flags a stale **document**, not a wrong screen. The fix is to update UX.md.
- Open criteria (does the archetype match the task? are the policies real? is the deviation justified?) do not add points to the code score; they are `judge-criteria` and judgment gates, like DESIGN.md's `judge`/`human` criteria.
- UX.md's `version` is no longer the format version (unlike DESIGN.md, which follows Google's format): the owner's decision asks for a document version, and the format moved to `format`.
