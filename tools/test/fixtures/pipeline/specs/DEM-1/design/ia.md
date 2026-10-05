# Information architecture — DEM-1

## Screens

| id | name | route | requirements | states | job |
|---|---|---|---|---|---|
| queue | Pending orders | /orders/pending | R1, R3 | success, empty, loading | find the next order |
| order | Order detail | /orders/:id | R1, R2 | success | decide one order |

## Permissions

- Another cost centre's order is hidden.

## Accessibility

- Focus order: row, heading, approve, reject.
