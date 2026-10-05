---
id: ux-for-agents
area: ai
title: UX for AI agents
evidence: contextual
related: [generative-ui, evals, rag-and-sources, experience-debt]
---

# UX for AI agents

> **When to consult**
> - Before designing or reviewing any flow in which the system **acts** on the person's behalf (sends, publishes, changes, buys, schedules, grants access), and does not just answer.
> - When deciding how much an agent can do on its own and where a confirmation comes in.
> - When designing progress, history, permissions, failure recovery or transfer to human support.
> - When defining metrics or a test script for an agentic experience.
>
> **Do not consult for:** purely informational answers with no side effect (see `rag-and-sources.md`) or dynamic screen composition (see `generative-ui.md`).

## 1. The problem that changes

A traditional interface ties each gesture to a direct consequence. An agent receives a **goal** and chooses the steps; between the request and the result there are dozens of decisions nobody specified. This creates four tensions design needs to resolve:

| Tension | What happens | UX response |
|---|---|---|
| Unpredictability | The chosen path differs from the imagined one | Show interpretation and plan before acting |
| Information asymmetry | The system knows what it used; the person sees only the result | Verifiable progress and history |
| Scale of consequence | One request affects many records or other people | Autonomy proportional to risk |
| Diffuse responsibility | On failure, nobody knows who decided or approved | Trail of actions and approvals |

Always distinguish three modes, because each creates a different expectation:

- **Chatbot**: answers; the person drives everything. Focus on answer clarity.
- **Copilot**: suggests within a task; the person decides and executes. Focus on review and conscious acceptance.
- **Agent**: plans and executes steps; the system drives part of the work. Focus on delegation, monitoring, control and recovery.

**Rule:** when the same product switches between these modes, the interface must make visible which mode is active. Suggesting and acting must never look the same.

## 2. The six principles

### 2.1 Clear intent
Before acting, the agent demonstrates that it understood the goal, scope and constraints. It does not need to repeat the whole request; it needs to expose the interpretations that would change the result.

- **IF** the instruction has an ambiguity that could cause harm or rework (which document, which recipients, which channel, is there confidential data?) **THEN** ask before executing.
- **IF** the ambiguity is irrelevant to the result **THEN** proceed with the most likely interpretation and show it in an editable form.

### 2.2 Autonomy proportional to risk
See the matrix in section 3. Confirming everything is as bad as confirming nothing: too many alerts teach the person to approve without reading.

### 2.3 Visible progress
A generic spinner does not allow supervising a delegated task. Display:
- the goal being executed;
- completed steps, the current step and the next one;
- tools and sources in use;
- decisions waiting on the person, and blockers.

Visibility is **not** dumping internal technical reasoning. It is showing external, verifiable facts that help the person follow along.

### 2.4 Specific confirmation
Every confirmation names **action + target + consequence**. "Continue?" says nothing; "Send this proposal to 12 clients in the South portfolio now? Sending cannot be undone." lets the person decide.

Before the confirm button, show what will be affected: before/after for content edits; recipients and final text for messages; who gets which permission for access changes. Component details: [`confirm-ai-action`](../../patterns/ai/confirm-ai-action.md).

### 2.5 Recovery and reversibility
Design for failure, not just for the happy path. The person must be able to:
- interrupt an execution in progress;
- undo when technically possible;
- retry **only** the step that failed;
- keep what was already completed saved;
- transfer the case to a person, with context.

Knowing it is possible to undo reduces perceived risk and increases willingness to delegate. Error pattern: [`ai-error-recovery`](../../patterns/ai/ai-error-recovery.md).

### 2.6 Traceable responsibility
After execution, it must be possible to reconstruct: the goal received, actions taken, tools accessed, approvals granted, results and failures. This serves auditing, but also helps the person learn how the agent works and explain the result to others.

## 3. Risk-based autonomy matrix

Classify **each action** of the agent (not the whole product) by its worst plausible effect, considering reversibility, data sensitivity and impact on third parties.

| Level | Criterion | Examples | Autonomy | Mandatory UI |
|---|---|---|---|---|
| **Low** | Reversible, private, no third parties | Sort a temporary list, draft local text | Execute and inform | Discreet notice of what was done + undo |
| **Moderate** | Reversible, changes internal persistent data | Update internal records, move files, tag items | Show the plan and allow monitoring | Plan visible beforehand, per-step progress, history, batch undo |
| **High** | External, public or hard to reverse | Send a message to third parties, publish content, schedule with other people | Ask for confirmation first | Preview of the final result + specific confirmation (action, target, consequence) + cancel |
| **Critical** | Financial, legal, access-related or irreversible | Move money, change permissions, delete permanently, sign | Reinforced confirmation and extra controls | Persistent on-screen review, summary of amounts/targets, deliberate friction (type the amount or name), second factor or approver when required, auditable record |

Application rules:
- **IF** the risk cannot be classified **THEN** treat it as the level above.
- **IF** the action mixes levels (e.g., updates records and notifies a customer) **THEN** the highest-risk step defines the control, and the lower-risk ones proceed without extra confirmation.
- **IF** the person explicitly approved a recurring rule ("always archive invoices") **THEN** autonomy can go up one level for that rule, with scope, duration and a path to revoke visible.
- **NEVER** downgrade a critical level for convenience or because of the agent's track record.

## 4. Actionable uncertainty

The agent should not sound equally confident about everything. Hiding doubt simplifies things in the short term and destroys trust at the first error.

- Prefer language that leads to a decision over an opaque percentage: "There are two people named Ana Lima in your contacts; which one should receive it?" is better than "82% confidence".
- Flag missing data, competing alternatives and points that need review.
- Visual and textual detail: [`ai-uncertainty`](../../patterns/ai/ai-uncertainty.md).

## 5. Permissions as experience

- Ask for access **at the moment** it becomes necessary, not in bulk during onboarding.
- Explain the link between the permission and the benefit.
- Offer limited scope: per task, per time period, per data set.
- Differentiate the verbs: **read**, **suggest**, **change**, **publish**. Each is a distinct grant.
- Show where to review and revoke what was granted.

## 6. Handoff to a human

The agent needs to recognize when it cannot proceed safely. The transfer is only worth something if whoever takes over does not need to start over. The handoff package must contain:

```yaml
handoff:
  goal: "Dispute a $389.90 charge from Sep 14"
  handoff_reason: "Merchant appears under two tax IDs; dispute rule is ambiguous"
  completed_steps:
    - "Transaction identified and confirmed by the customer"
    - "Dispute rules consulted (policy v3, in effect)"
  evidence: ["statement for the period", "excerpt of the applicable policy"]
  pending_decisions: ["Which tax ID to use on the claim"]
  actions_already_taken_with_effect: []   # nothing sent externally
  suggested_next_step: "Confirm the tax ID with the customer and submit"
  relevant_deadline: "Dispute window closes in 7 days"
```

Tell the user that there was a transfer, to whom, why and when to expect a reply.

## 7. Phased flow

For sensitive tasks, split the work into phases, each with its own UX decision. Generic example of a charge dispute:

| Phase | The agent does | UX decision |
|---|---|---|
| Understand | Identifies the item in question | Confirms with the person which item it is |
| Investigate | Looks up details and rules | Shows consulted sources and gaps |
| Prepare | Assembles the request | Summary with amounts, targets and consequences |
| Submit | Executes the external action | Explicit confirmation (high/critical level) |
| Follow up | Monitors progress | Status, deadline and next steps |
| Exception | Runs into ambiguity | Human handoff with the package from section 6 |

Use this structure as a template for any delegation with an external effect.

## 8. Anti-patterns

- **Humanizing the agent** (name, avatar, emotion) to the point of suggesting human capability or responsibility it does not have.
- **Uniform confirmation** for all actions: it causes fatigue and automatic approval.
- **Generic spinner** on a long task with multiple steps.
- **"Do you want to continue?"** without action, target and consequence.
- **Autonomous action on sensitive data without a reversal path.**
- **Handoff without context**: the person taking over has to redo the investigation.
- **Deliberate asymmetry**: hiding the sources and tools used.
- **Diffuse responsibility**: on failure, nothing indicates who approved what.
- **Measuring only completion rate**, ignoring review effort and unwanted actions.
- **Maximizing trust** instead of calibrating it.

## 9. Research and metrics

Testing only whether the agent completes the task measures technical capability, not the relationship with the person. Investigate:
- Does the person understand what they delegated?
- Can they predict what will happen before confirming?
- Do they notice when the agent is uncertain or stuck?
- Do they know how to interrupt, correct and undo?
- Can they verify the result without redoing the work?
- Does their trust track the real reliability?

Include ambiguous situations and induced failures in the script, not just the ideal path.

| Dimension | Possible metrics |
|---|---|
| Effectiveness | Goals completed correctly; quality of the result |
| Efficiency | Total time; number of interventions; review effort |
| Control | Rate of successful interruptions/corrections; recovery time |
| Predictability | Agreement between what the person expected and what was done |
| Calibrated trust | Delegation consistent with the real success rate per task type |
| Safety | Unwanted actions; excessive permissions; incidents |
| Handoff | Transfers resolved without rework; context preserved |

How to build the corresponding automated suite (trajectory, forbidden actions, final state): see `evals.md`.

## 10. Checklist

- [ ] The interface differentiates "suggesting" from "acting".
- [ ] The interpreted goal, scope and constraints can be seen and edited before execution.
- [ ] Each action is classified as low/moderate/high/critical and receives the UI from the matrix.
- [ ] Confirmations name action, target and consequence, with a preview of the result.
- [ ] Progress shows the current step, completed steps, sources/tools and pending items.
- [ ] Uncertainty and missing data appear in a way that leads to a decision.
- [ ] Pause, correct, cancel and undo are available; a partial failure retries only the failed step.
- [ ] Permissions are requested at the right moment, with limited scope, and are revocable.
- [ ] There is a human handoff with the full context package.
- [ ] The history reconstructs actions, tools and approvals.
- [ ] The agent was tested with ambiguity and failures, and the metrics include control and calibrated trust.
