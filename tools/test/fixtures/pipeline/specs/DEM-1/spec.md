# DEM-1 — Approve purchase orders

cycle: C-1
layer: front
meets: A2, A3, A4

- R1 WHEN an approver opens a pending order, the system MUST let them approve it.
- R2 WHEN an approver rejects without a reason, the system MUST ask for one and keep typed text.
- R3 WHEN no order is pending, the system MUST say what happens next.
