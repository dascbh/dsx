---
id: address-by-postal-code
title: How do you use the postal code to complete the address at checkout?
category: ecommerce
components: [postal-code-field, address-form, autocomplete]
type: recommendation
impact: high
status: recommended
evidence: moderate
wcag: ["1.3.5", "2.1.1", "3.3.1", "3.3.4", "1.4.1"]
related: [autofill, form-errors, guest-checkout, preserve-data-after-error]
---

# How do you use the postal code to complete the address at checkout?

> **Rule:** Ask for the postal code first, look it up once the value is complete, fill in only what the source returned and keep everything reviewable, editable and with a manual fallback.

## Context

In a Brazilian checkout, the postal code (CEP) is a good starting point to find the city, state, street and other data; the same applies wherever a postal code maps reliably to an address. People type less, especially on mobile. But the result is not always complete or correct for delivery: the house number, complement, unit or landmark may be missing.

Automation should speed up the task without hiding the decision. The person needs to recognize the address found, adjust any field, fill in the gaps and enter it manually if the postal code is not found.

In checkout tests, a relevant share of manually typed addresses had spelling or information errors; full automatic lookup was the most efficient solution where applicable.

## Decision

- **IF** the postal code is a reliable key for the territory served **THEN** ask for it at the start of the address block.
- **IF** the postal code has the full number of valid digits **THEN** trigger the lookup automatically, without a separate button.
- **IF** the user is still typing **THEN** do not look it up on every keystroke; wait for the complete value.
- **IF** the lookup returns an address **THEN** show it in an identifiable, editable group, and leave the number and complement blank for the person.
- **IF** the postal code is not found, is ambiguous or the lookup fails **THEN** keep the manual form and show an actionable message.
- **IF** the person changes or clears the postal code **THEN** preserve the number, complement and landmark.
- **IF** an address had already been entered **THEN** do not replace it silently.
- **IF** the country does not use this kind of postal code **THEN** use the local address format.
- **ELSE** validate the whole address before allowing the order to be placed.

## When to use

- There is a reliable lookup source for the area served.
- The response arrives quickly on the expected connection.
- The person can review the number and complement before finishing.
- The service handles absence, ambiguity and failure without blocking.

## When to avoid

- A lookup with low coverage and no simple correction → **use instead:** a complete manual form.
- Typing blocked until the API responds → **use instead:** fields that are always editable.
- Filling that overwrites data → **use instead:** fill only empty fields.
- A result not reviewed before an irreversible purchase → **use instead:** a review step.

## Do

- Label the field with the local name (e.g., "Postal code", or "CEP" in Brazil) with short help text if needed.
- Show separate states: loading, with result, no result and error.
- Preserve the typed value during the lookup.
- Test with keyboard, screen reader, autofill, mobile and slow connections.

## Avoid

- Moving automatically to the next step without room to review.
- A spinner that does not say what is being looked up.
- Removing the manual form when there is no result.
- Confusing a suggested address with a confirmed one.
- `type="number"` on the postal code (it drops leading zeros and gets in the way of masks).
- Showing only the API's technical error.

## Accessibility

- A visible label tied to each field; `autocomplete` tokens (`postal-code`, `address-line1`, `address-line2`, `address-level2`, `address-level1`, `country`) per 1.3.5.
- The postal code accepts paste and editing; the mask must not prevent that.
- The lookup is operable by keyboard (2.1.1) and states are announced without moving focus.
- Validation messages in text, identifying the problem and preserving valid data (3.3.1).
- Allow reviewing and correcting before a critical action (3.3.4).

## Microcopy

| Situation | Example |
|---|---|
| Label | "Postal code" |
| Looking up | "Looking up address…" |
| Not found | "We couldn't find this postal code. Enter the address manually." |
| Review | "Check the address and enter the number." |
| Failure | "We can't look it up right now. You can fill it in by hand." |

## Verification checklist

- [ ] The postal code is requested at the start of the address block.
- [ ] The lookup starts on its own once the value is complete.
- [ ] The address found is visible and editable.
- [ ] The number and complement are not filled in automatically.
- [ ] There is a manual fallback for absence, ambiguity and error.
- [ ] During loading, the postal code and already-filled data remain.
- [ ] The address is validated before the order is placed.
- [ ] Fields have visible labels and autocomplete tokens.
- [ ] It was tested on mobile, keyboard and screen reader.

## Rationale

- Baymard Institute (addresses at checkout): frequent failures in manual typing; full automatic lookup as the best option; detecting city and state from the postal code as an alternative; validating the address before placing the order.
- WCAG 2.2, criterion 1.3.5 (Identify Input Purpose): the field's purpose identified programmatically.
- WCAG 2.2, criteria 2.1.1 (Keyboard) and 1.4.1 (Use of Color): keyboard operation and information that does not depend on color.
- WAI (error prevention): allow reviewing and correcting before a critical action.
- Text field design systems of e-commerce platforms: a reference for labels, help and states, not proof of error reduction.
