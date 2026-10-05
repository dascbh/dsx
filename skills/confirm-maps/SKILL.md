---
name: confirm-maps
description: "Confirms with the user what the project maps inferred, cross-checking specs and docs, and writes the AS-IS/TO-BE to design/as-is-to-be.md. Use after /dsx:map-ux, when accuracy matters before building or pushing to Figma."
argument-hint: "[path to limit the scan, optional — defaults to the whole project]"
---

# confirm-maps — the guided handoff from discovery to work

> **DSX root:** two levels above this skill's base directory. Paths `knowledge/`, `patterns/`, `tools/`, `templates/` are relative to it; unprefixed paths (`design/`, `.dsx/`, `src/`) belong to the user's project.

**Before anything else, say which project this is running against** —
directory name and path — as the first line of your response. This step is
long and talks to the user several times across several rounds; in a
session that switches between more than one project, staying quiet about
which one is active is exactly how that confusion happens mid-run.

`map-ux` is silent because it is fast and cheap to rerun — a wrong guess
costs nothing, since nobody reads the maps without confirmation. But
`figma-mirror`, `figma-pull` and `build-ui` will act on `flows.md`,
`tasks.md` and `domain.json` as if they were fact. Wherever those files are
actually inference — a flow named by guesswork, a dependency read from UI
text, a relationship assumed from the shape of an API — that inference
needs a person to look at it once, on purpose, before work starts leaning
on it.

This skill is that once. It is the only discovery step that talks to the
user — not an oversight, the whole point.

## The four phases

1. **Refresh discovery.** Rerun `map-ux`, so everything below starts from
   the project's current state.
2. **Cross-check.** Run `spec-analyzer` against the six maps and whatever
   specs/docs the project has.
3. **The wizard.** Reapply what was already confirmed in a previous run
   (`map-ux` has just reduced everything to guesses again), then confirm or
   correct what remains — what the maps themselves flagged as uncertain,
   plus what `spec-analyzer` found.
4. **Write the baseline.** `design/as-is-to-be.md` — the AS-IS, any TO-BE
   intent the wizard surfaced, and what remains open.

## 1. Refresh discovery

Run `/dsx:map-ux` in `full` mode (pass the scope, if any). Wait for it to
finish before continuing — the wizard is only as good as what discovery
found. This is the one case where rerunning, even if it ran a few minutes
ago, is the right default: this skill's whole job is accuracy, and
discovery is usually cheap.

"Usually" — on a large project it is not. Five mapper agents in parallel on
a wide, deep codebase have each taken over twenty minutes in practice, and
`map-ux` has just run them once. If `/dsx:map-ux` ran in this same session,
moments ago, with no code changes since, tell the user frankly how much
rerunning will cost (a real estimate, based on what you just saw it take)
and offer to skip straight to phase 2 using the maps already on disk. Do
the full refresh by default if they do not answer — accuracy is still this
skill's goal — but never silently spend that time on their behalf without
giving them the choice.

This step has a consequence that phase 3 must undo: the `map-ux` agents
always **fully regenerate and overwrite** `flows.json`, `tasks.json` and
`domain.json` from scratch, with no memory at all of what a person
confirmed in a previous run of this skill. Left alone, that would silently
revert every past confirmation to a raw guess. Phase 3's confirmations
ledger exists precisely to survive that and restore the confirmed
corrections.

**Compatibility with the previous flow:** when looking for a map or the
ledger, read `.dsx/maps/` first; if it does not exist, accept the legacy `.dsx/mapas/` (Portuguese names: `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes`; old camelCase JSON keys such as `generatedAt` or `subPages` count as the new snake_case ones; all with the warning "old name, rename to X") and `.claude/figma-claude/` (`user-flows.*`, `task-flows.*`, `domain-map.*`,
`confirmations.json`…) and warn that it will be rewritten at the new path.
This skill always **writes** to `.dsx/maps/` — in particular, a legacy
`confirmations.json` is read as the ledger and rewritten as
`.dsx/maps/confirmations.json` at the end of phase 3, without losing any
item.

## 2. Cross-check specs and docs

Run the `spec-analyzer` agent (`agents/spec-analyzer.md`). It reads the six
maps plus the docs `project-mapper` found and returns a list of
divergences — a spec describing something no map has, a map with no doc at
all behind a consequential rule, terminology that drifted between a doc and
the code. It is a report, not a file: fold it directly into the next
phase's list of open questions.

## 3. The wizard

### Gather the open questions

Collect, from whichever exist:

- the `uncertain` array of `.dsx/maps/flows.json`
- the `uncertain` array of `.dsx/maps/tasks.json`
- the `uncertain` array of `.dsx/maps/domain.json`
- the `spec-analyzer` divergence report

That is the full candidate list. Prioritize: business rules and entity
relationships first (wrong ones cost the most later — money, permissions,
irreversible actions), then dependencies between tasks, and finally flow
names and terminology drift (the cheapest to get wrong, and the cheapest
to fix later too).

### The confirmations ledger

Every candidate coming from the three mapper files carries a `key` — a
structural identifier (a chain of routes, a task's location, an
entity/relationship pair), not free text. That key is what makes reruns
safe: wording changes between runs of the same mapper agent even when
nothing in the code changed, so matching by phrase similarity does not
work — matching by key does.

`.dsx/maps/confirmations.json` is a ledger **owned exclusively by this
skill** — `map-ux` and its agents never read or write it. Its job is to
survive what phase 1 just did: `map-ux` reducing the three source files to
raw, unconfirmed guesses. Format (the JSON keys are machine contract; the
value of `map` is the map's name in DSX, and on read the legacy names `user-flows`, `task-flows` and
`domain-map`, and the Portuguese names `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, count as `project-map`, `ui-map`, `flows`, `tasks`, `journey`, `domain`, with the warning "old name, rename to X"; old keys `confirmedAt`/`leftOpenAt` count as `confirmed_at`/`left_open_at`):

```json
{
  "confirmed": [
    {
      "map": "flows",
      "key": "flow:/demands->/demands/new->/demands/:id",
      "why": "no explicit label in the code for this sequence; named from the route/button text",
      "resolution": "confirmed as-is",
      "confirmed_at": "2026-08-18"
    }
  ],
  "open": [
    { "map": "domain", "key": "entity:Demand/relationship:Item", "item": "type of the Demand -> Item relationship (1:N)", "why": "no formal schema found; inferred from the nested shape of an API response", "left_open_at": "2026-08-18" }
  ]
}
```

`resolution` is `"confirmed as-is"` (literal value, machine contract) or
the correction itself, in the user's words when they gave one. `why` is
stored verbatim, as it was in the candidate at confirmation time — it is
the baseline the next run compares against to detect drift, so never
paraphrase it in the entry.

### Reapply before asking anything

Before the wizard opens, walk every fresh candidate against the ledger by
`key` — this happens on every run, even if in the end nothing new needs to
be asked:

- **Key found in `confirmed`, `why` text same as stored** → do not ask.
  Instead, immediately write the ledger's stored `resolution` into the
  freshly regenerated source file, the same way phase 3's "Apply the
  answers" would, then remove the item from that file's `uncertain` array.
  This step is what actually undoes phase 1's overwrite — silently skipping
  the question is not enough on its own, because the source file still
  needs the confirmed value back.
- **Key found in `confirmed`, but the `why` text differs from the stored
  one** (the code has changed since) → do not reapply; queue it for the
  wizard and say so when asking: *"you confirmed this before, but the code
  behind it has changed since — worth a second look."*
- **Key found in `open`** → goes back into the wizard queue, but do not
  flood the session with a verbatim repeat of every declined item on every
  run; after the first re-offer, a short "still open: N items, want to
  revisit any?" is enough.
- **Key that appears nowhere in the ledger** → new; enters the wizard queue
  normally.
- **A ledger key that no longer appears among this run's fresh
  candidates** (the route/task/entity it referred to no longer exists in
  the code) → retire it from the ledger; do not carry an orphaned
  confirmation forever.

This — not the wizard itself — is the mechanism that makes this skill safe
to rerun: it never regresses a confirmed fact to a raw guess, and never
silently drops one that was left open.

### Ask

Use `AskUserQuestion`, in batches of a few items (the tool accepts at most
4 per call), with whatever is left in the queue after the reapply pass
above, highest priority first. Give the user a real option to say "I don't
know, leave it as inferred" — do not force a guess out of them. For
anything with honestly open options (the real name of a flow, the exact
wording of a business rule), let the free text (`Other`) carry the answer
instead of boxing it into multiple choice.

Keep proportion: a project with 3 items in the queue gets 3 questions, not
an inflated wizard. One with 40 gets the first ~15 (by the priority order
above) and an explicit note that the rest stayed inferred — never truncate
the list silently.

### Apply the answers

For every item resolved in this round: edit the real entry in the source
file (`flows.json`/`.md`, `tasks.json`/`.md` or `domain.json`/`.md`)
directly — apply the correction, if there was one, then remove the item
from that file's `uncertain` array — **and** add or update its record in
the `confirmed` array of `.dsx/maps/confirmations.json` (key, map, `why` as
it was in this run, the resolution, today's date). Skipping the ledger
write is what caused the state-loss failure this mechanism exists to
prevent — an edit only to the source file does not survive the next
`map-ux`.

For whatever the user explicitly left open: keep it in the source file's
`uncertain` array, record it in the ledger's `open` array, and carry the
**same original `item`/`why` text** (verbatim — never a new sentence
synthesized from the conversation) into the "Open questions" section of
`design/as-is-to-be.md`, so it is visible without digging through four
files.

## 4. Write the baseline

`.dsx/maps/confirmations.json` (written in phase 3) is now the durable,
item-by-item record — `design/as-is-to-be.md` stays a short summary that
points to it, the same relationship the six maps already have with
`project-map.md`/`ui-map.md` etc.: an index, not a duplicate.

Create `design/as-is-to-be.md` (or update it in place, if it already
exists — this file is long-lived, not regenerated from scratch like the
maps in `.dsx/maps/`). If only the legacy `design/figma-harness.md` exists,
read it as a starting point (its validation history still counts), write
the updated content to `design/as-is-to-be.md` and warn that the old file
can be removed. The header lines use the English map names; an old header
(`validado`, `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`,
`dominio`, `confirmacoes`) is read with the warning "old name, rename to X"
and rewritten with the new names. Old Portuguese section headings
(`Perguntas em aberto`, `Histórico de validação`, `Passagem`) are read as
their English counterparts and rewritten in English:

```markdown
# AS-IS / TO-BE

validated: 2026-08-18
project-map: .dsx/maps/project-map.md (generated 2026-08-18)
ui-map: .dsx/maps/ui-map.md (generated 2026-08-18)
flows: .dsx/maps/flows.md (confirmed 2026-08-18)
tasks: .dsx/maps/tasks.md (confirmed 2026-08-18)
journey: .dsx/maps/journey.md (generated 2026-08-18)
domain: .dsx/maps/domain.md (confirmed 2026-08-18)
confirmations: .dsx/maps/confirmations.json

## AS-IS

What the product is today, according to the maps above, in a few bullets —
a pointer and a summary, not a duplicate of the maps themselves.

- 12 routes across 2 personas (requester, admin); 9 modals; 41 components
- Domain: 9 entities (Demand, Item, Customer, …), 22 business rules
- 3 uncertain items resolved this round, 1 left open (see below)

## TO-BE

Product intent the wizard surfaced, if any — changes the user said are
coming, not yet reflected in the code. `Nothing declared` if the
conversation brought up nothing forward-looking; do not invent a roadmap.

## Open questions

Items the user explicitly left unconfirmed, with the reason, so the next
round knows they are still fragile:

- type of the Demand -> Item relationship (1:N) — the user was not sure
  whether an Item can belong to more than one Demand; there is no schema to
  check.

## Validation history

- 2026-08-18 · confirm-maps · 14 items reviewed, 13 confirmed, 1 left open

## Handoff

This file is the single snapshot of the foundation — it is not touched by
individual mirror/return rounds. From here on, `/dsx:figma-init` opens the
first round of the cycle, and `design/figma-sync.md` (skill `figma-cycle`)
records every round after that. Do not duplicate round-by-round changes
here; append to the Validation history only when `confirm-maps` runs
again.
```

Keep the AS-IS section genuinely short — it is an index of the six maps,
not a rewrite of them. If it grows beyond what fits on one screen, that is
a sign it is duplicating content that already lives in the maps.

## Non-regression rules

- **Never touch `design/figma-sync.md` or the Figma-side baseline
  (`design/figma-baseline/`).** Those belong to the `figma-cycle` skill and
  only exist after `/dsx:figma-init` has run. If `figma-sync.md` already
  exists (the cycle is already live), this skill still runs safely — it
  only writes to the maps in `.dsx/maps/`, to
  `.dsx/maps/confirmations.json` and to `design/as-is-to-be.md`, never to
  the sync log, and never changes `turn:`.
- **An entry in the rejected-proposals section of `design/figma-sync.md`
  (`Rejected`, or `Recusadas` in older files), if it already exists,
  outweighs a wizard guess.** If a proposal was already explicitly rejected
  in a live cycle, do not let the wizard's inference reopen it — check
  `figma-sync.md` before applying a correction that touches the same
  ground.
- **Never call `use_figma`.** This skill is code and docs only, like
  `map-ux` — it never needs the turn and is safe at any turn of the cycle.
- **Never silently overwrite a confirmed fact.** `map-ux` regenerates
  `flows.json`/`tasks.json`/`domain.json` from scratch on every run and has
  no memory of what a person confirmed — that memory lives entirely in
  `.dsx/maps/confirmations.json`, which only this skill writes. The prose
  in `design/as-is-to-be.md` is a summary for people; the ledger, matched
  by `key`, is what phase 3 actually compares against. If the ledger is
  lost or deleted (and there is no legacy
  `.claude/figma-claude/confirmations.json` to read), treat every item as
  new — do not guess what was confirmed from the prose alone.

## Handoff

Tell the user, in a few lines, what was confirmed and what remains open —
this is the only discovery step allowed to talk, so use that, but keep
proportion to what actually happened (a few lines, not a transcript of the
wizard). Then point to the next step: `/dsx:figma-init` if the project is
entering the cycle with Figma; otherwise, the working skill that motivated
the validation (`build-ui`, `design-md`, `review-ux`…), which now reads
confirmed maps.
