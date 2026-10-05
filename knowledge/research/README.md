# Research: UX research and product discovery

Knowledge base for agents that plan research, evaluate experiences, measure usability and support product decisions. The files are written for direct lookup: imperative rules, IF → THEN trees, formulas with worked examples and explicit limits on what an agent can do on its own.

## When to consult

- Someone asks to "research", "validate", "test with users" or "find out what to build".
- The request arrives as a ready-made solution ("build a dashboard", "add AI") and the problem is missing.
- You need to choose a method, calculate a sample size, score SUS, size an A/B test or estimate ROI.
- You need to turn raw notes into findings, or findings into a recommendation for stakeholders.
- Someone proposes using synthetic users (LLMs) instead of people.

## Doctrine (applies to every file)

1. **Decision before method.** First write down which decision changes depending on the result. Without a decision there is no research to plan; there is a clarity problem.
2. **A synthetic user produces hypotheses, never evidence.** Every LLM output that simulates people (answers, reactions, personas, SUS scores, "sessions") gets the label `HYPOTHESIS — not validated with people`.
3. **Never fabricate.** Do not invent quotes, session IDs, percentages, baselines, costs or test results. If the data was not provided, ask for it or mark it `<missing data>`.
4. **Traceability is mandatory.** Every finding points to the raw source (session, timestamp, event, ticket, period). A finding without a source is an opinion.
5. **Criteria before data.** Metrics, success thresholds and decision rules are defined before collection.
6. **Declared scope.** Say "3 of 7 participants in segment X, on prototype v2", never "the users".
7. **When in doubt, "Investigate".** Prefer classifying something as Investigate over recommending with a certainty the data does not support.

## Files

| File | Load when |
|---|---|
| [methods.md](methods.md) | Choosing a method; telling generative from evaluative and qual from quant; interviews, card sorting, tree testing, benchmarking, analytics, heatmaps and session replay |
| [discovery-and-strategy.md](discovery-and-strategy.md) | Framing the problem, writing jobs, building an Opportunity Solution Tree, mapping assumptions, fake door, concept test, MVP, product strategy, PLG |
| [usability-testing.md](usability-testing.md) | Planning, scripting, moderating or analyzing a usability test; defining the sample; rating severity |
| [metrics-and-roi.md](metrics-and-roi.md) | Calculating SUS, building HEART, task metrics, sizing and analyzing A/B tests, ROI/payback, funnel math (CRO) |
| [synthesis-and-communication.md](synthesis-and-communication.md) | Synthesizing data, triangulating, writing traceable findings, presenting to stakeholders, organizing the repository/ResearchOps |
| [ethics-and-inclusion.md](ethics-and-inclusion.md) | Consent, LGPD, retention, compensation, inclusive recruitment, study accessibility |
| [personas-journeys-blueprint.md](personas-journeys-blueprint.md) | Evidence-based personas, empathy map, journey map, service blueprint |

Fill-in templates live in `templates/`: `research-plan.md`, `interview-guide.md`, `usability-test-script.md`, `findings-report.md`, `persona.md`, `jtbd.md`, `opportunity-solution-tree.md`, `assumption-map.md`.

## Standard chain of reasoning

```
decision → uncertainty → research question → type of evidence → method → sample
→ collection (with traceability) → analysis → finding → recommendation → recorded decision
```

Layers of evidence, which must never be mixed in the same paragraph: **raw observation** (what was said/done, with source) → **pattern** (repetition across participants) → **finding** (a reading supported by the pattern) → **insight** (why it matters) → **recommendation** (direction to explore) → **hypothesis** (what should change if it is applied).

## Method map

Use the table as a starting point, not as a rule. The sample sizes are common practice references; adjust them to the risk of the decision, the heterogeneity of the audience and the number of segments.

| Research question | Method | Reference sample | Typical duration | What an agent can do |
|---|---|---|---|---|
| Who has the problem and in what context? | Semi-structured interview, field study, diary | 5–8 per segment, until no new themes emerge | 45–60 min per session; diary 1–3 weeks | Draft the guide, review questions for bias, transcribe, draft coding for human review |
| How do people solve this today? | Interview about the last concrete episode, contextual inquiry, support analysis | 5–8 per segment | 45–90 min | Build the episode timeline, extract alternatives cited in real transcripts |
| Why does someone "hire" a solution? | JTBD interview (decision timeline) | People who decided recently; rounds of 5–10 | 45–60 min | Timeline script; job candidates extracted from real transcripts, flagged for review |
| Is this idea understood and relevant? | Concept test | 5–10 per segment | 30–45 min | Draft a neutral stimulus and script; check for leading questions |
| Is there interest demonstrated through action? | Fake door | Set by traffic and a threshold fixed beforehand | Days to a few weeks | Honest exit copy, events, thresholds, rate calculation; never launch without human approval |
| Can people use the interface? | Moderated usability test | ~5 per round for a homogeneous audience; 3–4 per segment | 30–60 min | Scenario tasks, script, metrics, severity draft |
| How much/how fast can they do it, at scale? | Unmoderated usability, benchmark | ~20+ to estimate rates; calculate for precision | 15–30 min per session | Check tasks for ambiguity, filter sessions by a prior rule, calculate CI |
| How do they group the content? | Open card sorting | ~15 qual; 30–50 quant | 20–40 min | Similarity matrix and clusters from real data |
| Do they find things in this hierarchy? | Tree testing | Small qual pilot, then planned quant; fewer than 10 tasks | 10–20 min | Detect labels repeated in the tasks, calculate direct/indirect success |
| Where does the flow leak? | Funnel analytics, heatmap, session replay | All eligible traffic, segmented | Continuous | Read the funnel, calculate step rates, triage sessions for human review |
| How often does this happen? | Well-sampled survey, analytics | Calculate from the desired margin of error | 1–3 weeks of collection | Draft the questionnaire, check bias, calculate margin of error |
| Did the change cause the effect? | A/B test | Calculate from base rate, MDE, α and power | Full behavior cycles (min. 1 week) | Hypothesis, sample calculation, SRM check, analysis with CI |
| What is the overall perception of usability? | SUS / UMUX-Lite after use | No universal number; small sample = exploratory baseline | 2–3 min to administer | Score, show distribution, compare with the product's own baseline |
| Where does the current experience have friction? | UX audit (heuristics + data) | n/a (inspection) | Days | Heuristic inspection, partial WCAG scan, merging duplicates; all as hypotheses |

## What an agent can / cannot do

> **Can:** structure plans, scripts, tasks and questionnaires; calculate SUS, rates, intervals, sample size and ROI; transcribe and organize notes; propose preliminary groupings; build evidence matrices; review questions for bias; adapt reports to the audience; generate hypotheses and test cases (including with synthetic users, labeled as hypotheses).
>
> **Cannot:** produce evidence about people without people; invent quotes, numbers or results; decide recruitment, legal basis or ethical questions alone; claim causality without an adequate design; declare a test winner without prior criteria; run an experiment with real users without human approval; replace reading the raw material with an automatic summary.
