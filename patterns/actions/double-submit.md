---
id: double-submit
title: How do you prevent repeated clicks while an action is loading?
category: actions
components: [button, form]
type: recommendation
impact: high
status: recommended
evidence: moderate
wcag: ["4.1.3", "2.1.1"]
related: [disabled-button, retry, success-confirmation, preserve-data-after-error]
---

# How do you prevent repeated clicks while an action is loading?

> **Rule:** Validate first; on the first valid submission, show processing on the button itself, ignore further activations of the same action and guarantee idempotency on the server.

## Context

When an action takes time, people click again to make sure the first click worked. In purchases, payments and saves this can duplicate records or charge twice.

The solution combines three layers: immediate feedback, a temporary block of that same activation and protection on the server. A visual block alone does not prevent resubmission through the network, a page reload or concurrency.

The pattern applies to actions with side effects. There is no need to lock every interaction after any click.

## Decision

- **IF** the action creates, saves, pays or publishes **THEN** apply the full pattern (feedback + block + idempotency).
- **IF** the data is still invalid **THEN** show the errors and do not enter the processing state.
- **IF** the submission is valid **THEN** mark the operation as pending and ignore further activations until the cycle ends.
- **IF** submission happens by click, Enter or Space **THEN** block on the form's submit event, not only on click.
- **IF** the action is a filter, tab, navigation or reversible without a duplicated effect **THEN** keep the control interactive.
- **IF** the operation fails **THEN** report the error, keep the data and re-enable retrying when it is safe.
- **IF** the operation can truly be interrupted **THEN** offer "Cancel"; **ELSE** do not offer it (stopping the wait does not undo what was sent).
- **ELSE** generate an idempotency key per operation attempt and send it to the server.

## When to use

- Form submission and record creation.
- Save, publish, buy, pay, confirm.
- Imports and exports.
- Any action whose response may look silent.

## When to avoid

- Blocking before validation → **use instead:** validate and only then block.
- Disabling permanently without explaining → **use instead:** a loading state with text.
- Only locking the button with no server protection → **use instead:** idempotency or deduplication.

## Do

- Keep the button in the same place, showing the loading state.
- Block only the action in progress.
- Keep the typed data during submission.
- End the cycle with explicit success or error.

## Avoid

- Using a fixed delay (blind debounce) as the only protection.
- Clearing the form during submission.
- Removing focus from the button for no reason.
- Conveying the state by color alone.

## Accessibility

- Use semantic `<form>` and `<button>` with a single submission path.
- Announce the state in a `role="status"` or `aria-live="polite"` region without moving focus (WCAG 4.1.3).
- Native `disabled` can take the button out of the tab order; `aria-disabled="true"` keeps focus but requires blocking in code.
- Do not block with `pointer-events: none`, color or opacity alone.
- Test Enter, Space, screen reader, zoom and reduced motion.

## Microcopy

| Situation | Example |
|---|---|
| Processing | "Saving…" |
| Payment | "Processing payment…" |
| Error | "We couldn't save. Your data was kept. Try again." |
| Success | "Changes saved." |

## Verification checklist

- [ ] Does validation happen before blocking?
- [ ] Does the first activation show immediate feedback?
- [ ] Are repeated clicks, Enter and Space ignored during the operation?
- [ ] Does the button stay in the same position?
- [ ] Does the data stay filled in?
- [ ] Does the server reject or deduplicate the repetition?
- [ ] Is the state announced without moving focus?
- [ ] After an error, can the person try again?

## Rationale

- Baymard Institute: double clicks produce identical submissions; combine an immediate block with back-end protection (forms and e-commerce context).
- Baymard Institute (Button Design): progress and disabled states.
- IBM Carbon: inline loading with the button disabled during the action.
- GOV.BR Digital Standard: loading state on the button.
- Adobe React Spectrum: a pending state that blocks activations and is announced.
- WCAG 2.2, 4.1.3 (Status Messages): waiting, progress and error as status messages.
- W3C WAI-ARIA APG (Button) and MDN (aria-disabled): semantics and limits of aria-disabled.
- Stripe (idempotent requests): an idempotency key against duplicated effects.
