---
id: tabs
title: When should you use tabs?
category: navigation
components: [tabs, tablist, panel]
type: recommendation
impact: medium
status: recommended
evidence: strong
wcag: ["4.1.2", "2.1.1", "1.4.11", "2.4.7", "1.4.10"]
related: [breadcrumbs, carousel, main-navigation, filter-structure]
---

# When should you use tabs?

> **Rule:** Use tabs only for a few related contents of equal importance that are independent enough to be seen one at a time.

## Context

Tabs switch panels within the same context, showing one at a time. They compact the interface but hide content: the person has to infer from the label what each panel holds and remember what they saw when switching.

The choice depends on the relationship between the contents and on the task, not on the amount of text. When the groups are related and the labels clear, the component reduces visual overload; when they are different, numerous or need comparison, switching is costly.

Not every horizontal strip is a set of tabs. Filters, carousels, pagination and progress indicators express different relationships.

## Decision

- **IF** the contents are equivalent views of the same object, area or task **THEN** use tabs.
- **IF** the groups have no direct relationship **THEN** use dedicated navigation, links or separate pages.
- **IF** the items are steps of a process **THEN** use a progress indicator, not tabs.
- **IF** the person needs to compare contents **THEN** show them together.
- **IF** the content is critical to completing the task **THEN** leave it visible, outside the tabs.
- **IF** the tabs are filters or modes of the same data set **THEN** use a filter or segmented control.
- **IF** the tab list grows or the labels get long **THEN** reconsider: an open page or an accordion.
- **IF** the panel loads without noticeable delay **THEN** activate the tab when it receives focus.
- **IF** there is loading or a slow lookup **THEN** use manual activation (Enter or Space).
- **IF** the tabs lead to different pages **THEN** use links with real URLs and indicate the current page.
- **ELSE** open the tab most useful to most people by default.

## When to use

- Related settings of the same object.
- Equivalent views of a dashboard.
- A few categories on the same subject.
- Complementary details that do not need to appear together.
- Panels that load without losing state.

## When to avoid

- Required steps → **use instead:** a progress indicator or a multi-step form.
- Simultaneous comparison → **use instead:** side-by-side content.
- Essential sections of a product page → **use instead:** expanded sections or an accordion.
- Long lists of different destinations → **use instead:** main navigation.
- Tabs inside tabs → **use instead:** flattening the structure.

## Do

- Write short, predictable labels.
- Highlight the active tab with a noticeable indicator.
- Visually connect each tab to its panel.
- Preserve the panel's state and data when switching.
- On mobile, use horizontal scrolling with an indication of tabs outside the visible area.
- Validate that people understand the labels and notice the other panels.

## Avoid

- Hiding critical information in a secondary tab.
- Using tabs for steps or filters.
- Forcing comparison by switching.
- Creating many tabs.
- Stacking several rows of tabs.
- Nesting tabs.
- Indicating the active tab only by color.

## Accessibility

- Semantic structure: role="tablist", role="tab" and role="tabpanel", with aria-controls and aria-labelledby; aria-selected="true" only on the active one; an accessible name for the set (4.1.2).
- Focus enters on the active tab; Left and Right arrows in horizontal lists, Up and Down in vertical ones; Enter or Space activate in manual mode (2.1.1).
- Selection and focus indicators with sufficient contrast (1.4.11, 2.4.7).
- On narrow screens, horizontal scrolling must work by keyboard and touch; test 200% and 400% zoom (1.4.10).
- Focus must not disappear when the panel changes.

## Microcopy

| Situation | Example |
|---|---|
| Tab labels | "Summary", "Payments", "History" |
| Set name (screen reader) | "Customer details" |
| Panel loading | "Loading history..." |
| Empty panel | "No payments recorded in this period." |

## Verification checklist

- [ ] Every tab is about the same object or context.
- [ ] Labels have at most two words or fit without wrapping.
- [ ] There are no tabs inside tabs.
- [ ] The default tab is the most useful to most people.
- [ ] No critical information lives only in a secondary tab.
- [ ] The active tab has an indicator beyond color.
- [ ] The tablist, tab and tabpanel roles and aria-selected are correct.
- [ ] Arrow keys move between tabs.
- [ ] On mobile, there is an indication of tabs outside the visible area.
- [ ] Switching tabs does not erase data already entered.

## Rationale

- Nielsen Norman Group, using tabs correctly: related contents, few groups, short labels, a useful initial panel, no comparison across tabs.
- W3C WAI-ARIA Authoring Practices, tabs pattern and automatic activation example: roles, relationships, keyboard and when to use automatic or manual activation.
- GOV.BR Digital Standard, tab: brief labels, small screens, no nesting.
- Material Design, tabs: the difference between tabs, pagination and carousel.
- IBM Carbon, tabs: not for comparison, progress or filtering.
- Baymard Institute: essential product-page sections hidden in horizontal tabs cause problems (a specific finding, not a general ban).
