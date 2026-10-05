---
id: cart-edit-items
title: How do you change quantities and remove items in the cart?
category: ecommerce
components: [cart, stepper, number-field, icon-button]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["2.5.8", "4.1.3", "4.1.2", "1.4.1"]
related: [undo, guest-checkout, product-variants, confirm-deletion, touch-target]
---

# How do you change quantities and remove items in the cart?

> **Rule:** Offer a stepper (plus and minus) with a number field when the range is wide, update totals without an "Update" button, and make removal explicit and reversible.

## Context

The cart is the review step before checkout. Changing quantities and removing items sound trivial, but poor selectors, stale totals and ambiguous controls lead to wrong orders and abandonment.

Applied e-commerce research found difficulty with selectors based only on an open field or a dropdown. Immediate updates, adequate targets and recovery after removal reduce friction and keep quantity, subtotal and total consistent.

## Decision

- **IF** the typical quantity is small and frequent **THEN** use increase and decrease buttons.
- **IF** large quantities are plausible **THEN** combine the buttons with an editable number field and a numeric keyboard on mobile.
- **IF** the person changes the quantity **THEN** update the item, subtotal, discount, shipping and total without an "Update cart" button.
- **IF** the quantity is 1 and the person decreases it **THEN** remove the item or clearly lead to removal; do not disable the button.
- **IF** removal is reversible **THEN** remove without a blocking dialog, show a confirmation and offer "Undo".
- **IF** removal affects a bundle, discount, subscription or shipping **THEN** explain the effect beforehand or in the confirmation.
- **IF** the quantity violates stock, minimum, maximum or multiple **THEN** validate and show the limit on the item itself.
- **IF** the update is asynchronous **THEN** show loading and prevent duplicate actions.
- **IF** the update fails **THEN** restore the previous value and offer to try again.
- **ELSE** also keep a visible "Remove" button to make it easier to discover.

## When to use

- Carts with editable quantities before checkout.
- Mini carts and shopping lists with direct editing.
- Recurring purchases or purchases of several units.

## When to avoid

- A stepper alone with a very wide range → **use instead:** validated direct input.
- A long dropdown for common quantities → **use instead:** a stepper and field.
- A blocking confirmation on every reversible removal → **use instead:** undo.

## Do

- Select the current value when the field gets focus, to make replacing it easier.
- Provide large, well-spaced controls, and removal in a predictable place.
- Communicate success or error on the item itself.

## Avoid

- An "Update cart" button as the only way to confirm.
- A free field with no limits or validation.
- Silent removal or stale totals.
- Small, cramped controls.

## Accessibility

- Native buttons with specific names: "Increase quantity of [product]", "Decrease quantity of [product]", "Remove [product]".
- An editable field with a programmatic label, current value, minimum, maximum and invalid state; preserve keyboard and arrow keys.
- Targets of at least 24 × 24 CSS px, or with spacing that compensates (2.5.8).
- Communicate total changes, removal, undo and errors as status messages, without moving focus (4.1.3).
- Do not rely only on color.

## Microcopy

| Situation | Example |
|---|---|
| Removal | "Blue T-shirt removed from your cart." |
| Undo | "Undo" |
| Stock limit | "We only have 3 units available." |
| Multiple | "This item is sold in boxes of 6." |
| Failure | "We couldn't update the quantity. Try again" |

## Verification checklist

- [ ] There are increase and decrease buttons and, if needed, a number field.
- [ ] The current quantity can be replaced without concatenating digits.
- [ ] Item, subtotal and total update together, without a separate button.
- [ ] Decreasing at 1 does not become a dead end.
- [ ] Removal has feedback and an undo option.
- [ ] Stock, minimum, maximum and multiple limits are validated.
- [ ] Loading and error states prevent duplicate actions.
- [ ] Controls have adequate accessible names, focus, target and contrast.

## Rationale

- Baymard Institute (cart and quantity changes): difficulty with an open field and a dropdown; immediate updates and recovery.
- WCAG 2.2, criterion 2.5.8: minimum target size.
- WCAG 2.2, criterion 4.1.3: status messages.
- W3C WAI-ARIA APG (Spinbutton): keyboard behavior for numeric input.
- E-commerce platform design systems (stepper and icon button): implementation examples, not independent evidence.
