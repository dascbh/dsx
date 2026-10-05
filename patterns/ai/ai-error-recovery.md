---
id: ai-error-recovery
title: How do you offer recovery when the AI fails?
category: ai
components: [alert, button, error-message]
type: recommendation
impact: high
status: recommended
evidence: moderate
wcag: ["3.3.1", "3.3.3", "4.1.3", "1.4.1"]
related: [retry, ai-uncertainty, confirm-ai-action, technical-error-code, helpful-error-message]
---

# How do you offer recovery when the AI fails?

> **Rule:** Identify the step that failed, explain the cause in plain language, keep the request and the work, and offer at least one specific recovery action in the same context.

## Context

AI systems fail because of unavailability, usage limits, oversized input, an unreachable source, insufficient permission, an interrupted response or a tool error. Collapsing all of that into a generic notice leaves the person at a dead end.

The interface must explain in accessible language what failed and suggest a next step that fits the cause, without losing the work already done. When the action has an external effect, say whether something was executed, partly executed or never started, so that retrying does not duplicate it.

## Decision

- **IF** the failure is temporary or the response was interrupted **THEN** offer "Try again" or "Regenerate" next to the response.
- **IF** a usage limit or the context was exceeded **THEN** explain the limit and offer "Reduce files", "Start a new conversation" or waiting.
- **IF** the input is invalid **THEN** offer "Edit request", pointing out the problem.
- **IF** the source or connector failed **THEN** offer "Reconnect source" or reviewing permissions.
- **IF** an external action happened and its state is uncertain **THEN** report the state and do not offer a blind retry.
- **IF** it was partly completed **THEN** show what was done and allow review before retrying.
- **IF** retrying is not enough **THEN** offer an alternative (service status, permissions, support).
- **IF** there is a technical identifier **THEN** keep it in a secondary layer, never as the main action.
- **IF** the refusal is for safety or policy reasons **THEN** say so and allow the request to be adjusted; do not disguise it as a technical error.
- **ELSE** keep the prompt, attachments and context.

## When to use

- Interrupted generation of text, image, audio, code or analysis.
- Failure of a tool, agent, connector or integration.
- Usage limit, context overflow, capacity unavailable.
- Authentication, permission or connection failure.
- An action with an uncertain result.

## When to avoid

- Showing an error while the state is still loading → **use instead:** a loading indicator.
- "Try again" with a risk of duplicating an external effect → **use instead:** check the state first.
- A code as the only explanation → **use instead:** a contextual message with a secondary code.

## Do

- Name what failed.
- Use specific verbs on controls.
- Keep the recovery action next to the failure.
- Keep the request, files and work.

## Avoid

- "Something went wrong" on its own.
- An empty panel or endless loading.
- Automatically retrying an external action without clarifying its state.
- Forcing a restart when the context could be kept.
- A generic button with no clear consequence.

## Accessibility

- Error message in text with an accessible name (WCAG 3.3.1) and a correction suggestion (WCAG 3.3.3).
- Announce new failures in a suitable live region, without repeating on every irrelevant change (WCAG 4.1.3).
- Cause and next step in text, not color or icon alone (WCAG 1.4.1).
- Actions with explicit names and visible focus; do not move focus while a response is in progress.
- Keep typed content and attachments.

## Microcopy

| Situation | Example |
|---|---|
| Interrupted response | "The response was interrupted. Regenerate" |
| Limit | "The file is too large. Reduce its size or split it into parts." |
| Source | "We lost the connection to Drive. Reconnect" |
| Partial action | "2 of 5 emails were sent. Review before continuing." |

## Verification checklist

- [ ] Does the interface identify what failed?
- [ ] Is the cause in understandable language?
- [ ] Is there a recovery action in the same context?
- [ ] Does the control use a specific verb?
- [ ] Were the request, files and work kept?
- [ ] Is the state of any external action clear?
- [ ] Does retrying avoid duplicating effects?
- [ ] Is there an alternative when retrying does not help?
- [ ] Are technical details in a secondary layer?
- [ ] Is the error understandable without color or icon?

## Rationale

- Microsoft Fluent 2 (Responsible AI): communicate failures and keep control.
- IBM Carbon for AI: recovery patterns in AI experiences.
- Help documentation of AI assistants and coding tools: guidance on regenerating, reducing input, starting a new conversation and resending the question.
- AI connector documentation: reconnection and permissions.
