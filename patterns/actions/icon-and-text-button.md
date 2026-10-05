---
id: icon-and-text-button
title: Should buttons have an icon and text?
category: actions
components: [button, icon-button, icon]
type: contextual-decision
impact: high
status: caution
evidence: moderate
wcag: ["2.5.3", "4.1.2", "1.1.1", "2.1.1"]
related: [icon-only-button, button-text, touch-target, button-hierarchy]
---

# Should buttons have an icon and text?

> **Rule:** Use icon plus text when the action is unfamiliar, important or destructive; use an icon alone only for very well-known, compact actions, always with an accessible name.

## Context

Icons speed up recognition, but they are not a universal language. Text makes the intent explicit, serves people who use voice commands and reduces the effort of memorizing and interpreting images.

No rule requires an icon on every button, nor text on every button. The decision depends on how familiar the action is, the context, space, audience and risk.

Define the action's name first; the icon reinforces the meaning, it does not replace a needed label. The same function must keep the same name and visual pattern across the interface.

## Decision

- **IF** the action is unfamiliar, complex or open to different readings **THEN** use icon and text.
- **IF** the action is destructive or involves money, privacy or access **THEN** use visible text, with or without an icon.
- **IF** the screen is public or serves varied audiences **THEN** use visible text.
- **IF** there are several actions close together **THEN** use text to tell them apart.
- **IF** the action is very well known, recurring, the pattern repeats in a toolbar and space is truly limited **THEN** use an icon alone, with an accessible name and visible focus.
- **IF** the function can only be discovered by hovering **THEN** add visible text.
- **IF** the symbol is ambiguous **THEN** add text or change the symbol.
- **ELSE** use text, with an optional icon as reinforcement.

## When to use

- Icon and text: main action, public screen, action with a relevant consequence, actions close together, an icon with more than one interpretation, a translated interface.
- Icon only: a toolbar with a repeated pattern, universal actions, a context that makes the function evident.

## When to avoid

- An icon alone that needs hover to be understood → **use instead:** a visible label.
- An ambiguous symbol → **use instead:** text next to it.
- An action involving data loss, money or access with only an icon → **use instead:** a button with text.
- A tooltip as the only explanation → **use instead:** a label that also works with touch and keyboard.

## Do

- Write the action's verb first, then choose the icon.
- Use the same name for the same function across the interface.
- Treat the icon as decoration when the text already describes the action.
- Test comprehension with people from the audience.

## Avoid

- Changing the action's name between screens.
- Mixing label patterns for no reason.
- Hiding the button's focus.
- Treating the icon as ornament when it is the only label.

## Accessibility

- Prefer the native button element, operable with Tab, Enter and Space.
- If there is visible text, the accessible name must include it (2.5.3); treat the icon as decorative.
- On an icon-only button, give a name that describes the function, such as "Close", not the symbol "X" (4.1.2, 1.1.1).
- Do not rely on hover; ensure focus, touch, screen reader and voice command support.

## Microcopy

| Situation | Example |
|---|---|
| Main action | download icon + "Download report" |
| Icon only, accessible name | "Close" |
| Destructive action | "Delete account" |
| Compact toolbar | "Bold" (accessible name) |

## Verification checklist

- [ ] The action's name was defined before the icon.
- [ ] Unfamiliar or critical actions have visible text.
- [ ] Icon-only buttons have an accessible name that describes the function.
- [ ] The accessible name contains the visible text.
- [ ] Nothing depends on hover to be understood.
- [ ] The same function gets the same name on every screen.
- [ ] The button stays understandable on a narrow screen.
- [ ] It was tested with keyboard and screen reader.

## Rationale

- WCAG 2.2, criterion 2.5.3 (Label in Name): the accessible name must contain the visible text, which supports voice commands.
- WCAG 2.2, criterion 4.1.2 (Name, Role, Value): name, role and state exposed programmatically.
- W3C WAI-ARIA APG (Names and Descriptions and Button Pattern): prefer visible text and describe the function, not the appearance.
- Baymard Institute (button design): descriptive microcopy, consistency and differentiation; research in an e-commerce context.
- IBM Carbon and GitHub Primer: implementation of labels and focus on icon-only buttons; implementation references, not independent evidence.
