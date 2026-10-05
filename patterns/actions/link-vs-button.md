---
id: link-vs-button
title: Link or button, which one should you use?
category: actions
components: [link, button]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["4.1.2", "2.1.1", "2.4.4", "2.4.7", "1.3.1"]
related: [link-text, button-text, link-in-new-tab, icon-only-button]
---

# Link or button, which one should you use?

> **Rule:** If the person is taken somewhere else, use a link (`<a href>`); if something happens where they are, use a button (`<button>`). Settle the semantics before the visuals.

## Context

Links and buttons can look alike, but appearance does not determine behavior. A link leads to a destination with a URL; a button triggers an action on the page, in a form or in another component.

Swapping semantics for styling or scripting convenience removes expected behaviors: opening in another tab, copying the address, using the context menu, responding to the right keys and being announced with the right role by screen readers.

Classify the intent of the interaction first. Appearance comes later and can be swapped without changing the element.

## Decision

- **IF** there is a destination that can be represented by a URL (page, section, file, email, phone) **THEN** use `<a href>`.
- **IF** the interaction submits, saves, deletes, opens a modal or menu, expands, toggles state or runs an operation **THEN** use `<button>`.
- **IF** navigation is the main call to action **THEN** keep `<a>` and style it as a button.
- **IF** the action is secondary **THEN** keep `<button>` and style it discreetly.
- **IF** the button is inside a form **THEN** use `type="submit"` to submit and `type="button"` for anything that must not submit.
- **IF** a visual component receives a URL **THEN** render a link underneath; **IF** it triggers an action **THEN** render a button.
- **ELSE** (in doubt) ask: "does this change place or change something here?"

## When to use

- Link: another page, a section of the same page, a document, a download, email, phone.
- Button: submit, save, delete, open a modal or menu, expand, toggle.

## When to avoid

- A button with JavaScript to navigate → **use instead:** `<a href>`.
- A link with `href="#"` to run an action → **use instead:** `<button>`.
- `role="button"` or `role="link"` as the first option → **use instead:** the native element.
- Choosing the element by appearance → **use instead:** choose by intent.

## Do

- Decide "destination or action" before choosing the component.
- Write text that says the destination or the result.
- Keep visible focus, states and feedback.
- Test copy address, open in new tab and context menu on links.
- Test the button with Enter and Space.

## Avoid

- Using a clickable div or span instead of a native element.
- Removing the focus outline to hide the difference.
- Vague labels like "click here" or "submit" without context.
- Distinguishing link and button by color or shape alone.

## Accessibility

- Native elements expose name, role, state and keyboard behavior (4.1.2, 2.1.1).
- A link activates with Enter; a button with Enter and Space.
- The link's purpose must be understandable outside the paragraph (2.4.4).
- Visible focus (2.4.7) and a logical order.
- Unavoidable custom controls require name, role, state and keys tested with assistive technology.

## Microcopy

| Situation | Example |
|---|---|
| Destination link | "View refund policy" |
| Action button | "Save changes" |
| Link styled as a button | "Go to dashboard" |
| Button that opens a modal | "Add member" |
| Avoid | "Click here" |

## Verification checklist

- [ ] The interaction was classified as destination or action.
- [ ] The HTML element matches that intent.
- [ ] Every link has an `href` with a real destination.
- [ ] Every button has the correct `type`.
- [ ] The text states the destination or result.
- [ ] The control works by keyboard.
- [ ] Links keep copy, new tab and context menu.
- [ ] No link uses `href="#"` for an action.
- [ ] Focus is visible.
- [ ] Appearance does not contradict semantics.

## Rationale

- MDN Web Docs (a and button elements): hyperlink with href, use of type and replacing fake links with buttons.
- W3C WAI-ARIA APG (Link Pattern) and technique H91: prefer native elements; a role brings no navigation behavior.
- GitHub Primer (Links and buttons): navigation versus action; a link that looks like a button is still a link.
- Adobe Spectrum (Link, Button): links in running text, visual hierarchy of buttons.
- GOV.BR Digital Standard (Button): keyboard, focus, touch area and the button tag.
