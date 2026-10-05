---
name: research
description: "Plans, scripts and synthesizes user research (interviews, usability, card sorting, SUS, A/B) with traceable synthesis; a synthetic user is a hypothesis, never evidence. Use when planning or analyzing studies with people."
---

# User research

> **DSX root:** two levels above this skill's base directory. The `knowledge/` and `templates/` paths are relative to it.

References: `knowledge/research/README.md` (map of methods), `methods.md`, `usability-testing.md`, `metrics-and-roi.md`, `synthesis-and-communication.md`, `ethics-and-inclusion.md`, `knowledge/ia/research-with-ai.md`.

## Doctrine (non-negotiable)

1. **An agent does not generate evidence.** Synthetic personas, simulated answers and "what a user would say" are **hypotheses** — useful to prepare a script and surface scenarios, never to approve a decision, estimate prevalence or prove usability.
2. **Never fabricate** quotes, numbers, participants or results. Without data, write "no data".
3. **Every finding points to the raw source** (session, minute, excerpt). A finding without a trail is an opinion.
4. **Success criterion defined before collecting.** After seeing the data, the bar does not move.

## 1. Start with the decision

Ask: *what decision will this study unlock, and what would change if the answer were X or Y?* If nothing would change, do not research.

Turn it into a research question and choose the method from the table in `knowledge/research/README.md`. Shortcuts:

| I need to know… | Method | Typical sample |
|---|---|---|
| why / how people do it today | in-depth interview | 5–8 per segment |
| whether they can use this screen | moderated usability test | 5 per round, iterate |
| where people expect to find something | tree testing | 50+ |
| how people group content | card sorting | 15–30 |
| how much / how often | survey, analytics | depends on the margin of error |
| which version performs better | A/B test | sample size calculated beforehand (MDE) |
| comparable perceived usability | SUS after tasks | ≥ 12 to compare |

## 2. Plan

Fill in `templates/research-plan.md`: decision, questions, hypotheses, method, recruitment profile and criteria (including people with disabilities when the audience includes them), sample, success criterion, consent and data handling (LGPD), schedule.

## 3. Script

- Usability test: `templates/usability-test-script.md`. Tasks are **scenarios with a goal**, not click instructions. ~~"Clique em Configurações e mude o plano"~~ → "Você quer pagar menos por mês. Veja o que dá para fazer." (pt-BR examples; write tasks in the participants' language)
- Interview: `templates/interview-guide.md`. Ask about **concrete past behavior** ("Tell me about the last time you…"), not opinions about the future ("Would you use…?").
- Neutral follow-up questions: "What did you expect?", "Tell me more about that." Never "That was easy, right?".

An agent can: draft the plan and script, review the questions for bias, simulate a pilot session to check flow and timing **(marking it as a rehearsal)**.

## 4. Synthesize

1. Break notes/transcripts into atomic observations with their origin (`P3, 12:40`).
2. Group by affinity; name themes by the **behavior**, not by the solution.
3. For each finding: how many participants, severity (0–4), evidence (2+ excerpts), confidence.
4. **Triangulate**: check against another source (analytics, support, another method). Divergence is a finding.
5. Play devil's advocate: "What data in this study contradicts this finding?"
6. Only then recommendations, linked to the finding that justifies them.

An agent can: transcribe, fragment, propose groupings and counter-arguments. A human must: validate each finding against the recording and decide priorities.

## 5. Communicate

`templates/findings-report.md`: decision that motivated the study → short answer → 3–5 main findings with evidence → prioritized recommendations → limitations (sample, bias, what you **cannot** conclude).

Numbers from a small sample: report the count ("4 of 5"), not a percentage ("80%").
