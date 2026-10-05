---
id: evals
area: ai
title: AI evals for products and experiences
evidence: contextual
related: [ux-for-agents, generative-ui, rag-and-sources, experience-debt]
---

# AI evals for products

> **When to consult**
> - Before launching or changing any AI feature (model swap, prompt, tool, knowledge base or interface).
> - When writing rubrics to judge open-ended outputs: texts, summaries, agent-generated UI, a generated DESIGN.md.
> - When configuring an LLM judge, choosing metrics for RAG or agents, or assembling the launch scorecard.
> - When someone says "I tested it and it looked good".

## 1. Definition

An eval is a **repeatable** test that checks whether an AI system does what it should, with enough quality for real people and contexts. It turns expectations, risks and needs into observable criteria that can be compared across versions and tracked over time.

The unit under evaluation is not just the model: it includes the prompt, context, retrieval, tools, business rules, interface, latency and cost. A model can do well on a public benchmark while the product fails because search brought back the wrong document or because the person did not realize they needed to review.

Evals do not replace other methods:

| Method | Question |
|---|---|
| Eval | Does the system behave according to the criteria? |
| Usability test | How do real people perform the task and where do they get stuck? |
| Analytics | What happens at scale? |
| A/B test | Does one alternative cause a better outcome? (only after both meet the minimums) |

## 2. Four layers

| Layer | Question | What to measure |
|---|---|---|
| **Product and experience** | Does the AI help complete the task? | Task success, rework, comprehension, calibrated trust, control, recovery |
| **System** | Is the result technically adequate? | Correctness, factuality, grounding in sources, instruction adherence, tool use, latency, cost |
| **Risk** | Are unacceptable failures avoided? | Safety, privacy, bias, leakage, improper actions, improper refusals |
| **Operations** | Does quality hold after changes? | Regressions, incidents, production traces, new cases |

**Rule:** risk metrics are never averaged with the others; they work as a gate (section 6).

## 3. Six steps

1. **Start from the task, not the metric.** "Answer well" is vague. "Identify the applicable policy, explain it and show the source" is evaluable. Then write the failure taxonomy: which errors are tolerable and which must never happen.
2. **Build a representative set.** Combine expert-written cases, real production situations, edge cases, adversarial inputs and, to broaden coverage, synthetic cases. A few dozen realistic cases already reveal behavior changes in a new system; mature products need larger, living sets.
3. **Write rubrics before comparing versions.** One criterion per line (factuality, coverage, relevance, clarity). A single "quality 8/10" score does not say what to fix.
4. **Match evaluator to criterion.** See section 4.
5. **Run multiple attempts.** Generative systems vary. Distinguish "passed at least one of N" from "passed all N"; when consistency is part of quality, the second is what matters.
6. **Turn real failures into regression cases.** Observe the failure → understand the cause → create the case → fix → run the suite → keep it from coming back.

## 4. Evaluator types

| Evaluator | When to use | Examples |
|---|---|---|
| **Code** | Deterministically verifiable condition | Exact match, regex, schema validation, final tool state, contrast ≥ 4.5:1, no raw value outside tokens |
| **LLM judge** | Open semantic criterion, at scale | Relevance, completeness, instruction adherence, pairwise comparison |
| **Human** | Domain judgment, context, safety | Domain fit, perceived usefulness, review of critical cases, judge calibration |

**IF** a criterion can be checked by code **THEN** do not use an LLM judge for it. A mature system combines all three: automating everything hides evaluator bias; evaluating everything by hand makes the cycle slow.

## 5. Metrics by system type

### RAG
Decompose; evaluating only the final answer hides where the defect is.
- **Retrieval:** were the relevant sources found? (context precision and recall, expected source present)
- **Sufficiency:** is the retrieved context enough to answer?
- **Grounding/faithfulness:** is every claim supported by the context?
- **Citation:** does the cited source actually support the claim it is linked to? Separate "cited correctly" from "answered faithfully".
- **Task:** does the answer meet the need?

This avoids fixing the prompt when the problem is search, or swapping the model when the problem is the knowledge base. UX details: `rag-and-sources.md`.

### Agents
Evaluate **trajectory and outcome**:
- deterministic verification of the final state;
- the right tools, with the right parameters;
- forbidden actions (any occurrence fails);
- outcome judged by rubric;
- trace analysis;
- repetition of the same task to measure consistency.

Do not require an overly rigid trajectory: different paths can reach the same valid result. But an agent that gets it right by a dangerous or expensive path must fail.

### Experience and operations
Task success, time to success, abandonment, corrections; p50/p95 latency; **cost per successful task** (more informative than cost per call).

## 6. Scorecard: gates, thresholds, targets, guardrails

Never average metrics of different natures. A system with quality 92, experience 90 and safety 40 is not "a 74"; it is a system that cannot be launched.

| Type | Function | Example | If it fails |
|---|---|---|---|
| **Gate** | Blocks launch | Zero unsafe critical actions in the release set; zero leakage of another user's data | Do not launch |
| **Threshold** | Acceptable minimum | Task success ≥ value defined by the product | Review before proceeding |
| **Optimization target** | Continuous improvement | Reduce cost per successful task | Compare alternatives |
| **Guardrail** | Prevent collateral regression | Abandonment and rework do not increase | Block a local gain that worsens the experience |

There is no universal threshold: the numbers come from the product, the risk and the context. Record in the scorecard who set each number and why.

## 7. Rubrics and the LLM judge

### Rubric design rules
1. **One criterion per line.** Never "clear and correct" in the same item.
2. **Short ordinal scale** (0–3 or 1–4) with a **descriptive anchor** for each point.
3. **Pass and fail examples** for each criterion.
4. **Separate binary gates from scores.** What is unacceptable is yes/no and cannot be offset.
5. **Require evidence for each score:** the evaluator cites the excerpt or element that justifies it.
6. **Write the rubric before seeing the outputs** of the new version.
7. **Version** the rubric; a rubric change invalidates direct comparison with older runs.

### LLM judge calibration
Judges have known biases: preference for position, for long answers and for certain styles.
- Build a set labeled by people (with domain experts when relevant).
- Measure agreement between judge and human labels **per criterion**, not just overall.
- Investigate every disagreement; adjust the rubric or the judge prompt.
- In pairwise comparison, alternate the order of the answers and discard judgments that change with order.
- Ask for specific criteria, never "give a score".
- Recalibrate when you change the judge model, the rubric or the domain.
- **IF** agreement on a criterion is low **THEN** that criterion goes back to human evaluation.

## 8. Example: rubric for "agent-generated UI"

```yaml
rubric: generated-ui-by-agent
version: 1.0
scope: "Interface composition outputs by an agent (generative UI level 1-2) and screens generated from DESIGN.md"
evaluator-inputs: [user-request, declarative-spec, render-light, render-dark, accessibility-tree, catalog, design-md]

gates:   # binary; any failure fails the entire output
  - id: G1-catalog
    criterion: "Uses only catalog components and no combination marked as invalid"
    evaluator: code   # schema validation
  - id: G2-tokens
    criterion: "No raw visual value (color, spacing, radius, font) outside the tokens"
    evaluator: code   # raw value lint
  - id: G3-contrast
    criterion: "Text/background pairs >= 4.5:1 (normal text) and >= 3:1 (large text and components), in light and dark"
    evaluator: code
  - id: G4-invariants
    criterion: "Navigation, legal notices, AI label and cancel/undo controls present and unchanged"
    evaluator: code
  - id: G5-critical-action
    criterion: "Every high- or critical-risk action goes through the fixed confirmation (action, target, consequence)"
    evaluator: code + sampled_human
  - id: G6-keyboard
    criterion: "All controls reachable by keyboard, with visible focus and accessible name"
    evaluator: code   # automated scan + accessibility tree

criteria:   # 0-3 scale, evidence required
  - id: C1-format-fit
    question: "Is the chosen component type the right one for the requested task?"
    evaluator: llm_judge
    anchors:
      0: "Format gets in the way (e.g., a paragraph to compare 5 items)"
      1: "Format works but requires avoidable effort"
      2: "Format is adequate, with small excesses or gaps"
      3: "Format is the most direct for the task"
    pass-example: "A request to compare 4 plans becomes a comparison table with the best value highlighted"
    fail-example: "The same request becomes 4 loose cards with no aligned attributes"
  - id: C2-completeness
    question: "Is all the information needed to decide or act present, without inventing data?"
    evaluator: llm_judge
    anchors:
      0: "Essential data missing or invented data present"
      1: "Relevant data missing"
      2: "Complete, with a secondary detail missing"
      3: "Complete and only what is needed"
  - id: C3-hierarchy
    question: "Does the visual and reading order prioritize what the person needs first?"
    evaluator: llm_judge
    anchors:
      0: "Primary action or key information hidden"
      1: "Confusing priority"
      2: "Clear, with one competing element"
      3: "Unambiguous hierarchy"
  - id: C4-states
    question: "Are loading, empty, error and partial states provided for the data involved?"
    evaluator: code + llm_judge
    anchors:
      0: "No alternative state"
      1: "Loading only"
      2: "One relevant state missing"
      3: "All pertinent states"
  - id: C5-microcopy
    question: "Are labels and messages clear, consistent with the glossary and unambiguous?"
    evaluator: llm_judge
    anchors:
      0: "Contradictory terms or ambiguous action"
      1: "Several vague labels"
      2: "One label could be improved"
      3: "Clear and consistent text"
  - id: C6-consistency-across-runs
    question: "Do equivalent requests (5 runs) produce recognizably identical compositions?"
    evaluator: code   # structural similarity between specs
    anchors:
      0: "Different components on every run"
      1: "Same component, unstable order and grouping"
      2: "Variation only in detail"
      3: "Stable structure"
  - id: C7-task
    question: "Does a representative person complete the task with this output?"
    evaluator: human   # sample of sessions
    anchors:
      0: "Does not complete"
      1: "Completes with help"
      2: "Completes with hesitation"
      3: "Completes directly"

decision-rules:
  output-passes: "all gates pass AND no criterion scores 0 AND mean(C1..C6) >= 2.0"
  runs-per-case: 5
  consistency: "case passes only if all 5 runs pass"
  evidence: "each score cites the element (spec id or excerpt) that justifies it"
  judge-calibration: "recalibrate against human labels on every change of rubric, judge model or catalog"
  thresholds: "values above are examples; the product defines and records its own"
```

## 9. Pitfalls

- Using a public benchmark as the product's acceptance test.
- Drawing conclusions from a single answer.
- Averaging incompatible metrics.
- An LLM judge without human calibration.
- A test set frozen after launch.
- Measuring adoption (more sessions, more prompts) as if it were delivered value.

## 10. Who defines what

| Role | Contribution |
|---|---|
| Product | Goal, trade-offs, launch criteria |
| UX research | Needs, rubrics, qualitative validation |
| Design | Interaction, control, feedback, recovery |
| Engineering | Evaluation infrastructure, instrumentation, traces |
| Domain experts | Reference answers and professional criteria |
| Security, privacy, governance | Risk gates, policies, threat modeling |

A "good answer" is not a purely linguistic property: it depends on intent, timing, the consequence of error and what the person needs to do next. That is why UX takes part in defining the evals.

## 11. Checklist

- [ ] The task and failure taxonomy are written before the metrics.
- [ ] The set mixes expert, production, edge and adversarial cases.
- [ ] Each criterion has an appropriate evaluator (code > judge > human, case by case).
- [ ] Rubrics have one criterion per line, anchors, examples and an evidence requirement.
- [ ] LLM judge calibrated against human labels, per criterion.
- [ ] Multiple runs per case when consistency matters.
- [ ] Scorecard separates gates, thresholds, targets and guardrails; no averaging of risk.
- [ ] RAG and agents evaluated in parts (retrieval/generation/citation; trajectory/final state).
- [ ] Production failures routinely become regression cases.
