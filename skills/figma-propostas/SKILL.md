---
name: figma-propostas
description: "Explora alternativas na página 09 · Propostas a partir do DSX e critica o que o design desenhou lá antes de virar código. Use para visualizar opções no Figma ou pedir segunda opinião sobre uma proposta."
---

# Propostas no Figma: explorar e criticar antes de trazer

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

O espelho (`figma-espelhar`) descreve **o presente** e não se redesenha. A página `09 · Propostas` é o lugar do **futuro possível**: onde se exploram alternativas e onde o design deixa o que quer ver virar código. Esta skill cobre os dois sentidos dessa página.

| Modo | Quem desenha | Saída |
|---|---|---|
| **A — Explorar** | o agente, a partir do DSX | 2–3 alternativas em `09 · Propostas`, cada uma com hipótese e trade-off |
| **B — Criticar** | o design (pessoa) | relatório de pré-voo por proposta: segue / ajustar / devolver |

## Pré-condições

- Ciclo montado (`figma-iniciar`) e fundação no arquivo (`figma-fundacoes`): propostas são montadas com as **variáveis e componentes do kit**, nunca com valores soltos.
- Leia `design/figma-sync.md`. **Modo A escreve no arquivo:** só com `vez: codigo`, ou com `vez: design` se o próprio design pediu a exploração — nesse caso, peça para a pessoa passar a vez (`figma-vez`) ou desenhe só depois que ela confirmar; o guarda bloqueia escrita na vez do design e isso é intencional. **Modo B só lê:** roda em qualquer vez.
- Carregue a skill oficial `figma-use` antes de qualquer `use_figma`.

## Modo A — Explorar alternativas

1. **Enquadre** em 3 linhas: para quem, tarefa principal, o que a versão atual faz mal (com evidência: achado de `revisar-ux`, dado de pesquisa, pedido do usuário). Sem problema declarado, não há o que comparar.
2. **Formule 2–3 hipóteses diferentes de verdade** — não três variações de cor. Exemplos: "tabela densa com filtros fixos" × "cards com resumo e detalhe em painel" × "lista agrupada por status". Cada uma consulta o catálogo (`patterns/index.json`) e cita os padrões que aplica.
3. **Monte no Figma**, uma alternativa por frame, lado a lado, ao lado de uma cópia **referenciada** (não editada) do frame atual. Use o kit e as variáveis do arquivo; texto real (`ux-writing`), volume de dados realista, e inclua pelo menos um estado não ideal (vazio ou erro) por alternativa.
4. **Nomeie** `Proposta · <tela> · A — <hipótese em 3–5 palavras>` e escreva a hipótese, os padrões usados e o trade-off principal numa nota ao lado de cada frame.
5. **Verifique renderizado**: screenshot de cada alternativa; contraste dos pares novos com `node tools/contrast.mjs`; alvos ≥ 44px; hierarquia (uma ação primária por região).
6. **Registre** uma linha em `design/figma-changelog.jsonl` (`direcao: "codigo->figma"`, `resumo: "propostas: <tela>"`) e liste as propostas em `## Open proposals` do `figma-sync.md`.
7. **Recomende** uma, com o critério que decide (ex.: "A, se a tarefa dominante é comparar; B, se é acompanhar um item") e o que validar com pessoas reais (skill `pesquisa`) antes de decidir. Propostas são hipóteses, não evidência.

## Modo B — Criticar o que o design desenhou

Para cada frame em `09 · Propostas` (ou os que o usuário apontar):

1. **Leia sem editar**: `get_screenshot` + `get_design_context` (ou o snapshot em `MODE='full'` com `TARGETS`). Delegue ao subagente `leitor-figma` se forem muitos frames.
2. **Compare com o frame atual** correspondente e liste o que muda.
3. **Passe as lentes do DSX**, nesta ordem, citando a fonte de cada achado:
   - **Tokens:** fills/strokes ligados a variáveis (`@color/...` no snapshot)? Valor cru em proposta = mudança de token disfarçada ou drift.
   - **Contraste e não-só-cor:** `tools/contrast.mjs` em cada par novo; estado comunicado só por cor reprova (`patterns/acessibilidade/nao-so-cor.md`).
   - **Padrões de interação:** cada decisão contra `patterns/index.json` — erro em toast, modal com formulário longo, botão desabilitado sem motivo, carrossel automático…
   - **Heurísticas e hierarquia:** skill `revisar-ux` (walkthrough da tarefa, severidade 0–4).
   - **Texto:** skill `ux-writing` (glossário, verbo + objeto, mensagens de erro).
   - **Kit:** a proposta cria componente/variante que não existe? Isso é decisão de produto, não de tela (`figma-convencoes`, reusar vs criar).
   - **O que o Figma não mostra:** estados vazio/carregando/erro, foco, teclado, largura estreita. Ausência no frame não é ordem de remover do código — mas anote o que precisa ser desenhado.
4. **Veredito por proposta:**
   - **Segue** → pronta para `figma-trazer`, com a classificação prevista (`token` / `primitivo` / `composição` / `texto` / `padrão novo`).
   - **Ajustar** → segue com mudanças específicas (liste-as; quem ajusta é o design, no Figma).
   - **Devolver** → bate num gate (contraste, não-só-cor, padrão `evitar`, achado registrado como intencional). Motivo em uma linha, para ir a `## Rejected` se o design concordar.

## Saída

```
Modo: A (explorar) | B (criticar)   Vez: <vez atual>   Frames: <n>

[A] Alternativas
| Proposta | Hipótese | Padrões | Trade-off | Verificação |
Recomendação: … · Validar com pessoas: …

[B] Pré-voo
| Proposta | Veredito | Classe prevista | Achados (sev) | Fonte |
Gates acionados: …
Precisa ser desenhado antes de trazer: …
```

Não traga nada para o código nesta skill. A volta é `figma-trazer`, que reaplica os gates sobre o diff real.
