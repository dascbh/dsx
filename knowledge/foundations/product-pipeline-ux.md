# Product pipeline and the DSX

How the DSX implements the UI/UX part of Forward's unified product pipeline (`forward/spec/product-pipeline.md`,
dated 2026-09-30, and `forward/spec/design-system-lifecycle.md`). The DSX adds probes, measures and pages; it adds
no workflow engine, no command, no approval step, no artifact path and no principle catalog of its own. Where Forward
has a concept, the DSX writes into it.

## Build and inspect are Forward's entries

`fde-build` (an outcome or new feature) and `fde-inspect` (an existing product to improve) are Forward agent
commands. The DSX does not define `build` or `inspect`: its skills are the tools those entries call at the UI/UX
stages. Both entries continue through the same stages, so a DSX skill behaves the same whichever entry led to it;
only the baseline differs (inspect measures what exists first; build records an empty or partial baseline as
observed, never as permission to invent a domain or a design system).

| Entry | First DSX move | Baseline it records |
|---|---|---|
| build | `iniciar` (stack, tokens, kit, UX.md) and `auditar-ds` on the reusable assets, before any screen | observed: what kit and conventions already exist; empty is a fact, not a licence |
| inspect | captures + `mapear` + `auditar-ux` (`audit.mjs --register`) on the existing surfaces | observed: findings per rule, journey lengths, words and primary actions per surface |

## Stage → DSX skill or tool → artifact (Forward path)

| Forward stage | DSX skill / tool | Artifact (Forward path, owner role) |
|---|---|---|
| Request | — (Forward `fde-spec`) | `discovery/<objective>.md` (fde-spec) |
| Discovery augmentation | `discovery`, `pesquisa`, `mapear`, `auditar-ux` baseline, `auditar-ds` inventory | same `discovery/<objective>.md`; DS inventory in `discovery/<objective>-design-system.md`; DSX maps stay in `.dsx/maps/` and are cited by revision |
| Hypotheses | `repensar-ux` (variations manifest, format 2) | `.dsx/variations/<module>/<flow>/variations.json` exported to `specs/<demand-id>/design/alternatives.md` by `variations.mjs alternatives` (fde-spec / fde-design divergence) |
| Product spec + UI/UX criteria | `tools/ux-lint/criteria.mjs check` on the plan | criteria in `## Acceptance criteria` of `cycles/C-<n>/plan.md` (fde-spec), format below |
| UX blueprint (before UI) | `templates/ux-blueprint.md`, `blueprint.mjs check --no-captures` | `specs/<demand-id>/design/intended-model.md`, `flow.md`, `ia.md` (fde-spec; flow/IA with fde-design) |
| Domain + data model | `mapeador-dominio` (read only) | requirements and client ADRs stay Forward's (`docs/adr/<n>-<slug>.md` in the project) |
| Architecture | — | client ADRs (fde-architecture) |
| Implementation | `construir-ui` (with internal criticism), `design-md`, `tokens` | client source; product conventions in `UX.md` and `DESIGN.md`; foundation in `design/foundation.md` |
| Post-UI validation | `audit.mjs --criteria`, `blueprint.mjs check`, `revisar-ux`, `acessibilidade`, agent `revisor-ux` | evidence under `evals/` (results JSON from `--criteria-out`); heuristic findings in `reviews/<demand-id>/findings.toml` citing USE/DOM ids |
| Deploy | — (Forward `fde-review`, `fde-promotion`) | `cycles/C-<n>/review.md`, `promotion.md` settle each criterion |

DSX-only working files (`.dsx/findings/`, `.dsx/maps/`, `.dsx/variations/`, captures) are inputs and caches. Every
one that a Forward artifact depends on is cited by path and revision (see Provenance) or exported (alternatives.md).

## UI quality, UX quality and design-system adherence

`data/pipeline-quality.json` is the matrix. Five UI metrics — information density, semantic economy, action
topology, visual hierarchy alignment, interaction friction — and five UX dimensions — task effectiveness, cognitive
economy, journey topology, expectation/feedback alignment, effort and recovery — each carry the operational
measure, the gate question, the evidence Forward names, the Forward principles (USE-n, DOM-n) it is judged
against, the DSX rules and measures that feed it, and whether it is answered automatically, by judgment or only by
people. Design-system adherence is a separate verdict with five checks (tokens and kit, semantics, rendered parity,
interaction and accessibility, adoption).

Rules for reading it:

- There is no score and no average. Each metric, dimension and DS check gets its own verdict from the criteria
  declared for it: `pass`, `fail`, `unknown` or `not-applicable`. A metric with no declared criterion is
  `unknown`, never `pass`.
- Rule counts (X, T, F, L, S, C) are diagnostics shown next to each metric. A count is not a verdict; a verdict
  needs a declared criterion or a finding that cites a named principle.
- Passing DS adherence never compensates a failed UI/UX metric, and the reverse.
- The 14 DSX dimensions stay as the diagnostic layer; `dimension_map` says which UI metric, UX dimension and DS
  check each one feeds. Nielsen heuristics and UX laws are supporting knowledge that justify findings citing USE/DOM.

## Criteria declared before construction

Criteria live where Forward keeps them: the `## Acceptance criteria` section of `cycles/C-<n>/plan.md`, dated by the
plan's `date:` line before the first demand commit (I4). A quality criterion is an ordinary Forward criterion bullet
(`- **A3 — name.** observable result`) followed by indented fields, so Forward's plan gate, status and promotion read
it like any other criterion:

```
- **A3 — One primary action on the order (UI · action topology).** The order screen has one primary action.
  - kind: ui                       # ui | ux | ds
  - metric: action-topology        # an id from data/pipeline-quality.json
  - surface: order                 # ui/ds: screen id; state; viewport
  - state: success
  - viewport: 1440x900
  - scenario: approver decides one order
  - baseline: 2 primary actions    # or "unknown — <measurement task>"
  - target: primary-actions <= 1   # a comparison, or relative: "<= baseline - 20%"
  - counter-metric: reject stays reachable in one step
  - method: DSX primary-actions probe
  - probe: primary-actions         # optional: words | primary-actions | dialog-open | journey-steps | open-findings[:rules]
  - sample: the order capture
  - decision: pass when at most one primary action is visible
```

UX criteria declare `population` and `journey` instead of surface/state/viewport. `not-applicable: <reason>`
replaces the measurement fields. `register`, `reference` and `volume` (realistic dataset) are optional for UI
criteria and recommended at M/L. An unknown baseline is legal only with the measurement task that will produce it;
a target relative to an unknown baseline evaluates as `unknown` until the baseline is measured — numbers are never
invented.

`node tools/ux-lint/criteria.mjs check cycles/C-<n>/plan.md` validates the declarations. After UI,
`audit.mjs --criteria cycles/C-<n>/plan.md [--evidence recorded.json] [--criteria-out <results.json>]` evaluates
each criterion: value, evidence revision, verdict and evidence class. Probes produce `observed` evidence. People and
reviewers record the rest in the evidence file:

```json
{ "A5": { "value": 4, "evidence_class": "human", "source": "session notes, 5 approvers", "revision": "abc1234" },
  "A8": { "value": 0.4, "evidence_class": "synthetic", "source": "agent run" } }
```

`synthetic` evidence never produces a verdict (it stays `unknown`, labeled "[synthetic — not evidence]"); an agent
completing a journey proves the path exists, not that people find it (USE-14). Write the results file under the
project's `evals/` (for example `evals/ux/C-<n>-criteria.json`), the cycle review cites it, and promotion settles
each criterion in `promotion.md`. Blocking still follows `fde-review`; this adds no gate flag.

## UX blueprint per objective

`templates/ux-blueprint.md` is written into the front demand's Forward design family: Part 1 into
`specs/<demand-id>/design/intended-model.md` (actors, jobs, primary actions and consequences, acceptance scenarios —
also the walkthrough's intended model), Part 2 into `flow.md` (task sequence, decisions, feedback, errors,
empty/loading, abandon/resume, handoffs), Part 3 into `ia.md` (screens, objects, permissions, accessibility,
nomenclature). At XS/S Part 1 alone can carry it.

`UX.md` and the blueprint answer different questions. `UX.md` is the product: conventions every screen follows
(archetype per screen, action position, required states, glossary, deviations). The blueprint is one objective:
which actors do which job through which screens, and how each is accepted. The blueprint cites UX.md policies;
a contradiction becomes a declared UX.md deviation or a UX.md revision in the same cycle.

`node tools/ux-lint/blueprint.mjs check --design specs/<demand-id>/design` checks it. Before UI (`--no-captures`):
sections required for the size, requirement ↔ screen ↔ scenario coverage, every scenario verified by something.
After UI (captures and flow map of `--module`, optionally scoped by `--journey`): orphans both ways (DOM-5) —
blueprint screen without capture, captured screen without requirement, declared state without capture, captured
state not declared — and navigation parity with the flow map (DOM-4). Probes `BP0`–`BP12` cite DOM-4/DOM-5.

## Hypotheses that can be proven wrong

A format 2 variations manifest gives every variant `audience`, `causal_bet`, `counter_hypothesis`,
`falsification_test`, `expected_metric`, `guardrail` and `lens` (one of Forward's five: subtract, invert,
analogous, constraint-first, object-first — distinct per variant, USE-10), and the manifest records `choice`
(`{ "variant", "why" }`, the convergence the designer recommends) and `rejected_tradeoffs` (`{ "<variant>": "what it
traded" }`). The owner still decides on the page (`decision.json`). `validate` requires the fields from format 2 and
warns on format 1 manifests. `variations.mjs alternatives --out specs/<demand-id>/design/alternatives.md` writes the
Forward view (the `Lens:`, `Hypothesis:`, `Traded:` and `Chose:` lines the divergence gate reads). The decision page
shows the hypothesis in plain language under "Como saber se funciona" (in the page's language).

## Internal criticism before implementation

`repensar-ux` (before the page goes to the owner) and `construir-ui` (before code) record an internal criticism with
six entries: strongest counter-case, unsupported claims, failure/recovery scenarios, accessibility, domain/data
contradictions, security/operational risks. Each entry ends resolved (what changed) or as an explicit limitation or
measurement task (a criterion with an unknown baseline, a backlog line). It lives in the same artifact the stage
already writes (the variations manifest's `critique` block, or the demand's notes on the board) and never replaces
the isolated review (I2/I3): the `revisor-ux` agent and Forward's `fde-review` still run without the builder's
context.

## Provenance

Every generated artifact carries a `provenance` block (`tools/lib/provenance.mjs`):

| Key | Meaning |
|---|---|
| `date` | generation date (YYYY-MM-DD) |
| `owner_role` | `fde-spec`, `fde-architecture`, `fde-implementation`, `fde-adversarial`, `fde-promotion` or `orchestrator` (the orchestrating agent that authors `design/**` and routes evidence) |
| `generator` | the DSX tool that wrote it |
| `head` | short SHA of the project's HEAD when generated |
| `sources` | `[{ path, sha, state }]`: last commit touching each source (`committed` / `modified`), or a content hash when untracked |
| `criteria` | criterion / requirement ids the artifact serves |
| `evidence_class` | `observed`, `expert-inferred`, `human` or `synthetic` (one or a list) |
| `assumptions` | what the evidence takes for granted (fictional data, static probe without rendering…) |
| `gaps` | unresolved gaps: missing inputs, unknown criteria, unchecked directions |
| `superseded` | the artifact this one replaces, or null |

Written today by `audit.mjs` (`--json` output and `--criteria-out`), `blueprint.mjs check --json` and
`variations.mjs decide|import` (`decision.json`). Secrets and participant identifiers never go into evidence files.
