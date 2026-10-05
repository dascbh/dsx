# Governance and maturity

## When to consult

- When evaluating the quality or maturity of a design system.
- When proposing, approving, versioning or deprecating something in the system.
- When measuring adoption or drift, or building a system health dashboard.
- When arguing for investment in the system to leadership.

## Principles

1. **A design system is a product, not a project.** It has users (product teams, agents), a roadmap, support and ongoing maintenance. There is no "finishing the design system".
2. **Library size is not quality.** What matters is: it solves the recurring cases, it is used in production, it stays coherent over time.
3. **Evaluation is a sample with evidence, not a certificate.** State the scope, date and limits.
4. **A justified deviation is not debt.** Standardizing against the user's task is worse than a documented exception.
5. **Automate the criterion before automating production.** Generating faster without validation multiplies error.

## Quality evaluation

### Scope (always first)

Record: products, platforms and teams included; library version; date; 2 to 3 critical flows (e.g. sign-up, search, payment); frequent and critical components (fields, error messages, navigation).

### Five dimensions

| Dimension | Question | Accepted evidence |
|---|---|---|
| Coverage and consistency | Do the most used patterns exist and behave the same across all channels? | Inventory in design and code; variations found in production |
| Adoption | Do teams use the official version where it applies? | Sample of screens and repositories; recorded exceptions. Documentation access does **not** count |
| Accessibility | Do components and flows work with keyboard, screen reader, zoom, errors? | Tests per component **and** per flow (composition can fail) |
| Documentation | Can someone choose, implement and adapt without asking the author? | Discovery test (below) |
| Governance | Who proposes, approves, publishes, fixes? | Version history, decision records, request turnaround time |

### Practical tests

- **Discovery test**: ask someone who does not maintain the system to build a real task (e.g. a form with validation) using only the documentation. Each question that required a private conversation is a documentation or component design finding.
- **Governance test**: follow a recent real request from start to finish: prioritization, approval, testing, communication, migration. Without a recent case, simulate a breaking change. Note where responsibility disappears.
- **Drift test**: run `node tools/lint-raw-values.mjs <src>` on the consuming repositories.

### Format of each finding

Scope · observed finding · evidence (screenshot, steps, code excerpt) · reach (how many screens/flows) · cause hypothesis (separate from the observation) · actionable step · how to verify the fix.

A broad claim ("nobody uses the system") requires a sample and conversations with the teams before it becomes a conclusion.

### Prioritization

1. Barriers that block a task or affect access, safety or comprehension.
2. Frequency in the analyzed flows.
3. Number of products affected.
4. Effort to fix.

Never downgrade a severe accessibility barrier because it is hard to fix. The report ends in **a few provable decisions** (fix a component, clarify guidance, accept an exception, improve contribution), not an endless list.

## Maturity rubric

| Level | Name | Observable signals | Next step |
|---|---|---|---|
| 0 | Ad hoc | Loose values in code, no tokens, components duplicated per screen | Inventory and foundations |
| 1 | Foundation | Color, typography and spacing tokens; few components; minimal documentation | High-use components with states |
| 2 | Library | Components in design and code with states and basic accessibility; a page per component | Governance, versioning, metrics |
| 3 | System | Owner, SemVer, defined contribution, adoption and drift metrics, accessibility and contrast tests in CI | Roadmap, planned deprecation, consumption by agents |
| 4 | Product | Roadmap and support, deprecation with deadlines, metrics tied to product outcomes, consumption readable by agents and tools (`DESIGN.md`, `UX.md`, DTCG tokens, linters) | Maintain and measure |

Scoring rules:

- The level is the **highest one whose signals are all present**. One missing signal downgrades.
- Evaluate principles, documentation and code separately if they evolve at different paces; partial adoption is not failure.
- By default, this repository delivers level 3 pieces: layered tokens, contrast validated in the build (`tools/build-tokens.mjs --check`) and a drift metric (`tools/lint-raw-values.mjs`). Human governance (owner, contribution, versioning) remains the project's responsibility.

## Metrics

### Adoption

`adoption = official occurrences ÷ eligible occurrences`

- "Eligible" = a place where an official component would apply.
- Keep three counts separate: official, **approved variation** (recorded exception) and **unjustified local implementation**. Report strict adoption (official only) and the unjustified deviation rate separately; mixing them hides the difference between deliberate adaptation and drift.
- Example reading: 40 eligible fields, 26 official, 8 approved variations, 6 local → strict adoption 65%, unjustified deviation 15%.

### Drift

`drift = raw value occurrences ÷ lines of UI code × 1000`

- Computed by `node tools/lint-raw-values.mjs <dir> --json` (field `drift_per_1000_lines`).
- Rules detected: raw hex, raw functional color (`rgb()`, `hsl()`, `oklch()`…), px off the scale (≥ 2px), `z-index` of three or more digits, utility-framework arbitrary values.
- Lines with `dsx-ignore` are skipped: count the escapes separately and review them; an unjustified escape is hidden drift.
- Use it as a **trend**: compare the same repository across versions. Healthy target: drift falling each cycle and zero in new code (the linter exits with code 1 if it finds occurrences; use that in CI for diffs).

### Health dashboard (seven dimensions)

| Dimension | Suggested metric |
|---|---|
| Adoption | % of eligible surface using official components |
| Coverage | Critical foundations and components exist (yes/no per item) |
| Reuse | Components reused vs. built from scratch in new features |
| Quality | Drift; failing contrast pairs; UI bugs per component; cross-platform parity |
| Documentation | Time to resolve a question; discovery test result |
| Contribution | Time between a recorded need and a published version |
| Value | Rework hours avoided and linked product indicators (see ROI) |

In the design tool, also track: instance detach frequency (high = insufficient flexibility) and duplicated solutions.

Anti-metrics: documentation page views; number of components; number of tokens.

## Versioning (SemVer)

| Type | When | Examples |
|---|---|---|
| **MAJOR** | Breaks API or expected behavior | Renaming/removing a token or property; changing the meaning of a semantic token; removing a variant; changing keyboard behavior |
| **MINOR** | Compatible addition | New token, component, variant or optional property; new theme |
| **PATCH** | Fix with no contract change | Value adjustment that keeps the role (e.g. moving `color.text.muted` one step to fix contrast); bug; documentation |

Rules:

- Every version has a note with **what, why and how to migrate**.
- Renaming a token is MAJOR: publish the new name, keep the old one as a deprecated alias for at least one MINOR version, then remove it in the next MAJOR.
- Deprecation has a declared **deadline and removal condition**; the old pattern does not live alongside the new one forever.
- A value change visible on every screen (e.g. a new brand color) is technically PATCH/MINOR, but communicate it as a relevant change.
- Keep visible which version is in production in each consuming product.

## Governance model

| Model | Who decides | Advantage | Risk |
|---|---|---|---|
| Centralized | System team | Coherence | Bottleneck, distance from products |
| Federated | Distributed contributors with formal review | Closeness to real problems | Costly coordination, consistency gaps |
| Hybrid | A core team owns foundations; teams contribute through a process | Balance | Ambiguous roles if not written down |

Minimum to define in any model: owner, who may propose, acceptance criteria, conflict resolution, versioning and communication, deprecation process, feedback channel.

## Contribution model

1. **Need**: problem described with evidence (screens, affected teams). No recurring problem, no new component.
2. **Proposal (RFC)**: solution, alternatives considered, impact on existing tokens and components.
3. **Review** against principles, accessibility and the catalog (does it duplicate anything?).
4. **Implementation** in design and code together, with the state matrix and the documentation template.
5. **Validation**: `tools/build-tokens.mjs --check`, accessibility tests, use on one real screen.
6. **Publication** with version and note.
7. **Follow-up** on adoption.

Two tracks: **fast** for fixes (patch, documentation) and **coordinated** for changes that break or create a pattern. Measure cycle time: slow contribution pushes teams toward local solutions, which become drift.

## ROI arguments (without made-up numbers)

Formula: `ROI = (benefit − cost) ÷ cost`. Fill it in with data **from your own context**; do not import percentages from elsewhere as a promise.

Benefit sources worth measuring:

- **Rework avoided**: hours spent recreating components or styles that already existed (sample tickets and PRs).
- **Speed**: time from prototype to production in features that used the system vs. those that did not.
- **Quality**: UI and accessibility bugs per release; accessibility defects cost far more to fix in production than in the specification, and a fixed component fixes every screen that uses it.
- **QA**: test cases inherited from already validated components (contrast validated in the build is inherited conformance).
- **Brand or theme change**: effort to change a color in a token vs. in hundreds of files.
- **Cost of non-adoption**: what is spent when teams work around the system.

How to present:

- For leadership, talk about **delivery time, risk (legal and accessibility) and the cost of non-adoption**, not "visual consistency".
- Link system metrics (adoption, drift) to intermediate metrics (rework, bugs) and to product metrics (task completion, satisfaction). Without that chain, the system optimizes its own showcase.
- If adoption is low, the benefit does not exist yet: the priority investment is adoption, not a new component.

## Anti-patterns

- Measuring success by number of components or documentation visits.
- Evaluating only the isolated component, never the flow.
- Concluding without a sample.
- Publishing a version without a migration note; silent updates.
- Deprecating without a deadline.
- A system so flexible it stops guiding decisions.
- Copying the structure of a giant system without its maturity.
- Promising ROI with third-party percentages.

## Checklist

- [ ] Scope, version and date recorded in the evaluation.
- [ ] Five dimensions evaluated with evidence; findings in the full format and prioritized.
- [ ] Maturity level assigned by the "all signals present" criterion.
- [ ] Strict adoption and unjustified deviation reported separately.
- [ ] Drift measured with `tools/lint-raw-values.mjs` and compared with the previous round.
- [ ] SemVer applied; version note with migration; deprecation with a deadline.
- [ ] Owner, acceptance criteria and contribution tracks defined.
- [ ] ROI computed with your own data.
