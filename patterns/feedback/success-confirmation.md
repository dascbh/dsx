---
id: success-confirmation
title: How do you communicate a successfully completed action?
category: feedback
components: [toast, inline-message, confirmation-page, status-region]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["4.1.3", "1.4.1", "2.2.1", "2.1.1"]
related: [toast-vs-inline-alert, toast-duration, undo, temporary-failure, long-loading]
---

# How do you communicate a successfully completed action?

> **Rule:** Confirm only the real result, naming the action and the object, close to the context, with persistence proportional to the impact and without stealing focus.

## Context

A success message attests that the system finished an action and removes doubt about what happened. It matters more when the result does not show in the interface, involves submitting data or must serve as a receipt.

The feedback must reflect the true state. If the system only received the request and will still process it, write "Request received" or "Processing started", never "Done". Only show success when the responsible source confirms it.

Visibility of system status is a classic heuristic: people need to know whether the interaction was acknowledged and completed.

## Decision

- **IF** the change is already unmistakable in the interface itself **THEN** show no extra message.
- **IF** the action is simple and reversible **THEN** use a visible change on the component or a brief toast.
- **IF** the action happens in a form or an area of the page **THEN** use an inline message near that place.
- **IF** the result is a purchase, contract, registration or receipt **THEN** use a persistent page or section with a number, date, summary and next steps.
- **IF** the system only received the request **THEN** communicate "received" or "processing", not success.
- **IF** the operation is asynchronous **THEN** show separate states (sent, processing, done) and a persistent place to check later.
- **IF** there is a next step **THEN** say where to follow up or when to expect a response, and include an action only if useful ("View order").
- **IF** the message has an action **THEN** ensure another path to the same function in case the message disappears.
- **ELSE** use a short message naming what was done.

## When to use

- After submitting or saving data whose result is not visible.
- When an asynchronous operation finishes.
- When creating, updating or moving an item.
- After payments, registrations and requests.

## When to avoid

- A change that is already unmistakable → **use instead:** no message.
- Before the server confirms → **use instead:** a processing state.
- Every routine micro-interaction → **use instead:** feedback on the control itself.
- An important receipt in a toast → **use instead:** a persistent page.
- Promotional content in the confirmation → **use instead:** an objective message.

## Do

- Name the action and the completed object.
- Position it near where the action happened.
- Offer a receipt when needed.
- Keep it on screen long enough to read and act.

## Avoid

- Announcing success as soon as the button is pressed.
- Writing only "Success!".
- Relying on the color green.
- Using a modal when no decision is needed.
- Repeating the same message in several places.

## Accessibility

- A status region already in the DOM before the update (`role="status"`, with `aria-atomic="true"` if the whole message should be reread); do not move focus to a passive toast (4.1.3).
- If completion opens a new page, reflect the result in the title and the first heading.
- A message with an action accessible by keyboard; critical information does not depend on a short time (2.2.1).
- The result in text, not only green, an icon or animation (1.4.1); respect reduced motion.
- Do not over-announce routine successes.

## Microcopy

| Situation | Example |
|---|---|
| Edit | "Profile updated." |
| Upload | "File uploaded to Documents." |
| Received | "Request received. We'll email you when it's done." |
| Payment | "Payment approved. Order #4821." |
| Action | "View order" / "Download receipt" |

## Verification checklist

- [ ] The message only appears after confirmed completion.
- [ ] The result was not evident without it.
- [ ] It names the action and the object, without a generic "Success!".
- [ ] The format matches the task's impact.
- [ ] It sits close to the action's context.
- [ ] Receipts and next steps remain available.
- [ ] It does not rely only on color or an icon.
- [ ] The screen reader receives the state without focus changing.
- [ ] The display time allows reading and interaction.

## Rationale

- Nielsen Norman Group (visibility of system status): people need to know whether the interaction was acknowledged and completed.
- WCAG 2.2, criterion 4.1.3 (Status Messages): success, progress and errors announced without receiving focus.
- W3C WAI, technique G199: explicit confirmation after submission reduces checking effort.
- W3C WAI, technique ARIA22: `role="status"` and `aria-atomic` for announcements without moving focus.
- Baymard Institute (order confirmation): unclear confirmations make it harder to verify the purchase; checkout-specific evidence.
- IBM Carbon (notification), Material Design 3 (snackbar), Atlassian (flag), Adobe Spectrum (toast), Brazilian Government Digital Standard (Message): formats and proportionality of feedback.
