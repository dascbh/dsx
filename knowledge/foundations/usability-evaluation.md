# Usability evaluation: heuristic, cognitive walkthrough and testing

> **When to consult**
> - When you get a request like "review this screen/flow" and need a method, not an opinion.
> - When deciding between expert inspection and testing with real people.
> - When writing a findings report that someone else will prioritize and implement.
> - When simulating a novice's first experience in a new flow.

Master rule: choose the method that produces the **evidence needed for the next decision** and state its limit in the report. The criteria for each heuristic are in [nielsen-heuristics.md](nielsen-heuristics.md).

---

## 1. Heuristic evaluation (process)

Systematic inspection of an interface against a set of principles defined beforehand. It is not skimming a checklist.

### Steps

1. **Bound the question and the scope.** Product, flow or task, audience, device, version. "Evaluate the app" is vague; "evaluate the plan-change flow on mobile, for existing customers" is evaluable.
2. **Choose the set of heuristics before inspecting.** Nielsen's ten as the base; add domain criteria (AI, health, finance, children) when the context calls for it.
3. **Use 3 to 5 independent evaluators.** One person alone finds only part of the problems; more evaluators widen coverage, with diminishing returns above five.
4. **Align the briefing.** Everyone gets the same context and the same recording format. Nobody sees the others' findings before finishing.
5. **First pass: familiarization.** Walk through the task to understand the goal, sequence and end state. Do not record violations yet.
6. **Second pass: inspection.** Record each finding in the format below, screen by screen, state by state.
7. **Consolidate.** Group duplicates; keep problems with different causes separate; leave disagreements between evaluators visible.
8. **Assign severity** (0–4 scale) only after consolidating.

### For an agent evaluating alone

- Simulate independence: run separate passes with different lenses (novice, frequent user, keyboard/screen reader, one-handed mobile) and consolidate at the end.
- Inspect every state, not just the happy path: empty, loading, error, success, disabled, long content, small screen, zoom.
- Treat your first hypothesis as a suspect; look for the case that contradicts it.
- State in the report that an agent's evaluation organizes hypotheses; it does not replace human judgment of context or testing with people.

### Structure of a defensible finding

| Field | Content |
|---|---|
| Context | Flow, screen, state, audience, device |
| Evidence | What is present or absent, described in a verifiable way |
| Potential problem | The difficulty that may arise (do not assert unobserved behavior) |
| Heuristic | Which principle explains the problem |
| Likely impact | Comprehension, control, error or task completion |
| Recommendation | Direction for a solution, not an imposed redesign |
| Severity | 0–4, with frequency × impact × persistence |
| Validation | "Hypothesis" when it depends on data or testing |

**Evidence vs. opinion**

| Opinion (avoid) | Evidence (use) |
|---|---|
| "The button is confusing." | "'Cancel' and 'Confirm' have the same fill, size and color; nothing indicates which is the main action." |
| "The screen is cluttered." | "There are 7 elements with title-level visual weight above the fold; the 'Pay' action is below them." |
| "Change the button color." | "Differentiate the hierarchy between the main and the secondary action." |

### Common mistakes

- Mixing opinion with evidence.
- Assigning severity during inspection.
- Confusing severity with priority.
- Evaluators who see each other's findings.
- Prescribing the complete solution instead of the direction.
- Stuffing accessibility barriers into the heuristic report instead of routing them to a WCAG audit.

---

## 2. Cognitive walkthrough

Task-driven inspection: the evaluator walks through the correct sequence of actions **pretending to be a novice** and looks for discovery and feedback barriers.

### The 4 questions, asked at each action

1. **Intention.** Will the person want to take this action at this moment? (Do they know they need it?)
2. **Visibility.** Will they notice that the correct control is available?
3. **Association.** Will they understand that this control produces the result they want?
4. **Feedback.** After acting, will they see a response showing they made progress?

Each "no" becomes a finding. Record which question failed; that points to the type of fix:

| Question that failed | Likely fix |
|---|---|
| 1. Intention | Explain the step, reorder the flow, remove the step |
| 2. Visibility | Hierarchy, position, reveal the hidden control |
| 3. Association | Label with verb + object, icon with text, clearer signifier |
| 4. Feedback | Visible state, confirmation, progress |

### Procedure

1. Define a specific, realistic task ("book an appointment for next week").
2. Describe the person: prior knowledge, context of use, limitations.
3. List the correct sequence of actions, step by step.
4. Apply the 4 questions to each action.
5. Record problems with context and evidence.
6. Rate the severity.
7. Recommend directions.

### Rules for agents

- Use only what the interface shows. Do not use knowledge of the code, the specification or the internal glossary.
- Imagine a person with doubts, not the ideal user.
- Do not discuss solutions during the pass; note them and move on.

### When to use / not use

- **Use:** new flows before development; prototypes before testing; critical tasks (sign-up, login, purchase); products that must be learned quickly; as a complement to heuristic evaluation.
- **Do not use:** without a defined task; to measure satisfaction; when the problem is strategy rather than interaction; when you need to understand deep motivation; when behavior depends on real data the prototype does not have.

---

## 3. Inspection vs. testing with people

| | Heuristic evaluation / walkthrough | Usability testing |
|---|---|---|
| Who runs it | Experts (or an agent) inspect | Representative people perform tasks |
| Evidence | Potential problems from principle violations | Observed behavior: hesitation, error, time, abandonment |
| Strength | Fast, cheap, possible before recruiting | Shows real use and real interpretation |
| Limit | May predict problems that do not occur and miss real ones | Depends on sample, tasks and protocol |
| Timing | Early, quick reviews, triage | Working prototype or live product |

### Decision rule

- IF the question is "does this interface violate known principles?" THEN heuristic evaluation.
- IF the question is "can a novice figure out how to do X?" THEN cognitive walkthrough.
- IF the question is "can people in the audience do it and understand it?" or experts disagree THEN usability testing.
- IF the finding is severity 3–4 and the fix is expensive THEN validate with testing before investing.
- IF there is neither time nor access to people THEN inspect, mark everything as a hypothesis and say so.
- IF the question is about business impact THEN neither is enough: cross with metrics (time per task, errors, abandonment per step, reasons for contacting support).

Efficient sequence: inspection generates hypotheses → critical risks are prioritized → testing validates the critical ones → synthesis separates confirmed from uncertain → iterate.

Impact chain to justify priority: violated heuristic → potential problem → affected task → observed behavior → metric → outcome.

---

## 4. Report template

```markdown
# Usability evaluation — <flow/screen>

## Scope
- Question: <what we want to know>
- Flow/task: <...>
- Audience: <...>
- Device/version: <...>
- Method: heuristic evaluation (Nielsen's 10 + <extras>) | cognitive walkthrough | both
- Limits: inspection without users; findings marked as hypothesis require testing

## Summary
- Total findings: N (4: x · 3: y · 2: z · 1: w)
- Three most severe problems, one line each

## Findings
### A1 — <short title describing the problem>
- Context: <screen, state>
- Evidence: <observable>
- Potential problem: <...>
- Heuristic / walkthrough question: <H5 / P3>
- Impact: <comprehension | control | error | completion>
- Severity: <0–4> (frequency: <>, impact: <>, persistence: <>)
- Recommendation: <direction>
- Related pattern: <link to pattern card>
- Validation: <confirmed | hypothesis>

## Out of scope / routed
- Accessibility barriers for a WCAG audit
- Product strategy questions

## Next steps
- <owner> — <action> — <deadline>
```

---

## Audit checklist

- [ ] Question and scope defined (flow, audience, device, version).
- [ ] Set of heuristics chosen before the inspection.
- [ ] Familiarization pass done before recording findings.
- [ ] All states inspected, not just the happy path.
- [ ] Each finding has observable evidence, separate from opinion.
- [ ] Walkthrough: concrete task, profile described, sequence listed, 4 questions per action.
- [ ] Duplicates consolidated; different causes kept separate.
- [ ] Severity assigned after consolidating, with the three factors.
- [ ] Hypotheses marked as such; method limits stated.
- [ ] Recommendations give direction, not a complete redesign.
- [ ] Accessibility routed to a dedicated audit.
- [ ] Prioritized findings have an owner and a next step.
