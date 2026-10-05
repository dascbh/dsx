---
id: confirm-ai-action
title: When should you ask for confirmation before an action executed by AI?
category: ai
components: [modal, button, action-summary]
type: contextual-decision
impact: high
status: recommended
evidence: moderate
wcag: ["3.3.4", "2.4.3", "4.1.3", "1.4.1"]
related: [confirm-action, destructive-action, review-ai-output, ai-error-recovery, undo]
---

# When should you ask for confirmation before an action executed by AI?

> **Rule:** The AI prepares the action without executing it; ask for explicit confirmation immediately before any relevant, external, destructive, financial or hard-to-reverse effect, showing the target, scope and consequence.

## Context

An AI may only suggest, but it may also send messages, publish, delete data, change permissions, run commands or buy things. In those cases, the system's intent is not the person's authorization.

Confirmation hands control back at the point where a suggestion becomes an effect in the world. It reduces mistaken commands, misinterpretations and misuse of permissions, but it does not make the action safe on its own: combine it with clear scope, appropriate permissions, logging and recovery.

Nor should it interrupt low-risk tasks at every interaction.

## Decision

- **IF** the action sends something to third parties, publishes, deletes, buys, changes permissions, runs commands or deploys **THEN** require confirmation before the effect.
- **IF** the action affects another person or an external system **THEN** require confirmation.
- **IF** the output is purely informational, an unsent draft, a reversible local edit or low-risk formatting **THEN** do not ask for confirmation.
- **IF** you ask for confirmation **THEN** show a short summary: target, scope, content or command, and main consequence.
- **IF** the button confirms **THEN** use an explicit verb ("Confirm send", "Publish", "Run command"); never "Continue".
- **IF** reviewing reduces the risk **THEN** allow the proposal to be edited before confirming.
- **IF** the impact is high (destructive, financial, permissions, sensitive data) **THEN** increase clarity and friction; **ELSE** keep it light.
- **IF** it is a batch explicitly authorized in a safe automation **THEN** skip item-by-item confirmation.
- **IF** the action was executed **THEN** show the result and offer undo or recovery when technically possible.

## When to use

- Messages, emails and invitations to third parties.
- Publishing or changing public content.
- Deletion or hard-to-reverse changes.
- Purchases and transactions.
- Commands, scripts, commits and deploys.
- Permissions, settings and sensitive data.

## When to avoid

- Purely informational responses → **use instead:** show them directly.
- Unsent draft → **use instead:** an editable preview.
- A modal for every suggestion → **use instead:** confirm only at the point of effect.

## Do

- Put the action verb on the button.
- Visually separate preview from execution.
- Allow cancelling without losing the work.
- Log and display the result.

## Avoid

- Executing before confirmation.
- Asking for confirmation after the effect.
- Preselecting confirmation for a high-impact action.
- Hiding cancel.
- Repeating confirmations in a low-risk flow.

## Accessibility

- Modal with an accessible name; title and message announced.
- Focus enters the modal, goes to the safe action or the first relevant control, does not escape; Esc cancels; focus returns to the trigger (WCAG 2.4.3).
- Critical information in text, not color or icon alone (WCAG 1.4.1).
- Announce execution state and result (WCAG 4.1.3).
- Edit and review fields accessible by keyboard and screen reader.

## Microcopy

| Situation | Example |
|---|---|
| Summary | "Send an email to 3 customers with the subject 'Revised proposal'." |
| Button | "Confirm send" |
| Cancel | "Go back and edit" |
| Result | "Email sent. Undo" |

## Verification checklist

- [ ] Does the AI show exactly what it will do?
- [ ] Are target, scope and consequence clear?
- [ ] Does confirmation happen before the effect?
- [ ] Does the button carry an explicit verb?
- [ ] Can the proposal be reviewed or edited?
- [ ] Does cancelling keep the work?
- [ ] Does friction vary with impact?
- [ ] Do the result and an undo option appear after execution?
- [ ] Does the flow work with keyboard and screen reader?

## Rationale

- Microsoft Fluent 2 (Responsible AI): human control over AI actions.
- IBM Carbon for AI: responsible AI patterns.
- Documentation of coding agents and assistants (agent mode, commands, security): approval before running commands with external effects.
- Public documentation on AI computer use: human approval for sensitive actions.
- WCAG 2.2, 3.3.4 (Error Prevention): reversal, checking or confirmation for controllable data.
