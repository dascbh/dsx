# Accessibility in the design system (WCAG 2.2 AA)

## When to consult

- When creating, changing or reviewing any interactive component.
- When defining focus styles, touch targets, animations or status messages.
- When writing the accessibility section of a component's documentation.
- When auditing a screen: use the per-component matrix as a script.

## Operating principles

1. **Accessibility is anatomy, not finish.** It goes into the component's specification; fixing it later multiplies the cost by every screen that reused the mistake.
2. **Native HTML first.** `<button>`, `<a href>`, `<input>`, `<select>`, `<dialog>`, `<table>` handle role, keyboard and state. ARIA only fills what native elements do not offer. A clickable `div` is a failure.
3. **Visible name = programmatic name** (2.5.3). The text the person sees must be contained in the accessible name.
4. **Automation does not certify.** Automated tools find a share of the problems; complete with keyboard, screen reader, zoom and, when possible, real people.
5. **A component approved in isolation can fail in the flow.** Test compositions: modal inside a form, toast over a fixed header.
6. **No "one-click" accessibility overlays.** They do not fix the experience.

## Cross-cutting requirements (apply to every component)

| Requirement | Rule | Criterion |
|---|---|---|
| Text contrast | 4.5:1 (3:1 only for ≥ 24px or ≥ 18.66px bold) | 1.4.3 |
| Non-text contrast | 3:1 for control outlines, informative icons, state indicators and focus | 1.4.11 |
| Not color alone | State and meaning with an extra cue (text, icon, shape) | 1.4.1 |
| Keyboard | Everything operable by keyboard, with no trap | 2.1.1, 2.1.2 |
| Focus order | Follows the logical/visual order | 2.4.3 |
| Visible focus | Indicator always visible when navigating by keyboard | 2.4.7 |
| Focus not obscured | The focused element cannot be fully covered by author content (fixed header, cookie banner, toast) | 2.4.11 |
| Pointer target | ≥ 24 × 24 CSS px or equivalent spacing; system default 44px | 2.5.8 |
| Dragging | Every drag action has an alternative with a simple click/tap | 2.5.7 |
| Zoom and reflow | Usable at 200%; no 2D scrolling at 320 CSS px | 1.4.4, 1.4.10 |
| Text spacing | Supports line height 1.5, letters 0.12em, words 0.16em, paragraphs 2em with no loss | 1.4.12 |
| Name, role, value | States (expanded, selected, checked, disabled) exposed programmatically | 4.1.2 |
| Status messages | Announced without moving focus | 4.1.3 |

### Focus: system default specification

```css
:where(a, button, input, select, textarea, [tabindex]):focus-visible {
  outline: var(--size-focus-ring) solid var(--color-border-focus);
  outline-offset: var(--space-0_5);
}
```

- `color.border.focus` has a validated pair ≥ 3:1 against `color.bg.canvas` in both themes (see `tokens/contrast-pairs.json`). If the component sits on another surface (`bg.surface`, `action.primary`), validate that pair too.
- Use `:focus-visible` so the ring does not show on mouse click, but **never** `outline: none` without an equivalent replacement.
- A 2px ring with offset is the recommended target. The focus appearance criterion (2.4.13) is AAA; adopting it as the default avoids case-by-case debates.
- To avoid being obscured: `scroll-padding-block-start` equal to the fixed header's height; toasts and fixed bars are not positioned over focusable content without shifting it.

### Touch target

- Normative minimum: **24 × 24 px** (2.5.8). Exceptions: inline target in text, target with enough spacing (a 24px circle centered on it does not touch another target), unstyled native control, or when the size is essential.
- System default: **44px** (`size.touch-target`). Always use it on mobile and for primary actions.
- Enlarge the clickable area without enlarging the visual: padding on the element itself or a positioned `::after`. On checkbox and radio, the `<label>` is part of the clickable area.

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- System durations: `motion.feedback` (120ms), `motion.transition` (200ms), `motion.overlay` (320ms). Nothing beyond these without justification.
- With reduced motion: replace movement, zoom and parallax with a short fade or an instant change. Keep state feedback (it is information), remove decorative motion.
- Automatic animation that lasts more than 5 seconds needs pause/stop/hide (2.2.2).
- Nothing flashes more than 3 times per second (2.3.1).
- Being able to turn off interaction-triggered animation is AAA (2.3.3); honoring `prefers-reduced-motion` covers this case in practice.

## Matrix by component type

### Button

- `<button>` element (or `<a>` if it navigates to another URL; the rule is: action = button, destination = link).
- Accessible name comes from the visible label; an icon-only button requires `aria-label` and the icon with `aria-hidden="true"`.
- Visual and programmatic states: hover, `:focus-visible`, active, disabled, loading. While loading, keep focus on the button, use `aria-busy="true"` or announce progress through a live region, and prevent double submission.
- Disabled: prefer explaining why the action is unavailable. If the button must stay discoverable by keyboard, use `aria-disabled="true"` and block the action in code, instead of `disabled`.
- Target ≥ 24px; default height `size.control-md` (40px) and touch area 44px.
- Filled action label in `color.text.on-action` (validated pair).

### Link

- A real `<a href>`. Text describes the destination out of context (2.4.4); avoid bare "click here", "learn more".
- Distinct from surrounding text by something besides color: underline in running text.
- `aria-current="page"` on the navigation item that represents the current page.
- A link that opens a new tab or downloads a file says so in the text or with an icon that has an accessible name.

### Text field (input/textarea)

- `<label for>` associated with the `id`; a placeholder does **not** replace a label.
- Instructions and expected format visible before the error (3.3.2), associated by `aria-describedby`.
- Required marked visually (text or an explained asterisk) and with `required`/`aria-required`.
- Correct `autocomplete` for personal data (name, email, phone, address).
- Error: identified in text (3.3.1), specific and with a correction suggestion (3.3.3), `aria-invalid="true"`, message linked by `aria-describedby`, icon + text + border (not color alone). The message persists until corrected.
- On submit with errors: focus the first invalid field or an error summary with links.
- Field outline ≥ 3:1 (`color.border.strong`).
- Pasting always allowed, including in password and code fields (3.3.8). Do not ask again for what was already provided in the flow (3.3.7).
- Legal/financial transactions: allow reviewing, correcting or undoing before confirming (3.3.4).

### Select, combobox, autocomplete

- Prefer native `<select>`. Custom only if there is a real need (search, rich content) and following the ARIA combobox pattern: `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` or focus on the options.
- Keyboard: arrows navigate, Enter selects, Esc closes and restores the previous value, typing filters.
- Number of results announced through a live region ("5 results").
- Changing the selection does not trigger navigation or automatic submission (3.2.2).

### Checkbox, radio, switch

- Native inputs with `<label>`; the label enlarges the click area.
- Groups in `<fieldset>` with a `<legend>` that names the question.
- Checked state visible by shape (check, dot, switch position), not color alone; indicator at 3:1.
- Radio: arrows move the selection within the group; Tab enters and leaves the group.
- A switch represents on/off with immediate effect; if it needs "save", use a checkbox. Expose `role="switch"` and `aria-checked`.
- A "select all" checkbox with a mixed state uses `aria-checked="mixed"` or `indeterminate`.

### Modal / dialog

- `<dialog>` with `showModal()` or `role="dialog"` + `aria-modal="true"`; title linked by `aria-labelledby`.
- On open: focus goes to the first useful element (or to the title, for long content).
- While open: focus trapped inside; background inert (`inert`), no background scrolling.
- Esc closes (except when closing would lose data without warning; then confirm). Visible close button with an accessible name.
- On close: focus returns to the element that opened it.
- Scrim in `color.bg.overlay`; the modal content does not depend on the background for contrast.
- Do not open a modal over a modal. Do not use a modal for an ongoing task that requires consulting the screen behind it.

### Tabs

- `role="tablist"`, `role="tab"` with `aria-selected` and `aria-controls`, `role="tabpanel"` with `aria-labelledby`.
- Tab enters the list and moves to the panel; left/right arrows switch tabs; Home/End go to the first/last (roving tabindex).
- Selected tab indicated by shape (underline, weight, border) in addition to color; indicator ≥ 3:1.
- Automatic activation on focus only when the panel loads instantly; otherwise, manual activation with Enter/Space.

### Toast / notification

- Status message in `role="status"` (`aria-live="polite"`); only urgent errors use `role="alert"`.
- The live region must exist in the DOM before the message is inserted.
- Do not auto-dismiss error messages or toasts with an action ("Undo"). For the rest, enough time to read (starting heuristic: ~5s plus an increment proportional to text length), pause on hover/focus and a close button (2.2.1).
- Icon + title per type (`color.feedback.*-icon`/`-text`), never color alone.
- A position that does not cover the focused element or the main action.
- Critical information cannot exist only in the toast; repeat it on the screen.

### Data table

- `<table>` with `<caption>` (or a name via `aria-labelledby`), `<th scope="col|row">`.
- Sorting: a button inside the `<th>`, `aria-sort` on the active header.
- Row actions with a name that includes the item ("Edit contract 123", not just "Edit").
- Selectable rows with a real checkbox and "select all" in the header.
- Responsive: horizontal scrolling in the container with a visible header, or a list that preserves label-value. Never `display: block` on the table without rebuilding the semantics.
- Status in a cell: text or an icon with a name, not background color alone.

### Tooltip

- Appears on hover **and** on focus of the trigger; linked by `aria-describedby` (description) or is the name itself on an icon button.
- 1.4.13: dismissible (Esc closes without moving focus), hoverable (the pointer can move onto the tooltip without it disappearing), persistent (stays until the person leaves or dismisses it).
- Short, supplementary text only. No links, buttons or essential information: for that use a popover or a click-triggered "toggletip".
- Do not use a tooltip on non-focusable disabled elements (nobody using a keyboard can reach it).

### Menu / action dropdown

- Trigger button with `aria-haspopup="menu"` and `aria-expanded`.
- `role="menu"` with `menuitem` **only** for action menus (application-style). Site navigation uses a list of links with the disclosure pattern, not `role="menu"`.
- Keyboard: Enter/Space/down arrow opens and focuses the first item; arrows navigate; Home/End; Esc closes and returns focus to the trigger; Tab closes and moves on.
- A destructive item is identified by text (with `color.action.danger` as a complement) and confirmed according to the risk.

## Minimum tests per component

1. Keyboard only: Tab, Shift+Tab, Enter, Space, arrows, Esc, Home/End.
2. Screen reader (one desktop and one mobile): name, role, state and announcements.
3. 200% zoom and 320px width.
4. Light and dark themes, and the system's high-contrast mode.
5. `prefers-reduced-motion: reduce`.
6. Automated checking in CI as a safety net, not as a certificate.

Document in the component: how it is announced, which keys it uses and which contrast pairs it consumes.

## Anti-patterns

- `outline: none` without a replacement.
- `div`/`span` with `onclick` as a button.
- Placeholder as label.
- Error shown only in red, or that disappears on its own.
- Modal without focus management or without returning to the trigger.
- `role="menu"` on the main navigation.
- Tooltip with essential or interactive content.
- Error toast with auto-dismiss.
- Fixed header covering the focused field.
- Long entrance animation that ignores reduced motion.

## Checklist

- [ ] Correct native HTML element; ARIA only where needed and correct.
- [ ] Accessible name contains the visible label.
- [ ] Contrast 4.5:1 for text and 3:1 for outlines/icons/focus, in both themes.
- [ ] Visible focus (`size.focus-ring` + `color.border.focus`) and never obscured.
- [ ] Target ≥ 24px; 44px as the system default.
- [ ] Full keyboard support per the component's row in this matrix.
- [ ] States exposed programmatically; status messages announced.
- [ ] Reduced motion honored; nothing flashes.
- [ ] Tested with keyboard, screen reader, 200% zoom and 320px.
