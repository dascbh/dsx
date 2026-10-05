# External UX sources

> **When to consult**
> - When creating or reviewing an `archetypes/` card, a `patterns/` pattern or a foundation, and you want to check for gaps or ideas in recognized references.
> - When someone asks to "use what site X says" or to paste an excerpt from an external reference into the DSX.
> - When citing the origin of an idea in a report, a skill or a `UX.md`.

The DSX learns from public UX references, but **writes everything in its own words**. The sources below are for reading, comparing and citing with credit; none of them is text to paste. This is the only file in `knowledge/` that lists source URLs: in `patterns/` and `archetypes/` no URL is cited (the pattern linter blocks it).

## Sources

| Source | What it does best | How the DSX uses it | Permitted use |
|---|---|---|---|
| CamaraUX — [camaraux.com.br](https://camaraux.com.br) | UX patterns and articles in pt-BR, with vocabulary close to the Brazilian audience | Checking whether a pattern or archetype covers the cases the community discusses; inspiring pt-BR examples | The terms of use **forbid reproduction**. Only short quotation with credit and link, outside `patterns/` and `archetypes/` |
| web design rules and guidelines — [github.com/abbas-roholamin/web-design-rules-and-guidelines](https://github.com/abbas-roholamin/web-design-rules-and-guidelines) | Compact list of practical rules for layout, typography, forms and buttons | Gap check: a rule that appears there and is missing in the DSX becomes a candidate, written from scratch with an IF → THEN criterion | **No license** declared = all rights reserved. No copying, not even adapted |
| UX laws (Hick, Fitts, Miller, Jakob, proximity and the like) | Named principles from cognitive psychology, useful to justify decisions | Grounding rules in `psychology-and-laws.md` and the "why" of cards and patterns | The concepts are common knowledge; the texts and illustrations of sites that compile them are not. Explain in your own words |
| GOV.UK Design System — [design-system.service.gov.uk](https://design-system.service.gov.uk) | **Page** and service patterns tested with real people (one thing per page, confirmation page, check answers) | Main reference for public-flow archetypes (`public-decision-page`, `step-wizard`) and for direct text | Content under an open license with attribution (Open Government Licence). Even so, the DSX rewrites: the context and the language are different |
| Carbon Design System — [carbondesignsystem.com](https://carbondesignsystem.com) | Usage guidelines for dense operational products: data tables, filters, notifications, empty states | Reference for operational archetypes (`operational-list`, `master-detail`, `detail-side-panel`) and density | Code under an open license; the guideline texts are not for copying. Own wording |
| Material Design — [m3.material.io](https://m3.material.io) | Component and adaptive layout guidelines (width classes, panes, navigation by screen size) | Reference for platform variations (e.g. cards on mobile) and adaptive regions | Treat the text as protected; use the idea, not the sentence |
| Nielsen Norman Group — [nngroup.com](https://www.nngroup.com) | Heuristics, cognitive walkthrough, research on reading patterns and forms | Basis of `nielsen-heuristics.md` and `usability-evaluation.md`; 0–4 severity | Articles protected by copyright. Consolidated knowledge, always rewritten |

## How to use a source

1. **Read to understand, close it, write.** Write the DSX rule without the source text open beside you. If the sentence came out the same, rewrite it.
2. **Bring the criterion, not the sentence.** The DSX wants IF → THEN, a number or a verifiable position. A source that says "be clear" does not become a rule; it becomes a question: clear measured how?
3. **Confront it with the context.** GOV.UK writes for citizens using a public service; Carbon for corporate operators. IF the source and the product's register diverge → THEN the register wins (`knowledge/design-system/choosing-a-design-system.md`).
4. **Two sources disagree?** Record the disagreement and decide by the DSX principle (`docs/principles.md`): loss prevention and accessibility beat convenience.
5. **Credit when you quote.** In a report or discussion, cite the source name and link. In `patterns/` and `archetypes/`, don't: there the text belongs to the DSX.

## What NOT to do

- Do not copy or translate excerpts, lists or examples from any source into the DSX, not even "lightly adapted".
- Do not reproduce the structure of someone else's page item by item (same order, same examples): that is copying in other words.
- Do not paste an image, diagram or screenshot from an external site into `knowledge/`, `patterns/` or `archetypes/`.
- Do not cite a URL in `patterns/` or in `archetypes/`.
- Do not treat a source as law: it is evidence to confront with the product and, when the cost of error is high, with testing (skill `research`).
- Third-party content whose license allows copying goes into `references/`, unchanged and with the required credit, generated by `tools/references.mjs`; never mixed into the DSX text.

## Checklist

- [ ] The new rule was written without the source text open and does not repeat its sentences.
- [ ] It has a verifiable criterion (IF → THEN, number, position), not just a recommendation.
- [ ] It was confronted with the product's register and with `docs/principles.md`.
- [ ] No URL in `patterns/` or `archetypes/`; credit with link only in reports and in this file.
