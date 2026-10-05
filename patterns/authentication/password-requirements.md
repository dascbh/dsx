---
id: password-requirements
title: How do you communicate password requirements?
category: authentication
components: [password-field, help-text, form]
type: recommendation
impact: critical
status: recommended
evidence: strong
wcag: ["3.3.8", "1.3.5", "1.4.1", "4.1.3", "3.3.2"]
related: [show-password, confirm-password, password-recovery, validation-timing]
---

# How do you communicate password requirements?

> **Rule:** Show the requirements next to the field before typing, favor length and blocking common passwords over arbitrary composition rules, and never prevent paste or password managers.

## Context

Password requirements are part of the task; they cannot be a surprise after submission. Without them in view, creating a password becomes trial and error, and the rejection arrives late without saying what to change.

Composition rules that look strict (mandatory uppercase, number, symbol) tend to produce predictable patterns and make passwords harder to remember. Length, blocking common or breached secrets and support for passphrases communicate the real policy better.

The interface must mirror exactly the policy enforced on the server.

## Decision

- **IF** the user creates or changes a password **THEN** show the requirements next to the field before any typing.
- **IF** the password is the only factor **THEN** require at least 15 characters; **IF** it is part of a multi-factor flow **THEN** the minimum can be 8 (NIST SP 800-63B-4 reference; adjust to the risk and the applicable regulation).
- **IF** a maximum is set **THEN** allow long passwords and passphrases, accept spaces and supported characters, and never truncate silently.
- **IF** the password is common, predictable or breached **THEN** block it and explain how to fix it, without revealing internal details of the rule.
- **IF** there is a composition rule **THEN** keep it only if there is a risk justification.
- **IF** there is feedback while typing **THEN** update each requirement individually (met / still missing) without interrupting the screen reader on every keystroke.
- **IF** the user pastes or uses a manager **THEN** accept it; offer a show/hide control.
- **ELSE** validate on the client, to guide, and on the server, to guarantee, applying the same policy.

## When to use

- Account creation and password change.
- Access recovery and invitations.
- Setting up a new authentication factor.
- A security policy change.

## When to avoid

- Feedback only after submission → **use instead:** requirements visible beforehand.
- A long list of technical rules → **use instead:** a clear minimum + blocking common passwords.
- A short or hidden maximum → **use instead:** a high, stated limit.
- An opaque strength meter → **use instead:** requirements in text.

## Do

- Separate what is required from optional tips.
- State the real limits (minimum and maximum).
- Allow paste and autofill.
- Offer show/hide password with an accessible control.
- Keep client and server on the same rule.

## Avoid

- Requiring character classes without a reason.
- Rejecting spaces unnecessarily.
- Blocking paste or password managers.
- Changing the rule only on the server.
- Logging the password in logs or analytics.

## Accessibility

- Visible label and accessible name; `autocomplete="new-password"` on creation.
- Associate the instructions with the field via `aria-describedby` (WCAG 3.3.2).
- Do not block paste or password managers (WCAG 3.3.8).
- States in text, not only color, icon or meter (WCAG 1.4.1); updates through a status region (WCAG 4.1.3).
- A show-password control with a name, a state and keyboard operation.

## Microcopy

| Situation | Example |
|---|---|
| Instruction | "Use at least 15 characters. Long phrases work well." |
| Requirement met | "Met: 15 or more characters" |
| Requirement pending | "Missing: at least 15 characters" |
| Common password | "This password is too common. Choose another one." |

## Verification checklist

- [ ] Do the requirements appear before typing?
- [ ] Is the minimum explicit?
- [ ] Does the maximum allow passphrases?
- [ ] Are common or breached passwords blocked?
- [ ] Does each requirement show its state in text?
- [ ] Do paste and password managers work?
- [ ] Is show/hide password operable by keyboard?
- [ ] Do client and server enforce the same policy?
- [ ] Is the password kept out of logs?

## Rationale

- NIST SP 800-63B-4: minimums of 15 and 8 characters depending on the factor, passphrases, blocking common secrets, no arbitrary composition.
- NIST 800-63 FAQ: fixed composition rules bring less benefit than expected.
- OWASP Authentication Cheat Sheet: length, blocking compromised passwords, strength as support.
- OWASP Password Storage Cheat Sheet: never store passwords in plain text.
- W3C WAI technique H100 and WCAG 2.2, 3.3.8 (Accessible Authentication): marked-up fields, no blocking of paste and password managers.
- Baymard Institute: inline validation with positive feedback before submission.
- Brazilian Government Digital Standard GOV.BR (Input): instructions and messages tied to the field.
