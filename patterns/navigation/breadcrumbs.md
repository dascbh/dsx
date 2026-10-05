---
id: breadcrumbs
title: When should you use breadcrumbs?
category: navigation
components: [breadcrumbs, secondary-navigation]
type: recommendation
impact: medium
status: recommended
evidence: moderate
wcag: ["2.4.8", "2.4.4", "1.4.10", "2.4.7", "1.3.1"]
related: [tabs, main-navigation, pagination-vs-scroll, active-filters]
---

# When should you use breadcrumbs?

> **Rule:** Use breadcrumbs only when there is a real page hierarchy, and treat returning to the results as an action separate from the trail.

## Context

Breadcrumbs are secondary navigation that shows the page's position in the hierarchy and lets the person move up to broader levels. They do not replace the main menu and do not represent the path the person took.

There are two separate needs: the hierarchical trail, grounded in the content architecture, and the history-based return, such as "Back to results". In products with search, filters and entry from external links, mixing the two disorients the person.

The value shows up on internal pages reached directly, without going through the home page. In shallow structures, isolated pages or linear flows, the component becomes noise and suggests a hierarchy that does not exist.

## Decision

- **IF** the product has a deep hierarchy and the person can land directly on internal pages **THEN** use breadcrumbs.
- **IF** it is a catalog, knowledge base or large portal **THEN** use breadcrumbs.
- **IF** the structure is shallow and the position is already evident **THEN** do not use them.
- **IF** it is the home page, an isolated landing page or a page with no relevant parent **THEN** do not use them.
- **IF** it is a linear flow (form, checkout) **THEN** use a progress indicator, not breadcrumbs.
- **IF** the person needs to recover search, filters and sorting **THEN** offer "Back to results" in addition to the trail.
- **IF** a level does not correspond to an existing page **THEN** do not include it.
- **IF** the screen is small **THEN** compact by truncating, grouping or using an ancestors menu, without leaving any level unreachable.
- **ELSE** do not add the component out of habit.

## When to use

- A deep content hierarchy.
- Internal pages reached through search or external links.
- Catalogs, knowledge bases and large portals.
- Moving up to the parent category is a frequent task.

## When to avoid

- Home page and pages with no relevant parent → **use instead:** no trail.
- Shallow sites → **use instead:** the main menu.
- Linear flows → **use instead:** a progress indicator.
- A substitute for the main menu → **use instead:** main navigation.
- A trail based on the session's casual path → **use instead:** the real hierarchy plus a back action.

## Do

- Model the trail on the architecture, not on the history.
- Make each previous level point to an existing page.
- End with the name of the current page.
- Use the same names as the navigation, headings and categories.
- Place it consistently, after the header and before the title.
- Test direct entry through search and external links.

## Avoid

- Showing it on every page.
- Inventing levels for SEO.
- Using vague labels.
- Confusing it with the steps of a process.
- Clearing filters when going back.
- Hiding the trail on mobile with no alternative.

## Accessibility

- Mark it as a labeled navigation region (nav with an accessible name) and use an ordered list (1.3.1).
- Previous levels are links with understandable names (2.4.4); the current item can be text or a link with aria-current="page".
- Hide decorative separators from assistive reading.
- Links and truncation controls operable by keyboard, with visible focus and contrast (2.4.7).
- On narrow screens, wrap, truncate or open an ancestors list without blocking access to the levels; test 200% and 400% zoom (1.4.10).
- The trail cannot be the only way to reach an important area.
- When the page has more than one nav, label each one.

## Microcopy

| Situation | Example |
|---|---|
| Region label | "You are here" |
| Trail | "Home > Furniture > Tables > Dining table" |
| Return with context | "Back to results" |
| Truncation | "Show previous levels" |

## Verification checklist

- [ ] There is a real hierarchy with at least two levels.
- [ ] Each previous level is a link to an existing page.
- [ ] The current page is identified at the end of the trail.
- [ ] The labels match the navigation and headings.
- [ ] The trail is inside a nav with an accessible name and uses an ordered list.
- [ ] Decorative separators are not read out.
- [ ] When there is search or filters, a "Back to results" link preserves them.
- [ ] On mobile, the ancestors remain reachable.
- [ ] It works with keyboard, 400% zoom and screen reader.

## Rationale

- U.S. Web Design System, breadcrumb: secondary navigation; avoid on simple sites, landing pages and step-by-step processes; markup with nav, ordered list and aria-current.
- GOV.BR Digital Standard, breadcrumb: structural navigation, current page, truncation and small screens.
- W3C WAI, technique G65 and the WAI-ARIA APG breadcrumb pattern: hierarchical trail, labeled region and aria-current.
- Baymard Institute: two types of breadcrumbs (hierarchy and history) and behavior on mobile product pages; e-commerce-specific evidence.
- W3C Design System: accessible implementation and labeling when there is more than one nav.
- Nielsen Norman Group, intranet report: trail examples for orientation.
- WCAG 2.2, criterion 2.4.8 (Location).
