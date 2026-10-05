---
version: 1.4.0
format: alpha
name: Purchasing
description: Web app for purchase orders, suppliers and approvals of a mid-size manufacturer (fictional), desktop, high density, used every day by the procurement team.
owner: purchasing-product-team
updated: 2026-10-02
product:
  persona: Buyer who turns requisitions into purchase orders, chases supplier confirmations and keeps 600 open orders on schedule
  register: operational
  platform: desktop
  density: high
navigation:
  model: "side menu by area + tabs on the detail page"
  max-depth: 3
  back: mandatory
archetypes:
  monitoring-dashboard: ["/home"]
  operational-list: ["/orders", "/requisitions"]
  detail-side-panel: ["/orders (supplier panel)"]
  master-detail: ["/suppliers"]
  document-viewer: ["/orders/:id/document"]
  editor-with-panel: ["/orders/:id/edit"]
  step-wizard: ["/orders/new"]
  library: ["/catalog"]
  settings: ["/settings"]
  public-decision-page: ["/confirm/:token"]
  form-dialog: ["Record delivery", "Add approver"]
  confirmation-dialog: ["Cancel order", "Discard draft"]
actions:
  primary-per-region: 1
  primary-position: top-right
  dialog-order: cancel-action
  destructive-specific-label: true
confirmation:
  irreversible: type-name
  reversible: undo
feedback:
  success: toast
  field-error: inline
  system-error: page-alert
  skeleton-after-ms: 1000
states: [loading, empty, empty-filtered, error, no-access, success]
forms:
  label: always-visible
  validation: on-blur
  required: mark-optional
content:
  glossary: inline                # table in "Content & Microcopy"; per module: { default: <file>, <module>: <file> }
  buttons: verb-object
  forbidden: [tenant, payload, job, status_code, null, ERP_ID]
flows:
  max-journey-steps: 10
  max-stacked-dialogs: 1
  dead-ends: 0
# Where the tools find this product's artifacts (docs/project-paths.md). Omitted keys use the DSX defaults.
paths:
  captures: .dsx/captures/<module>
  code: [web/src]
verification:
  kit: mui                        # component kit profile: auto | generic | mui | shadcn | chakra | antd | bootstrap
  selectors:
    regions: ["header", "nav", "aside", "main", "[role=dialog]"]
    dialog: "[role=dialog]"
    button: "button, [role=button]"
    field: "input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select"
# Accepted deviations (section "Screen Archetypes"). A finding of a rule in `rules` on a screen in `screens`
# becomes accepted-deviation in the findings registry; empty rules = documentation-only deviation.
deviations:
  - id: D1
    screens: [home]
    rules: [L9]
    reason: "Dashboard without charts: each block is a short clickable queue, because the question is what to do today"
    decided-by: "purchasing-product-team"
  - id: D2
    screens: [requisitions]
    rules: []
    reason: "List grouped by cost center with a subtotal in the group header"
    decided-by: "purchasing-product-team"
  - id: D3
    screens: [order-edit]
    rules: []
    reason: "Panel opens on Changes since approval, not on Properties"
    decided-by: "finance"
    until: 2027-06-30
---

# Purchasing — UX

Fictional product, used as the reference example of the format. The decisions below came from the code (maps in `.dsx/maps/`), from 6 interviews with buyers and from the first-half support log; whatever was deduced without direct evidence is marked "(inferred)". On conflict, the more restrictive behavior wins (confirmation, visible way back) until the next review. The product's interface text is in English; a product in another language writes its labels in that language and keeps this structure.

## Overview

Purchasing is the procurement team's workbench: 8 buyers and 2 approvers spend the day in it on 24" monitors, following what is late, what needs approval and what a supplier has not confirmed yet. People open it to answer "what do I need to unblock today?" and close it when the day's queue is empty.

Suppliers only touch the product through the public confirmation page, without signing in.

Purchasing **never** sends an order, cancels an order or changes a price without a person confirming on screen, and **never** sends anything to a supplier without first showing the exact text the supplier will receive.

## Personas & Tasks

| Persona | Task | Frequency | Critical error |
|---|---|---|---|
| Buyer | Turn approved requisitions into purchase orders | Daily, 15–30 items | Ordering from a supplier with an expired price list |
| Buyer | Chase unconfirmed orders older than 3 days | Daily | Missing a delivery date the plant depends on |
| Approver | Approve orders above the spending limit | 10–20 per week | Approving a changed quantity without noticing the change |
| Procurement manager | Review spend by supplier and late deliveries | Weekly | Deciding with stale numbers |
| Supplier (external) | Confirm or reject an order and its delivery date | Once per order | Confirming without seeing the final quantity |

## Information Architecture

Four areas in the side menu, with these exact names: **Home**, **Orders**, **Requisitions**, **Suppliers**. Below a divider: **Catalog** and **Settings**.

- **Home** is the entry point: what is late, what is waiting for approval and what is waiting for the person.
- **Orders** is the work list; each order opens in a detail page with the tabs *Summary*, *Document*, *Deliveries*, *History*.
- **Requisitions** is its own queue because the work is batched by cost center and week.
- **Suppliers** groups orders by supplier; the supplier detail never edits an order, it only links to it.
- **Catalog** keeps the approved items and their price lists.

The order number (e.g. PO-2026-0412) is the identifier shown on every screen; the internal ERP code never appears.

## Navigation

Fixed side menu, always visible, with the current area marked. On the detail page, the breadcrumb "Orders › PO-2026-0412" at the top and the tabs right below the title. Maximum depth 3: area → detail → tab or editor. The order editor is the deepest level and has a "Back to order" button in its header.

List filters live in the URL (pattern `applying-filters`): coming back from the detail restores the list with the same filters and page, and highlights the row the person left for 2 s.

## Screen Archetypes

| Screen | Archetype | Variation | Deviation |
|---|---|---|---|
| `/home` | monitoring-dashboard | three queue blocks with counts | D1 |
| `/orders` | operational-list | with-bulk-actions | — |
| `/requisitions` | operational-list | with-bulk-actions | D2 |
| supplier panel on `/orders` | detail-side-panel | — | — |
| `/suppliers` | master-detail | list on the left | — |
| `/orders/:id/document` | document-viewer | metadata on the right | — |
| `/orders/:id/edit` | editor-with-panel | changes panel | D3 |
| `/orders/new` | step-wizard | 4 steps | — |
| `/catalog` | library | — | — |
| `/settings` | settings | — | — |
| `/confirm/:token` | public-decision-page | — | — |
| "Record delivery", "Add approver" | form-dialog | — | — |
| "Cancel order", "Discard draft" | confirmation-dialog | type the order number | — |

Each archetype in the middle column is a DSX card `archetypes/<id>.md`; the deviations apply only to Purchasing and are also in the `deviations` block of the front matter, which is what the ux-lint reads.

### Declared deviations

| # | Screen | Deviation | Reason |
|---|---|---|---|
| D1 | `/home` (`home`) | No charts and no indicator region from the card | The screen's question is "what to do", not "how it is going"; each block is a short clickable queue |
| D2 | `/requisitions` (`requisitions`) | Grouped by cost center with a subtotal in the group header | The work is batched by cost center and week |
| D3 | `/orders/:id/edit` (`order-edit`) | The panel opens on "Changes since approval", not on "Properties" | The approver decides by looking at what changed; valid until 2027-06-30, when the comparison becomes its own tab |

## Layout & Regions

- **Product header** (56 px): logo, global search by order number or supplier name, avatar. No page actions here.
- **Side menu** (240 px, collapses to 64 px): the six areas.
- **Page header**: breadcrumb, title (the only `h1`), short metadata (status, delivery date) and the primary action on the right.
- **Content**: list, document or editor.
- **Side panel** (420 px, over the content, without dimming the page): quick detail without leaving the list; closes with Esc and returns focus to the row.

## Actions

- One primary action (filled button) per region, in the top-right corner of the page header: "New order", "Create orders from selected", "Approve order" (patterns `action-placement` and `button-hierarchy`).
- Secondary actions as outlined buttons next to the primary, at most two; the rest goes into the "More actions" menu.
- Row actions appear as icons with an accessible name and a tooltip; at most three per row.
- Destructive actions with a specific label: "Cancel order", "Discard draft". Never "Confirm", "OK" or "Yes" (patterns `destructive-action` and `confirm-deletion`).
- An action the person cannot run because of permissions is **hidden**; an action they will be able to run after meeting a condition is **visible and disabled with the reason next to it** ("Approve order — waiting for the budget check"; pattern `disabled-button`).

## Feedback & States

- Success: 6 s toast saying what happened and, when reversible, "Undo" ("12 orders created. Undo"; patterns `toast-vs-inline-alert`, `toast-duration` and `undo`).
- Field error: below the field, on blur. System error: alert at the top of the content, with "Try again" and what was already saved.
- Loading: a skeleton shaped like the screen when the wait passes 1 s; before that, nothing (pattern `skeleton-vs-spinner`).
- Empty: says why it is empty and offers the next step. A list empty because of a filter has "Clear filters", never the first-use invitation (patterns `empty-state` and `no-search-results`).
- No access: page with the area name, the reason and who grants access.

| Screen type | Empty | Error |
|---|---|---|
| Operational list | "No orders are late this week." | Alert above the table; the previous table stays visible |
| Editor with panel | Not applicable (there is always an order) | Alert in the header; typed changes are never discarded |
| Public decision page | — | Page with the contact of the responsible buyer |

## Forms

- Label always visible above the field; the example goes in the helper text, never only in the placeholder (pattern `label-vs-placeholder`).
- Almost every field is required, so the **optional** ones are marked (pattern `required-fields`).
- Up to 5 fields and one decision: dialog ("Record delivery"; pattern `when-to-use-modal`). More than that, or steps that depend on each other: page or wizard ("New order").
- Amounts with the currency mask and two decimals; dates as yyyy-mm-dd with an optional calendar.
- The submit button is never disabled to prevent errors: on click with pending issues, focus moves to the first field with a problem.

## Content & Microcopy

- Glossary: the table below (`content.glossary: inline`). "Order", "requisition", "supplier", "approval" and "delivery" have one meaning each.

| Term | Meaning | Never call it |
|---|---|---|
| Order | Purchase order sent to one supplier | "PO request", "ticket" |
| Requisition | Internal request that becomes one or more orders | "demand", "request form" |
| Supplier | Company that sells to us | "vendor account", "partner" |
| Approval | Sign-off of an order above the spending limit | "authorization", "sign-off form" |
| Delivery | Goods received against an order line | "arrival", "receipt event" |
| Confirmation | Supplier's acceptance of an order, on the public page | "acknowledgement", "signature" |
| Catalog | Approved items with their price lists | "inventory", "products" |
| Status | Stage of the order (draft, sent, confirmed, delivered) | "state" |
- Buttons with verb + object: "Create order", "Send to supplier", "Approve order".
- Implementation terms never appear: tenant, payload, job, status_code, null, ERP_ID.
- Direct tone, implicit second person: "Check the final quantity before sending."
- Error formula: what happened + what to do ("Couldn't send the order: the supplier has no email. Add one in the Suppliers area.").
- Destructive confirmation formula: consequence + what does not come back ("Order PO-2026-0412 will stop being sent to the supplier. This can't be undone.").

## Flows

| Journey | Start → end | Steps | Channel switch |
|---|---|---|---|
| Chase a late order | Home → order → send reminder | 5 | Email to the supplier with a link to `/confirm/:token` |
| Batch orders | Requisitions → select → create orders → review | 4 | — |
| Approval | Order → approval request → approver review → approved | 8 | Notification to the approver |
| New order | Orders → wizard (4 steps) → order created | 6 | — |

Limits: no journey goes past 10 steps; never more than one dialog open; zero dead ends — the supplier confirmation ends on a page that says what happens next and whom to contact.

## Do's and Don'ts

### Do

- Restore the list with filters, page and origin row when coming back from the detail — 3 support tickets per week asked for this before the change.
- Show the old price, the catalog price and the new total side by side before creating orders in the "Create orders from selected" dialog.
- Open the order editor (`/orders/:id/edit`) with the changes since approval in view; the approver decides by looking at what changed.
- Use the order number as the detail title and in the breadcrumb.

### Don't

- Don't use a confirmation dialog for a reversible action; offer "Undo" in the toast. The old "Archive" dialog was confirmed without reading.
- Don't stack a dialog on a dialog: "Add approver" from inside "Record delivery" made people lose the delivery they had typed.
- Don't show the ERP code (`ERP_ID`) or the technical integration status on the buyer's screen.
- Don't hide the "Approve order" button when a condition is missing; keep it visible, disabled, with the reason.

## Agent Instructions

- Read this file before creating or rearranging any Purchasing screen; find the screen's archetype in "Screen Archetypes" and read the matching card.
- Preserve: one primary per region in the top right, side menu with the six areas, filters in the URL, a visible way back on every non-root screen.
- A new screen without an archetype in the table: propose the archetype and add the row before building.
- UI behavior changed (screen, archetype, policy, flow, state): update this file in the same commit, bump `version` (policy or archetype → minor; text only → patch) and `updated`.
- Validate with `node <DSX>/tools/lint-ux-md.mjs UX.md --score` (with `--map` and `--screens`) and `node <DSX>/tools/ux-lint/ux-md-drift.mjs UX.md`, and run the screen and flow ux-lint on the captures; a severity 3 or 4 finding blocks the delivery.
