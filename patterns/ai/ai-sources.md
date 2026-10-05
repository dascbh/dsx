---
id: ai-sources
title: How do you show sources and criteria in AI responses?
category: ai
components: [citation, sources-panel, ai-response, link]
type: contextual-decision
impact: high
status: recommended
evidence: moderate
wcag: ["2.1.1", "2.4.4", "2.4.7", "1.4.1", "4.1.2"]
related: [label-ai-content, ai-uncertainty, review-ai-output, confirm-ai-action]
---

# How do you show sources and criteria in AI responses?

> **Rule:** Link each relevant claim to the source that supports it, make the source openable and, for high-impact outputs, also show the criteria, data and limits used.

## Context

An AI response may synthesize documents, suggest an action or support a decision. If it draws on sources, data or rules, the person needs to see what backs it and judge whether it applies to their context.

A citation does not guarantee correctness: the source may be incomplete, misread or not support the passage. The goal is verification proportional to risk, not automatic trust.

Well-written text sounds reliable even when it is wrong. Visible sources and criteria let people compare the interpretation with the origin and decide whether to look for other evidence.

## Decision

- **IF** the response uses search, documents, internal knowledge bases or uploaded files **THEN** show the sources next to the passage each one supports.
- **IF** the risk is low (a local, reversible suggestion) **THEN** links or excerpts are enough; do not require a long list.
- **IF** the output is a high-impact recommendation, classification or decision (health, finance, safety, rights, people selection) **THEN** also explain the data considered, the rules applied, the limitations and the uncertainty.
- **IF** there is no verifiable basis **THEN** say so explicitly; never invent a citation.
- **IF** the response mixes searched content, the person's data and the model's general knowledge **THEN** identify each origin.
- **IF** the source does not support the passage **THEN** do not show it.
- **IF** the source has restricted access or contains private data **THEN** respect permissions and say so.
- **ELSE** provide at least a visible, easy-to-find sources panel.

## When to use

- Web search, documents and internal knowledge bases.
- Summaries, analyses and recommendations that will be checked.
- High-impact flows.
- Responses with several origins.
- Systems that classify or recommend through rules and filters.

## When to avoid

- A long list of sources for a trivial suggestion → **use instead:** none or a single reference.
- Technical detail that does not help assessment → **use instead:** criteria in plain language.
- An explanation in place of human review or confirmation → **use instead:** explanation plus review.
- Exposing personal data to "explain" → **use instead:** a summary without sensitive data.

## Do

- Tie the source to the exact passage.
- Show the source's type, date and context when relevant.
- Separate cited fact, AI inference and practical suggestion.
- State limits and missing evidence clearly.
- Offer a way to question or correct.

## Avoid

- Decorative or unrelated citations.
- Sources hidden in a hard-to-find menu.
- Generic explanations presented as a specific justification.
- A confidence indicator that does not explain what it measures.
- A source the person cannot open.

## Accessibility

- Each citation is keyboard-operable (2.1.1) and has an accessible name that identifies the source (4.1.2).
- Do not link source and passage by number, color or position alone (1.4.1).
- Say if the source opens in another page, requires sign-in or has restricted access (2.4.4).
- Sources panel with visible focus (2.4.7) and a predictable reading order.
- Clear language for uncertainty and missing sources.

## Microcopy

| Situation | Example |
|---|---|
| Sources label | "Sources used in this response" |
| Citation | "Source 2: Quarterly report, Mar 2026" |
| No basis | "I couldn't find a source that supports this information." |
| Mixed origin | "Based on the files you uploaded and on general knowledge" |
| Criteria | "Criteria applied: due date, amount and payment history" |

## Verification checklist

- [ ] Each important claim has an identifiable source.
- [ ] The sources can be opened and checked.
- [ ] Cited fact, inference and suggestion are distinguished.
- [ ] High-impact decisions show the criteria or data considered.
- [ ] Limits and uncertainty appear without false precision.
- [ ] There is no irrelevant or invented citation.
- [ ] Sources respect permissions and privacy.
- [ ] Citations and panel work with keyboard and screen reader.

## Rationale

- Microsoft HAX Toolkit, guideline 11: appropriate explanations of AI outputs and actions.
- Amershi et al. (CHI 2019), Guidelines for Human-AI Interaction: understandable justification of behavior.
- Google PAIR (Crafting helpful explanations): explanations that help people assess the AI.
- Public documentation of AI products with citations and sources panels (search and productivity assistants): verifying the origin.
- WCAG 2.2: keyboard operability, link purpose and name-role-value.
