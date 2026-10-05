---
id: research-with-ai
area: ai
title: AI in UX research — traceable synthesis and synthetic personas
evidence: contextual
related: [evidence-and-sources, experience-debt, evals]
---

# AI in UX research

> **When to consult**
> - When using AI to transcribe, code, cluster or synthesize interviews, tests, tickets or feedback.
> - When someone proposes synthetic personas, "simulated users" or "AI interviews".
> - When reviewing a report, persona or empathy map that has gone through AI.
> - When deciding whether a finding can support a product decision.
>
> **Doctrine:** AI output is a **hypothesis, never evidence**. Evidence is a record of real people under documented conditions.

## 1. The question that separates legitimate use from abuse

Are we using AI to **formulate** what we need to investigate, or to **claim** that we have already investigated? The first is useful preparation. The second is fabrication of evidence, even if unintended.

Every output that passes through AI mixes three operations; identify where each one starts:
1. **Organize** real data (transcribe, cluster, tag).
2. **Infer** from it (patterns, themes, interpretations).
3. **Generate** new content (testimonials, profiles, simulated answers).

Only the first preserves the status of evidence, and even then it requires checking. The second is interpretation to be validated. The third is hypothesis.

## 2. Assisted synthesis with traceability

### Key rule
**From every insight, it must be possible to reach the exact source excerpt** (participant, session, minute or line). An insight with no trail back does not go into a report or a decision.

### Four-step flow
1. **Prepare the data.** Anonymize personal data before sending it to any tool, according to the organization's privacy and consent policy. Correct the transcript for technical terms, jargon, accents and slang: one wrong word can invert the meaning of a criticism.
2. **Extract in layers, do not summarize.** "Summarize what users said" produces pasteurized text that erases the anomalies, which is where the relevant finding usually is. Ask for structured extraction:

   ```text
   Analyze only the transcript provided. For each item, include the participant
   identifier and the literal excerpt that supports it. Extract:
   1) explicitly stated pains;
   2) unstated needs, marking them as INTERPRETATION;
   3) contradictions between what the person says and what they report having done;
   4) statements with a strong emotional charge;
   5) isolated comments that break the pattern (do not discard them for being rare).
   Do not estimate frequency beyond this sample. If there is no basis, write "no evidence".
   ```
3. **Triangulate.** Compare the output with another lens (another model, another person coding, another data source: usage, tickets). A finding that only one lens sees is fragile.
4. **Validate with a human.** Check against observation notes: body language, hesitation, context and irony that the transcript does not carry. Whoever synthesizes listens to at least part of the recordings; reading only summaries is premature delegation.

### Devil's advocate prompt
After getting the findings, always ask for the counter-evidence:

```text
For each finding above, present the strongest argument against it using
only the data provided. Point to excerpts that contradict it, participants
who do not confirm it and alternative explanations for the same behavior.
Do not use external knowledge.
```

Findings that do not survive the counterargument go back to being hypotheses.

### Risks of AI synthesis
| Risk | How it shows up | Control |
|---|---|---|
| Pattern hallucination | Nonexistent correlation; a frequent term becomes a "pain" while irony is ignored | Require a literal excerpt per finding; check a sample |
| Loss of the why | Sentiment classified without the cultural or interface reason | Extract context along with the statement |
| Lazy prompt | Generic obvious points | Layered prompt + contradictions |
| Premature delegation | Team reads the summary, does not listen to people | Mandatory minimum listening to the sessions |
| Anomaly suppression | Model normalizes what deviates from the average | Explicitly ask for the isolated cases |

## 3. Synthetic personas

### What they are
Profiles generated or operated by AI to simulate the perspectives and answers of an audience. They vary widely: from "imagine a finance manager" to agents built from real interviews. The decisive difference is **where the information comes from and how the result was validated**.

| Representation | Basis | Appropriate use |
|---|---|---|
| Research persona | Patterns in data from real people | Communicate needs within the reach of the research |
| Proto-persona | The team's explicit assumptions | Align what is believed and what still needs investigating |
| Synthetic persona | Profile generated/used by AI | Explore hypotheses, with origin and limit identified |
| Interactive synthetic user | A system that answers or acts as a profile | Simulation whose validity depends on the task and on its own evaluation |

A name, a photo and a detailed biography do not make a profile any truer.

### What the available research suggests `[evidence: contextual]`
- Comparisons of simulations with real studies found answers that were **too generic and too optimistic**, omitting precisely the friction that research looks for.
- Agents built from long interviews with real people reproduced questionnaire answers in a way reasonably consistent with the people themselves. That is consistency on questionnaire items, **not** prediction of behavior in an interface.
- Purely demographic profiles (age, income, profession) work worse than profiles with values and behavior patterns; audits found stereotypes in generated personas, including in seemingly positive narratives.

### Permitted uses
- **Preparatory exploration:** list situations the team has not considered (bad connection, incomplete information, third-party approval, interruption). It broadens the list of what to investigate; it does not say what is frequent.
- **Research rehearsal:** practice the script, find ambiguous terms, train follow-up questions. It must end in a pilot with people.
- **Competing hypotheses:** faced with abandonment, generate alternative explanations and the evidence that would distinguish each. Often a persona is not even needed; asking for hypotheses directly avoids giving the output the authority of a "character".

### Forbidden uses
| Intended conclusion | Why simulation does not work | What is needed |
|---|---|---|
| "People need this" | The need may have come from the prompt itself | Situated accounts, current alternatives, consequences |
| "Navigation is easy" | Agent performance does not estimate human performance | Task observation with the audience |
| "This segment would pay more" | A generated statement involves no budget or real choice | Investigation of value and commercial behavior |
| "It is accessible" | Imitating a profile does not reproduce real use of assistive technology | Accessibility evaluation with people with disabilities |
| "X% of users..." | 100 profiles from the same model are not 100 independent people | A real sample |
| Approve a launch | None of the above | Direct evidence proportional to the risk |

Also forbidden: computing SUS or another standardized questionnaire with synthetic answers and reporting it as a research result; presenting simulated characters as recruited participants; using RAG over internal documents and calling the generated answer evidence (the original record is the evidence; the answer is extraction, interpretation or hypothesis).

### Usage rules
1. **Declare the decision and the limit.** Write what the activity delivers ("raise questions about payment approval") and what it **cannot** decide (launch, prevalence).
2. **Separate fact from assumption.** Each piece of data given to the model has an origin, date and context. Do not complete the profile with invented income, habits or opinions.
3. **Ask for hypotheses, gaps and needed evidence**, not testimonials or frequencies. Check the origin classification the model makes: it gets the origin wrong too.
4. **Turn it into a verifiable plan:** question, audience, method and **what would contradict** the hypothesis.
5. **Record the outcome:** supported in that context, contradicted or inconclusive, linked to the records.
6. **Avoid circularity:** if the prompt states that the user struggles with reports, the "persona" complaining about reports just handed back your premise.
7. **Label as simulation** every excerpt that could circulate on its own.

### Hypothesis record (one line per hypothesis)
```yaml
source: "AI simulation — not a participant statement"
hypothesis: "Approving from the phone helps with urgent cases away from the office"
available_basis: "Task description by the team; no observation"
gap: "Frequency, constraints and impact unknown"
question: "How did the last urgent approval made away from the office go?"
how_to_investigate: "Interview about a recent episode + usage logs"
what_would_contradict: "Delay caused by internal review, even with mobile access"
owner: "research"
status: not_investigated   # supported | contradicted | inconclusive
```
Store the tool, model version, date, instructions and sources provided separately, for auditing.

## 4. Anti-patterns

- A report with an insight that has no source excerpt.
- "The AI analyzed 200 interviews and concluded" without human checking.
- A synthetic persona with a photo and biography presented as a research result.
- Synthetic answer frequency presented as a percentage of the audience.
- Simulating people with disabilities instead of including them.
- Using lack of budget as a justification for treating simulation as evidence.
- Research designed only to confirm what the simulation suggested.

## 5. Checklist

- [ ] Data anonymized and transcripts corrected before processing.
- [ ] Layered extraction prompt, with a literal excerpt per finding.
- [ ] Devil's advocate prompt applied; fragile findings downgraded.
- [ ] Triangulation with another lens and validation against observation notes.
- [ ] Every insight leads to its source excerpt.
- [ ] Synthetic personas restricted to exploration, rehearsal and hypotheses, with a declared limit.
- [ ] Every hypothesis has a question, method, refutation criterion and recorded status.
- [ ] No number, testimonial or standardized metric from a simulation appears as data about people.
