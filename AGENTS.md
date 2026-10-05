# DSX — instructions for agents

This repository is a **design system, UI and UX framework for AI agents**. If you are an agent working on a project that uses DSX, start here.

## Routing: which skill to use

| Situation | Skill (`skills/<name>/SKILL.md`) |
|---|---|
| First use of DSX in a project; project without DESIGN.md or without UX.md | `init` |
| Choose the design system (new project, redesign, "use style X") from curated references | `choose-ds` |
| Create, update or evaluate the DESIGN.md | `design-md` |
| Create, extract from code or evaluate the UX.md (screen types, regions, actions, navigation, feedback, flows); 100-point score, UX.md × product drift, declared deviations | `ux-md` |
| Lay out or rearrange a screen from its archetype (2–3 arrangements to choose from) | `arrange-screen` |
| Rethink a screen or flow, variations ("other versions", "how could it be"): 3 real variations built with the project's components, measured, compared on one page and decided | `rethink-ux` |
| Create/change tokens, palette, scales, dark theme, contrast | `tokens` |
| Write or modify interface code (stops without DESIGN.md and without UX.md) | `build-ui` |
| Unsure between components/behaviors ("modal or page?") | `patterns` |
| Review the usability of a screen or flow | `review-ux` |
| Audit the UX of a whole module, by dimension, with a registry and re-audit | `audit-ux` |
| Capture existing screens from the code (static HTML, no server) for audit, variations or Stitch; send to Stitch, arrange the canvas, journey page | `capture-from-code` |
| WCAG / accessibility audit | `accessibility` |
| Any text visible in the interface | `ux-writing` |
| AI feature, chat, copilot or agent that executes actions | `ux-ia` |
| Plan or analyze user research | `research` |
| Request arrives as a solution without a defined problem; start of a feature | `discovery` |
| Health/maturity of an existing design system | `audit-ds` |
| Measure the quality of generated UI or of an AI feature | `evals` |
| Map a project: structure, UI, flows, tasks, journey, domain, real design system | `map-ux` |
| Confirm with the user what the maps inferred; produce the AS-IS/TO-BE | `confirm-maps` |

### Stitch (agent-generated exploration, no manual editing)

| Situation | Skill |
|---|---|
| See a screen before coding, generate variants, critique and iterate through agents, bring into code | `stitch` (uses the official `stitch-design`, `stitch-utilities`, `stitch-build` skills for the mechanics) |

### Figma (code ↔ Figma cycle — full guide in `docs/figma-flow.md`)

| Situation | Skill |
|---|---|
| Set up the cycle in a project (registry, Code Connect, baseline) | `figma-init` |
| Push the project to Figma (foundation + screens + states, resumable) | `figma-push` |
| Tokens/theme → Figma variables with modes | `figma-foundations` |
| Re-mirror screens from code (incremental) | `figma-mirror` |
| Explore alternatives in Figma / critique design proposals before pulling | `figma-proposals` |
| See what changed in Figma (classified diff) | `figma-diff` |
| Pull changes from Figma into code, with the DSX gates | `figma-pull` |
| Project born in Figma | `figma-first` |
| Whose turn it is (code/design/applying) | `figma-turn` |
| Round governance, gates, registry | `figma-cycle` |
| Is a screen missing in Figma? Code × frames matrix | `figma-coverage` |
| Naming/page conventions and reuse vs create a component; note in the file itself | `figma-conventions` |

Subagents (`agents/`): `ux-reviewer` (independent review, read-only), `design-system-extractor` (real design system from the code, with adapters and hazards), `eval-judge` (LLM judge of one criterion), `figma-reader` (file snapshot and diff, read-only), `project-mapper`, `ui-mapper`, `flow-mapper`, `task-mapper`, `journey-mapper`, `domain-mapper` (maps in `.dsx/maps/`) and `spec-analyzer` (confronts maps with the specs).

Old Portuguese skill and agent names (e.g. `init`, `build-ui`, `ux-reviewer`) remain as deprecated alias stubs that point to the new names; full list in `docs/renames-2026-10.md`.

Hook (`hooks/`): `turn-guard` denies writing to Figma while `design/figma-sync.md` says `turn: design` (it also reads the legacy `vez:`).

## Repository map

```
skills/       executable procedures (SKILL.md) — what to do, in what order, what to deliver
archetypes/   12 screen archetypes (regions, primary action, states, variations/arrangements) — index.json for search
patterns/     ~80 interaction patterns with an IF→THEN rule, a11y and checklist (index.json for search)
knowledge/    reference by area: foundations/, design-system/, research/, ia/
templates/    DESIGN.md, pattern, component, brief, research plan/script/report, JTBD, OST…
tokens/       W3C DTCG tokens in 3 layers + contrast pairs; build/ is generated
tools/        dependency-free checkers (Node ≥ 20); tools/figma/ = snapshot, diff, prelude and token bridges; tools/stitch/ = design system and HTML analysis
hooks/        turn-guard (Figma cycle)
evals/        rubrics and cases to evaluate generated UI, DESIGN.md, UX.md and AI features
examples/     reference DESIGN.md and UX.md (passing the linters)
references/   third-party content for lookup: DESIGN.md library (designmd.app, CC BY 4.0) — index, curated and notes
docs/         principles and agent integrations
```

## Rules that always apply

Read `docs/principles.md`. In short: accessibility and loss prevention beat aesthetics; no dark patterns; labeled evidence (synthetic = hypothesis); one source of truth; system before improvisation; every state; reversibility proportional to risk; verify with the tools before declaring done.

## Naming: everything in English, product text in the project's language

- **English:** everything DSX owns — code, data, docs, knowledge, templates, skills, agents and tool messages. That includes file and folder names (tools, scripts, data, `skills/<name>`, `agents/<name>.md`); CLI subcommands and flags; JSON/YAML keys and values (including the front matter of patterns, archetypes, `knowledge/` and `UX.md`); ids (patterns, archetypes, regions, states, variations); maps in `.dsx/maps/` and their keys; test titles; code identifiers; the body and section headings of `.md` files.
- **The project's language:** only text the product's end user sees — interface text, microcopy, labels and error messages, and examples of them. The text detectors still judge pt-BR interface text, and an `en` pack exists; the product's language is configurable.
- **Key shape:** `snake_case` in all JSON and JSONL (`--json` outputs, maps, indexes, registries, changelog); `kebab-case` in YAML (front matter of `UX.md`, archetypes, patterns and `knowledge/`, eval rubrics). Single exception: names that mirror an external API or format stay as in the original — Figma API fields (`fileKey`, `modeId`, `valuesByMode`…) and Stitch fields (`designSystem`, `displayName`…), W3C DTCG, the `DESIGN.md` front matter (Google's format) and Claude Code's `hooks.json`.
- **Transition (compatible reading):** what a tool **reads** from a project (`UX.md`, maps, findings registry, `design/figma-sync.md`) also accepts the old Portuguese name, with the warning "old name, rename to X"; what it **writes** uses only the new name. Old subcommands and flags remain as aliases with the warning "old name, use X", in a single table: `tools/lib/legacy-cli.mjs`. Old skill and agent names remain as deprecated alias stubs.
- Full old → new table, and what has compatible reading and what does not: `docs/renames-2026-10.md`. Every new name is born in English.

## Tools

```bash
node tools/build-tokens.mjs [--check]          # builds tokens and checks the contrast of every pair
node tools/contrast.mjs "#text" "#background"  # WCAG contrast of one pair
node tools/palette.mjs "#hex" [--format dtcg]  # 50–950 ramp in OKLCH with contrast per step
node tools/type-scale.mjs --ratio major-third  # type scale (or --fluid)
node tools/spacing-scale.mjs --base 4          # spacing scale
node tools/lint-design-md.mjs DESIGN.md        # objective DESIGN.md gates
node tools/lint-ux-md.mjs UX.md [--archetypes <folder>] [--json]   # objective UX.md gates (accepts old names with a warning)
node tools/lint-ux-md.mjs UX.md --score [--map <flows.json>] [--screens <captures>] [--geometry <folder>] [--json]   # 100-point score per criterion and gates (evals/rubrics/ux-md.yaml)
node tools/ux-lint/ux-md-drift.mjs UX.md [--map …] [--screens …] [--geometry …] [--module <m> --root <project>] [--json] [--fail-at 2]   # UX.md × product drift U1–U6
node tools/lint-archetypes.mjs [--index]       # validates the archetype catalog and regenerates archetypes/index.json
node tools/ux-lint/screen.mjs <captures.html|folder> [--ux UX.md] [--json] [--fail-at 3]          # rules T1–T7 on the screen captures
node tools/ux-lint/flow.mjs .dsx/maps/flows-<module>.json [--ux UX.md] [--json] [--fail-at 3]  # rules F1–F5 on the flow map
node tools/ux-lint/text.mjs --screens <captures> [--code <folders>] [--ux UX.md] [--module <m>] [--ignore <names>] [--json]  # text hygiene X1–X11, with the origin's file:line
node tools/ux-lint/audit.mjs --module <m> --root <project> [--register] [--measure] [--preview] [--page <out.html>] [--json]  # single audit: prerequisites (with UX.md drift), every detector, report by dimension (data/ux-dimensions.json); --preview generates the previews before the paginated page
node tools/ux-lint/preview.mjs --module <m> --root <project> [--screens <captures>] [--min-severity <n>] [--out <dir>] [--width 1440]  # before/after previews of each option, cropped from the captures (the project's Playwright; flow as SVG without a browser)
node tools/ux-lint/measure.mjs <captures> --out <geometry-folder> [--ux UX.md] [--width 1440]  # capture geometry (the project's Playwright; run from a folder that has it)
node tools/ux-lint/layout.mjs <geometry-folder> [--ux UX.md] [--archetypes <folder>] [--json] [--fail-at 3]  # layout and hierarchy L1–L9
node tools/ux-lint/states.mjs <captures> [--ux UX.md] [--archetypes <folder>] [--json]  # states S1–S3 (capture <nn>-<screen>.<state>.html)
node tools/ux-lint/consistency.mjs <captures> [--ux UX.md] [--module <m>] [--json]  # cross-screen consistency C1–C3 (the module's glossary)
node tools/ux-lint/findings.mjs register --module <m> --text t.json --screen s.json --flow f.json [--layout l.json --states st.json --consistency c.json] --root <repo> [--ux UX.md]  # findings registry in .dsx/findings/<m>/ (stable id, status; UX.md deviations → accepted-deviation)
node tools/ux-lint/findings.mjs options --module <m> --from cases.json     # links options (2–3 per case) to the ids; a case with no finding becomes a review item
node tools/ux-lint/findings.mjs decide --module <m> <id> <index|ignore|free> [--reason …] [--text …] [--by …]  # records the owner's decision
node tools/ux-lint/findings.mjs import --module <m> decisions.json         # decisions copied from the page
node tools/ux-lint/findings.mjs status --module <m> [--json]               # by status, family, rule and severity; regressions and decided-but-not-applied
node tools/ux-lint/findings.mjs check --module <m> [--min 2] --text … --screen … --flow …  # lock: fails a new finding ≥ min or a regression (does not write)
node tools/ux-lint/findings.mjs page --module <m> <out.html> [--product …] [--color …] [--preview-files] [--no-preview] [--max-page-mb 10]  # paginated choice page (<out>-2.html…), with previews and "Copy decisions" from every page
node tools/ux-lint/variations.mjs validate|measure|lint --root <project> --module <m> --flow <f> [--ux UX.md] [--no-layout] [--json]  # variations manifest (.dsx/variations/<m>/<f>/variations.json): checks it, measures the captures and runs text/screen/states/layout on the frames, cross-checking `resolves`
node tools/ux-lint/variations.mjs page --root <project> --module <m> --flow <f> --out <out.html> [--shots <folder>] [--findings-page <url>] [--fragment]  # comparison page to decide in 2 minutes (summary Today | A | B | C at the same moment of the flow, 4 checkable numbers, gains and costs; one version at a time with separate state steps, before/after with what changed outlined and "Compare with today"; a terminal-free decision for the owner); full document by default, --fragment for an artifact; the project's Playwright to crop the screens
node tools/ux-lint/variations.mjs decide --root … --module … --flow … (--variant <id> | --compose screen=b,flow=b,behavior=a,text=a) [--comment …] · import --root … decision.json  # writes decision.json
node tools/ux-lint/text-page.mjs <cases.json> <out.html> [--title …] [--product …] [--color …]  # choice page from cases.json only
npx -y @google/design.md lint DESIGN.md        # official format linter (also diff and export dtcg/tailwind)
node tools/references.mjs search --register operational --use "terms" --curated   # DESIGN.md references (also index, fetch, evaluate, curate)
node tools/lint-raw-values.mjs <folder>        # raw values (drift) in UI code
node tools/lint-patterns.mjs [--index]         # validates the catalog and regenerates the index
node tools/check-links.mjs                     # broken internal references
node tools/figma/tokens-to-figma.mjs --tokens <folder> [--json | --script]   # DTCG tokens → variables plan/script for use_figma
node tools/figma/figma-to-tokens.mjs --snapshot <s.json> --tokens <folder> [--write] [--json]  # Figma variables → DTCG diff + contrast gate
node tools/stitch/design-system.mjs export DESIGN.md -o .stitch/DESIGN.md   # DESIGN.md adjusted for import into Stitch
node tools/stitch/design-system.mjs check DESIGN.md <list_design_systems.json> [--asset <id>] [--json]  # what Stitch preserved/changed
node tools/stitch/analyze-html.mjs <screen.html> --design-md DESIGN.md [--json]  # color roles, contrast and a11y of the generated screen
node tools/figma/diff-baseline.cjs <baseline.json> <current.json>    # classified diff (token/primitive/composition)
npm run check                                  # everything above + tests
```

## Maintaining the framework

- New archetype: copy a card from `archetypes/` (id, front matter and region/state/variation ids in English; body in English) → `node tools/lint-archetypes.mjs --index`.
- New pattern: `templates/pattern.md` → `patterns/<category>/<id>.md` (id, front matter and body in English) → `node tools/lint-patterns.mjs --index`.
- New knowledge: a file in `knowledge/<area>/` starting with "When to consult", imperative rules, IF→THEN decisions and a checklist; add it to the area's `README.md`.
- New skill: `skills/<name>/SKILL.md` with `name` and `description` (the description says **when** to use it); register it in the table above.
- Before committing: `npm run check`.
