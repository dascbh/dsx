---
id: keyboard-focus
title: How should keyboard focus be indicated?
category: accessibility
components: [button, link, field, menu]
type: accessibility
impact: high
status: recommended
evidence: strong
wcag: ["2.4.7", "1.4.11", "2.4.11", "2.4.13"]
related: [touch-target, not-color-alone, close-modal, link-text]
---

# How should keyboard focus be indicated?

> **Rule:** Every keyboard-operable control must show a visible focus indicator with at least 3:1 contrast against the adjacent colors, and it must not be covered by fixed elements.

## Context

When navigating by keyboard, focus shows which element will respond to the next command. On pressing Tab, the person must see where they are and know what Enter or Space will trigger.

Browsers provide a native indicator, but CSS that removes the outline, low contrast and fixed bars sitting over the control make focus impossible to perceive.

This pattern covers focus visibility; it does not replace a logical navigation order, semantics or full keyboard operation.

## Decision

- **IF** the native indicator is visible and sufficient **THEN** keep it.
- **IF** you customize focus **THEN** draw an outline around the whole control, with contrast >= 3:1 against the adjacent colors (1.4.11).
- **IF** focus would only be a subtle background change **THEN** add an outline, thickness or another structural change.
- **IF** there is a fixed header, footer or panel **THEN** make sure the focused control is not entirely hidden (2.4.11), for example with scroll margin.
- **IF** the component is custom or receives programmatic focus **THEN** apply the same focus state.
- **IF** you want a sturdier standard **THEN** use AAA criterion 2.4.13 as a reference (an outline of about 2 px), without treating it as an AA requirement.
- **ELSE** use `:focus-visible` with a clear outline.

## When to use

- Links, buttons and icon-only buttons.
- Fields, checkboxes, options, switches.
- Menus, tabs, dropdown lists.
- Custom components.

## When to avoid

- Removing the outline with no equivalent → **use instead:** your own focus style.
- Using hover to show position → **use instead:** a focus state.
- Styling focus on buttons only → **use instead:** a style for every interactive element.

## Do

- Keep native focus when it works.
- Draw a clear outline around the control.
- Check contrast on different backgrounds and states.
- Test with Tab, Shift+Tab, Enter and Space.

## Avoid

- `outline: none` with no replacement.
- A barely visible color as the only cue.
- Fixed elements covering the focused control.
- Forgetting links and custom components.

## Accessibility

- WCAG 2.4.7 (AA): at least one mode with visible focus.
- WCAG 1.4.11 (AA): a styled indicator with 3:1 contrast.
- WCAG 2.4.11 (AA): focus not entirely obscured.
- WCAG 2.4.13 (AAA): a stricter reference for size and contrast.
- Color is not the only cue; combine outline, thickness or position.

## Microcopy

Not applicable.

## Verification checklist

- [ ] Does every operable element show focus when reached with Tab?
- [ ] Does the indicator appear without relying on hover?
- [ ] Is the indicator clearly distinct from the normal state?
- [ ] Is the indicator contrast >= 3:1?
- [ ] Does focus stay visible over different backgrounds and states?
- [ ] Does no fixed element cover the focused control?
- [ ] Were links, buttons and custom components tested?
- [ ] Were zoom and assistive technology tested?

## Rationale

- WCAG 2.2, 2.4.7 (Focus Visible): requires visible focus; technique with `:focus-visible`.
- WCAG 2.2, 1.4.11 (Non-text Contrast): 3:1 for the indicator.
- WCAG 2.2, 2.4.11 (Focus Not Obscured): focus not hidden by author content.
- WCAG 2.2, 2.4.13 (Focus Appearance): AAA reference.
- GOV.BR Digital Standard (Button): keep a focus state; Tab, Enter and Space.
- IBM Carbon (Focus): focus on every interactive element, 2 px border, 3:1 contrast.
