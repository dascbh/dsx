---
id: monitoring-dashboard
title: Monitoring dashboard
summary: Overview screen that answers how things are and what needs attention now, with indicators, trends and a short list of pending items.
register: [operational]
when-to-use: IF the person needs to know the situation of a set and decide where to act first THEN use a monitoring dashboard
avoid-when: the person will act item by item on the whole list (use operational list), the numbers lead to no decision, or there is only one indicator
regions: [page-header, period-bar, kpi-strip, charts-area, pending-list]
primary-action: { region: page-header, position: top-right, max: 1 }
states: [loading, empty, no-data-in-period, partial, stale, error, no-access]
patterns: [date-range-filter, skeleton-screen, empty-state, temporary-failure, retry, not-color-alone, table-vs-cards, long-loading]
variations: [kpis-above-list, pending-first, dashboard-per-role]
rules: [T1, T3, T6, F1, F2]
---

# Monitoring dashboard

The entry screen of a module or a portfolio: how many orders are due this month, how many are waiting for a third party's answer, how volume evolved, what is late. Every number must answer "so what?" by leading to a filtered list where the person acts. A dashboard that only displays is decoration.

## When to use

- **IF** the person's question is "what needs me now" **THEN** the `pending-list` comes before the charts (`pending-first` variation).
- **IF** the question is "how are we doing" **THEN** indicators with a comparison (against the previous period or a target) and a trend.
- **IF** an indicator leads to no action **THEN** remove it or move it to a report; the dashboard has 3 to 6 indicators.
- **IF** each number has a list behind it **THEN** the number is a link to the `operational-list`, already filtered.
- **IF** different roles look at different things **THEN** use `dashboard-per-role`, not one dashboard with everything.
- **ELSE** (the person will work through the whole list) **THEN** start from the `operational-list` with counters on the filters.

## Region map

```
┌──────────────────────────────────────────────────────────────┐
│ page-header  Overview (h1)        Updated 09:12 [Action]       │
├──────────────────────────────────────────────────────────────┤
│ period-bar  [This month ▾]  compare with: previous month      │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│ kpi-strip                                                     │
│ Due this mon.│ Waiting      │ Late         │ Done            │
│ 18  ↑4       │ 7            │ 3 ▲ attention│ 42  ↓2          │
├──────────────┴──────────────┴──────────────┴─────────────────┤
│ charts-area      Volume per week  ▁▃▅▇▅▃                      │
├──────────────────────────────────────────────────────────────┤
│ pending-list   5 most urgent items · See all →                 │
└──────────────────────────────────────────────────────────────┘
```

## What goes in each region

- **page-header**: the `h1`, the time of the last data update and, if there is one, a primary (e.g. "New order"); export as secondary.
- **period-bar**: the period with shortcuts (today, 7 days, month, custom) and a comparison; the chosen period appears spelled out and applies to every block.
- **kpi-strip**: 3 to 6 cards: label, value, change with sign and text ("↑ 4 compared with the previous month"), an attention highlight with an icon besides color; each card is a link to the filtered list.
- **charts-area**: 1 or 2 charts that explain the trend; a title that states the reading, an axis with a unit, an accessible alternative table.
- **pending-list**: up to 5–10 most urgent items with the reason for the urgency and a direct action, plus "See all" for the full list.

## Actions

- **Primary:** at most one, in the `page-header`; many dashboards have no primary, and that is fine.
- **Navigation:** every indicator and every pending item leads to a work screen; the dashboard is not a dead end.
- **Actions on pending items:** one short action per item (open, follow up), never an embedded form.
- **Refresh:** a button to reload when the data is not real time, with the time visible.

## States

- **loading**: a skeleton per block; each block loads independently.
- **empty**: a new account or module with no data: explain what will show up and lead to the first productive action (import, create).
- **no-data-in-period**: there is data, just not in the chosen period: say so and suggest a longer period; never show zero as if it were a result.
- **partial**: one block failed and the others did not: the block shows its own error with "Try again"; the rest stay.
- **stale**: the data has a known delay (overnight processing, sync): show the reference time prominently.
- **error**: general failure: an alert on the page with "Try again"; the chosen period preserved.
- **no-access**: the role cannot see this dashboard or part of it: restricted blocks do not appear; a fully restricted dashboard explains whom to ask for access.

## Variations

### kpis-above-list
An indicator strip at the top, charts in the middle, pending items below.
**Favors:** management, reading trends, follow-up meetings.
**Worsens:** whoever needs to act scrolls until they find what to do.

### pending-first
The pending list at the top, compact indicators beside or below it.
**Favors:** operators; they open the dashboard to work.
**Worsens:** the trend view becomes secondary; managers lose context.

### dashboard-per-role
A different composition per role (operator, manager, curator), defined by the product, not assembled by the person.
**Favors:** each role sees what it decides on; less noise.
**Worsens:** more screens to maintain and test; whoever changes roles must relearn; requires knowing the roles precisely.

## Anti-patterns

- Twelve number cards with no link at all.
- Change conveyed only by green and red.
- Zero displayed when the data did not load.
- A decorative chart that answers no question.
- A different period in each block without saying so.
- A drag-to-customize dashboard as a substitute for knowing what the person needs.

## Checklist

- [ ] 3 to 6 indicators, each with a link to the filtered list.
- [ ] Change with sign, text and icon, not color alone.
- [ ] The period spelled out and shared by every block; update time visible.
- [ ] One block's failure does not bring down the others.
- [ ] `no-data-in-period` distinct from `empty`.
- [ ] Charts with a title that states the reading and a table alternative.
