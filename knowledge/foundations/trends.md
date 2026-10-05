# Trends (signals and hypotheses)

> **When to consult**
> - When designing AI products that act on the person's behalf, dynamically generated interfaces, or flows that other agents will consume.
> - When discussing product or design system direction for the coming years.
> - Do **not** use this file as a source of rules. Everything here is a signal or a hypothesis; the rules live in the other foundation files and in the pattern cards.

**Content status:** market readings in 2026 about what tends to gain weight in 2027. Each item gives the signal, the impact hypothesis, the risk and what is already prudent to do (which usually means applying stable principles to a new context). Review this file every cycle; discard what is not confirmed.

---

## Overall reading

**Signal:** design work shifts from drawing screens to designing **behavior**: what the system does on the person's behalf, within what limits, with what record and with what recovery.

**Hypothesis:** a product's quality comes to be judged as much by the decisions the system makes as by the interface it shows.

---

## UX signals

### 1. Agentic UX
- **Signal:** systems interpret goals and carry out several steps on their own.
- **Hypothesis:** design comes to define decision gates, autonomy levels and strategic friction.
- **Risk:** autonomy without oversight; a good share of agentic projects may be abandoned over cost and weak governance.
- **Prudent today:** every action with a consequence shows what it will do and asks for confirmation proportional to the risk ([confirm-ai-action](../../patterns/ai/confirm-ai-action.md)); a readable record of what was done; undo.

### 2. Contextual and generative interfaces
- **Signal:** screens assembled in real time according to context.
- **Hypothesis:** the design system becomes a set of rules and limits for what may be generated, more than a library of screens.
- **Risk:** loss of predictability, consistency and accessibility in untested combinations.
- **Prudent today:** automatically validate each generated variation against tokens, states and WCAG.

### 3. Trust as a functional layer
- **Signal:** transparency stops being legal text and becomes part of the interface.
- **Hypothesis:** content origin, level of certainty and action history become standard components.
- **Risk:** a generic "AI-generated" label that tells nothing; or too much explanation, which overloads.
- **Prudent today:** label with purpose ([label-ai-content](../../patterns/ai/label-ai-content.md)), show sources ([ai-sources](../../patterns/ai/ai-sources.md)) and uncertainty ([ai-uncertainty](../../patterns/ai/ai-uncertainty.md)).

### 4. Invisible AI
- **Signal:** automations anticipate needs and remove steps.
- **Hypothesis:** less explicit interaction, more ready-made results.
- **Risk:** relevant logic hidden; hard to take back control; the product "seems to do nothing".
- **Prudent today:** show what was done automatically and how to reverse it ([review-ai-output](../../patterns/ai/review-ai-output.md)).

### 5. Agents as users
- **Signal:** software agents browse, fill in forms and buy.
- **Hypothesis:** structured data, correct semantics and clear policies become part of the experience.
- **Risk:** instruction injection through external content; outdated data replicated at scale.
- **Prudent today:** semantic HTML, associated labels, correct `autocomplete` and explicit states already serve both people and agents ([forms.md](forms.md)).

### 6. AI-augmented research
- **Signal:** transcription and synthesis become fast and cheap.
- **Hypothesis:** the bottleneck becomes asking good questions and judging nuance.
- **Risk:** synthetic users produce shallow or overly favorable answers.
- **Prudent today:** use simulation only to generate hypotheses, never as evidence ([usability-evaluation.md](usability-evaluation.md)).

### 7. Design systems for humans and agents
- **Signal:** agents generate interfaces from components and tokens.
- **Hypothesis:** machine-readable documentation (rules, IF/THEN decisions, anti-patterns) becomes part of the design system.
- **Risk:** plausible but wrong output: missing state, insufficient contrast, ignored token.
- **Prudent today:** validate all generated output (code, states, accessibility) before accepting it.

### 8. Accessibility as governance
- **Signal:** automatically detectable failures (contrast, unlabeled fields, images without alternatives) remain present on the vast majority of sites.
- **Hypothesis:** accessibility moves from a post-launch checklist to a continuous rule in components and CI.
- **Prudent today:** automated accessibility tests in the pipeline and manual review of critical flows.

### 9. Evaluating AI behavior
- **Signal:** UX teams start using evals.
- **Hypothesis:** UX criteria (did it interpret the goal? ask for confirmation? communicate uncertainty? recover from the error?) enter the evaluation sets.
- **Prudent today:** write test cases for ambiguity, failure and recovery ([ai-error-recovery](../../patterns/ai/ai-error-recovery.md)).

### 10. Human premium
- **Signal:** execution becomes cheap.
- **Hypothesis:** judgment, quality research, craft, empathy and choosing what **not** to build gain value.

---

## Digital product signals

| Signal | Hypothesis | Caution |
|---|---|---|
| AI-native products | AI as the core proposition, not a bolted-on chat | Real value vs. novelty |
| Executing agents | Designed "autonomy states" (suggests, prepares, executes with confirmation, executes alone) | Clear limits and reversal |
| Intent-based experience | The person describes the result; the system translates it into operations | Confirm when facing ambiguity |
| Proactive automation | Evolution reactive → assistive → proactive → autonomous | Allow turning it off and adjusting |
| Hyper-personalization | Experience tailored to the individual | Depends on reliable, consented data; explain why |
| Machine-readable software | API and structured data as part of the UX | Security and freshness |
| Vertical and regional solutions | Specialization beats generalism | Local language and regulation |
| Usage/outcome-based pricing | Price tied to delivered value | Cost transparency ([dark-patterns.md](dark-patterns.md)) |
| Speed vs. relevance | Building is cheap; choosing what to build is the bottleneck | Discovery gains weight |
| Trust as a feature | The person needs to know what, why and how to take back control | Without overloading with explanation |

---

## Stable principles these trends reinforce

These are not hypotheses; they are rules already present in the other files, with greater weight in AI products:

- Action with a consequence → preview of what will happen, confirmation proportional to the risk, record, undo ([nielsen-heuristics.md](nielsen-heuristics.md), H3 and H5).
- Show uncertainty and sources instead of feigned confidence (H1, H9).
- Do not hide relevant decisions for the sake of fewer clicks (H1, [dark-patterns.md](dark-patterns.md)).
- Every generated variation goes through the same accessibility and states audit.

---

## Audit checklist

- [ ] No design decision was justified **only** by a trend in this file.
- [ ] Actions executed by AI have a preview, confirmation proportional to the risk, history and undo.
- [ ] Generated content is labeled with purpose, with sources and uncertainty when relevant.
- [ ] Automations show what they did and how to reverse it.
- [ ] Generated interfaces were validated against tokens, states and WCAG.
- [ ] AI simulations were treated as hypotheses, not as evidence.
- [ ] This file was reviewed in the last cycle and unconfirmed items were removed.
