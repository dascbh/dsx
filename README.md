# DSX — Design System eXperience para agentes de IA

Framework aberto de **design system, UI e UX feito para ser usado por agentes de IA**: em vez de documentação para pessoas lerem, ele traz procedimentos que agentes executam (skills), decisões que agentes consultam (padrões), referência que agentes carregam sob demanda (conhecimento) e **ferramentas que verificam** o que foi feito (tokens, contraste, DESIGN.md, drift).

A premissa: gerar interface ficou barato; **julgar e manter coerência** ficou caro. O DSX dá ao agente o critério que falta — e a quem revisa, uma forma de checar.

## O que tem aqui

| Pasta | Conteúdo |
|---|---|
| [`skills/`](skills) | 13 skills: `iniciar`, `design-md`, `tokens`, `construir-ui`, `padroes`, `revisar-ux`, `acessibilidade`, `ux-writing`, `ux-ia`, `pesquisa`, `discovery`, `auditar-ds`, `evals` |
| [`agents/`](agents) | Subagentes: `revisor-ux` (revisão independente), `extrator-design-system` (inventário do DS em código), `juiz-de-evals` |
| [`patterns/`](patterns) | 77 padrões de interação — formulários, feedback, ações, navegação, dados, modais, autenticação, acessibilidade, UX writing, IA, e-commerce — cada um com regra, árvore de decisão SE→ENTÃO, acessibilidade, microcópia e checklist |
| [`knowledge/`](knowledge) | ~40 documentos de referência em 4 áreas: [fundamentos](knowledge/fundamentos), [design system](knowledge/design-system), [pesquisa](knowledge/pesquisa), [IA](knowledge/ia) |
| [`tokens/`](tokens) | Tokens W3C DTCG em 3 camadas (primitivo → semântico → componente), temas claro/escuro, pares de contraste verificados |
| [`tools/`](tools) | Ferramentas Node sem dependências: build de tokens, contraste, paleta OKLCH, escalas tipográfica e de espaçamento, linters de DESIGN.md, de valores crus e de padrões |
| [`templates/`](templates) | DESIGN.md, padrão, componente, brief, plano/roteiro/relatório de pesquisa, persona, JTBD, OST, mapa de suposições, relatório heurístico |
| [`evals/`](evals) | Rubricas (UI gerada, DESIGN.md, feature de IA) e casos de teste |
| [`examples/`](examples) | DESIGN.md de referência, aprovado no linter |

## Começando

**Claude Code (plugin):**
```bash
/plugin marketplace add <caminho-ou-url-deste-repositório>
/plugin install dsx@headlabs-dsx
```
Depois, no seu projeto: `/dsx:iniciar`.

**Outros agentes (Cursor, Copilot, Codex, Gemini CLI…):** veja [`docs/integracoes.md`](docs/integracoes.md). O ponto de entrada universal é o [`AGENTS.md`](AGENTS.md).

**Ferramentas (Node ≥ 20, sem `npm install`):**
```bash
npm run build:tokens                         # compila tokens/build/tokens.css e verifica contraste
node tools/palette.mjs "#3d5afe"             # rampa de cor com contraste por passo
node tools/lint-design-md.mjs DESIGN.md      # valida o DESIGN.md do seu projeto
node tools/lint-raw-values.mjs src           # encontra valores crus (drift do design system)
npm run check                                # verificação completa do framework
```

## Como as peças se encaixam

```
               ┌──────────── fonte de verdade do projeto ────────────┐
               │   DESIGN.md  +  tokens (DTCG)  +  componentes        │
               └───────────────▲───────────────────────┬─────────────┘
                               │ cria/avalia           │ lê
   iniciar · design-md · tokens│                       ▼
                               │            construir-ui ──consulta──► patterns/
   auditar-ds ─────────────────┘                 │                    knowledge/
                                                 ▼
                         revisar-ux · acessibilidade · ux-writing · ux-ia
                                                 │
                                                 ▼
                       tools/ (gates objetivos) + evals/ (gates e notas)
```

Antes de construir, `discovery` e `pesquisa` garantem que o problema é o certo; depois, `pesquisa` valida com pessoas reais.

## Princípios

Resumo de [`docs/principios.md`](docs/principios.md): pessoas antes de pixels · interface honesta, sem dark patterns · evidência rotulada (sintético = hipótese) · uma fonte de verdade · sistema antes de improviso · todos os estados, sempre · reversibilidade proporcional ao risco · verificar, não presumir · julgamento humano onde importa · menos, porém claro.

## Contribuindo

Veja a seção "Mantendo o framework" do [`AGENTS.md`](AGENTS.md). Todo conteúdo é escrito com redação própria; padrões citam fontes públicas pelo nome (WCAG, WAI-ARIA APG, Nielsen Norman Group, Baymard, Material, Carbon, GOV.BR, GOV.UK), nunca por cópia.
