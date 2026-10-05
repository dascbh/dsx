---
name: design-lab
description: "Works with several DESIGN.md files at once: keeps candidate options next to the official one, creates them from a curated reference, from a file or as a variant of the current one changing a few values, compares them on the product's real screens in a static page (no server) and switches them live in the app in development, both through the same DESIGN.md → theme adapter (MUI, CSS variables, Tailwind); promotes the chosen one to the official DESIGN.md only through the gates. Use to test several DESIGN.md, try a denser or recolored variant, alternate between design directions, or set up the live theme switcher in a project."
argument-hint: "list | add <name> … | use <name> | compare <a> <b> … | promote <name> | adopt"
---

# Design lab: several DESIGN.md, one active, the same adapter in both modes

> **DSX root:** two levels above this skill's folder. `templates/`, `tools/`, `references/`, `docs/` are relative to it; paths without a prefix (`DESIGN.md`, `.dsx/`, `src/`) belong to the project.

**Why a separate skill.** `choose-ds` decides *which* direction to follow from the curated catalog and `design-md` writes and evaluates *the* file; both need the same machinery to try several candidates on real screens and switch between them. That machinery (where options live, the active pointer, the comparison page, the theme adapters, the live switcher, promote with gates) is this skill. `choose-ds` step 4 and `design-md`'s promote both route here.

## Where things live

| What | Default | Configure in `.dsx/config.json` |
|---|---|---|
| Official file | `DESIGN.md` | `design.official` |
| Options (one DESIGN.md per file) | `.dsx/design-options/<name>.md` | `design.options_dir` |
| Active option (pointer; the official file never changes until `promote`) | none | `design.active` (written by `use`) |
| Copies kept by `promote` | `.dsx/design-options/previous-<date>.md` | follows `options_dir` |
| Manifest for the live switcher | not written | `design.manifest`, e.g. `web/src/dev/design-lab/options.json` |
| DESIGN.md × theme gate run after `promote` | none | `design.theme_gate`, e.g. `cd web && npx vitest run tests/design-md.test.ts` |
| Capture command (static mode) | none | `capture.command`, `capture.cwd`, `capture.module` |
| Where the harness writes an option's captures | `<paths.captures>/options/<option>` | `capture.option_output` (`<module>`, `<option>` placeholders) |
| Rendered comparison images | `.dsx/captures/<module>/options/<option>/` | `design.compare_dir` |

Options are **not** in `design/`: that folder is Forward's client foundation (`design/product.md`, `design/foundation.md`, `design/patterns.md`) and Forward forbids a second design-system directory there. Candidates are DSX state until one is promoted (`docs/forward-compat.md`, "Design options").

Names: lowercase letters, digits and hyphens. `official` is the project's DESIGN.md; `current` is the active option, or the official file when none is active.

## Commands

```bash
node <DSX>/tools/design-md/lab.mjs list                                   # score, problems, readable text (light/dark), changes vs official
node <DSX>/tools/design-md/lab.mjs add calm --from-reference <slug>       # curated reference (credit kept); search: node <DSX>/tools/references.mjs search --curated
node <DSX>/tools/design-md/lab.mjs add mine --from path/to/OTHER.md
node <DSX>/tools/design-md/lab.mjs add dense --variant-of current --set spacing.2=12px --set typography.body.fontSize=14px --set rounded.md=6px
node <DSX>/tools/design-md/lab.mjs use dense                              # pointer only; `use official` clears it
node <DSX>/tools/design-md/lab.mjs diff official dense                    # value by value + readable-text change
node <DSX>/tools/design-md/lab.mjs compare dense calm --screens 02-list,03-detail,05-dlg-confirm --out compare.html [--lang pt-BR] [--module <m>]
node <DSX>/tools/design-md/lab.mjs promote dense                          # only through the gates; keeps the previous file
node <DSX>/tools/design-md/lab.mjs manifest                               # refresh the live switcher's options (add/use do it too)
node <DSX>/tools/design-md/lab.mjs bundle-check dist                      # the switcher must not be in a production build
```

- `--set` takes a full path (`colors.primary`, `colors-dark.surface`, `typography.body.fontSize`) or a bare key when only one value ends with it (a bare color means the light value). Comments and order of the base file are kept; the variant records its origin in a YAML comment on its first line.
- `list` uses the official linter (`@google/design.md`) when a cached copy exists; `--official-lint` downloads it, `--no-official-lint` skips it.
- Dark mode in a DESIGN.md: the DSX convention is a `colors-dark` group holding only what changes (`knowledge/design-system/design-md.md`). A file without it has one scheme, light or dark by its background.

## Static mode: compare on the real screens (no server)

1. **Captures exist** (skill `capture-from-code`). The harness reads `DSX_DESIGN_MD=<option file>` (legacy name `STITCH_THEME` still works) and applies the option over the product theme with the adapter (`themeOptionsOver` in `mui.ts`): `templates/capture/design-option.ts` (parser, fonts) and, for MUI, `templates/capture/design-option-mui.tsx` as a provider in `mountPage`. `serialize.ts` saves under `options/<option>/` when an option is set.
2. **Declare the command** once:
   ```json
   { "capture": { "command": "cd web && npx vitest run --config vitest.capture.config.ts tests/capture", "module": "orders" } }
   ```
   `compare` runs it once per option with `DSX_CAPTURE=1`, `DSX_CAPTURE_MODULE`, `DSX_DESIGN_MD`, `STITCH_THEME`, `DSX_DESIGN_OPTION` and `DSX_CAPTURE_SUBDIR=options/<option>` set, and once without an option when the official captures are missing (`--recapture-official` forces it). `--no-capture` reuses what is on disk.
3. **Pick 4–6 screens** that cover the main archetypes of the `UX.md` (a list, a detail or editor, a dialog, a state): a theme breaks differently on each type of screen.
4. **Generate the page**, then **check it before sending**: open it and read a screenshot; the page itself passes the DSX detectors (`tools/test/design-lab.test.mjs` runs screen, text and color checks on it). Rendering uses the project's Playwright (`tools/capture/render.mjs` rules: run where Playwright is installed).
5. **Hand it to the owner.** The page shows Current + options in columns, the same screens in rows, zoom with ←/→ (options) and ↑/↓ (screens), and per option the quality score, readable-text check and what changes from the current one in plain words. The owner picks, writes a name and presses **Copy decision**: no terminal. Publish it as an artifact when it must be shared.
6. **Critique on the screens, not in the file** (same rule as `choose-ds`): what breaks in real use outweighs the score; what did *not* change is a fixed color in the product code, recorded as design-system debt.

## Live mode: switch in the running app (development only)

Adoption in a React + Vite app (MUI first; CSS variables for Tailwind or plain CSS):

1. **Copy the adapters** into a dev folder, e.g. `src/dev/design-lab/`: `templates/theme-adapters/design-md.ts` plus `mui.ts` (MUI) or `css-vars.ts` (+ `tailwind.ts` for a Tailwind preset). The capture harness imports the same copy, so both modes share one adapter.
2. **Copy the switcher**: `templates/theme-switcher/selection.ts`, `useDesignOption.ts`, `DesignLabPanel.tsx` and `MuiDesignLab.tsx` (or `CssVarsDesignLab.tsx`) into the same folder.
3. **Write the manifest** where the switcher imports it: set `design.manifest` to `src/dev/design-lab/options.json` (relative to the project root) and run `lab.mjs manifest`; `add` and `use` refresh it. Vite reloads when it changes.
4. **Mount it in the entry point** behind `import.meta.env.DEV` (`templates/theme-switcher/main.example.tsx`): a lazy import that is `null` in production, inside the product's theme provider and around everything that reads the theme (move `CssBaseline` inside it so the page background follows). The product's own theme code does not change.
5. **Use it**: `?ds=<name>` in the URL, or the floating selector; the badge names the active option; the choice is remembered per browser (storage failures are tolerated). The product's light/dark toggle keeps working: the adapter picks `colors` or `colors-dark`, and a single-scheme option always renders its own scheme.
6. **Prove it is not in production**: `vite build`, then `lab.mjs bundle-check dist` (fails on the `dsx-design-lab`/`dsx-design-options` markers every switcher file carries). Put that line in the project's CI or test suite.

**Other frameworks** — the adapters and `selection.ts` have no framework dependency:
- **Vue 3:** a dev-only plugin loaded with `if (import.meta.env.DEV) app.use((await import('./dev/design-lab/plugin')).default)`; inside, a `ref` for the active name initialized with `chooseOption()`, a `watch` that writes `toCssVariables(design).css` into a `<style>` element, and a small component for the badge and selector mounted with `createApp(...).mount(div)` on a node appended to `body`.
- **Svelte/SvelteKit:** a store holding the active name (`chooseOption`, `writeStored`), a `$effect`/subscription that updates the `<style>` with `toCssVariables`, and the panel component rendered only under `{#if import.meta.env.DEV}` (or `dev` from `$app/environment`).
- **Vuetify/Quasar/other theme objects:** map `rolesOf(design, scheme)` and `typeOf(design, role)` from `design-md.ts` to the kit's theme object the same way `mui.ts` does; keep the rule "a role the file does not declare stays out".

## Promote

`promote <name>` replaces the official DESIGN.md only when the option passes the DSX linter **and** the official linter (unavailable → it stops unless `--allow-no-official-lint`). It keeps the previous file as `previous-<date>.md`, clears the pointer and refreshes the manifest. Then:

- **The code theme must follow.** DESIGN.md describes; the theme renders. Update the theme in the same change. When `design.theme_gate` is configured, promote runs it and reports FAIL until the theme matches.
- In a Forward project, record the revision in `design/foundation.md` (token source, drift/debt log) per `docs/forward-compat.md`.
- Run the `design-md` skill (Mode C) on the promoted file: the reference's prose describes the style, not the product.

## Don't

- Edit the official DESIGN.md to "try" a direction: create an option and `use` it.
- Ship the switcher: no import outside the `import.meta.env.DEV` branch, no manifest in `public/` (it would be copied to the build).
- Choose for the owner: the page records their decision; you apply it.
- Compare on generated screens when real ones can be captured, or with real customer data (the blocklist of `capture-from-code` still applies to anything sent out).

## Output

```
Options: dense (variant of official: spacing, body size) · calm (reference <slug>, CC BY 4.0) · …
Seen in: <page path or artifact link> (<n> screens × <m> columns) · live: ?ds=<name>
Gates per option: score · DSX lint · official lint · readable text <ok>/<n>
Owner's choice: <name> → promote <passed/failed> · theme gate <passed/failed/not configured>
```
