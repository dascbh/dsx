---
id: icon-only-button
title: When can a button have only an icon, without text?
category: actions
components: [button, icon-button, tooltip]
type: contextual-decision
impact: high
status: caution
evidence: strong
wcag: ["1.1.1", "4.1.2", "2.4.7", "2.5.8", "1.4.11", "2.5.3"]
related: [icon-and-text-button, button-text, touch-target, link-vs-button]
---

# When can a button have only an icon, without text?

> **Rule:** Use an icon alone only for actions universally recognized in the context, always with an accessible name; if the icon needs explaining, keep the label visible.

## Context

Icons reduce density and speed up scanning in toolbars and recurring actions. But the same symbol can be read in different ways and loses meaning outside the context where it was learned.

The risk is not the icon itself but removing the label without checking whether the action stays clear for people who cannot see the symbol, zoom the screen, use voice commands or switch devices. Without an accessible name, the button is announced as an empty "button".

The cost rises when similar icons stand for different actions, when the action is destructive or when many compact controls sit side by side.

## Decision

- **IF** the action is familiar, the context explains it and the control has an accessible name **THEN** an icon alone is acceptable.
- **IF** the icon needs explaining before the person acts **THEN** keep a visible label.
- **IF** the action is new, rare or ambiguous **THEN** use icon with text.
- **IF** the action is destructive **THEN** use a visible label or a clear confirmation.
- **IF** the button repeats in a list **THEN** include the object in the accessible name ("Delete monthly report").
- **IF** the control is a toggle **THEN** expose its state (aria-pressed or equivalent).
- **IF** you use a tooltip **THEN** treat it as visual support, never as the only name.
- **ELSE** prefer visible text.

## When to use

- Close, search, media playback and other strong conventions.
- Compact toolbars with recurring actions.
- Icons with a well-established convention in the product itself.

## When to avoid

- New or infrequent actions → **use instead:** icon with text.
- An icon with more than one plausible interpretation → **use instead:** a visible label.
- The same icon for different actions → **use instead:** distinct icons and distinct names.
- Small, grouped controls → **use instead:** adequate spacing and touch area.

## Do

- Start by naming the action with a verb.
- Give an accessible name that describes the function, not the drawing.
- Keep visible focus, contrast and a pressed state.
- Hide a decorative icon next to a visible label from assistive technology.
- Test comprehension with people, without prior explanation.

## Avoid

- Writing "button" in the accessible name.
- Relying on a tooltip alone for the name.
- Hiding labels without validating.
- Shrinking the touch area to fit more icons.
- Removing the focus outline.

## Accessibility

- Every icon button needs a non-empty name (1.1.1, 4.1.2).
- Name via visually hidden text, aria-label or aria-labelledby.
- Visible focus (2.4.7), icon contrast (1.4.11) and enough touch area (2.5.8).
- If there is a visible label, the accessible name contains that text (2.5.3).
- A tooltip does not replace an accessible name: it covers neither touch nor screen readers.

## Microcopy

| Situation | Example |
|---|---|
| Accessible name for close | "Close" |
| Search | "Search" |
| List item | "Delete monthly report" |
| Save | "Save changes" |
| Tooltip | "Share" |

## Verification checklist

- [ ] The action is familiar in this context.
- [ ] The button has a non-empty accessible name.
- [ ] The name describes the action, not the drawing.
- [ ] Repeated controls have distinct names.
- [ ] Decorative icons next to text are hidden from assistive technology.
- [ ] Ambiguous or destructive actions have a visible label.
- [ ] The tooltip is not the only identification.
- [ ] Focus is visible.
- [ ] The touch area meets the project minimum.
- [ ] The control works with keyboard, zoom, touch and screen reader.

## Rationale

- W3C WAI-ARIA APG (accessible names and descriptions; Button pattern): name required, preference for visible text, aria-pressed.
- WCAG 2.2: 1.1.1, 4.1.2 and the rule for image buttons with a name.
- Baymard Institute: icons accompanied by text reduce ambiguity; buttons need intent, focus and touch area.
- GitHub Primer (Links and buttons): a visually hidden name on icon buttons.
- Apple Human Interface Guidelines (Buttons): function communicated by symbol, label or both.
- GOV.BR Digital Standard (Button): aria-label, tooltip, focus and minimum touch area.
