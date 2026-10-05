---
id: session-expired
title: How do you communicate an expired session?
category: authentication
components: [modal-dialog, status-message, timer, button]
type: recommendation
impact: critical
status: recommended
evidence: strong
wcag: ["2.2.1", "2.2.6", "4.1.3", "2.4.3", "2.1.1"]
related: [preserve-data-after-error, autosave-vs-save, temporary-failure, password-recovery, when-to-use-modal]
---

# How do you communicate an expired session?

> **Rule:** Warn before expiry with the remaining time and a "Stay signed in" action; after expiry, explain why, protect sensitive data and lead to reauthentication with a return to a safe context.

## Context

A session ends because of inactivity, because of a maximum limit in the security policy or because the risk changed. For the person, the problem is not only signing in again: silent expiry interrupts the task, wipes data and makes the product look broken.

The experience handles two moments. Before: warn with enough time and allow continuing when the policy permits. After: explain what happened, protect sensitive information and offer a direct path to authenticate and resume.

The limits live on the server. Browser-only control can be bypassed or fall out of sync, including across tabs.

## Decision

- **IF** the session is about to expire and can be extended **THEN** show a warning with the remaining time and the primary action "Stay signed in".
- **IF** the decision needs to interrupt the task **THEN** use an accessible modal; **ELSE** use a non-blocking warning.
- **IF** the warning has a countdown **THEN** base it on the real server deadline, synchronized across tabs.
- **IF** the person asks to continue **THEN** extend only after the server confirms; passive mouse movement or a background tab does not renew it.
- **IF** the session has already expired **THEN** replace the warning with a status message, hide sensitive data and lead to sign-in.
- **IF** there is unsent non-sensitive data **THEN** preserve it and restore the task after authentication, confirming what was recovered.
- **IF** the policy forbids extending **THEN** do not offer "Stay signed in"; warn about the deadline and guide the person to save.
- **IF** the deadline has nothing to do with security **THEN** remove it or allow extending it.
- **ELSE** also offer "Sign out now" when it makes sense.

## When to use

- Authenticated areas with an inactivity limit.
- Personal, financial or corporate data.
- Long forms and tasks.
- Shared devices.

## When to avoid

- No authenticated session → **use instead:** no warning.
- A deadline unrelated to security → **use instead:** remove the limit.
- Repeated warnings far from expiry → **use instead:** one warning at the right moment.
- Replacing autosave → **use instead:** save a draft and warn.

## Do

- Explain the reason, the consequence and what each action does.
- Offer "Stay signed in" as the primary action.
- Test with several tabs and connection speeds.
- Give enough time to people who need longer to read or type.

## Avoid

- Expiring silently or with a generic error.
- Relying only on the local timer.
- Announcing every second.
- Wiping work that is safe to keep.
- Stacking modals.
- Promising an extension that is impossible.

## Accessibility

- A modal with a name and description, initial focus on a safe action, focus trapped and an inert background; on close, return focus to a logical point.
- Warn about the time limit and allow extending it (2.2.1); allow reauthenticating without losing data (2.2.6).
- Keep the screen reader from rereading the countdown every second; announce at relevant intervals and once more when little time is left (4.1.3).
- Everything operable by keyboard, with no reliance on color.
- When the session expires, move focus to the status message and make the "Sign in again" button clear.

## Microcopy

| Situation | Example |
|---|---|
| Warning title | "Your session is about to expire" |
| Body | "For your security, you'll be signed out in 2 minutes. Continue?" |
| Primary action | "Stay signed in" |
| Exit | "Sign out now" |
| Expired | "Your session expired due to inactivity. Sign in again to continue." |
| Return | "We recovered what you had filled in." |

## Verification checklist

- [ ] The reason for expiry is explained.
- [ ] The warning appears before expiry, with time to respond.
- [ ] The countdown matches the server deadline.
- [ ] There is an action to continue and an explicit exit.
- [ ] Several tabs behave consistently.
- [ ] The expired state is different from the warning.
- [ ] Sensitive data disappears from the screen after expiry.
- [ ] The task comes back after authentication.
- [ ] Keyboard and focus work in the dialog.
- [ ] The screen reader does not announce every second.

## Rationale

- WCAG 2.2, criterion 2.2.1 (Timing Adjustable): turn off, adjust or extend non-essential time limits and warn in time.
- WCAG 2.2, criterion 2.2.6 (Timeouts): reauthenticate without losing data.
- OWASP (Session Management Cheat Sheet): limits enforced on the server, inactivity plus absolute duration, advance warning.
- NIST SP 800-63B-4: session limits and reauthentication proportional to risk.
- U.S. Web Design System (Modal): an expiring session as a modal case with a clear consequence and actions.
- Public-service design systems (inactivity timeout and timeout modal): the warn, extend and explain-after-expiry pattern.
