---
name: ux-writing
description: "Writes and reviews all interface text in the project's language (pt-BR detectors included): buttons, errors, empty states, toasts, confirmations and AI content, with a defined tone and a consistent glossary. Use when creating or changing any visible string."
---

# UX writing

> **DSX root:** two levels above this skill's base directory. Paths under `knowledge/`, `patterns/` are relative to it.

**Language:** this skill is written in English, but the product text it produces and reviews follows the project's language (the language of the existing UI strings, the glossary and `UX.md`). The examples below are pt-BR product text and stay in pt-BR, labeled "(pt-BR example)"; apply the same formulas in the project's language. The text detectors (`text.mjs`, rules X1–X11) currently target pt-BR.

References: `knowledge/foundations/ux-writing.md`, `knowledge/foundations/generated-text-marks.md` (marks of AI-generated and bureaucratic text, rules X1–X11), `patterns/ux-writing/*` (button text, link text, useful error message).

## Automatic survey (when there are screens to look at)

Before reviewing by hand, let the tool find what is mechanical. It does not judge screen architecture, only the text.

1. Run it over the HTML captures, pointing at the code where the strings originate:
   ```bash
   node tools/ux-lint/text.mjs --screens <captures-folder> --code <front-folders> <vocabulary-folders> --ux UX.md [--ignore <file.html>] [--json]
   ```
   Without captures, generate them first (skill `capture-from-code`, or any rendered HTML).
2. Read the per-rule summary and the "Most problematic strings" ranking (severity × number of screens). Prioritize by severity and frequency: navigation or header text, which appears on every screen, comes first.
3. Fix **at the source** (the report's `file:line`), once: the vocabulary or the template, not the capture. A finding with "variants of the same template" is solved in a single line.
4. Ignore the "Likely data" section: there the mark came from interpolated content (order name, person, category), not from the interface text.
5. To rewrite each finding, use the before/after examples in `knowledge/foundations/generated-text-marks.md`. Marks the tool does not flag (triads, "not only … but also", generic adjectives) go into the manual review below.
6. Run again after fixing and recapturing: the number of interface findings should drop, with no new finding.

## Record in `.dsx/findings` and decide through the register

The result does not stay in the conversation or in a temporary folder (contract: `knowledge/foundations/ux-findings.md`).

1. `node tools/ux-lint/findings.mjs register --module <m> --text texto.json [--screen tela.json] [--flow fluxo.json] --root <repo>` — each finding gets a stable id and a status.
2. Write the options in `cases.json` (format in `knowledge/foundations/ux-findings.md`) and link them to the ids: `findings.mjs options --module <m> --from cases.json`. A manual-review case (unnecessary description) goes in as an item with `origin: "review"`.
3. `findings.mjs page --module <m> pagina.html --product "<product>" --color "<primary>"`: the owner marks A/B/C or Ignore (with a reason) and uses "Copy decisions"; save with `findings.mjs import --module <m> decisions.json` (or `decide` for a decision stated in chat).
4. Apply at the source only what is `decided` (`findings.mjs status --module <m>` lists it with `file:line`), recapture, register again and confirm `fixed`. `findings.mjs check` in pre-commit or CI blocks new findings and regressions.

## Before writing

1. Read the project glossary, if it exists: the one in `UX.md`'s `content.glossary` (per module, when the product has different vocabularies: `{ default: …, <module>: … }`), otherwise DESIGN.md, `docs/` or existing strings. Run `text.mjs` and `consistency.mjs` with `--module <m>` to use the right glossary. **Same concept = same word on every screen.** If none exists, build one with the 10–20 domain terms from the current strings and point out divergences.
2. Identify the tone of voice along the 4 dimensions (formal↔casual, serious↔funny, respectful↔irreverent, enthusiastic↔matter-of-fact). Task interfaces tend toward matter-of-fact and respectful. Tone **changes with the moment**: errors and money loss call for more sobriety than a welcome.

## Formulas

| Element | Formula | Example (pt-BR example) |
|---|---|---|
| Button | verb (infinitive in pt-BR) + object | "Salvar alterações", "Enviar proposta" — never "OK", "Sim", or a bare "Enviar" when there is ambiguity |
| Link | describes the destination | "Ver política de reembolso" — never "clique aqui" |
| Field error | what happened + how to fix it, without blaming | "Informe um CEP com 8 números." |
| System error | what happened + what was preserved + next step | "Não conseguimos salvar agora. Suas alterações continuam aqui. Tente de novo em instantes." |
| Empty state | what this place is + why it is empty + action | "Nenhuma fatura ainda. As faturas aparecem aqui depois do primeiro pagamento." |
| Destructive confirmation | action + object + consequence; buttons repeat the verb | "Excluir o projeto 'Site 2026'? Os 14 arquivos serão apagados e não podem ser recuperados." → [Cancelar] [Excluir projeto] |
| Success | what was done (+ undo when it applies) | "Proposta enviada para Ana Souza." [Desfazer] |
| Long loading | what is happening + how long is left | "Gerando relatório… cerca de 30 segundos." |
| AI content | label + limitation + action | "Resumo gerado por IA. Confira os valores antes de enviar." |

## Rules

- Short sentences; one idea per sentence; the most important information first.
- Active voice, implicit second person (pt-BR example: "Informe seu e-mail"), never "the user" in the interface.
- No technical or internal jargon ("payload", "erro 500", table names). Technical codes only as a secondary detail for support — `patterns/feedback/technical-error-code.md`.
- Do not blame (pt-BR example: "Você digitou errado") or infantilize (pt-BR example: "Ops! 🙈") in errors.
- Numbers as digits; dates and currency in the project locale's format (pt-BR example: `01/10/2026`, `R$ 1.234,56`).
- Sentence case in titles and buttons (pt-BR example: "Criar conta", not "Criar Conta").
- Plural and gender generated by code: handle 0, 1 and N (pt-BR example: "Nenhum item", "1 item", "3 itens").
- In pt-BR, acronyms take the correct gender ("a API", "o PDF"); crase and accents reviewed. In other languages, apply the equivalent grammar check.
- Field labels do not end with a colon when placed above the field; a placeholder never replaces a label.

## Reviewing a flow

1. Extract every string in the flow (code or screen) into a table: `screen | element | current text`.
2. Mark: inconsistent term, violated formula, tone wrong for the moment, language error, text that does not help decide, mark of generated text (`knowledge/foundations/generated-text-marks.md`).
3. Propose the rewrite in the next column, with the reason in ≤ 8 words.
4. Update the glossary with any term that was decided.

Output: the table `screen | element | current | proposed | reason` + updated glossary.


## Survey with options for the owner to choose

1. `node tools/ux-lint/text.mjs --screens <captures> --code <code folders> --ux UX.md --json > text.json` — findings X1–X11 with the `file:line` source.
2. Add the judgment review of what the machine does not catch well: **unnecessary descriptions** (they repeat the obvious, explain what the screen already shows, read like a manual).
3. For each case, write 2–3 ready-to-paste options, each with its source convention (`knowledge/foundations/compared-elements.md`: Material, Carbon, Polaris, GOV.UK, Atlassian, Apple HIG, DSX) and one recommended with the reason. When the fix is about placement (the name goes to the accessible name, the explanation leaves the tooltip and becomes visible text), say so in the option.
4. Register and generate the page from the register (`findings.mjs options` + `findings.mjs page`, previous section): it shows each element as rendered today and in each option, with id, status and the decision form. Without a register, `node tools/ux-lint/text-page.mjs cases.json pagina.html --product "<product>" --color "<primary>"` generates the page only. The owner chooses; the fix is made at the source.
