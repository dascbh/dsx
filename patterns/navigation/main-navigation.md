---
id: main-navigation
title: How do you build clear main navigation?
category: navigation
components: [header, nav, menu, submenu, mobile-menu]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["2.4.1", "2.4.7", "1.3.1", "2.1.1", "1.4.4", "1.4.10", "3.2.3"]
related: [breadcrumbs, tabs, link-in-new-tab, pagination-vs-scroll]
---

# How do you build clear main navigation?

> **Rule:** Show few destinations at the first level, with labels in the audience's language, separated from actions, in a consistent position, with the current section indicated and operation that does not depend on hover.

## Context

Main navigation is the fixed group of links to the most relevant areas. It turns the information architecture into a structure the person recognizes, scans and reuses from page to page.

Being clear does not mean exposing everything at the same level. It means ordering by importance and by the users' language, separating navigation from actions and giving a predictable path to the areas behind the core tasks.

Vague labels, too many options and deep hierarchy increase effort and make destinations hard to predict. A menu that only works on hover, hides focus or closes at the slightest movement excludes people.

## Decision

- **IF** you are defining the items **THEN** start from the most used tasks and areas, not from the org chart.
- **IF** the first level has many items **THEN** group or demote: keep few relevant destinations (test to confirm the limit for your context).
- **IF** an item is an action (create, sign in, sign out, search) **THEN** take it out of the destinations group and treat it as a button or its own control.
- **IF** items are clearly related **THEN** use a submenu and keep the hierarchy short enough to predict the destination.
- **IF** the page belongs to a section **THEN** mark it as current, through text and structure.
- **IF** the screen is small **THEN** keep the essential destinations and make sure the menu can be opened, browsed and closed by touch and keyboard.
- **IF** the structure is vast **THEN** reinforce it with search, breadcrumbs, contextual links or index pages.
- **IF** an essential destination would need "More" or an icon without text **THEN** show it with text.
- **ELSE** keep position, names and behavior identical on every page.

## When to use

- Sites with several recurring areas.
- Products with tasks in distinct modules.
- Portals, intranets and large catalogs.
- Clearly distinct global and local navigation.

## When to avoid

- Main navigation for every action → **use instead:** dedicated buttons and action menus.
- Isolated pages at the same level as areas → **use instead:** grouping or contextual links.
- Essential categories under "More" → **use instead:** showing them with their own name.
- Deep, untested menus → **use instead:** a short hierarchy and breadcrumbs.
- Dependence on hover → **use instead:** opening by click, touch and keyboard.

## Do

- Use short, familiar labels.
- Indicate the current section.
- Preserve focus and state when navigating.
- Test paths with real tasks on desktop and mobile.

## Avoid

- Internal jargon.
- Crowding the first level.
- Icons without text for important destinations.
- Changing labels from one page to another.
- Treating the menu as decoration.

## Accessibility

- Use `<header>` and `<nav aria-label="Main navigation">`, with links in a list and a mechanism to skip repeated blocks (2.4.1).
- Several navigation regions get distinct accessible names.
- Links for destinations, buttons to open submenus with `aria-expanded`; current section with `aria-current="page"`.
- Do not apply `role="menubar"`, `menu` and `menuitem` to ordinary site navigation; those require application behavior.
- Visible focus, logical order, contrast, 200% zoom and reflow at 400% (2.4.7, 1.4.4, 1.4.10), keyboard and screen reader.
- Consistent navigation across pages (3.2.3).

## Microcopy

| Situation | Example |
|---|---|
| Region label | "Main navigation" |
| Current item | "Orders" (with current state) |
| Open submenu | "Open Products submenu" |
| Mobile menu | "Open menu" / "Close menu" |

## Verification checklist

- [ ] The main items represent important tasks and areas.
- [ ] The labels use language familiar to the audience.
- [ ] Navigation and actions are separate.
- [ ] The hierarchy has few, understandable levels.
- [ ] The current section is identified.
- [ ] Submenus work without depending on hover.
- [ ] Navigation works with keyboard and touch.
- [ ] The mobile menu keeps the essential destinations.
- [ ] There is search or a complementary route when the structure is large.
- [ ] The architecture was tested with real tasks.

## Rationale

- U.S. Web Design System (Header): main sections as links, short labels, no jargon.
- W3C WAI (menus tutorial and navigation design): semantics, states, keyboard, pointer, touch and consistency.
- W3C WAI, technique H101 and the navigation landmark: named regions for assistive technology.
- Baymard Institute (categories as main navigation on mobile): categories hidden under a generic item cause problems; an e-commerce finding.
- Nielsen Norman Group (menu design checklist): visibility, familiar labels, consistency and showing the current area.
- Brazilian Government Digital Standard (GOV.BR), Menu: menu variations at different resolutions.
