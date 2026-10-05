---
id: public-decision-page
title: Public decision page
summary: Page opened by a link, without login, where a third party outside the product reads a request and records a decision (confirmation, refusal, approval, change request).
register: [consumer]
when-to-use: IF a person outside the product, without an account, needs to read something and answer once THEN use a public decision page
avoid-when: whoever answers is a product user (use the internal screen), the decision requires strong identity that the link does not guarantee, or the person needs to edit the content
regions: [public-header, request-summary, document-or-detail, decision-area, public-footer]
primary-action: { region: decision-area, position: inline, max: 1 }
states: [loading, invalid-link, expired-link, already-answered, submitting, error, success]
patterns: [button-hierarchy, button-text, confirm-action, double-submit, success-confirmation, helpful-error-message, label-vs-placeholder, form-errors, touch-target, link-in-new-tab, technical-error-code, required-fields]
variations: [binary-decision, decision-with-reason, decision-with-identification, long-document-with-sticky-decision]
rules: [T1, T3, T4, T5, T6, T7, F1]
---

# Public decision page

A supplier receives a link and needs to confirm or refuse a purchase order; a partner confirms data; a client approves a proposal. This person does not know the product, has no account, often opens it on a phone between other tasks, and will use the screen once. The page has one job: make clear **who is asking, for what, by when, and what happens with each answer**, and record the answer without ambiguity.

## When to use

- **IF** whoever answers has no account in the product **THEN** use a public decision page, reached through a single-use or time-limited link.
- **IF** the options are to agree or not, with no justification **THEN** use `binary-decision`.
- **IF** the refusal needs a reason for the request to move on **THEN** use `decision-with-reason`: a reason from a list plus a message, required only on the option that needs them.
- **IF** the decision must record who answered **THEN** use `decision-with-identification` (name and, if needed, a verifiable piece of data) before submitting.
- **IF** the content to read is long **THEN** use `long-document-with-sticky-decision`, with the decision always within reach.
- **IF** the decision has a legal or financial effect that requires strong identity **THEN** the link is not enough: use a signature with identity verification (outside this archetype).
- **ELSE** (whoever answers is an internal user) **THEN** the decision lives on their work screen.

## Region map

```
┌──────────────────────────────────────────┐
│ public-header  Sender's brand             │
├──────────────────────────────────────────┤
│ request-summary                           │
│  Order confirmation (h1)                  │
│  Sent by Company X to Supplier Y          │
│  Answer by 10/15/2026                     │
├──────────────────────────────────────────┤
│ document-or-detail                        │
│  Text or document preview · Download PDF  │
├──────────────────────────────────────────┤
│ decision-area                             │
│  ( ) I confirm the order                  │
│  ( ) I refuse      → reason + message     │
│  What happens next: …                     │
│              [Send answer]                │
├──────────────────────────────────────────┤
│ public-footer  Questions: contact · Priv. │
└──────────────────────────────────────────┘
```

## What goes in each region

- **public-header**: the identity of whoever sent it (the sending organization's brand), no product menu, no links leading to areas behind login.
- **request-summary**: an `h1` saying what is being asked in plain language; who is asking, of whom, what it refers to (order number or subject), the answer deadline spelled out. No internal product jargon.
- **document-or-detail**: the content to evaluate, readable on a phone, with an option to download; changes highlighted by more than one signal when it is a revision.
- **decision-area**: the options with labels that state the decision ("I confirm the order", "I refuse"), the consequence of each in one sentence, conditional fields with a visible label, and a single submit button that names the action.
- **public-footer**: how to ask the sender questions, a privacy notice, and nothing else.

## Actions

- **Primary:** one, in the `decision-area`, next to the content: "Send answer" (or the verb of the chosen option). The options themselves are not competing filled buttons; choosing and sending are two acts, to avoid accidental taps.
- **Confirmation:** before recording, recap the choice ("You are about to record: I refuse, reason: deadline") when the answer cannot be changed; if it can be changed until the deadline, say so and skip the confirmation.
- **Submission:** blocks double clicks, shows progress, only confirms after it is recorded.
- **Exits:** download the document and contact the sender; opening in a new tab warns about it.

## States

- **loading**: a simple skeleton; none of the content before the link is validated.
- **invalid-link**: a tampered or nonexistent link: a neutral message, without revealing whether the request exists, and how to ask the sender for a new link. No technical code on screen.
- **expired-link**: the deadline passed or the link was replaced: say it expired, when, and how to ask for a new one.
- **already-answered**: the answer is already recorded: show which one, when, and whether it can still be changed; never reopen the form blank.
- **submitting**: the button with an indicator, options locked.
- **error**: recording failed: the choice and the text stay filled in, the message says what to do ("Try again in a moment; if it persists, contact …").
- **success**: a final page with the recorded answer, date and time, what happens now and an option to download a receipt; no redirecting to the product's home page.

## Variations

### binary-decision
Two options and a submit button.
**Favors:** quick answers, phones, low load.
**Worsens:** does not capture nuance; refusals without a reason stall the flow on the requester's side.

### decision-with-reason
The refusal option opens a required reason (list) and message.
**Favors:** an actionable refusal; the requester knows what to change.
**Worsens:** more friction on refusal, so keep the list short and the message with guidance on what to write; never require a reason to agree.

### decision-with-identification
Name fields (and, if needed, job title or document) before submitting.
**Favors:** a trail of who answered when the link may be forwarded.
**Worsens:** collects personal data, so ask only for what is needed and say why; it does not replace identity verification.

### long-document-with-sticky-decision
Long content with the decision in a bar fixed at the bottom (or "Go to the answer").
**Favors:** long requests with many lines; the decision always within reach.
**Worsens:** a fixed bar takes height on a phone; it may encourage deciding without reading, so show reading progress instead of blocking.

## Anti-patterns

- Filled "Accept" and "Refuse" buttons side by side, recording on the first tap.
- Internal terms ("requisition", "phase", "token", "tenant") on the outsider's screen.
- An expired link showing a technical error or the product's login page.
- Reopening the blank form for someone who already answered.
- Requiring an account to answer.
- A success that does not say what was recorded or when.
- A required reason even for someone who agrees.

## Checklist

- [ ] `h1` in plain language; who is asking, what, and the deadline spelled out at the top.
- [ ] Options with the decision's label and its consequence; one submit primary, separate from the choice.
- [ ] Conditional fields with a visible label; required only where needed.
- [ ] `invalid-link`, `expired-link` and `already-answered` distinct, with no technical code.
- [ ] Submission protected against double clicks; an error preserves the choice.
- [ ] Success with the answer, date and time, and the next step.
- [ ] Works on a phone: adequate touch targets, no horizontal scrolling.
- [ ] No internal product term in the visible text.
