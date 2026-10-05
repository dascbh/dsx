---
id: applying-filters
title: Should filters apply automatically?
category: search-filters
components: [filter, filter-panel, apply-button, results-list]
type: contextual-decision
impact: medium
status: caution
evidence: strong
wcag: ["3.2.2", "4.1.3", "1.4.1", "2.4.7"]
related: [filter-structure, active-filters, no-search-results, date-range-filter]
---

# Should filters apply automatically?

> **Rule:** Update the list right away when the response is fast and the choice is simple; require "Apply" when there are several combined choices, a slow query or a panel that covers the results.

## Context

When a filter is checked, the interface can update the list immediately or wait for a confirmation. The first model gives instant feedback; the second lets the person compose several decisions before spending a query.

The choice depends on the number of criteria, the response time, the device and how easy it is to undo. On desktop, with filters and results visible together, immediate updating usually works. On mobile, a panel that hides the list calls for explicit confirmation to avoid successive reloads and loss of orientation.

Beyond performance, there is accessibility: an update that moves focus, scrolls the page or does not announce the new count hurts keyboard and screen reader users.

## Decision

- **IF** there are few criteria, a fast response and an effect that is easy to undo **THEN** apply automatically.
- **IF** the person picks options in several groups **THEN** use an "Apply filters" button.
- **IF** the query is heavy or the network is slow **THEN** use manual application.
- **IF** the filter panel covers the list (mobile) **THEN** use a confirmation with the count, such as "Show X results".
- **IF** desktop and mobile need different models **THEN** adopt a hybrid model and keep labels and states consistent.
- **IF** application is manual **THEN** separate "Apply", "Cancel" and "Clear", and distinguish pending choices from active ones.
- **IF** application is automatic **THEN** show loading, announce the new count and keep focus on the control that was used.
- **ELSE** start with automatic application and measure the response time with real data.

## When to use

- Automatic application: local, fast lists; a single simple choice.
- Manual application: panels with several categories, heavy queries, full-screen filters on mobile.

## When to avoid

- Updating on every tap in a complex panel → **use instead:** an "Apply" button.
- Requiring "Apply" for a single fast choice → **use instead:** immediate updating.
- Reloading the whole page without warning → **use instead:** updating only the results region.

## Do

- Measure the response time before deciding.
- Show the result count (or a preview) before applying.
- Allow removing a filter, clearing all and undoing.
- Preserve pending choices when the panel is closed and reopened.
- Test a slow network, an empty result and quick changes.

## Avoid

- Erasing choices when the panel closes without warning.
- Hiding pending filters.
- Shifting focus or the page position after the update.
- Using "Apply" without saying what will be applied.
- Switching models between devices without signaling the state.

## Accessibility

- Changing a filter must not cause an unexpected change of context (3.2.2).
- Announce "18 results found" or "No results" in a polite status region, without stealing focus (4.1.3).
- Controls with programmatic label, grouping and state; pending and active distinguishable without relying on color (1.4.1).
- "Apply", "Cancel" and "Clear" reachable by keyboard, with visible focus (2.4.7).
- Define where focus returns after applying or canceling.

## Microcopy

| Situation | Example |
|---|---|
| Confirmation with count | "Show 42 results" |
| Batch apply | "Apply filters" |
| Discard | "Cancel" |
| Clear | "Clear filters" |
| Automatic status | "18 results found" |
| No result | "No results. Remove a filter to widen the search." |

## Verification checklist

- [ ] The model (automatic or manual) matches the number of filters.
- [ ] The response time was measured with real data.
- [ ] Pending filters are separate from active ones.
- [ ] There is a result count or preview.
- [ ] The combination can be canceled and cleared.
- [ ] Focus stays on the control after the update.
- [ ] The change is announced in a status region.
- [ ] The flow was tested on a slow network and on mobile.
- [ ] The flow was tested with screen reader and keyboard.

## Rationale

- Baymard Institute: real-time filtering works on desktop; on mobile an explicit action with a count is preferred.
- IBM Carbon (Filtering, Disclosures): distinguishes instant updating from batch application and defines apply and clear buttons.
- WCAG 2.2: 3.2.2 (On Input) and 4.1.3 (Status Messages).
- W3C WAI technique ARIA22: role=status region for polite announcements.
- Red Hat PatternFly (Filters): filter combinations, count and mobile adaptation.
