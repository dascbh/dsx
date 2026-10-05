---
id: touch-target
title: What should the minimum size of a touch target be?
category: accessibility
components: [button, icon-button, checkbox, radio, switch, toolbar]
type: accessibility
impact: high
status: recommended
evidence: strong
wcag: ["2.5.8", "2.5.5", "2.4.7", "4.1.2"]
related: [icon-and-text-button, icon-only-button, keyboard-focus, action-placement]
---

# What should the minimum size of a touch target be?

> **Rule:** Size the interactive area, not the drawing: at least 24 × 24 CSS px (the AA floor) and 44–48 units for touch controls, with space between neighbors.

## Context

The visual edge of an icon or button does not have to match the touch-sensitive region. A small icon is fine inside a larger area; a large button pressed up against another still causes mistaps.

The numbers 24, 44 and 48 come from different sources: 24 is the AA conformance floor, 44 is the Apple platform and AAA reference, and 48 is the Android reference. None of them is a single rule for every context. The choice depends on the cost of an error, how often the action is used and the density required.

Small, crowded targets cause accidental taps, slowness and exclusion of people with tremor, reduced mobility or who use the device one-handed.

## Decision

- **IF** the control is operated by pointer or touch **THEN** guarantee at least 24 × 24 CSS px of interactive area.
- **IF** the target is smaller than 24 × 24 px **THEN** make sure a 24 px circle centered on it does not touch another target or another target's circle.
- **IF** it is a common button, icon or touch action **THEN** design 44 × 44 CSS px (web/iOS) or 48 × 48 dp (Android).
- **IF** the action is critical, irreversible, frequent or sits at the screen edge **THEN** increase area and spacing beyond 44–48.
- **IF** the icon must stay small **THEN** keep the icon and enlarge the area with padding or a pseudo-element.
- **IF** the link sits inside a sentence **THEN** treat it as inline content (an exception in the criterion), but do not apply the exception to toolbar icons.
- **ELSE** use 44 × 44 as the design system default.

## When to use

- Action buttons on mobile screens.
- Icon-only buttons and toolbar controls.
- Close modal, back and top-bar actions.
- Checkbox, radio and switch.
- Frequent or irreversible actions.

## When to avoid

- Measuring only the visible icon → **use instead:** measure the full clickable area.
- Treating 24 px as the ideal size → **use instead:** 24 as the floor and 44–48 as the target.
- Shrinking targets to fit more actions → **use instead:** group them in an overflow menu.
- Applying exceptions without assessing context → **use instead:** test with real touch.

## Do

- Define the hit area in the base component, not per screen.
- Separate neighboring actions with measurable space.
- Give critical actions more area.
- Test on a real device, one-handed and with zoom.

## Avoid

- Four small icons squeezed into a bar.
- Overlapping interactive areas.
- Hiding the enlarged area without focus or press feedback.
- Requiring a precise tap for an important action.

## Accessibility

- WCAG 2.2, criterion 2.5.8 (AA): minimum of 24 × 24 CSS px; exceptions for spacing, equivalent target, inline text, user agent control and essential need.
- Criterion 2.5.5 (AAA): 44 × 44 CSS px.
- Enlarging the area must not remove visible focus (2.4.7), hide state or change the accessible name (4.1.2).
- Ensure keyboard and assistive technology operation for every control.

## Microcopy

Not applicable.

## Verification checklist

- [ ] Every target is at least 24 × 24 CSS px or meets the spacing exception.
- [ ] Common touch controls have 44–48 units of area.
- [ ] The interactive area of icons is larger than the drawing when needed.
- [ ] Neighboring controls have measured, sufficient separation.
- [ ] Critical actions have more area and distance than the others.
- [ ] There are no overlapping interactive areas.
- [ ] Keyboard focus is still visible.
- [ ] Accessible name and state were preserved.
- [ ] The screen was tested on a real device.

## Rationale

- WCAG 2.2, criterion 2.5.8 (Target Size Minimum): AA floor of 24 × 24 px, plus the listed exceptions.
- WCAG 2.2, criterion 2.5.5 (Target Size Enhanced): 44 × 44 px, required at AAA.
- Apple Human Interface Guidelines: 44 × 44 pt touch region and attention to spacing.
- Android Developers (accessibility): 48 × 48 dp area, with padding making up the area.
- U.S. Web Design System: turns the 24 px requirement into a component test.
- Parhi, Karlson and Bederson's study on thumb interaction: wider physical targets improve performance and preference; the pixel equivalent varies by device.
