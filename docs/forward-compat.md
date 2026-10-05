# DSX ↔ Forward compatibility contract

Status: wave 1 (2026-10-05). Forward snapshot: 0.55.1, commit `1bbc07c` (see `data/forward/VERSION`).

DSX and Forward are open frameworks that will become one project. Until then DSX stays **100% backward compatible with Forward**: same artifact paths, same formats, same ids, no parallel concept. Where the two disagree, **Forward is canonical** and DSX adapts, exports or proposes a change to Forward; it never forks the meaning.

This document is the contract. It says, concept by concept, what Forward calls the same thing, the status of the pair, and the rule that keeps them compatible. The code that enforces it lives in `tools/forward/` and its tests in `tools/test/forward-*.test.mjs`.

## Ground rules

1. **Forward is canonical** for principles (`heuristic_principles` in `quality-attributes.toml`), artifact paths, the findings format, the divergence format, invariants I1–I8 and roles. DSX never adds a principle id, a gate or a role.
2. **DSX rules are probes.** Every automated rule (X*, T*, F*, L*, S*, C*) and every review rule (H1–H10, `desc`, `DP`, `IA`, `A11Y`, `LAW`) carries `principles` (Forward ids) and `probe` (English one-liner) in `data/ux-dimensions.json`. Nielsen heuristics and UX laws are supporting knowledge mapped onto USE/DOM; they are not a catalog of their own.
3. **Forward paths when the concept exists in Forward.** What is DSX-only stays in `.dsx/` and has an exporter or a documented link to the Forward equivalent.
4. **Read old, write new.** Old DSX names keep being read with a warning (`tools/lib/legacy-cli.mjs`, `docs/renames-2026-10.md`); exporters never overwrite a Forward record (a `reviews/<id>/findings.toml` or an authored `design/product.md`) without `--force`.
5. **The snapshot is a copy.** `data/forward/` holds Forward files unchanged; `node tools/forward/sync.mjs --check` fails on a hand edit (checksums in `VERSION`) and, with `--from <forward>`, on any divergence from the Forward checkout. The only DSX-authored file there is `data/forward/dsx-crosswalk.json`.

Status legend: **identical** (same thing, same name/format) · **exported** (DSX keeps its own record and writes the Forward one) · **adapted** (DSX changed or must change to fit Forward) · **DSX-only** (no Forward concept; lives in `.dsx/` or in DSX knowledge) · **conflict** (same name or slot, different meaning; resolution given).

## Concept table

| Concept | DSX | Forward | Status | Rule |
|---|---|---|---|---|
| Principle catalog | Nielsen 1–10, UX laws (`laws_index`), knowledge files | `heuristic_principles` (USE-1…15, DOM-1…7, MNT-*, SEC-*, REL-*, PERF-*, COST-*, OBS-*) | adapted | Forward ids are cited; heuristics/laws map onto them (tables below). Gaps become proposals for Forward, never new ids |
| Automated rules | X/T/F/L/S/C rules in `rules_index` (and U1–U6 drift rules of `ux-md-drift.mjs`) | adversarial probes (`adversarial_probes`) + I8 principles | adapted | Each rule is a probe citing a principle; exported findings carry `probe = "<rule>: <probe>"` and `principle` |
| Review rules | `review_rules` (H1–H10, `desc`, `DP`, `IA`, `A11Y`, `LAW`) | heuristic pass of fde-review | adapted | Judgment rules cite a principle only (no probe); `LAW` takes the principle of the law it names |
| Findings record | `.dsx/findings/<module>/findings.json` (detector state, stable ids, status) | `reviews/<id>/findings.toml` (template `data/forward/templates/findings.template.toml`) | exported | `tools/forward/export.mjs findings`; import back with `tools/forward/import.mjs findings` |
| Finding id | `t-`/`s-`/`f-`/`st-`/`c-`/`l-` + 8 hex, stable across runs | free string per finding (`F1`, `R1-F1`…) | exported | The DSX stable id becomes `id`; never matches `R<n>-` so the REVIEW-ROUNDS warning stays quiet |
| Severity | Nielsen 0–4 | `critical` · `high` · `medium` · `low` | adapted | 4→critical, 3→high, 2→medium, 1→low; 0 is not exported (see table below). fde-design user validation already uses 0–4: identical there |
| Blocking | `findings.mjs check --min 2` fails on new findings ≥ 2 | `blocking = true` only when critical/high, inside the threat model, breaking a declared criterion | conflict | Export sets `blocking` only for critical/high tied to a declared criterion (`--criteria`). `check` is a regression probe; in a Forward project it gates only when the plan declares it as a criterion in `eval_paths` |
| Cap | page shows every case | `[review] max_findings` (default 5) per round, the rest one line each in `[meta].notes` | adapted | Export reads `max_findings` from the target `fde.config.toml` |
| Finding status | open, decided, ignored, accepted-deviation, fixed, regression | open until `fixed_in = "<sha>"`; triage patch/defer/drop on `board.md` | adapted | Export filters by status (default open, decided, regression); `fixed_in` imports as `fixed`. A DSX owner decision is input to the builder's triage, recorded on the board, never an edit of the reviewer's file (I3) |
| Owner decision on a finding | `decisions.json` (option chosen per case) | builder triage, one board line | adapted | The decision is a triage proposal; `ignored` needs the written refutation fde-review asks for |
| Declared deviation | `deviations:` in UX.md (D1…, `until`) | drift/debt log in `design/foundation.md`; declared limit in `promotion.md` | exported | `export.mjs ux-md` writes the deviations table for the debt log; an exported finding covered by a deviation is not exported (status `accepted-deviation`) |
| Variations | `.dsx/variations/<m>/<f>/variations.json` (+ `decision.json`); axes screen/flow/behavior/text | `specs/<id>/design/alternatives.md`; five lenses, ≥2 HMW, `Hypothesis:`, `Traded:`, `Chose:` | exported | Manifest format 2 carries `lens`, `how_might_we`, `choice`, `rejected_tradeoffs` (variations.mjs); `export.mjs variations` fills the Forward view and checks it like `design.py` |
| Lenses | (none before 2026-10) | subtract, invert, analogous, constraint-first, object-first (read from `data/forward/bin/fde/design.py`) | adapted | Variants sharing a lens count as one (USE-10); `lensCheck` in `tools/forward/lib/crosswalk.mjs` |
| Convergence | owner picks a variant or composes per axis (`decide`) | `Chose:` + `Traded:` per discard | exported | The owner's `decision.json` wins over the designer's `choice`; a composition is recorded as such |
| UX contract | `UX.md` (front matter + 13 sections) | `design/product.md`, `design/foundation.md`, `specs/<id>/design/flow.md`, `ia.md`, `intended-model.md` | exported (partial) | `export.mjs ux-md` writes `design/product.md` when absent (register, persona, glossary + deny-list, deviations, gaps). UX.md glossary can already point at `design/product.md` (`content.glossary`) |
| Design tokens / visual foundation | `DESIGN.md` (Google format), `tokens/` (DTCG) | `design/foundation.md` (token source path, kit, states, drift log) | adapted | `design/foundation.md` names DESIGN.md/DTCG as its token source; no second DS directory |
| Design system lifecycle | `audit-ds`, `design-system-extractor` (`.dsx/maps/design-system.{json,md}`) | fde-design-system + `design-system-lifecycle.md`: inventory in `discovery/<objective>-design-system.md`, states absent/implicit/fragmented/explicit, separate adherence verdict | adapted | The extractor's inventory is evidence for the discovery file; DS adherence is reported apart from UI/UX findings |
| Raw-value drift | `tools/lint-raw-values.mjs` | MNT-5, "drift hunt is executable" | identical | Cite MNT-5 when exported |
| Product maps | `.dsx/maps/` (project, ui, flows, tasks, journey, domain, design-system) | `docs/map/<feature>.md` + docs/map/conventions.toml (code graph), never a second graph | conflict | DSX maps are UX maps (flows, tasks, journeys) and stay in `.dsx/maps/`; the domain/API part defers to Forward's product map when it exists and cites its node ids |
| Discovery | `discovery` skill (conversation, no file) | `discovery/<objective>.md` | adapted | DSX discovery output belongs in `discovery/<objective>.md` |
| Patterns | `patterns/` (77 interaction patterns, IF→THEN rules) | `ui-patterns.toml` `[[pattern]]` (21 jobs) + client `design/patterns.md` | adapted | `data/forward/dsx-crosswalk.json` maps DSX patterns to Forward jobs; a client pattern still goes to `design/patterns.md` |
| Archetypes | `archetypes/` (12 screen types: operational-list, form-dialog…) | `[[archetype]]` (8 page compositions: authentication, checkout…) | conflict | Same word, different level. DSX archetypes are screen types; mapped to Forward patterns/archetypes in `dsx-crosswalk.json`; `master-detail` is a DSX archetype id and a Forward pattern id (cite as `pattern:master-detail` on the Forward side) |
| Design system references | `references/` (DESIGN.md library), `choose-ds` | `[[system]]` and `[[directory]]` | adapted | Forward's system list decides which system to study for a job; the DESIGN.md library is a source of tokens and style |
| UI quality metrics | variation metrics: steps, clicks_to_done, dialogs, primary_actions, words_on_screen, decisions | five mother metrics (density, semantic economy, action topology, hierarchy alignment, friction) | adapted | Raw counts are diagnostics, never a score; mapping and verdicts are owned by the product-pipeline work (frente C) |
| Evidence labels | "synthetic = hypothesis" (`docs/principles.md`) | [observed] / [expert-inferred] / [human evidence], "[synthetic — not evidence]" | adapted | Use Forward's labels in exported text |
| Independent reviewer | `ux-reviewer` agent (read-only, gets only the screen) | `fde-adversarial` (artifact + spec, never builder context), heuristic pass | adapted | Same isolation (I2). The reviewer records; the export to `reviews/` runs as the review role, in a commit with no behavior change (I3) |
| First-contact walkthrough | none | fde-walkthrough (two blind runs, `walkthroughs/<id>/`) | Forward-only | DSX does not reimplement it; USE-13/14/15 findings come from it |
| Evals | `evals/rubrics`, `evals/cases`, `eval-judge` (LLM judge) | `eval_paths` of the client (executable, I1/I6) | adapted | A DSX judge score is heuristic evidence, labeled; executable DSX checks (linters, `findings.mjs check`) go in `eval_paths` when the plan declares them |
| Gates | `npm run check`, linters, `findings.mjs check`, `ux-md-drift --fail-at` | `verify.py` gates (finding-discipline, adversarial-isolation, divergence…) | adapted | DSX adds no verifier flag; its outputs feed the existing gates (validated with verify.py in `forward-export.test.mjs`) |
| Roles and write scopes | none (tools are role-neutral) | spec, architecture, implementation, adversarial, promotion, walkthrough evaluator | adapted | Who runs a DSX tool decides where its output lands: review role → `reviews/`; spec → `discovery/`, `specs/`; design skill → `design/` |
| `design/` folder | DSX writes `design/figma-sync.md` (turn log) | client foundation folder (`product.md`, `foundation.md`, `patterns.md`) | conflict | Allowed as a DSX-owned operational file with no foundation meaning; at merge it moves under the cycle board or `.dsx/` |
| Design options (candidate DESIGN.md files) | `.dsx/design-options/<name>.md`, pointer `design.active` in `.dsx/config.json`, `lab.mjs promote` (skill `design-lab`) | none: one foundation, "do not create a second DS directory" (`design-system-lifecycle.md`); per-demand alternatives in `specs/<id>/design/alternatives.md` | DSX-only | Never in `design/` (the first proposal, `design/options/`, was moved for this reason); candidates are pre-decision state, only the promoted file is canonical. Promote writes the official DESIGN.md that `design/foundation.md` names as token source; the foundation revision and drift log are updated by the design skill. A design-system choice made inside a demand can also be recorded as Forward alternatives (one option per alternative, the owner's decision as `Chose:`) |
| Figma / Stitch | `figma-*`, `stitch` skills, `tools/figma`, `tools/stitch` | none | DSX-only | Design QA evidence from them follows fde-design (screenshots, parity) |
| Install | `init` | fde-init (`fde.config.toml`, `.fde/`) | adapted | `init` detects `fde.config.toml` and wires DSX outputs to Forward paths |
| Language | pt-BR docs, English code/data | English everything; product text in the project language | adapted | Done in DSX 0.9.0 (Round 4 — English, `docs/renames-2026-10.md`); text detectors have `pt-BR` and `en` packs |

### Invariants

| Invariant | DSX today | Rule |
|---|---|---|
| I1 eval-precede-merge | detectors and linters run on demand | A DSX check that guards a behavior goes in the client's `eval_paths` |
| I2 adversarial-isolation | `ux-reviewer` sees only the screen; detectors read only artifacts | Exported records declare `context_policy = "artifact_only"`; review-origin items inherit the isolation of whoever recorded them |
| I3 adversarial-incentive | registry and page never edit code | The review record is never overwritten without `--force` and is committed apart from behavior changes |
| I4 promotion-criteria-declared | none | DSX never decides promotion; `--criteria` only links findings to criteria the plan already declared |
| I5 observability-floor | none | Out of DSX scope |
| I6 client-runnable-gate | Node ≥ 20, no dependencies | Every exporter and check runs without the FDE; Forward's verify.py is optional in tests |
| I7 artifact-handoff | `.dsx/` records on disk | Handoff to Forward roles is the exported file at the Forward path |
| I8 principled-judgment | rules cite heuristics/laws | Every exported finding cites a probe or a Forward principle; one with neither is left out and reported (`skipped`) |

## Severity table

| DSX (Nielsen) | Meaning | Forward | Exported |
|---|---|---|---|
| 4 | catastrophe | `critical` | yes |
| 3 | major | `high` | yes |
| 2 | minor | `medium` | yes (backlog candidate) |
| 1 | cosmetic | `low` | yes, never a backlog line |
| 0 | not a usability problem / probable data | — | no |

`blocking = true` only when the severity is critical or high **and** the finding (by id or rule) is tied to a declared criterion through `--criteria`. `backlog = true` on non-blocking medium and higher; low findings stay in the record (fde-review: a low finding is never a backlog line).

## Rule crosswalk

Source of truth: `principles` and `probe` in `data/ux-dimensions.json`; principle ids from `data/forward/spec/dimensions/quality-attributes.toml`. The first principle is the one exported as `principle`; the others are cited in the evidence. `forward-crosswalk.test.mjs` fails when a principle does not exist in the snapshot or this table disagrees with the data.

### Automated rules

| Rule | Family | DSX severity | Principles | Probe |
|---|---|---|---|---|
| X1 | text | 2 | USE-8 | scan visible text for an em or en dash used as a pause between clauses |
| X1b | text | 1 | USE-1, USE-2 | look for a dash standing in for an empty value, where the reader cannot tell empty, zero or not applicable apart |
| X2 | text | 2 | USE-9, USE-3 | look for a title, tab or button made of two blocks joined by a separator |
| X3 | text | 1 | USE-7 | compare each supporting text with its title and flag the ones that only rephrase it |
| X4 | text | 2 | USE-8, USE-7 | look for an empty opener ("Here you can…", "On this screen…") that delays the content |
| X5 | text | 1 | USE-3 | look for terminal sentence punctuation on labels, buttons and titles |
| X6 | text | 1 | USE-9 | check that every button names verb + object and stays short |
| X7 | text | 1 | USE-7, USE-6 | compare each tooltip and accessible name with the visible text and flag repeats and over-explanation |
| X8 | text | 1 | USE-9, USE-4 | check that each placeholder shows a format or example instead of repeating the label |
| X9 | text | 1 | USE-8, USE-9 | look for an explanatory parenthesis inside a title, label or button |
| X10 | text | 1 | USE-3 | check that titles, tabs and buttons use sentence case, not Title Case |
| X11 | text | 2 | USE-2, DOM-2 | scan visible text for implementation terms (hash, token, API, payload…) the user does not use |
| T1 | screen | 3 | USE-8 | count filled (primary) actions per region against the declared limit |
| T2 | screen | 2 | USE-11, USE-3 | check the cancel/confirm order in dialog footers against the declared convention |
| T3 | screen | 2 | USE-6, USE-8 | count the h1 headings on the screen: exactly one is expected |
| T4 | screen | 3 | USE-6, USE-9 | check that every field has a visible label or an accessible name, not only a placeholder |
| T5 | screen | 3 | USE-4, USE-9 | check that destructive actions name the consequence instead of a generic Confirm/OK/Yes |
| T6 | screen | 2 | USE-3, USE-2 | scan visible text for terms the product declares forbidden (content.forbidden or the glossary deny-list) |
| T7 | screen | 1 | USE-9 | check that each button label is verb + object |
| F0 | flow | 1 | DOM-4 | resolve every transition in the flow map and flag targets that are not screens of the map |
| F1 | flow | 3 | USE-4 | look for a screen (not a dialog) with no outgoing transition in the flow map |
| F2 | flow | 1 | DOM-5 | look for a screen of the flow map that belongs to no journey |
| F3 | flow | 2 | — (proposal) | count the steps of each journey against flows.max-journey-steps |
| F4 | flow | 2 | USE-1 | count dialogs opened from another dialog against flows.max-stacked-dialogs |
| F5 | flow | 3 | USE-4 | check that every non-root screen has a transition back to its parent or origin |
| L1 | layout | 2 | USE-3, USE-11 | measure the position of the primary action against the declared position (UX.md or archetype) |
| L2 | layout | 2 | USE-8 | measure visual weight above the fold and flag competing emphases |
| L3 | layout | 2 | USE-8 | measure heading sizes: h1 is the largest and no lower level outranks a higher one |
| L4 | layout | 1 | USE-8 | measure left edges of fields, labels and card columns and flag more than two alignment positions |
| L5 | layout | 1 | USE-8 | measure distances between labels and fields and inside action groups (proximity) |
| L6 | layout | 2 | USE-5 | check that the title and the primary action sit above the first fold (900 px) |
| L7 | layout | 1 | USE-8 | measure running-text line length and flag lines over 90 characters |
| L8 | layout | 2 | USE-6 | measure clickable targets and flag those under 24 × 24 px (WCAG 2.5.8) |
| L9 | layout | 1 | USE-11 | check that every region of the declared archetype is present on the screen |
| S1 | states | 2 | DOM-5, USE-1 | check that every required state (UX.md or archetype) has a capture |
| S2 | states | 2 | USE-4 | check that every empty and error state offers an action out |
| S3 | states | 2 | USE-9, USE-4 | check that every error message says what to do next |
| C1 | consistency | 2 | USE-3 | compare action labels across screens and flag synonyms for the same action |
| C2 | consistency | 1 | USE-3, MNT-5 | compare buttons with the same label across screens and flag different visual variants |
| C3 | consistency | 1 | USE-3 | compare titles and tabs across screens and flag one concept under different names |

### Review rules (Nielsen heuristics and judgment)

| Rule | Principles | Probe |
|---|---|---|
| desc | USE-9, USE-2 | read the visible text in context and judge whether it says what the user needs, in the user's words |
| H1 | USE-1 | Nielsen 1: walk each state and check the user can tell what is happening and where they are |
| H2 | USE-2 | Nielsen 2: compare labels and flows with the user's domain language |
| H3 | USE-4 | Nielsen 3: try to leave, cancel and undo from each step; flag places with no way back |
| H4 | USE-3, USE-11 | Nielsen 4: compare names and behavior of the same concept across screens and against platform convention |
| H5 | USE-4 | Nielsen 5: try the destructive and error-prone paths; flag those with no prevention or confirmation |
| H6 | USE-5 | Nielsen 6: flag steps that depend on remembering hidden state or options |
| H7 | — (proposal) | Nielsen 7: check that frequent users have accelerators (shortcuts, bulk actions, defaults) without hurting first use |
| H8 | USE-8, USE-7 | Nielsen 8: flag decoration, repetition and emphasis that outrank the work |
| H9 | USE-9, USE-4 | Nielsen 9: trigger each error and check it names cause and next step |
| H10 | — (proposal) | Nielsen 10: check that help is available in context where the task needs it |
| DP | — (proposal) | look for deceptive patterns from the catalog (hidden cost, forced continuity, confirmshaming…) |
| IA | DOM-1, DOM-4 | check attribute level against cardinality and every cited navigation path label by label |
| A11Y | USE-6 | check the cited WCAG criterion on the main flow (keyboard, contrast, screen reader) |
| LAW | from the cited law | cite the law from laws_index; the principle comes from that law's entry |

### UX laws

| Law | Principles |
|---|---|
| `cognitive-load` | USE-5, USE-8 |
| `fitts` | USE-6 |
| `hick` | USE-8 |
| `gestalt-proximity` | USE-8 |
| `gestalt-similarity` | USE-3 |
| `gestalt-common-region` | USE-8 |
| `gestalt-figure-ground` | USE-8 |
| `gestalt-continuity` | USE-8 |
| `affordance-signifiers` | USE-5, USE-9 |
| `mental-models` | USE-2, DOM-3 |
| `jakob` | USE-11 |
| `framing` | — (proposal) |
| `confirmation-bias` | USE-10, USE-14 |

### Partial fits (mapped, but the principle covers only part of the rule)

- **F1, F5, H3** (dead ends, no way back, user control and freedom) → USE-4 covers recovery from errors, not the freedom to leave any place. See proposal 1.
- **L3, L4, L5, L7** and the Gestalt laws (alignment, proximity, line length, heading scale) → USE-8 covers register and finish; Forward has no hierarchy/grouping principle although the product pipeline asks for "a cited hierarchy principle". See proposal 5.
- **F4** (stacked dialogs) → USE-1 (the user knows what state they are in); the effort side is proposal 6.
- **X1, X4** (marks of generated text: dash as pause, empty openers) → USE-8; Forward has no editorial-register principle for microcopy.
- **L9** (archetype region missing) → USE-11, read with `dsx-crosswalk.json` because DSX archetypes are not Forward archetypes.

## Principle proposals for Forward

Gaps found while mapping. No id is invented here: Forward assigns ids if it accepts a proposal. Until then the rules below export with their probe only (I8 is still met), and review findings under them are reported as not exportable.

1. **User control and freedom** — every non-root place has a visible way back, cancel or undo, without losing work. Covers H3 fully (now partial under USE-4) and F5/F1 by name.
2. **Flexibility and efficiency for frequent users** — accelerators (shortcuts, bulk actions, remembered defaults) for daily users that never cost first use. Unmapped today: H7.
3. **Help in context** — help and documentation are reachable where the task needs them, searchable and task-oriented. Unmapped today: H10.
4. **No deceptive patterns** — no interface that hides cost, forces continuity, shames a refusal or frames a choice against the user's interest. Unmapped today: DP and the law `framing`.
5. **Visual hierarchy follows the task** — prominence, grouping, alignment and reading order follow the task's decision sequence; one scale for headings; readable line length. Partial today: L3, L4, L5, L7, the Gestalt laws (all under USE-8).
6. **Bounded task effort** — each job declares its step, decision and dialog budget and the flow stays within it, including recovery. Unmapped today: F3 (the product pipeline's "interaction friction" has no principle).

## Collisions and how they resolve

| Collision | Resolution |
|---|---|
| Two severity scales | DSX keeps 0–4 internally (Nielsen, also used by fde-design user validation); the export maps with the table above. |
| Two findings records | The Forward review record is canonical for a review round; the DSX registry is detector state before triage. One-way export per round, stable ids preserved, import for reading. |
| `check --min 2` vs "blocking only by declared criterion" | The DSX check is a probe; it blocks a Forward merge only as a declared criterion. Export never sets `blocking` from severity alone. |
| Axes vs lenses | Axes say what a variant changes; lenses say where it came from. Format 2 manifests carry both; the Forward export needs one distinct lens per alternative. |
| "Archetype" (screen type vs page composition) and the id `master-detail` | DSX keeps its ids (backward compatibility); citations to Forward use `pattern:`/`archetype:` prefixes; `dsx-crosswalk.json` holds the mapping. At merge, DSX archetypes become "screen types" or Forward patterns. |
| UX.md vs `design/product.md` + flow/ia | UX.md is the richer machine-readable contract DSX lints; `design/product.md` is exported from it when absent and wins when authored. No second glossary: UX.md can read the glossary from `design/product.md`. |
| `.dsx/maps` vs docs/map | UX maps (flows, tasks, journeys) stay DSX; code/domain structure defers to Forward's product map. |
| `design/figma-sync.md` inside Forward's `design/` | Operational DSX file, no foundation meaning; moves at merge. |
| Several DESIGN.md candidates vs one foundation | Candidates live in `.dsx/design-options/` (DSX state), never in `design/`; only `lab.mjs promote` touches the official file, after the gates, keeping the previous one. |
| Lens list | Read from Forward's `design.py` snapshot (`loadDivergenceRules`); `variations.mjs` keeps a literal `LENSES` today and should import it from the snapshot (open item). |

## Exporters and importers

```bash
node tools/forward/export.mjs findings --from-registry .dsx/findings/<module> --id <demand-id> [--status open] [--min-severity 2] [--criteria criteria.json] [--out <project>]
node tools/forward/export.mjs variations --manifest .dsx/variations/<module>/<flow>/variations.json --id <demand-id> [--decision decision.json] [--lens a=subtract,b=invert] [--hmw "first|second"] [--out <project>]
node tools/forward/export.mjs ux-md --ux UX.md [--module <m>] [--out <project>]
node tools/forward/import.mjs findings --from <project> [--demand <id>] [--out registry.json]
node tools/forward/import.mjs alternatives --from <project> [--demand <id>] [--manifest variations.json --out merged.json]
node tools/forward/sync.mjs --from <forward-checkout>      # refresh the snapshot, print the diff
node tools/forward/sync.mjs --check [--from <forward-checkout>]
```

- **findings**: `[meta]` declares `demand_id`, `kind` (default `adversarial`), `context_policy = "artifact_only"`, `isolation_mode`, one round, the registry commit, what was probed and the notes past the cap. Each `[[finding]]` has `id`, `attribute` (the attribute that owns the principle), `severity`, `principle` and/or `probe`, `evidence` (message, screens, source lines), `blocking` and `backlog`. `criteria.json` is `{ "<finding id or rule>": "<criterion id>" }`.
- **variations**: the file is written by `toAlternativesMarkdown` in `tools/ux-lint/variations.mjs` (one writer). The exporter builds the Forward view (lens and HMW overrides, the owner's `decision.json` over the designer's `choice`, `rejected_tradeoffs` from each discard's cost and tradeoffs), runs the gate's checks and writes nothing while a lens, two framings or a convergence is missing (unless `--allow-incomplete`).
- **ux-md**: writes `design/product.md` only when absent; otherwise prints it for a manual merge. Lists what Forward expects that UX.md does not hold (quality bar, negative scope, ordered principles).
- **import findings**: a registry with `origin: "forward"` items; `findings.mjs status|page` read it. The rule comes back from the probe prefix; foreign findings keep their principle as rule.
- **import alternatives**: framings, lenses, hypotheses, discards, choice and the gate check at the demand's size; `--manifest` returns a copy of a manifest with `lens` and `how_might_we` filled.

## Merge plan (not executed)

1. **Catalog first.** Forward accepts or rejects the six proposals above; accepted ones get ids and the crosswalk is updated in one change. DSX `heuristics_index` and `laws_index` become knowledge pointers only.
2. **Skills.** `review-ux`/`audit-ux` become the heuristic pass of fde-review for UI (probes = DSX detectors); `rethink-ux` becomes the divergence step of fde-design; `audit-ds` + extractor become fde-design-system's inventory; `map-ux` feeds fde-map (UX maps) and fde-survey; `figma-*`/`stitch` stay as optional adapters.
3. **Artifacts.** The registry becomes the pre-triage state of `reviews/` (or is dropped once detectors write `findings.toml` directly); variations write `alternatives.md` natively; UX.md splits into `design/product.md` (product, glossary), `design/foundation.md` (states, feedback, forms rules, deviations as debt) and per-demand `flow.md`/`ia.md`.
4. **Data.** `data/ux-dimensions.json` moves next to `quality-attributes.toml` as the probe catalog of `usability_accessibility`; DSX patterns/archetypes merge into `ui-patterns.toml` with `dsx-crosswalk.json` as the migration table; ids keep aliases for one release.
5. **Tools.** `tools/ux-lint` runs inside `eval_paths` as client-runnable checks (I6); the snapshot and `sync.mjs` disappear because there is one source.
6. **Language.** Done in DSX 0.9.0: DSX docs, skills, agents and messages are in English; product-facing text stays in the project language (`content.language`).
