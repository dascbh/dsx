---
id: date-range-filter
title: How do you structure date range filters in dashboards?
category: data
components: [filter, date-range-picker, dashboard, card, chart]
type: contextual-decision
impact: high
status: caution
evidence: moderate
wcag: ["1.4.1", "3.3.1", "3.3.2", "4.1.2", "4.1.3"]
related: [applying-filters, active-filters, filter-structure, empty-state]
---

# How do you structure date range filters in dashboards?

> **Rule:** Always show, in text, the active range, what it controls, when the data was last updated and which cards fall outside the range.

## Context

The period defines the window in which every metric is read. Charts, cards, tables and alerts change meaning with the range, the granularity, the time zone and the time of the last update. That is why the period is part of the information's context, not just a calendar.

When the range is hidden or ambiguous, people compare numbers out of context, diagnose drops that do not exist, ignore partial data or assume every panel follows the same range. In sales, SLAs, incidents and logs this erodes operational trust.

This pattern applies to dashboards and analytical screens with several indicators. Form date pickers and generic filters have their own patterns.

## Decision

- **IF** time is the main reading dimension of the screen **THEN** use a global period filter at the top, with the active range written out.
- **IF** the filter controls all or nearly all panels **THEN** treat it as global; **IF** it controls only one section or card **THEN** place it next to that section.
- **IF** a card uses its own window **THEN** declare the exception inside that card.
- **IF** there are recurring periods **THEN** provide relative shortcuts (Today, Last 7 days, Last 30 days, This month) besides "Custom", and show the resulting effective dates.
- **IF** the task is investigating an incident, campaign, audit or period close **THEN** allow a custom range with validated start and end.
- **IF** the period can be shown in different units (day, week, month) **THEN** treat granularity as a separate control.
- **IF** the decision depends on recent data **THEN** show the last update.
- **IF** there is more than one time zone, account or region **THEN** state the time zone used.
- **IF** the query is heavy or several filters are combined **THEN** use an "Apply" button; **ELSE** apply automatically.
- **ELSE** use a default consistent with the task (e.g., last 30 days) and allow returning to it without clearing the other filters.

## When to use

- Dashboards and reports with indicators over time.
- Screens with cards, charts and tables that depend on a common window.
- Products with delayed, partial or updating data.
- Drill-down flows that inherit the period.

## When to avoid

- A global filter when each card has its own window → **use instead:** a local filter in each card.
- Automatic application on a heavy dashboard → **use instead:** an "Apply" button.
- A calendar icon with no text → **use instead:** a button with the range written out.

## Do

- Write the active range next to the control.
- Distinguish relative from fixed periods in the label itself.
- Label start and end fields separately, with the expected format.
- Allow clearing or restoring the default without silently removing other filters.
- Flag partial or delayed data.

## Avoid

- Comparing charts of different granularities as if they were equivalent.
- Mixing relative and fixed periods without explaining which one applies.
- Omitting the time zone in multi-region products.
- Duplicating misaligned period filters on the same screen.
- Signaling scope or error only by color.

## Accessibility

- The control needs a programmatic label, name, role and state (4.1.2).
- Start and end fields have their own labels, format and specific errors (3.3.1, 3.3.2).
- Do not use color alone to mark the active period or an out-of-scope card (1.4.1).
- Announce loading, updates and errors through a status region, without moving focus (4.1.3).
- With manual application, indicate whether there are changes not yet applied.

## Microcopy

| Situation | Example |
|---|---|
| Active range | "Last 30 days (Sep 02 – Oct 01)" |
| Custom shortcut | "Custom" |
| Last update | "Updated today at 2:05 PM (Brasília time)" |
| Card with an exception | "This chart uses the current month" |
| Invalid date | "The end date must be after the start date." |
| Manual button | "Apply period" |

## Verification checklist

- [ ] The active period appears in visible text.
- [ ] It is clear whether the period is relative or fixed.
- [ ] The filter's scope (global or local) is explicit.
- [ ] Cards with their own window declare that window.
- [ ] There is a default value and a way to restore it.
- [ ] The custom range validates start, end and invalid dates.
- [ ] Granularity is a control separate from the period.
- [ ] The last update appears when the decision depends on recent data.
- [ ] The time zone appears when there is more than one region or team.
- [ ] The application mode (automatic or manual) matches the cost of the query.
- [ ] Labels and messages work with keyboard and screen reader.

## Rationale

- Dashboard filter documentation of analytics tools (Metabase, Looker Studio, Tableau): global, section and card scope; relative versus fixed dates.
- Observability dashboard documentation (Grafana): time picker, time zone, refresh and preserved period.
- IBM Carbon (Date picker, Data table): labels, date format, keyboard and time zone.
- GOV.UK Design System (Date input): fieldset, hint and specific error messages.
- WCAG 2.2: labels and instructions (3.3.2), non-exclusive use of color (1.4.1), name-role-value (4.1.2), status messages (4.1.3).
- Visual analytics research (Heer and Shneiderman; Hochheiser and Shneiderman): dynamic filters and range queries on time series.
