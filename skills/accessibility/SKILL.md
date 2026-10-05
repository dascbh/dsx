---
name: accessibility
description: "Audits and fixes WCAG 2.2 AA accessibility of screens and components: keyboard and focus, contrast, accessible names, forms, ARIA, zoom and motion. Use when building or reviewing UI or when asked for an a11y audit."
---

# Accessibility (WCAG 2.2 AA)

> **DSX root:** two levels above this skill's base directory. The `knowledge/`, `patterns/` and `tools/` paths are relative to it.

References: `knowledge/design-system/accessibility.md` (requirements per component), `patterns/accessibility/*`, WAI-ARIA Authoring Practices Guide (APG) for widget patterns.

**Rule zero:** use the native HTML element before ARIA. `<button>` instead of `<div role="button">`, `<a href>` for navigation, `<dialog>`/a tested library for modals. Wrong ARIA is worse than no ARIA.

## Procedure

Run in order — each layer catches things the previous one misses.

### 1. Automated (catches ~30–40% of issues)
- If the project has axe/Lighthouse/Playwright, run them on the screen. Otherwise, recommend `@axe-core/playwright` in CI.
- `node tools/contrast.mjs <fg> <bg>` for each color pair on the screen that is not among the already verified tokens.
- `node tools/lint-raw-values.mjs <src>` — a raw color is usually unverified contrast.

### 2. Keyboard (manual, mandatory)
- [ ] Every interactive element is reachable with Tab, in visual order (2.4.3).
- [ ] Focus **always visible**, contrast ≥ 3:1, never `outline: none` without a replacement (2.4.7, 2.4.11).
- [ ] Focus is not hidden under a fixed header, cookie banner or toast (2.4.11).
- [ ] No keyboard trap; Esc closes overlays; focus returns to the trigger on close (2.1.2).
- [ ] Composite widgets follow the APG (tabs with arrows, menu with arrows, combobox with arrows + Enter).
- [ ] "Skip to content" when there is repeated navigation (2.4.1).

### 3. Screen reader / semantics
- [ ] One `h1`; heading levels without skips; landmarks (`header`, `nav`, `main`, `footer`) (1.3.1).
- [ ] Every control has an accessible name that **contains the visible text** (4.1.2, 2.5.3).
- [ ] Icon without text: `aria-label`; decorative icon: `aria-hidden="true"`.
- [ ] Informative images with an `alt` that states the function/content; decorative ones with `alt=""` (1.1.1).
- [ ] Fields with an associated `<label>`; help and error linked by `aria-describedby`; required indicated in text and with `aria-required` (1.3.1, 3.3.2).
- [ ] Validation error: `aria-invalid="true"`, message in text, focus moved to the error summary or the first field (3.3.1, 3.3.3).
- [ ] Dynamic changes announced: `role="status"` for success/progress, `role="alert"` only for urgent errors (4.1.3).
- [ ] Component state exposed: `aria-expanded`, `aria-selected`, `aria-pressed`, `aria-current`, `aria-sort`.

### 4. Visual
- [ ] Text ≥ 4.5:1; large text (≥ 24px or ≥ 18.66px bold) ≥ 3:1 (1.4.3).
- [ ] Field borders, informative icons, focus/selection states ≥ 3:1 against the adjacent color (1.4.11).
- [ ] Information never conveyed by color alone (1.4.1) — `patterns/accessibility/not-color-alone.md`.
- [ ] 200% zoom with no loss; 320px width with no horizontal scrolling (1.4.4, 1.4.10).
- [ ] Increased text spacing does not break the layout (1.4.12).
- [ ] Targets ≥ 24×24px or with equivalent spacing (2.5.8); system default 44×44px — `patterns/accessibility/touch-target.md`.

### 5. Motion, timing and input
- [ ] `prefers-reduced-motion` respected; nothing flashes > 3×/s (2.3.1).
- [ ] Carousel/automatic animation with pause (2.2.2) — `patterns/content/auto-advancing-carousel.md`.
- [ ] Time limit announced and extendable (2.2.1) — `patterns/authentication/session-expired.md`.
- [ ] Dragging has a click alternative (2.5.7).
- [ ] Authentication does not require a cognitive test; allows pasting the password and password managers (3.3.8).
- [ ] Do not ask again for data already provided in the same flow (3.3.7).

## Report

For each failure: **WCAG criterion** (number + name), **where**, **who is affected** (keyboard, screen reader, low vision, color blindness, motor, cognitive), **severity** (blocks the task = 4), **fix** with code when possible.

Close with: `Estimated conformance: AA ✔/✘ — N blockers, N major, N minor. Tested with: <tools/methods>. Not tested: <what was left out, e.g. a real screen reader>.`

Never declare "100% accessible". Declare what was tested.
