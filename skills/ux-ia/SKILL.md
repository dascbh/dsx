---
name: ux-ia
description: "Designs and reviews AI features and agents: autonomy by risk, specific confirmation, progress, uncertainty, sources, labeling, review and error recovery. Use for chat, copilots, agents that take actions or generated responses."
---

# AI and agent UX

> **DSX root:** two levels above this skill's base directory. The `knowledge/` and `patterns/` paths are relative to it.

References: `knowledge/ia/ux-for-agents.md`, `generative-ui.md`, `multimodal.md`, `rag-and-sources.md`, `synthetic-content.md`; patterns `patterns/ai/*`.

**Thesis:** AI makes the draft cheaper, not the mistake. The UX job is to make the system's behavior **understandable, supervisable and reversible**.

## 1. Classify each system action by risk

List everything the AI/agent can **do** (not just say). For each action:

| Risk | Example | Required UI |
|---|---|---|
| Low, reversible | reorder a list, a draft | execute and inform; undo available |
| Moderate | change a reversible internal record | show the plan first; track progress; undo |
| High | send an external message, publish, invite people | **specific confirmation**: action + target + consequence, with preview |
| Critical | move money, delete data, change permissions | reinforced confirmation (full review, typing/2nd factor), audit trail, never in a silent batch |

Rules:
- Uniform confirmation for everything breeds fatigue and automatic approval — **calibrate by risk**. `patterns/ai/confirm-ai-action.md`
- Never irreversible automation in a sensitive flow without a recovery path.
- Distinguish **suggesting** from **acting** in the interface.

## 2. Interaction loop the UI must cover

1. **Intent:** show what the system understood (goal, scope, constraints). If ambiguous, ask with concrete options (pt-BR example: "Encontrei 2 pessoas chamadas Ana. Qual?").
2. **Plan/progress:** current step, tools and sources in use, pending decisions. A generic spinner is not enough for tasks > 10s. `patterns/feedback/long-loading.md`
3. **Result:** labeled as AI-generated (`patterns/ai/label-ai-content.md`), with sources/criteria when it states facts (`patterns/ai/ai-sources.md`), and limits communicated in an actionable way — not a bare percentage (`patterns/ai/ai-uncertainty.md`).
4. **Review:** edit, redo, refine, partially accept, discard — without losing the previous version (`patterns/ai/review-ai-output.md`).
5. **Failure:** say what failed, preserve what was done, retry only the failed step, offer a manual or human path (`patterns/ai/ai-error-recovery.md`).
6. **Trail:** history of what was done, with which data and with which approval.

## 3. Permissions and data

- Ask for permission **at the moment of need**, explaining the benefit.
- Limitable scope (per task, time window, data set) and revocable; show where to review it.
- Separate levels: read, suggest, change, publish.
- Active capture (microphone, camera, screen) always noticeable and interruptible.

## 4. Handoff to a human

When transferring, carry: goal, steps done, evidence, pending decisions and the reason for the transfer. The person never repeats what they already said.

## 5. Generative UI (when the AI assembles the interface)

- Generate from an **approved catalog** of components, via declarative specification — never arbitrary code at runtime.
- **Fixed invariants:** navigation, identity, legal messages, high-risk actions. Only contextual areas vary.
- Every generated layout passes the same gates: contrast, focus order, accessible names, error/empty states.
- Fallback to a fixed interface when generation fails.
- Prefer a fixed interface for frequent tasks that depend on spatial memory, high-risk operations and regulated environments.

## 6. Anti-patterns (block them)

Humanizing the AI to look more capable than it is · hiding that content is generated · "Continue?" as a confirmation · maximized instead of calibrated confidence · autonomous action on sensitive data without reversal · handoff without context · measuring only completion rate · long voice responses when the person needs to compare.

## Output (design or review)

```
System actions and risk: <action> → <level> → <required UI> (✔ exists / ✘ missing)
Loop covered: intent ✔ progress ✔ labeling ✔ sources ✔ review ✔ failure ✔ trail ✔
Permissions: …
Residual risks and how to measure them: <calibrated-confidence metric, correction rate, handoffs> — see skill `evals`
```
