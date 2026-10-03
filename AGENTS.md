# DSX — instruções para agentes

Este repositório é um **framework de design system, UI e UX para agentes de IA**. Se você é um agente trabalhando num projeto que usa o DSX, comece aqui.

## Roteamento: que skill usar

| Situação | Skill (`skills/<nome>/SKILL.md`) |
|---|---|
| Primeiro uso do DSX num projeto; projeto sem DESIGN.md | `iniciar` |
| Escolher o design system (projeto novo, redesenho, "usa o estilo X") a partir de referências curadas | `escolher-ds` |
| Criar, atualizar ou avaliar o DESIGN.md | `design-md` |
| Criar, extrair do código ou avaliar o UX.md (tipos de tela, regiões, ações, navegação, feedback, fluxos) | `ux-md` |
| Montar ou rearranjar o layout de uma tela a partir do arquétipo (2–3 arranjos para escolher) | `arranjar-tela` |
| Criar/alterar tokens, paleta, escalas, tema escuro, contraste | `tokens` |
| Escrever ou modificar código de interface | `construir-ui` |
| Dúvida entre componentes/comportamentos ("modal ou página?") | `padroes` |
| Revisar usabilidade de tela ou fluxo | `revisar-ux` |
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

Subagentes (`agents/`): `revisor-ux` (revisão independente, só leitura), `extrator-design-system` (design system real do código, com adaptadores e hazards), `juiz-de-evals` (LLM-juiz de um critério), `leitor-figma` (snapshot e diff do arquivo, só leitura), `mapeador-projeto`, `mapeador-ui`, `mapeador-fluxos`, `mapeador-tarefas`, `mapeador-jornada`, `mapeador-dominio` (mapas em `.dsx/mapas/`) e `analisador-specs` (confronta mapas com as specs).

Hook (`hooks/`): `guarda-vez` nega escrita no Figma enquanto `design/figma-sync.md` disser `vez: design`.

## Mapa do repositório

```
skills/       procedimentos executáveis (SKILL.md) — o que fazer, em que ordem, o que entregar
arquetipos/   12 arquétipos de tela (regiões, ação primária, estados, variações/arranjos) — index.json para busca
patterns/     ~80 padrões de interação com regra SE→ENTÃO, a11y e checklist (index.json para busca)
knowledge/    referência por área: fundamentos/, design-system/, pesquisa/, ia/
templates/    DESIGN.md, padrão, componente, brief, plano/roteiro/relatório de pesquisa, JTBD, OST…
tokens/       tokens W3C DTCG em 3 camadas + pares de contraste; build/ é gerado
tools/        verificadores sem dependências (Node ≥ 20); tools/figma/ = snapshot, diff, prelúdio e pontes de tokens; tools/stitch/ = design system e análise de HTML
hooks/        guarda-vez (ciclo Figma)
evals/        rubricas e casos para avaliar UI gerada, DESIGN.md e features de IA
examples/     DESIGN.md e UX.md de referência (aprovados nos linters)
referencias/  conteúdo de terceiros para consulta: biblioteca de DESIGN.md (designmd.app, CC BY 4.0) — índice, curados e notas
docs/         princípios e integrações com agentes
```

## Regras que valem sempre

Leia `docs/principios.md`. Em resumo: acessibilidade e prevenção de perda vencem estética; nada de dark patterns; evidência rotulada (sintético = hipótese); uma fonte de verdade; sistema antes de improviso; todos os estados; reversibilidade proporcional ao risco; verificar com as ferramentas antes de declarar pronto.

## Ferramentas

```bash
node tools/build-tokens.mjs [--check]          # compila tokens e verifica contraste de todos os pares
node tools/contrast.mjs "#texto" "#fundo"      # contraste WCAG de um par
node tools/palette.mjs "#hex" [--format dtcg]  # rampa 50–950 em OKLCH com contraste por passo
node tools/type-scale.mjs --ratio major-third  # escala tipográfica (ou --fluid)
node tools/spacing-scale.mjs --base 4          # escala de espaçamento
node tools/lint-design-md.mjs DESIGN.md        # gates objetivos do DESIGN.md
node tools/lint-ux-md.mjs UX.md [--json]       # gates objetivos do UX.md
node tools/lint-arquetipos.mjs [--index]       # valida o catálogo de arquétipos e regenera arquetipos/index.json
node tools/ux-lint/tela.mjs <capturas.html|pasta> [--ux UX.md] [--json]          # regras T1–T7 nas capturas de tela
node tools/ux-lint/fluxo.mjs .dsx/mapas/fluxos-<modulo>.json [--ux UX.md] [--json]  # regras F1–F5 no mapa de fluxo
npx -y @google/design.md lint DESIGN.md        # linter oficial do formato (também diff e export dtcg/tailwind)
node tools/referencias.mjs buscar --registro operacional --uso "termos" --curados   # referências de DESIGN.md (também indice, baixar, avaliar, curar)
node tools/lint-raw-values.mjs <pasta>         # valores crus (drift) no código de UI
node tools/lint-patterns.mjs [--index]         # valida o catálogo e regenera o índice
node tools/check-links.mjs                     # referências internas quebradas
node tools/figma/tokens-para-figma.mjs --tokens <pasta> --script   # tokens DTCG → script de variáveis p/ use_figma
node tools/figma/figma-para-tokens.mjs --snapshot <s.json> --tokens <pasta> [--write]  # variáveis do Figma → diff DTCG + gate de contraste
node tools/stitch/design-system.mjs exportar DESIGN.md -o .stitch/DESIGN.md   # DESIGN.md ajustado para importar no Stitch
node tools/stitch/design-system.mjs conferir DESIGN.md <list_design_systems.json>  # o que o Stitch preservou/mudou
node tools/stitch/analisar-html.mjs <tela.html> --design-md DESIGN.md      # papéis de cor, contraste e a11y da tela gerada
node tools/figma/diff-baseline.cjs <baseline.json> <atual.json>    # diff classificado (token/primitivo/composição)
npm run check                                  # tudo acima + testes
```

## Mantendo o framework

- Arquétipo novo: copie um cartão de `arquetipos/` → `node tools/lint-arquetipos.mjs --index`.
- Padrão novo: `templates/padrao.md` → `patterns/<categoria>/<id>.md` → `node tools/lint-patterns.mjs --index`.
- Conhecimento novo: arquivo em `knowledge/<area>/` começando com "Quando consultar", regras imperativas, decisões SE→ENTÃO e checklist; adicione ao `README.md` da área.
- Skill nova: `skills/<nome>/SKILL.md` com `name` e `description` (a descrição diz **quando** usar); registre na tabela acima.
- Antes de commitar: `npm run check`.
