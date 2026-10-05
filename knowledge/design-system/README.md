# Knowledge base: Design System

## When to consult

- Before creating, changing or auditing any token, component or theme in this repository.
- When you need to decide a value (color, font size, space, radius, duration) and do not know which token to use.
- When writing or evaluating a `DESIGN.md`, or preparing a design system to be consumed by agents.
- When you need to justify a system decision (governance, versioning, metrics) to people.

This folder is the framework's normative reference for everything that is **system**: foundations, components, built-in accessibility, governance and machine readability. Specific interaction patterns (form, modal, search, etc.) live in `patterns/`; this folder says **with which pieces** and **under which rules** those patterns are assembled.

## Reading rules for agents

1. Load **only the file for the subject** of the task. Do not load the whole folder by default.
2. If the task touches UI in code, load at least `tokens.md` + the file of the foundation involved (color, typography or spacing).
3. If the task creates or changes a component, load `components.md` + `accessibility.md`.
4. Numeric values in these files are the framework default. If the project's `DESIGN.md` declares a different value, **the project wins**, as long as it does not violate a WCAG minimum.
5. No file here authorizes raw values in UI code. Every rule applies through tokens.

## Index

| File | Content | Load when |
|---|---|---|
| `tokens.md` | Three layers (primitive → semantic → component), naming grammar, DTCG format, aliases, themes, repo pipeline and commands | Creating/renaming a token, adding a theme, running the build, understanding why a component does not switch themes |
| `color.md` | OKLCH ramp 50–950, semantic roles, WCAG 2.2 contrast (4.5 / 3 / 7), 1.4.11, dark mode, never color alone, data visualization note | Choosing or generating a color, creating a text/background pair, reviewing the dark theme, charts |
| `typography.md` | Modular scales and ratios, line height, measure 45–75ch, minimum sizes, weights, fluid typography with `clamp()` | Defining text hierarchy, choosing a ratio, creating a responsive heading |
| `spacing-and-layout.md` | 4/8 grid, scale, inset/stack/inline semantics, density, grid and breakpoints, responsive rules | Building a layout, deciding padding/gap, creating a compact mode, responsiveness |
| `accessibility.md` | WCAG 2.2 AA mapped by component type, visible and unobscured focus, 24/44px targets, reduced motion | Any interactive component; accessibility review |
| `components.md` | Atomic Design levels, anatomy, required state matrix, variants, API names, documentation template, handoff, documenting a DS from an existing site | Creating/documenting a component, preparing handoff, inventorying legacy |
| `governance-and-maturity.md` | Quality criteria, maturity rubric, adoption, drift, SemVer, contribution, ROI arguments | Evaluating a DS, proposing a change, versioning, defending investment |
| `design-md.md` | What DESIGN.md is, front matter schema, 8 sections, writing rules, connection to agents, 100-point rubric with 5 gates, 5-pass audit, maintenance | Writing, reviewing or scoring a DESIGN.md |
| `choosing-a-design-system.md` | Choosing and building the design system from curated references (designmd.app library): product register, evaluation by two linters, 3 options + 1 contrasting, adaptation to the project | New project, redesign, "use style X", evaluating a third-party DESIGN.md |
| `design-system-for-ai.md` | Four documentation layers (visual in DESIGN.md, behavior in UX.md, operation, UX context), machine-readability checklist, declarative autonomy limits, traceability, generative UI governance | Preparing the system for agents, defining what an agent may decide on its own |

## Quick routes (IF → THEN)

- **IF** you are going to write CSS/JSX/styles **THEN** read `tokens.md` (section "Consumption") and run `node tools/lint-raw-values.mjs <folder>` when you finish.
- **IF** you need a new color **THEN** read `color.md`; generate it with `tools/palette.mjs`; declare the pair in `tokens/contrast-pairs.json`; run `node tools/build-tokens.mjs`.
- **IF** you need a text size **THEN** use an existing `font.size.*`; only generate a new scale with `tools/type-scale.mjs` if the project is defining foundations.
- **IF** you need a space **THEN** use the semantic one first (`space.inset-*`, `space.stack-*`, `space.inline-*`, `space.section`); only then the primitive `space.<n>`.
- **IF** the component is interactive **THEN** meet the corresponding row in `accessibility.md` and the state matrix in `components.md`.
- **IF** the task is "document the design system" **THEN** combine `components.md` (legacy inventory) + `design-md.md` (output format).
- **IF** the task is "evaluate the design system" **THEN** use `governance-and-maturity.md`; if the target is a `DESIGN.md`, use `design-md.md`.
- **IF** the project has no visual identity yet, or is going to be redesigned **THEN** start with `choosing-a-design-system.md` (skill `choose-ds`) before `design-md.md`.
- **IF** an agent is going to generate screens autonomously **THEN** read `design-system-for-ai.md` before accepting the task.

## Repository artifacts cited in this folder

| Path | Role |
|---|---|
| `tokens/primitives.tokens.json` | Layer 1: raw values (colors 50–950, `space.*`, `radius.*`, `font.*`, `duration.*`, `easing.*`, `shadow.*`) |
| `tokens/semantic.light.tokens.json` | Layer 2, light theme: roles (`color.bg.*`, `color.text.*`, `space.inset-*`, `size.*`, etc.) |
| `tokens/semantic.dark.tokens.json` | Layer 2, dark theme: same color keys, different values |
| `tokens/contrast-pairs.json` | Text/background and UI/background pairs with the required minimum; validated in both themes |
| `tokens/build/` | Generated output (`tokens.css`, `tokens.light.json`, `tokens.dark.json`). Never edit by hand |
| `tools/build-tokens.mjs` | Resolves aliases, generates CSS/JSON and fails if any contrast pair does not pass |
| `tools/palette.mjs` | Generates a 50–950 OKLCH ramp from one color |
| `tools/type-scale.mjs` | Generates a modular type scale, static or fluid |
| `tools/spacing-scale.mjs` | Generates a spacing scale on a 4 or 8 px grid |
| `tools/contrast.mjs` | Computes WCAG contrast for a pair or a list of pairs |
| `tools/lint-raw-values.mjs` | Detects raw values in UI code and computes the drift metric |
| `templates/DESIGN.md` | The framework's DESIGN.md template |
| `tools/lint-design-md.mjs` | Structural validator for DESIGN.md |

## Conventions shared by all files

- Each file starts with **When to consult**, continues with imperative rules, **IF → THEN** decisions, numbers, anti-patterns, and ends with a **Checklist**.
- WCAG criteria cited refer to version 2.2, level AA, unless stated otherwise.
- Code examples use the repository's real token names. If an example proposes a token that does not exist yet, the text says so explicitly.

## Checklist for using this folder

- [ ] I loaded only the files relevant to the task.
- [ ] I checked whether the project's `DESIGN.md` overrides any default value.
- [ ] Every visual decision in my delivery points to an existing token.
- [ ] I ran `node tools/build-tokens.mjs` if I touched `tokens/`.
- [ ] I ran `node tools/lint-raw-values.mjs` on the UI code I changed.
- [ ] I met the state matrix and the accessibility row for every component touched.

## Former file names

- acessibilidade.md: now [accessibility.md](accessibility.md)
- componentes.md: now [components.md](components.md)
- cor.md: now [color.md](color.md)
- design-system-para-ia.md: now [design-system-for-ai.md](design-system-for-ai.md)
- escolher-design-system.md: now [choosing-a-design-system.md](choosing-a-design-system.md)
- espacamento-e-layout.md: now [spacing-and-layout.md](spacing-and-layout.md)
- governanca-e-maturidade.md: now [governance-and-maturity.md](governance-and-maturity.md)
- tipografia.md: now [typography.md](typography.md)
