---
id: button-text
title: How do you write button text?
category: ux-writing
components: [button]
type: recommendation
impact: high
status: recommended
evidence: moderate
wcag: ["2.5.3", "2.4.6"]
related: [link-text, button-hierarchy, icon-only-button, confirm-deletion]
---

# How do you write button text?

> **Rule:** Start the label with a verb and name the result of the action; if someone could ask "send what?" or "continue where?", include the object or the destination.

## Context

The button label is part of the task's guidance. It must anticipate what happens when the control is used, without forcing the person to infer the effect from a generic word.

A short label is not the same as a vague label. The choice depends on what is visible on screen: the step of the flow, the affected object and the other actions nearby.

Generic labels push interpretation onto the user, slow down comparing actions and increase the chance of a wrong click. In lists with repeated buttons, a bare "Edit" or "Delete" is also not enough for people navigating with a screen reader.

## Decision

- **IF** the button starts an action or moves to a step **THEN** begin the label with a verb in the imperative ("Save", "Download", "Register"). pt-BR example: Portuguese uses the infinitive ("Salvar", "Baixar", "Cadastrar").
- **IF** the verb alone leaves doubt about the object or destination **THEN** add the complement ("Save changes", "Continue to payment").
- **IF** the real effect differs from the technical mechanics **THEN** name the effect ("Create account" instead of "Submit").
- **IF** two or more actions in the same group sound alike **THEN** set them apart ("Save draft" and "Publish", never two "Save").
- **IF** the button repeats in a list or table **THEN** include the object in the accessible name ("Delete monthly report").
- **IF** the step's title, instruction or feedback use a term **THEN** reuse exactly that term on the button.
- **ELSE** use the shortest label that still predicts the result, in sentence case.

## When to use

- Buttons that start an action or change step.
- Flows with save, review, pay or publish.
- Screens with several nearby actions that need to be told apart.
- Labels that must work outside the visual context, such as in a screen reader's elements list.

## When to avoid

- Labels such as "Action" or "Click here" → **use instead:** verb + object.
- "Submit" when the effect can be named → **use instead:** the name of the effect.
- "Continue" in a long flow with no destination → **use instead:** "Continue to <step>".
- Questions, slogans and decorative punctuation → **use instead:** a direct verb.

## Do

- Start with a verb (imperative in English, infinitive in pt-BR).
- Name the result and, when needed, the object.
- Use the same terms as the rest of the flow.
- Keep the label short, in sentence case.
- Test the label on its own, in a list of controls.

## Avoid

- Repeating the same label for different actions.
- Changing the button's term without changing it in the rest of the flow.
- Turning the button into an explanatory sentence.
- Using only symbols as the label.

## Accessibility

- Use the native `<button>` element for interface actions.
- The accessible name must contain the button's visible text (WCAG 2.5.3), so voice commands work.
- On repeated controls, add the object to the accessible name while keeping the visible words at the start.
- Validate keyboard, focus, loading states and the post-action message; a good label does not make up for a button without focus or feedback.

## Microcopy

| Situation | Example |
|---|---|
| Saving an edit | "Save changes" |
| Moving forward in checkout | "Continue to payment" |
| Creating an account | "Create account" |
| Draft vs. publishing | "Save draft" / "Publish" |
| Item in a list | "Delete monthly report" |

## Verification checklist

- [ ] Does the label start with a verb?
- [ ] Can someone predict the result without reading the screen's paragraph?
- [ ] Does no button use "Action", "Click here" or "Submit" when the effect can be named?
- [ ] Do nearby actions have distinct labels?
- [ ] Does the label use the same term as the step's title and feedback?
- [ ] Is the label in sentence case?
- [ ] Does the accessible name contain the visible text?
- [ ] Do repeated buttons have the object in the accessible name?

## Rationale

- W3C WAI-ARIA APG (accessible names and descriptions): prefer visible text, short and distinct names, most important words first.
- WCAG 2.2, criterion 2.5.3 (Label in Name): the accessible name contains the visible text.
- Baymard Institute: the programmatic name keeps the essence of the visible label; avoid "Apply" when the action can be automatic (checkout context).
- U.S. Web Design System: short text, sentence case, start with a verb.
- GOV.BR Digital Standard: a label is required on the button, verbs in the infinitive (Portuguese).
- Adobe Spectrum: labels as verbs, clear result, concise text.
- GOV.UK Design System: labels vary with the service's real behavior ("Continue" vs. "Confirm and send").
