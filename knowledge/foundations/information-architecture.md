# Information architecture, findability, flows and fidelity

> **When to consult**
> - When deciding where something lives (new route, tab, section, modal), what it is called and how it connects to the rest.
> - When structuring or reviewing menus, navigation, search and categories.
> - When drawing a feature's user flow before the screens.
> - When choosing the wireframe or prototype fidelity for the next decision.

Information architecture (IA) organizes, names and connects content and functions so that people **find, understand and act**. The screen is a consequence of that structure, not the other way around.

---

## 1. The four systems

| System | Decides | Control question |
|---|---|---|
| Organization | How to group (by task, topic, audience, stage, alphabetical order, date) | Does the grouping follow the audience's logic of use? |
| Labeling | How to name groups, pages, links and actions | Can a person from the audience predict the content from the name? |
| Navigation | How to move between parts (global, local, contextual, utility) | Does the person know where they are, where they came from and where they can go? |
| Search | How to find without navigating | Does search understand the real vocabulary and guide the person when it fails? |

---

## 2. Process

1. **Inventory:** list all existing content and functions; flag duplicates and orphans.
2. **Audit:** assess clarity, freshness and relevance; decide what goes.
3. **Tasks and audience:** what the main tasks are, how often, by whom.
4. **Grouping by logic of use** (validate with open or closed card sorting).
5. **Hierarchy:** define levels and depth.
6. **Labeling:** clear, specific names from the audience's vocabulary.
7. **Structural map (sitemap):** visualize the tree and the cross-cutting shortcuts.
8. **Validation:** tree testing (do they find the item in the tree, without an interface?) and usability testing.
9. **Translation** into flows, wireframes and prototypes.

### Where something should live

- IF it is an area the person visits independently and repeatedly THEN its own route in the navigation.
- IF it is an alternative view of the same object, at the same level THEN a tab ([tabs](../../patterns/navigation/tabs.md)).
- IF it is part of the same object and read together THEN a section on the same page.
- IF it is a short, focused task that does not require another context THEN a modal ([when-to-use-modal](../../patterns/modals/when-to-use-modal.md), [when-to-avoid-modal](../../patterns/modals/when-to-avoid-modal.md)).
- IF an entity with the same meaning already exists THEN reuse it and its name; do not create a parallel one.

---

## 3. Hierarchy and depth

- Organize by the audience's tasks, never by the org chart.
- Global navigation with 5–7 top-level items; beyond that, group ([main-navigation](../../patterns/navigation/main-navigation.md)).
- Prefer a wider, shallower tree to a deep one: critical pages at most 3 levels (clicks) from the entry point.
- Mutually distinct categories: IF two categories create doubt about where something is THEN merge, rename or create a cross-link.
- "Other", "Miscellaneous", "General" are forbidden as top-level categories; they are symptoms of unfinished grouping.
- Critical content must have **more than one path**: menu, search and contextual link.

---

## 4. Labeling

- Use the words the audience uses (interviews, tickets, search terms), with synonyms mapped in search.
- A specific label predicts the content: "Invoices" > "Documents"; "Change password" > "Security" when that is what the person is looking for.
- Same concept, same name in menu, page title, breadcrumb and button. See [ux-writing.md](ux-writing.md#5-glossary-consistency).
- Page title = label of the link that leads to it.
- Avoid creative or marketing labels in navigation.

---

## 5. Navigation

| Type | Function | Patterns |
|---|---|---|
| Global | Access to the main areas from anywhere | Top bar, side menu, bottom bar on mobile (3–5 items) |
| Local | Within an area | Submenu, tabs, secondary navigation |
| Contextual | Links between related items | Links in the content, "related" |
| Orientation | Where am I | Highlighted active item, title, [breadcrumbs](../../patterns/navigation/breadcrumbs.md) |

**Rules**
- Active item always indicated (not by color alone).
- Breadcrumbs when the hierarchy has 3+ levels and the person may arrive via search or an external link.
- Links open in the same tab, except for justified exceptions ([link-in-new-tab](../../patterns/navigation/link-in-new-tab.md)).
- Pagination, "load more" or infinite scroll according to the task ([pagination-vs-scroll](../../patterns/navigation/pagination-vs-scroll.md)).
- Back returns to the previous state (scroll position, filters, search).

---

## 6. Findability

Findability is how easy it is to **find, recognize and retrieve** something when it is needed. It differs from *discoverability* (noticing something you did not know existed) and from usability (operating it once found).

### Four situations

| Situation | What the person does | What the interface needs |
|---|---|---|
| Known item | Looks for something nameable ("duplicate of the bill") | Audience labels, synonyms, autocomplete, tolerant matching |
| Exploratory | Knows the goal, not the answer | Combinable filters, comparison, refinement, results with context |
| Discovery | Does not know it exists | Contextual links, groupings and examples that reveal possibilities |
| Re-finding | Has seen it, does not remember where | History, recents, favorites, stable navigation |

### Search

- Accept synonyms, plurals, missing accents and typos.
- Suggest while typing; show recent searches.
- Sort by relevance and explain why the result appeared (highlighted snippet).
- Combinable filters, visible when active and easy to clear ([active-filters](../../patterns/search-filters/active-filters.md), [filter-structure](../../patterns/search-filters/filter-structure.md), [applying-filters](../../patterns/search-filters/applying-filters.md)).
- Zero results: show the term, suggest a correction, alternatives and paths ([no-search-results](../../patterns/search-filters/no-search-results.md)).
- Preserve the query and filters when coming back from the results.
- Search does not fix confusing organization, and good organization does not make search unnecessary.

### Methods

| Method | Answers | Does not answer |
|---|---|---|
| Card sorting | How the audience groups and names | Whether they find things in the final structure |
| Tree testing | Whether they find things in the hierarchy, without an interface | Whether the interface helps or hinders |
| First-click test | Whether the first decision goes down the right path | Whether they complete the task |
| Usability testing | The complete experience | Statistical coverage |
| Search logs, tickets | Real vocabulary and gaps | Why the person failed |

---

## 7. User flow

A map of the path to complete a task: entry, actions, decisions, system responses, detours and exits.

**Minimal notation**

| Symbol | Meaning |
|---|---|
| Rectangle | Screen or step |
| Diamond | Decision (user's or system's), with labeled exits ("yes/no", "logged in/visitor") |
| Rounded rectangle / pill | Start and end (success, abandonment, error) |
| Arrow | Transition, labeled with the action that triggers it |
| Note | Business rule, state or remark |

**How to build it**
1. Write the goal in the user's language ("get the product at home by Friday"), not the system's ("access checkout").
2. Define the entry points (home, email, search, direct link, notification).
3. Map the success path with the essential actions (not interface micro-details).
4. Add decisions, conditional branches (permission, status, plan), error paths, empty states and abandonment.
5. Mark where the system acts (sends email, validates, charges).
6. Look for steps that can be removed.
7. Validate with representative tasks.

**Maturity levels:** task flow (linear, one task) → flow with decisions → wireflow (flow with screen thumbnails).

**Anti-patterns:** happy path only; mapping the internal structure instead of the intent; one giant diagram for everything; detailing the interface too early; forgetting branches by profile or permission.

---

## 8. Wireframe and prototype: choosing the fidelity

| Fidelity | Contains | Use for | Do not use for |
|---|---|---|---|
| Low | Boxes, short real text, annotations, gray | Exploring structural alternatives, aligning on flow, workshops | Validating aesthetics or microinteraction |
| Medium | Real proportions, hierarchy, generic components, realistic content | Testing architecture, forms, dashboards; aligning with stakeholders | Approving visual identity |
| High | Final visuals, tokens, realistic interactions, states | Testing critical journeys, handoff, final validation | Exploring structure (creates attachment and feedback about color) |

**Decision**
- IF the question is "which structure/order/grouping" THEN low.
- IF the question is "do people find and understand it" THEN medium, with realistic content.
- IF the question is "do the interaction, the timing or the visual detail work" THEN high, only for the part in question.
- Raise the fidelity only after the structure has been validated.

**Rules for wireframes and prototypes**
- Every prototype starts with a written hypothesis and the criterion that confirms or refutes it.
- Use real content and realistic volumes; *lorem ipsum* and short names hide hierarchy problems.
- Include states: empty, loading, error, success, extreme content, different permissions.
- Present in sequence (flow), not loose screens; annotate behaviors and conditions.
- Show mobile and desktop adaptation when both matter.
- Connect the main actions; do not waste time wiring every secondary path.
- Test with the audience, not just with the team.

---

## Audit checklist

- [ ] Grouping by the audience's tasks, validated (card sorting/tree testing) or marked as a hypothesis.
- [ ] Specific labels, from the audience's vocabulary, identical in menu, title, breadcrumb and button.
- [ ] No "Other/Miscellaneous" categories; categories do not overlap.
- [ ] 5–7 items in global navigation; critical pages at ≤ 3 levels; more than one path to critical content.
- [ ] Current location always indicated; back preserves state.
- [ ] New functionality placed by the route/tab/section/modal rule, without duplicating an existing entity.
- [ ] Search tolerates errors and synonyms, shows active filters and guides on zero results.
- [ ] User flow with the user's goal, entries, labeled decisions, errors, empty states and abandonment.
- [ ] Wireframe/prototype fidelity chosen by the question to answer; realistic content; states included.
