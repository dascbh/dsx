# Intended model — DEM-1

## What this is

A place to approve purchase orders waiting for me.

## Actors and jobs

| actor | job | frequency | permissions |
|---|---|---|---|
| approver | approve or reject a pending order | daily | own cost centre |

## Primary actions and consequences

| action | consequence |
|---|---|
| approve order | the order leaves the queue |

## Acceptance scenarios

| id | requirement | scenario | screens | verified by |
|---|---|---|---|---|
| S1 | R1 | approver approves the oldest order | queue, order | evals/journeys/DEM-1/approve.journey.toml |
| S2 | R2 | approver rejects without a reason | order | |
| S3 | R3 | the queue is empty | queue | capture queue.empty |
