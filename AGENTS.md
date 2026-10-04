# DSX — instruções para agentes

Este repositório é um **framework de design system, UI e UX para agentes de IA**. Se você é um agente trabalhando num projeto que usa o DSX, comece aqui.

## Roteamento: que skill usar

| Situação | Skill (`skills/<nome>/SKILL.md`) |
|---|---|
| Primeiro uso do DSX num projeto; projeto sem DESIGN.md ou sem UX.md | `iniciar` |
| Escolher o design system (projeto novo, redesenho, "usa o estilo X") a partir de referências curadas | `escolher-ds` |
| Criar, atualizar ou avaliar o DESIGN.md | `design-md` |
| Criar, extrair do código ou avaliar o UX.md (tipos de tela, regiões, ações, navegação, feedback, fluxos); nota de 100, drift UX.md × produto, desvios declarados | `ux-md` |
| Montar ou rearranjar o layout de uma tela a partir do arquétipo (2–3 arranjos para escolher) | `arranjar-tela` |
| Repensar tela ou fluxo, variações ("outras versões", "como poderia ser"): 3 variações reais construídas com os componentes do projeto, medidas, comparadas numa página e decididas | `repensar-ux` |
| Criar/alterar tokens, paleta, escalas, tema escuro, contraste | `tokens` |
| Escrever ou modificar código de interface (para sem DESIGN.md e sem UX.md) | `construir-ui` |
| Dúvida entre componentes/comportamentos ("modal ou página?") | `padroes` |
| Revisar usabilidade de tela ou fluxo | `revisar-ux` |
| Auditar a UX de um módulo inteiro, por dimensão, com registro e re-auditoria | `auditar-ux` |
| Auditoria WCAG / acessibilidade | `acessibilidade` |
| Qualquer texto visível na interface | `ux-writing` |
| Feature com IA, chat, copiloto ou agente que executa ações | `ux-ia` |
| Planejar ou analisar pesquisa com usuários | `pesquisa` |
| Pedido chega como solução sem problema definido; início de feature | `discovery` |
| Saúde/maturidade de um design system existente | `auditar-ds` |
| Medir qualidade de UI gerada ou de feature de IA | `evals` |
| Mapear projeto: estrutura, UI, fluxos, tarefas, jornada, domínio, design system real | `mapear` |
| Confirmar com o usuário o que os mapas inferiram; gerar AS-IS/TO-BE | `confirmar-mapas` |

### Stitch (exploração gerada por agentes, sem edição manual)

| Situação | Skill |
|---|---|
| Ver uma tela antes de codar, gerar variantes, criticar e iterar por agentes, trazer para o código | `stitch` (usa as skills oficiais `stitch-design`, `stitch-utilities`, `stitch-build` para a mecânica) |

### Figma (ciclo código ↔ Figma — guia completo em `docs/fluxo-figma.md`)

| Situação | Skill |
|---|---|
| Montar o ciclo num projeto (registro, Code Connect, baseline) | `figma-iniciar` |
| Levar o projeto ao Figma (fundação + telas + estados, retomável) | `figma-levar` |
| Tokens/tema → variáveis do Figma com modos | `figma-fundacoes` |
| Reespelhar telas do código (incremental) | `figma-espelhar` |
| Explorar alternativas no Figma / criticar propostas do design antes de trazer | `figma-propostas` |
| Ver o que mudou no Figma (diff classificado) | `figma-diff` |
| Trazer mudanças do Figma para o código, com os gates do DSX | `figma-trazer` |
| Projeto que nasce no Figma | `figma-primeiro` |
| De quem é a vez (código/design/aplicando) | `figma-vez` |
| Governança da rodada, gates, registro | `figma-ciclo` |
| Faltou alguma tela no Figma? Matriz código × frames | `figma-cobertura` |
| Convenções de nomes/páginas e reusar vs criar componente; nota no próprio arquivo | `figma-convencoes` |

Subagentes (`agents/`): `revisor-ux` (revisão independente, só leitura), `extrator-design-system` (design system real do código, com adaptadores e hazards), `juiz-de-evals` (LLM-juiz de um critério), `leitor-figma` (snapshot e diff do arquivo, só leitura), `mapeador-projeto`, `mapeador-ui`, `mapeador-fluxos`, `mapeador-tarefas`, `mapeador-jornada`, `mapeador-dominio` (mapas em `.dsx/maps/`) e `analisador-specs` (confronta mapas com as specs).

Hook (`hooks/`): `turn-guard` nega escrita no Figma enquanto `design/figma-sync.md` disser `turn: design` (lê também o legado `vez:`).

## Mapa do repositório

```
skills/       procedimentos executáveis (SKILL.md) — o que fazer, em que ordem, o que entregar
archetypes/   12 arquétipos de tela (regiões, ação primária, estados, variações/arranjos) — index.json para busca
patterns/     ~80 padrões de interação com regra SE→ENTÃO, a11y e checklist (index.json para busca)
knowledge/    referência por área: fundamentos/, design-system/, pesquisa/, ia/
templates/    DESIGN.md, padrão, componente, brief, plano/roteiro/relatório de pesquisa, JTBD, OST…
tokens/       tokens W3C DTCG em 3 camadas + pares de contraste; build/ é gerado
tools/        verificadores sem dependências (Node ≥ 20); tools/figma/ = snapshot, diff, prelúdio e pontes de tokens; tools/stitch/ = design system e análise de HTML
hooks/        turn-guard (ciclo Figma)
evals/        rubricas e casos para avaliar UI gerada, DESIGN.md, UX.md e features de IA
examples/     DESIGN.md e UX.md de referência (aprovados nos linters)
references/   conteúdo de terceiros para consulta: biblioteca de DESIGN.md (designmd.app, CC BY 4.0) — índice, curados e notas
docs/         princípios e integrações com agentes
```

## Regras que valem sempre

Leia `docs/principios.md`. Em resumo: acessibilidade e prevenção de perda vencem estética; nada de dark patterns; evidência rotulada (sintético = hipótese); uma fonte de verdade; sistema antes de improviso; todos os estados; reversibilidade proporcional ao risco; verificar com as ferramentas antes de declarar pronto.

## Nomes: código e dados em inglês, documento em português

- **Inglês:** nomes de arquivos e pastas de ferramentas, scripts e dados; subcomandos e flags de CLI; chaves e valores de JSON/YAML (inclusive o front matter de padrões, arquétipos, `knowledge/` e do `UX.md`); ids (padrões, arquétipos, regiões, estados, variações); mapas em `.dsx/maps/` e suas chaves; títulos de testes; identificadores no código.
- **Português:** nome e conteúdo dos documentos para pessoas — `knowledge/**`, `templates/**`, skills (pasta `skills/<nome>` e texto), agentes (nome e texto), mensagens impressas pelas ferramentas, texto de interface e títulos de seção do corpo dos `.md` (as 13 seções do `UX.md`, as do `DESIGN.md`).
- **Forma das chaves:** `snake_case` em todo JSON e JSONL (saídas `--json`, mapas, índices, registros, changelog); `kebab-case` em YAML (front matter de `UX.md`, arquétipos, padrões e `knowledge/`, rubricas de eval). Exceção única: nomes que espelham uma API ou formato externo ficam como no original — campos da API do Figma (`fileKey`, `modeId`, `valuesByMode`…) e do Stitch (`designSystem`, `displayName`…), W3C DTCG, front matter do `DESIGN.md` (formato do Google) e `hooks.json` do Claude Code.
- **Transição (leitura compatível):** o que a ferramenta **lê** de um projeto (`UX.md`, mapas, registro de achados, `design/figma-sync.md`) aceita também o nome antigo em português, com aviso "nome antigo, renomeie para X"; o que ela **escreve** usa só o nome novo. Subcomandos e flags antigos continuam como apelidos com aviso "nome antigo, use X", numa tabela única: `tools/lib/legacy-cli.mjs`.
- Tabela completa antigo → novo, e o que tem ou não leitura compatível: `docs/renames-2026-10.md`. Nome novo de código ou dado nasce em inglês.

## Ferramentas

```bash
node tools/build-tokens.mjs [--check]          # compila tokens e verifica contraste de todos os pares
node tools/contrast.mjs "#texto" "#fundo"      # contraste WCAG de um par
node tools/palette.mjs "#hex" [--format dtcg]  # rampa 50–950 em OKLCH com contraste por passo
node tools/type-scale.mjs --ratio major-third  # escala tipográfica (ou --fluid)
node tools/spacing-scale.mjs --base 4          # escala de espaçamento
node tools/lint-design-md.mjs DESIGN.md        # gates objetivos do DESIGN.md
node tools/lint-ux-md.mjs UX.md [--archetypes <pasta>] [--json]   # gates objetivos do UX.md (aceita nomes antigos com aviso)
node tools/lint-ux-md.mjs UX.md --score [--map <flows.json>] [--screens <capturas>] [--geometry <pasta>] [--json]   # nota de 100 por critério e gates (evals/rubrics/ux-md.yaml)
node tools/ux-lint/ux-md-drift.mjs UX.md [--map …] [--screens …] [--geometry …] [--module <m> --root <projeto>] [--json] [--fail-at 2]   # drift UX.md × produto U1–U6
node tools/lint-archetypes.mjs [--index]       # valida o catálogo de arquétipos e regenera archetypes/index.json
node tools/ux-lint/screen.mjs <capturas.html|pasta> [--ux UX.md] [--json] [--fail-at 3]          # regras T1–T7 nas capturas de tela
node tools/ux-lint/flow.mjs .dsx/maps/flows-<module>.json [--ux UX.md] [--json] [--fail-at 3]  # regras F1–F5 no mapa de fluxo
node tools/ux-lint/text.mjs --screens <capturas> [--code <pastas>] [--ux UX.md] [--module <m>] [--ignore <nomes>] [--json]  # higiene de texto X1–X11, com arquivo:linha da origem
node tools/ux-lint/audit.mjs --module <m> --root <projeto> [--register] [--measure] [--preview] [--page <saida.html>] [--json]  # auditoria única: pré-requisitos (com drift do UX.md), todos os detectores, relatório por dimensão (data/ux-dimensions.json); --preview gera as prévias antes da página paginada
node tools/ux-lint/preview.mjs --module <m> --root <projeto> [--screens <capturas>] [--min-severity <n>] [--out <dir>] [--width 1440]  # prévias antes/depois de cada opção, recortadas das capturas (Playwright do projeto; fluxo em SVG sem navegador)
node tools/ux-lint/measure.mjs <capturas> --out <pasta-geometria> [--ux UX.md] [--width 1440]  # geometria das capturas (Playwright do projeto; rodar de uma pasta que o tenha)
node tools/ux-lint/layout.mjs <pasta-geometria> [--ux UX.md] [--archetypes <pasta>] [--json] [--fail-at 3]  # layout e hierarquia L1–L9
node tools/ux-lint/states.mjs <capturas> [--ux UX.md] [--archetypes <pasta>] [--json]  # estados S1–S3 (captura <nn>-<tela>.<estado>.html)
node tools/ux-lint/consistency.mjs <capturas> [--ux UX.md] [--module <m>] [--json]  # consistência entre telas C1–C3 (glossário do módulo)
node tools/ux-lint/findings.mjs register --module <m> --text t.json --screen s.json --flow f.json [--layout l.json --states st.json --consistency c.json] --root <repo> [--ux UX.md]  # registro de achados em .dsx/findings/<m>/ (id estável, status; desvios do UX.md → accepted-deviation)
node tools/ux-lint/findings.mjs options --module <m> --from cases.json     # liga opções (2–3 por caso) aos ids; caso sem achado vira item de revisão
node tools/ux-lint/findings.mjs decide --module <m> <id> <índice|ignore|free> [--reason …] [--text …] [--by …]  # grava decisão do dono
node tools/ux-lint/findings.mjs import --module <m> decisions.json         # decisões copiadas da página
node tools/ux-lint/findings.mjs status --module <m> [--json]               # por status, família, regra e severidade; regressões e decididos sem aplicar
node tools/ux-lint/findings.mjs check --module <m> [--min 2] --text … --screen … --flow …  # trava: reprova achado novo ≥ min ou regressão (não grava)
node tools/ux-lint/findings.mjs page --module <m> <saida.html> [--product …] [--color …] [--preview-files] [--no-preview] [--max-page-mb 10]  # página de escolha paginada (<saida>-2.html…), com prévias e "Copiar decisões" de todas as páginas
node tools/ux-lint/variations.mjs validate|measure|lint --root <projeto> --module <m> --flow <f> [--ux UX.md] [--no-layout] [--json]  # manifesto de variações (.dsx/variations/<m>/<f>/variations.json): confere, mede as capturas e roda texto/tela/estados/layout nos frames cruzando com `resolves`
node tools/ux-lint/variations.mjs page --root <projeto> --module <m> --flow <f> --out <saida.html> [--shots <pasta>] [--findings-page <url>] [--fragment]  # página de comparação para decidir em 2 minutos (resumo Hoje | A | B | C no mesmo momento do fluxo, 4 números conferíveis, ganha e custa; uma versão por vez com passos separados de estados, antes/depois com o que mudou contornado e "Comparar com hoje"; decisão sem terminal para o dono); documento completo por padrão, --fragment para artefato; Playwright do projeto para recortar as telas
node tools/ux-lint/variations.mjs decide --root … --module … --flow … (--variant <id> | --compose screen=b,flow=b,behavior=a,text=a) [--comment …] · import --root … decision.json  # grava decision.json
node tools/ux-lint/text-page.mjs <cases.json> <saida.html> [--title …] [--product …] [--color …]  # página de escolha só a partir de cases.json
npx -y @google/design.md lint DESIGN.md        # linter oficial do formato (também diff e export dtcg/tailwind)
node tools/references.mjs search --register operational --use "termos" --curated   # referências de DESIGN.md (também index, fetch, evaluate, curate)
node tools/lint-raw-values.mjs <pasta>         # valores crus (drift) no código de UI
node tools/lint-patterns.mjs [--index]         # valida o catálogo e regenera o índice
node tools/check-links.mjs                     # referências internas quebradas
node tools/figma/tokens-to-figma.mjs --tokens <pasta> [--json | --script]   # tokens DTCG → plano/script de variáveis p/ use_figma
node tools/figma/figma-to-tokens.mjs --snapshot <s.json> --tokens <pasta> [--write] [--json]  # variáveis do Figma → diff DTCG + gate de contraste
node tools/stitch/design-system.mjs export DESIGN.md -o .stitch/DESIGN.md   # DESIGN.md ajustado para importar no Stitch
node tools/stitch/design-system.mjs check DESIGN.md <list_design_systems.json> [--asset <id>] [--json]  # o que o Stitch preservou/mudou
node tools/stitch/analyze-html.mjs <tela.html> --design-md DESIGN.md [--json]  # papéis de cor, contraste e a11y da tela gerada
node tools/figma/diff-baseline.cjs <baseline.json> <atual.json>    # diff classificado (token/primitivo/composição)
npm run check                                  # tudo acima + testes
```

## Mantendo o framework

- Arquétipo novo: copie um cartão de `archetypes/` (id, front matter e ids de regiões/estados/variações em inglês; corpo em pt-BR) → `node tools/lint-archetypes.mjs --index`.
- Padrão novo: `templates/padrao.md` → `patterns/<category>/<id>.md` (id e front matter em inglês, corpo em pt-BR) → `node tools/lint-patterns.mjs --index`.
- Conhecimento novo: arquivo em `knowledge/<area>/` começando com "Quando consultar", regras imperativas, decisões SE→ENTÃO e checklist; adicione ao `README.md` da área.
- Skill nova: `skills/<nome>/SKILL.md` com `name` e `description` (a descrição diz **quando** usar); registre na tabela acima.
- Antes de commitar: `npm run check`.
