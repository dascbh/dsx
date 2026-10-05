---
name: figma-coverage
description: "Audits coverage between code and Figma (routes, dialogs, states × frames) and updates the matrix in both directions. Use when asked whether a screen is missing from Figma, or to prove coverage instead of asserting it."
argument-hint: "[code→figma | figma→code]"
---

# figma-coverage — coverage is proven, not asserted

> **DSX root:** two levels above this skill's base directory. Paths under `knowledge/`, `patterns/`, `tools/`, `templates/` are relative to it; paths without a prefix (`design/`, `.dsx/`, `src/`) belong to the user's project.

"I think everything is there" is the answer that is always wrong. A mirror of
the product in Figma is only worth anything as documentation if there is a list
**derived from the code** and an item-by-item check against the file.

This skill produces both: the inventory and the matrix.

Audit summary (the rest of the skill details each phase):

- Enumerate the surfaces **from the code** (routes, dialogs, panels,
  overlays, states) and check them against the file's frames. For each item
  with no match, name its destination: **missing**, **covered by another
  frame** (say which) or **out of scope** (say why). Only the third closes the
  item.
- If the project was born in Figma (`figma→code` direction), read the inverted
  matrix — frame → route, with status `implemented` / `partial` / `missing` /
  `not code`.
- Numbers only go into the report if they come from a count, never from an
  estimate.

## Before anything else

Load the **`figma-use`** skill before every call to `use_figma`. Read
`design/figma-changelog.jsonl` (the last round and the `findings` pointer) and
`design/figma-reference.json` if they exist: a gap that looks new may already
be recorded as out of scope in a previous round.

## Phase A — inventory from the code

Never from memory, never from clicking through the app. From the code. If
`.dsx/maps/ui-map.json` already has pages, modals and states surveyed, reuse it
instead of re-deriving; `.dsx/maps/project-map.json` covers routes and
components at a coarser grain if the UI mapping has not run. Only grep for what
neither map covers, and run the `map-ux` skill first if the project has moved
since they were written.

**Compatibility:** when looking for a map, read `.dsx/maps/` first; if it does
not exist, accept the legacy `.dsx/mapas/` (Portuguese names: `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes`; old camelCase JSON keys such as `generatedAt` or `subPages` count as the new snake_case ones; all with the warning "old name, rename to X") and `.claude/figma-claude/` (`ui-map.json`,
`project-map.json`, `task-flows.json`), and warn that it will be rewritten to
the new path on the next `map-ux` run.

```bash
# 1. routes — the backbone
grep -n "path=\|<Route\|createBrowserRouter\|routes:" src/App.tsx src/routes/* 2>/dev/null

# 2. dialogs and modals — the surface that slips through most often
grep -rn "<Dialog \|<EditDialog\|<Modal\|useConfirm(" src/ | sed 's/:.*//' | sort | uniq -c | sort -rn

# 3. components with their own UI (not utilities)
find src/components src/ui -name '*.tsx' | xargs wc -l | sort -n

# 4. states that are not routes: empty, loading, error, result variants
grep -rn "EmptyState\|LoadError\|isLoading\|isError\|severity=" src/pages src/components | wc -l
```

### Taxonomy — classify each finding

| type | how to recognize it | becomes |
|---|---|---|
| **route** | an entry in the router | one frame |
| **tab** | child of `<Outlet>` or `Tabs` inside a route | one frame per tab |
| **shared-component route** | a `sub_pages` entry in `ui-map.json` marked `nav_visible: true` — a distinct destination in the navigation menu that happens to render through the same source component as its siblings, via a route parameter | its own frame, like any other route — **never** folded into the parent's count |
| **dialog** | `Dialog`/`Modal` | one frame over a scrim |
| **panel** | a large card that only exists inside one screen | goes into the screen's frame, or its own frame if the screen gets too long |
| **overlay** | menu, dropdown, toast, sticky banner | its own small frame |
| **state** | empty / loading / error / each outcome of a flow with more than one ending | one frame per variation that changes the user's decision |

A state that only changes one word does not deserve a frame. A state that
changes what the person can do does.

**A matrix built on the *count* of pages/routes can reach 100% and still miss
real navigation destinations.** If three sidebar links point to the same
component with a type parameter, `ui-map.json` may record that as a single
entry in `pages` with three `sub_pages` — a matrix that only adds up top-level
entries will say "1 of 1, covered" and never notice that the other two were
never built. Count each `nav_visible` sub-page as its own inventory row, just
like any route.

### Phase A output

A checklist of **file → surfaces**, with counts. It is what becomes the
matrix; keep it.

## Phase B — check against the file

List what actually exists, not what you remember making:

```js
// use_figma
return figma.root.children.map(p => ({
  page: p.name,
  frames: p.children.map(c => c.name),
}));
```

Frame names follow the format from the `figma-conventions` skill (e.g.
`Diálogo · Novo produto (ProductsPage)`) — the source component in parentheses
is what lets you cross-reference frame and file without guessing. A frame
outside that format is a finding in itself: the way back (`figma-pull`) cannot
read it back.

Cross-reference with the checklist. For each item with no frame, choose one of
three destinations — and **name the destination**, do not leave it implicit:

1. **missing** → build it;
2. **covered by another frame** → say which (a panel inside the screen counts);
3. **out of scope** → say why.

Only the third case closes the item without work, and only with a written
reason.

## Phase C — the matrix in Figma

A `08 · Cobertura` page with a three-column table:

| File | What it is | Where it is in the file |
|---|---|---|
| `pages/DemandsPage.tsx` | List, tower, detail, wizard, proposal selection | 02 · 3 screens · 05 · 9 dialogs · 06 · empty, loading, error |

Group by layer (foundation, chrome, routes, registries, public). Mark each row
with a covered sign — and use a different sign for the exceptions, with the
reason on the row itself.

At the top, a strip of counts that are **checked, not estimated**:

```js
const total = figma.root.children.reduce((n, p) => n + p.children.length, 0);
```

If you wrote "123 frames" and the count gives 134, the matrix has lost all of
its authority. Recount whenever you add frames.

## The inverted matrix — when the project was born in Figma

If Figma came first (`figma-first` skill), the question flips: it is not "which
screen in the code is still to be drawn", it is **"which design frame has not
yet become product"**. The same matrix, read backwards, with one more column:

| Figma frame | Becomes | Status |
|---|---|---|
| `Painel · visão geral` | route `/painel` | implemented |
| `Painel · sem dados` | state of route `/painel` | missing |
| `Painel · v2 (exploração)` | — | not code, exploration |

Possible statuses: `implemented`, `partial` (with what is missing), `missing`,
`not code` (exploration, draft, reference — with the reason).

The same reuse rule from phase A applies here: if `.dsx/maps/ui-map.json` or
`.dsx/maps/tasks.json` already has the route/task on the code side, use it in
the "Becomes" and "Status" columns instead of rechecking the code by hand.

That column is what answers "how much of the design has become product"
without anyone opening both sides — and it is where the project's real debt
shows up.

## What legitimately stays out

Layers with no visual surface of their own — API clients, auth and theme
providers, formatting helpers, domain rules, mocks. **Declare this in the
matrix footer**, with a sentence on what they produce on screen (error
messages, date and currency format, the tone of each state) and where that
shows up. Leaving them out without declaring it looks like an oversight.

## Orphan code — do not draw it, record it

An exported component that is not mounted in any route or tab is not a screen:
it is dead code. Confirm before concluding:

```bash
grep -rn "ComponentName" src/ | grep -v "file-where-it-is-defined"
```

If there is no usage, it goes into the matrix with an attention sign and the
reason: *"exported but not mounted in any route — drawing it would suggest a
screen the user cannot reach"*. That is a finding about the code, delivered
for free by the audit.

Audit findings (orphan code, navigation route with no frame, frame outside the
naming format) get a 0–4 severity on the `review-ux` skill's scale and go to
`design/figma-findings/<round>.md`, one per finding — it is data, not
narrative, and it cannot live only in the conversation.

## Report to the user

Say what was missing, what you closed and what stayed out **with a reason**. If
nothing was missing, say how you verified it — the check is the answer, not the
impression.

Exact numbers (routes, dialogs, states, frames) only go into the report if they
come from the count, never from an estimate.

## Wrap-up

This skill's matrix and `design/figma-reference.json` (`figma-conventions`
skill, `frames` field) are the same information in two formats — regenerate the
JSON from the matrix you have just closed, never leave one newer than the
other. If the round fixed a coverage gap, that is also a new line in
`design/figma-changelog.jsonl` (`figma-cycle` skill), with
`frames_created`/`frames_changed`/`frames_removed` taken from the count and
`findings` pointing to `design/figma-findings/<round>.md`.
