---
name: stitch
description: "Uses Google Stitch with no manual editing: syncs the DESIGN.md, generates screens and variants, critiques them with the DSX gates, iterates by instruction and brings the result into code. Use to see a screen before coding it, to explore options, or when Stitch is mentioned."
---

# Stitch in DSX: generate, critique, iterate, bring back

> **DSX root:** two levels above this skill's base directory. Paths `knowledge/`, `patterns/`, `tools/`, `templates/` are relative to it; unprefixed paths (`DESIGN.md`, `UX.md`, `.stitch/`, `src/`) belong to the user's project.

**Stitch's role:** a space for **generated exploration**. The code remains the source of truth. Nothing from Stitch enters the project without passing the DSX gates, and its HTML is a layout reference, **never pasted code**.

**Prerequisites:** the `stitch` MCP connected and Google's official skills (`stitch-design`, `stitch-utilities`, `stitch-build`). This skill uses the official ones for the mechanics and adds the DSX criteria.

## State in the project (`.stitch/`, same convention as the official skills)

```
.stitch/
├── DESIGN.md          # export of the project's DESIGN.md for Stitch (generated — do not edit)
├── metadata.json      # projectId, title, screens, design system (format of the official manage-design-system skill)
├── check.json         # latest output of `tools/stitch/design-system.mjs check --json`
├── designs/<slug>.html|png
└── reviews/<slug>.md  # critique of each round: findings, accepted, rejected (with reason)
```

Project with old names (`conferencia.json`, `conferencia-bruta.json`, `revisoes/`, `"conferido"`, `"checkedAt"`, `conforme|divergente`): read them, warn "old name, rename to X" and write only with the new names.

In `metadata.json`, add to the official format (the Stitch API keys, such as `designSystem` and `assetId`, stay as in the API): `"designSystem": { "assetId", "checked_at": "<date>", "status": "compliant|divergent" }`.

## Pick the mode

| Request | Mode |
|---|---|
| No design system yet / want to compare styles before syncing | skill `choose-ds` (curated references, options applied to the screens) |
| Take to Stitch a screen that **already exists in the code** | **capture from the code** (DSX `capture-from-code` skill, or the project's harness): never `generate_screen_from_text` — text reinterprets borders, icons and spacing |
| First time in the project, or the DESIGN.md/tokens changed | **1. Sync** |
| "Generate the X screen", "what would X look like" | **2. Generate** (sync first, if needed) |
| "Show me options", "other versions" | **3. Variants** |
| "Review/critique this screen" (generated or already in Stitch) | **4. Critique** |
| Apply the accepted critiques | **5. Iterate** |
| "Implement this one", "bring it into the code" | **6. Bring back** |

The full cycle is **sync → generate → critique → (you decide) → iterate → critique → bring back**.

---

## 1. Sync the design system

1. `node <DSX>/tools/lint-design-md.mjs DESIGN.md`. If there are errors, fix them first (skill `design-md`). Stitch will not fix your system for you.
2. Export the Stitch version:
   ```bash
   node <DSX>/tools/stitch/design-system.mjs export DESIGN.md -o .stitch/DESIGN.md
   ```
   Read the WARNINGS: quantized radius and fonts Stitch does not have.
3. **Stop and confirm with the user** (checkpoint from the official skill): name, brand color, fonts, radius level and warnings.
4. Project: `list_projects`. If there is no project for this product, use `create_project` and store the `projectId` in `.stitch/metadata.json`.
5. Import **through the DESIGN.md**: `upload_design_md` (base64 of `.stitch/DESIGN.md`) and, right after, `create_design_system_from_design_md` with the returned `{id, sourceScreen}`. For large files, use the script from the official `upload-to-stitch` skill.
   - **Never use `update_design_system` to sync.** It only accepts the Material 3 model (seed color) and wipes the DSX's named colors. To change the system, reimport the export.
6. Wait ~10s (processing is asynchronous), call `list_design_systems`, save the response to `.stitch/check-raw.json` and check:
   ```bash
   node <DSX>/tools/stitch/design-system.mjs check DESIGN.md .stitch/check-raw.json --asset <assetId> --json > .stitch/check.json
   ```
   - **DIVERGES** (`DIVERGENTE` in older tool output) → fix the indicated cause and reimport. Do not generate screens on top of a divergent system.
   - **CONFORMS with warnings** (`CONFORME` in older tool output) → normal. The brand sits in `primary-container` and `primary` gets a derived tone; the extra Material 3 roles have a defined destination in `mapping`.
   - **Known limit:** even with the design system on `ROUND_EIGHT`, the Tailwind config of each generated screen may declare another radius (observed: 4px). That is why the radius of a Stitch screen is **never** a reference: in the code, the DSX `radius.*` tokens apply.

## 2. Generate a screen

1. **Context before the prompt.** If the screen has no declared problem, use the `discovery` skill first. Gather:
   - persona and main task;
   - where the screen is reached from and where it leads (`.dsx/maps/flows.json`, if it exists);
   - entities and data (`.dsx/maps/domain.json`);
   - **the screen's archetype in the `UX.md`** (the screen-archetypes section and the `archetypes/<id>.md` card): regions, where the primary sits, required states, deviations that apply to it. New screen without an archetype: pick one and record it in the `UX.md` before generating. Stitch does not know the `UX.md` (it only imports the `DESIGN.md`), so the behavior goes **described in the prompt**.
2. **Patterns that apply:** first the policies the `UX.md` fixed (primary position, dialog order, feedback, confirmation); then the catalog: check `patterns/index.json`, for example `table-vs-cards`, `active-filters`, `table-pagination`, `empty-state`, `button-hierarchy`. Translate each rule into **described behavior**, without the id. Example: "active filters visible as removable chips, with 'Clear filters'".
3. **Build the prompt** on the template of the official `stitch-design:generate-design` skill: purpose and intent, platform and numbered page structure.
   - **No colors, fonts, radii or hex.** The project's design system handles that; repeating it causes conflicts. The official `generate-design` skill's rule applies. `enhance-prompt` injects the design system into the prompt, so do **not** follow that part of it.
   - **Text in the product's language (pt-BR for a Brazilian product), in the product glossary,** with buttons in verb + object form (skill `ux-writing`).
   - **Realistic fictional data.** **Never** use real customer or personal data: the prompt goes out to an external service.
   - **One primary action per region,** stated explicitly, at the `actions.primary-position` of the `UX.md` (or the archetype card's).
   - **Terms in the `UX.md`'s `content.forbidden` never appear** in the requested text.
4. Call `generate_screen_from_text` with the `projectId`, the prompt, `deviceType` and `designSystem: "assets/<assetId>"`.
   - Generation takes 1 to 3 minutes.
   - **Do not repeat the call:** on timeout, poll `get_screen` every 30s, up to 10 times.
5. Download to `.stitch/designs/<slug>`:
   - the HTML (`htmlCode.downloadUrl`);
   - the screenshot with `=w<width>` at the end of the URL, because without it you get a thumbnail.
6. Show the user the text and suggestions that come in `outputComponents` (rule from the official skills).
7. **States:** Stitch generates the ideal state. For empty, error and loading, generate sibling screens with `edit_screens` or `generate_screen_from_text`, or record that those states will be built directly in code. Do not forget them.

## 3. Variants

`generate_variants` on the base screen, with `variantCount` from 2 to 3 and `creativeRange`:
- `REFINE`: polish;
- `EXPLORE`: real layout alternatives;
- `REIMAGINE`: only when the problem is the approach.

Use `aspects: ["LAYOUT"]` to compare structures. Each variant is a **hypothesis**: write which task it favors and which it worsens. Critique all of them with mode 4 before asking for a choice. Proposals are hypotheses, not evidence; for costly decisions, suggest testing with people (skill `research`).

## 4. Critique (always before iterating or bringing back)

1. **Objective gates:**
   ```bash
   node <DSX>/tools/stitch/analyze-html.mjs .stitch/designs/<slug>.html --design-md DESIGN.md
   ```
   The tool measures:
   - DSX color roles × Stitch-only roles, with each one's destination;
   - contrast;
   - arbitrary values;
   - accessibility triage: accessible name, labels, keyboard, h1, lang, `aria-sort`.

   **A `FAILED` result (`REPROVADO` in older tool output) becomes a finding of severity ≥ 3.**

   If the project has a `UX.md`, also run the behavior gate on the generated HTML: `node <DSX>/tools/ux-lint/screen.mjs .stitch/designs/<slug>.html --ux UX.md` (primaries per region, dialog order, h1, labels, destructive, forbidden terms). A generated screen that breaks a `UX.md` policy is a finding, unless the owner decides to change the policy (then the `UX.md` gets a new version before bringing it back).
2. **Look at the screenshot.** Read the image; do not critique from the HTML alone.
3. **DSX lenses,** citing the source of each finding:
   - `review-ux`: the screen's thesis, task walkthrough, heuristics, severity 0–4;
   - catalog patterns: each interaction decision;
   - `ux-writing`: terms, verb + object, consistency. Repeated counts with different words ("Exibindo" × "Mostrando", pt-BR example) are common in Stitch;
   - `accessibility`: what the static triage does not catch.
4. **Independent review:** for important screens, dispatch the `ux-reviewer` subagent passing **only** the PNG, the HTML and the audience. Do not pass the prompt or your critique.
5. **Record** in `.stitch/reviews/<slug>.md` (format of `templates/heuristic-report.md`).
6. **Present to the user:** list the findings by severity and ask them to choose what goes in. Token findings (color, radius, font) do **not** go in per screen; they go back to mode 1.

## 5. Iterate

1. Turn only the **accepted** findings into an `edit_screens` prompt, numbered and specific in **location + change**. In edits, hex is allowed only for an exact color, per the official skill.
2. Prefer 1 round with everything accepted, or one per theme. Do not redo the screen from scratch unless the whole layout is wrong.
3. Download the new version (it gets another id; the original is preserved) and **run mode 4 again**, including the HTML tool.
   - The edit may fix things only on the surface. Observed example: a "clickable" row that only got `cursor-pointer`, with no keyboard support. The tool flags this.
4. Record accepted and rejected items, with reasons, in `.stitch/reviews/<slug>.md`.

## 6. Bring back into the code

**For existing projects, the way back is through `build-ui`, never through Stitch's HTML.**

1. Use the screenshot and the HTML as a **layout and content reference**.
2. **Map colors by role:**
   - DSX roles → the same semantic tokens;
   - Material 3 roles → the destination in `mapping` (output of `check`) or in `map_to` (output of `analyze-html`) (e.g. `primary-container` → `color.action.primary`).
3. **Use the project's components.** Stitch invents the structure; you reuse the kit (`build-ui`, section 1).
4. **Fix what the critique pointed out and Stitch did not solve:** keyboard access, `href="#"` → real routes, `aria-sort` and empty, error and loading states.
5. **Delivery gates:**
   - `lint-raw-values` with zero occurrences;
   - contrast;
   - keyboard;
   - 320px;
   - ux-lint of the built screen's capture with no severity ≥ 3 and, if the screen is new or changed archetype, `UX.md` updated in the same commit (skill `build-ui`, section 4).

   Then, independent review.

**For a new prototype, with no project yet:** the official skills `stitch-build:react-components` and `stitch-build:shadcn-ui` generate the app. Run the DSX gates on the result and remember the tokens come from the Stitch config: swap them for the DSX DTCG tokens (skill `tokens`) before the prototype becomes a product.

## Output of each round

```
Project: <title> (<projectId>) · design system: <assetId> — CONFORMS/DIVERGES
Screen: <slug> (<screenId>) · version N
Gates (analyze-html): DSX roles NN% · contrast X/Y · a11y: <failures>
Findings (sev ≥ 3): …   Accepted: …   Rejected (reason): …
Next step: iterate | bring back | generate variants
```
