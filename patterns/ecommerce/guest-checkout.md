---
id: guest-checkout
title: When should you offer guest checkout?
category: ecommerce
components: [checkout, account-selection, button, form]
type: recommendation
impact: high
status: recommended
evidence: moderate
wcag: ["3.3.2", "2.4.6", "2.4.3", "2.5.3"]
related: [cart-edit-items, address-by-postal-code, form-steps, password-recovery]
---

# When should you offer guest checkout?

> **Rule:** When an account is not essential to complete the purchase, offer "Continue as guest" explicitly and prominently at the start of account selection, and suggest creating an account only after the order is confirmed.

## Context

Guest checkout separates collecting the data the transaction requires from the decision to keep an account. The question is not whether the store should abolish accounts, but whether creating one must happen before or during the purchase for the person to finish.

Creating an account adds a decision and, in many flows, a password or verification that the order does not need. Checkout research reports difficulty when the guest option is discreet, sits below sign-in and sign-up, or only appears after the email.

There is also friction when the person chooses to continue as a guest and the flow asks them to sign up again.

## Decision

- **IF** an account is not indispensable to complete the purchase **THEN** offer guest checkout.
- **IF** there is account selection **THEN** put the guest option first, with prominence comparable to sign-in.
- **IF** the customer is returning **THEN** keep sign-in available, without requiring it of new customers.
- **IF** creating an account brings real value **THEN** offer it after the order is confirmed, explaining the benefits, without interrupting checkout.
- **IF** the account is essential to the service or there is a justified operational or regulatory requirement **THEN** explain at the start why it is needed and what data will be used.
- **IF** the person chose guest **THEN** do not ask for a password or sign-up in the middle of the flow.
- **IF** there is an error or the person comes back **THEN** preserve the data already entered.
- **ELSE** treat guest as the default path for one-off purchases.

## When to use

- One-off or infrequent purchases.
- Products that do not depend on an authenticated area.
- Stores where tracking, support and receipts work by email or order number.
- Mobile flows with limited attention and space.

## When to avoid

- The account is an essential part of the service → **use instead:** explain the need beforehand and ask only for the necessary data.
- A recurring relationship must exist before the transaction → **use instead:** a short sign-up at the start, with a justification.

## Do

- Use labels such as "Continue as guest" or "Buy without an account".
- State, when true, that the account can be created later.
- Keep sign-in accessible.
- Validate the decision in the context of the product, audience and business model.

## Avoid

- Requiring sign-up before checking whether it is necessary.
- Hiding the option in a low-prominence link.
- A vague label such as "Continue".
- Revealing the option only after the email.
- Claiming that guest checkout always increases conversion.

## Accessibility

- The label must make clear what happens on activation (3.3.2); "Continue" alone does not say where it leads.
- A control reachable by keyboard, with visible focus and a predictable focus order (2.4.3).
- An accessible name consistent with the visible text (2.5.3).
- Test with screen reader, zoom and a mobile viewport.

## Microcopy

| Situation | Example |
|---|---|
| Main option | "Continue as guest" |
| Sign-in | "I already have an account" |
| After purchase | "Want to save your details for next time? Create a password." |
| Account required | "This service needs an account. It takes less than a minute." |

## Verification checklist

- [ ] An account is really needed to complete this purchase.
- [ ] The guest option appears at the start of account selection.
- [ ] The label says what will happen.
- [ ] The option has prominence comparable to sign-in.
- [ ] It is possible to finish without creating a password.
- [ ] The offer to create an account appears only after the order is confirmed.
- [ ] Entered data remains after an error or a return.
- [ ] The flow works with keyboard, screen reader, zoom and on mobile.

## Rationale

- Baymard Institute (make guest checkout prominent; leave account creation for the confirmation step): difficulty with a discreet option and gains from postponing sign-up.
- Baymard Institute (research methodology): the basis of checkout usability tests; contextual evidence.
- W3C WAI, technique G131 and criterion 3.3.2 (Labels or Instructions): clear labels and instructions about the purpose of controls.
