---
id: product-variants
title: "How do you show product variants: size, color and availability?"
category: ecommerce
components: [picker, swatch, radio-group, select, size-guide]
type: contextual-decision
impact: high
status: recommended
evidence: moderate
wcag: ["1.4.1", "2.1.1", "4.1.2", "1.3.1", "2.4.7"]
related: [dropdown, cart-edit-items, disabled-button, not-color-alone]
---

# How do you show product variants: size, color and availability?

> **Rule:** Show each variant dimension as a labeled group, recalculate the combination's availability after each choice and update the image, price, stock and purchase.

## Context

In a product with variants, the person chooses a combination, not a generic item. A T-shirt has size and color; a sneaker may have size, color and width. Availability belongs to the combination, not to each attribute in isolation.

The selector needs to answer three questions: which decisions exist, which values are available and what changes after the choice. If the relationship between color, size and availability is hidden, people try combinations, memorize states and keep rechecking whether they can buy.

The recommendation reduces uncertainty, but it should be adjusted to the catalog; it is not a universal rule.

## Decision

- **IF** a variant changes the item actually purchased **THEN** use a separate control for each dimension.
- **IF** there are few comparable options **THEN** show them directly (buttons, radio, swatches), without a menu.
- **IF** the set is large or the decision is secondary **THEN** use a select or search, keeping the central choices visible.
- **IF** availability depends on the combination **THEN** recalculate after each selection and distinguish selected, available, unavailable and loading.
- **IF** the combination changes the image, price, stock or delivery **THEN** update all of them together.
- **IF** an option is unavailable **THEN** do not present it as active; explain the state and offer a next step (notify when back in stock, another color).
- **IF** size and fit matter **THEN** offer a size guide that preserves the current selection when it opens and closes.
- **IF** the initial combination is unavailable **THEN** do not leave it as the default.
- **IF** a listing shows variants of the same product **THEN** group them into one item when that makes it easier to read.
- **ELSE** one labeled group per dimension.

## When to use

- A variant changes the purchased item.
- Availability varies between combinations.
- A few values need to be compared before deciding.
- The image, price or delivery change with the variant.
- A listing mixes variants of the same product.

## When to avoid

- A generic select hiding central choices → **use instead:** visible options per dimension.
- A swatch with no accessible name or color only → **use instead:** a swatch with a name and a selection indicator.
- Unavailable presented as active → **use instead:** a distinct unavailable state.
- Disabling without explanation → **use instead:** a state with a reason and a next step.
- Updating only the selector → **use instead:** update the whole page.
- An unavailable combination as the default → **use instead:** the first available combination.

## Do

- Use a visible label per group ("Color", "Size").
- Keep the selection made when the size guide opens and closes.
- Distinguish selected, available, unavailable and loading.
- Show the combination's state before allowing the purchase.
- Give each swatch an accessible name.
- Validate on mobile, with keyboard and with assistive technology.

## Avoid

- Forcing people to try invalid combinations to discover availability.
- Using only a line, color or icon to communicate state.
- Hiding critical values in menus unnecessarily.
- Silently clearing an earlier choice.
- Ambiguous names like "Option" when "Color" or "Size" are clearer.

## Accessibility

- Name, relationship and state identifiable by keyboard and assistive technology (4.1.2, 1.3.1).
- All functionality by keyboard, with visible focus and a predictable order (2.1.1, 2.4.7).
- Color is never the only means of distinguishing selection or unavailability (1.4.1).
- Single choice: radio group semantics; larger lists: a native select or a correct listbox.
- When states update, communicate the change without moving focus.

## Microcopy

| Situation | Example |
|---|---|
| Group label | "Size" |
| Swatch name | "Color: navy blue" |
| Unavailable | "M, unavailable in this color" |
| Next step | "Notify me when it's back" |
| Guide | "See size guide" |
| Combination notice | "Navy blue, size M: 3 in stock" |

## Verification checklist

- [ ] Each dimension has a group and a visible label.
- [ ] Important choices are visible when the quantity allows.
- [ ] The availability of the current combination is understandable.
- [ ] Unavailable options do not look active.
- [ ] Image, price, stock, delivery and the buy button reflect the selection.
- [ ] The state does not depend only on color.
- [ ] Each swatch has an accessible name.
- [ ] The size guide preserves the selection.
- [ ] It works by keyboard and on mobile.

## Rationale

- Baymard Institute, product page research, apparel and grouping variants into one listing item: friction when color, size and availability are hidden; e-commerce evidence, with the source's limitations.
- Selection component documentation of e-commerce design systems: an implementation reference, not a substitute for research.
- WCAG 2.2: use of color (1.4.1) and keyboard (2.1.1).
- W3C WAI-ARIA Authoring Practices, radio group pattern: single choice.
