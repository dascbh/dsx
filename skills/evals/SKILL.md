---
name: evals
description: "Creates repeatable evaluations for agent-generated UI and AI features: cases, gates, thresholds, a per-criterion evaluator (code, LLM judge, human) and regressions. Use to measure adherence to the design system or to compare versions."
---

# UI and AI evals

> **DSX root:** two levels above this skill's base directory. The `knowledge/`, `evals/` and `tools/` paths are relative to it.

References: `knowledge/ia/evals.md`; ready-made rubrics in `evals/rubrics/`; example cases in `evals/cases/`.

## 1. Start with the task

Write down: *who* uses it, *to do what*, *what a good result is* — in product language. Only then derive criteria. A metric chosen before the task measures what is easy, not what matters.

## 2. Criteria in four types (never average across types)

| Type | Role | Example (agent-generated UI) |
|---|---|---|
| **Gate** | binary; fails the version | zero raw values; no contrast pair < minimum; visible focus |
| **Threshold** | acceptable minimum | score ≥ 3/4 on "visual hierarchy" |
| **Target** | continuous optimization | fewer new components per screen |
| **Guardrail** | must not get worse | generation time, bundle size |

## 3. The right evaluator for each criterion

- **Code** (prefer whenever possible): `tools/lint-raw-values.mjs`, `tools/contrast.mjs`, `tools/lint-design-md.mjs`, `tools/lint-ux-md.mjs --score` (UX.md score out of 100), `tools/ux-lint/*` (behavior of the generated screen against the `UX.md`: T, S, L), axe/Playwright, schema validation, final system state.
- **LLM judge:** open criteria (text clarity, fit of the interaction pattern). A rubric with descriptive anchors per score and pass/fail examples; one criterion per call; ask for evidence before the score. **Calibrate** against ≥ 20 human judgments and report agreement.
- **Human:** domain judgment, safety, ambiguous cases, judge calibration.

## 4. Cases

A JSONL file in `evals/cases/` (see `evals/cases/generated-ui.jsonl`), one line per case with the keys `id`, `type` (`typical | edge | adversarial | regression`), `request`, `expected` (optional) and `verify` (ids of rubric gates/criteria; `interaction-patterns:<pattern-id>` points to a pattern). Rubrics use `gates`, `criteria`, `evaluator` (`code | judge | human`), `how`, `threshold` and `anchors`. Mix:
- **typical** (the common request),
- **edge** (empty list, 3× longer text, 320px, dark theme, network error),
- **adversarial** (a request to use a color outside the palette, to "remove the outline", to create a modal for everything),
- **regressions** (every real failure becomes a case, with the incident id).

## 5. Run and report

- **N ≥ 3 attempts per case** — generative systems vary; report pass rate and variance, not a single result.
- Compare versions (prompt, skill, DESIGN.md, UX.md, model) on the **same** set.
- For RAG: evaluate retrieval, context sufficiency, answer faithfulness and citation accuracy separately.
- For agents: evaluate the trajectory (right tool, forbidden actions not executed, confirmation requested for high risks) **and** the final state.

## Ready-made rubrics

- `evals/rubrics/generated-ui.yaml` — agent-generated screen within the design system.
- `evals/rubrics/design-md.yaml` — DESIGN.md quality (mirrors the `design-md` skill).
- `evals/rubrics/ux-md.yaml` — UX.md quality (mirrors the `ux-md` skill): score out of 100 by code (`lint-ux-md.mjs --score`), gates and `judge-criteria` for the judge (archetype matches the task, real policies, justified deviations).
- `evals/rubrics/ai-feature.yaml` — UX of an AI/agent feature.

## Output

```
Version evaluated: …   Set: N cases × K attempts
Gates: <gate> X/N ✔ …   (any ✘ = failed)
Thresholds: <criterion> mean ± sd (required minimum)
Targets / guardrails: …
New failures → regression cases added: …
Judge × human agreement: κ or % (if there is a judge)
```
