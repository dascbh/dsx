@AGENTS.md

## Notes for Claude Code

- This repository is a Claude Code plugin (`.claude-plugin/plugin.json`): skills in `skills/`, subagents in `agents/`. Old Portuguese skill and agent names remain as deprecated alias stubs pointing to the new names.
- When editing the framework itself, run `npm run check` before finishing.
- Naming: everything in English — code, data (tool files, subcommands, flags, JSON/YAML keys and values, ids, maps, tests, identifiers), docs, `knowledge/`, `templates/`, skills, agents and tool messages. The only exception is text the product's end user sees (interface text, microcopy examples), which follows the project's language; the pt-BR text detectors remain and an `en` pack exists. Keys in `snake_case` in JSON and `kebab-case` in YAML; the single exception is names from an external API or format (Figma `fileKey`, Stitch, W3C DTCG, DESIGN.md, `hooks.json`). During the transition, what the tools read from a project accepts the old name with a warning; what they write uses only the new one; old subcommands and flags are aliases with a warning (`tools/lib/legacy-cli.mjs`). Table and compatibility: `docs/renames-2026-10.md`.
- Write in your own words; do not copy text from external sources and do not cite sources by URL in `patterns/` (the linter blocks it).
- Declared exception: `references/` holds third-party content under a license that allows copying (e.g. designmd.app, CC BY 4.0), unchanged and with the required credit. It is not DSX text; do not edit it by hand — regenerate it with `tools/references.mjs`.
- `data/` holds DSX's own data read by the tools: the UX dimensions matrix (`data/ux-dimensions.json`) and the gap analyses against external sources (`data/gap-analysis/`, paraphrase only).
