# Discovery and product strategy

## When to consult

- The request arrives as a solution ("build an app", "add AI", "cut the fields") with no problem described.
- There is a bad metric and nobody can explain the cause.
- You need to decide what to build, for whom and why, before investing in delivery.
- When writing jobs, building an Opportunity Solution Tree, mapping assumptions, planning a fake door, concept test or MVP.
- When formulating or reviewing a product strategy or a product-led growth (PLG) initiative.

## 1. Problem framing

Distinguish five things that are often confused:

| Concept | What it is | Example |
|---|---|---|
| Symptom | Observable behavior | Many people drop out at the document upload step |
| Problem | Situated difficulty, to investigate | People reach that step without the documents at hand |
| Hypothesis | Explanation not yet confirmed | Nobody tells them beforehand which documents will be requested |
| Opportunity | Direction of value | Make the requirements predictable |
| Solution | Specific intervention | List the documents on the sign-up start screen |

Step by step:

1. Start from the situation, not from the requested solution: "what is happening that makes this solution seem necessary?".
2. Specify the person and context (moment in the journey, device, urgency, prior knowledge). A generic "user" will not do.
3. Separate data from interpretation: "40% do not get past step 3" is data; "step 3 causes abandonment" is a hypothesis.
4. Describe the impact beyond the metric (effort, error, support contact, trust, exclusion).
5. List **competing** hypotheses, not just one.
6. Check constraints: truly regulatory, or "it has always been this way"?
7. Convert uncertainties into research questions.
8. Phrase it without prescribing a solution.

Template sentence: `<Person> in <context> faces <difficulty>. Evidence: <source, period>. It matters because <impact>. We do not yet know whether <hypothesis A>, <B> or <C>.`

"How might we…" (HMW) only after understanding, and with no embedded solution: "how might we help people prepare for what will be requested?", not "how might we show the documents earlier?".

Reframe when: an unexpected affected population appears, the cause lies in an earlier step, segments have different difficulties, one metric improves and another worsens, or a constraint turns out to be negotiable.

## 2. Jobs to be Done

People "hire" a product to make progress in a situation. The job has a **functional** dimension (the task), an **emotional** one (the state they seek or avoid) and a **social** one (how they want to be seen). A persona answers "who"; a job answers "why they acted in this situation". Opposite profiles can have the same job. Use the two together.

Job statement: `When <situation>, I want to <motivation>, so I can <expected outcome>.` No feature names.

Example: "When I close the month with little time, I want to confirm that no entry was left uncategorized, so I don't have to redo the report in front of the board."

JTBD interview:

1. Recruit people who decided recently (bought, switched, abandoned).
2. Anchor in a dated event and reconstruct the timeline: first thought → passive event (tension grows) → active event (decides to look) → choice.
3. Map the **four forces**: push of the status quo, pull of the new solution, anxieties about switching, habits that tie them to the old one.
4. Ask what they used before and what they would use if the product disappeared (real competitors, including spreadsheets and "doing nothing").
5. Prioritize by importance × current satisfaction: high importance with low satisfaction is where the most leverage is.

Pitfalls: a jobs workshop without interviews; job confused with solution ("wants a notification"); wrong granularity (micro-click or "being happy"); hypothetical questions.

Template: `templates/jtbd.md`.

## 3. Opportunity Solution Tree (Teresa Torres)

Links a desired outcome to opportunities, solutions and tests, preventing the first idea from becoming inevitable.

Levels:

1. **Outcome** (top): a behavior change the team influences, with metric, audience and deadline. Not "increase revenue", not "launch feature X".
2. **Opportunities**: needs, pains and desires in the customer's language. Test: could more than one solution address it? If not, it is a disguised solution.
3. **Solutions**: truly different alternatives for **one** target opportunity; look for at least three.
4. **Assumption tests**: small experiments on the risks of each solution.

Rules:

- Opportunities come from real customer stories; a few interviews already allow a draft, which is revised with each new batch.
- A child is a subset of its parent; siblings have comparable scope. A journey map helps structure the first level.
- Choose the target opportunity by size, frequency, importance, dissatisfaction with alternatives and strategic fit. Technical effort goes into choosing the solution, not the opportunity.
- An OST is not a roadmap, backlog or journey map. It is a living document.

Template: `templates/opportunity-solution-tree.md`.

## 4. Continuous discovery

Product discovery decides which problem to solve, for whom and which solution deserves to be built; delivery turns those decisions into software. The two run in parallel.

Four risks to cover (formulation popularized by Marty Cagan): **value** (will they choose it?), **usability** (can they use it?), **technical feasibility** (can it be built and operated?), **business viability** (does it work for the organization: legal, brand, support, model). Engineering joins early.

Continuous discovery is weekly contact with customers carried out by the trio that builds (product, design, engineering), in small activities tied to an outcome. "Continuous" means sustainable cadence, not volume. It does not replace specialized research on complex topics or sensitive populations.

Reference weekly cadence: review outcome and tree → one interview or observation → synthesize and update the tree → explore solutions and list assumptions → run a small test and decide.

Measure the quality of discovery by: time between question and useful evidence; how often the team contacts customers; share of initiatives with explicit risks; alternatives evaluated before building; decisions changed by evidence. Counting interviews measures nothing.

## 5. Assumption mapping

- **Assumption**: something that needs to be true for the solution to work.
- **Hypothesis**: a testable statement that links a change to an outcome.
- **Fact**: a statement with adequate evidence, within limits of audience and period.

Categories: desirability, usability, technical feasibility, business viability, ethics (who can be harmed, excluded, manipulated or exposed).

Importance × strength of evidence matrix:

| | Weak evidence | Strong evidence |
|---|---|---|
| **Important** | **Test first** | Proceed |
| **Not very important** | Peripheral, monitor | Background |

Step by step: one specific solution → individual writing before discussion (reduces herd effect) → organize by category asking "what needs to be true?" → rewrite in observable form ("managers identify uncategorized expenses within 5 minutes") → position each one citing the source of the evidence (data, research, observation; job title is not evidence) → choose 1–3 critical ones → define the smallest test and the success criterion **beforehand**.

Cheap tests: prototype, a single question about past behavior, mining tickets/logs, technical spike. Choose by type of assumption, not by tool.

Template: `templates/assumption-map.md`.

## 6. Fake door

An entry point to something that does not exist yet measures interest demonstrated through action.

- **IF** demand is uncertain, building is expensive, there is traffic and you can explain right after the click **THEN** fake door is a candidate.
- **IF** the action can cause financial, emotional or privacy harm, involves a vulnerable audience or a sensitive task (payment, health, security) **THEN** do not use it.

Rules:

1. Isolate one assumption.
2. Define valid exposure (who actually saw the entry point) and the success event.
3. Fix thresholds **beforehand**: above X, move on to research; between X and Y, adjust the message and repeat; below Y, investigate or discard.
4. Honest, immediate exit message: explains that the feature is under evaluation, thanks the person, offers an alternative and returns them to the task without losing data.
5. Notify support; involve legal/privacy when data is collected.
6. Monitor guardrail metrics: abandonment of the original task, support contacts, drop in usage.

`interaction rate = clicks / valid exposures`. Do not compare rates across different placements or traffic. Never charge for something that does not exist or use false urgency. Curiosity is not commitment: complement with a waitlist or interview.

## 7. Concept test

Question: is the idea understood and relevant? (Usability asks: can they use it?)

Stimuli: short description (who, problem, benefit, no marketing), storyboard, low-fidelity wireframe, or Wizard of Oz (a human performs behind the scenes what looks automatic; useful for AI products).

Step by step: decision → hypotheses and what would support or contradict them → representative participants (in B2B: user, buyer, administrator) → comparable stimuli in varied order → pilot → facilitate without selling → analyze by hypothesis and segment.

Ask: "in your own words, what does this offer?", "who does it seem made for?", "when would it help?", "what do you do today?", "what raises doubts?", "what do you expect to happen next?". Do not ask "did you like it?" or "would you use it?". The distance between the intended message and the received one is evidence.

Outcome: supported → prototype · partial → reformulate and retest · not supported → revisit the opportunity · inconclusive → fix the method.

## 8. MVP

An MVP is an **experiment** to learn whether the proposal delivers value, not a lean launch. An MVP that is hard to use may be rejected because of the interface and not the idea.

Value hypothesis: `We believe that <proposal> is valuable to <audience>. We will know when we observe <behavioral signal>.`

Choosing the format by risk × reward:

| | High reward | Low reward |
|---|---|---|
| **High risk** | Prototype / Wizard of Oz | Discard or reformulate |
| **Low risk** | Build in code with analytics | Postpone |

A coherent value validation sequence: concept (do they understand it and see value?) → fake door (do they act?) → MVP (do they get value from use?). Tools that make building cheaper do not make being wrong cheaper.

## 9. Product strategy

Strategy is a system of choices that concentrates focus, not a feature list or a roadmap. Hierarchy: vision → strategy → discovery → roadmap → backlog → delivery, with learning flowing up and down.

Eight explicit decisions: audience and context · problem · value proposition · differentiation · business outcome · **trade-offs** (what will not be prioritized this cycle) · risks and evidence · success metrics. Without visible trade-offs, every initiative looks aligned.

Signs of weak strategy: little selectivity, solution as the starting point, confusion with the roadmap, methodological dogmatism.

## 10. Product-led growth (basics)

PLG is a strategy in which the product takes part in acquisition, activation, monetization, retention and expansion. Freemium is an access and pricing decision; PLG is the whole system.

- `activation = users who reach the activation event / new eligible users × 100`. The event should represent realized value, not just be easy to measure.
- **Time-to-value**: time and effort between sign-up and first value. Every configuration step needs to justify its presence.
- **PQL**: account or user with behavioral signals of intent (activation, recurring use, nearing limits).
- Validate the activation definition by comparing retention of activated and non-activated cohorts; correlation is not yet cause.
- In B2B, measure by account, not just by user.

PLG helps little when the product requires heavy customization before use, when user and buyer have misaligned goals or when self-service transfers undue risk to the customer.

## Pitfalls

- A feature at the top of the tree or in place of the problem.
- Stakeholder opinion recorded as customer need.
- Exploring a single solution.
- Testing only usability and ignoring value and feasibility.
- Defining the success criterion after seeing the result.
- Workshops instead of real contact with customers.

## What an agent can / cannot do

> **Can:** draft framing canvases, competing hypotheses and questions; rewrite opportunities in the language of needs; generate solution alternatives and lists of assumptions by category; draft JTBD scripts, concept stimuli, honest fake door copy, MVP hypotheses and strategy theses; calculate interaction and activation rates from provided data.
>
> **Cannot:** invent customer stories, jobs or evidence that support opportunities (LLM-generated jobs are hypotheses); position assumptions as "strong evidence" without a cited source; launch a fake door or MVP with real users without human approval; decide the ethics of an experiment; choose the strategic trade-offs, which are a business decision.
