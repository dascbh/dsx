# Como o diff é feito

> **Raiz do DSX:** três níveis acima deste arquivo. Caminhos `tools/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

O Figma não dá diff de graça: o MCP não expõe histórico de versões, e
`setPluginData` — que serviria para carimbar um estado dentro do arquivo — é
API proibida nele. Então o diff é feito **contra um retrato canônico
versionado no repositório**, e é o git que passa a dar histórico ao arquivo de
design.

```
rodada N   ┌── snapshot ──▶ design/figma-baseline/*.json  (commit)
           │
   refino no Figma
           │
rodada N+1 └── snapshot ──▶ compara com o baseline ──▶ relatório de mudanças
```

## Por que não diff visual

Comparar screenshots acha *que* mudou, nunca *o que* mudou: não distingue
"padding 16→12" de "fonte 14→13", não sabe se a cor veio de token, e falha em
qualquer reflow. Serve como conferência humana no fim — nunca como o mecanismo.

## O retrato canônico

O problema real do diff estrutural é **ruído**. Um dump bruto de propriedades
muda a cada recálculo de auto-layout e produz milhares de linhas irrelevantes.
A projeção canônica ([tools/figma/snapshot.js](../../../tools/figma/snapshot.js),
colada dentro de `use_figma` — não roda no Node) guarda só o que é decisão de
design:

| guarda | descarta |
|---|---|
| auto-layout: modo, paddings, gap, alinhamentos, wrap | `x`/`y` de filho em auto-layout (derivado) |
| sizing (`FIXED`/`HUG`/`FILL`) por eixo | `width`/`height` quando o eixo é HUG ou FILL (derivado) |
| largura/altura **só** no eixo `FIXED` | `absoluteBoundingBox`, `absoluteTransform` |
| raio, espessura e lados da borda | ids de estilo (guarda o **nome**) |
| fill/stroke como **nome do token** (`@color/action/primary`) ou hex + opacidade | rotação de 0, opacidade de 1, `visible: true` |
| texto: conteúdo, estilo, família/peso, tamanho, entrelinha, caixa, alinhamento, truncamento | tudo que o auto-layout recalcula sozinho |
| ordem dos filhos | |

Fill ligado a variável vira `@nome/da/variável` — não o valor. É isso que
separa "trocaram a cor deste botão" de "trocaram o token e mudou o app inteiro".

## Duas fases — porque o arquivo é grande

Um arquivo de 130 frames tem dezenas de milhares de nós. Puxar tudo a cada
rodada é caro e desnecessário.

**Fase 1 — impressão digital.** Um `use_figma` com `MODE = 'hashes'` devolve,
por frame de nível superior, um hash da subárvore canônica e a contagem de nós.
Resposta pequena. Compare com o baseline: só os frames cujo hash mudou entram
na fase 2.

**Fase 2 — detalhe.** Um segundo `use_figma`, com `MODE = 'full'` e `TARGETS`
restrito aos frames alterados, devolve a projeção completa dos nós. É aí que o
custo aparece — e só para o que de fato mudou.

## Identidade de nó entre rodadas

Chave primária: **`id` do nó**. Edição no lugar preserva o id, e o pareamento
fica exato.

Chave secundária: **caminho** (`página/frame/nome[ordinal]/nome[ordinal]`).
Serve quando o designer duplica um frame ou recria um bloco — o id é novo, mas o
caminho bate. O diff casa por id, depois tenta caminho no que sobrou, e só então
classifica como adicionado/removido.

É por isso que a disciplina de nomes do espelho (`SectionCard · Título`,
`Chip`, `Botão · primária`) não é estética: sem ela o pareamento por caminho
falha e todo bloco recriado vira "removido + adicionado".

## O que o diff classifica sozinho

Aqui o mecanismo devolve mais do que economia de trabalho. Agrupando mudanças
idênticas — mesmo nome de nó, mesma propriedade, mesmo de→para — sai a
classificação que a skill `figma-trazer` pede:

```
paddingTop 16 → 12   em `SectionCard · *`   · 7 frames   → PRIMITIVO
fontSize 13.5 → 13   em `linha › texto`     · 23 frames  → TOKEN (escala)
ordem dos filhos                            · 1 frame    → COMPOSIÇÃO
```

A regra vira aritmética: **a mesma mudança em ≥ 2 frames é primitivo ou token;
em 1 frame é composição**. O que era julgamento passa a ser contagem — e o erro
clássico (aplicar na tela onde apareceu) fica difícil de cometer.

O agrupamento só funciona se a disciplina de nomes acima foi de fato seguida —
ele usa como chave o prefixo do nome antes de `' · '`. Quando a mesma mudança de
propriedade aparece em ≥ 2 frames, mas sob nomes que não compartilham prefixo, o
relatório diz isso explicitamente, numa seção `## Possível problema de
nomenclatura`, em vez de relatar calado N ajustes de composição avulsos. Essa
seção é o próprio mecanismo do diff pegando uma violação da convenção de nomes
— não algo que alguém precise notar no olho.

## Variáveis e estilos entram à parte

O retrato do frame guarda o *nome* do token, então mudar o **valor** de uma
variável não altera nenhum frame. Por isso o snapshot também retrata a coleção
de variáveis (nome → valor por modo, ex.: `Semântico/Claro`, `Semântico/Escuro`)
e os estilos de texto.

Diferença aí é sempre classe `token`, com efeito no app inteiro: entra no
relatório com aviso e exige varredura de regressão nos dois temas. No DSX, ela
não é aplicada à mão no CSS: `node tools/figma/figma-para-tokens.mjs` converte o
snapshot em diff DTCG, e a skill `tokens` aplica e roda `tools/build-tokens.mjs`
(que verifica o contraste de todos os pares declarados — falha bloqueia).

## O relatório

[tools/figma/diff-baseline.cjs](../../../tools/figma/diff-baseline.cjs) compara
dois baselines e emite markdown pronto para revisão:

```bash
node <DSX>/tools/figma/diff-baseline.cjs design/figma-baseline/app.json /tmp/atual.json
```

```markdown
## Tokens e estilos — classe `token`, afeta o app inteiro
- `space/stack-md` {"Primitivos/Valor":16} → {"Primitivos/Valor":12}  ⚠

## Agrupadas (≥ 2 frames) — classe `primitivo`
- `SectionCard` · auto-layout · padTop 16 → 12 · **7 frames**
  <sub>02 · Demandas › Lista · 02 · Demanda › Detalhe · …</sub>

## Possível problema de nomenclatura
- raio · 8 → 6 · **3 frames no total**, espalhada por: `CardResumo`, `Card de resumo`

## Por frame — classe `composição`
### 02 · Demandas › Lista
- `ManagerBar` · ordem dos filhos: 4 filhos → 5 filhos
- + `Chip` "Em risco" em `02 · Demandas/Lista[1]/linha[3]/Fase[1]`
- − `Botão · terciária` "Resolver" em `02 · Demandas/Lista[1]/Precisa de você hoje[1]/linha[2]`

## Frames novos no Figma
- + 09 · Propostas › Demandas · lista densa
```

O `.cjs` é obrigatório: o `package.json` do DSX é `"type": "module"`. O script
aceita também baselines do fluxo anterior com chaves em pt-BR (`variaveis`,
`estilos`, `nos`, `oculto`) — compatível com projetos que já tinham baseline
comitado.

Anexe screenshot do frame alterado ao lado do relatório: o texto diz o que
mudou, a imagem diz se ficou bom.

## Quando ainda vale duplicar o frame

O diff torna a página `09 · Propostas` **opcional**, não inútil. Duplique
quando a intenção for **explorar alternativas** (duas ou três versões lado a
lado para escolher) — aí você quer as duas coexistindo, e o diff da escolhida
vem depois. Para refino incremental de uma tela, editar no lugar é melhor: o
pareamento por id fica exato e o baseline guarda o "antes".

## Limites — diga em voz alta

- **O baseline é o "antes" de registro.** Não existe imagem do estado anterior a
  menos que alguém tenha salvo; o relatório descreve, não ilustra.
- **Componentização automática do MCP mexe no retrato.** Quando o servidor
  converte estruturas repetidas em componentes, muitos nós viram `INSTANCE` e o
  diff acusa mudança em massa. Reconheça o padrão (mudança idêntica em dezenas
  de frames, tipo `FRAME`→`INSTANCE`) e trate como ruído de ferramenta, não
  como decisão de design.
- **Reordenação profunda** aparece como remoção + adição quando nome e id mudam
  juntos. É raro, e o relatório mostra os dois lados para inspeção.
- **Arquivo grande demais para `MODE = 'full'` de uma vez.** A resposta de
  `use_figma` tem teto de tamanho; uma varredura completa de dezenas de rotas
  pode truncar no meio do JSON. Caia para `MODE = 'hashes'` e detalhe com
  `TARGETS` só o que o hash acusar (ver a skill `figma-ciclo`, passo 3 da rodada).
