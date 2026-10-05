# Agent integrations

DSX works with any agent that reads files. The rule is always the same: **one source of truth (`DESIGN.md` for appearance, `UX.md` for behavior, tokens and this framework), and every tool only points to it.** Copying rules into several files creates contradictions at the first change.

## Claude Code (plugin)

The repository is a plugin and a marketplace at the same time.

```bash
# inside Claude Code
/plugin marketplace add <path-or-url-of-the-dsx-repository>
/plugin install dsx@headlabs-dsx
```

The skills become available as `/dsx:init`, `/dsx:build-ui`, `/dsx:review-ux` etc., and are also triggered automatically by their description. The `ux-reviewer`, `design-system-extractor` and `eval-judge` subagents become available for delegation.

In the project, wire design and behavior in `CLAUDE.md`:

```markdown
@DESIGN.md
@UX.md
```

(The `@` imports the file into the session context. If the files are large, prefer the instruction "before creating or changing UI, read `DESIGN.md` (how it looks) and `UX.md` (what kind of screen, where each thing goes, how it behaves)" instead of the import — it is the `init` skill block, step 6.)

### Without the plugin (local copy)

Copy `skills/` to the project's `.claude/skills/` and `agents/` to `.claude/agents/`, and keep the DSX folder reachable (e.g. `vendor/dsx/`) for `knowledge/`, `patterns/` and `tools/`. Adjust the root mentioned in the skills if you change the structure.

## AGENTS.md (Codex, Gemini CLI, Aider, Jules and others)

Many agents read `AGENTS.md` at the root. Add the block from section 6 of `skills/init/SKILL.md` and a pointer to DSX:

```markdown
## Interface and design
Follow the DSX framework in `vendor/dsx/` (or an equivalent path):
- Before changing UI: read `DESIGN.md` (how it looks), `UX.md` (what kind of screen, where each thing goes, how it behaves) and `vendor/dsx/skills/build-ui/SKILL.md`.
- Interaction decisions: `vendor/dsx/patterns/index.json`.
- Review: `vendor/dsx/skills/review-ux/SKILL.md` and `vendor/dsx/skills/accessibility/SKILL.md`.
```

## Cursor

Create `.cursor/rules/design.mdc` with `globs` so the rule only applies to UI tasks:

```markdown
---
description: Project interface rules (DSX design system)
globs: ["src/**/*.tsx", "src/**/*.css", "app/**/*.tsx"]
alwaysApply: false
---
- Read `DESIGN.md` and `UX.md` (the screen's archetype) before changing this file.
- Use only semantic tokens and components from `src/components/ui`.
- Follow the `vendor/dsx/patterns/index.json` catalog for interaction decisions.
- Implement loading, empty, error and success states.
```

## GitHub Copilot

`.github/copilot-instructions.md` with the same short block. Do not paste the whole DESIGN.md or UX.md.

## Prototyping tools with DESIGN.md support

Tools that read `DESIGN.md` natively accept the project's file as is. Keep the front matter within the supported subset (maps and scalars; references in quotes) and run `node tools/lint-design-md.mjs` before importing.

## CI

```yaml
# .github/workflows/design.yml (example)
- run: node vendor/dsx/tools/build-tokens.mjs --check     # if using DTCG tokens
- run: node vendor/dsx/tools/lint-design-md.mjs DESIGN.md
- run: node vendor/dsx/tools/lint-raw-values.mjs src/components src/app
```

Start `lint-raw-values` as informational (non-blocking) and make it blocking once drift is close to zero.
