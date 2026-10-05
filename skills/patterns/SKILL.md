---
name: patterns
description: "Consults the catalog of 77 interface patterns to decide with criteria: modal or page, toast or inline, table or cards, when to validate, confirm or offer undo. Use for any doubt between components or behaviors."
---

# Consult interface patterns

> **DSX root:** two levels above this skill's base directory. The paths below are relative to it.

## How to find the pattern

1. Read `patterns/index.json` (lightweight, one line per pattern: `id`, `title`, `category`, `components`, `rule`, `status`, `impact`). Or `patterns/README.md` for the same information as a table.
2. Filter by the decision at stake — search by component (`modal`, `toast`, `table`, `button`), by category or by a word from the question.
3. If the `rule` settles the case, apply it and cite the pattern id.
4. If the case has nuance (unusual context, conflict between patterns), open the card and follow the **Decision** section (IF → THEN rules), then **When to avoid** (which points to alternatives).
5. Before considering the decision implemented, run the card's **Verification checklist**.

## Categories

| Category | Covers |
|---|---|
| `actions` | button hierarchy and placement, link vs button, icon without text, disabled button, confirmation, undo, destructive actions, double click, FAB |
| `forms` | labels, required fields, field order, validation, error messages, steps, autosave, upload, dropdown, autofill |
| `feedback` | loading (skeleton/spinner/long), empty, success, toast/alert/inline, failures, retry, error code, progress |
| `search-filters` | filter structure, automatic application, active filters, search with no results |
| `data` | table vs cards, sorting, table pagination, table on mobile, date range filter |
| `navigation` | main navigation, tabs, breadcrumbs, pagination vs scroll, links in a new tab |
| `modals` | when to use, when to avoid, how to close |
| `authentication` | password requirements, show password, confirm password, password recovery, expired session |
| `accessibility` | keyboard focus, touch target, not color alone |
| `ux-writing` | button text, link text, helpful error messages |
| `ai` | label AI content, uncertainty, sources, review output, confirm AI action, recover from AI error |
| `ecommerce` | cart, postal code (CEP), guest checkout, product variations |
| `content` | carousel and auto-advancing carousel |

## When patterns conflict

- **Accessibility and data-loss prevention win** over convenience and aesthetics.
- A pattern with `status: avoid` may only be used with an explicit, recorded justification.
- If two recommended patterns point in different directions, prefer the one that lowers the **cost of error** for the person (reversibility > speed).
- If the project's DESIGN.md contradicts a pattern, follow the DESIGN.md **and** point out the divergence in the report — it may be a conscious decision or debt.
- Before opening the catalog, check whether the project's `UX.md` has already fixed the decision (primary button position, dialog order, confirmation, feedback, validation, required fields): the `UX.md` **chooses** among the options the pattern leaves open, and its choice applies to every screen of that archetype. If the `UX.md` contradicts a pattern, follow the `UX.md` and point out the divergence; if the decision is not there and applies to more than one screen, propose adding it to the `UX.md` (skill `ux-md`, bumps the minor version) instead of deciding screen by screen.

## Response format

When used to answer a question:

```
Decision: <what to do, in one sentence>
Pattern: <id> (<status>, impact <impact>)
Why: <1–2 sentences linking the user's context to the rule>
Watch out: <checklist items most likely to be forgotten>
Alternative if <condition>: <other pattern>
```

## Contributing a new pattern

Use `templates/pattern.md`, save it in `patterns/<category>/<id>.md` and run `node tools/lint-patterns.mjs --index` to validate and regenerate the index.
