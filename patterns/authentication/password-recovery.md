---
id: password-recovery
title: How do you build a clear password recovery?
category: authentication
components: [forgot-password-link, identifier-field, code-field, reset-form]
type: recommendation
impact: critical
status: recommended
evidence: strong
wcag: ["3.3.2", "3.3.1", "1.4.1", "3.3.8", "2.1.1"]
related: [password-requirements, show-password, confirm-password, session-expired, form-errors]
---

# How do you build a clear password recovery?

> **Rule:** Put "Forgot password" near the sign-in, give a neutral response that does not reveal whether the account exists, send a single-use link or code with an expiry, and describe the next step and the alternatives.

## Context

Forgetting a password is an expected situation, not an exception. Recovery should give access back without treating the person as a suspect, without revealing whether an account exists and without creating a path weaker than the sign-in itself.

The flow describes the next step, relies on a channel already linked to the account and offers a way out when the message or code does not arrive. Security and clarity are designed together.

A loose flow invites account takeover; an opaque flow with no alternative locks out legitimate people and overloads support. In e-commerce research, delays, spam filters and failures in the recovery email caused significant abandonment among customers with accounts; the figure is contextual, but it reinforces the value of feedback and guidance.

## Decision

- **IF** the screen is the sign-in **THEN** place "Forgot password" next to the password field.
- **IF** the person enters their identifier **THEN** always reply with the same neutral message, whether the account exists or not.
- **IF** the flow starts **THEN** send a random, single-use link or code with a limited validity through the channel associated with the account.
- **IF** the token was used or expired **THEN** invalidate it on the server.
- **IF** there are attempts or resends **THEN** limit them to contain abuse.
- **IF** the account is higher risk **THEN** require a combination of factors that matches the impact.
- **IF** the email or code does not arrive **THEN** guide the person: check spam, wait, check the masked address, request a new code, contact support or use another method.
- **IF** it is the new-password screen **THEN** show the requirements before submission, accept paste and password managers, and say how to fix an invalid value.
- **IF** the change is complete **THEN** confirm it, notify the account and take the person to sign-in or back to the original task, when safe.
- **ELSE** never email the current password, a password hint or a temporary password.

## When to use

- Any account with a resettable password.
- Access that depends on email, phone, app or recovery code.
- Sign-in, sign-up and checkout, where the task can be interrupted.
- Products with MFA, with recovery that matches the risk.
- A person without access to the primary channel.

## When to avoid

- A signed-in person who can still change the password → **use instead:** change it in the account area.
- Sending the current password or a hint → **use instead:** a single-use link or code.
- Security questions as the only factor → **use instead:** the associated channel plus verification.
- Saying whether the identifier exists → **use instead:** a neutral message.
- Recovery weaker than authentication → **use instead:** an equivalent assurance level.

## Do

- Explain the next step on every screen.
- Preserve the original task to return to it later.
- Offer support or a safe alternative method.
- Notify the account of the reset.

## Avoid

- Predictable codes.
- Unlimited attempts.
- Making the person start over without guidance.
- Automatic sign-in by default after a reset.
- Messages that confirm registered accounts.

## Accessibility

- A link or button with a clear name, a persistent label and instructions linked to the field (3.3.2).
- A code readable by keyboard and screen reader that accepts paste; no reliance on color, position or image (1.4.1).
- The result in text, focus at a predictable point, without revealing account data.
- Errors identified in text and associated with the control (3.3.1).
- Do not require transcribing a code without allowing paste (3.3.8).
- Test with keyboard, screen reader, zoom, mobile, slow connections and people without access to the primary channel.

## Microcopy

| Situation | Example |
|---|---|
| Link | "Forgot password" |
| Neutral response | "If there is an account with this email, we'll send instructions in a few minutes." |
| Didn't arrive | "Didn't get it? Check your spam or request a new code." |
| Success | "Password changed. Sign in with your new password." |
| Notification | "Your password was changed. If this wasn't you, contact support." |

## Verification checklist

- [ ] "Forgot password" is next to the sign-in.
- [ ] The response does not reveal whether the account exists.
- [ ] The link or code is single-use, random and time-limited.
- [ ] There is a limit on attempts and resends.
- [ ] The current password is never sent.
- [ ] Security questions are not the only factor.
- [ ] The new password's requirements appear before submission.
- [ ] Code and password can be pasted.
- [ ] There is guidance for when the email or code does not arrive.
- [ ] The token is invalidated after use.
- [ ] The person is notified after the reset.
- [ ] The original task is preserved when possible.

## Rationale

- OWASP (Forgot Password Cheat Sheet): consistent response, protection against enumeration, random single-use tokens, expiry and abuse limits.
- NIST SP 800-63B-4 (account recovery): recovery as an operation with its own risk and notification after recovery.
- Baymard Institute (password requirements and destination after sign-in or reset): reset-email problems cause abandonment; preserve the original intent; e-commerce evidence.
- Brazilian Government Digital Standard (GOV.BR): varied recovery methods and human support when digital options fail.
- WCAG 2.2, criteria 3.3.2 and 3.3.1 (W3C WAI): labels, instructions and error identification in text.
