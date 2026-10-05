---
id: evidence-and-sources
area: ai
title: Evidence, signal and prediction — confidence levels for the framework
evidence: contextual
related: [research-with-ai, rag-and-sources, experience-debt]
---

# Evidence, signal and prediction

> **When to consult**
> - When writing or reviewing **any** skill, pattern card, DESIGN.md or document in this framework that makes a claim about people's behavior, a pattern's effectiveness or a trend.
> - When using a number, study, report or "everyone is doing it" to justify a product decision.
> - When assessing whether an AI novelty should change an existing recommendation.
>
> **Master rule of this framework:** every claim in a skill, pattern or context document carries a **declared evidence level**. A claim without a level is treated as a hypothesis.

## 1. Three layers that do not mix

| Layer | What it is | Example form |
|---|---|---|
| **Evidence** | Something observed and supported by data, a study or verifiable documentation | "In a controlled experiment, group X completed the task faster" |
| **Signal** | A movement that indicates direction, without proof of consolidation | "Several products started generating controls inside the chat" |
| **Prediction** | An interpretation of what may happen based on the signals | "Fixed interfaces will lose ground" |

Trend reports tend to merge all three in the same paragraph: the data is solid and the conclusion projected from it is not. The question is not just "what is the source?" but "what **exactly** does this source allow us to conclude?".

The two distinctions that mislead the most:
- **Capability ≠ adoption.** A demonstration proves something is possible, not that people or companies use it. There can be broad use of AI in general and still early use of autonomous agents at the same time.
- **Observed ≠ declared.** Usage logged in a product, a survey answer ("I feel I work faster") and expert opinion measure different things.

## 2. The seven questions

Before turning a claim into a rule, run it through:

1. **What is the original source?** Get to the study, data or document, not to whoever echoed it.
2. **Is the data observed or self-reported?**
3. **Who was studied?** Size, representativeness, region, profession, context.
4. **Is there a commercial interest?** It does not disqualify; it changes the reading.
5. **Does it speak of technical capability or real adoption?**
6. **Is there a comparison over time?** Direction weighs more than an isolated snapshot.
7. **Does it apply to our context?** Strong evidence from another audience, sector, country or product type may have low validity here.

The goal is not to eliminate uncertainty but to **make it explicit**.

## 3. Confidence hierarchy

Use these four levels as the framework's standard vocabulary:

| Level | Tag | Criterion | Example bases |
|---|---|---|---|
| **High** | `[evidence: high]` | Replicated result, peer reviewed, robust public data or convergence of independent sources | Empirically validated human-AI interaction guidelines; WCAG criteria; multiple concordant studies |
| **Contextual** | `[evidence: contextual]` | Large and transparent studies, real usage data, institutional reports with declared limits | A single controlled experiment; data from one platform; research with open methodology |
| **Signal** | `[evidence: signal]` | Product changes, new features, patterns repeated across companies, early studies, preprints, data from a single ecosystem | Launches, alpha-version specifications, trend reports |
| **Hypothesis** | `[evidence: hypothesis]` | Demonstrations, predictions without method, individual opinion, AI output, a claim without an original source | Expert post, synthetic persona, unverified AI synthesis |

Mapping to the `evidence` field of pattern cards (`strong | moderate | emerging`): `high` → strong; `contextual` → moderate; `signal` → emerging. `hypothesis` cannot support a pattern card on its own: it becomes a research question, not a recommendation.

**The common mistake is not using a weak source; it is using a weak source as if it were strong.** A demonstration is very good for raising a hypothesis. It should not, on its own, support a strategic decision.

"Most recent" is not "most reliable": an old study with a clear method and validation can be worth more than a new prediction based on a demo.

## 4. Source types and their limits

| Type | Helps answer | Main limit |
|---|---|---|
| Peer-reviewed academic research | How a behavior was studied under control | Small sample; distant context |
| Preprint | What is emerging | Not yet peer reviewed → signal at most |
| Public and governance frameworks (e.g., NIST AI RMF) | Risks and control practices | Not specific to UX or to your sector |
| Guidelines from large companies | Applicable practical guidance | Generalist; may reflect their own ecosystem |
| Real platform usage data | How people actually use it | Limited to that product and audience |
| Market research | Adoption and perception at scale | Self-report, sampling, commercial incentive |
| Product documentation | What the technology already does | Capability is not value or adoption |
| Opinion, social media, newsletters | Discovering hypotheses | Never evidence on its own |

## 5. Writing rules for skills and documents

- **Declare the level** next to every non-trivial claim, with the tag from section 3.
- **Describe what was measured, not what you would like it to mean.** "Participants reported working faster" ≠ "AI increases productivity".
- **Numbers only with minimal context:** study type, year, what was measured and the limit. Without context, do not cite the number.
- **Do not invent statistics.** When in doubt, describe qualitatively and mark it as a hypothesis.
- **Separate recommendation from justification.** A rule can be strong for risk reasons (e.g., confirming irreversible actions) even with only contextual evidence; say so.
- **Record origin, date and scope** of UX context rules, and revise when the source changes.
- **AI output is a hypothesis** until checked against data or research (see `research-with-ai.md`).
- **IF** two sources conflict **THEN** present both with their levels; do not choose silently.
- **IF** the evidence is only a signal **THEN** the rule must be reversible and have a review date.

Example of a well-written claim:

> Interfaces generated for the task may be preferred to pure conversation in structured tasks; a 2026 academic study observed this effect under specific conditions. `[evidence: signal]` Apply only where a dedicated eval confirms reduced effort.

## 6. Trend readings with the right caveat

Movements that appear consistently across different sources, and how to treat them:

| Movement | Level | Implication for the framework |
|---|---|---|
| UX starts designing system behavior, not just screens | strong signal | Specify states, limits, confirmation and recovery beyond layout |
| Agents turn delegation and control into UX problems | strong signal | See `ux-for-agents.md` |
| Generative interfaces increase the need for evaluation | signal | See `evals.md` and `generative-ui.md` |
| Research gets faster and loses traceability without safeguards | contextual | Mandatory insight → source traceability |
| Trust becomes a designable and measurable mechanism | contextual | Measure calibrated trust, not maximum trust |

Predictions about jobs and professions are the expectations of respondents, not measurements of what happened; treat them as signal.

## 7. Anti-patterns

- Citing whoever echoed it instead of the original source.
- Treating self-reported perception as objective measurement.
- Mistaking demonstrated capability for adoption.
- Generalizing data from one platform to the whole market.
- Using a preprint as high evidence.
- Presenting a prediction in the present tense ("interfaces are...").
- A claim without an evidence level in a skill or card.
- A loose number, with no study, year or scope.

## 8. Checklist

- [ ] Every non-trivial claim has a level tag (high, contextual, signal, hypothesis).
- [ ] Cited sources are original, not echoes.
- [ ] Observed data and declared data are distinguished.
- [ ] Capability and adoption are not confused.
- [ ] Numbers come with study type, year, scope and limit.
- [ ] Signal-based rules are reversible and have a review date.
- [ ] Conflicts between sources are exposed.
- [ ] Applicability to the product's context was considered.
