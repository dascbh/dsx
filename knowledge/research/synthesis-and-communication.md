# Research synthesis and communication

## When to consult

- After collection, when turning notes, transcripts and recordings into findings.
- When combining different sources (interviews, tests, analytics, support) and dealing with conflicting results.
- When writing a report, presenting to stakeholders or building asynchronous material.
- When organizing a research repository or ResearchOps processes.
- When someone asks a language model to "summarize what the users said".

## 1. Principle: the chain of evidence

```
raw observation (with source) → pattern → finding → insight → recommendation → hypothesis → validation
```

| Layer | Example | Rule |
|---|---|---|
| Observation | P03, 14:22: "I always call before approving, I don't trust the status" | Verbatim, with ID and timestamp |
| Pattern | 4 of 6 managers confirm through another channel before approving | Count with denominator |
| Finding | The displayed status is not enough for managers to decide | Supported by the pattern, with scope |
| Insight | Human confirmation works as a guarantee when the risk is high | Interpretation marked as such |
| Recommendation | Explore showing who approved and when, in the status itself | Exploration verb, not "implement now" |
| Hypothesis | If the status includes author and time, confirmation contacts drop | Testable |

Rules:

- **Every finding points to raw observations.** Without a link to the source, the finding does not go into the report.
- Never mix layers in the same statement. "Users hate the status" mixes pattern, interpretation and exaggeration.
- Preserve divergent cases; do not delete them to make the narrative clean.
- An isolated quote illustrates; it does not prove a pattern.

## 2. Nuggets: the traceable unit

A **nugget** is the smallest reusable unit of evidence: an observation with source and metadata.

```
ID: N-<study>-<no.>
Observation: <verbatim quote or observed behavior>
Source: <pseudonymized participant> · <session> · <timestamp or event>
Type: quote | behavior | quantitative data | artifact
Context: <task, screen, segment, device>
Tags: <theme>, <journey stage>, <component>
```

Findings reference nuggets (`supported by N-12, N-17, N-31`). Recommendations reference findings. That way anyone can climb from the decision up to the original quote.

## 3. Affinity synthesis and thematic analysis

**Affinity diagram** (fast, collaborative):

1. Extract one observation per note, with the source ID.
2. Group bottom-up by similarity of meaning, not by screen or by script question.
3. Name each group with a sentence that says something ("they don't know what comes after submitting"), not with a topic ("post-submission").
4. Group the groups into larger themes.
5. Count how many distinct participants support each group.
6. Look for the notes that do not fit: they are often the most important finding.

**Thematic analysis** (more rigorous):

1. Familiarization: read or listen to all the material.
2. Initial coding: short labels on relevant excerpts.
3. Searching for themes: group codes.
4. Review: check each theme against the data; split, merge or discard.
5. Defining and naming the themes.
6. Write-up, with excerpts that exemplify.

To reduce bias: two coders on the same material and discussion of disagreements; a recorded codebook; active search for contrary evidence.

**AI-assisted synthesis.** Useful for transcribing, suggesting codes and drafting groupings. Risks: finding patterns where there are none, ignoring the anomaly, missing irony or context, inventing plausible quotes. Rules:

- Ask for extraction with IDs and verbatim excerpts, never "summarize what they said".
- Check every quote and every count against the transcript.
- Explicitly ask for contradictions between what was said and what was done, and for counterarguments to the themes.
- Review the automatic transcript in passages with jargon, accents or technical terms.
- Pseudonymize before sending material to any tool, and only use tools with verified data handling.

## 4. Triangulation

A planned combination of methods, sources, researchers or theoretical lenses on the same question.

| Type | Example |
|---|---|
| Methodological | Interviews + test + analytics |
| Source | Different segments, channels, periods, devices |
| Investigator | Two people code the same material |
| Theoretical | Distinct lenses, only if they generate a useful question |

Analyze each source by the logic of its method (do not turn interviews into percentages) and compare in an **evidence matrix**:

| Source/method | Question | Sample/context | Finding | Signal strength | Limitation | Relation |
|---|---|---|---|---|---|---|
| Funnel analytics | Where do they abandon? | All traffic, month X | Sharp drop at the payment step | High (volume) | Does not explain the reason | — |
| Interviews | Why? | 6 recent customers | Surprise at shipping cost at the end | Medium | Self-report | Complements |
| Moderated test | Can they complete it? | 5 new customers | 3 go back to the cart to see the total cost | Medium | Prototype | Corroborates |

When sources conflict, before discarding any of them, check: was the question the same? the segment? are tasks, devices and periods comparable? is it behavior, self-report or interpretation? is there recruitment, moderation or instrumentation bias? Sometimes the experiences are simply different. Report the conflict.

Triangulating does not prove cause, and not every decision needs four methods.

## 5. From finding to recommendation

A verifiable finding says who, in which task, in which context, and with what count. "4 of 5 opened the wrong menu when looking for the history" is better than "users can't find the history".

Weak recommendation: "improve the checkout". Useful recommendation: "explore a version that shows total cost and delivery time before the last step; test whether people compare options without going back to the cart".

Prioritize by impact, strength of evidence, urgency, effort and learning value. Do not use formulas with false precision; record who decided, by what criterion and when to reassess. **IF** the signal exists but the evidence is insufficient **THEN** classify it as **Investigate**.

Finding card and report template: `templates/findings-report.md`.

## 6. Presenting to stakeholders

Present decisions, not screens. Before building any material, answer: who decides? what decision? what do they already know? what evidence would change their opinion? what feedback is useful now?

Each audience decides something different:

| Audience | Wants to know |
|---|---|
| Leadership | Impact, risk, priority, investment, timeline |
| Product | Behavior, metrics, trade-offs, roadmap |
| Engineering | Feasibility, states, rules, dependencies, effort |
| Support/operations | What changes in customer service and processes |

Structure: **decision → context → problem → evidence → proposal → trade-offs → next steps.**

- Conclusion titles: "Managers don't trust the status without knowing who approved", not "Test results".
- Each slide: conclusion title, a few facts, why it matters, one piece of visual evidence (real quote, screenshot, short clip).
- Show the material gradually during the project; avoid the final "big reveal".
- Fidelity aligned with the decision: a wireframe invites discussion of structure; high fidelity diverts to visual details.
- Ask for specific feedback ("check it against the business rule", "point out missing dependencies").
- Translate without oversimplifying: instead of "heuristic violation", say "three places where the same action behaves differently, causing errors and support contacts".
- Show trade-offs in a table (option, benefit, cost, when to choose it). This replaces "which screen do you prefer" with "which combination serves the goal".

Disagreement: clarify the concern → link it to the goal → go back to the criteria and the evidence → define an action (accept, test an alternative, collect data, record a constraint or keep it with justification).

Asynchronous material needs to work without narration: conclusion titles, explicit decision, owner and deadline, source and limits of the evidence, status (approved, under discussion, out of scope).

To talk to leadership in business terms, use the chain experience → product → operations → business → financial (see `metrics-and-roi.md`). Start with small, measurable cases.

## 7. Repository and ResearchOps

ResearchOps is the people, processes and tools that let research work with quality and at scale. The ResearchOps community describes eight areas: environment, scope, recruitment and admin, data and knowledge management, people, organizational context, governance, tools and infrastructure.

Minimum components:

- **Participant management**: eligibility, participation history, consents, incentives, contact preferences; avoids always recruiting the same people.
- **Repository**: studies and nuggets with metadata (date, method, product/area, segment, n, researcher), a stable tag taxonomy, access levels, retention period.
- **Governance**: minimum standards for consent, storage, access to recordings, retention and review of higher-risk studies.
- **Service model**: what has dedicated support and what is self-service (templates, reviews, office hours).

Rollout: diagnose → choose **one** bottleneck (frequency, cost, risk) → design the flow before automating → define owners and rules → only then choose a tool.

Maturity: ad hoc → repeatable (templates and owners) → managed (repository, governance, metrics) → strategic (influences investments).

Measure outcomes, not activity: recruitment time while keeping quality, reuse of findings in decisions, governance incidents. A repository nobody consults is a graveyard; assign maintenance.

## Pitfalls

- Starting the report with the process instead of the decision.
- Including every screen explored.
- Inflating evidence or generalizing from a small sample.
- Confusing frequency with severity.
- Exposing identifiable data in slides and clips.
- Defending the solution instead of showing trade-offs.
- Leaving the presentation without a decision, owner and deadline.

## What an agent can / cannot do

> **Can:** transcribe, extract nuggets with IDs, suggest codes and groupings, build an evidence matrix and highlight conflicts, count participants per theme, rewrite titles as conclusions, adapt the report to the audience, build trade-off tables, tag and make the repository searchable.
>
> **Cannot:** invent or paraphrase quotes as if they were verbatim; present automatic grouping as a finding without checking the raw material; decide the relative weight of conflicting sources without human judgment; "improve" the narrative with a certainty the evidence does not give; send identifiable material to tools without verified data handling.
