# Decoupling from the pilot project (2026-10)

The DSX grew inside one product and carried its names, folders, vocabulary and kit into tools, tests, examples and knowledge. The DSX is an open framework: no project may be wired into it. This page records what was found, how each link was cut, and what is still tied to a convention (and why). The rule is now enforced by `tools/test/decoupling.test.mjs`, which fails on known project-specific markers anywhere in the repository except `references/`, this page and `docs/renames-2026-10.md`.

Inventory command (run from the DSX root):

```bash
git grep -niE "<product>|<client>|frontend/src|backend/shared|\.stitch/|<domain words>" -- . ':!references/**'
```

plus manual reading for the kit (MUI as the only built-in), the brand color, screen names and the capture skill. Generic Portuguese words that happen to match (e.g. "contrato de máquina" for a machine contract, "cláusula de proteção" for a guard clause) are not links and were left alone.

## Tools

| File | Link | Now |
|---|---|---|
| `tools/ux-lint/audit.mjs` | default `--screens <root>/.stitch/<m>/code`, `--geometry …/geometry`, `--code frontend/src backend/shared`; "capture" fix named the pilot's skill | `resolveOptions` calls `lib/project-paths.mjs` (flag > `--config`/`.dsx/config.json` > UX.md `paths` > defaults `.dsx/captures/<m>`, stack-detected code); legacy folder read with a warning shown as a prerequisite; fix names `capture-from-code` |
| `tools/ux-lint/variations.mjs` | default code `frontend/src`, `backend/shared`, `src`; registry and decision paths fixed under `.dsx`; comment named the pilot's front-end folder | manifest, registry, decision and code index go through `lib/project-paths.mjs`; `--config` accepted |
| `tools/ux-lint/preview.mjs`, `findings.mjs`, `ux-md-drift.mjs` | default captures `.stitch/<m>/code` | `lib/project-paths.mjs`; `--config` accepted |
| `tools/ux-lint/measure.mjs` | archetype regions, containers, cards and disabled state hardcoded to MUI classes | taken from the kit profile (`lib/kits.mjs`); `--module [--root] [--config]` fills input and output from the project paths |
| `tools/ux-lint/lib/config.mjs` | primary/destructive selectors fixed to `.MuiButton-*` | `verification.kit` (`auto` default = union of mui, shadcn, chakra, antd, bootstrap + generic roles/attributes); explicit selectors win; defaults no longer mutated across calls |
| `tools/ux-lint/consistency.mjs` | dialog footer/title read from MUI classes; comments with domain examples | footer/title from the kit profile or `selectors.dialog-footer`; neutral examples |
| `tools/ux-lint/screen.mjs`, `text.mjs`, `lib/preview-spec.mjs` | example labels from the pilot's domain in finding messages (and the matching exclusion regex) | neutral examples ("Excluir pedido", "Enviar pedido"); regex kept in sync |
| `tools/ux-lint/lib/geometry.mjs`, `lib/glossary.mjs`, `text-page.mjs` | comments with the pilot's screen ids, routes, glossary and product name | neutral examples |
| `tools/ux-lint/lib/glossary.mjs` | glossary tables only recognized with Portuguese "avoid" headers | also "Never call it", "Do not use" (needed by the English example) |
| `tools/ux-lint/audit.mjs`, `findings.mjs`, `text-page.mjs`, `lib/preview-spec.mjs` | default accent `#0E71B8` (the pilot's brand blue) and its dark pair | neutral `#2B59C3` / `#7EA6F2` (contrast still checked by `theme-contrast.test.mjs`); `--color` overrides |
| `tools/lint-ux-md.mjs` | error example route of the pilot; Portuguese-only vague words and number words in the score | neutral route; English vague words and number words added; schema accepts `paths` and `verification.kit`; `<module>` in `paths` is not a placeholder; a declared kit counts as declared primary/destructive selectors |

New, generic: `tools/ux-lint/lib/project-paths.mjs`, `tools/ux-lint/lib/kits.mjs`, `tools/capture/render.mjs`, `tools/capture/validate-flow.mjs`, `tools/stitch/send.mjs`, `tools/stitch/arrange-canvas.mjs`, `tools/stitch/journeys.mjs`, `tools/stitch/lib/stitch-api.mjs`, `tools/stitch/lib/guard.mjs`.

## Tests and fixtures

| File | Link | Now |
|---|---|---|
| `tools/test/ux-lint*.test.mjs`, `ux-audit`, `ux-md-parity`, `lint-ux-md`, `variations` | screens, labels, routes, glossaries and module names of the pilot's contracts module (draft/amendment/clause vocabulary, module ids, tax module names, notification provider name) | fictional "Purchasing" product: orders, proposals, suppliers, catalog, approvals; same cases, same assertions |
| `tools/test/fixtures/variations/` | captures under `.stitch/demo/code/`; recipient/library vocabulary | captures under `.dsx/captures/demo/` (the new default); supplier/catalog vocabulary |
| `tools/test/project-paths.test.mjs` (new) | — | precedence, `--config`/`$DSX_CONFIG`, legacy fallback, stack detection, kit profiles driving T1 on Bootstrap/shadcn markup, UX.md schema |
| `tools/test/capture-tools.test.mjs` (new) | — | blocklist guard, key handling without network, send plan and CLI exit 3, canvas layout, journey page, flow validation, thumbnails, template contract |
| `tools/test/decoupling.test.mjs` (new) | — | repository-wide marker scan |

## Examples, templates, archetypes, knowledge, skills

| File | Link | Now |
|---|---|---|
| `examples/UX.md` | contract-management example mirroring the pilot's module | new English example "Purchasing" (orders, requisitions, suppliers, approvals) with `paths` and `verification.kit: mui`; lint and score tests adapted to English headings |
| `templates/UX.md` | description example from the pilot's domain | neutral example; `paths` and `verification.kit` placeholders |
| `archetypes/*.md`, `archetypes/index.json` | examples and wireframe labels from the pilot (drafts, amendments, clauses, law office, "de acordo") | purchasing examples (orders, catalog items, supplier confirmation); ASCII wireframes kept the same width |
| `knowledge/foundations/generated-text-marks.md`, `ux-md.md`, `ux-findings.md`, `compared-elements.md`, `ux-variations.md`, `interaction-and-feedback.md` | real interface texts and file paths of the pilot | equivalent purchasing texts that keep each rule's point; schema shows `paths` and `kit` |
| `agents/design-system-extractor.md` | the pilot's brand hex and a component name in the example output | neutral values |
| `data/gap-analysis/web-design-rules.json` | named the pilot's capture skill | `capture-from-code` |
| `skills/audit-ux`, `rethink-ux`, `arrange-screen`, `build-ui`, `choose-ds`, `ux-md`, `stitch`, `ux-writing` | the pilot's capture skill and harness folder, `cd frontend`, default folders, a "pilot" section title, manifest example with the pilot's module | `capture-from-code`, `docs/project-paths.md`, "folder with Playwright", neutral manifest example |
| `skills/capture-from-code/` + `templates/capture/` (new) | — | the capture method as a DSX skill (see below) |

## Capture from code is now part of the DSX

The method lived in one project as a skill and a harness. It is now `skills/capture-from-code/SKILL.md` with:

- `templates/capture/serialize.ts` — DOM + CSS serializer for any CSS source that ends up as `<style>` in jsdom (CSS-in-JS incl. emotion "speedy" via CSSOM, CSS modules and Tailwind processed by Vitest, `extraCss` for prebuilt sheets), images and CSS `url()` as data URIs, field values, and the known fixes: tab indicator, whole `main`, textarea height, absolute dialog backdrop/portal, whole dialog. Kit specifics are selector lists in one config block.
- `templates/capture/environment.tsx` — `DSX_CAPTURE` guard (legacy `STITCH_CAPTURE` honored), fake storage, fake fetch with queued answers and `PENDING`, missing-route assertion, dialog wait, `mountPage` with layout route and providers.
- example page/dialog capture, table-driven states capture, Vitest config with CSS processing; names `<nn>-<screen>[.<state>].html`; notes for Vue, Angular, Svelte and no-runner projects.
- Node tools for Stitch (send in journey order, canvas by journey or comparison rows, journey page), with the API key never printed and the real-data blocklist read from the project.

What the pilot could reuse (not changed — the DSX does not edit projects): its `serialize.ts` and `environment.tsx` map one-to-one to the templates (its theme-option output folder becomes `saveCapture(…, { subdir: 'options/<name>' })`); its shell bash/Python scripts are covered by `tools/stitch/send.mjs` (`--order` reads its `capture-order.json` as is and keeps `stitch-screens.json` next to `code/`), `arrange-canvas.mjs` (`--map` for journeys, `--rows` for its design-system comparison), `journeys.mjs` (reads its existing `<id>.thumb.png`) and `tools/capture/validate-flow.mjs` (approves its flow map: 168/168 evidence checked). Its client-name check moves to `capture.blocklist-file` in its own `.dsx/config.json`. Declaring `paths.captures: .stitch/<module>/code` and `paths.code: [frontend/src, backend/shared]` there silences the legacy warning and restores the back-end text origin.

## Still tied to a convention, and why

- **MUI-first hints in the text, states and preview code** (`text.mjs` variant/helper/alert classes, `states.mjs` alert classes, `lib/preview-kit.mjs`, `lib/preview-runtime.mjs`). They are additive: roles and HTML are read too, so other kits are analyzed, with less detail (button variant, alert severity, helper text). Moving them into `lib/kits.mjs` touches the preview runtime and the variations page that another work front is changing; it is the next step.
- **Interface-language heuristics** in the text checker (verb lists, title case, generated-text marks): the detectors judge the product's interface text through a language pack (`tools/ux-lint/lib/lang/{pt-BR,en}.mjs`), chosen by `content.language` in `UX.md`; the default stays `pt-BR` so existing results do not change. DSX's own language is English (DSX 0.9.0).
- **`.stitch/`** remains the state folder of the official Stitch skills (`.stitch/DESIGN.md`, `designs/`, `metadata.json`, `reviews/`); only captures moved out of it.
- **`.dsx/maps/flows-<module>.json`, `.dsx/findings`, `.dsx/variations`** stay DSX-only artifacts with defaults; the Forward bridge for them is another work front (`docs/forward-compat.md`).
- **Chakra and shadcn profiles** rely on class/attribute conventions that projects customize; they are documented as best effort and overridable per project.
