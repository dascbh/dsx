---
id: toast-duration
title: How long should a temporary notification stay on screen?
category: feedback
components: [toast, snackbar, temporary-notification]
type: contextual-decision
impact: medium
status: caution
evidence: moderate
wcag: ["2.2.1", "4.1.3", "2.1.1", "1.4.1"]
related: [toast-vs-inline-alert, success-confirmation, undo, retry]
---

# How long should a temporary notification stay on screen?

> **Rule:** A notification with an action, an important error or one-time information never disappears on its own; only short, low-impact messages can disappear, starting at 4 to 10 seconds and adjusted to the length of the text.

## Context

Temporary notices give quick feedback without cutting the flow. How long they stay on screen is a UX decision, not a universal value: it varies with the length of the message, the urgency, the expected action, the device and the chance of reviewing the information later.

If it disappears too soon, the message is lost to people who need more time to read or find it. If it stays too long, it covers controls and distracts. The risk grows when the toast is the only way to learn what happened or carries the only corrective action.

The 4 to 10 second range is an implementation reference from some systems, not a proven law. Validate it with content, device, assistive reading and testing with people.

## Decision

- **IF** the message is a simple success or short information, with no required action **THEN** use auto-dismiss.
- **IF** the text is short **THEN** start by testing between 4 and 10 seconds.
- **IF** the text is longer **THEN** increase the time or switch to a persistent message.
- **IF** the message has an action (undo, try again, review) **THEN** keep it until the action is taken or the message is dismissed.
- **IF** it is an error that requires correction, a critical or an emergency message **THEN** use no timer; use a persistent pattern.
- **IF** it is the only confirmation of an important action **THEN** do not put it on a timer.
- **IF** the information is relevant later **THEN** offer another way to look it up (notification center, state on the page, history).
- **IF** there are several messages in sequence **THEN** show one at a time, without restarting or cutting short the previous one's reading time.
- **ELSE** prefer a persistent message.

## When to use

- Auto-dismiss for a simple, low-impact success.
- Short information with no required action.
- Persistence when there is undo, try again or another action.
- Manual close always available.

## When to avoid

- Important errors → **use instead:** an inline message or persistent alert.
- The only confirmation of an action → **use instead:** a persistent state on the page.
- A message with a required action → **use instead:** a notification that stays until dismissed.
- Long text → **use instead:** an alert, inline message or page.
- The same duration for every text → **use instead:** a time set by the content.

## Do

- Set the time by the content.
- Start at 4 to 10 seconds for short messages.
- Keep actions available.
- Show one message at a time.
- Offer a close button.
- Allow looking up anything relevant later.

## Avoid

- A fixed time for everything.
- Making an error disappear.
- Hiding the only confirmation.
- Stacking notifications.
- An action that disappears before it can be used.
- Interrupting unnecessarily.

## Accessibility

- Do not use a timer for critical, emergency or decision-requiring messages.
- For information without an action, use a semantic status or log region, without moving focus (4.1.3).
- Messages with an action stay available to keyboard and screen reader until resolved or dismissed (2.1.1).
- Time limits must be possible to turn off, adjust or extend; a toast may disappear without that only when there is an equivalent alternative to look up the information (2.2.1).
- Focus must not get lost when the toast closes.
- Do not rely only on color or an icon (1.4.1).
- Test timing with keyboard, zoom, screen reader and larger text sizes.

## Microcopy

| Situation | Example |
|---|---|
| Brief success | "Changes saved." |
| With undo (stays until acted on) | "Conversation archived. Undo" |
| Session ended | "Your session ended due to inactivity. Sign in again" |
| Close | "Close notification" |

## Verification checklist

- [ ] Auto-dismissing toasts are short and low impact.
- [ ] Toasts with an action have no timer.
- [ ] Important errors do not use a temporary toast.
- [ ] The duration varies with the length of the text.
- [ ] There is a close button with an accessible name.
- [ ] Important information can be looked up later.
- [ ] Only one notification appears at a time.
- [ ] The toast uses role status or log and does not steal focus.
- [ ] Tested with keyboard, zoom and screen reader.

## Rationale

- WCAG 2.2, criterion 2.2.1 (Timing Adjustable): when a timer is acceptable.
- IBM Carbon, notification pattern, usage and accessibility: temporary toasts, persistent inline, no timer on critical ones.
- Material Design and Android Developers, snackbars: the 4 to 10 second reference, one at a time, indefinite duration with a close control.
- Atlassian Design, auto-dismissing flag: an implementation example (8 seconds), not a universal rule.
- Brazilian Government Digital Standard, message: avoid messages that disappear on their own.
- Adobe Spectrum, toast: a temporary, contextual message.
- Nielsen Norman Group, visibility of system status: timely feedback, with no universal number.
- Interaction Design Foundation and MeasuringU: low-interruption feedback and validating the duration with tests.
