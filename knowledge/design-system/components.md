# Components

## When to consult

- When creating a new component or a new variant.
- When documenting a component or preparing the handoff to development.
- When deciding which composition level something belongs to (atom, molecule, organism…).
- When documenting a design system from a product that already exists.

## Rules

1. **Reuse before creating.** Look in the catalog for a component that solves the problem with the existing properties. A new component is born from a recurring problem (several teams or several screens solving the same thing on their own), not from visual preference.
2. **Variants only for structural or hierarchy differences.** Content differences become a property or a slot.
3. **Every interactive component implements the full state matrix** (below) before it is published.
4. **Every component consumes only semantic (or component) tokens.** The token list is part of the documentation.
5. **Same name in design, code and documentation.**
6. **Document at creation time**, with the template on this page. A component without "when not to use" is an invitation to misuse.

## Atomic Design as a composition map

The five Atomic Design levels help decide where something lives and what reuses what. They are organization, not obligation: adapt if the product's structure calls for another taxonomy, but keep the idea of levels with one-way dependencies.

| Level | What it is | Examples | Rule |
|---|---|---|---|
| Atom | Indivisible element, backed by tokens | Button, input, label, icon, badge | Contains all states and the accessibility baseline |
| Molecule | Group of atoms with a single purpose | Form field (label + input + help + error), search (input + button) | One job only; no page logic |
| Organism | Self-contained, contextual section | Header, table with filters, address form, full product card | May hold its own state; a change here propagates to many screens |
| Template | Page skeleton without final content | Listing layout, detail layout | Validates grid, hierarchy and responsiveness |
| Page | Template with real content | Orders screen with real data | Reveals problems with long text, empty, error; findings go back to the lower levels |

IF → THEN:

- **IF** the element makes no sense split up **THEN** atom.
- **IF** it combines atoms for a single task **THEN** molecule.
- **IF** it has its own meaning in a region of the screen **THEN** organism.
- **IF** a problem shows up on the page with real data **THEN** fix it at the lowest level that causes it, not with an exception on the page.

Traps: orphan atoms that do not use tokens; a template with "sample" content decided too early; a hierarchy so rigid it blocks legitimate compositions.

## Anatomy

Every component specification names:

- **Parts**: container, label, icon(s), indicator, help text, counter, slot.
- **Tokens per part**: e.g. container `color.bg.surface` + `radius.card` + `space.inset-md`.
- **Sizing rules**: what grows, what truncates, minimum and maximum, behavior with 2× longer text (translation, zoom).
- **Slots**: flexible content areas (card header, body, footer; button leading/trailing icon).
- **Behavior with assistive technology**: role, name, announced states.

## Required state matrix

| State | What it communicates | Typical implementation (repo tokens) | Applies to |
|---|---|---|---|
| Default | At rest | The role's base colors | All |
| Hover | "This responds to the pointer" | `color.action.primary-hover`, `secondary-hover`; transition `motion.feedback` | Pointer-interactive elements |
| Focus-visible | Keyboard focus position | Ring `size.focus-ring` in `color.border.focus` | All focusable elements |
| Active / pressed | Action being triggered | `color.action.primary-active` | Buttons, clickable items |
| Selected / checked | Current choice | Shape + color; `aria-selected`/`aria-checked`/`aria-current` | Tabs, options, list items, toggles |
| Disabled | Unavailable right now | `color.action.disabled` + `color.action.disabled-text`; reason explained when possible | Interactive elements |
| Loading | Processing | Spinner or skeleton; `aria-busy`; blocks resubmission; keeps dimensions | Submit buttons, lists, cards, tables |
| Error | Something failed or is invalid | `color.feedback.danger-*` + icon + specific text + `aria-invalid` | Fields, forms, data blocks |
| Empty | No content yet | Message that explains and the next action | Lists, tables, searches, panels |
| Success | Action completed | `color.feedback.success-*` + icon + text; announced via `role="status"` | Forms, asynchronous actions |

Matrix rules:

- States combine (focus + error, hover + selected). Specify the combinations that occur; focus is never hidden by another state.
- Hover cannot be the only way to discover a function (it does not exist on touch).
- Loading preserves the component's size so the layout does not shift.
- Empty distinguishes "nothing yet" (first use), "nothing found" (filter/search) and "no permission"; each has its own message and action.
- Error says what happened and how to fix it; never "Unexpected error" alone.

## Variants and properties

Recommended variant axes (few values in each):

| Axis | Typical values | Example |
|---|---|---|
| Hierarchy / emphasis | `primary`, `secondary`, `tertiary` (ghost) | Button |
| Intent | `default`, `danger` (and, for feedback, `success`, `warning`, `info`) | Destructive button, alert |
| Size | `sm`, `md`, `lg` (map to `size.control-*`) | Button, input |

Everything else becomes a property:

- Text (label, help).
- Boolean (show icon, show counter, `fullWidth`).
- Instance swap (which icon).
- Slot (free, controlled content).

Rule of thumb: **3 button variants cover the vast majority of cases**. If the catalog has 15, there is duplication or poorly designed properties. Frequent detaching of instances in the design tool signals a lack of legitimate flexibility; investigate before creating a variant.

## API names

- Component in PascalCase with a functional name: `Button`, `TextField`, `Dialog`, `Toast`, not `BlueButton` or `CardNovo`.
- Properties with the same name in the design tool and in code: `variant`, `size`, `intent`, `disabled`, `loading`, `iconStart`, `iconEnd`.
- Property values mirror token names: `variant="primary"` uses `color.action.primary`; `size="md"` uses `size.control-md`; `intent="danger"` uses `color.action.danger`.
- Affirmative booleans (`disabled`, `loading`, `required`), never negative (`notDisabled`).
- Events by intent (`onSelect`, `onDismiss`), not by gesture (`onClickX`).
- Controllable states expose a value/event pair (`open` + `onOpenChange`).
- No free `style` or `color` as a public property: it opens the door to raw values.

## Documentation template

Use this order on every component page:

1. **Name and summary** — what problem it solves, in one sentence.
2. **When to use / when not to use** — with the alternative component for each "not".
3. **Anatomy** — named parts.
4. **Variants and properties (API)** — table with name, type, default, description.
5. **States** — the matrix above filled in, with a visual representation.
6. **Behavior** — keyboard, touch, focus, edge cases.
7. **Content** — text length, tone, microcopy, truncation, empty.
8. **Responsiveness** — what changes by width or container.
9. **Accessibility** — role, name, states, announcements, contrast (pairs consumed).
10. **Tokens used** — exact list.
11. **Examples** — real usage and code.
12. **Limitations and platform differences.**
13. **Status and history** — `stable`, `beta`, `deprecated`; version in which it was added or changed.

The documentation must let someone choose, implement and adapt the component **without talking to whoever created it**.

## Handoff to development

Checklist for the delivered package:

- **Foundation**: links to the tokens used; no loose values in annotations.
- **Components**: name identical to the code's; equivalent properties; design ↔ code connection recorded when the tool allows it.
- **Layout**: breakpoints, columns, gutters and max width with tokens; what is fluid and what is fixed.
- **Behavior matrix**: element × small width × large width × business rule (e.g. side navigation on desktop, bottom bar on mobile, authenticated users only).
- **States and edge cases**: loading (skeleton or spinner), error with the real text, empty, very long content, API failure and fallback, permission denied.
- **Accessibility**: focus order, headings, accessible names for icons, announcements, contrast pairs.
- **Motion**: animated property (`opacity`, `transform`), duration by token (`motion.*`), curve by token (`easing.*`), reduced-motion version. Never "slides smoothly".
- **Assets**: icons in SVG, optimized images with dimensions.
- **Content**: final copy, not lorem ipsum.
- **Version**: which system version the design is based on; breaking changes made explicit.

Handoff anti-patterns: "the file link is the documentation"; happy path only; different names between design and code; spacing off the scale; ignoring platform constraints.

## Documenting a design system from an existing product

Inconsistency in a legacy product is historical accumulation, not carelessness. The job is to reveal the implicit system and separate pattern from exception.

1. **Interface inventory.** Capture every occurrence of button, field, text style, card, navigation, modal, message. Group by function.
2. **Cover six minimum categories**: colors (brand, feedback, neutrals), typography (families, weights, sizes, line heights), spacing (paddings, margins, gaps), component states, components and variants, layout patterns (grid, columns, breakpoints).
3. **Extract real values.** Read computed styles in the browser or the CSS; run `node tools/lint-raw-values.mjs <src> --json` to list loose hex and px values; look for multiples of 4/8 that already recur.
4. **Curate.** Merge duplicates (five nearly identical grays become one ramp step), classify each variation as pattern or exception, name by function.
5. **Normalize into tokens.** Generate ramps with `tools/palette.mjs`, scales with `tools/type-scale.mjs` and `tools/spacing-scale.mjs`; snap the values found to the generated steps; record the pairs in `contrast-pairs.json`; run `tools/build-tokens.mjs`.
6. **Formalize** in a `DESIGN.md` (see `design-md.md`), marking what was **observed** and what was **inferred**.
7. **Migrate incrementally**: shared components first, screens later. Measure drift each round.

Typical symptoms to resolve: several button versions without clear hierarchy; the same function with different hex values; unexplained typographic combinations; padding with no pattern.

## Anti-patterns

- A new component for every screen.
- A variant for every text or icon difference.
- States limited to "default and hover".
- Empty and error forgotten because the prototype had perfect data.
- Diverging names between the design tool and code.
- A public property that accepts free colors or px.
- Documentation written months later, by someone who did not create the component.

## Checklist

- [ ] I checked that no existing component solves the case.
- [ ] Composition level defined; dependencies only on lower levels.
- [ ] Anatomy with named parts and tokens.
- [ ] Full state matrix, including loading, error, empty and success where they apply.
- [ ] Variants only by hierarchy, intent and size; the rest as properties/slots.
- [ ] API with names identical to design and to tokens.
- [ ] Documentation page with the 13 sections and status.
- [ ] Handoff package with edge cases, motion and accessibility.
