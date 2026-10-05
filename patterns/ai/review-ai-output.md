---
id: review-ai-output
title: How do you let people review and edit AI-generated results?
category: ai
components: [text-field, editor, ai-suggestion, button]
type: contextual-decision
impact: high
status: recommended
evidence: moderate
wcag: ["2.1.1", "2.4.7", "4.1.3", "1.4.1", "2.4.3"]
related: [confirm-ai-action, label-ai-content, ai-uncertainty, ai-error-recovery]
---

# How do you let people review and edit AI-generated results?

> **Rule:** Present every AI result as a proposal the person can accept, edit, refine, regenerate or discard before it affects a decision, communication or flow.

## Context

AI can write emails, summarize documents, fill in fields, classify records or suggest replies. Before that result guides a decision, is sent, is published or replaces existing content, the person needs to assess it and, if needed, change it.

Results may be incomplete, misread the context or repeat an inappropriate decision. Being able to correct keeps the person accountable and stops a probabilistic suggestion from looking final.

This rule covers the result delivered for use. It does not replace confirmation before an external action: reviewing a draft is different from authorizing a send, publication or data change. The degree of control should follow risk, reversibility and the confidence required.

## Decision

- **IF** the AI produces a draft, summary, extraction, classification or fill-in that will be used **THEN** present it as a proposal, with accept, edit, refine, regenerate and discard as the context requires.
- **IF** the result is long or structured **THEN** allow local correction without regenerating everything.
- **IF** the suggestion replaces existing content **THEN** show the scope of the change and keep the previous version or an "Undo".
- **IF** the person needs to compare with the original **THEN** show the difference without relying on color alone.
- **IF** later use has an external, financial, destructive or permission effect **THEN** connect the review to its own confirmation before executing.
- **IF** the suggestion is local, reversible and low-risk, and the person already controls it **THEN** do not require mandatory review.
- **ELSE** treat the result as a proposal until explicitly accepted.

## When to use

- Drafts of text, emails, replies and documents.
- Summaries, extractions, classifications or field fill-ins to be validated.
- Recommendations that guide product, support or operations decisions.
- Content that may be published, sent or shared.
- Proposed changes to existing content.

## When to avoid

- Mandatory review of a local, reversible, low-risk suggestion → **use instead:** apply it with "Undo".
- Editing as a substitute for confirming an external action → **use instead:** the action's own confirmation.
- Correction hidden in a generic menu → **use instead:** visible controls next to the result.
- Forcing the whole request to be redone → **use instead:** refinement and local editing.
- A final response with no way to edit, reject or recover → **use instead:** an editable proposal.

## Do

- Treat the result as a proposal until accepted.
- Allow editing within the result's own context.
- Use verbs that describe each button's effect.
- Keep the previous version, the origin or undo.
- Show the scope before replacing content.
- Raise the level of review when the impact is high.

## Avoid

- Replacing content automatically with no review or recovery path.
- Reducing the person to accepting or starting over.
- A single ambiguous button for a broad change.
- Highlighting only "Accept" and hiding discard and edit.
- Treating a local edit as authorization to send or publish.
- Relying only on icons, colors or animations to show what can be corrected.

## Accessibility

- Edit, accept, regenerate and discard controls with accessible names and visible focus (2.4.7).
- Full keyboard use and a focus order consistent with reading the result (2.1.1, 2.4.3).
- Do not use icons alone for review or discard.
- When a suggestion replaces content, announce the change without stealing focus and keep undo (4.1.3).
- Avoid automatic updates that move focus or make the person lose their reading position.
- When comparing versions, the difference must not depend on color alone (1.4.1).

## Microcopy

| Situation | Example |
|---|---|
| Accept | "Insert into document" |
| Replace | "Replace selected text" |
| Refine | "Ask for changes" |
| Regenerate | "Generate another version" |
| Discard | "Discard suggestion" |
| Result label | "Draft suggested by AI. Review before using." |

## Verification checklist

- [ ] The result appears as a proposal, not as final content.
- [ ] There is a visible action to accept, edit and discard.
- [ ] Editing happens within the result's own context.
- [ ] In long content, a single part can be corrected.
- [ ] When content is replaced, there is a previous version or undo.
- [ ] Each button names its effect.
- [ ] A later external action asks for its own confirmation.
- [ ] The controls work by keyboard with visible focus.
- [ ] Differences between versions do not depend on color alone.

## Rationale

- Microsoft HAX Toolkit, guideline 9 (support efficient correction) and pattern 9B (rich and detailed edits): make it easy to edit, refine or recover when the AI is wrong.
- Amershi and colleagues (2019), guidelines for human-AI interaction: 18 guidelines evaluated with design practitioners.
- Google PAIR, People + AI Guidebook: designing people-centered AI and calibrating trust.
- Public documentation of AI writing assistants in text editors: keep, regenerate, refine or discard drafts; review of generated alt text.
