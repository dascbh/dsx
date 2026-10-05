---
version: alpha
name: Orchard Ledger
description: Fictional bookkeeping tool for small farms (test fixture of the design lab). Medium density, tables and forms.
owner: design-system-team
updated: 2026-10-01
colors:
  canvas: "#ffffff"
  surface: "#f4f7fc"
  text-primary: "#1f2226"
  text-secondary: "#4f5a6b"
  text-muted: "#627187"
  link: "#4646b9"
  border: "#d2dae4"
  border-strong: "#7a8aa2"
  focus: "#5754ed"
  primary: "#5754ed"
  primary-hover: "#4646b9"
  on-primary: "#ffffff"
  secondary: "#e7ecf3"
  on-secondary: "#1f2226"
  danger: "#ce1d1f"
  on-danger: "#ffffff"
  success-bg: "#e9fdec"
  on-success-bg: "#105325"
  danger-bg: "#fef4f3"
  on-danger-bg: "#7b201b"
  warning-bg: "#fff5ed"
  on-warning-bg: "#683601"
  info-bg: "#f0f8fe"
  on-info-bg: "#12496d"
  ai-surface: "#f5f6fe"
  ai-accent: "#5754ed"
colors-dark:
  canvas: "#0d1724"
  surface: "#142235"
  text-primary: "#e7edf5"
  text-secondary: "#9aa7b8"
  text-muted: "#9aa7b8"
  link: "#7ea6f2"
  border: "#28405a"
  border-strong: "#6a82a0"
  primary: "#7ea6f2"
  on-primary: "#0d1724"
typography:
  display:
    fontFamily: Inter
    fontSize: 49px
    fontWeight: 700
    lineHeight: 1.1
  h1:
    fontFamily: Inter
    fontSize: 31px
    fontWeight: 600
    lineHeight: 1.25
  h2:
    fontFamily: Inter
    fontSize: 25px
    fontWeight: 600
    lineHeight: 1.25
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
  code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "6": 24px
  "8": 32px
  "12": 48px
  "16": 64px
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    height: 40px
    padding: "{spacing.2} {spacing.4}"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    rounded: "{rounded.md}"
    height: 40px
    padding: "{spacing.2} {spacing.4}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-danger}"
    rounded: "{rounded.md}"
    height: 40px
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border-strong}"
    rounded: "{rounded.md}"
    height: 40px
    padding: "{spacing.2} {spacing.3}"
  card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    padding: "{spacing.6}"
  ai-response:
    backgroundColor: "{colors.ai-surface}"
    borderColor: "{colors.ai-accent}"
    rounded: "{rounded.lg}"
    padding: "{spacing.4}"
---

# Orchard Ledger

Token source: `tokens/*.tokens.json` (compiled into `tokens/build/tokens.css`). This file is the readable translation of those decisions. If they diverge, **the tokens win** and this file must be fixed.

## Overview

A work interface, not a showcase. The user arrives to finish a task and leave. Therefore:

- **Visual calm:** neutral surfaces, at most **one** accent color competing for attention in each viewport (the primary color).
- **Hierarchy through typography and space**, not through color or boxes. Borders and shadows are the last resort.
- **Medium density:** 40px controls, spacing on a 4px grid, running text limited to 68 characters per line.
- **Predictability over surprise:** the same action always has the same appearance and the same position.

Personality as observable criteria: sober (no gradients, no decorative illustrations on task screens), direct (labels with a verb), trustworthy (every system state has a visible representation).

## Colors

| Role | Token | Where it appears | Where it NEVER appears |
|---|---|---|---|
| Primary | `primary` | The screen's main action (1 per region), selected state, focus ring | Running text, large backgrounds, decorative icons |
| Secondary | `secondary` | Alternative actions next to the primary | As the only action of a form |
| Danger | `danger` | Confirmed destructive actions and error messages | To "grab attention" on something that is not an error or destruction |
| Canvas / Surface | `canvas`, `surface` | Page background / cards and panels | — |
| Text | `text-primary`, `text-secondary`, `text-muted` | Content, support, metadata | `text-muted` on text essential to finish the task |
| Feedback | `*-bg` + `on-*-bg` | Inline alerts and messages for success, error, warning and information | Decoration |
| AI | `ai-surface`, `ai-accent` | Exclusively to mark AI-generated content | Any other content |

Rules:

- Every text/background pair listed above has contrast **≥ 4.5:1**; field borders, focus and informative icons have **≥ 3:1**. The pairs are checked by `node tools/build-tokens.mjs`.
- **Color is never the only signal.** Error = color + icon + text; selected = color + weight/shape/marker.
- In the dark theme the primary becomes a light tone with dark text (dark `on-primary`). Do not invert colors by hand: use the semantic tokens, which already have a value per theme.

## Typography

- A single family (Inter, with a system fallback) for the whole interface; monospace only for code and identifiers.
- Modular scale with ratio **1.25** and a 16px base.
- **`h1` is the page's only title.** `h2` groups sections; `h3` groups blocks within a section. Do not skip levels.
- `display` only on welcome screens or first-use empty states, never on task screens.
- `body` (16px/1.5) for all reading text. Never smaller than 14px for content; 12px only for non-essential captions.
- Weight 600 for headings and 500 for labels. Do not use 700 outside `display`.
- Maximum width of running text: **68ch**.

## Layout

- A **4px** spacing grid. Use only the `spacing` steps: no 5px, 10px, 15px.
- Vertical rhythm: 8px between label and field, 16px between fields, 32px between groups, 64px between sections.
- Containers: maximum width of 1200px for content pages; tables and dashboards may use the full width.
- Breakpoints: 640 / 768 / 1024 / 1280px. Below 640px, a one-column layout and primary actions taking the full width.
- Single-column forms. Short related fields (postal code + number) may share a row.
- Primary action on the right in the footer of dialogs and desktop forms; on mobile, stacked with the primary on top.

## Elevation & Depth

Depth is conveyed by **surface contrast** first, border second, shadow third.

| Level | Use | Treatment |
|---|---|---|
| 0 | Page | `canvas`, no border |
| 1 | Cards, panels | `surface` + `border` border |
| 2 | Dropdowns, popovers, tooltips | `canvas` + `md` shadow |
| 3 | Modals and dialogs | `canvas` + `lg` shadow + `overlay` scrim |

Never stack more than two visible levels at the same time (e.g. a modal over a modal is forbidden).

## Shapes

- Radius `md` (8px) for controls (buttons, fields, chips); `lg` (12px) for containers (cards, modals); `full` for avatars and badges.
- Do not mix different radii on elements of the same level.
- Icons with a 1.5–2px stroke, 16px inline with text and 20px on their own.

## Components

Every interactive component implements **all** states: default, hover, visible focus, active, disabled, loading and, when it receives data, error, empty and success.

- **Button:** 40px tall (touch target ≥ 44px on mobile through the clickable area). Label = verb + object ("Salvar alterações" in a pt-BR product). While submitting: disables, shows a spinner inside the button and keeps its width. A single primary per region.
- **Text field:** visible label above (never only a placeholder); help text below; the error below the field, with icon and text, tied by `aria-describedby`. Validate on leaving the field or on submit, never on every keystroke.
- **Card:** one subject per card; an `h3` title; at most one primary action.
- **Table:** prefer it over cards when the person compares attributes; sticky header, sorting shown by an icon + `aria-sort`.
- **Modal:** only for decisions that block the flow. Closes with Esc, a visible button and a click on the scrim (unless there is unsaved data). Focus trapped inside and returned to the trigger.
- **Toast:** only to confirm non-critical actions; 6s by default (4–10s depending on the text length), pausable on hover/focus, announced by `role="status"`. If it has an action (e.g. "Desfazer" in a pt-BR product), it stays until used or dismissed. Errors never go to a toast.
- **AI response:** always in `ai-response`, with the label "Gerado por IA" (in a pt-BR product), sources when there are any, and edit/regenerate/discard actions.

## Do's and Don'ts

**Do**

- Use only semantic tokens (`var(--color-text-primary)`), never primitives or raw values.
- Design the empty, loading and error states before the ideal state.
- Write button labels with a verb and an object.
- Keep the primary action in the same place on every screen of the same type.
- Ask for a specific confirmation (action + object + consequence) only for destructive or irreversible actions; for the rest, offer undo.

**Don't**

- Do not create a new component variant without recording the reason in this file.
- Do not use color to decorate; color carries meaning.
- Do not use a placeholder as a label.
- Do not disable the submit button to "prevent errors": let it submit and explain what is missing.
- Do not use a modal for long content, extensive forms or success messages.
- Do not open links in a new tab without warning.

## Accessibility

- Target: **WCAG 2.2 level AA** on every screen.
- Visible focus with a 2px ring in `focus`, contrast ≥ 3:1, never removed (`outline: none` without a replacement is forbidden).
- Minimum touch target 24×24px (floor) and 44×44px (system default).
- Respect `prefers-reduced-motion`: transitions longer than 200ms become a simple fade or nothing.
- 200% zoom and a 320px width with no loss of content and no horizontal scrolling.
- Every informative image has `alt`; icons without text have an accessible name.

## Agent Instructions

1. Read this file and `tokens/build/tokens.css` before any interface change.
2. Reuse existing components. If none fits, explain why before creating a new one.
3. Consult `patterns/` for interaction decisions (modal or not, toast or inline, etc.).
4. Deliver the list of tokens and components used and the states implemented.
5. Run `node tools/lint-raw-values.mjs <changed-folder>` and fix every occurrence before finishing.
