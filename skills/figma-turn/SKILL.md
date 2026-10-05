---
name: figma-turn
description: "Reads or changes whose turn it is in the Figma cycle (code, design, applying), validating what the change requires. Use when handing the file over to design or when closing a refinement round."
argument-hint: "[code|design|applying]"
---

# figma-turn — read or change the turn

> **DSX root:** two levels above this skill's base directory. `knowledge/`, `patterns/`, `tools/`, `templates/` paths are relative to it; paths without a prefix (`design/`, `.dsx/`, `src/`) belong to the user's project.

Read or change the turn in the sync record (`design/figma-sync.md` or
equivalent — the `turn-guard` hook also accepts the same
`figma-sync.md` in a `design` folder inside `docs`, or `.figma-sync.md` at the root). Doctrine in the `figma-cycle` skill.

The record accepts the old Portuguese names (`vez:` instead of `turn:`;
`codigo` → `code`, `aplicando` → `applying`) with the warning "old name,
rename to X". When writing, always write `turn:`
with the new value (`code | design | applying`). The argument also accepts
`codigo` and `aplicando`.

**No argument**: say whose turn it is, since when, and what that forbids right
now (table "The rule" in the `figma-cycle` skill). If `## Pending` has items,
say that too — it is the information that tells "go ahead" from "go back and
finish". If there is no record, say so: with no turn written down, nobody knows
whose turn it is, and the correct answer is to ask before writing on either side
(`/dsx:figma-init` creates the record).

**With an argument**, validate before writing — the change has prerequisites:

| to | requires |
|---|---|
| `design` | current baseline committed in `design/figma-baseline/` (otherwise the trip back's diff has no "before") **and** `## Pending` empty in the record — a committed baseline proves there is a "before" to diff against, not that this round finished what it set out to build |
| `applying` | diff report produced (`/dsx:figma-diff`) and reviewed |
| `code` | round closed: applied and rejected items recorded (with the gate that stopped each rejected one), baseline regenerated, one new line in `design/figma-changelog.jsonl`, findings saved to `design/figma-findings/<round>.md` if there are any |

If the prerequisite is not met, **do not change it**: say what is missing.
Changing the turn without a baseline is the silent way to lose the design's
refinement in the next round; changing to `design` with items in `## Pending` is
the silent way to make an unfinished round look closed — the next person to open
the file (or the agent's next session) has no way to tell "you can refine" from
"go back and finish this first". If asked to change to `design` anyway with
items in `## Pending`, say so explicitly and ask whether those items are
actually done (move them to the round's applied/covered record) or have just
gone out of scope (move them to `## Known divergences`, with a reason) — do not
change silently in either case.

How to check the baseline without guessing:

```bash
git status --short design/figma-baseline/      # empty = nothing pending commit
git log -1 --format='%h %ad %s' -- design/figma-baseline/
```

Record the date of the change in the `since:` field and one line of what
happened in the `## Rounds` section.

New turn: $ARGUMENTS
