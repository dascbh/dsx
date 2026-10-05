---
name: figma-conventions
description: "Defines and records the Figma file's conventions: pages, frame names, reusing vs creating a kit component, figma-reference.json and the note inside the file itself. Use when setting up the cycle or when the file loses its conventions."
---

# figma-conventions — the contract the round trip depends on, written where everyone can see it

> **DSX root:** two levels above this skill's base directory. `knowledge/`, `patterns/`, `tools/`, `templates/` paths are relative to it; paths without a prefix (`design/`, `.dsx/`, `src/`) belong to the user's project.

Page names, frame names, variable names and vector constraints are not
aesthetics — they are the **interface** that `figma-pull` and `figma-coverage`
read to know what each thing represents in the code. An edit that "works" on
screen but breaks that interface does not show up as an error: it shows up as
one extra line in the next coverage audit, or as a screen whose trip back to
code no longer knows where it came from.

This skill has two parts, and both are required:

- **Part A — the contract** (sections 1–8): the checklist before any edit that
  is not a full round of the other skills. It lives in the repository and in
  the instructions the agent loads.
- **Part B — publishing** (sections 9–13): writing the essentials of the
  contract **inside the Figma file itself**, because a person who opens the
  file directly in the Figma app never sees Part A.

Before any `use_figma`: load the `figma-use` skill and read
[plugin-api.md](../figma-mirror/references/plugin-api.md) (pitfalls for
layout, text, color/variable, vector, component/instance — this skill does not
repeat what is already there, it only points to where each rule applies).
Before any discovery `use_figma`, read `design/figma-reference.json`
(section 8).

**The turn applies here too.** Every edit this skill makes writes to Figma:
read `design/figma-sync.md` (skill `figma-cycle`) first. With `turn: design`
(or the legacy `vez: design`), edits coming from the code do not happen — and
even the Part B note, small as it is, can visually collide with what is being
worked on: tell the user there is refinement in progress and **confirm first**
before adding anything. With no record, the cycle has not been set up yet:
offer `/dsx:figma-init`.

---

# Part A — the structural contract

## 1. Page structure — the numbering is the index

Page names are strings created in the file in the project's language; the
pt-BR names below are the ones the DSX writes for a pt-BR project and are
referenced literally by repo files and scripts.

```
00 · Fundamentos      cover + color + typography/shape
01 · Componentes      icons, chrome, primitives kit
02…0N · <areas>        one page per product area/user profile, one screen per route
0N+1 · Fluxos
0N+2 · Diálogos
0N+3 · Estados e variações
0N+4 · Responsivo
0N+5 · Cobertura
09 (or the last one) · Propostas   — reserved for design exploration (skills figma-cycle and figma-proposals), NEVER product content
```

**Before creating a new page**, ask: is this a **real area/profile of the
product** (e.g. a new portal for another role) or **one more screen inside an
area that already exists**? Only the first case justifies a new page — the
second is just one more frame on the existing page, in the free strip
(section 6).

If the answer is a new page, it goes into the right semantic position in the
sequence, not at the end. Page names are strings, not ids — renumbering is safe
for Figma (the node `id` does not change when you change `page.name`), but it
has two costs that must be paid in the same round:

- **after renumbering, `grep` the repo for the old name** (`design/figma-sync.md`,
  `design/figma-reference.json`, any script or skill that cites a literal
  `"0X · Name"`) and update the references;
- **regenerate the baseline**: the canonical snapshot (`tools/figma/snapshot.js`)
  identifies each frame by `page › frame name`, so renaming the page makes the
  next diff read all of its frames as "removed + new".

Never insert a page out of sequence just to avoid the work of renumbering.

## 2. Frame name — the field everything depends on

```
<Label> · <action or state> (<exact origin in the code>)
```

The `<origin>` is the part that holds the contract up: it must be a file path,
a route, or an export name — never a vague description. `(Painel de
notificações)` does not let `figma-pull` or `figma-coverage` link the frame to
`components/NotificationBell.tsx`; `(NotificationBell)` does.

(pt-BR examples — the label follows the product's language:)

```
Demandas · Lista (/demandas)
Diálogo · Novo produto (ProductsPage.tsx)
Overlay · menu de notificações (NotificationBell.tsx)
Espécies · Lista · isError (OntologyTabs.tsx SpeciesTab)
```

Edited an existing frame without changing what it represents? **Do not rename
it.** The name is the key the diff and coverage use to pair "before" and
"after" at the frame level — the snapshot identifies each frame by
`page › frame name` — so changing the name of a frame whose content was only
adjusted makes the diff read it as "deleted frame + new frame" instead of
"frame changed". (Inside the frame, nodes are paired by `id` and then by path —
section 10.)

## 3. Before drawing anything new — correlate, do not reinvent

The `01 · Componentes` page itself already carries the rule, in the Primitives
Kit caption: *"Token ou primitivo ausente = parar e propor, nunca inventar
inline."* (pt-BR caption: "Missing token or primitive = stop and propose, never
invent inline.") This cannot be just a sentence nobody reads — it is the gate
that keeps each new screen from becoming a slightly different reinterpretation
of the previous one.

Before writing the script that composes a screen, dialog or state:

1. **Search first.** List what already exists on the `01 · Componentes` page
   (the "Spec · X" specs and their usage descriptions) and in the functions of
   `tools/figma/prelude.js`. `figma.currentPage.query()` on the kit frame is
   cheaper and more reliable than trusting memory from a previous round. If
   the file uses a published library, `search_design_system` too (skill
   `figma-push`, "Reuse before creating").
2. **Does something already solve this?** Use the existing helper/instance. Do
   not build the equivalent structure with raw `createFrame`/`createText` just
   because it is faster in the moment — that shortcut is exactly what produces
   two pieces that look alike and are structurally different.
3. **Is there something SIMILAR but not identical?** That is not yet a
   decision to draw — it is the entry to section 5 (create or evolve). Stop and
   decide there; do not solve it inline "just this once".
4. **Nothing exists** and you confirmed it (did not assume) → only then is it a
   new composition. If it is exclusive to this screen, compose it locally. If
   you already know it will repeat, go straight to section 5.

This is about **building the system**, not about "cleaning up" what the code
does — rule zero (section 7) still requires mirroring an ugly screen as it is.
What this section forbids is creating a **new** inconsistency, in the mirror
itself, through a shortcut.

A real example of what this discipline exists to prevent: `TorreSummaryStrip`,
in `DemandsPage.tsx`, duplicates the visual shape of `StatStrip` locally in the
source code itself — because `StatStrip`'s `toneColor` did not produce the color
the Control Tower needed. The mirror reproduced that duplication faithfully (it
is the real code; rule zero says draw it as it is) — but it is exactly the kind
of fork this section exists to prevent **inside Figma**: if two mirror screens
need "almost StatStrip", that is a signal to evolve the StatStrip primitive
(section 5), not to keep two diverging copies in the design file.

## 4. Editing an existing component without breaking instances

A kit component (icon, button, chip, AppBar, Drawer) already has dozens to
hundreds of instances spread across the file. The rule:

- **Edit the main component node in place** (same `id` —
  `getNodeByIdAsync` + mutation), never delete and recreate. Recreating changes
  the id, and every existing instance becomes an orphan instance of the old
  component.
- Figma recalculates existing instances against the main component
  automatically — you do **not** need to (and should not try to) touch frame by
  frame. After editing the main component, check the effect on a small sample
  of instances already in use on real screens (not just a new instance created
  for testing), because that is what proves propagation worked.
- **After any large round of `use_figma`**, look for components you did not
  create: the MCP server often componentizes repeated structures on its own
  (`figma.currentPage.query('COMPONENT, COMPONENT_SET')` and compare with what
  you expected to create). This flattens variation — see "the expensive trap"
  in [plugin-api.md](../figma-mirror/references/plugin-api.md).
- **Never delete a small, loose node** just because it looks disposable — it
  may be the main component of Chip/Button/Icon. Check `type` and `name` before
  any `.remove()`.

## 5. Creating or evolving a kit component — criteria, not impulse

This is the decision section 3 pushes here when "search first" did not settle
it on its own. Follow this order, without skipping a step:

1. **Validate again, explicitly.** Confirm with a real search (`query()` on
   page 01, variable/style names) that it does not exist — "I don't think
   there is one" is not validation.
2. **It exists and fits** → stop here, reuse via instance/token. This should
   never have reached section 5 — if it did, reread section 3.
3. **It exists but does not fit exactly** (missing a variation, a size, a
   state) → it is a candidate for **evolving the existing component**, not for
   a parallel component. Criterion to tell evolving from creating new: same
   semantic purpose and same visual family → evolve (new variant/prop on the
   component that already exists); different purpose → new primitive.
4. **It really does not exist** → confirm it serves (or will serve) **≥ 2
   places** — the same criterion the cycle's diff already uses (`same change in
   ≥ 2 frames = primitive`). A single use is a local composition of the screen
   (section 3, step 4); it does not become a kit piece.
5. **When creating OR updating**, respect what is already established — do not
   introduce a new visual pattern through the back door:
   - **variable/token**: exists only if it has a corresponding real value in
     the project's tokens (DTCG, `theme.ts` or equivalent) — never invent one
     because "it would make sense"; a new token is born in the code through the
     `tokens` skill and reaches Figma through the `tools/figma/tokens-to-figma.mjs`
     bridge, never the other way around. Name = DTCG path with `/` instead of
     `.` (`color/feedback/danger-icon`, `space/stack-md`); a dot inside the
     name fails (`space/0.5` does not work — the DSX writes `space/0_5`);
     explicit `scopes`; semantic variable filled in both modes
     (`Claro`/`Escuro`) of the `Semântico` collection; usage rule copied from
     the "Colors" table of `DESIGN.md` into the `description`.
   - **icon**: 24×24 `COMPONENT`, path normalized to absolute `M/L/C/Q/Z` with
     every subpath closed with `Z` (`node <DSX>/tools/figma/normalize-svg-path.cjs "<d>"`),
     exact name `Ícone/<NameExportedByThePackage>`, `constraints: SCALE` on
     **every** child vector — not just the first, if the icon has more than one
     inner path (outline + hole, like `Visibility`/`DeleteOutline`). On the
     instance, size changes with `rescale(size / 24)`, not `resize`
     (`icon()` from `tools/figma/prelude.js`).
   - **primitive**: same density, radius, button hierarchy and type scale the
     rest of the kit already defines — a new primitive is not a license to
     reopen those decisions.
   - document it on the `01 · Componentes` page in the same "Spec · X" format
     as the existing pieces: name, usage description, example populated with
     real data — and the component's native `.description` (section 12);
   - if the composition depends on a script, add the equivalent helper
     function to `tools/figma/prelude.js` (or the project's copy) in the same
     round — otherwise the next agent reinvents it again, and section 3 fails
     silently for them.
6. **Backwards compatibility is not optional when updating — and it is not
   proven by instruction, only by test.** The doctrine has always asked for
   `constraints: SCALE` on every icon, and still an entire foundation of 51
   icons was created with `MIN/MIN` in a real round — the instruction alone was
   not enough. After changing an existing component: (1) instantiate it under
   adverse conditions — for an icon, a small size (≤ 16px, smaller than the
   native 24px); (2) check the render on a sample of instances that **were
   already in production** before your change, not just on a new instance
   created for testing. That is how the icon constraint fix was confirmed in
   practice: by checking the icon of the "Nova norma" button and of the CRO
   dropdown already present on real screens. If the old sample broke or did not
   change, the "fix" is not done — the Plugin API accepts the wrong constraint
   without complaint; only the screenshot shows it.
7. **Record the decision**, not just the result — "I evolved X instead of
   creating Y because Z" is the data that keeps another agent from undoing your
   choice in the next round for not knowing it was deliberate. Where: the
   round's line in `design/figma-changelog.jsonl` (`summary` field) and, if the
   piece gained a new usage rule, `DESIGN.md` (skill `design-md`).

## 6. Positioning new content without collisions

Screen/dialog/state pages receive contributions from several rounds (and, with
Workflow, from several agents at once). Never assume a free position —
**measure before positioning**:

```js
const p = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(p);
const maxX = Math.max(0, ...p.children.map(c => c.x + c.width));
const maxY = Math.max(0, ...p.children.map(c => c.y + c.height));
// new content starts at maxX + a generous margin (≥1500px), never at (0,0)
```

If the work will run in parallel (several agents of a `Workflow` on the same
page), reserve an **exclusive X strip per agent** before launching — each one
stacks vertically inside its own strip. Strips 2000–2200px wide comfortably fit
a 1440px screen or a dialog with room to spare. (Positioning in parallel does
not change the rule that the **mutations** themselves are sequential per file —
skill `figma-push`.)

## 7. Rule zero still applies to a surgical edit

Editing a component or completing a screen is not a license for "while I'm
here, let me tidy this up". If the code is ugly, inconsistent or missing error
handling, **draw it as it is** and record the finding — the same rule as
`figma-mirror` (format in `design/figma-findings/<round>.md`, severity 0–4). A
deliberate aesthetic fix is design refinement, and design refinement only
happens with `turn: design` in the sync record (`figma-cycle`) — never as a
side effect of an edit coming from the code.

## 8. Agent reference — do not rediscover, read

Every agent that opens the file (from either side — about to write to Figma, or
about to read Figma to change code) tends to **rediscover** the basic facts from
scratch: what the variable collection id is, what the icon frame id is, the
exact names of the 51 icons, which component is the AppBar. That costs
expensive API calls and — worse — each agent may describe the same fact with a
different word, and then two agents that never read each other diverge without
noticing.

Keep `design/figma-reference.json` in the code repo, in the same directory as
the sync record. It is not edited by hand — it is **regenerated** at the end of
any phase that creates or changes foundation/structure (`figma-foundations`,
`figma-mirror` phases 2–3, `figma-push`, `figma-coverage` when closing the
matrix, and whenever section 5 of this skill creates or updates a component):

```json
{
  "fileKey": "6I4VlpwuCYRfpx4yYQqHx3",
  "file_url": "https://www.figma.com/design/6I4VlpwuCYRfpx4yYQqHx3",
  "updated_at": "2026-08-18",
  "pages": { "00 · Fundamentos": "0:1", "01 · Componentes": "2:2", "…": "…" },
  "foundation": {
    "collections": {
      "Primitivos": { "id": "VariableCollectionId:3:1", "modes": { "Valor": "3:0" } },
      "Semântico": { "id": "VariableCollectionId:3:2", "modes": { "Claro": "3:1", "Escuro": "3:2" } },
      "Componente": { "id": "VariableCollectionId:3:3", "modes": { "Valor": "3:3" } }
    },
    "variables": ["color/bg/canvas", "color/bg/surface", "color/text/primary", "…"],
    "text_styles": ["Título/Página (h4)", "…"],
    "icons": { "frame_id": "5:2", "names": ["Add", "Cancel", "…"] },
    "chrome": { "appbar": "13:13", "drawer_open": "13:14", "drawer_collapsed": "13:40" },
    "kit_primitives_frame_id": "14:20"
  },
  "frames": [
    { "id": "27:1428", "name": "Demandas · Lista (/demandas)", "source": "DemandsPage.tsx", "page": "02 · App do patrocinador" }
  ]
}
```

`frames` is the same information as the `08 · Cobertura` matrix, just in a
format an agent reads with `Read` instead of rebuilding it with `get_metadata`
— the two must always match; if they diverge, the matrix in Figma is the source
of truth and the JSON is stale (regenerate it). `foundation.icons.frameId` and
the style names are what fill the CONFIGURE block of `tools/figma/prelude.js`.
An old `figma-reference.json`, with Portuguese keys (`atualizadoEm`,
`paginas`, `fundacao`, `colecoes`, `modos`, `variaveis`, `estilosTexto`,
`icones`, `nomes`, `drawerAberto`, `drawerRecolhido`, `kitPrimitivosFrameId`,
`origem`, `pagina`) or camelCase keys (`fileUrl`, `updatedAt`, `textStyles`, `frameId`, `drawerOpen`, `drawerCollapsed`, `kitPrimitivesFrameId`), is read with the warning "old name, rename to X" and
rewritten with only the new keys (snake_case; `fileKey` stays as in the Figma API) on the next regeneration.

Every agent under this doctrine starts a work session **by reading this file
first**, before any discovery `use_figma` — it only falls back to
`get_metadata`/`get_variable_defs` when the file does not exist yet or some id
cited in it no longer resolves (a sign that it is stale and needs to be
regenerated, not that the agent should guess).

---

# Part B — the file explains itself, even without the DSX

## 9. Why publish the contract inside the file itself

All of Part A's doctrine — page numbering, frame names,
reuse-before-creating, the `09 · Propostas` page for exploring alternatives,
Sections per flow — lives as instructions the **DSX** loads into an agent
session. A designer who opens the file directly in the Figma app never sees any
of it. Neither does another AI agent, a colleague's session without the DSX, or
Figma's own native tools. The convention is real, but it is invisible to
everyone who is not the DSX, in this repo, right now.

That gap is where the round trip really breaks — not from bad taste, but from a
structural edit nobody knew was outside the convention.

## 10. What actually breaks the round trip — and what does not

The diff (skill `figma-cycle`, [references/diff.md](../figma-cycle/references/diff.md);
`tools/figma/snapshot.js` and `tools/figma/diff-baseline.cjs`) works at two
levels, and the difference matters:

- **Top-level frame:** identified by `page › frame name`.
- **Nodes inside the frame:** paired by **Figma `id`** first, then by path
  (`page/frame/name[ordinal]/…`) for what is left, and only then classified as
  added/removed.

Consequences:

- **Editing a frame's content in place is safe.** Ids survive; the diff finds
  each node and shows exactly what changed.
- **Renaming a frame (or its page, or moving it to another page) is not
  harmless.** The frame itself still exists, but the diff reads it as "removed
  frame" + "new frame" and does not show what changed inside. If the name has to
  change because the frame now represents something else (section 2), make the
  change and **regenerate the baseline in the same round**, and regenerate
  `design/figma-reference.json`. Always keep the `(<origin>)` suffix — it is
  what a person or a script uses to re-derive the link to the code.
- **Deleting a frame and drawing a new one in its place is worse.** The new
  frame shares no id with anything in the baseline — even with the same name,
  nodes only pair by path, and whatever does not match shows up as an unrelated
  `+ new` / `− removed` pair instead of a diff of what actually changed; every
  design decision already applied in a previous round looks like it needs
  review again.
- **Exploring a variant inside a real page (02, 03…) instead of
  `09 · Propostas`** does not break pairing mechanically, but it breaks the
  contract: the next mirror or coverage pass reads it as "this is how the screen
  is now", not "one of three options under consideration" (skill
  `figma-proposals`).
- **Restructuring what is nested in what** (wrapping a frame's content in a new
  group) changes the traversal path even when the leaves keep their ids — the
  diff still finds the nodes, but whoever reads the report has more work to
  tell "moved" from "changed".

None of this is enforced by Figma. It is enforced by whoever edits the file
knowing it — which is exactly what this part makes possible for someone who has
never read the DSX doctrine.

## 11. Two places the convention has to live — write in both

1. **The repository** (`design/figma-sync.md`, `design/figma-reference.json`,
   `.dsx/figma/ledger.json`, `.dsx/maps/*.json`) — authoritative, versioned,
   in git. Read by any agent session with the DSX in this repo. Invisible to
   whoever opens the Figma file directly.
2. **The Figma file itself** — visible to everyone who opens it, whatever the
   tool. Two native mechanisms:
   - **A note on the canvas** (a real text frame) — readable by a person, and
     by any AI agent that calls `get_metadata`/`get_design_context` on that
     page, even one that has never heard of the DSX.
   - **`.description` on components and frames** — shows up automatically in
     Dev Mode and in the Assets panel, and is what `get_design_context` returns
     for a component without anyone having to look for a text block first.

The Figma-side artifacts do not replace the repo record — the canvas note ends
with a pointer to it, not a copy of its content. State (what was applied, what
was rejected, whose turn it is) keeps living only in `design/figma-sync.md`;
duplicating it on the canvas only creates a second, older copy waiting to go
stale.

### Before writing

Read `.dsx/figma/ledger.json` (`entities.pages`), `design/figma-reference.json`
(`pages`) and `design/figma-sync.md` for the project's real page order, the
frame naming pattern and the repo path — **never** paste the template below
literally. (Legacy: accept `.claude/figma-claude/figma-registry.json` if the
new ledger does not exist yet.)

### The conventions note on the canvas

Where: the cover of `00 · Fundamentos`, or a small section of its own if the
cover is already dense with the color/type/hazard content that
`figma-foundations` and `figma-push` put there (or wherever the project's
foundations page already keeps its own notes). Generate it from the project's
**current, real facts** — the page order as it was actually built, the real repo
path, whether the `09 · Propostas` page already exists — never paste the
template below literally. The note is read by the people who open the file, so
it is written in the project's language (pt-BR example):

```
CONVENÇÕES — leia antes de editar

Ordem das páginas: 00 Fundamentos · 01 Componentes · 02+ telas por perfil/área ·
NN Fluxos · NN Diálogos · NN Estados · NN Responsivo · NN Cobertura · 09 Propostas.
Página nova só para uma área/perfil real do produto, na posição semântica certa;
tela a mais de uma área existente é frame novo na página que já existe.

Nome de frame: "<Rótulo> · <ação ou estado> (<origem no código>)" —
ex.: "Demandas · Lista (/demandas)", "Diálogo · Novo produto (ProductsPage.tsx)".
A matriz de cobertura e a volta para o código usam a origem entre parênteses
para achar o arquivo que o frame representa. Edite frames NO LUGAR; não
renomeie um frame só porque o conteúdo mudou (o diff lê frame renomeado como
removido + novo), e nunca apague e redesenhe — o histórico se perde.

Explorando uma alternativa? Duplique em "09 · Propostas", não ao lado do
original dentro de uma página real. Variante deixada numa página real é lida
como "é assim que a tela está agora" no próximo espelho ou cobertura.

Reuse antes de desenhar algo novo: confira 01 · Componentes (e qualquer
biblioteca ligada) primeiro. Parecido mas não igual → evolua o componente ou
envolva uma instância, não crie um garfo em silêncio. Token ou primitivo
ausente = parar e propor, nunca inventar inline.

Estado completo — o que foi aplicado, o que foi recusado e por quê, de quem é
a vez agora — vive no repositório ligado, não aqui: design/figma-sync.md
(<caminho ou URL do repo, se conhecido>).
```

If the project does not have the `09 · Propostas` page yet, create an empty one
in this pass or say clearly in the note that exploration has no home yet — do
not reference a page that does not exist.

## 12. Component and frame descriptions

At a minimum, every component in `01 · Componentes` gets one (written in the
project's language; English shown here):

```js
// use_figma
node.description =
  "Matches apps/web/components/ui/Cta.tsx. Primary variant only.";
// or, if there is no counterpart in the code yet (a primitive the DSX
// built because nothing similar existed in the real code):
node.description =
  "Figma only — no equivalent in the code. Created during the mirror because " +
  "the app builds this pattern inline instead of as a shared component. " +
  "Do not link to Code Connect.";
```

If `DESIGN.md` has a usage rule for the component (when to use it, when not
to), add it in one sentence after the mapping — it is what a designer reads in
the Assets panel.

Say explicitly when there is no counterpart in the code — the same honesty rule
that the hazard exposure of the `figma-push` skill already applies to tokens. A
false mapping that looks plausible is worse than an admitted gap, because it is
the kind of thing Code Connect or a future agent would trust blindly.

Some node types lock properties the same way `SectionNode.devStatus` can be
locked by an MCP bridge (the `figma-push` skill documents that failure for
Sections) — check what the live API actually allows before promising that a
description was set; if a type refuses, cover that node in the canvas note and
say so in the report.

### Verification and report

Screenshot the note and a sample of components in the panel (or the
`get_design_context` return for one of them) and confirm they are readable
before finishing. Report: what was written, where, and everything that could
not be set (a node type that blocks `.description`, a missing
`09 · Propostas` page) with what was done instead.

## 13. When to run Part B — and what it does not solve

Run it:

- as a closing step every time the cycle is set up for the first time in a
  project (skill `figma-init`) — right after the sync record, before the file
  is handed to a designer or to anyone outside DSX sessions;
- at the end of the first `figma-push` build;
- whenever the page numbering or the `09 · Propostas` convention changes;
- whenever a round broke because of a structural edit that did not follow the
  convention — update the note with what actually happened, the same way a
  hazard board records a finding: specific, dated, nothing vague.

What it does **not** solve: this makes the convention **discoverable**, not
**enforced**. A person or another AI can still ignore the note and delete and
recreate a frame instead of editing it. Catching that is not this skill's job —
it belongs to the "Signs the cycle broke" diagnostics of the `figma-cycle` skill
and to the diff/reconciliation mechanism on resume, which exist to detect and
recover from exactly that, not to prevent it for good. This part reduces the
frequency by making the rule visible to whoever is about to break it; it does
not promise zero.

---

## Checklist before closing any structural edit

- [ ] I checked the turn in `design/figma-sync.md` before writing
- [ ] Before composing something new, I searched page 01 and the prelude — I
      did not assume it did not exist (section 3)
- [ ] If I created or updated a kit component: I validated its absence,
      confirmed use in ≥ 2 places, and tested backwards compatibility on an
      already existing instance, not just a new one (section 5)
- [ ] A new or changed component has an honest `.description` (with or without
      a counterpart in the code) (section 12)
- [ ] Screenshot of what was edited, rendered — not just the script's return
- [ ] No instance was orphaned (component deleted/recreated with a new id)
- [ ] No new component appeared because of the MCP without my creating it
- [ ] Every new/edited frame has the exact `<origin>` in parentheses in its name
- [ ] No frame had its name changed without changing what it represents; if it
      did (or a page was renumbered), the baseline was regenerated in the same
      round
- [ ] If what a round covers changed: `design/figma-sync.md` and the
      `08 · Cobertura` matrix (or equivalent) reflect the new state — do not
      leave the next audit to find out on its own
- [ ] If I touched foundation, page, frame or kit component:
      `design/figma-reference.json` (section 8) was regenerated — not left
      stale for the next agent to rediscover or, worse, trust an id that has
      already changed
- [ ] If page, numbering or the proposals convention changed: the canvas
      conventions note was updated (section 11)
- [ ] The sync record got an entry in the structured changelog
      (`design/figma-changelog.jsonl` — skill `figma-cycle`)
