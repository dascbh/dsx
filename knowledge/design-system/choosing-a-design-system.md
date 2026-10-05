# Choosing and building the design system from references

## When to consult

- A new project with no defined visual identity, or a product redesign that wants to start from a ready-made base.
- Before creating the first `DESIGN.md` (skill `design-md`, Mode B) or importing a design system into Stitch.
- When someone suggests "use style X" and you need to know whether X fits the product.
- When evaluating a third-party `DESIGN.md` (library, repository, AI-generated) before adopting it.

## The problem

Choosing a design system by taste produces two recurring failures: an aesthetic that does not survive real use (a landing-page style applied to an eight-hour work screen) and a pretty file with technical defects (failed contrast, a component referencing a nonexistent token). A ready-made reference speeds things up, provided it goes through **triage by product register**, **objective evaluation** and **adaptation**, in that order.

## Reference sources in DSX

| Source | What it is | Where |
|---|---|---|
| designmd.app library | 759 `DESIGN.md` files with metadata (category, use case, era, style, keywords), CC BY 4.0 license with mandatory attribution | Full index: `references/design-md/index.json`; 40 curated with the whole file and a score: `references/design-md/curated.json` + `references/design-md/designmd-app/` |
| Official format specification | Canonical sections, token types, component sub-tokens, official linter rules; CLI `@google/design.md` (`lint`, `diff`, `export`) | Summary and divergences in `design-md.md`, section "Official specification and official linter" |

Query: `node tools/references.mjs search --register operational --use "dashboard financeiro" --curated`.

## Triage by product register

The **register** is the kind of use the product has; it decides the family of references before any aesthetic preference.

| IF the product is… | THEN the register is | Look for | Avoid |
|---|---|---|---|
| A daily work tool, tables, forms, dense data (back-office, legal, finance, health, B2B) | `operational` | medium/high density, long-reading typography, few accents, complete components | gradients, glass, neumorphism, large radii, decorative motion |
| A consumer app, short transaction, mobile, catalog | `consumer` | large touch targets, strong action hierarchy, imagery as content | high density, corporate visual jargon |
| Reading, documentation, long-form content | `editorial` | line measure 60–75ch, serif or humanist text face, vertical rhythm | "elegant" low contrast, text over images |
| Brand page, campaign, event | `brand` | personality, display typography | carrying the style into the logged-in product |
| Visual study, art, concept | `experimental` | only as occasional inspiration | adopting it as a product system |

The index already includes `dsx.register` (automatic triage by words in the use case and style). Treat it as a **first filter**, not a verdict: check the description and the file itself.

## Objective evaluation (before showing the option to anyone)

Every candidate reference goes through:

1. `node tools/references.mjs evaluate <file.md>` — DSX linter + text/background contrast of each component + completeness (components, colors, text styles). Score 0–100 (`score`; defects in `contrast_failures`, `errors`, `warnings`).
2. `npx -y @google/design.md lint <file.md>` — official linter (broken references, contrast, orphan tokens, section order, unknown keys).

Rules:

- **IF** any component has text contrast below 4.5:1 **THEN** the option can only be presented as "adaptable", with the fix already proposed. In the initial curation, 19 of 59 candidates had a failing primary button (some at 1.05:1).
- **IF** the reference declares no components **THEN** it is palette + typography, not a design system: building will need more work, say so.
- **IF** the product register is `operational` and the reference is marked `experimental` **THEN** discard it.
- **IF** the reference imitates the identity of a real brand (proprietary name, color and typography) **THEN** use it as a structural study, never as the product's identity.

## How to present the options

- **Three options within the register + one contrasting** (another plausible direction). More than that paralyzes; fewer hides the choice space.
- For each option: what it favors (task, persona), what it makes worse, score and defects found, adaptation effort.
- **Show it applied to the product, not to a generic screen**: if the project already has screens, keep each option as a design option and render the real screens with its theme (theme layered over the product theme by the DESIGN.md adapter) — the comparison becomes "our screen with A, B, C" (skill `design-lab`: static comparison page, live switcher, or Stitch with one row per option). `apply_design_system` does not work for screens captured from code (real CSS with hard-coded colors: almost nothing changes). Without screens, generate the same key screen with each option.
- **IF** the option breaks something in real use (a document that should stay light, a state that depended on color) **THEN** that weighs more than the file's score.
- **IF** something did not change with the theme **THEN** it is a hard-coded color in the product code: record it as debt, regardless of the choice.
- The choice belongs to the product owner. Aesthetic preference unrelated to the task is not an argument for discarding an evaluated option.

## Building: from the reference to the project's DESIGN.md

1. **Copy the chosen reference into the project as a draft** and keep the attribution line (CC BY 4.0) in a comment at the end of the file.
2. **Replace the identity**: the project's brand color in the `primary` role (generate the ramp with `tools/palette.mjs`), typography licensed and loaded by the project, product name and description.
3. **Reconcile the roles with DSX**: semantic roles (`text-primary`, `text-secondary`, `border`, `danger`, state triples `*-container`/`on-*-container`/`*-border`) instead of appearance names.
4. **Fix what the evaluation pointed out**: contrast, missing components (primary, secondary, destructive button; field; card; status chip), states (hover, focus, disabled, error).
5. **Write the project's prose**: persona, density, what must never happen. The reference's prose describes the style, not the product; rewrite it.
6. **Validate**: `node tools/lint-design-md.mjs DESIGN.md` (DSX gates) and `npx -y @google/design.md lint DESIGN.md` (official format). Export tokens with `npx -y @google/design.md export --format dtcg DESIGN.md` when the project uses DTCG.
7. **Take it to Stitch** through the `stitch` skill (Sync mode) and check with `tools/stitch/design-system.mjs check`.

## Checklist

- [ ] Product register defined before looking at styles.
- [ ] Candidates evaluated by both linters; defects listed per option.
- [ ] Three options in the register + one contrasting, with what each favors and makes worse.
- [ ] Options shown applied to the product's screens (or to the same key screen).
- [ ] Identity replaced (color, font, name); no third-party brand in the result.
- [ ] Contrast and components fixed; prose rewritten for the product.
- [ ] CC BY attribution kept in the derived file.
- [ ] Both linters pass; DESIGN.md synced in Stitch.
