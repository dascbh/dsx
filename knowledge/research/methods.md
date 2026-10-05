# Research methods

## When to consult

- Before choosing any method, or when someone has already chosen a method without saying which question it answers.
- When planning interviews, card sorting, tree testing, benchmarking or analytics/heatmap/session replay analysis.
- When the question comes up: "is this generative or evaluative research?", "do I need qual or quant?".

For usability tests, see `usability-testing.md`. For value validation methods (fake door, concept, MVP), see `discovery-and-strategy.md`.

## 1. Classify by the question, not by the method's name

The same technique can serve different purposes. An interview can explore a problem or evaluate a proposal; a survey can discover or measure. That is why the agent always classifies the **question**.

| Axis | Side A | Side B |
|---|---|---|
| Purpose | **Generative**: what do we need to understand or solve? Produces knowledge about people, context, needs | **Evaluative**: how does this solution perform? Produces problems found and performance evidence |
| Timing of the evaluation | **Formative**: improve something under construction | **Summative**: compare against a reference (baseline, competitor, target) |
| Nature of the data | **Qualitative**: why, how; uncovers problems and mechanisms | **Quantitative**: how much, how often; measures and compares |
| Source | **Attitudinal**: what the person says | **Behavioral**: what the person does |
| Context of use | Natural (field, analytics) · Scripted (test) · Limited (card sort, tree test) · No product (exploratory interview) | |

Rules:

- Do not confuse generative with qualitative: a large survey can be generative.
- Do not confuse generative with "before launch": a mature product with unexplained behavior calls for generative research again.
- A report does not prove behavior. "I would use it" demonstrates neither demand, frequency nor cause.
- Combine qual and quant by default: quant points to where, qual explains why.

## 2. Selection tree

- **IF** there is no identifiable decision **THEN** stop and ask "what changes depending on the result?" before proposing a method.
- **IF** the uncertainty is about who, context or need **THEN** interviews, field study, diary, reading support tickets.
- **IF** it is about how they solve it today **THEN** interview anchored in the last episode + analytics of current behavior.
- **IF** there is something concrete to evaluate and the question is "can they use it?" **THEN** usability test.
- **IF** the question is "how much/how many" **THEN** analytics or a sampled survey; never percentages from interviews.
- **IF** the question is causal ("did the change cause it?") **THEN** controlled experiment (A/B); without enough traffic, gradual rollout with a comparable group.
- **IF** the doubt is how to group content **THEN** card sorting; **IF** it is whether they find something in a structure **THEN** tree testing.
- **IF** there is already enough evidence for the decision **THEN** do not research; document the evidence and move on.
- **IF** the change is small, cheap and reversible **THEN** consider testing directly in production with monitoring.

Checklist before settling on the method: which decision? what is unknown? is the question about the problem or the solution? is there something concrete to evaluate? do I want "how much" or "why"? observed behavior or reported perception? who needs to be represented? what evidence would contradict my current reading?

Nine-step process: decision context → map of what is known, believed and unknown → research questions → review of existing evidence → type of evidence needed → method → participants/sources → collection with traceability → analysis tied to the decision, with limits.

## 3. User interviews

They serve to understand **reported** experiences, needs and behaviors. The evidence is mainly attitudinal; treat it as such.

Formats: structured (high comparability), **semi-structured** (default: fixed themes with free follow-ups), unstructured (almost unknown domain).

Moderation rules:

- Separate **research questions** (what the team wants to know) from **participant questions** (what is asked in the session). Never read the research question out loud.
- Anchor in a concrete episode: "Tell me about the last time you…" and then "what happened next?". Go from the general to the episode, not the other way around.
- Avoid leading questions ("it was confusing, right?"), hypothetical ones ("would you use it?"), defensive ones ("why didn't you do X?") and outsourced design ("what should we build?").
- Listen more than you talk. Tolerate silence. Do not defend the product.
- The guide is a map: follow unexpected leads and come back to the themes.
- Record with session ID and timestamp; preserve divergent cases.

Combining it with a usability test in the same session is possible, as long as the opening questions do not anticipate what will be evaluated.

Template: `templates/interview-guide.md`.

## 4. Card sorting

Investigates how people group and name content. Input for information architecture, not proof of navigation.

| Type | Use |
|---|---|
| Open | Participant creates and names groups. Exploratory |
| Closed | Categories are given. Checks fit; for findability, prefer tree testing |
| Hybrid | Categories given + the option to create new ones. Use with justification, since the suggested categories influence the result |

Step by step: specific question → content inventory (including ambiguous items) → cards in neutral language, no jargon and no repeated words that induce grouping → around 30–50 cards (the pilot reveals fatigue and a bloated "miscellaneous" group) → recruit real users per segment → pilot → instructions that do not teach (they may create as many groups as they want, leave a card alone) → record hesitations.

Analysis:

- Review individual sessions before aggregating.
- Standardize group names with caution; only merge "My account" and "Profile" if the grouped content is the same.
- **Similarity matrix**: percentage of participants who put two cards together. High = strong association; middling values = ambiguity to investigate.
- **Dendrogram**: shows clusters; it does not automatically become a menu.

Pitfalls: internal colleagues only; category embedded in the card text; imposing a number of groups; using card sorting to measure findability.

## 5. Tree testing

Evaluates whether people find items in a text-only hierarchy, isolating structure and labels from any visual effect.

Step by step: decision and scope → priority tasks (drawn from internal searches, tickets, high-value flows and suspect areas) → tree without icons or descriptions, with correct destinations defined (there may be more than one) → tasks as scenarios **without repeating tree labels** → recruit people who know the domain but not the structure → pilot → collect complete paths → analyze per task → iterate changing one variable at a time.

Task example: bad — "Find the duplicate copy of the invoice". Good — "This month's payment slip did not arrive and you need to pay by Friday. Where would you look?"

Metrics:

- `success = participants who reached a correct destination / participants` (per task and per segment).
- **Direct success** (no backtracking) vs **indirect** (with backtracking). A lot of indirect success indicates a confusing structure even when success is high.
- **First click**: which top-level branch was chosen. A wrong first click is a strong predictor of difficulty.
- **Competing destinations**: branches that "steal" answers through semantic similarity.

Limits: it does not evaluate menu visibility, visual hierarchy, search, contextual links or the final page. Keep fewer than 10 tasks per participant.

Typical IA sequence: card sorting → proposed structure → tree testing → prototype → usability test.

## 6. UX benchmarking

A **repeatable** evaluative study: the same tasks, metrics and conditions, measured in rounds to compare against a baseline.

Vocabulary: **baseline** (first reliable measurement) · **benchmark** (the repeatable process) · **target** (goal) · **delta** (difference between rounds).

Rules:

- Start from the decision, not from the metrics dashboard.
- Choose 5–10 critical tasks, with a starting point and an objective success criterion ("payment completed and confirmation shown", not "clicked pay").
- Use 2–4 complementary metrics: success, time, errors/help, perception (SUS or SEQ).
- Freeze the protocol before collection (recruitment, instructions, task order, device, help rules). That is the comparability contract.
- Preserve raw data. Use new, equivalent participants each round.
- Record everything that changed between rounds (version, seasonality, tool, profile).
- In the analysis, answer three separate questions: what difference was observed? with how much uncertainty (CI, distribution)? does it matter for the decision?

A competitive benchmark applies the same tasks and criteria to several products. It serves to position, not to produce a vanity ranking.

## 7. Analytics, heatmaps and session replay

Behavioral analytics tools show **what** happened, never **why**.

| Source | Shows | Good for |
|---|---|---|
| Event/funnel analytics | Volumes, step rates, cohorts | Locating where the flow leaks, sizing reach |
| Heatmap (click, scroll) | Aggregate of interactions on a page | Seeing whether important elements are reached and clicked |
| Session replay | Sequence of an individual session | Understanding the pattern behind a number |

Signals and possible readings (none is a diagnosis on its own):

- **Rage clicks** (rapid repeated clicks): lack of response, insufficient feedback or slowness. Check technical performance before blaming the design.
- **Dead clicks** (click with no effect): something looks interactive and is not. There are false positives (text selection, for example).
- **Quick back** (enters and goes back): unmet expectation, wrong navigation or simple comparison.
- **Excessive scrolling**: searching for something hard to find, or attentive reading. It depends on the context.

How to use them:

1. Start from a specific question.
2. Segment (page, device, source, behavior).
3. Watch enough sessions to see patterns **and** contradictions; do not pick only the ones that confirm the thesis.
4. Separate observation, interpretation and hypothesis.
5. Quantify reach in analytics before prioritizing.
6. Explain the mechanism with qual research; validate the solution with testing.

Limits: consent, blockers and implementation failures bias the sample; canvas and third-party iframes may not be captured; automatic session summaries are triage and require checking against the original. Without a question, without a person responsible for the analysis and without data governance, the tool becomes noise. Privacy: mask sensitive fields before collection (see `ethics-and-inclusion.md`).

Before trusting any rate, check the instrumentation: duplicate events, missing tags, wrong denominator, effect of the consent banner.

## General pitfalls

- Choosing a method by the tool available or by familiarity.
- Framing it as "validate" (the design has already chosen the answer). Prefer neutral questions and look for evidence that refutes.
- Recruiting wrong: the right method with the wrong participants produces weak research.
- Turning interviews into percentages or events into "quotes".
- Treating research as a single phase before design.
- Generalizing beyond the scope collected.

## What an agent can / cannot do

> **Can:** suggest a method from the question; draft guides, cards, tasks and protocols; detect repeated labels and leading questions; calculate similarity matrices, direct/indirect success, deltas and intervals from real data; triage sessions and heatmaps for human review; transcribe and draft coding.
>
> **Cannot:** generate "simulated" answers, card sorts, tree paths or sessions and treat them as data; define recruitment criteria alone; turn an automatic summary into a finding without checking the raw material; claim cause from a heatmap or replay.
