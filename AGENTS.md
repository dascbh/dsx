# DSX — instruções para agentes

Este repositório é um **framework de design system, UI e UX para agentes de IA**. Se você é um agente trabalhando num projeto que usa o DSX, comece aqui.

## Roteamento: que skill usar

| Situação | Skill (`skills/<nome>/SKILL.md`) |
|---|---|
| Primeiro uso do DSX num projeto; projeto sem DESIGN.md | `iniciar` |
| Criar, atualizar ou avaliar o DESIGN.md | `design-md` |
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

Subagentes (`agents/`): `revisor-ux` (revisão independente, só leitura), `extrator-design-system` (inventário do DS em código), `juiz-de-evals` (LLM-juiz de um critério).

## Mapa do repositório

```
skills/       procedimentos executáveis (SKILL.md) — o que fazer, em que ordem, o que entregar
patterns/     ~80 padrões de interação com regra SE→ENTÃO, a11y e checklist (index.json para busca)
knowledge/    referência por área: fundamentos/, design-system/, pesquisa/, ia/
templates/    DESIGN.md, padrão, componente, brief, plano/roteiro/relatório de pesquisa, JTBD, OST…
tokens/       tokens W3C DTCG em 3 camadas + pares de contraste; build/ é gerado
tools/        verificadores sem dependências (Node ≥ 20)
evals/        rubricas e casos para avaliar UI gerada, DESIGN.md e features de IA
examples/     DESIGN.md de referência (aprovado no linter)
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
node tools/lint-raw-values.mjs <pasta>         # valores crus (drift) no código de UI
node tools/lint-patterns.mjs [--index]         # valida o catálogo e regenera o índice
node tools/check-links.mjs                     # referências internas quebradas
npm run check                                  # tudo acima + testes
```

## Mantendo o framework

- Padrão novo: `templates/padrao.md` → `patterns/<categoria>/<id>.md` → `node tools/lint-patterns.mjs --index`.
- Conhecimento novo: arquivo em `knowledge/<area>/` começando com "Quando consultar", regras imperativas, decisões SE→ENTÃO e checklist; adicione ao `README.md` da área.
- Skill nova: `skills/<nome>/SKILL.md` com `name` e `description` (a descrição diz **quando** usar); registre na tabela acima.
- Antes de commitar: `npm run check`.
