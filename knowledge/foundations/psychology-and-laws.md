# Cognitive psychology and UX laws

> **When to consult**
> - When deciding how many options, fields or actions to show on a screen.
> - When sizing and positioning clickable targets and dangerous actions.
> - When grouping elements and choosing containers and spacing.
> - When justifying why something "does not look clickable" or "does not work as expected".
> - When reviewing text that frames choices (price, risk, refusal) or when questioning a solution the team is fond of.

These laws describe tendencies of human perception and decision-making. Use them to **justify and predict**, not as formulas that replace testing.

---

## 1. Cognitive load

Working memory is small. Every bit of effort spent deciphering the screen is effort taken away from the task.

| Type | What it is | What to do |
|---|---|---|
| Intrinsic | The task's own complexity (filing taxes, configuring permissions) | Cannot be eliminated; organize it into phases and provide good defaults |
| Extraneous | Effort created by the presentation (vague labels, excess, instructions far from the action, illogical order) | **Eliminate it.** This is where design gains the most |
| Germane | Effort that builds useful understanding | Preserve it; not all effort is bad |

**Rules**
- Show only what is needed for the next step; the rest on demand.
- Put instructions next to the control they refer to.
- Prefer recognition: lists, suggestions, recent values, a summary of the previous step.
- Use sensible defaults when most people would choose the same thing.
- Group and prioritize; a block of 20 loose items costs more than 4 groups of 5.
- Keep patterns consistent; every variation is something new to learn.

**Anti-patterns**
- Assuming fewer elements always means less effort (removing necessary context increases the load).
- Over-splitting: too many short screens trade reading for navigation.
- Unlabeled icons to save space.
- Simplifying to the point of taking control away from the person.

**Observable signs of overload:** hesitation, navigating back and forth, repeated errors, requests for help, abandonment.

---

## 2. Fitts's Law

The time to reach a target grows with distance and shrinks with size: `T = a + b · log2(1 + D/L)` (D = distance, L = target width along the axis of movement).

**Rules**
- Place the action near where attention already is ("Continue" right below the last field).
- The actionable area can and should be larger than the visible icon (touch padding).
- Frequent or important actions get a larger area.
- Screen edges and corners work as "infinite" targets for a pointer; use them for fixed menus on desktop.
- Keep competing controls apart; destructive actions get a safety distance from the most common action.
- Consider one-handed use on phones: the bottom center is more reachable than the top corners.

**Size thresholds**

| Reference | Minimum |
|---|---|
| WCAG 2.2 AA (2.5.8) | 24 × 24 CSS px, or equivalent spacing to the neighbor |
| WCAG 2.2 AAA (2.5.5) | 44 × 44 CSS px |
| iOS guideline | 44 × 44 pt |
| Android guideline | 48 × 48 dp |
| Distance between touch targets | ≥ 8 px |

IF the target is touch THEN design at 44–48 px; treat 24 px as the legal floor, not the goal. See [touch-target](../../patterns/accessibility/touch-target.md) and [floating-action-button](../../patterns/actions/floating-action-button.md).

**Limits.** Fitts measures movement, not comprehension. It does not solve an ambiguous label, doubt between options or error recovery.

---

## 3. Hick's Law

Decision time grows (logarithmically) with the number of equivalent alternatives. Five actions of equal weight cost more than two, and cost even more if they look alike.

**Rules**
- State the screen's main decision in one sentence before laying out the elements.
- Highlight **one** recommended action; keep the alternatives accessible, with less weight. See [button-hierarchy](../../patterns/actions/button-hierarchy.md).
- Group options into categories the audience recognizes (validate with card sorting).
- In long lists, offer search and filters instead of scrolling ([filter-structure](../../patterns/search-filters/filter-structure.md)).
- Separate the common from the advanced with a specific label ("Advanced billing settings", not "More options").
- When reducing options by context, explain the criterion and allow seeing everything.

**Decisions**
- IF there are more than 7 same-level actions in a bar THEN group them, prioritize them or move them to an overflow menu.
- IF the audience is expert and uses everything frequently THEN expose the complexity, well grouped, instead of hiding it.
- IF reducing options hides cost, cancellation or refusal THEN stop: it is a dark pattern ([dark-patterns.md](dark-patterns.md)).

**Risk contexts:** onboarding with several paths, checkout with everything at once, plan comparison, settings that mix basic and technical options, a catalog without filters.

---

## 4. Gestalt

Perception groups elements before reading the content. Use grouping to communicate structure.

| Principle | Operational rule |
|---|---|
| Proximity | Label, field and help together; space **between** groups clearly larger than **within** (ratio ≥ 2:1, e.g. 8 px within, 24 px between) |
| Similarity | Same appearance = same function. Visual difference only for functional difference |
| Common region | A card, panel or background signals belonging. Use sparingly; too many cards become noise |
| Figure and ground | The main element stands out through contrast and scale; if everything is intense, nothing stands out |
| Continuity | Alignments and axes guide the eye; accidental misalignment looks like a mistake |
| Closure | The mind completes shapes; icons can be simple, but essential actions need a label |
| Symmetry and order | Aligned grids and lists look stable and predictable |

**Anti-patterns:** applying similarity to elements with different functions; uniform spacing that does not distinguish groups; cards inside cards; prioritizing symmetry over task completion.

---

## 5. Affordance and signifiers

- **Real affordance:** the action exists in the system.
- **Perceived affordance:** what the person believes they can do.
- **Signifier:** the cue (visual, textual, spatial, auditory) that communicates where and how to act.

The interface problem is almost always a signifier problem: something clickable that looks like text, or text that looks like a button.

**Per element**

| Element | Minimum signifiers |
|---|---|
| Button | Fill or border, contrast, a label with a verb, hover/focus/pressed/disabled states |
| Link | A distinct color **and** underline (or another cue besides color) in body text |
| Field | Border or background, persistent label, visible focus |
| Control (toggle, checkbox) | Current state readable without relying on color alone |

**Rules**
- What is clickable looks clickable; what is not, does not.
- Labels describe the consequence ("Delete project"), not something generic ("OK").
- Design all states before validating.
- Do not rely only on color or motion; ensure an accessible name and visible focus ([keyboard-focus](../../patterns/accessibility/keyboard-focus.md)).

See [link-vs-button](../../patterns/actions/link-vs-button.md), [disabled-button](../../patterns/actions/disabled-button.md).

---

## 6. Mental models

A mental model is the internal, incomplete explanation a person uses to predict how something works. Three models need to match: the user's, the designer's conceptual model and the one implemented in the system.

**Rules**
- Follow conventions the audience already knows (Jakob's Law).
- Make active modes, filters and permissions visible; hidden state leads to "why did it do that?".
- Give understandable feedback about the consequence of each important action.
- Offer reversibility; it reduces anxiety and encourages exploration.
- Use the vocabulary of the user's domain, not the team's.

**How to discover the audience's model:** interviews about real tasks (spontaneous vocabulary, expectation of what happens), card sorting, tree testing, think-aloud testing that asks for the expectation **before** the click.

**Anti-patterns:** designing from the team's model; copying a competitor without understanding why; changing a pattern abruptly without a transition; confusing a visual metaphor with an explanation.

---

## 7. Biases that affect design decisions

### Framing

The way something is presented changes the decision even with identical facts (Kahneman and Tversky).
- Attribute: "99% availability" vs. "1% unavailability".
- Goal: the gain of acting ("Secure your spot") vs. the loss of not acting ("Don't miss out").
- Denomination: "R$ 3.30 per day" vs. "R$ 1,200 per year".

**Rules**
- Use framing to help people see **real** value, with the total always visible. IF you show a price per day THEN also show the total charged and the billing period.
- Loss framing only when the risk is real (security, health, finances).
- IF the framing hides cost, induces guilt or makes leaving harder THEN it is a dark pattern.

### Confirmation bias

The tendency to seek out and value what confirms a prior hypothesis.
- In research: leading questions ("you found it easy, right?").
- In design: an overly polished prototype turns criticism into "user error".
- In metrics: picking only the number that confirms.

**Mitigation:** write down beforehand what would prove the hypothesis wrong; use open, neutral questions; triangulate qualitative and quantitative data. **For agents:** treat your own first solution as suspect and look for the case that breaks it.

### Kill your darlings

Abandoning attractive ideas that do not serve the task. Sunk cost and attachment keep weak ideas alive.

**Signs of a zombie idea:** it needs a long explanation to be "intuitive"; rare use (below ~5% of the audience); it solves a hypothetical problem; it diverts from the main task; maintenance costs more than its value.

**Tools:** RICE (reach × impact × confidence ÷ effort); MoSCoW, explicitly deciding what is left out. Critique the solution, never the person; record what was discarded and why.

---

## Audit checklist

- [ ] The screen has an identifiable main decision and a highlighted recommended action (Hick).
- [ ] Numerous options are grouped, filterable or progressively disclosed, without hiding what is critical.
- [ ] Touch targets ≥ 44 px (absolute minimum 24 px) and ≥ 8 px between neighbors (Fitts).
- [ ] Main action close to the content that motivates it; destructive action set apart.
- [ ] Space between groups clearly larger than within groups (Gestalt).
- [ ] Same appearance only for the same function; cards used sparingly.
- [ ] Every clickable element has a signifier besides color; nothing non-clickable looks like a button.
- [ ] Active modes, filters and permissions are visible.
- [ ] Instructions next to the control; no data needs to be memorized between screens.
- [ ] Price and risk presented with the total and billing period, without manipulative framing.
- [ ] The proposed solution was tested against at least one counterexample.
