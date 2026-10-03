@AGENTS.md

## Notas para o Claude Code

- Este repositório é um plugin do Claude Code (`.claude-plugin/plugin.json`): skills em `skills/`, subagentes em `agents/`.
- Ao editar o próprio framework, rode `npm run check` antes de concluir.
- Nomes: código e dados em inglês (arquivos de ferramentas, subcomandos, flags, chaves e valores de JSON/YAML, ids, mapas, testes, identificadores); documento para pessoas em português (`knowledge/`, `templates/`, skills, agentes, mensagens, texto de interface, títulos de seção). Chaves em `snake_case` em JSON e em `kebab-case` em YAML; exceção única para nomes de API ou formato externo (Figma `fileKey`, Stitch, W3C DTCG, DESIGN.md, `hooks.json`). Durante a transição, o que as ferramentas leem de um projeto aceita o nome antigo com aviso; o que escrevem usa só o novo; subcomandos e flags antigos são apelidos com aviso (`tools/lib/legacy-cli.mjs`). Tabela e compatibilidade: `docs/renames-2026-10.md`.
- Conteúdo em pt-BR. Escreva com redação própria; não copie texto de fontes externas e não cite fontes por URL em `patterns/` (o linter bloqueia).
- Exceção declarada: `references/` guarda conteúdo de terceiros com licença que permite cópia (ex.: designmd.app, CC BY 4.0), sem alterações e com o crédito exigido. Não é texto do DSX; não edite à mão — regenere com `tools/references.mjs`.
- `data/` guarda dados próprios do DSX lidos pelas ferramentas: a matriz de dimensões de UX (`data/ux-dimensions.json`) e as análises de lacunas contra fontes externas (`data/gap-analysis/`, só paráfrase).
