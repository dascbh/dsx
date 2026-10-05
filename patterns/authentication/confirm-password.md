---
id: confirm-password
title: When should you ask for password confirmation?
category: authentication
components: [password-field, show-password, reauthentication, mfa]
type: contextual-decision
impact: critical
status: caution
evidence: strong
wcag: ["3.3.8", "1.3.5", "3.3.2"]
related: [show-password, password-requirements, password-recovery, preserve-data-after-error]
---

# When should you ask for password confirmation?

> **Rule:** Do not repeat the password field by default; use a single field with "show password" when creating a password, and reauthenticate only before sensitive actions.

## Context

"Confirm password" means two different things: typing a new password again to catch a typo, or proving identity again before a sensitive action. The rules differ and should not be mixed.

When creating or resetting a password, the second field adds effort and gets in the way of password managers. Repeating it does not produce a better password: people may paste the same value, repeat the same mistake or abandon the flow.

For critical changes, an open session does not prove that the person in front of the screen is the account holder. There, reauthentication proportional to the risk is what protects the account.

## Decision

- **IF** the person is creating or resetting the password **THEN** use a single field with a show/hide toggle, visible requirements and clear validation.
- **IF** testing shows relevant typing errors even with "show password" **THEN** add "Confirm new password".
- **IF** the action is sensitive (changing the password, primary email, recovery methods, MFA, financial data, permissions) **THEN** reauthenticate at the moment of the action.
- **IF** the account uses a password and the risk is moderate **THEN** ask for the current password.
- **IF** the risk is high **THEN** require an additional factor or phishing-resistant authentication.
- **IF** there was a recent strong authentication that is still valid **THEN** do not ask again.
- **IF** the action is routine and low risk **THEN** do not ask for credentials.
- **ELSE** a single password field.

## When to use

- Changing the password, the primary email or recovery methods.
- Turning off MFA or adding a trusted device.
- Viewing or changing highly sensitive data.
- High-impact transactions and permissions.
- After inactivity, account recovery or suspicious activity.

## When to avoid

- A mandatory second field on every sign-up → **use instead:** a single field with show password.
- Routine, low-risk actions → **use instead:** no additional verification.
- Right after a valid strong authentication → **use instead:** reuse the higher-trust session for a period.
- When the password is not the best factor → **use instead:** MFA or another factor.
- When repetition blocks password managers → **use instead:** a single field.

## Do

- Define the risk of the action before choosing the mechanism.
- Explain why before the field.
- Use separate labels for "Current password", "New password" and, only if essential, "Confirm new password".
- Allow pasting and support password managers.
- Validate the match without clearing what was typed.
- Show the error next to the field.
- Confirm the result and notify through a trusted channel after a critical change.

## Avoid

- Repeating the field by default.
- Blocking paste.
- Asking for the password too often.
- Confusing the current password with the new one.
- Relying only on the open session for critical actions.
- Clearing values after an error.
- Revealing credentials in messages.

## Accessibility

- Keep labels visible and specific; do not rely only on field position (3.3.2).
- Do not block copy, paste, autofill or password managers; authentication must not require memorizing or transcribing without an alternative (3.3.8).
- Use autocomplete="current-password" on the existing password and autocomplete="new-password" on the new password and its confirmation (1.3.5).
- Associate requirements and errors with the field and announce changes without interrupting typing.
- The show-password button needs a specific accessible name and must convey its state.
- Preserve focus and test with keyboard, screen reader, zoom, contrast and mobile.

## Microcopy

| Situation | Example |
|---|---|
| Reason for reauthentication | "For your security, confirm your current password to change your email." |
| Labels | "Current password", "New password", "Confirm new password" |
| Mismatch | "The passwords don't match. Check the new password and try again." |
| Button | "Confirm and change email" |
| After the change | "Password changed. We sent a notice to your email." |

## Verification checklist

- [ ] The flow distinguishes checking a new password from reauthenticating.
- [ ] Password creation uses a single field with show/hide, unless test evidence says otherwise.
- [ ] Reauthentication happens right at the sensitive action.
- [ ] The reason for the confirmation appears before the field.
- [ ] Paste and password managers work.
- [ ] The autocomplete values are current-password and new-password.
- [ ] A mismatch error does not clear the values.
- [ ] The show-password button has an accessible name and state.
- [ ] Critical changes produce a confirmation and a notification.

## Rationale

- GOV.UK Design System password input pattern: avoid the "confirm password" field, especially with show/hide.
- OWASP authentication and MFA guidance: require new authentication after risk events and before critical actions; require MFA for sensitive actions.
- NIST SP 800-63B, reauthentication: frequency and strength according to risk and assurance level.
- WCAG 2.2, criterion 3.3.8: authentication without requiring memorization or transcription.
- WCAG 2.2, criterion 1.3.5: identifiable input purpose (current-password, new-password).
- Adobe Spectrum, text field: requirements next to the field to reduce errors.
- Public documentation of large products on reauthentication mode and verification for sensitive actions: reauthenticate only when there is risk and keep temporary trust.
