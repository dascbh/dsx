# Fluxo DSX ↔ Figma

O DSX trata código e Figma como **dois lados de um ciclo contínuo**. O código continua sendo a fonte de verdade do produto; o Figma é onde se **vê o conjunto, explora alternativas e refina** — o que ele faz melhor que o código — e o que sai de lá volta para o projeto **passando pelos mesmos gates** de qualidade de qualquer mudança feita por um agente.

```
                 ┌──────────────── projeto (fonte de verdade) ────────────────┐
                 │  código  ·  DESIGN.md  ·  tokens DTCG  ·  .dsx/mapas/       │
                 └──────┬───────────────────────────────────────────▲─────────┘
       mapear           │ ida                                        │ volta
       confirmar-mapas  ▼                                            │
                 figma-levar ─► figma-fundacoes (tokens → variáveis)  │ figma-trazer
                             └► figma-espelhar (telas, estados)       │  ├ gates DSX: contraste,
                                     │                                │  │ padrões, a11y, texto
                                     ▼                                │  └ token → skill tokens
                 ┌──────────── arquivo do Figma ───────────┐          │    primitivo/composição →
                 │ 00–08 espelho do presente                │          │    construir-ui
                 │ 09 · Propostas  ◄── figma-propostas (A)  │──diff────┘
                 │   refino do design, alternativas         │  figma-diff
                 └──────────────────────────────────────────┘  figma-propostas (B: pré-voo)

   figma-vez (de quem é a autoridade) · figma-ciclo (governança) · guarda-vez (hook) · figma-cobertura
```

## Do zero, num projeto que já tem código

| # | Passo | Skill | Toca o Figma? |
|---|---|---|---|
| 1 | Mapear o projeto: estrutura, UI, fluxos, tarefas, jornada, domínio, design system real (com hazards) | `/dsx:mapear` | não |
| 2 | Confirmar o que os mapas inferiram, contra suas specs; gera o AS-IS/TO-BE | `/dsx:confirmar-mapas` | não |
| 3 | Fundação no código: DESIGN.md e tokens com contraste verificado | `/dsx:iniciar` (usa `design-md` e `tokens`) | não |
| 4 | Montar o ciclo: registro de sincronia, Code Connect, primeiro baseline | `/dsx:figma-iniciar` | sim |
| 5 | Levar ao Figma: variáveis (3 coleções, Claro/Escuro), estilos, ícones reais, uma tela por rota, diálogos e estados, seções por jornada | `/dsx:figma-levar` | sim |
| 6 | Convenções no próprio arquivo, para quem abrir sem o DSX | `/dsx:figma-convencoes` | sim |
| 7 | Passar a vez ao design | `/dsx:figma-vez design` | — |

Os passos 1–3 servem o DSX inteiro, não só o Figma: `construir-ui` passa a conhecer fluxos e domínio, e `auditar-ds` usa os hazards.

## A rodada (repete sempre)

1. **Explorar / refinar no Figma.** Peça alternativas ao agente (`/dsx:figma-propostas`, modo explorar) ou refine você mesmo. O espelho é editado no lugar; alternativas vão para `09 · Propostas`.
2. **Pré-voo.** `/dsx:figma-propostas` (modo criticar) passa heurísticas, padrões, contraste, texto e kit sobre o que foi desenhado — antes de virar código.
3. **Diff.** `/dsx:figma-diff`: snapshot atual × baseline versionado, já classificado em `token` / `primitivo` / `composição`.
4. **Trazer.** `/dsx:figma-trazer`: aplica na camada certa (token → primitivo → composição → texto), com os gates do DSX. Mudança de variável vira diff DTCG por `tools/figma/figma-para-tokens.mjs` e só entra se o build de tokens passar no contraste.
5. **Fechar.** Registro atualizado (aplicadas, recusadas com motivo), telas tocadas reespelhadas, baseline regenerado, uma linha em `design/figma-changelog.jsonl`. A vez volta para o código.

## Arquivos que o ciclo mantém no seu projeto

| Arquivo | Para quem | O quê |
|---|---|---|
| `design/figma-sync.md` | pessoas | `vez:`, rodadas, propostas abertas, aplicadas, **recusadas com motivo**, divergências conhecidas |
| `design/figma-changelog.jsonl` | agentes | uma linha estruturada por rodada (append-only) |
| `design/figma-achados/<rodada>.md` | ambos | achados completos da rodada, severidade 0–4 |
| `design/figma-reference.json` | agentes | ids e nomes atuais (coleções, estilos, frames) |
| `design/figma-baseline/*.json` | diff | o "antes" canônico — o git vira o histórico do arquivo de design |
| `design/as-is-to-be.md` | ambos | linha de base confirmada pelo `confirmar-mapas` |
| `.dsx/mapas/*` | agentes | mapas do projeto (estrutura, UI, fluxos, tarefas, jornada, domínio, design system) |
| `.dsx/figma/ledger.json` | agentes | estado retomável do `figma-levar` |

## A regra que mantém tudo de pé

**Uma autoridade por vez**, escrita em `design/figma-sync.md`:

| `vez:` | significa | proibido |
|---|---|---|
| `codigo` | o Figma é espelho | refinar no Figma esperando que sobreviva |
| `design` | refino em andamento no Figma | **reespelhar** — o hook `guarda-vez` nega a escrita |
| `aplicando` | propostas virando código | mexer nos mesmos arquivos por fora |

## Requisitos

- MCP oficial do Figma conectado na sessão (as skills carregam `figma-use` e as demais skills oficiais antes de escrever).
- Python 3 (o hook do guarda) e Node ≥ 20 (ferramentas).

## Projetos que já usavam o fluxo anterior

O DSX lê os caminhos antigos (`.claude/figma-claude/…`) e o registro com `turn:` (code/design/applying). Na próxima execução, os mapas são regravados em `.dsx/mapas/` e o registro pode passar a usar `vez:`. Baseline, `figma-sync.md` e o arquivo do Figma continuam válidos sem mudança.
