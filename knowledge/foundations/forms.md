# Forms

> **When to consult**
> - When creating, reviewing or trimming any form: sign-up, checkout, contact, settings, complex filter.
> - When deciding label vs. placeholder, validation timing, error position or splitting into steps.
> - When choosing the field type and mobile keyboard for each piece of data.
> - When there is abandonment, repeated errors or complaints about a "bureaucratic form".

A good form has a clear purpose, effort proportional to the benefit, guidance at the right moment and simple recovery. Every field is a cost to the person.

---

## 1. Structure: start with the task

Before designing, write down which task the person completes and which decision the system makes with the data. Then, for **each field**, ask:

- Which decision depends on this information?
- Can it be obtained later, with context and consent?
- Does the field reduce a real risk or serve an internal habit?
- Can the person answer without looking things up or interpreting technical terms?
- If the field disappears, what stops working?

IF the answer is vague THEN mark the field for removal or later collection.

**Structure rules**
- Group related fields according to the person's mental model (personal details, address, payment), with a group title when there are more than ~5 fields.
- Use **one column** for linear sequences. Exception: short, naturally linked pairs (city + state, expiry date + CVV).
- Field width suggests the length of the answer (short postal code, long address).
- Main action right after the last field, aligned with the reading column ([action-placement](../../patterns/actions/action-placement.md)).
- Explain why sensitive data is requested ("We only use your phone number to notify you about the delivery").

---

## 2. Field order

- Follow the order in which the person has the information (what they know by heart first, what they need to look up later) or the order of the physical documents they consult.
- From general to specific; from least to most sensitive.
- Fields that determine others come first (country before state; postal code before street, filling in the address automatically: [address-by-postal-code](../../patterns/ecommerce/address-by-postal-code.md)).
- Tab order = visual order.

See [field-order](../../patterns/forms/field-order.md).

---

## 3. Labels, help and required fields

- Label **visible, persistent and above the field** (better scanning and works on narrow screens). A placeholder never replaces a label: it disappears when typing, has low contrast and looks like a filled-in value ([label-vs-placeholder](../../patterns/forms/label-vs-placeholder.md)).
- Label programmatically associated with the control (`<label for>` or equivalent).
- Help text **before** the error: format, example, limit ("Up to 10 MB, PDF or JPG").
- Mark required fields consistently. IF most are required THEN mark the optional ones with "(optional)"; IF most are optional THEN mark the required ones. An asterisk needs a legend and accessible text ([required-fields](../../patterns/forms/required-fields.md)).
- Password requirements visible before typing and updated while typing ([password-requirements](../../patterns/authentication/password-requirements.md), [show-password](../../patterns/authentication/show-password.md)).

---

## 4. Field type

| Answer | Component |
|---|---|
| Yes/no with immediate effect | Toggle |
| Yes/no that applies on submit, or an acceptance | Single checkbox |
| 2–5 exclusive options | Visible radio buttons |
| 6–15 exclusive options | Select / dropdown ([dropdown](../../patterns/forms/dropdown.md)) |
| More than 15 options, or a value known by heart | Field with search/autocomplete |
| Several independent options | Checkboxes |
| Small quantity | Stepper or numeric field |
| Known date (birth date) | Text field with a DD/MM/YYYY mask (calendar only as support) |
| Upcoming date to choose (scheduling) | Calendar picker |
| File | Upload with accepted types and size declared ([file-upload](../../patterns/forms/file-upload.md)) |

**Rules**
- Do not use a select for 2–3 options; it hides the alternatives and costs two clicks.
- Allow manual typing where it is faster than the picker.
- Preselect a default only when it is neutral and the most likely; never for consent, extra charges or permissions.

---

## 5. Mobile keyboards and autofill

| Data | `type` | `inputmode` | `autocomplete` |
|---|---|---|---|
| Email | `email` | `email` | `email` |
| Phone | `tel` | `tel` | `tel` |
| CPF, CNPJ, CEP (Brazilian tax IDs and postal code), verification code | `text` | `numeric` | `postal-code` (CEP), `one-time-code` (code) |
| Monetary value | `text` | `decimal` | — |
| Whole quantity | `text` or `number` | `numeric` | — |
| URL | `url` | `url` | `url` |
| Search | `search` | `search` | `off` when using your own suggestions |
| Name | `text` | `text` | `name`, `given-name`, `family-name` |
| Address | `text` | `text` | `street-address`, `address-level2` (city), `address-level1` (state) |
| New / current password | `password` | — | `new-password` / `current-password` |
| Card | `text` | `numeric` | `cc-number`, `cc-exp`, `cc-csc`, `cc-name` |

**Rules**
- Do not use `type="number"` for identifiers (CPF, CEP, card): it strips leading zeros and responds to mouse scrolling.
- Masks must accept pasting with or without punctuation and must not fight the cursor.
- Disable autocorrect and auto-capitalization on email, username and codes (`autocapitalize="off"`, `spellcheck="false"`).
- Never block pasting into password or email fields.
- See [autofill](../../patterns/forms/autofill.md).

---

## 6. Validation

| Moment | Use for |
|---|---|
| On leaving the field (blur) | Default for format and consistency |
| While typing | Only to show positive progress (password requirements met, character counter), or to **remove** an error already shown as soon as it is fixed |
| On submit | Empty required fields, cross-field rules, server validation |
| Never | Flagging an error before the person finishes typing; validating on every keystroke with a negative message |

**Rules**
- Also validate on the server; client validation is a convenience.
- Be tolerant of input: accept spaces, punctuation and variations, and normalize them yourself.
- See [validation-timing](../../patterns/forms/validation-timing.md).

---

## 7. Errors

- Message **next to the field**, right below it, programmatically associated (`aria-describedby`), with icon + text + color (never color alone: [not-color-alone](../../patterns/accessibility/not-color-alone.md)).
- On submit with errors: a summary at the top with links to each field **and** a message on each field; move focus to the summary or to the first field with an error.
- The text says how to fix it: "Enter a date in the format DD/MM/YYYY", not "Invalid date".
- **Preserve everything** typed after any failure, including server failures (except password and card data when policy requires it).
- See [form-errors](../../patterns/forms/form-errors.md), [error-placement](../../patterns/forms/error-placement.md), [field-error-position](../../patterns/forms/field-error-position.md), [preserve-data-after-error](../../patterns/forms/preserve-data-after-error.md), [helpful-error-message](../../patterns/ux-writing/helpful-error-message.md).

---

## 8. Multi-step forms

**Decision**
- IF the form has up to ~7 fields on a single subject THEN one page.
- IF there are groups with distinct goals, conditional branches or more than ~10–12 fields THEN consider steps.
- IF a step does not have a nameable goal THEN do not split: splitting only adds navigation.

**Rules**
- Progress indicator with step names ("Address · Payment · Review"), not just numbers.
- 3–5 steps is the comfortable range; beyond that, revisit the scope.
- "Back" preserves the data; save progress between steps.
- A review step before actions with consequences (payment, official submission), with "Edit" on each block.
- Do not ask in step 1 for what will only be used in step 4.

See [split-form](../../patterns/forms/split-form.md), [form-steps](../../patterns/forms/form-steps.md), [autosave-vs-save](../../patterns/forms/autosave-vs-save.md).

---

## 9. Submission and confirmation

- The button names the action ("Request a quote", "Save address"), not "Submit".
- Avoid a disabled button with no explanation; prefer to keep it enabled and show the errors on submit ([disabled-button](../../patterns/actions/disabled-button.md)).
- After the click: processing state in the button and blocking of duplicate submissions ([double-submit](../../patterns/actions/double-submit.md)).
- After success: what was done, what happens now and where to follow up ([success-confirmation](../../patterns/feedback/success-confirmation.md)).
- Password or email confirmation (repeat entry) only when the error is costly and there is no easy recovery ([confirm-password](../../patterns/authentication/confirm-password.md)).

---

## 10. Accessibility

- Every control has an accessible name equal to, or containing, the visible label.
- Radio/checkbox groups in a `fieldset` with a `legend`.
- Visible focus on all fields ([keyboard-focus](../../patterns/accessibility/keyboard-focus.md)); logical focus order.
- Instructions do not depend only on color, icon or position ("the fields in red").
- Works with keyboard, 200% zoom, screen reader and at 320 px width.
- Session timeout announced with an option to extend ([session-expired](../../patterns/authentication/session-expired.md)).

---

## 11. Anti-patterns

- Placeholder as label.
- Fields "because we always ask".
- Aggressive validation on every keystroke.
- Errors only by color or only at the top.
- Clearing the form after an error.
- A disabled button that does not say what is missing.
- Pre-checked consent or extra service ([dark-patterns.md](dark-patterns.md)).
- Costs or terms that only appear in the last step.
- Captcha before any less invasive alternative.

---

## 12. Metrics

Start → completion rate; abandonment per step and per field; number and type of validation errors; completion time and time spent correcting; duplicate submissions; support contacts; quality of the data received. Combine with observation: the funnel shows **where** people drop off, conversation shows **why**.

---

## Audit checklist

- [ ] Each field has a decision that depends on it; none can be collected later.
- [ ] One column for linear flows; titled groups; logical order equal to tab order.
- [ ] Visible labels, above the field, associated with the control; placeholder only as an example.
- [ ] Format and requirements shown before the error; required/optional marked consistently.
- [ ] Field type suited to the number of options; no select for 2–3 options.
- [ ] Correct `type`, `inputmode` and `autocomplete`; pasting allowed; tolerant masks.
- [ ] Validation on blur or on submit, never flagging errors while typing.
- [ ] Errors next to the field, with fix text, not relying on color; summary on submit; focus moved.
- [ ] Data preserved after any failure.
- [ ] Steps only when each has a goal; named progress; back without losing data; review before acting.
- [ ] Button with verb + object, processing state, no duplicate submission.
- [ ] No consent, cost or service preselected or hidden.
- [ ] Works with keyboard, screen reader, 200% zoom and 320 px.
