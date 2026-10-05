# UX/UI foundations

> **When to consult**
> - Before designing, building or reviewing any screen, flow or interface text.
> - To choose which file to load: read the table below and load only what the task calls for.
> - The foundations give the **why** and the general rules; the pattern cards in `../../patterns/` give the concrete solution for each recurring situation.

## Files

| File | Content | Load when |
|---|---|---|
| [nielsen-heuristics.md](nielsen-heuristics.md) | The 10 heuristics with violation signals, audit questions and fixes; 0–4 severity scale | Reviewing any interface or rating how severe a finding is |
| [usability-evaluation.md](usability-evaluation.md) | Heuristic evaluation process, cognitive walkthrough (4 questions), inspection vs. testing, report template | Running a formal review, simulating a novice or writing a findings report |
| [psychology-and-laws.md](psychology-and-laws.md) | Cognitive load, Fitts, Hick, Gestalt, affordances and signifiers, mental models, biases (framing, confirmation, kill your darlings) | Deciding how many options, target size and position, groupings, or justifying why something confuses |
| [visual-hierarchy.md](visual-hierarchy.md) | Hierarchy levers, numeric rules (type, space, contrast), scanning patterns, density, blur test | Building a layout, defining the type/spacing scale, or when "everything looks the same" |
| [interaction-and-feedback.md](interaction-and-feedback.md) | Interaction specification, 0.1/1/10 s thresholds, feedback, microinteractions and durations, empty states, onboarding | Specifying control behavior, loading, animations, empty states or first use |
| [ux-writing.md](ux-writing.md) | Principles, formulas (button, error, empty, confirmation, success), tone of voice in 4 dimensions, pt-BR style, glossary | Writing or reviewing any visible text |
| [generated-text-marks.md](generated-text-marks.md) | Marks that make text look AI-generated or bureaucratic (dash, compound title, description that repeats the title, empty opener, title case, technical jargon…), with before/after and rules X1–X11 of `tools/ux-lint/text.mjs` | Reviewing agent-written text, reading the `text.mjs` report or explaining why a screen "looks AI-made" |
| [ux-findings.md](ux-findings.md) | Contract of the UX findings registry (`.dsx/findings/<module>/`): stable id, `findings.json`/`options.json`/`decisions.json`, computed status (open, decided, ignored, fixed, regression) and the no-regression lock | After running `text.mjs`/`screen.mjs`/`flow.mjs`; to know what is open, decided, fixed or came back; when wiring `findings.mjs check` into CI |
| [ux-variations.md](ux-variations.md) | Screen and flow variations: axes (structure, flow split, interaction model, density and text, validation timing, confirmation × undo, foreground × background), how to generate genuine alternatives, hypothesis and trade-off, traps | Rethinking a screen or a flow (skill `rethink-ux`); judging whether alternatives are really different |
| [ux-dimensions.md](ux-dimensions.md) | The 14 UX audit dimensions (text, actions, layout, hierarchy, IA, navigation, flows, forms, states, consistency, accessibility, heuristics, cognitive laws, dark patterns): question, rules, how it is verified, gaps; gaps coming from other sources | When running `tools/ux-lint/audit.mjs` or the skill `audit-ux`; to know what the machine measures and what is judgment |
| [forms.md](forms.md) | Structure, order, labels, field types, mobile keyboards and autocomplete, validation, errors, steps, submission | Creating or reviewing any form |
| [information-architecture.md](information-architecture.md) | IA systems, where something should live, navigation, labeling, findability and search, user flow, wireframe/prototype fidelity | Deciding structure, navigation and names; drawing a flow; choosing fidelity |
| [dark-patterns.md](dark-patterns.md) | Catalog (name, recognition, harm, alternative) and red lines the agent must refuse | Any purchase, subscription, cancellation or consent flow, or a request to "increase conversion" |
| [ux-md.md](ux-md.md) | The `UX.md` contract: front matter schema, 13 sections, screen archetypes and verification rules T1–T7/F1–F5 | Creating, extracting or evaluating the `UX.md`; before building or rearranging a screen in a project that has one |
| [ux-sources.md](ux-sources.md) | External UX sources (CamaraUX, GOV.UK, Carbon, Material, NN/g, UX laws…), what each offers and how to use them without copying | Looking for ideas or gaps for patterns and archetypes; before citing or bringing in outside content |
| [compared-elements.md](compared-elements.md) | Buttons, field labels, tooltips, titles, descriptions and messages compared across Material 3, Carbon, Polaris, GOV.UK, Atlassian and Apple HIG, with the DSX default | Choosing the text, position or use of an element when more than one convention exists; labeling options in a text survey |
| [product-pipeline-ux.md](product-pipeline-ux.md) | How the DSX implements the UI/UX part of Forward's unified product pipeline: the probes, measures and pages it adds | Working on a Forward product pipeline cycle that touches UI/UX |
| [trends.md](trends.md) | Signals and hypotheses for 2027 (agentic AI, generative interfaces, trust) | Direction discussions; AI products. Never as a source of rules |

## Suggested order by task type

- **Review a screen:** nielsen-heuristics → visual-hierarchy → ux-writing → (forms, if any) → dark-patterns.
- **Design a new feature:** information-architecture (flow and place) → psychology-and-laws → visual-hierarchy → interaction-and-feedback → ux-writing.
- **Formal audit with report:** usability-evaluation + nielsen-heuristics.
- **Design/rearrange a screen:** ux-md (archetype and policies from the project's `UX.md`) → visual-hierarchy → interaction-and-feedback → forms (if any) → ux-writing; skill `arrange-screen`.
- **Rethink a screen or flow (variations):** ux-variations → psychology-and-laws → information-architecture → interaction-and-feedback → ux-writing; skill `rethink-ux`.
- **Text only:** ux-writing → generated-text-marks (with the `tools/ux-lint/text.mjs` report).
- **Monetization, consent, retention:** dark-patterns first.

## Conventions of these files

- Each file opens with "When to consult" and closes with "Audit checklist".
- Rules are imperative; decisions appear as **IF → THEN**; numbers are practical thresholds, not laws.
- Severity always on the 0–4 scale of [nielsen-heuristics.md](nielsen-heuristics.md).
- Accessibility is integrated throughout, but WCAG conformance requires a dedicated audit.
