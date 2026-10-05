---
id: floating-action-button
title: When should you use a floating action button?
category: actions
components: [floating-action-button, fab, button]
type: contextual-decision
impact: medium
status: caution
evidence: moderate
wcag: ["4.1.2", "2.5.8", "2.1.1", "2.4.7", "2.3.3"]
related: [icon-only-button, icon-and-text-button, button-hierarchy, touch-target]
---

# When should you use a floating action button?

> **Rule:** Use a floating action button only for a single primary, frequent and constructive action, without covering content or competing with navigation.

## Context

A floating action button puts an action in evidence over the content and keeps it within reach while the page scrolls. The cost is that, fixed on screen, it can cover information, fields, controls, navigation or temporary notices.

The choice depends on the action's priority, frequency of use, device, screen density and how clear the icon is. Used without criteria, the button hides content, competes in the hierarchy and makes a secondary action look like the main one.

Constructive, recurring actions such as create, add, share or start are the use case. On desktop, it is not a way to save space.

## Decision

- **IF** there is one main, constructive and recurring action on the screen **THEN** a floating action button may be used.
- **IF** there are several actions with the same priority **THEN** use an action bar or toolbar.
- **IF** the action only makes sense next to a field, card or section **THEN** prefer an inline button.
- **IF** the action is destructive, rare or hard to understand **THEN** avoid the floating action button.
- **IF** the icon is ambiguous **THEN** add a visible label (extended version).
- **IF** the screen is a form or very dense **THEN** prefer an inline action or a persistent bar.
- **IF** the button would cover content, bottom navigation, the on-screen keyboard, banners or toasts **THEN** reposition it or change the pattern.
- **ELSE** use a regular button within the page hierarchy.

Limit: a single floating action button per screen or context.

## When to use

- The screen's main, recurring action.
- The action stays relevant while scrolling.
- The icon or label clearly communicates the purpose.
- There is room to avoid covering content or controls.
- The position adapts to the device and the safe area.

## When to avoid

- Several actions with the same priority → **use instead:** toolbar or action bar.
- An action tied to a specific section → **use instead:** inline button.
- A destructive or rare action → **use instead:** a menu or a regular button with confirmation.
- Meaning that depends on an ambiguous icon → **use instead:** a button with text.
- Works only with mouse or hover → **use instead:** a control operable by touch and keyboard.

## Do

- Prioritize one action.
- Use a visible label when the meaning is not immediate.
- Reserve space around the button.
- Respect safe areas, bottom navigation and the on-screen keyboard.
- Keep focus visible.
- Test with real content, zoom and screen reader.
- Adapt the position to the platform and reading direction; the bottom-right corner is common but not universal.

## Avoid

- Using it because it is fashionable.
- Stacking several floating buttons.
- Covering cards, fields or messages.
- Hiding the action's name.
- Relying on color or shadow alone to make it stand out.
- Using it for destructive actions.

## Accessibility

- Use a native button element with an accessible name that describes the action ("Create note", not "More") (4.1.2).
- Ensure Tab, Enter and Space, visible focus and a predictable order (2.1.1, 2.4.7).
- A minimum interaction area of 24 x 24 CSS pixels, or the spacing exception (2.5.8).
- Do not use color, shadow, motion or position alone to convey the action.
- Respect prefers-reduced-motion in animations (2.3.3) and check that the button does not cover zoomed content.
- Test keyboard, touch, screen reader, voice, zoom and screen sizes.

## Microcopy

| Situation | Example |
|---|---|
| Accessible name, icon only | "Create note" |
| Extended version | "New message" |
| Share | "Share list" |
| Avoid | "More", "Button", "+" with no name |

## Verification checklist

- [ ] The screen has at most one floating action button.
- [ ] The action is constructive and recurring.
- [ ] The button has a specific accessible name.
- [ ] The button does not cover content, fields, navigation or messages at any screen size.
- [ ] The position respects safe areas and the on-screen keyboard.
- [ ] The touch area is at least 24 x 24 CSS pixels.
- [ ] Tab, Enter and Space work and focus is visible.
- [ ] Animations respect prefers-reduced-motion.
- [ ] The action would not be better in a toolbar or an inline button.

## Rationale

- Material Design 3, FAB: emphasis for the primary or most common action; avoid minor, destructive or unclear actions; limit the number per screen.
- Android Developers, floating action button: standard, small, large and extended variants and creation use cases.
- Material UI, floating action button: one per screen for the primary action.
- Baymard Institute, mobile e-commerce and mobile filters research: fixed actions must be assessed for size, position and content overlap.
- WCAG 2.2, criteria 4.1.2 (name, role, value) and 2.5.8 (target size minimum).
- IBM Carbon, button accessibility: keyboard and names for icon-only buttons.
