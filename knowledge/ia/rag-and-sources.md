---
id: rag-and-sources
area: ai
title: RAG, sources and verification in the experience
evidence: contextual
related: [evals, evidence-and-sources, ux-for-agents]
---

# RAG, sources and verification

> **When to consult**
> - When designing any experience in which the AI answers based on documents, internal knowledge bases, catalogs, policies or retrieved data.
> - When designing citations, "I didn't find it" states, conflicting sources, restricted content or waiting during search.
> - When defining the answer contract of a knowledge assistant.
>
> **Not needed:** knowing how to implement embeddings or vector databases. You do need to understand the architecture well enough to design what happens when retrieval works, fails or brings back something questionable.

## 1. The minimum architecture UX needs

RAG (retrieval-augmented generation): before generating, the system **searches** for relevant excerpts in a knowledge base and hands them to the model as context.

Two phases:
1. **Knowledge preparation:** documents are collected, cleaned, split into excerpts (*chunks*), enriched with metadata (title, origin, date, version, owner, permission) and indexed (by meaning, by keyword, or hybrid).
2. **Answering:** question → interpretation → retrieval → selection/reranking → context → generation → presentation with sources and controls.

The last step is where most of the experience work lives.

| Term | Why it matters for UX |
|---|---|
| Knowledge base | Defines what the product can and cannot answer |
| Excerpt (*chunk*) | A bad cut strips context and makes an answer look supported by an incomplete source |
| Retriever | The answer can fail before it ever reaches the model |
| Reranking | Decides which evidence actually reaches the model |
| Grounding | Separates an answer supported by a source from content that comes only from the model |
| Context window | The system chooses what goes in; something relevant may be left out |

**A fact to always carry:** RAG reduces some errors; it does not eliminate hallucination. The interface **never** communicates "correct because it consulted documents". It lets the person understand what was found, where it came from and how to check it. `[evidence: contextual]`

### When RAG is not the answer
- **IF** the task does not depend on external knowledge **THEN** a model without retrieval may be enough.
- **IF** there is a single small document **THEN** send it directly in the context.
- **IF** the problem is format or behavior **THEN** instructions or fine-tuning solve it better.
- **IF** the answer needs exact structured data **THEN** query a database or API.
- **IF** the knowledge base is contradictory or abandoned **THEN** RAG only makes bad information easier to find. Fix the base first.

## 2. UX responsibilities

### 2.1 Promise and scope
"Ask anything" creates an impossible expectation. "Ask about the HR policies published in this base" is honest. Show available collections, the period covered, the date of the last update and examples of what is out of scope. Related pattern: [`ai-uncertainty`](../../patterns/ai/ai-uncertainty.md).

### 2.2 Sources and citations
A randomized experiment published in 2025 found that citations increase declared trust, that many citations do not increase it more than one does, and that only a small fraction (about one tenth) of the displayed citations were actually opened by participants. `[evidence: contextual — specific experimental context, self-reported trust]`

Consequence: a citation works as a **visual credibility signal** even when nobody opens it. Therefore:
- every important claim points to the source that **actually** supports it;
- it is possible to open the original document and see the retrieved excerpt;
- title, origin, date and version are visible;
- different sources for different parts of the answer are distinguishable;
- what is the system's **inference** appears separate from what is written in the source;
- **NEVER** add a decorative link that does not support what is next to it.

Component and visual rules: [`ai-sources`](../../patterns/ai/ai-sources.md).

### 2.3 Distinct failure states
"I didn't find enough information" is usually better than a fluent, poorly supported answer. Each situation below has its own treatment; do not collapse them into a single "error".

| Situation | Experience response |
|---|---|
| No relevant source | State the absence of evidence; suggest rephrasing or another path |
| Question out of scope | Explain what the base covers |
| Conflicting sources | Show the divergence and the sources on each side; do not choose silently |
| Outdated source | Expose date/version; warn when this may change the decision |
| Source exists, but no permission | Do not reveal content or title; offer a path to request access |
| Technical retrieval failure | Differentiate from "does not exist"; offer to try again |
| Partial answer | Indicate what was answered and what was left without support |

Error recovery: [`ai-error-recovery`](../../patterns/ai/ai-error-recovery.md).

### 2.4 Latency
Retrieving, reranking and assembling context adds time; agentic retrieval (several queries, several sources) adds more.
- Short wait: simple indicator.
- Long wait: feedback tied to the task ("consulting the 3 selected bases", "comparing results").
- **NEVER** stage reasoning that is not happening to make the wait more interesting. Feedback describes the real state.

### 2.5 Permissions
The permission filter happens **before** content reaches the model, not afterward in the interface. States to design:
- a source unavailable to this person;
- content that requires additional authentication;
- an answer partly based on restricted material;
- permission changed mid-conversation;
- a citation that cannot expose title or excerpt;
- different people receiving different answers to the same question (and understanding why).

### 2.6 Verification, correction and dispute
"I didn't like it" alone teaches little. Useful feedback identifies where it failed:
- the retrieved source was wrong;
- the source was right and the answer misinterpreted it;
- the information was outdated;
- an important source was missing;
- correct, but confusing;
- the question was understood differently.

Each category leads to a different fix (base, retrieval, generation or interface). Also allow disputing the answer and asking a responsible team for confirmation. Output review: [`review-ai-output`](../../patterns/ai/review-ai-output.md).

## 3. Answer contract

Before designing the conversation, write the contract. Example:

```yaml
answer_contract:
  cites_sources: required_per_relevant_claim
  separates_fact_from_inference: yes
  visible_without_expanding: [direct_answer, conditions, source_date]
  admits_not_knowing_when: "no retrieved excerpt supports the central claim"
  requires_confirmation_before_acting: "any derived action with risk >= high"
  blocking_errors: ["citing a source that does not support the claim", "exposing content without permission"]
```

Recommended structure for answers about rules and policies: direct answer → conditions → source of each condition → date and version → exceptions and limits → required action → path to confirm with the owner.

Bad example: "Yes, remote work is allowed for up to 30 days." No source, no effective date, no exceptions, no word on who confirms.

## 4. Work process

1. **Human task first.** "Help analysts find the applicable policy without reading dozens of PDFs" instead of "create a chatbot for the documents".
2. **Map sources and owners.** Repositories, owners, update frequency, permissions, level of authority.
3. **Collect real questions** (searches, tickets, interviews): simple, ambiguous, incomplete, out of scope, multi-intent, multi-source.
4. **Write the answer contract.**
5. **Prototype failures before the happy path** (section 2.3).
6. **Turn the real questions into evals** (see `evals.md`, section 5).
7. **Test with people:** do they understand, notice the limits, find the source, know when to verify, recover from failures?
8. **Bring production back:** queries without results, rephrasings, opened sources and complaints become regression cases.

## 5. Anti-patterns

- Unlimited promise ("ask anything").
- Citation as decoration, disconnected from the claim.
- Silently choosing one of several conflicting sources.
- Treating technical failure and absence of information as the same message.
- Filtering permission only on screen, after the model has already read the content.
- A loading state that fakes nonexistent steps.
- Measuring quality only by the text, without measuring the task.
- Increasing perceived trust without checking whether the trust is deserved.

## 6. Checklist

- [ ] The base's scope (collections, period, update) is visible.
- [ ] It is clear when the answer uses external sources.
- [ ] Every relevant claim is linked to the source that supports it; inferences are marked.
- [ ] The person can open the origin and see the excerpt, date and version.
- [ ] The system admits a lack of evidence.
- [ ] Absence of evidence, out of scope, conflict, outdated, no permission and technical failure have distinct states.
- [ ] Permissions are applied before retrieval reaches the model.
- [ ] The wait is communicated without staging.
- [ ] Feedback identifies the failing layer; there is a path to dispute.
- [ ] Retrieval, generation, citation and task are evaluated separately, and production failures go back into the suite.
