# Design system for AI

## When to consult

- When preparing a design system to be consumed by agents that generate or change interface.
- When defining what an agent may decide on its own, what needs review and what needs approval.
- When designing or governing generative UI (interface assembled dynamically by AI).
- When an agent's output "looks right" visually but is wrong for the context.

## Thesis

Visual consistency is not experience quality. An agent with access only to the library reproduces the product's appearance without understanding the reasons: it uses the right component at the wrong moment, simplifies a necessary step, turns a contextual rule into a universal one. A design system prepared for AI connects **visual language, UX context and governance**, and makes each of these layers findable, updatable and machine-verifiable.

Automation amplifies the structure it receives: an inconsistent system generates inconsistent code faster.

## Four documentation layers (plus governance)

| Layer | Documents | File / location | Serves |
|---|---|---|---|
| Visual language | Tokens, typography, shapes, components, application rationale | `DESIGN.md` + `tokens/` | Agents, design, development |
| Operation | Commands, code architecture, technical conventions, agent limits | `CLAUDE.md` / `AGENTS.md` / tool rules | Coding agents |
| Behavior | Screen types (archetypes), regions, action placement, confirmation, feedback, states, flows, vocabulary, deviations | `UX.md` (companion to `DESIGN.md`; see `knowledge/foundations/ux-md.md`) | Agents, design, development |
| UX context | Users, problems, evidence, mental models, real vocabulary, validated interaction patterns, risks | The project's UX context base (research, personas, JTBD, findings) | Product, design, research, agents |
| Governance (cross-cutting) | Review, accessibility, approval, reversibility, autonomy | Project policy + automated gates | Responsible team |

Rules:

1. **Do not mix layers.** A research decision in the `DESIGN.md` bloats the file and has no support; an experience rule scattered across operational instructions gets lost.
2. **Each layer references the others**, it does not copy them. `CLAUDE.md` points to the `DESIGN.md` and the `UX.md`; the `DESIGN.md` points to the UX context when a visual rule depends on a documented need.
3. **The UX context does not need to be a giant file.** It needs to be findable from the decision it supports.

Example: in an ongoing task of comparing items, an agent with only components picks a confirmation modal because the component exists. With the context recording that people compare before deciding and that the action is reversible, the composition changes: inline confirmation, visible comparison, an undo option. Same pieces, different decision, justified by evidence.

## Machine-readability checklist

An agent can use the system without guessing when:

| Item | How this repo meets it |
|---|---|
| Tokens named by role | Semantic layer (`color.text.*`, `space.stack-*`…) |
| References between tokens, no duplication | DTCG `{…}` aliases resolved and validated by `tools/build-tokens.mjs` |
| Usage description on ambiguous tokens | `$description` (e.g. `color.border.strong`, `size.touch-target`) |
| Explicit composition rules and prohibitions | Components and Do's and Don'ts sections of the `DESIGN.md`; `patterns/` |
| Component catalog with properties, usage contexts and **invalid combinations** | Documentation template in `components.md` |
| States and fallbacks specified | State matrix in `components.md` |
| Measurable accessibility | `tokens/contrast-pairs.json`; matrix in `accessibility.md` |
| Autonomy levels and approval points | Declarative limits table (below), recorded in the project |
| Origin, date and scope of each rule | Traceability record (below) |
| Owner and review routine | `owner`/`updated` in the `DESIGN.md` |
| Automated validation | `build-tokens --check`, `lint-design-md`, `lint-raw-values` |

Formats that help machines: DTCG JSON, front matter YAML, Markdown tables with fixed columns, imperative IF → THEN sentences, numbers with units. Formats that get in the way: images without text, rules implied in examples, unstructured prose, documentation only inside the design tool.

## Declarative autonomy limits

Write down, per project, what the agent **decides on its own**, what it **proposes for review** and what **requires approval** before reaching users. Do not leave it implicit.

| Level | The agent may | Examples |
|---|---|---|
| Autonomous | Execute and report | Compose a screen with existing components and tokens; apply mandatory states; fix drift flagged by the linter; adjust spacing within the scale |
| Review | Implement as a proposal, flagged for human review | New component variant; new semantic token; hierarchy change on an existing screen; new error or confirmation copy |
| Approval | Only propose; do not implement without explicit approval | New component; change to a primitive or brand token; removal/renaming of a token (MAJOR); exception to an accessibility rule; flow involving money, personal data, permissions, external publishing or irreversible action |
| Forbidden | Never | Raw values in UI code; bypassing contrast gates; removing visible focus; automating an irreversible action without confirmation and a recovery path |

IF → THEN:

- **IF** the task fits the catalog and the tokens **THEN** execute (autonomous) and list the tokens/components used.
- **IF** no existing component solves it **THEN** stop and propose (approval); do not create a "temporary" component.
- **IF** the visual rule conflicts with a documented UX need **THEN** the need wins; record the exception and request review.
- **IF** there is no UX context for the decision **THEN** state the assumption explicitly in the result; do not present it as fact.
- **IF** the action affects data or third parties irreversibly **THEN** the interface needs a specific confirmation (action, target, consequence) and recovery.

## Traceability

Every context rule (and every exception) records:

| Field | Example content |
|---|---|
| Rule | "Delete confirmation is inline with undo, not a modal" |
| Origin | Research finding, product decision, legal requirement, incident |
| Evidence | Reference to the study, ticket, test, metric |
| Date | When it was decided |
| Scope | Which flows it applies to; where it does **not** apply |
| Limitations | What the evidence does not cover |
| Owner | Who may change it |
| Review | When to review it, or the condition that invalidates the rule |

Rules:

- A rule without origin is treated as an **assumption**, and the agent must say so when using it.
- AI output (synthesis, synthetic persona, suggestion) is a **hypothesis** until human validation; it never enters the record as evidence.
- When generating interface, the agent lists which context rules it applied. This makes it possible to audit decisions, not just pixels.
- Risks to watch: **semantic misalignment** (right visual, wrong context), **distributed decision-making** (each prompt interprets the brand its own way) and **documentation drift** (research evolves, context ages).

## Generative UI governance

Generative UI is interface created or adapted by AI during use, from intent, context and data. The design system stops being only a library and becomes **governance infrastructure**: it defines what can be assembled, how, and with which quality gates.

### Principles

1. **Outcome before layout.** Specify goal, constraints and quality criteria, not the position of each element.
2. **Controlled freedom.** Approved component catalog, allowed and forbidden combinations, documented rules.
3. **Fixed invariants.** Navigation, identity, legal messages and high-risk actions are not generated; only contextual areas adapt.
4. **Declarative specification, not arbitrary code.** The agent produces a description (component + properties + data) that the system renders with real components. Executing generated code at runtime is a security and consistency risk.
5. **Accessibility in the infrastructure.** Since combinations explode, semantics, focus order and contrast must be guaranteed by the components and validated in the composition.
6. **Always a fallback.** Every generation has a loading state, an error state and a static backup version.

### Maturity levels

| Level | What is generated | Control required |
|---|---|---|
| 1. Contextual controls | Buttons, fields, options inserted into a stable structure | Control catalog; property validation |
| 2. Component composition | Cards, tables, forms, charts assembled from the catalog | Declarative schema; combination rules; post-composition contrast and semantics check |
| 3. Task-specific experience | An entire page or tool (dashboard, simulator) | All of the above + dynamic evaluation, sampled human review, protected invariants |

Start at level 1. Move up a level only with the current level's gates automated.

### When to use and when not to use

- **Use** when there is large variation in context or data combinations, exploratory/analytical work, or when generating removes typing effort.
- **Prefer a fixed interface** for frequent tasks that depend on speed and spatial memory, high-risk operations, regulated environments and simple actions.

### Design flow

1. Define outcomes and success criteria (not screens).
2. Catalog trusted components with rules, contexts, properties and invalid combinations.
3. Design failure states: loading, error, no data, fallback.
4. Evaluate continuously: fit of the format to the task, completeness of information, task completion, consistency across generated variations.

### Automatable gates for generated output

- Zero raw values: `node tools/lint-raw-values.mjs <output>` (drift = 0).
- Only catalog components (declarative schema validation).
- The composition's contrast pairs within the minimums (`tools/contrast.mjs`).
- Mandatory states present for each interactive component.
- Same task run several times: measure the rate of off-system tokens, invented components and missing states. Generative output varies; one run proves nothing.

## Anti-patterns

- Giving the agent only the visual library and expecting correct UX decisions.
- A single "context file" mixing visual, operation and research.
- Rules without origin or date.
- Implicit autonomy: the agent creates components because nobody said it could not.
- Purposeless variability: regenerating something that should be stable, destroying spatial memory.
- Generated UI without fallback, without an error state or without a way to regain control.
- Evaluating generation by a single sample or by appearance alone.
- Treating a synthetic persona or automatic synthesis as evidence.

## Checklist

- [ ] Four layers separated and cross-referenced (visual, behavior, operation, UX context), plus a governance policy.
- [ ] Machine-readability checklist items met.
- [ ] Autonomy table (autonomous / review / approval / forbidden) recorded in the project.
- [ ] Context rules with origin, evidence, date, scope, owner and review.
- [ ] The agent lists the tokens, components and context rules applied in each delivery.
- [ ] Generative UI with catalog, forbidden combinations, invariants, declarative specification and fallback.
- [ ] Automated gates running on generated output, with multiple runs.
