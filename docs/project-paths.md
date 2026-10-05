# Project paths and component kits

Every DSX tool that reads a project's artifacts — `tools/ux-lint/audit.mjs`, `variations.mjs`, `preview.mjs`, `measure.mjs`, `findings.mjs`, `ux-md-drift.mjs`, and the capture tools in `tools/capture/` and `tools/stitch/` — resolves paths through one function, `resolveProjectPaths` in `tools/ux-lint/lib/project-paths.mjs`. Nothing in the DSX assumes a product, a module name or a folder layout.

## Precedence

1. **Command-line flag** (`--screens`, `--geometry`, `--map`, `--dir`, `--code`, `--ux`).
2. **Config file**: `--config <file>`, else `$DSX_CONFIG`, else `<root>/.dsx/config.json`, key `paths`.
3. **`paths` block** in the `UX.md` front matter.
4. **Defaults** below; code folders detected from the stack.

The UX.md location itself comes from the flag, the config file or the default (it cannot come from its own front matter). An explicit `--config` outside the project lets you run a read-only audit of a repository you must not change.

Values are relative to the project root. `<module>` (or `{module}`) is replaced by the module id.

| Key | Default | Used by |
|---|---|---|
| `captures` | `.dsx/captures/<module>` | every detector, measure, preview, drift, variations, render, send |
| `geometry` | `.dsx/captures/<module>/geometry` | layout rules (L), drift |
| `map` | `.dsx/maps/flows-<module>.json` | flow rules (F), drift, preview, journeys |
| `findings` | `.dsx/findings` | registry, decision page, variations |
| `variations` | `.dsx/variations` | variations manifests and decisions |
| `ux` | `UX.md` | all |
| `code` (list) | detected | text origin `file:line`, data vs. interface text |

**Code detection.** Each package root — the project root, a conventional front-end folder (`frontend`, `web`, `client`, `app`, `ui`, `www`, `site`) or a monorepo package (`apps/*`, `packages/*`) with a `package.json` — contributes its first existing source folder (`src`, `app`, `pages`, `components`, `lib`). The root also contributes `src`/`app`/`lib` without a `package.json` (non-JS stacks). Folders outside the front end where interface text is born (back-end constants, a vocabulary module) are never guessed: declare them in `paths.code`.

```yaml
# UX.md front matter
paths:
  captures: .dsx/captures/<module>
  code: [web/src, server/strings]
```

```json
// .dsx/config.json (also holds the capture blocklist, see skills/capture-from-code/SKILL.md)
{ "paths": { "captures": "ui/captures/<module>" }, "capture": { "blocklist": ["Real Client Inc"] } }
```

## Legacy locations

Captures written by DSX ≤ 0.7 live in `.stitch/<module>/code` (geometry in `.stitch/<module>/geometry`). When no path is configured and the generic folder has no capture, the legacy folder is used and every tool prints:

```
legacy capture folder .stitch/<module>/code (DSX ≤ 0.7): move the captures to .dsx/captures/<module>/ or declare paths.captures …
```

Geometry follows legacy captures, so an old project keeps working unchanged until it moves. The `STITCH_CAPTURE=1` guard of old capture harnesses is still honored by the capture template (`DSX_CAPTURE=1` is the new name). `.stitch/` itself remains the home of the official Stitch skills' state (`.stitch/DESIGN.md`, `.stitch/designs/`, `.stitch/metadata.json`).

## Component kits

Which button is the primary one, where a dialog footer is, what a card is: roles and HTML cannot say it, the component kit can. `verification.kit` in the UX.md picks a selector profile from `tools/ux-lint/lib/kits.mjs`:

| `kit` | Primary | Destructive | Dialog regions |
|---|---|---|---|
| `generic` | `[data-variant=primary\|solid\|contained]`, `[data-dsx-primary]` | `[data-variant=destructive\|danger]` | `[role=dialog] > header`, `[role=dialog] footer` |
| `mui` | `.MuiButton-contained` | `.MuiButton-containedError`, `.MuiButton-colorError` | `.MuiDialogTitle-root`, `.MuiDialogContent-root`, `.MuiDialogActions-root` |
| `shadcn` | `button[class*="bg-primary"]` | `button[class*="bg-destructive"]` | `[data-slot=dialog-header]`, `[data-slot=dialog-footer]` |
| `chakra` | `.chakra-button[data-variant=solid]` | `.chakra-button[data-color-palette=red]` | `.chakra-modal__header/body/footer`, `.chakra-dialog__…` |
| `antd` | `.ant-btn-primary` | `.ant-btn-dangerous` | `.ant-modal-header/body/footer` |
| `bootstrap` | `.btn-primary` | `.btn-danger`, `.btn-outline-danger` | `.modal-header/body/footer` |
| `auto` (default) | union of all of the above | union | union |

Every profile is layered on the generic one. `auto` keeps the behavior of projects written when MUI was the only built-in profile and works reasonably on any kit; choosing the kit avoids false matches from other kits' class names. Explicit `verification.selectors.primary`, `destructive`, `dialog-footer` and `archetype-regions` always win over the profile.

Still MUI-first (additive hints that do not hurt other kits, roles and HTML are always read too): the inventory of the text checker (`tools/ux-lint/text.mjs`: button variant, helper and alert classes), the states checker's alert classes (`states.mjs`) and the preview runtime (`lib/preview-kit.mjs`, `lib/preview-runtime.mjs`). Moving them to the kit profiles is listed in `docs/decoupling-2026-10.md`.
