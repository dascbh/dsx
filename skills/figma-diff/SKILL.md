---
name: figma-diff
description: "Takes the current snapshot of the Figma file and compares it with the versioned baseline, producing a report already classified into token, primitive and composition. Use to see what changed in Figma before bringing it into the code."
argument-hint: "[pages or frames to limit to, optional]"
---

# figma-diff — what changed in Figma since the baseline

> **DSX root:** two levels above this skill's base directory. `knowledge/`, `patterns/`, `tools/`, `templates/` paths are relative to it; paths without a prefix (`design/`, `.dsx/`, `src/`) belong to the user's project.

Produce the diff report for the Figma file. Mechanism in
[../figma-cycle/references/diff.md](../figma-cycle/references/diff.md).

Before starting, read `design/figma-sync.md` (the file and the baseline of
record) and the last line of `design/figma-changelog.jsonl` — the `summary` and
`direction` of the last round, and the pointer to findings that may already
explain something that would look like a new divergence. A diff is a read: it
runs on any turn, including `design` — the `turn-guard` hook lets through
whatever does not write to the file.

1. **Phase 1 — hashes.** Paste `tools/figma/snapshot.js` with `MODE = 'hashes'`
   into a `use_figma` (load the `figma-use` skill first). Small response.
   Compare each `frames[key].hash` with the baseline's.
2. **Phase 2 — detail.** Only for frames whose hash differs from the baseline:
   run again with `MODE = 'full'` and `TARGETS` filled with those frames (it
   accepts `"Page › Frame"` or just the frame name). Save the return to a
   temporary file. If the response truncates because of size, split `TARGETS`
   into smaller batches and merge the `frames` into a single JSON.
3. **Comparison.**

```bash
node <DSX>/tools/figma/diff-baseline.cjs design/figma-baseline/<file>.json /tmp/atual.json
```

The script is `.cjs` on purpose (the DSX `package.json` is `"type": "module"`)
and accepts baselines from the previous flow with pt-BR keys. If the baseline
was taken with hashes only, the changed frames appear under "Changed, but the
baseline has no detail" — the signal to detail them with `TARGETS` in this round
and regenerate the full baseline for those frames when closing.

Deliver the report to the user **without applying anything** and point out, in
one line, what is `token` (affects the whole app — requires a sweep in both
themes), what is `primitive` (≥ 2 frames — apply once to the shared component)
and what is `composition` (1 frame). If the "Possible naming problem" section
appears, say so: the `Type · instance` convention was violated, and because of
it the diff is failing to group a primitive (skill `figma-conventions`). If
there are new frames, remind the user that a new screen is not a change — triage
lives in `figma-pull`. A mass `FRAME`→`INSTANCE` change is the MCP's automatic
componentization: noise, not a design decision.

When the inventory or the diff is large enough to pollute the conversation,
delegate both phases and the comparison to the `figma-reader` agent and bring
back only the report.

Optional scope: $ARGUMENTS
