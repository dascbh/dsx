---
id: ai-uncertainty
title: How do you communicate the limits and uncertainty of AI responses?
category: ai
components: [notice, label, confidence-indicator]
type: contextual-decision
impact: high
status: recommended
evidence: moderate
wcag: ["1.4.1", "4.1.3", "2.2.1", "3.1.5"]
related: [label-ai-content, ai-sources, review-ai-output, confirm-ai-action, ai-error-recovery]
---

# How do you communicate the limits and uncertainty of AI responses?

> **Rule:** Communicate uncertainty close to the result, in language proportional to actual performance and tied to a concrete action (check, compare, view sources, request review); show a confidence number only if it is valid and understandable.

## Context

AI models are not equally reliable across tasks; results vary with data, context and phrasing. A fluent response seems more certain than it is, and the person may treat it as fact.

Explicit limits prevent overreliance and also blanket rejection of a tool that is useful for the right tasks. Communication should be calibrated to risk, without requiring a percentage on every response.

A CHI study showed that task complexity and uncertainty change reliance on AI; test the communication in the real context, especially when the impact is high.

## Decision

- **IF** performance varies or the task is ambiguous, new or based on incomplete data **THEN** show the limit next to the response.
- **IF** the output can affect health, money, rights, safety or something hard to reverse **THEN** strengthen the notice and route to human review, sources or confirmation.
- **IF** the evidence does not support certainty **THEN** use "may", "perhaps" or "probably" and avoid "this is correct".
- **IF** there is more than one plausible interpretation **THEN** show alternatives or scenarios.
- **IF** you use a confidence indicator **THEN** explain its meaning, how it is calculated and the threshold that changes what to do; **ELSE** prefer simple categories.
- **IF** the numeric difference does not change the decision **THEN** do not show false precision (e.g. 87.3%).
- **IF** quality is lower for a specific language, data set or task **THEN** say so.
- **IF** the impact is low **THEN** use a discreet notice; do not apply the same warning to every response.
- **ELSE** keep a short, fixed notice, but never as a substitute for sources or review.

## When to use

- Responses, recommendations and classifications with variable performance.
- Predictions with plausible scenarios.
- Content that will be sent, published or acted on.

## When to avoid

- A percentage without explanation or calibration → **use instead:** a category with text.
- A generic disclaimer in place of sources or review → **use instead:** a concrete verification action.
- The same warning for low and high impact → **use instead:** grade it by risk.
- A notice far from the result → **use instead:** next to the output.

## Do

- Say which part needs checking.
- Offer sources, correction or human review.
- Keep the notice visible until it is understood.
- Test comprehension with the people who decide.

## Avoid

- Claiming the AI "knows" without basis.
- Using color, icon or position alone to signal uncertainty.
- Numbers without unit, reference or threshold.
- Shifting all responsibility to the user with a disclaimer.
- Removing the possibility of proceeding safely.

## Accessibility

- The limitation in text, not color, icon, sound or animation alone (WCAG 1.4.1).
- Plain language; accessible names for indicators and verification actions (WCAG 3.1.5 as a reading reference).
- Visible focus and keyboard support on alerts, sources and recourse paths.
- Do not let the notice disappear before it is read (WCAG 2.2.1).
- Announce result updates without moving focus (WCAG 4.1.3).
- Explain units and thresholds for screen readers.

## Microcopy

| Situation | Example |
|---|---|
| General notice | "This response may contain errors. Check it before using it." |
| High impact | "Do not use this as medical advice. Consult a professional." |
| Alternatives | "There are two possible interpretations. Which one did you mean?" |
| Action | "View sources" / "Request review" |

## Verification checklist

- [ ] Does the interface make clear what the AI does and where it can be wrong?
- [ ] Does the language match actual performance?
- [ ] Is the notice close to the relevant result?
- [ ] Does the notice lead to an action (check, compare, review)?
- [ ] Do numeric indicators have their meaning and threshold explained?
- [ ] Does the treatment vary with impact and reversibility?
- [ ] Does nothing depend on color or icon alone?
- [ ] Do the controls work with keyboard and screen reader?

## Rationale

- Microsoft HAX Toolkit (guideline 2 and pattern 2A): communicate performance and possible errors; tune the precision of the language.
- Google People + AI Guidebook: mental models, trust calibration, communicating confidence.
- Amershi et al. (2019, CHI): 18 guidelines for human-AI interaction.
- Salimzadeh, He and Gadiraju (2024, CHI): the effect of uncertainty and task type on reliance.
- Buçinca et al. (2021, CHI): reducing automatic reliance by prompting analysis.
- Public documentation from AI vendors: responses may be incorrect and require critical evaluation.
