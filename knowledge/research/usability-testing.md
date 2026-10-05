# Usability testing

## When to consult

- When planning, scripting, moderating or analyzing any test in which people perform tasks on an interface or prototype.
- When deciding how many participants to recruit, or when you hear "five users are enough".
- When choosing between moderated and unmoderated testing.
- When rating problem severity or deciding when to stop.
- When someone proposes "testing with synthetic users".

## 1. What it is and what it is not

Representative participants perform realistic tasks while what they do is recorded: success, hesitations, errors, paths, requests for help. Usability, in the sense of ISO 9241-11, combines **effectiveness**, **efficiency** and **satisfaction** in a specific context of use.

- An interview collects self-report; a test observes interaction.
- Heuristic evaluation is an expert prediction; a test is an observation of behavior.
- Recording sessions is not testing; without tasks and criteria, it is just video.

## 2. Planning

1. **Decision and questions.** "Do new customers choose the delivery option without help?" and not "test the checkout".
2. **Material at the right fidelity.** A clickable wireframe for flow and structure; high fidelity when the question involves content, density or micro-interaction.
3. **Recruitment by relevant criteria**: domain experience, frequency of use, role, device, assistive technology. Different segments are analyzed separately. Teammates do not count.
4. **Scenario tasks** (see section 3).
5. **Success criterion per task, defined beforehand**: success without help · success with difficulty · success with help · failure.
6. **Metrics aligned with the question**: completion rate, time, errors, requests for help, post-task SEQ, SUS at the end (see `metrics-and-roi.md`).
7. **Session script** (section 5).
8. **Pilot** with one person outside the team: fixes ambiguous tasks, timing and technical failures.
9. **Moderate without teaching.**
10. **Record observations, not interpretations.** "Opened Profile looking for the address" and not "didn't understand the navigation".

Template: `templates/usability-test-script.md` and `templates/research-plan.md`.

## 3. Writing tasks: scenario, not instruction

The task gives motivation and a goal; it never reveals the path or repeats interface labels.

| Bad (instruction) | Good (scenario) |
|---|---|
| Click "My orders" and cancel the purchase | You bought these headphones yesterday and changed your mind. Show what you would do |
| Change the delivery address in your profile | You moved last week and want to receive your next purchase at the new house |
| Use the price filter to find a product under R$ 200 | You have R$ 200 for a birthday present. Find an option |

Rules:

- **IF** the task contains the exact label of a button or menu **THEN** rewrite it in the user's words.
- **IF** the task describes steps **THEN** replace them with a goal and motivation.
- **IF** success cannot be verified on screen **THEN** define an observable end state ("confirmation shown").
- One task = one goal. Order them from simplest to most complex, or randomize when comparing versions.
- Provide the fictitious data needed (address, test card) so that nobody uses real data.

## 4. How many participants: the rule of five and its limits

The Nielsen and Landauer model estimates the proportion of problems found:

```
found = N × [1 − (1 − L)^n]
```

`N` = total number of existing problems · `L` = average probability that one participant reveals a problem · `n` = number of participants.

A more useful reading: a problem that affects a fraction `p` of people has probability `1 − (1 − p)^n` of showing up at least once with `n` participants.

Worked examples:

- `p = 0.31`, `n = 5`: `1 − 0.69^5 = 1 − 0.156 ≈ 0.84` → about an 84% chance of seeing the problem.
- `p = 0.31`, `n = 3`: `1 − 0.69^3 = 1 − 0.329 ≈ 0.67`.
- `p = 0.10`, `n = 5`: `1 − 0.90^5 = 1 − 0.590 ≈ 0.41` → a problem that affects 1 in 10 goes unnoticed in most rounds of five.
- How many for an 85% chance with `p = 0.10`? `n = ln(0.15) / ln(0.90) ≈ 18`.

Limits, which the agent must state whenever it cites "five users":

- `L` is not constant: it varies with the product, the tasks, the audience and the evaluator. The 31% came from specific studies.
- Five is a starting point for **formative, qualitative testing with a homogeneous audience and iteration** (test, fix, test again).
- With several distinct segments, recruit 3–4 per segment.
- To **estimate** rates, times or compare versions, treat about 20 as a reference minimum and calculate the desired precision.
- Increase the sample when: rare problems matter, there is regulatory or safety risk, the consequence of missing a problem is high.
- The model says nothing about problems that the chosen tasks do not exercise.

## 5. Moderated vs unmoderated

| | Moderated (remote or in person) | Unmoderated (remote) |
|---|---|---|
| Best for | Understanding why, unstable prototype, complex tasks, sensitive topics | Scale, standardized comparison, objective metrics, dispersed participants |
| Risks | Moderator bias, cost per session | An ambiguous task or broken link corrupts dozens of sessions before anyone notices |
| Requires | Trained moderator, script | Full pilot, valid-session criteria before collection, monitoring during it |

**IF** the prototype requires explanation, has unforeseen paths or the topic is sensitive **THEN** moderated.
**IF** the prototype is stable, the tasks are unambiguous and the question is "how much" **THEN** unmoderated.
Recommended combination: moderated to discover and refine the task wording → unmoderated for scale → moderated again to explain patterns.

Valid-session criteria (unmoderated, defined beforehand): recording failure, profile outside the criteria, duplicate participation, abandonment before the main tasks, answers inconsistent with behavior.

## 6. Moderated session script

1. **Opening (2–3 min):** purpose, duration, recording, who is watching, confidentiality, right to stop. "We are testing the product, not you." Confirm consent.
2. **Warm-up:** context and relevant prior experience.
3. **Instructions:** think aloud, no interface tutorial.
4. **Tasks**, one at a time; note path, errors, hesitations, requests for help.
5. **Post-task:** SEQ (one question, 7 points) and questions about observed incidents.
6. **Closing:** SUS if planned, "anything I didn't ask?", thanks and compensation.

Neutral responses when the participant asks "can I click here?": "what would you do if you were on your own?", "what do you expect to happen?", "what are you looking for right now?". Thinking aloud reveals expectations, but does not give guaranteed access to causes.

## 7. Stopping rule

Within the session:

- Set a maximum time per task in the plan. When it is reached, or if the participant gives up twice, record **failure** and move on.
- If the participant shows real discomfort, pause or end the session; dignity is worth more than the data.
- Did you help? The task becomes "success with help" or "failure", never "success".

Between sessions:

- Continue while new participants reveal new problems of relevant severity.
- Common practice: if two consecutive sessions bring no new problem of severity 2 or higher, end the round, fix and retest.
- A clear critical problem in the very first session? Fix it before the next ones if the prototype allows; do not spend sessions confirming the obvious.
- If the pilot session or the first two reveal a badly written task, stop, rewrite it and discard that task's data.

## 8. Severity

Jakob Nielsen's scale (0–4):

| Score | Meaning |
|---|---|
| 0 | Not a usability problem |
| 1 | Cosmetic; fix if time allows |
| 2 | Minor; low priority |
| 3 | Major; high priority |
| 4 | Catastrophic; fix before launch |

Severity combines **frequency** (how many encountered it), **impact** (does it hinder or block?) and **persistence** (does it bother once or every time?). Also weigh the importance of the task. A single critical case (data loss, irreversible action, financial risk) warrants attention even with n = 1.

Equivalent verbal alternative: critical (blocks an essential task or causes harm) · high (substantial difficulty, requires help) · medium (hesitation, rework, completes) · low (localized friction).

## 9. Analysis

Chain per problem: **observation** ("3 of 5 looked for 'change address' under Profile", with session IDs) → **finding** (the location does not match expectations) → **impact** (abandonment, support contact) → **action** (explore an alternative position and label and retest).

- Group by task, flow step, component and theme.
- Also record what worked; this keeps the next version from breaking what was good.
- Merge duplicates: the same cause on several screens is a systemic problem.
- Do not turn "3 of 5" into "60%" in the report.
- Plan the retest after fixing.

## 10. Accessibility in testing

If the audience includes people with disabilities or assistive technology users, recruit them for the main round, not for a separate study at the end. Check before the session whether the prototype works with a screen reader, keyboard and magnification. Details in `ethics-and-inclusion.md`.

## Pitfalls

- Testing without a research question.
- Tasks that give away the path.
- Helping too early or teaching the interface.
- Focusing on opinion ("did you like it?") instead of behavior.
- Treating "five" as law.
- A single test, with no retest.
- Reporting only problems.

## What an agent can / cannot do

> **Can:** write scenario tasks and detect leaked labels; build the script and plan; calculate the sample using the formula and state its limits; calculate completion rates, times and intervals; transcribe; propose groupings of observations and a severity draft for review; run an inspection with a synthetic user to **generate hypotheses** about problems and test cases.
>
> **Cannot:** be the participant; present the result of a "test with synthetic users" as a usability test; moderate a real session without a responsible human; assign final severity without human review; invent observations, quotes or counts; declare the product "usable" from an inspection.
