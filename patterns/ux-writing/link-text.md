---
id: link-text
title: Why avoid "click here" in links?
category: ux-writing
components: [link]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["2.4.4", "2.4.9", "2.5.3", "1.4.1"]
related: [link-vs-button, link-in-new-tab, button-text, keyboard-focus]
---

# Why avoid "click here" in links?

> **Rule:** Link text must convey the destination or purpose on its own; never use "click here", "here" or "read more" as the only clickable text.

## Context

Links lead to another page, section, document or resource. People find them by visual scanning, by keyboard or through the screen reader's links list. If several say only "click here" or "learn more", the destination is lost away from the surrounding sentence.

This rule covers the wording. Choosing between link and button, opening in a new tab, focus and contrast have their own patterns.

A benchmark of 33 e-commerce sites reported insufficient description of the destination on 67% of them; the figure applies to that sample and sector, but shows that the problem is recurrent.

## Decision

- **IF** the link leads to a destination **THEN** name the page, section, file or resource in the text itself ("Read the WCAG 2.2 criteria").
- **IF** the text is "here", "click here" or "read more" on its own **THEN** rewrite it with the informative words inside the link.
- **IF** nearby links lead to different destinations **THEN** use different texts.
- **IF** links have the same function and destination **THEN** use the same text.
- **IF** context is indispensable **THEN** keep it in the same sentence, paragraph, item or cell and associate it programmatically.
- **IF** the link downloads a file or changes context **THEN** state the format and, if relevant, the size ("Download contract (PDF, 2 MB)").
- **IF** the link is only an image or icon **THEN** provide an accessible name that describes the destination.
- **IF** it is navigation **THEN** use a native `<a href>`; **IF** it is an action **THEN** use a button.
- **ELSE** write short text, in sentence case, consistent with the title of the destination page.

## When to use

- Lists of resources, articles, documents and results.
- Cards that repeat the same action for different content.
- Downloads where format or size affects the decision.
- Navigation by keyboard or through a links list.

## When to avoid

- "Click here", "here", "this link" as the only text → **use instead:** the name of the destination.
- "Read more" repeated for different destinations → **use instead:** "Read about <subject>".
- A whole paragraph inside the link → **use instead:** a few informative words.
- A long URL as the label → **use instead:** the name of the resource.
- "Link to…" → **use instead:** the destination directly (the screen reader already announces "link").

## Do

- Name the destination.
- Flag downloads and changes of context.
- Tell repeated links apart by adding the object.
- Test the text in an isolated list of links.

## Avoid

- Relying only on position, color, icon or a neighboring image.
- Hiding the destination.
- Long sentences as link text.

## Accessibility

- WCAG 2.4.4 (A): purpose determinable from the text or from programmatically associated context.
- Test in an isolated list with keyboard and screen reader; if several are announced as "learn more", add the object.
- Do not hide clear visible text behind a different `aria-label` (WCAG 2.5.3).
- An image-only or icon-only link needs an accessible name.
- Visible focus and differentiation beyond color (WCAG 1.4.1) complement this rule.

## Microcopy

| Situation | Example |
|---|---|
| Document | "Read the privacy policy" |
| Download | "Download accessibility report (PDF)" |
| Plans | "Learn more about the business plan" |
| New tab | "Open documentation in a new tab" |

## Verification checklist

- [ ] Does the text convey the destination or purpose?
- [ ] Does the link make sense outside the sentence?
- [ ] Do nearby links with different destinations have different texts?
- [ ] Do links to the same destination use the same text?
- [ ] Does no link use "click here", "here" or "read more" on its own?
- [ ] Are downloads and changes of context flagged?
- [ ] Does the link use `<a>` with a valid `href`?
- [ ] Was the text tested in a links list with a screen reader?

## Rationale

- WCAG 2.2, 2.4.4 (Link Purpose in Context): purpose from the text or associated context.
- GOV.UK Service Manual (writing for interfaces): purpose in the text itself; screen readers list links in isolation.
- Baymard Institute (navigation links in e-commerce): generic texts and context dependence (benchmark of 33 sites).
- Nielsen Norman Group (F-shaped reading pattern): informative words in links support scanning.
- MDN (`<a>` element): native link with `href`.
- Adobe Spectrum and IBM Carbon (Link) and U.S. Web Design System: meaningful, unique text.
