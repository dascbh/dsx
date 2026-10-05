---
id: generative-ui
area: ai
title: Generative UI (interface generated at use time)
evidence: signal
related: [ux-for-agents, evals, multimodal]
---

# Generative UI

> **When to consult**
> - When the product will decide, during use, **which interface form** to present (table, form, chart, controls) according to the person's intent.
> - When designing the component catalog an agent can compose, or the rules for what can never change.
> - When deciding whether an area should be generated or stay fixed.
> - When evaluating agent-generated UI outputs (see also the rubric in `evals.md`).
>
> **Do not confuse with:** tools that generate mockups or code for the team to review before publishing. That is AI assisting the design process (see `experience-debt.md`). Generative UI happens **inside the product, at use time**.

## 1. Definition

Generative UI is an interface created or adapted dynamically by AI while the person uses the product, based on the intent, context and data available at that moment.

Three situations coexist and must be distinguished:

| Approach | What varies | Structure |
|---|---|---|
| Traditional interface | Only the data | Fixed |
| Personalization | Order, emphasis, recommendations | Fixed in the architecture |
| Generative UI | The very form of presentation and interaction | Composed for each situation |

It is also not a synonym for chatbot: the conversation can be the input, but the answer can become a date picker, a filterable table or checkboxes when that reduces effort.

**Evidence level:** the field is still forming. There are concrete products and research (strong signal), and a 2026 academic study found greater human preference for task-generated interfaces than for pure conversation under certain conditions, with a gain of up to 72% in the evaluated scenario. Treat it as a result specific to that study, not as a guarantee for any product. `[evidence: signal]`

## 2. How it works (cycle)

1. The person expresses intent (text, voice, selection, file, image).
2. The system interprets goal and context (conversation state, permissions, product data, tool results).
3. It decides which interface form serves the situation.
4. **It composes within a permitted space.**
5. The person interacts, generating new context; the system updates only what is needed.

Design work shifts: instead of defining each screen, you define **the space within which screens can be produced** and the criteria for judging what was produced.

## 3. Three maturity levels

| Level | What the AI decides | Freedom | Risk |
|---|---|---|---|
| **1. Contextual controls** | When to insert buttons, checkboxes, fields within a stable structure | Low | Low |
| **2. Catalog composition** | Which approved components to use and how to combine them (cards, tables, forms, charts) via declarative specification | Medium | Moderate |
| **3. Task-specific experience** | An entire page, tool, simulator or mini-application | High | High |

**Rule:** start at level 1 or 2. Only move to 3 when there is an evaluation suite, a tested fallback and execution isolation. The more freedom, the harder it is to guarantee consistency, accessibility, performance, security and predictability.

## 4. Invariants

Explicitly define what is **never** generated. By default, these are invariants:

- Global navigation and the position of orientation elements.
- Visual identity (tokens, typography, brand).
- Legal messages, consents and mandatory notices.
- High-risk or critical actions (pay, delete, publish, change access) and their confirmations.
- AI-generated content label ([`label-ai-content`](../../patterns/ai/label-ai-content.md)).
- Cancel, undo and exit controls.

Only **contextual areas** adapt. Consistency does not serve only the brand: it is what lets the person learn paths and build spatial memory.

## 5. Declarative catalog composition

Prefer that the agent **describe** what needs to be displayed and that the application **render** it with its own components. Executing arbitrary code written by the model opens a much larger risk surface. There are open specifications along these lines (declarative interface intent, client-side rendering).

Each catalog component needs to declare, for agents to read:

```yaml
component: comparison-table
purpose: "Compare 2 to 8 items on common attributes"
use_when: ["user asks for a comparison", "items share >= 3 attributes"]
do_not_use_when: ["1 item", "more than 8 items (use a filterable list)", "data with no common attributes"]
properties:
  items: { type: list, min: 2, max: 8 }
  attributes: { type: list, min: 3 }
  highlight: { type: enum, values: [none, best-value] }
states: [loading, empty, error, partial]
invalid_combinations:
  - "inside a modal on mobile"
  - "together with another comparison component in the same answer"
accessibility: "row and column headers required; reading order by row"
```

Rules:
- **IF** the component is not in the catalog **THEN** the agent cannot use it; it falls back.
- **IF** the combination is listed as invalid **THEN** rendering must reject it deterministically (schema validation), not depend on the model "remembering".
- Visual values always come from tokens; never generated raw values.

## 6. Fallbacks

Generation can be delayed, fail or produce something that does not meet the criteria. The product must remain usable.

| Situation | Fallback |
|---|---|
| Slow generation | Skeleton of the likely component + text content as soon as available |
| Generation failed | Structured text answer + retry action |
| Invalid spec (schema) | Safe default component (list or text) with the same data |
| Insufficient data | Ask for the missing information in a minimal form, do not invent |
| Generative layer unavailable | Equivalent fixed interface for the task |

**NEVER** leave an orphan output: every generated composition keeps visible state, control and a recovery path.

## 7. When to generate and when the fixed interface wins

Generate when:
- context varies a lot between people and requests;
- there are many combinations of data and options;
- the best form depends on the question;
- the work is exploratory or analytical;
- plain text forces unnecessary effort (typing what could be selected).

Keep it fixed when:
- the task is frequent and the person already knows the path (speed and repetition);
- the operation is high risk and requires clear review and identical behavior;
- the environment is regulated and needs auditing;
- the action is simple and generating only adds latency;
- changing positions would harm spatial memory.

**IF** a fixed button solves it better and faster **THEN** do not generate another button. The realistic scenario is hybrid: stable structure, personalization where known data is enough, generation where the ideal format depends on the task.

## 8. Four-step design flow

1. **Outcome before screen.** Define what the person needs to achieve and the success criteria. Separate what can vary from what is invariant.
2. **Reliable catalog.** List components, properties, usage contexts, contraindications and invalid combinations. Making them available is not enough: without usage rules, plausible but wrong compositions appear.
3. **Failure states and accessibility in the infrastructure.** Loading, error, partial, fallback. Accessible components reduce risk, but hierarchy, focus order, the relationship between controls and content, and the announcement of dynamic updates must be evaluated in the final composition.
4. **Evaluate dynamically and test with people.** Reviewing one screen is not enough when thousands are possible. Build evals and sample real outputs.

## 9. Evaluation criteria

For each generated output, judge:

- **Format fit:** was the component type the right one for the task?
- **Completeness:** is the information needed to decide present?
- **Task completion:** can the person finish what they wanted?
- **Catalog compliance:** only permitted components and combinations, only tokens.
- **Invariants preserved:** navigation, identity, notices and critical actions intact.
- **Composition accessibility:** semantics, focus, contrast, reading by assistive technology.
- **Consistency across variations:** similar requests produce recognizably similar compositions.
- **Failure behavior:** missing data and errors lead to the correct fallback.

Full YAML rubric: `evals.md`, section 8.

## 10. Anti-patterns

- **Purposeless variability:** changing the form without reducing effort, only adding latency.
- **Unpredictability** that breaks spatial memory in recurring tasks.
- **Uncontrolled generation:** executing arbitrary code instead of a declarative specification.
- **Accessibility tested on one static screen** when the system generates thousands of combinations.
- **No fallback.**
- **Orphan outputs:** a composition with no visible state, no control, no recovery.
- **High-risk action inside a generated area**, without an invariant confirmation.
- **GenUI as a goal in itself**, rather than as an answer to an effort problem.

## 11. Checklist

- [ ] The maturity level (1, 2 or 3) is declared and justified.
- [ ] The invariants are listed and protected by validation, not by an instruction to the model.
- [ ] Each catalog component has a purpose, use/do-not-use, properties, states and invalid combinations.
- [ ] Generation is declarative and schema-validated before rendering.
- [ ] All fallbacks in section 6 exist and have been tested.
- [ ] High-risk actions stay outside the generated area or go through a fixed confirmation.
- [ ] There is an evaluation suite with the criteria in section 9 and production sampling.
- [ ] There was testing with people to confirm the adaptation reduces effort.
