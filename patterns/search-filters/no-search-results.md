---
id: no-search-results
title: What should you show when a search returns no results?
category: search-filters
components: [search-field, empty-state, filters, status-region]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["4.1.3", "3.3.1", "2.4.3"]
related: [empty-state, active-filters, retry, filter-structure]
---

# What should you show when a search returns no results?

> **Rule:** Keep the typed query, state clearly that there are no results and point to the most likely way forward, without moving focus.

## Context

With zero results, the person wants to know whether the content does not exist, whether the query was too narrow, whether filters are on or whether there was a technical failure. The state must not clear the typed text nor end the task.

Treat the absence of results as a recovery state. Search benchmarks show that "no results" pages with generic tips become dead ends, while suggestions tied to the query provide a next step.

Different causes call for different states: a filter combination with no match, a network failure and an empty database are not the same situation.

## Decision

- **IF** the search returns zero results **THEN** keep the text in the field, say "no results" and repeat the term in the message.
- **IF** there are active filters **THEN** list them and offer to remove them one by one and "Clear filters".
- **IF** the query seems to have a spelling mistake **THEN** suggest the likely spelling or broader terms and synonyms.
- **IF** there are alternatives truly related to the intent **THEN** show nearby categories or content.
- **IF** there is no relevant alternative **THEN** do not invent results to fill the screen.
- **IF** the request failed **THEN** show an error state with "Try again", not "no results".
- **IF** the search is still loading **THEN** show loading, not an empty state.
- **IF** suggestions could expose protected content or a sensitive record **THEN** omit them.
- **ELSE** offer "Clear search" and keep the field available.

## When to use

- Searches on sites, catalogs, libraries and knowledge bases.
- Free queries with varied terms.
- Filter combinations that can bring the result to zero.
- Remote searches that can be slow or fail.

## When to avoid

- A query still loading → **use instead:** a loading state.
- A technical failure → **use instead:** an error message with a retry.
- A small set → **use instead:** direct navigation instead of free search.

## Do

- Keep the query visible and editable.
- Say what happened and what to try next.
- Allow removing filters right in the empty state.
- Keep search available on the screen.

## Avoid

- A blank screen with no explanation.
- Clearing the typed term.
- Generic tips unrelated to the query.
- Suggestions unrelated to the intent.
- Hiding the filters that caused the zero.

## Accessibility

- Search field with a visible label and the value preserved.
- Announce the result in a status region (for example, role="status", polite), without moving focus (4.1.3).
- The message does not rely only on color, icon or position.
- The keyboard reaches the field, the removable filters and the suggestions; visible focus preserved.
- Test with screen reader, zoom, reflow and mobile.

## Microcopy

| Situation | Example |
|---|---|
| Zero results | "No results for 'gaming chair'." |
| Tip | "Check the spelling or use broader terms." |
| With filters | "No results with the current filters. Remove a filter to see more." |
| Action | "Clear filters" |
| Failure | "Couldn't search right now. Try again" |

## Verification checklist

- [ ] The query stays visible in the field.
- [ ] The message says there are no results and quotes the term.
- [ ] The state distinguishes zero results, a restrictive filter and a technical failure.
- [ ] There is a clear recovery action (adjust, clear, try again).
- [ ] Active filters can be removed right in the state.
- [ ] Suggestions, when present, relate to the intent.
- [ ] The change is announced without moving focus.
- [ ] The flow works with keyboard and screen reader.

## Rationale

- Baymard Institute (mobile search and navigation; no-results page; e-commerce filters): generic tips become dead ends; contextual suggestions and filter removal help recovery.
- WCAG 2.2, criterion 4.1.3 (Status Messages): "no results" exposed without moving focus.
- W3C WAI (example with role=status in search results): communicating the count, including zero.
- W3C WAI, technique G161: spelling correction and synonyms broaden retrieval.
- IBM Carbon (search pattern): reference for search structure and feedback.
