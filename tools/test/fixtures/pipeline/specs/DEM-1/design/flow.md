# Flow — DEM-1

## Flow

```mermaid
flowchart LR
  queue[Pending orders] -->|open order| order[Order detail]
  order -->|approve| done((Approved))
  order -->|reject| reason{Reason given?}
  reason -->|yes| queue
  order -->|history| queue
```

## Decisions

- Reason given? A rejection without a reason stays on the order.

## Feedback

- Approve confirms in place.

## Errors

- Save fails and keeps the typed reason.

## Empty and loading

- Empty queue says when orders arrive.

## Abandon and resume

- A typed reason is kept as a draft.
