---
name: rethink-ux
description: "Rethinks a screen or a whole flow like a senior designer: understands the task and the pain with evidence, diverges into 3 genuinely different variations (screen structure, flow split, behavior and text), builds each one with the project's real components through the capture harness, measures, runs the ux-lint detectors, compares them on one page and takes the chosen one to production. Use when asked to \"rethink a screen or flow\", for \"other versions\", \"variations\", \"how could it be\", or when a flow's findings call for a different solution rather than a patch."
argument-hint: "<module> <flow or screen>"
---

# Rethink UX

> **DSX root:** two levels above this skill's base directory. Paths `knowledge/`, `patterns/`, `archetypes/`, `tools/`, `data/` are relative to it; paths without a prefix (`UX.md`, `.dsx/`, `src/`) belong to the project; the capture and code folders come from `docs/project-paths.md`.

References: `knowledge/foundations/ux-variations.md` (axes, how to generate genuine alternatives, hypothesis and trade-off, pitfalls), `knowledge/foundations/ux-findings.md` (registry), `knowledge/foundations/psychology-and-laws.md`, `archetypes/`, `patterns/index.json`, `data/ux-dimensions.json` (`laws_index`).

**How it differs from its neighbors.** `audit-ux` finds and fixes element by element (previews per finding). `arrange-screen` reorganizes the regions of **one** screen within the same archetype. This skill changes the solution: a different screen structure, a different sequence of steps, different behavior and different text, for the whole flow. When the problem fits in a label or position swap, go back to `audit-ux`; rethinking is expensive.

## When to rethink instead of patching

- **IF** several findings in the same flow share the same cause (too many steps, decision in the wrong place, text explaining what the structure should show) **THEN** rethink: patching each one keeps the cause.
- **IF** the screen's archetype no longer matches the task (the card's `avoid-when` describes the actual use) **THEN** rethink.
- **IF** the owner asks for "a different look", "a different shape", "variations" **THEN** rethink, with the evidence from step 1 before drawing.
- **ELSE** (isolated finding, obvious fix) **THEN** `audit-ux` or `build-ui`.

## 1. Understand the task and the pain (evidence before ideas)

Write down, with a source for each line:

1. **Persona and frequency** — from `UX.md` (persona table) and the journey map. Daily or rare changes everything (wizard for a rare task, single page for a daily task).
2. **Task**, with a start and an end — from the map's journey (`.dsx/maps/flows-<m>.json`, `journeys[].steps`); note the `journey_ref`.
3. **How it is today**, measured: steps, clicks to completion on the happy path (count the journey's transitions), dialogs, primary actions, words per screen, decisions. This is the manifest's "Today" row.
4. **The pain**, from the open findings in the registry (`.dsx/findings/<m>/findings.json`) that touch the flow's screens: list ids, rules and severity. Group by cause. The ids go into the variants' `resolves`.
5. **Constraints** no variant may break: domain business rules, `UX.md` policies (primary action position, confirmation, mandatory states), accessibility.

Without a findings registry or captures of the flow, run `audit-ux` first (or at least the flow captures and `audit.mjs --register`): without evidence, a variation is a guess.

## 2. Diverge: three genuinely different variations

Three, no more, no less. Each has **one central idea** in one sentence (`concept`) and changes the four axes — **screen, flow, behavior and text** — coherently with that idea (axes and techniques in `knowledge/foundations/ux-variations.md`). Anchor each variant in the catalog: `archetype` (id from `archetypes/`), `patterns` (ids from `patterns/`, with or without the category: `undo` or `actions/undo`) and, when the idea comes from a law, `laws` (ids from `laws_index` in `data/ux-dimensions.json`: `hick`, `cognitive-load`, `fitts`…).

Generate the three from **opposing central ideas**, not from tweaks of one idea. A good trio usually has: one that **cuts** (fewer steps, less screen), one that **reorganizes** (different order, different starting point, different interaction model) and one that **changes the behavior** (undo instead of confirm, inline validation, background work). Each one writes a `hypothesis` (what improves and for whom) and `tradeoffs` (what gets worse; never empty).

**A fake variation does not count** (`validate` rejects the detectable ones):
- only changing color, icon, button order or spacing;
- changing only one axis (`validate` requires at least two axes and warns about what stayed still);
- reusing today's frames or another variant's;
- two variants with the same central idea in different clothes;
- a variant with no anchor in the catalog (archetype, pattern or law);
- a variant that breaks a constraint from step 1 (it is discarded, not compared).

### Falsifiable hypotheses and lenses (manifest format 2)

Each variant is a bet that can be proven wrong (Forward "Hypotheses" stage, USE-10). In a `"format": 2` manifest every variant declares, in plain words:

| Field | What it says |
|---|---|
| `audience` | who the variant is for (persona and situation) |
| `causal_bet` | what change causes which improvement, and why |
| `counter_hypothesis` | the strongest reason the bet could be wrong |
| `falsification_test` | the observation that would prove it wrong (a session, a measure, a threshold) |
| `expected_metric` | the number that should move, from the manifest metrics or a cycle criterion id |
| `guardrail` | what must not get worse |
| `lens` | one of Forward's lenses: `subtract`, `invert`, `analogous`, `constraint-first`, `object-first` — distinct per variant (variants sharing a lens count as one) |

The manifest also records the convergence the designer recommends — `"choice": { "variant": "<id>", "why": "…" }` — and what each discarded variant traded — `"rejected_tradeoffs": { "<id>": "…" }`. The owner still decides on the page. `validate` requires all of this from format 2 and only warns on format 1 manifests. Export the Forward view for the demand: `variations.mjs alternatives --root <project> --module <m> --flow <f> --out specs/<demand-id>/design/alternatives.md` (the `Lens:`, `Hypothesis:`, `Traded:`, `Chose:` lines Forward's divergence gate reads). The page shows the hypothesis under "Como saber se funciona" (pt-BR page text), without ids.

### Internal criticism (mandatory before the page goes to the owner)

Record in the manifest a `critique` block with six entries — `counter_case`, `unsupported_claims`, `failure_recovery`, `accessibility`, `domain_data`, `security_ops` — each `{ "status": "resolved" | "limitation" | "measurement", "note": "…" }`: resolved says what changed in the variants; limitation is said on the page as a risk; measurement becomes a falsification test or a cycle criterion with an unknown baseline. This self-check never replaces the isolated review (agent `ux-reviewer`, Forward `fde-review`).

## 3. Build with the real components

Each variant is **test code**, never production: assemble the screens with the project's components (the same ones from `src/components/` and the pages) and render them through the **capture harness**, like today's captures (`capture-from-code` skill, with `environment.tsx` and `serialize.ts` from `templates/capture/`). Code goes in `<tests folder>/capture/variants/<flow>/<variant>/*.tsx` (listed under `code` in the manifest). Always fictitious data, never a real client's name. No server, no text-to-screen generation, no mockup.

- A component that does not exist yet and the variant needs: assemble it from existing ones; if that is not possible, the variant says so in its trade-off (cost to build).
- Capture each frame to `<root>/.dsx/variations/<m>/<flow>/<variant>/<nn>-<frame>.html`; states with the conventional suffix (`<nn>-<frame>.<state>.html`, e.g. `04-tudo.draft-restored.html`), which is how the lint recognizes the captured state.
- **Behavior frames** are before/after pairs around an action: the `behavior` frame points to `behavior.before` and `behavior.after` (ids of frames in the same row) and the `action` in words ("clica em Gerar 4 pedidos", pt-BR example). Examples: undo instead of confirm; inline validation; generation progress; autosave.

## 4. Measure and verify

```bash
cd <project>/<folder-with-playwright>   # folder with the project's Playwright (screen cropping and geometry)
node <DSX>/tools/ux-lint/variations.mjs validate --root <project> --module <m> --flow <f>
node <DSX>/tools/ux-lint/variations.mjs measure  --root <project> --module <m> --flow <f>
node <DSX>/tools/ux-lint/variations.mjs lint     --root <project> --module <m> --flow <f>
```

- `validate`: frames and captures exist, `resolves` exists in the registry, archetype/patterns/laws exist in DSX, all six metrics present, rules against fake variation.
- `measure`: recomputes from the captures what can be measured and **shows the divergence** from what was declared, without overwriting it.
- `lint`: runs text (X), screen (T), states (S) and, with Playwright, layout (L) on each variant's frames; compares with today's frames and cross-checks with `resolves`.

**Acceptance rules for a variant** (`lint` exits with 1 if any fails):
- no **new** finding of severity ≥ 3 (a finding that does not exist today);
- none of the findings it claims to resolve **persists** (the detector still flags it, the cited text is still on screen, the required state still has no frame);
- new severity 2 findings appear on the page and go in as a trade-off, or the variant is fixed;
- `unverified` (flow, consistency, layout without geometry, review without text) is checked by judgment and stated in the report; it does not become "resolved" by omission;
- `suspect` (the resolved rule reappears with different text) is checked against the capture before accepting.

### How to count each metric

| Metric | How to count | Measured by the tool? |
|---|---|---|
| `steps` | distinct screens on the happy path, from entering the flow to the end (a dialog does not count as a screen; it counts under `dialogs`) | no, declared (a frame's `step` is the column label, not a count) |
| `clicks_to_done` | clicks and confirmation keys on the happy path, from task start to end (in the Today row, the journey transitions in the map; in the variant, the frame sequence). Typing a value does not count; choosing in a picker counts 1 | no, declared |
| `dialogs` | steps whose frame shows an open dialog (`dialog` selector from UX.md) | yes |
| `primary_actions` | the largest number of visible primary actions (`primary` selector from UX.md) on a single screen of the path (`screen` frames) | yes |
| `words_on_screen` | average, across `screen` frames, of visible words: with a dialog open, only the dialog; otherwise the content without `header` and `nav` (product chrome); excluding `aria-hidden`, `aria-live` and `legend`; including the value of text fields | yes (10% tolerance on divergence) |
| `decisions` | choices the person has to make on the happy path (template, recipients, confirming values…); accepting a default without touching it does not count | no, declared |

Write the method in `metrics_method` (free text, optional, **in business language**: the page shows it to whoever decides) when the scenario calls for a specific count; keys, selectors and file names go in `metrics_method_tech`, which only appears under "Para quem constrói" (pt-BR page section, "For builders"). The measurement uses the `screen` frames as the happy path: if the manifest counts a different set, the divergence shows up and must be explained. All metrics are "lower is better" on the page. A metric that gets worse on purpose (more words to explain a consequence, for example) goes into the trade-off.

**Rules for the numbers** (the page enforces them; the manifest cannot bypass them):
- **Count what can be checked.** List what was counted in `metrics_detail.<metric>` (e.g. `clicks_to_done: ["Gerar em lote", "Adicionar requisições", …]`, one item per click, from the frames and captions); the page shows the list in each version's details, and `validate` warns when the list length does not match the number.
- **Same end result or not comparable.** The number only compares if the version reaches the same task end (`done_label`, "o .zip com todas completas", pt-BR example). If the captured path ends differently (one order outside the .zip, one item fewer), recount including what is missing to get there; if the flow does not allow it, declare `metrics_detail.not_comparable.<metric>: "reason"`. The page marks "não comparável" (not comparable) with the reason and removes the version from the leader and the badge.
- **Headline number only with what is confirmed.** In "problems resolved", the number is what verification confirms; the ones that need checking appear next to it ("+ 6 a conferir", pt-BR page text) and never add up. The leader, the badge and the top sentence use the same criterion as the number shown.
- **Measured beats declared.** Words per screen show the measurement from the captures; a declared value that diverges appears as a warning on the number itself, not only in the footer.

## 5. Compare and decide

```bash
node <DSX>/tools/ux-lint/variations.mjs page --root <project> --module <m> --flow <f> --out <output.html> [--shots <folder>] [--product …] [--findings-page <url of the findings page>]
```

Whoever reads the page is the product person or the lawyer, not whoever built it: they need to decide in 2 minutes. **Rule: answer first, then detail; no ids or jargon up front.** A finding id, rule name (X6, L1), archetype or pattern id and tool term ("unverified", "suspect") never appear outside what is collapsed; in there, only as an anchor or hint. The page is end-user text and follows the project's language; the quoted labels below are the current pt-BR page text.

What the page shows, in this order:

1. **The answer** (first fold at 1440 px): the question in one sentence (`question`, or "Como <título> com menos trabalho?"), one sentence saying who leads each number, and one card per version (Hoje | A | B | C — Today | A | B | C) with name and idea, the screen **at the same moment of the flow in all four** (`hero`; without it, the frame of the variant whose `compare_to` is today's main screen), cropped to the part that matters (`compare_focus`) and with a visible "Ampliar" (enlarge), 4 numbers (screens, clicks to completion or to `done_label`, words per screen, problems resolved) with the difference from today written out ("▼ 5 · melhor"; color and arrow are never the only signal) and the "lidera" (leads) badge only on the best of each number (the others in normal weight: at most three strong emphases in the fold), and a line of **what it gains** (`gain`) and **what it costs** (`cost`). Without `gain`/`cost`, the page uses the first sentence of the hypothesis and the first trade-off, truncated: write both short (one line each), and check they are still true after recounting the numbers.
2. **One version at a time**, in tabs (←/→ on the keyboard; a picker on mobile): a slideshow-style step-by-step, with the trail in two groups: **Passos do fluxo** (flow steps: `screen` frames without an open dialog, numbered: "Passo 2 de 3", the same count as "Telas" on the card) and **Estados e comportamentos** (states and behaviors: states, dialogs and before/after pairs, unnumbered). A single count: the caption does not repeat "Passo X de Y" (the page strips it). The screen large and legible, **cropped to the content** (`main` region from UX.md; with a dialog open, the visible part with the dialog on top), a 1–2 line caption below. Behavior = "antes" and "depois" (before/after) side by side from 1200 px, with the action between them and what changed outlined (pixel difference computed at generation time; a concentrated change becomes a crop around it). **Comparar com hoje** (compare with today) puts today's screen for the equivalent step alongside (`compare_to`; otherwise the same step name; otherwise the position in the order), both cropped at the top (or at `compare_focus`), with "Ampliar as duas lado a lado" at real size; the button warns that it applies to all versions. A click enlarges to full screen, at natural width, with scrolling and pinch on mobile; the zoom caption says "Versão 2 de 4" with the name highlighted.
3. **Collapsed details**, in business language (uniform text, no change of color or size mid-sentence): what changes (screen, flow, behavior, text), why it might work (hypothesis), risks (trade-offs), problems it resolves with the problem's text in the product language and a badge ("resolvido", "continua" or "precisa conferir" saying what to check), new points of attention and the list of counted clicks. The technical part (`changes_tech`, archetype, patterns, finding ids, code) goes in **"Para quem constrói"**, collapsed; no `title` with code.
4. **Decision**: "Qual seguir?" (which one to follow) in the same order as the cards (Hoje, A, B, C), comment, mandatory "Quem decide" (who decides; no invented name), "Misturar partes" (mix parts) collapsed (per axis; when on, it disables choosing a whole version). The previous choice comes back with the notice "Retomamos sua escolha anterior" and "Limpar". **No terminal for the owner**: "Copiar decisão" and "Cole na conversa com quem conduz o projeto (ou envie por e-mail)"; the page says the choice is saved only in that browser; the decision file and the `import` command go under "Para quem constrói". No "JSON" on screen.
5. "Como os números foram contados" (how the numbers were counted) collapsed at the end, in the product language (method, persona, task, measured divergences and non-comparable numbers by the metric's name, never by its key); the technical part under "Para quem constrói".

Images: content crop at 1x (~1200 px wide), WebP quality 0.75, embedded; above ~10 MB the page splits (Today on every one). Images and the before/after difference are cached in `--shots` (default `<flow>/shots/`, outside git). The page comes out as a **complete document** (doctype, `<html lang="pt-BR">`, charset, viewport); `--fragment` strips page 1's skeleton to publish it as an artifact.

**Apply DSX to the page itself before delivering.** The comparison page is a screen like any other: copy the complete document to `caps/01-comparacao.html` and run `text.mjs --screens caps`, `screen.mjs caps`, `measure.mjs caps --out geo` (1440 and 390 wide) + `layout.mjs geo` and `tools/stitch/analyze-html.mjs caps/01-comparacao.html`, until severity ≥ 2 is at zero; then ask the `ux-reviewer` agent for an independent review (only the page, the screenshots and the audience). Check with screenshots (1440 × 900 for the first fold, one tab, "Comparar com hoje", one behavior, the decision, the zoom, dark theme and mobile with real emulation, `devices['iPhone 13']`) and iterate until the first fold answers on its own "which is better and why", the numbers match across summary, details and method, and the screens are legible.

The owner picks a whole variant or **composes per axis** ("fluxo de B, texto de A" — flow from B, text from A), with a comment, and copies the decision. Record it:

```bash
node <DSX>/tools/ux-lint/variations.mjs import --root <project> decision.json
node <DSX>/tools/ux-lint/variations.mjs decide --root <project> --module <m> --flow <f> --variant b --comment "…"
node <DSX>/tools/ux-lint/variations.mjs decide --root <project> --module <m> --flow <f> --compose screen=b,flow=b,behavior=a,text=a
```

This writes `<root>/.dsx/variations/<m>/<flow>/decision.json`. Do not build before the decision. Per-axis composition can produce an incoherent combination (text from A talking about a step B eliminated): describe the combination in one sentence and confirm with the owner before building.

## 6. Take it to production

Through the `build-ui` skill, with the decision as input: the variant's code is a composition reference (same components), never pasted from the test folder into production. In the **same commit**: the screen row and archetype in `UX.md` ("Screen archetypes" section — `Arquétipos de tela` in pt-BR files), the declared deviation when the choice violates a policy (`deviations` block + D… table), the flow map if navigation changed, `version` and `updated`. Then recapture the flow and run `audit.mjs --register`: the chosen variant's `resolves` ids must become `fixed`, with no regression.

## Manifest (`<root>/.dsx/variations/<module>/<flow>/variations.json`)

```json
{
  "format": 1, "module": "purchasing", "flow": "batch", "title": "Gerar pedidos em lote",
  "persona": "…", "task": "…", "journey_ref": "j-lote-por-modelo",
  "current": { "id": "current", "name": "Hoje",
    "frames": [ { "id": "f1", "step": "Escolher modelo", "capture": ".dsx/captures/purchasing/17-batch-step-1.html", "kind": "screen", "caption": "…" } ],
    "metrics": { "steps": 4, "clicks_to_done": 9, "dialogs": 0, "primary_actions": 4, "words_on_screen": 180, "decisions": 4 } },
  "variants": [ {
    "id": "a", "name": "…", "concept": "one sentence with the idea", "hero": "a1", "gain": "what it gains, in one line", "cost": "what it costs, in one line",
    "changes": { "screen": "…", "flow": "…", "behavior": "…", "text": "…" },
    "archetype": "step-wizard", "patterns": ["form-steps", "undo"], "laws": ["hick"],
    "hypothesis": "what improves and for whom", "tradeoffs": ["what gets worse / risk"],
    "resolves": ["l-336e4efa", "t-2f07996f"],
    "frames": [ { "id": "a2", "step": "Gerar", "capture": ".dsx/variations/purchasing/batch/a/03-generate.html", "kind": "behavior", "caption": "…",
                  "behavior": { "action": "clica em Gerar 4 pedidos", "before": "a1", "after": "a2" } } ],
    "metrics": { "steps": 2, "clicks_to_done": 4, "dialogs": 0, "primary_actions": 2, "words_on_screen": 90, "decisions": 3 },
    "code": ["web/tests/capture/variants/batch/a/*.tsx"]
  } ]
}
```

(Values such as `title`, `name`, `step` and `action` are product text — pt-BR in this example.) Keys in `snake_case`; `kind`: `screen | state | behavior`; `laws`, `journey_ref` and `metrics_method` are optional; `state` (optional on the frame) beats the capture name's suffix. Page-only optionals: `question` and `done_label` (root), `metrics_method_tech` (root, technical), `hero` (frame id in the row), `gain` and `cost` (one line each, also in `current`), `changes_tech` (in the variant, per axis, technical: only under "Para quem constrói"; `changes` stays in business language), `metrics_detail` (in the row: `{ "clicks_to_done": ["…"], "not_comparable": { "clicks_to_done": "reason" } }`), `compare_to` (on the variant's frame, id of a today frame) and `compare_focus` (on the frame, `{ "x", "y", "w", "h" }` as fractions of the image: the crop for the card and the comparison). `validate` checks `hero`, `compare_to`, `compare_focus` and `metrics_detail`. Files generated alongside: `decision.json` (versioned) and `shots/` (cache, outside git).

## Report (default)

```
Rethink · <module> · <flow> · <date>
Pain: <n> open findings (ids) · cause: …
Today: steps … · clicks … · dialogs … · primaries … · words/screen … · decisions …
Variants: A <concept> (archetype, patterns) · B … · C …
Lint: A resolves x/y, new ≥2: n, blocking: no · B … · C …
Page: <path>
Decision: <variant or composition> · comment
Production: build-ui · UX.md <version> · re-audit: resolves → fixed <n>/<m>
Still open: what is unverified, hypothesis to test with users
```

Format 2 report lines: `Lenses: A <lens> · B <lens> · C <lens>` · `Choice: <id> — why; traded: B …, C …` · `Critique: 6/6 (resolved n · limitation n · measurement n)` · `alternatives.md: <path>`.

## Checklist

- [ ] Persona, task, today's metrics and the flow's findings gathered with sources.
- [ ] Three variants with opposing central ideas, four axes, catalog anchor, hypothesis and trade-off.
- [ ] Built with real components through the capture harness, fictitious data, code in a test folder.
- [ ] `validate` with no errors; `measure` with no unexplained divergence; `lint` with no new finding ≥ 3 and no `persists`.
- [ ] Checkable numbers: clicks listed in `metrics_detail`, same end result or "not comparable" with a reason, problems resolved only with what is confirmed, words measured.
- [ ] DSX applied to the page itself (detectors with no severity ≥ 2 and a review by `ux-reviewer`) and checked by screenshot (the first fold answers on its own; legible screens; no id or jargon up front; decision with no terminal for the owner); decision recorded in `decision.json`.
- [ ] Chosen variant built through `build-ui`, with `UX.md` in the same commit and a re-audit.
- [ ] What is a hypothesis was stated as a hypothesis (validate with research, `research` skill).
- [ ] Format 2: every variant with audience, causal bet, counter-hypothesis, falsification test, expected metric, guardrail and a distinct Forward lens; `choice` and `rejected_tradeoffs` recorded; `critique` complete; `alternatives.md` exported for the demand.
