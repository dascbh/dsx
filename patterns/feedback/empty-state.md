---
id: empty-state
title: How do you design good empty states?
category: feedback
components: [empty-state, illustration, button, list, table]
type: recommendation
impact: medium
status: recommended
evidence: moderate
wcag: ["1.1.1", "1.3.1", "2.1.1", "2.4.7", "1.4.3"]
related: [no-search-results, active-filters, temporary-failure, skeleton-vs-spinner, retry]
---

# How do you design good empty states?

> **Rule:** Identify why the area is empty, explain it in a short title plus one sentence of context, and offer a single primary action consistent with that cause.

## Context

An empty state appears when an area has no content yet: first use, a search with no results, a completed task, missing permission or a temporary failure. Each cause calls for a different next step, so one message does not fit them all.

"No items" can mean no data, a restrictive filter, an error, a permission block or finished work. An empty screen with no explanation looks broken or like a dead end.

The message should say what the person sees, what it means and what to do next. There is no single layout; the choice varies with the cause, the task and the product context.

## Decision

- **IF** it is the first use **THEN** explain what the area is for and invite the person to start ("Create first item").
- **IF** search or filters brought the result to zero **THEN** preserve the query and offer to edit the terms or "Clear filters".
- **IF** there is no data yet but it will come after an action or integration **THEN** describe what will appear and when, without suggesting an error.
- **IF** there was an error or unavailability **THEN** use a failure message with "Try again"; do not present it as an empty collection.
- **IF** the person has no permission **THEN** explain the restriction without exposing data and say how to request access.
- **IF** the task was completed or the area was cleared **THEN** confirm the result and suggest a next step only if relevant.
- **IF** the content is just loading **THEN** use a loading state, not an empty one.
- **IF** there are several possible actions **THEN** highlight one primary action and demote the others.
- **ELSE** write a specific title and text that adds context without repeating it.

## When to use

- An area with no data or content.
- Search or filters with no results.
- A completed task or a cleared area.
- Content unavailable because of an error, permission or configuration.
- A first use that needs guidance.

## When to avoid

- Content exists and is loading → **use instead:** a skeleton or spinner.
- A failure occurred → **use instead:** an error message with recovery.
- A message that only says "Nothing found" → **use instead:** the cause plus a next step.
- Competing actions with no priority → **use instead:** one primary action.
- An illustration as the only explanation → **use instead:** text as the carrier of the information.

## Do

- Name the state with a short, specific title.
- Tie the action to the cause.
- Preserve search and filters.
- Treat decorative images as decorative.

## Avoid

- Writing only "No data".
- Blaming the person.
- Confusing an error with absence of data.
- Generic links unrelated to the intent.
- Repeating competing actions.

## Accessibility

- The title as a heading, associated text and an action with a clear label (1.3.1); the explanation comes before any empty table or list.
- A decorative image with an empty alternative; an informative image with an equivalent alternative (1.1.1).
- Sufficient contrast (1.4.3), visible focus (2.4.7) and full keyboard operation (2.1.1).
- Test with zoom and a screen reader in the error, no-results and no-permission cases.

## Microcopy

| Situation | Example |
|---|---|
| First use | "You don't have any projects yet. Create the first one to organize your tasks." |
| Filters | "No results with these filters." + "Clear filters" |
| No permission | "You don't have access to this area. Ask your administrator for access." |
| Error | "We couldn't load the list. Try again" |
| Done | "All caught up. Nothing pending." |

## Verification checklist

- [ ] The reason for the empty state is clear.
- [ ] The text explains what should appear.
- [ ] There is one relevant primary action, with a clear verb.
- [ ] Error is separate from "no data".
- [ ] Search and filters offer recovery.
- [ ] The image is decorative or has an adequate alternative.
- [ ] The explanation comes before irrelevant content in reading order.
- [ ] It was tested with screen reader, keyboard and zoom.

## Rationale

- IBM Carbon (empty states): classifies them by cause and recommends explaining what, why and which action to take.
- Baymard Institute (no-results pages): a search with no alternative becomes a dead end; search and commerce context.
- Nielsen Norman Group (error message guidelines): understandable language and recovery guidance.
- Shopify Polaris and GitHub Primer (empty state): first use, absence and error with specific text and a primary action.
- Material Design (legacy) and the Brazilian Government Digital Standard (GOV.BR): the purpose of the empty state and guidance on the next action.
- WCAG 2.2 (W3C WAI): structure, keyboard and alternatives for non-text content.
