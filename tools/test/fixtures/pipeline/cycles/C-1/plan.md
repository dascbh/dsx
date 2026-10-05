cycle: C-1
state: planned
date: 2026-10-01
size: M
depends: —
objective: approvers decide pending purchase orders in one place

## Threat model

Contained: approvers of other cost centres.
Out of scope: requester notifications.

## Acceptance criteria

- **A1 — Approve end to end.** An approver approves a pending order and it leaves the queue.
- **A2 — Queue reads at a glance (UI · information density).** The queue shows what the approver needs without a wall of text.
  - kind: ui
  - metric: information-density
  - surface: queue
  - state: success
  - viewport: 1440x900
  - register: operational
  - volume: 25 pending orders
  - scenario: approver opens the queue with 25 pending orders
  - baseline: unknown — measure words on the current queue capture before building
  - target: words <= 60
  - counter-metric: approvers still see requester and total without opening the order
  - method: DSX words probe on the capture
  - probe: words
  - sample: one capture per state
  - decision: pass when words <= 60 and the counter-metric holds by expert review
- **A3 — One primary action on the order (UI · action topology).** The order screen has one primary action.
  - kind: ui
  - metric: action-topology
  - surface: order
  - state: success
  - viewport: 1440x900
  - scenario: approver decides one order
  - baseline: 2 primary actions
  - target: primary-actions <= 1
  - counter-metric: reject stays reachable in one step
  - method: DSX primary-actions probe
  - probe: primary-actions
  - sample: the order capture
  - decision: pass when at most one primary action is visible
- **A4 — Fewer steps to approve (UX · interaction effort).** Approving takes fewer steps than today.
  - kind: ux
  - metric: journey-topology
  - population: approvers
  - journey: j-approve
  - scenario: approve the oldest order from the queue
  - baseline: unknown — count steps on the current journey in the flow map
  - target: <= baseline - 20%
  - counter-metric: no rise in wrong approvals
  - method: DSX journey-steps probe
  - probe: journey-steps
  - sample: the declared journey
  - decision: pass when steps fall at least 20% against the measured baseline
- **A5 — Approvers understand reject (UX · cognitive economy).** Approvers predict what reject does.
  - kind: ux
  - metric: cognitive-economy
  - population: approvers new to the tool
  - journey: j-approve
  - scenario: first contact with an order
  - baseline: unknown — first-contact sessions
  - target: >= 4 of 5 predict that reject returns the order
  - counter-metric: time to first decision
  - method: moderated session, 5 participants
  - sample: 5 approvers
  - decision: pass when at least 4 of 5 predict correctly
- **A6 — Tokens only (DS · tokens and kit).** The queue uses semantic tokens and kit components.
  - kind: ds
  - metric: tokens-and-kit
  - surface: queue
  - state: success
  - viewport: 1440x900
  - scenario: changed consumers of the queue
  - baseline: 0 raw values
  - target: <= 0
  - counter-metric: no new kit component without a foundation entry
  - method: lint-raw-values on the changed folders
  - sample: changed files
  - decision: pass when no new raw value
- **A7 — Mobile layout (UI · visual hierarchy alignment).** Not in this cycle.
  - kind: ui
  - metric: visual-hierarchy-alignment
  - not-applicable: desktop-only console in this cycle
- **A8 — Feedback feels instant (UX · expectation/feedback alignment).** Approve shows its result at once.
  - kind: ux
  - metric: expectation-feedback-alignment
  - population: approvers
  - journey: j-approve
  - scenario: approve and watch the queue
  - baseline: unknown — measure in the running build
  - target: <= 1 second
  - counter-metric: no duplicated request on rapid clicks
  - method: synthetic agent run
  - sample: 3 runs
  - decision: pass when the result shows within 1 s

## Failure modes

- **FM1:** the queue hides the total. Detected by A2's counter-metric. Meets A2.

## Demands

| id | layer | depends on | files | what | meets | follows |
|---|---|---|---|---|---|---|
| DEM-1 | front | — | src/orders/** | approval screens, flag orders-approval | A1, A2, A3, A4 | — |
