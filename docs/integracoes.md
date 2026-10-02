# Integrações com agentes

O DSX funciona com qualquer agente que leia arquivos. A regra é sempre a mesma: **uma fonte de verdade (`DESIGN.md` + tokens + este framework), e cada ferramenta só aponta para ela.** Copiar regras para vários arquivos gera contradição na primeira mudança.

## Claude Code (plugin)

O repositório é um plugin e um marketplace ao mesmo tempo.

```bash
# dentro do Claude Code
/plugin marketplace add <caminho-ou-url-do-repositorio-dsx>
/plugin install dsx@headlabs-dsx
```

As skills ficam disponíveis como `/dsx:iniciar`, `/dsx:construir-ui`, `/dsx:revisar-ux` etc., e também são acionadas automaticamente pela descrição. Os subagentes `revisor-ux`, `extrator-design-system` e `juiz-de-evals` ficam disponíveis para delegação.

No projeto, conecte o design com uma linha no `CLAUDE.md`:

```markdown
@DESIGN.md
```

(O `@` importa o arquivo no contexto da sessão. Se o arquivo for grande, prefira a instrução "leia `DESIGN.md` antes de mudar UI" em vez do import.)

### Sem plugin (cópia local)

Copie `skills/` para `.claude/skills/` e `agents/` para `.claude/agents/` do projeto, e mantenha a pasta do DSX acessível (ex.: `vendor/dsx/`) para `knowledge/`, `patterns/` e `tools/`. Ajuste a raiz citada nas skills se mudar a estrutura.

## AGENTS.md (Codex, Gemini CLI, Aider, Jules e outros)

Muitos agentes leem `AGENTS.md` na raiz. Adicione o bloco da seção 5 de `skills/iniciar/SKILL.md` e um ponteiro para o DSX:

```markdown
## Interface e design
Siga o framework DSX em `vendor/dsx/` (ou caminho equivalente):
- Antes de mudar UI: leia `DESIGN.md` e `vendor/dsx/skills/construir-ui/SKILL.md`.
- Decisões de interação: `vendor/dsx/patterns/index.json`.
- Revisão: `vendor/dsx/skills/revisar-ux/SKILL.md` e `vendor/dsx/skills/acessibilidade/SKILL.md`.
```

## Cursor

Crie `.cursor/rules/design.mdc` com `globs` para que a regra só entre em tarefas de UI:

```markdown
---
description: Regras de interface do projeto (design system DSX)
globs: ["src/**/*.tsx", "src/**/*.css", "app/**/*.tsx"]
alwaysApply: false
---
- Leia `DESIGN.md` antes de alterar este arquivo.
- Use só tokens semânticos e componentes de `src/components/ui`.
- Siga o catálogo `vendor/dsx/patterns/index.json` para decisões de interação.
- Implemente estados de carregando, vazio, erro e sucesso.
```

## GitHub Copilot

`.github/copilot-instructions.md` com o mesmo bloco curto. Não cole o DESIGN.md inteiro.

## Ferramentas de prototipagem com suporte a DESIGN.md

Ferramentas que leem `DESIGN.md` nativamente aceitam o arquivo do projeto como está. Mantenha o front matter dentro do subconjunto suportado (mapas e escalares; referências entre aspas) e rode `node tools/lint-design-md.mjs` antes de importar.

## CI

```yaml
# .github/workflows/design.yml (exemplo)
- run: node vendor/dsx/tools/build-tokens.mjs --check     # se usar tokens DTCG
- run: node vendor/dsx/tools/lint-design-md.mjs DESIGN.md
- run: node vendor/dsx/tools/lint-raw-values.mjs src/components src/app
```

Comece o `lint-raw-values` como informativo (sem bloquear) e passe a bloquear quando o drift estiver perto de zero.
