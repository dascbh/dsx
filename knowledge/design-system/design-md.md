# DESIGN.md

## When to consult

- When creating a project's `DESIGN.md` (new or existing) from `templates/DESIGN.md`.
- When reviewing, scoring or auditing an existing `DESIGN.md`.
- When connecting the `DESIGN.md` to an agent or AI tool.
- When an agent generated off-pattern interface and you need to find which gap in the file allowed it.

## What it is

`DESIGN.md` is a Markdown file at the project root that describes the product's visual language for **people and agents** at the same time. It has two layers:

1. **YAML front matter**: structured, machine-verifiable tokens (the "what").
2. **Markdown body**: intent, usage criteria, hierarchy, states, constraints (the "when, why and where not").

A value alone carries no decision. With tokens only, the agent gets the color right and the usage wrong; with the prose, it decides the way someone on the team would.

The format is an open specification at alpha stage (`version: alpha`). Treat it as unstable: version the file and review it when the specification changes.

### What it is not

- **It is not the whole design system.** The component library, code, governance and contribution still exist; the `DESIGN.md` is the readable entry point.
- **It does not decide UX.** It does not solve information architecture, journey or problem fit; that belongs to the UX context layer (see `design-system-for-ai.md`). What kind of screen each one is, where the primary action goes, when to confirm and which states are mandatory go in its companion, the `UX.md` (`knowledge/foundations/ux-md.md`), which has the same 100-point rubric, the same gates and the same maintenance rule.
- **It is not `CLAUDE.md`/`AGENTS.md`.** Those carry operational instructions (commands, code architecture, technical constraints) and only **point** to the `DESIGN.md` and the `UX.md`.

## Front matter schema (as in the repo template)

| Field | Required | Content |
|---|---|---|
| `version` | yes | Format version (`alpha`) |
| `name` | yes | Product name |
| `description` | recommended | Product type, audience, usage density |
| `owner` | recommended (linter warns) | Team or person who maintains it |
| `updated` | recommended (linter warns) | Date of last review, `YYYY-MM-DD` |
| `colors` | yes (linter errors) | Roles → hex. Names by role: `canvas`, `surface`, `text-primary`, `text-secondary`, `border`, `border-strong`, `focus`, `primary`, `on-primary`, `danger`, `on-danger` |
| `typography` | yes (linter errors) | Levels (`h1`, `body`, `label`…) with `fontFamily`, `fontSize`, `fontWeight`, `lineHeight` |
| `spacing` | recommended | Scale; keys mirroring the repo's multipliers (`"1": 4px`, `"4": 16px`…) |
| `rounded` | recommended | Radii (`sm`, `md`…) |
| `components` | recommended | Components that **reference** tokens with `{group.key}` |

```yaml
---
version: alpha
name: Exemplo
owner: time-plataforma
updated: 2026-10-01
colors:
  canvas: "#ffffff"
  surface: "#f4f7fc"
  text-primary: "#1f2226"
  text-secondary: "#4f5a6b"
  border-strong: "#7a8aa2"
  focus: "#5754ed"
  primary: "#5754ed"
  on-primary: "#ffffff"
typography:
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
spacing:
  "2": 8px
  "4": 16px
  "6": 24px
rounded:
  md: 8px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
---
```

The hex values above are the resolved values of this repository's light theme (`tokens/build/tokens.light.json`): `canvas` = `color.bg.canvas`, `primary` = `color.action.primary`, etc. When the project uses the token pipeline, **the front matter is derived from the tokens, never the reverse**; say so at the top of the body, along with which source wins in a conflict.

Conventions the linter uses:

- For each background color with text, declare `on-<role>`; the pair `on-X` on `X` is checked at 4.5:1.
- `text-*` and `link` are checked at 4.5:1 against `canvas`/`background`/`surface`; `border-strong`, `focus` and `primary` at 3:1 against the first background.
- A nonexistent `{group.key}` reference is an error. A raw color inside `components` is a warning.
- Prefer block YAML (one key per line): it is easier to review in a diff. Always quote references (`"{colors.primary}"`); unquoted, YAML may parse them as a map. The linter accepts simple inline maps (`{ sm: 4px, md: 8px }`), but not nested lists or multiline text.

## The 8 body sections

| # | Section (`##`) | Must answer |
|---|---|---|
| 1 | Overview | Visual direction in observable criteria; type of use (task × showcase); density; what the interface never does |
| 2 | Colors | Role → token → where it appears → where it never appears; contrast rules; "color is never the only cue"; dark theme |
| 3 | Typography | Hierarchy (what is the single title, what groups, what is reading text); scale and ratio; minimums; weights; measure |
| 4 | Layout | Spacing grid, vertical rhythm (label/field, fields, groups, sections), containers, breakpoints, mobile, position of primary actions |
| 5 | Elevation & Depth | How layers are told apart (surface, border, shadow); stacking limit |
| 6 | Shapes | Radius by element type; icon language |
| 7 | Components | For each core component: when to use, variants, all states, contraindications |
| 8 | Do's and Don'ts | **Do** and **Don't** blocks, ≥ 3 items each, derived from real mistakes (the linter also accepts the pt-BR labels **Faça** / **Não faça**) |

Recommended (the linter warns if missing): **Accessibility** (WCAG target, focus, target size, reduced motion, zoom, text alternative) and **Agent Instructions** (when to consult, what to preserve, how to validate). The English titles above are canonical. The DSX linter still accepts the equivalent pt-BR titles (Visão geral, Cores, Tipografia, Layout e espaçamento, Elevação, Formas, Componentes, Faça e não faça, Acessibilidade, Instruções para agentes).

## Official specification and official linter

The format has a public specification from Google Labs (version `alpha`, Apache-2.0 license) and its own CLI, the `@google/design.md` package, usable without installing via `npx -y @google/design.md <command>`:

| Command | What it is for |
|---|---|
| `lint DESIGN.md` | JSON report with findings by severity: broken reference, missing primary color or typography, contrast below AA, token declared and never used, sections out of canonical order, unknown key |
| `diff A.md B.md` | Token-by-token changes between two versions, and regressions |
| `export --format dtcg\|json-tailwind\|css-tailwind DESIGN.md` | Tokens in W3C DTCG, Tailwind v3 (`theme.extend`) or Tailwind v4 (`@theme`) |
| `spec [--rules]` | The specification and the linter rules, in the installed version |

Use both linters: the DSX one (`tools/lint-design-md.mjs`) covers the rubric's quality gates (declared contrast pairs, vague prose, recommended sections); the official one covers format conformance. Known divergences between DSX and the official specification:

- **Component sub-tokens.** The specification accepts only `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`. DSX also uses `borderColor` (the template and `examples/DESIGN.md`), and the official linter warns on every use. **IF** the file goes to a tool that strictly follows the specification **THEN** describe the border in the prose of the Components section and in the color role (`border`, `*-border`), without the sub-token.
- **Recommended sections.** Accessibility and Agent Instructions are a DSX requirement, not a specification one; the official linter complains neither about their absence nor their presence.
- **pt-BR titles.** The DSX linter accepts the Portuguese equivalents; the official one checks order by the canonical English names. For maximum compatibility, use the canonical titles.

Ready-made references in the format, to choose from and adapt: `choosing-a-design-system.md`.

## Writing rules

1. **Observable criterion instead of adjective.** "Modern, clean, elegant" gives no guidance. Write "at most one accent color per viewport; hierarchy by size and weight; cards without shadow in the light theme". The linter warns about vague adjectives.
2. **Tie each token to intent.** For each color: where it appears, where it does not, its role in the hierarchy.
3. **Write hierarchy, not inventory.** "H1 is the page's single title; H2 groups blocks; body is reading and functional text" is worth more than the list of sizes.
4. **Numbers instead of "pretty".** Minimum contrast, touch target, line length, durations.
5. **Do/Don't come from real failures** observed in previous generations or in production. Platitudes ("be consistent") do not count.
6. **Only document what exists** in production or was deliberately decided. An invented component is the most common source of agent hallucination.
7. **Mark what is inferred.** When documenting an existing product, separate "observed in the code" from "inferred".
8. **Prose does not contradict tokens.** If the text says "8px radius" and the token says 12px, the file fails.
9. **Agent instructions in three parts**: when to consult (before any UI change), what to preserve (existing tokens and components), how to validate (commands and checklist).

## Creation flow

1. **Define the source of truth**: existing product (document what is in use), design system with tokens (translate), new project (decide the direction first), external reference (adapt, never copy).
2. **Copy `templates/DESIGN.md` to the project root.**
3. **Fill in the front matter** from the resolved tokens (`tokens/build/tokens.light.json`) or from the observed values.
4. **Write the 8 sections + 2 recommended**, with intent and criteria.
5. **Validate**: `node tools/lint-design-md.mjs DESIGN.md` (use `--json` for machines). Exits 0 if the objective gates pass, 1 otherwise.
6. **Spot-check** against production or the design file.
7. **Connect to the agent** and run a controlled generation (see audit, pass 5).

Automatic extraction from a site or from CSS is acceptable as a **draft**: it captures values, not intent, states, accessibility or guardrails. Human curation is mandatory.

## Connecting to agents

- **Never assume auto-discovery.** Configure through each tool's native mechanism.
- Terminal agent with a project memory file: import the file in `CLAUDE.md`/`AGENTS.md` (e.g. an `@DESIGN.md` line) together with the instruction on when to consult it.
- Editors with project rules: create a rule in the tool's rules directory, scoped (`globs`) to UI files, pointing to the `DESIGN.md`.
- **Single source**: each tool's rules only reference the `DESIGN.md`; they do not copy its content.
- **Contextual loading**: do not inject the visual context into tasks without UI (database migration, infrastructure).
- Follow each tool's current documentation; obsolete syntax fails silently.

Generation request skeleton: "Read the DESIGN.md first. Goal: <user task>. Use only existing tokens and components; justify any new variant. Include empty, loading, error, success, focus and disabled states. At the end, list the tokens and components used."

Post-generation audit skeleton: compare colors, typography, spacing and radius with the `DESIGN.md`; check component reuse; check states and accessibility; list divergences and fix **only** those. Then human review: the agent guarantees coherence, not UX judgment.

## 100-point rubric

Principle: **score how much the file spares the agent from guessing.**

| Criterion | Weight | Question |
|---|---:|---|
| Fidelity to source | 15 | Do tokens, components and rules match the product or a deliberately defined system? |
| Technical validity | 10 | Parseable structure, linter passes, references resolved? |
| Semantic tokens | 10 | Names by function, coherent scales, no arbitrary duplication? |
| Intent and prose | 15 | Does the prose explain decisions that the value alone does not? |
| Components and states | 15 | Do critical components have the relevant variants and states? |
| Accessibility | 15 | Verifiable rules (numbers, criteria), not a generic sentence? |
| Responsiveness and edge cases | 8 | Mobile, long content, empty/error/loading? |
| Guardrails | 5 | Specific constraints against recurring mistakes? |
| Agent operation | 4 | Does the file demonstrably reach the agent's context? |
| Maintenance | 3 | Owner, date, review routine? |

Bands: **90–100** reliable source; **75–89** usable with controlled gaps; **60–74** review before it becomes an authority; **< 60** high risk: the agent will invent core decisions.

### Five gates (fail regardless of the score)

1. Structural error or unresolved reference. *(automated: `lint-design-md`)*
2. Contradiction with the product or the source without documented justification.
3. Contrast failure in an essential combination (e.g. main text on background below 4.5:1). *(automated for the declared pairs)*
4. The file never reaches the tool the agent works in.
5. Conflicting instructions for the same context.

## Five-pass audit

1. **Structure**: run `node tools/lint-design-md.mjs`. Fix every `ERROR` (the tool's error label) before any judgment.
2. **Source of truth**: sample tokens, typography and 3+ components against production, code or the design file.
3. **Improvisation gaps**: read it as someone who has never seen the product; note each decision that still requires inference (which button is primary? what to do with long text? how to show an error?).
4. **Score and apply gates**: score per criterion with evidence; any failed gate = fail.
5. **Controlled generation**: ask for a new screen using only the project context + `DESIGN.md`. Record what the agent invented (colors, components, missing states); run `tools/lint-raw-values.mjs` on the result. Each invention becomes a fix in the file or a new "Don't" item. Repeat the same task more than once: generative output varies.

## Maintenance

- Version it alongside the code; `updated` refreshed on every review; explicit `owner`.
- Review when: tokens change, a component gains a rule, the visual language evolves, experimental behavior becomes standard, or a controlled generation reveals a recurring invention.
- Run the linter in CI on every PR that touches `DESIGN.md` or `tokens/`.
- Periodically audit conflicting instructions between `DESIGN.md`, `CLAUDE.md`/`AGENTS.md` and tool rules; remove what is obsolete.

## Anti-patterns

- Copying the template without adapting it (the linter flags `<…>` placeholders).
- A list of values without intent.
- Components that do not exist in production.
- Text contradicting tokens.
- The same content duplicated across several tool rules.
- Treating the alpha specification as final.
- Using the `DESIGN.md` for research or journey decisions.

## Checklist

- [ ] Front matter with `version`, `name`, `owner`, `updated`, `colors`, `typography` and `components` by reference.
- [ ] `on-*` pairs declared for every background with text.
- [ ] 8 required sections + Accessibility + Agent Instructions filled in.
- [ ] No vague adjectives; rules with numbers.
- [ ] Do/Don't with ≥ 3 items each, from real failures.
- [ ] `node tools/lint-design-md.mjs` passes.
- [ ] File imported/referenced in the native mechanism of each tool used.
- [ ] Controlled generation done; inventions fixed.
- [ ] Score ≥ 75 and no failed gate.
