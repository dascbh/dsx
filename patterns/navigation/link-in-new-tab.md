---
id: link-in-new-tab
title: Should links open in a new tab?
category: navigation
components: [link, external-link-icon]
type: contextual-decision
impact: medium
status: caution
evidence: strong
wcag: ["2.4.4", "3.2.5", "3.2.2", "1.4.1"]
related: [link-vs-button, link-text, main-navigation, breadcrumbs]
---

# Should links open in a new tab?

> **Rule:** By default, open links in the same tab; reserve a new tab for protecting a task in progress and always say so in the link itself.

## Context

A normal link takes the person to the destination in the same tab, and they count on the Back button. Forcing a new tab changes the browsing context and that tab's history, which disorients when it happens without warning.

The decision is useful when the person needs to look something up externally without losing what they already filled in. Otherwise it is an imposition by the site: the browser already lets the person choose a new tab with Ctrl or Command, or through the context menu.

Screen readers may not announce the change, and the new tab can be mistaken for the original page.

## Decision

- **IF** there is no need to keep the current page **THEN** open in the same tab.
- **IF** leaving the page would lose data from a task in progress **THEN** open in a new tab.
- **IF** the person needs to consult an external reference without interrupting the flow **THEN** a new tab is acceptable.
- **IF** it opens in a new tab **THEN** say so in the link text ("opens in a new tab") or in the accessible name.
- **IF** you use an external link icon **THEN** treat it as reinforcement, never as the only warning.
- **IF** you use `target="_blank"` **THEN** include `rel="noopener noreferrer"`, according to the project's policy.
- **IF** the link is in a menu, breadcrumb, search result or footer **THEN** never force a new tab.
- **ELSE** the same tab.

## When to use

- A task in progress would lose data on leaving.
- A reference, document or tool that complements the current work.
- The context already signals an independent surface.

## When to avoid

- Ordinary navigation between pages of the same site → **use instead:** the same tab.
- External links opened in new tabs as a marketing preference → **use instead:** the same tab.
- A link inside an unfinished form with no saving → **use instead:** a new tab with a warning, or save a draft.
- A warning only in a tooltip, icon or color → **use instead:** a warning in the text.

## Do

- Write the destination in the link text.
- Keep the warning in the accessible name.
- Test returning to the flow after closing the new tab.
- Review the security of each `target="_blank"`.

## Avoid

- Forcing a new tab on every external link.
- Using "click here" or "learn more".
- Hiding the warning in a tooltip.
- Relying only on the icon.

## Accessibility

- The link's purpose must be determinable from its text or context (2.4.4).
- Opening a new tab is a change of context; criterion 3.2.5 (AAA) asks that it happen on request or can be turned off.
- The warning must be available by keyboard, screen reader and links list.
- A visually hidden warning stays in the accessible name without replacing the visible destination.
- Do not rely only on color or icon to signal it (1.4.1).

## Microcopy

| Situation | Example |
|---|---|
| Link with warning | "Read the user manual (opens in a new tab)" |
| External document | "Partner terms (opens in a new tab)" |
| Ordinary link | "Back to orders" |
| Avoid | "Click here" |

## Verification checklist

- [ ] The link opens in the same tab by default.
- [ ] There is a concrete reason for a new tab.
- [ ] The warning appears before activation.
- [ ] The text states the destination.
- [ ] The warning is part of the accessible name.
- [ ] The external icon is only reinforcement.
- [ ] The link is understandable in a links list.
- [ ] `target="_blank"` comes with `rel="noopener noreferrer"`.
- [ ] Returning to the flow was tested.

## Rationale

- WCAG 2.2: 2.4.4 (Link Purpose) and 3.2.5 (Change on Request, AAA).
- W3C WAI technique H83: indicate a new window in the link text.
- GitHub Primer (Links and buttons): do not force a new tab.
- Microsoft Fluent 2 (Link): advance warning and an external-opening icon.
- Adobe Spectrum (Link): the text communicates the destination.
- MDN Web Docs (rel noopener): window.opener protection.
