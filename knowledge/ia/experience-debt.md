---
id: experience-debt
area: ai
title: AI experience debt, vibe coding and wireframe generators
evidence: contextual
related: [evals, research-with-ai, generative-ui, evidence-and-sources]
---

# AI experience debt

> **When to consult**
> - When generating screens, flows, components, text or code with AI (vibe coding, app generators, wireframe generators, coding agents).
> - When the team ships faster but support, exceptions and "almost identical" components increase.
> - When defining the role of the designer (or of the agent doing design) in a cycle where AI executes.
> - Before accepting a generated output as production-ready.

## 1. Definition and thesis

**Experience debt** is the accumulated cost of decisions that solve the immediate need and make the product harder to understand, use, maintain or evolve.

**Thesis:** AI makes the draft cheaper, not the mistake. When producing becomes almost free, the capacity to generate outgrows the capacity to validate and to keep things coherent. The natural brake that the cost of producing used to impose disappears; if the decision ritual stays the same, AI becomes a factory of plausible solutions.

The useful question stops being "how much did we speed up?" and becomes "what can we no longer let slip, now that we produce so much?".

## 2. Four formation patterns

1. **Solution before problem.** Requests such as "add an assistant" or "reduce the steps" look like goals but do not say which need, risk or outcome is at stake. AI responds well to the wrong framing.
2. **Consistency erosion.** Each person uses different prompts, models and references; variations of components, empty states and error messages appear that do not fit together.
3. **Deferred accessibility.** The output looks finished and fails on focus, reading order, labels, contrast, errors and keyboard. "Later" becomes rework and a barrier.
4. **Automation without safeguards.** The AI recommends, fills in or acts without transparency, reversal or supervision (see `ux-for-agents.md`).

## 3. Warning signs

- Deliveries speed up and support tickets, behavior fixes and exceptions rise along with them.
- There are many prototypes and nobody knows which hypotheses were tested with people.
- Interaction decisions have no owner, criterion or link to principles.
- The design system receives "almost identical" components for one-off deliveries.
- Generated messages sound natural and do not explain state, risk, next step or recovery.
- Metrics show output (screens, closed tickets), not task success or trust.

No single sign proves AI is the cause; all of them indicate that only output is being measured.

## 4. Controls: IF → THEN

| IF (sign) | Debt | THEN (control) |
|---|---|---|
| Solution created without evidence | Decision | Frame the problem and validate with research before building |
| New component without a clear need | Consistency | Go through design system governance; reuse what exists |
| Accessibility left for later | Accessibility | Acceptance criteria and automated tests in the definition of done |
| AI executes without review or reversal | Trust and control | Risk-proportional confirmation, history and undo |
| More deliveries with more support | Operational | Measure task, error and support contact, not just speed |
| Many alternatives without criteria | Decision | Explicit principles, constraints and selection criteria |

### Coherence gate (before publishing any generated output)
- [ ] Does the pattern already exist in the system? If so, was it reused?
- [ ] Does the language follow the product's glossary and tone?
- [ ] Are error, empty, loading and recovery states designed?
- [ ] Does it work with keyboard and assistive technology?
- [ ] Does the person notice when the AI acted?
- [ ] Can it be reviewed, corrected or undone?
- [ ] Is there a way out to ask for help?
- [ ] Which metric will tell whether it worked?

### Proportionality
- **IF** the change is low impact (a title variation in a secondary area) **THEN** editorial review is enough.
- **IF** it affects money, health, privacy, access or reputation **THEN** require explicit criteria, traceability, human review and testing in the real context.

### Measure the avoided cost
Hours saved are an operational metric. Also track task success, abandonment, errors, support, recovery time and trust. A flow created in half the time that increases support contacts did not become more efficient; the cost just moved.

### AI also pays down debt
Use it to **inspect**: compare patterns across screens, find component variations, review microcopy, point out missing states, cluster recurring tickets, prepare audits. The decision about what to fix stays human.

## 5. Vibe coding

Describing in natural language and letting an agent generate the code. In its initial form, the result was accepted with almost no review; the practice evolved toward precise specification, output review and architecture validation.

### What AI does not do for you
It does not consider edge cases, cognitive load, emotional context or the user's mental model. It is committed to **giving an answer**, right or not for that flow. It does not ask "what about the error state?", "what about mobile?", "does this already exist in the system?". The designer is the critical filter between what is generated and what reaches the user.

### The vibe coding hangover
Technical and visual debt accumulated by moving fast without structural review: the app works and nobody knows why; screens diverge without anyone noticing; there is no decision record; the second version needs an almost complete rewrite for lack of foundation.

Structural cause: without shared context, **each generation is isolated**. Two screens generated separately diverge in color, typographic hierarchy and the behavior of similar components.

**Antidote:** structure from the first prompt.
- Define tokens before generating screens.
- Document patterns before adding flows.
- Provide the context documents every generation reads: DESIGN.md (tokens, scales, components, voice) and UX.md (type of each screen, action placement, mandatory states, flows).
- Treat each generation as part of a system; run the coherence gate and the eval gates (tokens, contrast, catalog).

Vibe coding amplifies what already exists: with process, it accelerates; without process, it surfaces in hours problems that used to take weeks.

### Choosing a tool by stage
| Stage | Tool type | Limit |
|---|---|---|
| Explore a concept, from zero to MVP | Conversational app generators | Without structured context, new screens contradict earlier ones |
| Production with control | Code editor with an agent | Slower; requires familiarity with the project structure |
| System-aligned implementation | Component generators connected to the design system | Generic without clear visual context |

## 6. Wireframe generators

They turn a description, sketch or screenshot into an initial structure. They are a **starting point for discussion**, not a solution.

### Selection criteria
Fidelity (low/high), manual editing, prompt editing of specific parts, multiple screens and flows, use of system components, prototyping, export (design, code, PDF, image), collaboration, **privacy** of prompts and images, continuity into the next stages.

### Flow
1. Organize flow and information architecture **before** prompting.
2. Specify audience, platform, task, mandatory elements and sequence.
3. Generate in **low fidelity**, so as not to anticipate visual decisions.
4. Review: a defined task per screen, start and end of the flow, a clear action, hierarchy, back and cancel, error/empty/loading/confirmation states, minimal forms, recognizable components, unambiguous text, keyboard, business rules represented.
5. Iterate and validate before developing.

### Risks
Polished finish hides navigation or logic failures; generic flows ignore business rules; features nobody asked for appear; alternative states are missing; the result varies between generations; confidential data ends up in the prompt.

## 7. Designer roles when AI executes

| Role | Responsibility | Deliverable |
|---|---|---|
| **Context architect** | Create and maintain the context that guides every generation | DESIGN.md, UX context layer, catalog with usage rules |
| **Quality guardian** | Decide what is good enough to reach the user | Rubrics, gates, critical review of the output |
| **Consistency guardian** | Prevent divergence across generations and screens | System governance, drift audit |

Skills that gain value: **precise specification** (more than "prompt engineering"), design system fluency, and **review literacy** for generated code: recognizing unexpected behavior, a missing state or the wrong data structure for the flow, without needing to be a developer.

The work shifts from execution speed to **decision quality**: framing the problem, defining criteria, anticipating failure, keeping human judgment and knowing what should not exist. There is indication that relying more on AI is associated with less perceived critical thinking, and that provocations (critiques of and alternatives to the suggestions) help recover it. `[evidence: contextual]` So ask the AI for counterarguments and alternatives, not just the first answer.

## 8. Anti-patterns

- Accepting the first phrasing of the request as a defined problem.
- Generating screens without tokens and without a context document.
- Creating a new component per delivery instead of reusing.
- High-fidelity wireframes before validating the flow.
- Measuring success by number of screens or speed.
- Sending confidential data to a tool with no known privacy policy.
- Treating a generated persona, synthesis or pain-point list as discovery (see `research-with-ai.md`).

## 9. Checklist

- [ ] Problem, audience, context, evidence, constraint and expected outcome recorded before the first prompt.
- [ ] Context documents (DESIGN.md and UX.md) and catalog provided to every generation.
- [ ] Coherence gate applied to each output.
- [ ] Validation level proportional to risk.
- [ ] Accessibility in the definition of done.
- [ ] Metrics include task, error, support and trust.
- [ ] AI also used to inspect and reduce existing debt.
