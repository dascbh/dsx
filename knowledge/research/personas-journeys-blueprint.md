# Personas, empathy map, journey and service blueprint

## When to consult

- When creating, reviewing or challenging personas.
- When synthesizing research into an empathy map.
- When mapping a person's journey toward a goal.
- When investigating problems that originate backstage (delays, rework, handoffs between teams) with a service blueprint.
- When someone asks to "generate some personas" or "make a journey map" with no research behind it.

Master rule: these artifacts are **syntheses of evidence**, not collection methods. Made without research, they are hypotheses and must be labeled as such.

## 1. Evidence-based personas

A persona is an archetype that communicates the behavior patterns, goals and context of a real group of users. It serves to align the team and prioritize.

Types:

| Type | Basis | Use |
|---|---|---|
| Proto-persona | Existing data + team knowledge | Cheap starting point. **Label it as a hypothesis** |
| Qualitative | Interviews, observation, tests | Recommended default |
| Statistical | Qual + quantitative segmentation at scale | When segments need to be sized |

A **user** persona (who operates) is different from a **buyer** persona (who decides the purchase). In B2B there are usually both, and sometimes an administrator.

Step by step:

1. Define the goal and the decision the personas will support.
2. Collect qualitative and behavioral data (interviews + analytics).
3. Organize into facts, patterns, motivations and interpretations.
4. Group by **behavioral variables** (frequency, goal, level of experience, way of deciding, context of use), not by demographics.
5. Check the patterns with new evidence (follow-up interviews, observation, survey).
6. Document few personas, typically 3 to 5. Many scatter focus.
7. Record the date, evidence base (n, sources) and gaps. Review periodically: more often in volatile markets, at least once a year by default.

Rules:

- **IF** the persona has no declared source **THEN** it is a proto-persona; say so in the title.
- **IF** a demographic attribute does not change behavior **THEN** remove it; it only creates stereotypes.
- **IF** two personas behave the same way regarding the product's decisions **THEN** merge them.
- The representative quote must be **real**, from a participant identified by a pseudonym. Never invent one.
- A stock photo and a fictional name are optional; the behavioral pattern is mandatory.

Synthetic personas (LLM-generated):

- They are useful for raising hypotheses, imagining edge cases and generating scripts and test cases.
- They are **not** useful for "interviewing", validating concepts, giving SUS scores or replacing participants.
- Every output must carry the label `HYPOTHESIS — synthetic persona, not validated`.

Template: `templates/persona.md`.

## 2. Empathy map

A synthesis tool to condense what is known about a person in a context. Skip it if it only adds ceremony.

Classic quadrants: **Says** · **Thinks** · **Does** · **Feels**. The extended version adds context, pains and gains.

Filling rules:

| Quadrant | Content | Marking |
|---|---|---|
| Says | Verbatim quote | With source (P04, 12:30) |
| Does | Observed, specific behavior | With source |
| Thinks | Inference | Mark "inference" |
| Feels | Emotion and the trigger that caused it | Mark whether reported or inferred |

Step by step: specific person and context ("finance manager approving an urgent payment on their phone") → goal of the map → evidence gathered beforehand → individual contribution before discussion → fill in → look for patterns → **highlight contradictions** (says they trust it, but always double-checks: checks what, exactly?) → list gaps as next research questions → record date, segment and sources.

One map per person/context. Merging different profiles into a single map erases the patterns.

## 3. Journey map

Visualizes a person's path toward a goal, combining actions with thoughts, emotions and touchpoints. Its greatest value is aligning the organization around a shared understanding.

Components:

1. **Actor**: one persona per map, based on research.
2. **Scenario and expectations**: a real situation (existing product) or a projected one (new product).
3. **Phases**: 3 to 7, named from the person's point of view (discover → evaluate → sign up → use → ask for help).
4. **Actions, thoughts and emotions** per phase, with real quotes and an emotional curve.
5. **Opportunities**, each with an owner, metric and evidence.

Template (text):

```
Actor: <persona>   Scenario: <situation and goal>   Expectations: <what they expect>
Status: <current | future>   Basis: <studies, n, period>

| | <Phase 1> | <Phase 2> | <Phase 3> | <Phase 4> |
|---|---|---|---|---|
| Actions | | | | |
| Thoughts/questions (quotes with source) | | | | |
| Emotion (−2 to +2) | | | | |
| Touchpoints | | | | |
| Pains (with evidence) | | | | |
| Opportunities | | | | |

Opportunities: <description> | owner <name/role> | metric <indicator> | evidence <IDs>
```

Rules:

- **IF** the emotion or thought was neither observed nor reported **THEN** mark it as a hypothesis.
- **IF** the map has several personas mixed together **THEN** separate them.
- **IF** the opportunity has no owner **THEN** it will not happen; assign one.
- Keep it at the narrative level; click-level detail belongs in the task flow.
- Date the map and review it when the service changes.

Related: **experience map** (more abstract, product-independent); **service blueprint** (adds internal operations); **story map** (delivery planning).

## 4. Service blueprint

Links customer actions to the touchpoints, teams, operations and systems that deliver the service. Many problems perceived by the customer originate outside the visible channel.

Layers:

1. **Customer actions** (verbs: search, request, submit, wait, receive, evaluate).
2. **Physical and digital evidence** (screens, messages, emails, receipts).
3. **Frontstage**: visible actions of the organization (agent, interface, automation).
4. **Backstage**: invisible actions (triage, approval, verification, record update).
5. **Support processes**: systems, integrations, internal departments, vendors.

Separator lines: **interaction** (customer × organization), **visibility** (frontstage × backstage), **internal interaction** (backstage × support).

When to use it: an existing service with delays, contradictions, rework, handoffs or channel switching; a new service, as an operational hypothesis; alignment across several departments.

Step by step:

1. Narrow scope: one scenario, one persona, start and end, one question ("why are so many requests reopened?").
2. Collect data with customers **and with the front line**: tickets, metrics, documentation, times.
3. Customer actions in sequence.
4. Touchpoints and evidence.
5. Frontstage and backstage with specificity: who checks, in which system, which decision, what triggers the next step.
6. Support systems, manual integrations, duplicate data entry.
7. Mark failures, waits, rework, handoffs and diffuse responsibility; prioritize by frequency, severity, operational effort and risk.
8. Validate with the teams that do the work (the real process, not the one in the manual). Record date, version, owner and scope.

Template (text):

```
Scenario: <...>   Persona: <...>   Start/end: <...>   Question: <...>
Version: <date> · Owner: <role> · Sources: <interviews, tickets, observation>

| Step | Customer action | Evidence | Frontstage | Backstage | Support (systems) | Failures/waits | Time |
|---|---|---|---|---|---|---|---|
| 1 | | | | | | | |
---------------- line of interaction ----------------
---------------- line of visibility -----------------
---------------- line of internal interaction -------

Opportunities: <problem> | affected | process change | metric | owner | quick win or structural
```

Common metrics: wait time, repeat contact, rework, first-contact resolution, completion without help, cost per service interaction.

**IF** the blueprint shows only visible channels **THEN** it has turned into a journey map; go back to the backstage. **IF** a backstage step has not been confirmed by whoever performs it **THEN** mark it as "not confirmed".

## Pitfalls

- Personas, journeys and blueprints made only from team assumptions and presented as truth.
- Demographic stereotypes in place of behavior.
- Confusing a persona with a market segment, or a user with a buyer.
- Maps with no date, no owner and never updated.
- A gigantic corporate scope in a single blueprint.
- Polishing the visuals instead of using the artifact to decide.

## What an agent can / cannot do

> **Can:** structure personas, empathy maps, journeys and blueprints from provided transcripts, notes and data, marking the source of each item; propose behavioral clusters; point out gaps and contradictions; suggest opportunities; generate proto-personas and synthetic personas **labeled as hypotheses** to guide research.
>
> **Cannot:** fill in "thinks" and "feels" without data as if they had been observed; invent representative quotes; use synthetic personas as a source of validation; describe the real backstage operation without input from those who perform it; declare a persona "validated" without cited evidence.
