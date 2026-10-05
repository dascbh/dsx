# UX metrics, experiments and ROI

## When to consult

- When administering or scoring SUS, or comparing usability scores.
- When building a set of metrics for a product or feature (HEART).
- When calculating success, time and error rates, with honest intervals for small samples.
- When planning or analyzing an A/B test: sample size, MDE, duration, peeking, SRM, A/A.
- When estimating the ROI or payback of a UX improvement, or reading a conversion funnel.

## 1. Metrics: layers and functions

| Layer | Examples |
|---|---|
| Experience signal | perceived ease, satisfaction, reported trust |
| Task behavior | success, errors, abandonment, time, feature adoption |
| Product/business outcome | activation, retention, conversion, support contacts |
| Guardrail | critical errors, complaints, cancellations, accessibility |

Each metric serves a **function** that depends on the question: **diagnostic** (where it fails), **outcome** (the intended effect, usually lagging) or **guardrail** (the unwanted effect that must not get worse).

Rules:

- **IF** the metric changes and the team does not know what to investigate or decide **THEN** it is useless; discard it.
- Less time is good in a purchase and can be bad in reading. More clicks can mean usefulness, difficulty or an extra step. Interpret in context.
- "The indicator changed" ≠ "it changed together with the new version" ≠ "the new version caused it". Only the third statement supports attribution, and it requires an experimental design.

## 2. HEART (Google)

A thinking framework, not a mandatory dashboard. For each relevant dimension, follow **Goals → Signals → Metrics**.

| Dimension | Goal (example) | Signal | Metric |
|---|---|---|---|
| Happiness | People feel safe when paying | Answer to a post-task question | Mean SEQ at the payment step |
| Engagement | Intentional use of the report | Report opened | Users who open it ≥ 1×/week ÷ active users |
| Adoption | New users discover export | First export | New users who export within 14 days ÷ eligible new users |
| Retention | Accounts keep using it | Return after 30 days | Day-30 cohort retention |
| Task success | Complete sign-up without help | Completion and errors | Completion rate; errors per session |

Choose 2–3 dimensions tied to the decision at hand. For work tools, consider dimensions of cognitive load, learning and efficiency.

## 3. Task metrics

```
completion rate   = tasks completed / tasks attempted × 100
error rate        = errors observed / error opportunities
time on task      = report the median (or geometric mean) of successful attempts only, together with the success rate
absolute change   = new − previous  (in percentage points)
relative change   = (new − previous) / previous × 100
```

**A small sample requires an interval.** For completion rates with small n, use the adjusted Wald interval (95%):

```
p_adj = (x + 1.92) / (n + 3.84)
CI    = p_adj ± 1.96 × √( p_adj × (1 − p_adj) / (n + 3.84) )
```

Example: 4 of 5 completed. `p_adj = 5.92 / 8.84 ≈ 0.67`. Standard error `√(0.67 × 0.33 / 8.84) ≈ 0.158`. CI ≈ `0.67 ± 0.31` → **from 36% to 98%**. Honest conclusion: "4 of 5 completed; the real rate may be anywhere from about a third to almost everyone". Do not write "80% success".

SEQ (Single Ease Question): one question after each task, 7-point scale, from "very difficult" to "very easy". Cheap and good for comparing tasks.

## 4. SUS (System Usability Scale, John Brooke)

Ten statements, answered from 1 (strongly disagree) to 5 (strongly agree), administered **after** the person has used the system. Odd items are positive, even items are negative:

1. I think that I would like to use this system frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I think that I would need the support of a technical person to be able to use this system.
5. I found the various functions in this system were well integrated.
6. I thought there was too much inconsistency in this system.
7. I would imagine that most people would learn to use this system very quickly.
8. I found the system very cumbersome to use.
9. I felt very confident using the system.
10. I needed to learn a lot of things before I could get going with this system.

Scoring:

```
odd  (1,3,5,7,9):  contribution = response − 1
even (2,4,6,8,10): contribution = 5 − response
SUS = (sum of the 10 contributions) × 2.5      → 0–100 scale
study score = mean of participants (show the distribution too)
```

Worked example. One participant's responses: `3, 3, 4, 2, 3, 3, 4, 2, 4, 2`.

- Odd: (3−1) + (4−1) + (3−1) + (4−1) + (4−1) = 2 + 3 + 2 + 3 + 3 = **13**
- Even: (5−3) + (5−2) + (5−3) + (5−2) + (5−2) = 2 + 3 + 2 + 3 + 3 = **13**
- Sum 26 × 2.5 = **65**

If five participants scored 65, 72.5, 85, 57.5 and 70, the mean is `350 / 5 = 70`, with a range from 57.5 to 85. Report the mean, n and distribution.

Interpretation (a reference, not a law): the mean frequently cited across large datasets is about **68**. Below 50 indicates serious problems; 70 to 80 is good; above 80 is very good. Compare mainly against the **product's own baseline**, in the same context.

Rules:

- SUS is not a percentage: 80 does not mean "80% usable".
- SUS measures global perception; it does not say where or why. Combine it with success, time, errors and observation.
- Do not change the wording without documenting and piloting; that breaks comparability.
- Do not compare studies with different audiences, tasks, devices or versions.
- Common mistake: adding up the raw responses without reversing the even items.
- With a small sample and no history, treat the first result as an exploratory baseline.
- Short alternative: UMUX-Lite (two items).

## 5. A/B testing: the essentials

An experiment in which users are randomly assigned to control and variant to check whether **one specific change** alters a metric. It does not serve to discover the problem or to choose the prettiest design.

Hypothesis: `We believe that changing <element> from <current> to <variant> will increase <metric> among <audience> because <evidence or mechanism>.`

**Before launching, fix:** primary metric, guardrails, MDE, sample size, duration, decision rule and the segments that will be analyzed.

### Sample size (rule of thumb)

To compare two proportions with two-sided α = 0.05 and 80% power (Lehr's approximation):

```
n per group ≈ 16 × p × (1 − p) / δ²
p = base rate   δ = minimum absolute difference worth detecting (absolute MDE)
```

Examples:

- Base rate 10%, MDE of 1 percentage point (10% → 11%): `16 × 0.09 / 0.0001 = 14,400` per group.
- Same base, relative MDE of 5% (10% → 10.5%, δ = 0.005): `16 × 0.09 / 0.000025 = 57,600` per group.

Halving the MDE multiplies the sample by four. Use a statistical calculator for the final number; the rule serves to check feasibility.

**MDE** is the smallest change that would justify implementing. Ask the team "what is the smallest gain that would be worth the cost?" before looking at any data.

Duration: `days ≈ (n per group × number of groups) / daily eligible traffic`, rounded up to cover complete cycles (at least one full week, to include weekdays and the weekend).

- **IF** the calculated duration exceeds a few weeks **THEN** the test is infeasible for that MDE; increase the MDE, switch to a more frequent metric, or use another method (research, monitored rollout).

### Peeking

Looking at the result repeatedly and stopping when it "became significant" greatly inflates the false positive rate. Rules:

- Run until the planned n, then analyze once.
- If you need to monitor during the test, use a sequential method designed for that, defined beforehand.
- Looking at guardrails during the test to stop it for harm is allowed and recommended.

### SRM (sample ratio mismatch)

Before comparing rates, check whether the observed split matches the planned one. Chi-square test:

```
χ² = Σ (observed − expected)² / expected
```

Example: planned 50/50 split; observed 50,000 in control and 48,500 in the variant. Total 98,500, expected 49,250 per group. `χ² = 750²/49,250 + 750²/49,250 ≈ 22.8`. With 1 degree of freedom, this corresponds to p < 0.001. **There is SRM: do not analyze the result**; investigate assignment, redirects, bots or event failures.

### A/A test

Run two identical versions before important experiments. It serves to validate instrumentation, assignment and the platform's false positive rate. Frequent "significant" differences in an A/A indicate a problem in the experimentation system.

### Reading the result

Always report: absolute and relative difference, confidence interval, n per group, duration, guardrails, cost and reversibility.

| Result | Action |
|---|---|
| Variant better and above the MDE | Implement and monitor |
| Control better | Keep it; investigate the mechanism |
| Inconclusive | Keep control. "No difference" means insufficient sensitivity, not equivalence |
| Primary goes up, guardrail worsens | Evaluate the trade-off explicitly |
| Segments diverge | Only consider it if the segment was planned and has enough sample |

Statistical significance ≠ practical importance. Analyzing many segments after the test produces chance findings. Do not test several changes together if you want to know which one worked. Experiments do not justify dark patterns: a short-term gain that erodes trust is a loss.

## 6. UX ROI

```
ROI (%)              = (benefit − investment) / investment × 100
payback (months)     = investment / monthly benefit
support savings      = tickets avoided × cost per ticket
productivity         = hours saved × hourly cost   (only if the time becomes useful work)
incremental revenue  = additional conversions × contribution margin  (not gross revenue)
exposure of a problem = occurrences × cost of the consequence
```

Worked example (illustrative numbers):

- Tickets about a flow: 2,400/month → 1,800/month after the change = 600 avoided.
- Cost per ticket: R$ 20 → monthly benefit R$ 12,000 → annual R$ 144,000.
- Full investment (research, design, development, QA, rollout): R$ 60,000.
- 12-month ROI = (144,000 − 60,000) / 60,000 × 100 = **140%**.
- Payback = 60,000 / 12,000 = **5 months**.

Step by step: baseline → UX metric that represents the change → connected business KPI → conversion into money → **full** investment → calculation with documented assumptions (period, sources, method).

Rules:

- Separate **exposure** (value tied to the problem), **expected benefit** (the part the intervention can recover) and **realized benefit** (measured afterwards). Mixing them inflates projections.
- Without strong causality, present conservative, base and optimistic scenarios.
- Avoided cost (support, rework, error) is usually more defensible than revenue.
- Hierarchy of evidence for attributing benefit: inspection (potential) < behavioral signal < user evidence (mechanism) < experiment (attribution).
- Avoid false precision ("R$ 283,749") and universal numbers of the "every dollar in UX returns X" kind.
- Accessibility, security, privacy and risk of harm can justify a fix without ROI.

## 7. Funnel math (CRO)

```
conversion rate   = conversions / opportunities × 100     (define the denominator precisely)
overall conversion = product of the rates at each step
```

Illustrative example: 10,000 visits → 30% start sign-up (3,000) → 60% complete the form (1,800) → 50% pay (900). Overall = 0.30 × 0.60 × 0.50 = **9%**.

If the form step goes from 60% to 70%: 3,000 × 0.70 = 2,100 → 1,050 pay → overall **10.5%** (+1.5 p.p.; +16.7% relative). Each transition has a different probable cause (interest, form friction, technical error, wrong audience). Analytics says **where**; research says **why**.

Rules:

- Confirm the instrumentation first (duplicate events, missing tags, consent).
- Every primary metric has a guardrail: form submissions ↔ lead quality; sign-ups ↔ activation; purchases ↔ returns and cancellations; adoption ↔ task success.
- A micro-conversion only matters if it correlates with the final outcome.
- **IF** traffic does not support the desired MDE **THEN** do not A/B test cosmetic changes; use research, heuristics, replays and monitored rollout.
- **IF** it is an obvious bug or an accessibility failure **THEN** fix it directly and monitor; no experiment needed.
- Document the losing tests too.

## What an agent can / cannot do

> **Can:** calculate SUS, means, distributions, confidence intervals, sample size, duration, SRM χ², ROI, payback and funnels from provided data; propose a metrics tree and guardrails; audit experiment plans (peeking, post-hoc metrics, unplanned segments); build scenarios with explicit assumptions.
>
> **Cannot:** generate simulated SUS responses, A/B results or baselines; invent cost per ticket, base rate or traffic (ask for the data); declare a winner without a criterion fixed beforehand; claim causality without an adequate design; deploy a variant without human approval.
