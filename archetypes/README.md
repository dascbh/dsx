# Screen archetype catalog

> **When to consult**
> - Before building or rearranging a screen: to decide **what kind of screen it is** and, from that, which regions it has, where the primary action goes and which states it must show.
> - When writing section 5 (Screen Archetypes) and the `archetypes` key of a project's `UX.md`.
> - When reviewing a screen that "feels confusing": it often mixes two archetypes.

## What it is

An **archetype** is a recurring type of screen, defined by the task the person performs on it, not by how it looks. Each card `archetypes/<id>.md` fixes:

- **when to use** it and when not to, as IF → THEN decisions;
- **regions** (with a diagram) and what goes in each one;
- **where the primary action goes** and how many there can be;
- **states** the screen must show;
- **variations**: alternative arrangements, each with what it favors and what it worsens;
- **anti-patterns** and a **checklist**;
- the interaction **patterns** that apply (ids from `patterns/`) and the automated UX check **rules** (T1–T7, F1–F5) that hold for it.

The format contract lives in `knowledge/foundations/ux-md.md` (section "Screen Archetypes").

## Three levels, none repeats another

| Level | Answers | Where |
|---|---|---|
| Pattern | One isolated micro-decision: modal or page, where to show the error, toast or alert | `patterns/` |
| Archetype | What kind of screen this is, how it is organized and how it behaves | `archetypes/` (this catalog) |
| Project `UX.md` | Which archetypes the product uses, on which routes, and which open options the product settled | project root |

The archetype cites patterns by id and does not repeat their content. The `UX.md` cites archetypes by id, maps the product's real screens to them and declares deviations.

## How to choose

Start from the screen's main task: what the person comes to do there on most visits.

1. **IF** the screen is used by someone outside the product, without an account, answering once **THEN** [public-decision-page](public-decision-page.md).
2. **IF** the task is short, starts on another screen and returns to it:
   - **IF** all that is missing is a decision about a serious, irreversible action **THEN** [confirmation-dialog](confirmation-dialog.md);
   - **IF** a few pieces of data are missing (up to ~6 fields) **THEN** [form-dialog](form-dialog.md);
   - **IF** it is about viewing or adjusting a record without losing the list **THEN** [detail-side-panel](detail-side-panel.md).
3. **IF** the task is long or rare, with steps that depend on each other **THEN** [step-wizard](step-wizard.md).
4. **IF** the screen revolves around a single piece of content:
   - **IF** the person produces or changes that content **THEN** [editor-with-panel](editor-with-panel.md);
   - **IF** the content is finished and the person reads, checks or dispatches it **THEN** [document-viewer](document-viewer.md).
5. **IF** the screen revolves around many items:
   - **IF** the person only wants to know the situation and where to act first **THEN** [monitoring-dashboard](monitoring-dashboard.md);
   - **IF** the items are reusable (templates, catalog items) and chosen by their content **THEN** [library](library.md);
   - **IF** the person processes the items one after another, reading each one **THEN** [master-detail](master-detail.md);
   - **ELSE** (finding, comparing and acting on work records) **THEN** [operational-list](operational-list.md).
6. **IF** the person adjusts persistent parameters with no order among them **THEN** [settings](settings.md).
7. **ELSE** the screen probably mixes tasks: split it into screens, each with one archetype, or declare the deviation in `UX.md`.

Archetypes combine by **composition**, not by mixing: an `operational-list` opens a `detail-side-panel`, which may ask for a `confirmation-dialog`. Each piece follows its own card.

## The 12 archetypes

| Archetype | What for | Primary action | Variations |
|---|---|---|---|
| [operational-list](operational-list.md) | Find, triage and act on many work records | Header, top-right | bulk, cards on mobile, side filters, grouped by status |
| [master-detail](master-detail.md) | Process items in sequence with the list always visible | Detail, top-right | fixed columns, collapsible master, stacked on mobile |
| [document-viewer](document-viewer.md) | Read, check and dispatch a finished document | Header, top-right | panel on the right, full screen, side-by-side comparison |
| [editor-with-panel](editor-with-panel.md) | Produce long content with contextual support | Header, top-right | fixed panel, collapsible, tabbed, focus mode |
| [step-wizard](step-wizard.md) | Guide a long or rare task, one decision at a time | Footer, right | horizontal stepper, side stepper, final review, in a dialog |
| [monitoring-dashboard](monitoring-dashboard.md) | Show the situation and what needs attention | Header (optional) | indicators first, pending items first, by role |
| [library](library.md) | Find and reuse items from a curated collection | Header (curators) | grid, dense list, collections in a tree, preview |
| [settings](settings.md) | Adjust persistent parameters safely | Section footer | save per section, save on change, tabs at the top |
| [public-decision-page](public-decision-page.md) | A third party without an account reads and answers once | Next to the decision | binary, with reason, with identification, long document |
| [form-dialog](form-dialog.md) | Collect a little data without leaving the screen | Dialog footer | short, with sections, promote to page |
| [confirmation-dialog](confirmation-dialog.md) | Last conscious decision before the irreversible | Dialog footer | simple, type to confirm, undo, listed consequences |
| [detail-side-panel](detail-side-panel.md) | View or adjust a record without losing context | Panel footer (editing only) | overlay, push, read-only with link |

## Maintaining the catalog

- New archetype: copy an existing card, adjust the front matter and the eight body sections (`When to use`, `Region map`, `What goes in each region`, `Actions`, `States`, `Variations`, `Anti-patterns`, `Checklist`), and run `node tools/lint-archetypes.mjs --index`.
- The linter (`tools/lint-archetypes.mjs`) checks: required fields, `id` equal to the file name, `register` in the enum, `primary-action` with an existing region and a valid position, `patterns` ids present in `patterns/index.json`, `rules` within T1–T7/F1–F5, at least 2 variations (each with `### <id>`, **Favors:** and **Worsens:**), every region and every state described in bold in the body, sections in order, a diagram in a code block, a checklist with items and no URL.
- `archetypes/index.json` is generated by the linter; do not edit it by hand.
- Write in your own words; do not cite sources by URL.

## Checklist

- [ ] The screen has one main task and one archetype; combinations are composition (list + panel + dialog), not mixing.
- [ ] Regions, primary position and states follow the card, or the deviation is declared in `UX.md`.
- [ ] The chosen variation was compared with at least one alternative by what it favors and worsens.
- [ ] `node tools/lint-archetypes.mjs` with no error after any change to the catalog.
