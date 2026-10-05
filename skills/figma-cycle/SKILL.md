---
name: figma-cycle
description: "Governs the code ↔ Figma cycle: whose turn it is, how a round opens and closes, the sync record, changelog, gates and baseline. Use when setting up the cycle, before re-mirroring a refined file, or when code and Figma have diverged."
---

# figma-cycle — the one rule that makes the round trip work

> **DSX root:** two levels above this skill's base directory. `knowledge/`, `patterns/`, `tools/`, `templates/` paths are relative to it; paths without a prefix (`design/`, `.dsx/`, `src/`) belong to the user's project.

The cycle is simple to describe and easy to break:

```
code ──mirror──▶ Figma ──refinement──▶ Figma ──application──▶ code ──▶ (repeat)
```

What breaks it is always the same thing: **someone re-mirrors the file after the
designer refined it**, and the script overwrites their work. No technical skill
prevents that — only a rule of authority declared on disk.

## The rule: one side is authoritative at a time

| turn | means | forbidden |
|---|---|---|
| **`code`** | Figma is a mirror; the code rules | refining in Figma expecting it to survive |
| **`design`** | refinement is in progress in Figma | **re-mirroring**, under any pretext |
| **`applying`** | the proposals are becoming code | touching the same files from outside |

The turn is written in the repository. If it is not written, you do not know
whose turn it is — and the correct answer is to **ask before writing anything**,
on both sides.

The rule does not depend on discipline alone: the DSX `turn-guard` hook reads
the record below and **denies** any `use_figma` that writes to the file while
the turn is `design` (reads — snapshot, inventory, diff — always pass). To read
or change the turn, use `/dsx:figma-turn`.

## The sync record

A versioned file in the repo — `design/figma-sync.md` or equivalent. It is short
on purpose; nobody maintains what is long.

```markdown
# Figma sync

file: S8z0…  ·  https://figma.com/design/S8z0…
turn: design                        # code | design | applying
since: 2026-08-20
baseline: design/figma-baseline/   # canonical snapshot — it is the diff's "before"

## Rounds
- r1 · 2026-08-14 · full mirror (00–08, 134 frames) · turn → code
- r2 · 2026-08-20 · list density refinement · turn → design

## Pending
- None   (this round's scope, not built yet)

## Open proposals
09 · Propostas → “Demandas · lista densa”, “Chip de status sem borda”

## Applied in the last round
- Cell spacing 8→6px  → token `space/stack-sm`, theme
- SectionCard counter in tabular-nums → primitive `SectionCard`

## Rejected
- (with reason, so they do not come back)
- Borderless chip — color would stop being paired with shape (2nd channel)

## Known divergences
- None
```

When reading, the record accepts the old Portuguese names — `vez:` instead of
`turn:`, `arquivo:`/`desde:` instead of `file:`/`since:`, and the values `codigo`
and `aplicando` instead of `code` and `applying` — with the warning "old name, rename to X". When rewriting the file,
always write the new names.
The old Portuguese section headings (`## Rodadas`, `## Pendentes`,
`## Propostas abertas`, `## Aplicadas na última rodada`, `## Recusadas`,
`## Divergências conhecidas`) are still read, and are rewritten with the
English headings above.

`Pending` and `Known divergences` look alike and are not — confusing the two is
what let a round declare itself closed while work it still meant to do remained
unbuilt. `Pending` is scope this round meant to cover and did not (budget, time,
split into several passes) — the round is not actually done while anything is
here. `Known divergences` is a decision already made: either a permanent tool
limit (a property blocked by the MCP, a response size ceiling with a documented
workaround) or an explicit scope cut the user signed off on (e.g. choosing the
Essential track instead of the Complete one). An item only moves from `Pending`
to `Known divergences` when someone really decides "this will not be done", with
the reason written down — never by sitting forgotten in `Pending` until nobody
notices it has aged.

Without `Rejected`, the same proposal comes back every round. Without
`Divergences`, the file lies by omission.

## The changelog — the same story, in a format an agent reads

`figma-sync.md` is deliberately short — one line per round. That is great for a
human to open and understand the state in 10 seconds, and bad for an agent that
needs to know **exactly** what changed before applying something precisely. The
two needs do not fit in the same file without one sacrificing the other — that
is why they are separate files, not one longer file:

```
design/figma-sync.md            → current state + one-line index per round (human)
design/figma-changelog.jsonl    → one structured entry per round (agent)
design/figma-findings/<round>.md → the round's full findings (data, not conversation)
design/figma-reference.json     → current facts (ids, names) — skill figma-conventions
```

`figma-changelog.jsonl` is **append-only**: each round adds one line, never
rewrites the previous ones — it is the right format for history that only
grows, and it avoids the cost of reparsing/rewriting an entire JSON array every
round.

```jsonl
{"round":"r1","date":"2026-08-14","direction":"code->figma","author":"figma-mirror","summary":"full mirror, 00-08, 134 frames","frames_created":134,"frames_changed":0,"frames_removed":0,"tokens_changed":[],"turn_after":"design","findings":"design/figma-findings/r1.md"}
{"round":"r2","date":"2026-08-22","direction":"figma->code","author":"figma-pull","summary":"list density applied to SectionCard and to the spacing token","frames_created":0,"frames_changed":7,"frames_removed":0,"tokens_changed":["space/stack-sm"],"turn_after":"code","findings":"design/figma-findings/r2.md"}
```

Minimum fields: `round`, `date`, `direction` (`code->figma` or
`figma->code`), `author` (the skill or flow that ran), `summary` (one sentence),
`frames_created`/`frames_changed`/`frames_removed` (real count, not an
estimate), `tokens_changed` (list of variable names, empty if none),
`turn_after` (the `turn` state the round left), `findings` (path to the file
with that round's full findings — see below).
When reading an old changelog, accept the Portuguese keys (`rodada`, `data`,
`direcao`, `autor`, `resumo`, `framesCriados`, `framesAlterados`,
`framesRemovidos`, `tokensAlterados`, `vezApos`, `achados`; values
`codigo->figma`/`figma->codigo`/`codigo`/`aplicando`) and warn "old name,
rename to X"; new lines use only the English keys.
Do not rewrite the old lines (the file is append-only).

**Findings do not fit in one line, and must not live only in the conversation.**
A round of `figma-mirror`, `figma-push`, `figma-coverage` or `figma-pull`
often discovers real things about the product (a measured responsive bug, a
button that does nothing, a duplicated token) — if that only exists in the chat
response that produced the round, it disappears as soon as the conversation is
archived. Write it to `design/figma-findings/<round>.md`, one entry per finding,
with the same precision as an adversarial review — it is data, not narrative.
Each finding uses the DSX 0–4 severity scale (skill `review-ux`: 0 not a
problem · 1 cosmetic · 2 minor · 3 major · 4 catastrophe; an accessibility
barrier that blocks the task is always 4):

```markdown
### A-r1-03 · "Resolver" action does nothing in the demands list
- where: `src/pages/Demands.tsx` · frame `02 · Demandas › Lista`
- what happens: the button calls `onResolve`, which is not wired to anything
- why it is a problem: visible action with no effect (heuristic 1 — visibility of system status)
- severity: 3
- evidence: measured at 1440 and 375px; console without errors
- destination: out of scope for this round — needs a product decision
```

Every agent that is going to **apply** a change (`figma-pull`) or **audit**
(`figma-coverage`) reads `figma-changelog.jsonl` before acting, not just
`figma-sync.md` — that is where the precise `summary` and `direction` of the
last round are, and the pointer to findings that may already explain something
that would look like a new divergence.

## The round

**1. Open.** Check the turn. If it is `design`, you do not mirror — negotiate
the handover first.

**2. Mirror (only the first time is complete).** Round 1 loads the whole file
(skill `figma-push`, which orchestrates `figma-foundations`, `figma-mirror`
and `figma-coverage`). Later rounds re-mirror **only the screens the code
changed since the last sync** — find them through history:

```bash
git diff --name-only <last-sync>..HEAD -- src/pages src/components src/theme.ts
```

A full re-mirror after round 1 is almost always a mistake: it destroys
refinement and costs ten times more than the incremental one. Do it only if the
record says the turn is `code` and the user explicitly asks.

**3. Freeze the "before" and hand over the turn.** Run the snapshot with
`MODE = 'full'` ([tools/figma/snapshot.js](../../tools/figma/snapshot.js),
pasted inside `use_figma`) and **commit** `design/figma-baseline/*.json`. That
snapshot is what makes the diff possible — and git is what now gives the design
file versioned history. Only then write `turn: design` — and only if
`## Pending` is empty. A committed baseline is necessary but not sufficient: it
proves there is a "before" to diff against, not that the round finished what it
set out to build. A mirror that deliberately deferred part of its own scope
(budget ran out midway, split into several passes) is not a closed round just
because a baseline exists — flipping the turn there hands over authority over
work that still belonged to the code, and the next person to open the file has
no way to tell "designer, go ahead" from "unfinished, come back here". Keep the
turn at `code`, list what is missing in `## Pending`, and only flip it when it
is actually empty (or when the items have been explicitly reclassified to
`## Known divergences`, with a reason).

In a large file (dozens of routes, dozens of dialogs), a `MODE = 'full'` sweep
of the whole file can exceed the `use_figma` response size limit and truncate
in the middle of the JSON — a real, observed failure, not a hypothesis. When it
happens, fall back to `MODE = 'hashes'` (the script's own lightweight path),
note the fallback in `## Known divergences` of `figma-sync.md`, and complement it
with `MODE = 'full'` calls whose `TARGETS` are restricted to the frames a later
round's hash flags. Do not stall the round waiting for detailed baseline
coverage of everything at once — hash-only already detects *that* a frame
changed, and that is enough to drive the diff from round to round.

The designer edits **in place**: id pairing stays exact and the baseline keeps
the previous state. Duplicating a frame on a `09 · Propostas` page is for
**exploring alternatives** (two or three versions to choose from), not for
incremental refinement (page convention in the `figma-proposals` skill).

**4. Diff, then apply.** New snapshot →
`node <DSX>/tools/figma/diff-baseline.cjs design/figma-baseline/app.json /tmp/atual.json`
→ report already classified as `token` / `primitive` / `composition`
(`/dsx:figma-diff` runs both phases and the comparison). The `figma-pull`
skill consumes that report instead of guessing what changed — and runs each
item through the [gates](#gates--what-stops-the-round) before touching the code.
Full mechanism in [references/diff.md](references/diff.md).

**5. Close.** Update the record (applied, rejected, turn → `code`), re-mirror
**the screens you touched** and **regenerate the baseline** — if the baseline
goes stale, the next round will present everything you just applied as new. A
round that does not close becomes a silent divergence. Always close with the
three files: **append** one line to `design/figma-changelog.jsonl`, full
findings saved to `design/figma-findings/<round>.md` if there are any, and
`design/figma-reference.json` regenerated if foundation or structure changed
(skill `figma-conventions`).

## Why the cycle exists — and where each side wins

| Figma does better | code does better |
|---|---|
| hierarchy, rhythm, density, breathing room | behavior, state, real data |
| exploring 3 alternatives in 20 minutes | what happens when the list has 4,000 items |
| seeing the set of screens side by side | accessibility, focus, keyboard |
| conversation with people who don't read code | real responsiveness |

That defines what must **not** come back from Figma: state logic, business
rules, text that changes meaning without review, and anything that only works
at the width the frame was drawn at.

## Gates — what stops the round

Stop and send back, instead of applying, when the proposal:

- **lowers contrast** below the accessibility floor — even if it looks nice;
- **removes the second channel** of a state (color becoming the only signal);
- **creates a pattern that does not exist in the kit** — it becomes a product
  decision, not a screen decision;
- **contradicts an interaction pattern** that the DSX catalog marks as `evitar`
  (avoid);
- **changes a token** without anyone having looked at the effect on the other
  screens;
- **undoes a finding** that had already been recorded as intentional.

A stop is not a final rejection: it is a request for an explicit decision from
whoever can make it.

### How each gate is checked — they are the DSX gates

The cycle does not invent its own criteria: the trip back goes through the same
checks as any UI built with the DSX. `figma-pull` applies this list item by
item; whatever fails comes back as a gate, with the reason, to `## Rejected` or
for a decision.

| gate | how to check | blocks when |
|---|---|---|
| **contrast** | `node <DSX>/tools/contrast.mjs "#fg" "#bg"` for each text/background and UI/background pair the proposal touches (prints AA/AAA for text, large text and non-text UI), in both themes | text < 4.5 (large < 3), non-text UI < 3 |
| **token change** | apply via the `tokens` skill (the snapshot becomes a DTCG diff with `node <DSX>/tools/figma/figma-to-tokens.mjs`) and run `node <DSX>/tools/build-tokens.mjs` | the build fails (contrast pair failed, dark theme key with no light counterpart, broken alias) — a failure blocks, it does not become a warning |
| **interaction pattern** | compare the proposal with `patterns/index.json` (fields `regra`, `status`, `componentes`). E.g. error moved to a toast → `toast-vs-inline-alert`; long form inside a modal → `when-to-avoid-modal` | the proposal contradicts a pattern with `status: "evitar"` or the `regra` of a recommended pattern |
| **accessibility** | `accessibility` skill: visible focus, touch target ≥ 24 × 24 px (AA floor) and 44 px on touch, information not by color alone, reading order | any barrier — and a removed 2nd channel is always a gate |
| **text** | `ux-writing` skill: project glossary, button/error/empty formulas, same concept = same word | text that changes meaning without review, term outside the glossary |
| **`token` class** | `tokens` skill | see "token change" |
| **`primitive` / `composition` class** | rules of the `build-ui` skill: semantic tokens only (never a raw value, never a primitive directly), required states (empty, loading, error, success, focus, disabled), `node <DSX>/tools/lint-raw-values.mjs` clean | raw value introduced, state missing |
| **new usage rule** (new component, variant or token, or a new rule for when to use it) | update `DESIGN.md` via the `design-md` skill in the same round | the rule lives only in Figma or only in the code |
| **behavior change** (new screen, different arrangement or archetype, primary action somewhere else, confirmation, state, flow) | update `UX.md` via the `ux-md` skill in the same round (screen line, policy or deviation; `version` and `updated`) and run `node <DSX>/tools/ux-lint/screen.mjs` on the capture | the change contradicts a `UX.md` policy without the policy changing, or lives only in Figma or only in the code |

An item only counts as applied when it has passed every gate that applies to
it — record in `figma-sync.md` which gate stopped each rejected item, so the
next round does not reopen the same discussion.

## Signs the cycle broke

- Figma has a screen that does not exist in any route → someone drew the future
  in the mirror. Move it to an exploration page; the mirror describes the
  present.
- An applied change disappears in the next round → there was a re-mirror on the
  wrong turn. Reapply it and fix the discipline, not the file.
- The diff presents already applied changes again → the baseline was not
  regenerated when the previous round closed. Regenerate it and discard the
  report.
- The diff flags a mass change of the `FRAME`→`INSTANCE` kind → it is the MCP
  server's automatic componentization, not a design decision. Treat it as noise
  and regenerate the baseline.
- The coverage matrix has not closed for two rounds → run `figma-coverage`
  before anything new.
- The turn is `design`, but `## Pending` has items → the previous round was
  declared closed without being closed. Set the turn back to `code` and finish
  the scope.

## When the project was born in Figma

The cycle is the same; what changes is the seed. There is no initial mirror —
there is an initial **implementation** (skill `figma-first`). Three adjustments:

- **The turn starts at `design`**, not `code`. Figma is the source while the
  code does not yet cover the file.
- **The baseline is taken at the moment you implement each batch**, not at the
  end of a mirror. It freezes what became code; whatever came later in Figma is
  the next round.
- **Coverage reads inverted** — frame → route, with status (`figma-coverage`).
  While there is a frame in `falta` (missing), the cycle is still on its first
  lap.

When the code comes to cover the file, the turn alternates normally and
`figma-mirror` comes in as verification, not as a load.

## First setup of the cycle in a project

The entry point is `/dsx:figma-init`, which follows this sequence.

0. `/dsx:map-ux`, if `.dsx/maps/project-map.md` does not exist yet — it gives
   each step below the project's physical structure instead of each one
   rediscovering it, and goes one layer down: the UI itself (pages, modals,
   tokens, typography, icons), navigation between screens, the steps inside
   each task, the journey over time, the business domain underneath it all,
   and the design system extracted with drift-risk detection
   (`design-system.json`, `hazards[]`). If only a legacy one exists
   (`.dsx/mapas/` with Portuguese names, or `.claude/figma-claude/`), accept it and warn that it will be rewritten to
   `.dsx/maps/` on the next run. `map-ux` does not call `use_figma`, so the
   turn guard never sees it — run it on any turn, including `design`. The maps
   serve the whole DSX, not just the cycle: `build-ui` reads flows and domain;
   `design-md` and `audit-ds` read `design-system.json`.
1. `map-ux` alone leaves guesses in the maps — everything the agents inferred
   instead of observed, and everything the trip out and the trip back will
   treat as fact from then on. Run `/dsx:confirm-maps` if `design/as-is-to-be.md`
   does not exist yet: it re-runs the mapping, checks the maps against the
   project's own specs and documentation, and walks the user through confirming
   or correcting every point marked as uncertain. It is the step that decides
   how much the rest of the cycle deserves to be trusted — the only one that is
   interactive on purpose, and skipping it only pushes the same corrections
   later, where they cost more.
2. `/dsx:figma-push` — the step that actually writes to Figma. The source of
   truth for the trip out is `DESIGN.md` + the project's tokens (DTCG tokens →
   `.dsx/maps/design-system.json` → UI map → detected theme). It orchestrates
   `figma-foundations`, `figma-mirror` and `figma-coverage`, in that order,
   treating the maps as a hard prerequisite instead of falling back to a grep
   inventory. It is the only step in the whole sequence that calls `use_figma`
   to write — everything before it is code only.
3. Code Connect on the kit primitives (`figma-pull`, section 4) — paid once, it
   makes every later round cheaper.
4. Conventions written in the file itself (`figma-conventions`) — a note on the
   canvas plus `.description` on the kit components, and the structural
   contract (page, name, position; reusing vs. creating a kit component), so
   that a human designer or another agent who opens the file cold, without the
   DSX, knows the page/frame naming pattern and does not unknowingly break the
   round trip's pairing.
5. First committed baseline (`tools/figma/snapshot.js` with `MODE = 'full'`).
6. Sync record created, plus the first line in
   `design/figma-changelog.jsonl` and the first `design/figma-reference.json`
   (skill `figma-conventions`) — the three are born together, not in separate
   rounds. `turn: design` only if the mirror actually covered everything it set
   out to (check the coverage matrix, and whether any screen/flow/state was
   explicitly deferred instead of built) — list what is left in `## Pending`
   and keep `turn: code` until it is empty. A large first mirror usually runs
   in several agent passes with a fixed budget each; it is normal for one of
   them to defer part of its own scope, and normal for that to still need a
   follow-up pass before the file is ready to hand to a designer.
7. Agree out loud on the two rules nobody reads later: **never re-mirror on the
   design's turn** and **regenerate the baseline when closing the round**.
