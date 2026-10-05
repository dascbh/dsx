---
id: technical-error-code
title: Should technical errors show codes to the user?
category: feedback
components: [alert, error-message, copy-button]
type: contextual-decision
impact: medium
status: caution
evidence: moderate
wcag: ["3.3.1", "3.3.3", "4.1.3", "1.4.1"]
related: [helpful-error-message, ai-error-recovery, retry, temporary-failure]
---

# Should technical errors show codes to the user?

> **Rule:** Explain the impact and the next step first; show a code only as a secondary, labeled and copyable reference, when it helps support locate the occurrence.

## Context

An error code is an identifier for diagnosis, support and tracking. On its own, it does not say what the person can do. The right question is not whether codes are good, but whether this code helps this audience recover or ask for help.

For a general audience, the main message translates the impact and points to the safe action. Codes at the start of the message pull attention toward something most people cannot interpret.

Technical details can also reveal the implementation or make account enumeration easier. The solution combines clarity for the user, safe exposure and traceability for the team.

## Decision

- **IF** the error is simple and the user can fix it (field validation, for example) **THEN** show no code; explain the fix.
- **IF** the failure persists, affects many people or requires investigation **THEN** show a code as a secondary reference.
- **IF** there is no support channel or the code leads to no action **THEN** omit it.
- **IF** you show the code **THEN** place it after the message, with a label ("Reference code: 8F4K2") and a copy button.
- **IF** you generate the identifier **THEN** use a short, stable value with no sensitive data, correlated with internal logs.
- **IF** the operation may have completed **THEN** say how to check its status before suggesting a retry.
- **IF** the flow is authentication or account recovery **THEN** use a generic message that does not reveal whether an account exists or any internal rule.
- **IF** the audience is technical **THEN** you may offer expandable details ("Show details"), never a raw stack trace.
- **ELSE** keep technical detail in the logs only.

## When to use

- Support needs to locate the occurrence.
- A persistent or widespread failure.
- A support channel is available.
- A short code with no sensitive data.

## When to avoid

- Errors the person can fix alone → **use instead:** a message with instructions.
- Field validations → **use instead:** a message next to the field.
- Exposing a stack trace or internal system → **use instead:** logs.
- Authentication with an enumeration risk → **use instead:** a generic message.
- A message that disappears before it can be copied → **use instead:** a persistent message.

## Do

- Explain what did not happen and whether the operation completed.
- Point to the safe action.
- Label the code as a reference.
- Preserve the operation's state.
- Test the reference with the support team.

## Avoid

- Starting the message with the number.
- Showing a stack trace or internal data.
- Blaming the person.
- Asking for technical interpretation.
- Revealing valid accounts.

## Accessibility

- The code as selectable text, with an explicit label and adequate contrast (WCAG 1.4.1: do not rely only on color or an icon).
- A "Copy code" button with an accessible name, visible focus and a text confirmation.
- An informative failure in a status region without moving focus (WCAG 4.1.3); an urgent decision in a well-structured alert or dialog.
- A field-related error: identify the item and associate the message (WCAG 3.3.1, 3.3.3).

## Microcopy

| Situation | Example |
|---|---|
| Main message | "We couldn't save the file. Try again in a moment." |
| Reference | "Reference code: 8F4K2" |
| Copy | "Copy code" / "Code copied" |
| Support | "If the problem continues, give this code to support." |

## Verification checklist

- [ ] Does the message explain what happened?
- [ ] Is the safe action clear?
- [ ] Does the code have a real purpose?
- [ ] Does the code come after the main message and have a label?
- [ ] Can the code be copied by keyboard?
- [ ] Is the identifier free of sensitive data?
- [ ] Are stack traces and internal details kept out of the interface?
- [ ] Can support locate the occurrence by the code?
- [ ] Do authentication flows use a generic message?

## Rationale

- WCAG 2.2, 3.3.1 and 3.3.3: the error described in text and a correction suggested.
- OWASP (Error Handling Cheat Sheet and Improper Error Handling): no implementation details in the interface.
- IETF RFC 9457 (Problem Details): separate the API contract from what the user sees.
- Adobe Spectrum (writing errors): a code only when useful, at the end.
- IBM Carbon (Notification): a short title, a concise body, a resolving action.
- Atlassian Design System (error messages): explain, offer an alternative, reveal details progressively.
