---
name: figma-pull
description: "Brings changes from Figma into the code at the right layer (token, component, screen, text), with the DSX gates and rejections recorded. Use when asked to apply in code what changed in Figma."
argument-hint: "[frames or diff report]"
---

# figma-pull — apply in the right place, not where the change showed up

> **DSX root:** two levels above this skill's base directory. Paths `knowledge/`, `patterns/`, `tools/`, `templates/` are relative to it; paths without a prefix (`design/`, `.dsx/`, `src/`) belong to the user's project.

The mistake that defines this phase: someone changed the spacing on one screen in Figma, and
you change the spacing of **that screen** in code. Three rounds later the app
has five different spacings for the same case and the design system is dead.

A visual change that appears on three screens is a change to a **primitive or a
token** — almost never to a screen.

Round summary (the rest of the skill details each step):

- Start from the diff report (`/dsx:figma-diff`), not by eye: comparing
  two frames side by side finds the big changes and misses the 2px ones, which are the
  ones that break the design system.
- Mandatory order: **token → primitive → composition → text**. That way the
  composition already uses the new piece.
- Stop and send back, instead of applying, anything that lowers contrast, removes the second
  channel of a state, creates a pattern that does not exist in the kit, contradicts a pattern
  marked `avoid` in the catalog, changes a token without anyone having looked at the effect on the
  other screens, or undoes a finding already recorded as intentional.
- Close the round: verify by re-mirroring the touched screen, update
  `design/figma-sync.md` (applied, rejected **with reason**, turn → `code`),
  regenerate the baseline, append the line to the changelog and record the findings.

## Before anything else

Load the **`figma-design-to-code`** skill before calling `get_design_context`.
It is a mandatory MCP prerequisite and prevents implementation by guesswork.
For any `use_figma` (snapshot, re-mirror), load **`figma-use`** first.

Check the turn in `design/figma-sync.md`: the pass back runs with `turn: applying`
(switch with `/dsx:figma-turn applying` — the switch requires the diff report
produced and reviewed). With the turn at `applying`, nobody touches the same
files from outside. A legacy registry with `vez: aplicando` counts as `turn: applying`.

Also read `design/figma-changelog.jsonl` (the last round: `summary`,
`direction`, `findings` pointer) and the `design/figma-findings/<round>.md` it
points to — that is where something that would look like a new divergence may
already be explained, or a proposal that was already rejected with a reason.

Useful tools in this direction:

| tool | what for |
|---|---|
| `get_design_context` | the frame's structure and values — the main read |
| `get_screenshot` | what the thing should look like, to check at the end |
| `get_variable_defs` | which variables the frame uses — this is what tells you whether it became a token |
| `get_code_connect_map` | which code component already corresponds to which Figma component |
| `get_metadata` | a shallow map when you do not yet know which node to enter |

## 1. Find out what changed — from the diff, not by eye

If the project maintains the cycle (`figma-cycle` skill), **start from the diff
report**: a new snapshot compared to the versioned baseline returns the exact list of
changes, already grouped. Do not try to find the difference by looking at two frames side
by side — you find the big ones and miss the 2px ones, which are precisely the ones that
break the design system.

```bash
# current snapshot via use_figma with tools/figma/snapshot.js
# (MODE='hashes' → then 'full' on the changed frames)
node <DSX>/tools/figma/diff-baseline.cjs \
     design/figma-baseline/app.json /tmp/atual.json
```

When the diff is large enough to pollute the conversation, delegate to the
`figma-reader` agent: it takes the snapshot, runs the diff and returns only the
classified report.

No baseline (first pass back, or a project without the cycle set up): ask the user for the
list of changed frames and read the frame **and its counterpart in the mirror**. Sweeping
the whole file looking for differences is expensive and error-prone — and it is the sign that
it is worth setting up the cycle (`/dsx:figma-init`) before the next round.

Proposals the designer left on the `09 · Propostas` page follow the format of the
`figma-proposals` skill; read each one together with the source frame it cites.

## 1b. Prove in the code that the divergence exists there

**An audit done on the mirror may be measuring the mirror.** Before accepting
any finding as a product change, confirm in the code that the problem exists
there — it costs a `grep` and avoids changing the whole app because of a drawing defect.

Signs that the finding belongs to the mirror, not the app:

- **The variation disappears in code.** "Buttons with three heights in dialogs" usually
  turns out to be a single `<Button>` without `size`; the variation came from the helper that drew it.
- **The asymmetry has no product logic.** Two variants of a component
  changed and the third did not — nobody decides that; a tool does. (The MCP
  server's automatic componentization is suspect number one.)
- **The finding contradicts a recorded decision** (ADR, `DESIGN.md`, foundation
  document) without the proposal citing that decision. The designer was not
  disagreeing: they were describing what they saw.
- **What the proposal asks for already exists** on the code side, and was only missing in Figma.

When it is mirror noise, the outcome of the round is not code: it is **fixing the
mirror** so the next audit measures the app — and telling the user so with the
proof, not as an opinion. Record it under `Rejected` with the evidence, otherwise the same
proposal comes back in the next round with more conviction.

## 2. Classify each change before writing a single line

This is the phase that decides the quality of the result. When the diff exists, it already
delivers the classification — the **same change in ≥ 2 frames** falls into
`primitive`, a change to a variable or style value falls into `token`, and the rest is
`composition`. Check the judgment, do not redo it.

| class | signal | where to apply | how, in DSX |
|---|---|---|---|
| **token** | color, radius, spacing, font size/weight, elevation | the DTCG tokens (or the theme file) — and add the whole-app regression sweep to the scope | `tokens` skill + `figma-to-tokens.mjs` + `build-tokens.mjs` (section 3a) |
| **primitive** | a kit component changed, or the same adjustment appears on ≥ 2 screens | the shared component, once | `build-ui` skill rules + `lint-raw-values` |
| **composition** | order, grouping, what appears and what disappears on a specific screen | that page's file | `build-ui` skill rules + `lint-raw-values` |
| **text** | label, microcopy, error/empty message | the string at its source — never duplicated on the screen | `ux-writing` skill (glossary, formulas) |
| **new pattern** | no primitive solves it | **stop and propose**; do not invent a component in the middle of a screen | `patterns/index.json` first; new rule → `DESIGN.md` via the `design-md` skill |
| **behavior** | new screen, different arrangement or archetype, primary action somewhere else, state or flow | the screen and `UX.md` (screen row, policy or deviation) | `ux-md` skill + `ux-lint/screen.mjs` on the capture; a contradicted policy without changing `UX.md` is a rejection |

Write the classification before coding and show it to the user when there is a
`token` or `new pattern` in the list — both cost far beyond the screen where they
appeared.

### Each proposal against the pattern catalog

Before accepting an interaction proposal (not only a visual one), look up the decision
it makes in `patterns/index.json` (fields `id`, `rule`, `status`) and open the
card (`file`) when the case is not trivial. Examples:

- form error that started appearing in a toast → `toast-vs-inline-alert`
  (a field error stays next to the field, not in a toast that disappears);
- long form moved inside a modal → `when-to-avoid-modal`;
- deletion that gained a confirmation dialog on a routine action →
  `confirm-deletion` / `undo`;
- button that became icon-only → `icon-only-button`.

A proposal that contradicts a pattern with `status: "avoid"` (or an `anti-pattern`)
**comes back as a gate**, with the pattern `id` and the rule in the reason. A proposal that falls
under a `caution` pattern passes, but the reason for the exception must be
written down — read the card's **Decision** section and check whether the case fits.

## 2b. A new screen is not a change — it is a different job

The diff includes a `New frames in Figma` section. Do not implement directly: a new
frame can be four things, and three of them do not become a route.

| it is | how to recognize | what to do |
|---|---|---|
| **new route** | content and purpose that no screen covers | treat it as a feature, not an adjustment (below) |
| **new state** of an existing screen | same screen in another situation (empty, error, permission) | implement it inside the route that already exists |
| **exploration** | two or three versions of the same frame | ask which one won; the others do not become code |
| **duplicate** | solves what a screen already solves, under another name | product decision — do not create the second one |

For a new route, the frame **is not enough**. Before writing any line, collect
what Figma does not carry: route and entry/exit navigation, data source,
role that has access, states (empty, loading, error, no permission),
behavior of the actions and what is irreversible, and what happens on a narrow
screen. `.dsx/maps/flows.md` and `.dsx/maps/tasks.md` may already answer
where it connects and what its steps are; `.dsx/maps/domain.md` (or
`domain.json`) may already answer where the data comes from. Check them before
asking. What none of them covers is a question for the user, not an invention of yours.

**Compatibility:** when looking for a map, read `.dsx/maps/` first; if it does not
exist, accept the legacy `.dsx/mapas/` (Portuguese names: `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes`; old camelCase JSON keys, such as `generatedAt` or `subPages`, count as the new snake_case ones; all with the warning "old name, rename to X") and `.claude/figma-claude/` (`user-flows.md`,
`task-flows.md`, `domain-map.md`, `ui-map.json`, `project-map.json`) and warn that
it will be rewritten to the new path on the next run of `map-ux`.

If the project does not have that skeleton yet — because it was born in Figma —, the
whole procedure is the `figma-first` skill, not this one.

## 3. Apply

In order: token → primitive → composition → text. That way the composition already uses the
new piece, and you do not write the same adjustment twice.

### 3a. Token

With DTCG tokens in the project, do not edit the JSON by hand from what you read in the
frame — generate the diff from the snapshot:

```bash
# full snapshot (MODE='full') saved from use_figma with tools/figma/snapshot.js
node <DSX>/tools/figma/figma-to-tokens.mjs --snapshot /tmp/atual-full.json --tokens tokens/
```

The bridge compares the snapshot's variables with the tokens and prints the changes
per token — value or alias, per `Claro`/`Escuro` mode (`color/text/primary` in
Figma = `color.text.primary` in DTCG), plus the **New variables in Figma**
(with no matching token), the **Suggestions** (raw value that should be an alias
to a primitive) and the **Tokens without a Figma variable**. Review the list with the
user (a token is a whole-app change) and only then write:

```bash
node <DSX>/tools/figma/figma-to-tokens.mjs --snapshot /tmp/atual-full.json --tokens tokens/ --write
node <DSX>/tools/build-tokens.mjs --tokens tokens/
```

With `--write`, the bridge only changes **existing** tokens and runs the
contrast gate from `contrast-pairs.json` (exits with code 1 if any pair fails; then
revert the token files with `git checkout` and send the proposal back). A new
variable in Figma never becomes a token automatically: it is the `new pattern` class /
a decision — create it through the `tokens` skill, if approved, and run the bridge again.

From then on the `tokens` skill applies: a component never consumes a primitive, the dark
theme has the same keys as the light one, and every new pair is declared in
`contrast-pairs.json`. **`build-tokens.mjs` failing on contrast blocks the
change** — do not "fix" it by adjusting the pair by hand to pass; send the
proposal back with the measured reason. If the change altered a color's role (where it
may or may not appear), update the **Colors** table in `DESIGN.md` through the
`design-md` skill.

Without DTCG tokens (MUI theme, Tailwind, loose CSS variables), apply it in the project's theme
file, in its format, with the same layer rules as the `tokens` skill,
and check each affected pair with `tools/contrast.mjs`.

### 3b. Primitive and composition

The `build-ui` skill rules apply: semantic tokens only, all mandatory states
(empty, loading, error, success, focus, disabled), reuse of the
kit before new markup. When you finish, run
`node <DSX>/tools/lint-raw-values.mjs <touched files>` — a raw value that came in
this round is a regression.

### 3c. Text

Every new or changed string goes through the `ux-writing` skill: the project
glossary (same concept = same word on every screen), formulas for button,
error, empty and confirmation. The frame's text is a proposal, not final copy — if it
contradicts the glossary, the glossary wins and the divergence goes in the reason.

### Rules that always apply

- **Tokens only, never raw values.** If Figma shows `#007a00`, find the token that
  has that value and use the token. If there is no token, it is a token change (class
  above), not a hex in the middle of the JSX.
- **Reuse the primitive.** Before writing new markup, look for the component that
  already solves it. Figma frequently describes a `Card` the kit already has.
  `.dsx/maps/ui-map.json`, if it exists, already has the component kit
  categorized; `.dsx/maps/project-map.json` at least has where the components
  live.
- **Do not bring from Figma what Figma does not know.** Loading state, error,
  empty, focus, keyboard, screen reader, responsive behavior beyond the drawn
  frame — none of that is there. Preserve what the code already does; a frame that
  does not show the empty state is not an order to remove it.
- **Contrast is a regression, not taste.** Do not trust your eye — measure:

  ```bash
  node <DSX>/tools/contrast.mjs "#767676" "#ffffff"   # AA/AAA for text, large text and UI
  ```

  If the change drops a text/background pair below 4.5:1 (3:1 for large text
  or a UI component), do not apply it: record it and send it back. This holds even when
  it looked better.
- **A new usage rule is documentation, not just code.** A new component, new variant
  or token with a new role that the round approved → update `DESIGN.md`
  through the `design-md` skill (components: variants, states, contraindications;
  colors: the Colors table). Without that, the next agent that builds a screen does not
  know the rule exists. The same goes for behavior: a new screen, arrangement
  or action/state policy that the round approved → update `UX.md` through the
  `ux-md` skill (and bump `version`).

## 4. Code Connect — pay once, reap forever

If the project is going to do this more than once, map the kit primitives to
the Figma components (`add_code_connect_map`). From then on
`get_design_context` returns the code component's name instead of a
frame tree, and applying stops being translation.

Map the kit (button, chip, card, field, table), not the screens.

## 5. Verify by closing the cycle

Run the app and look. Then **re-mirror the touched screen** (`figma-mirror` skill,
only that frame) and compare it with the proposal side by side. If the two do not match,
one of them is wrong — and you find out now, not in the next round.

Check both themes if the project has dark mode: a token swapped without looking at
dark mode is the most common way to introduce poor contrast.

Run the touched screens through the `accessibility` skill: visible focus, tab
order, target ≥ 24×24 px (44 px on touch — `touch-target` pattern),
state never communicated by color alone (`not-color-alone` pattern). A proposal that removed
the second channel of a state does not pass, even if the diff shows it as approved by the
designer.

## 6. Send back what was not applied

Every rejected proposal comes back with a reason, one line each:

```
Rejected this round
- Status chip without border (frame 09/03) — color would no longer be accompanied
  by shape; the outline is the second channel (not-color-alone pattern).
- Table density at 24px (frame 09/07) — the product's register is a dense
  console; it would change the scale of every list, not just this one.
- CPF error in a toast (frame 04/02) — contradicts toast-vs-inline-alert: a field
  error stays next to the field.
- color/text/muted → neutral/500 (token) — build-tokens failed: 3.9:1 on
  color/bg/canvas, minimum 4.5:1.
```

Without this the same proposal comes back in the next round, and nobody remembers why
it was rejected the first time.

## Wrap-up

Update the project's sync registry (`design/figma-sync.md`, `figma-cycle`
skill): what was applied, what was rejected **with reason**, and who gets
the turn next (`turn: code`). Without this step, the next mirror round wipes out the
design work that just became code. Regenerate the baseline
(`design/figma-baseline/`) from the file as it now stands — a stale baseline makes the
next round present everything you just applied as new.

Also close with a new line in `design/figma-changelog.jsonl`
(`direction: "figma->code"`, `tokens_changed` with the names of the variables the
bridge wrote) and, if any finding did not become code this round (out of scope,
needs a product decision), record it in `design/figma-findings/<round>.md`
with the 0–4 severity of the `review-ux` skill — it is the same format the outbound pass uses, and
it is what lets the next agent (on either side) know what has already been seen and
rejected without reopening the investigation from scratch. If the round changed the
file's foundation or structure, regenerate `design/figma-reference.json` (`figma-conventions`
skill).
