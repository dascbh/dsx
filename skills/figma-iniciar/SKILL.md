---
name: figma-iniciar
description: "Monta o ciclo código ↔ Figma num projeto: registro de sincronia, Code Connect, primeiro baseline, changelog e reference. Use na primeira vez que o projeto vai trabalhar com Figma."
argument-hint: "[link ou fileKey do Figma]"
---

# figma-iniciar — montar o ciclo Figma↔código

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

Monte o ciclo Figma↔código neste projeto. Use a skill `figma-ciclo` como
doutrina e siga a seção "Primeira montagem do ciclo num projeto".

## 0. Pré-requisitos

- **MCP oficial do Figma** conectado, com as skills `figma-use` (obrigatória
  antes de todo `use_figma`), `figma-generate-library`, `figma-generate-design`,
  `figma-design-to-code` e `figma-create-new-file` disponíveis. Sem arquivo e
  sem link, crie um com `figma-create-new-file` em vez de pedir ao usuário que
  crie à mão.
- **Registro existente?** Se `design/figma-sync.md` já existir (ou um legado com
  `vez:`), o ciclo já foi montado: não recomece — leia a vez (`/dsx:figma-vez`)
  e siga a rodada da skill `figma-ciclo`.

## 1. Mapas antes de decidir

Confira `.dsx/maps/project-map.md` e `.dsx/maps/ui-map.md` primeiro. Se só
existir um legado — `.dsx/mapas/` (`mapa-projeto.md`, `mapa-ui.md`) ou
`.claude/figma-claude/` (`project-map.md`, `ui-map.md`) —
aceite-o e avise que será regravado em `.dsx/maps/` na próxima execução. Se
faltar qualquer um, rode `/dsx:mapear` antes de qualquer outra coisa — é ele
que diz com certeza de que lado o projeto nasceu (o campo `figma_cycle` de
`project-map.json` registra se já existe registro de sincronia ou baseline) em
vez de adivinhar abaixo. Se `design/as-is-to-be.md` também não existir, ofereça
`/dsx:confirmar-mapas` antes de montar o ciclo — tudo daqui em diante trata os
mapas como fato, e é ele que confirma que merecem confiança.

## 2. De que lado o projeto nasceu — a ordem muda

- **Tem código, não tem arquivo de design** → `/dsx:figma-levar` (a ida
  completa: `figma-fundacoes`, `figma-espelhar`, `figma-cobertura`, a partir do
  `DESIGN.md` + tokens do projeto). A vez começa em `code`.
- **Tem arquivo de design, não tem código** → skill `figma-primeiro`. Não
  espelhe: a primeira volta é implementação, não carga. A vez começa em
  `design`, e o baseline é tirado a cada leva implementada.
- **Tem os dois** → não monte do zero; rode `/dsx:figma-cobertura` primeiro
  para saber o tamanho da divergência e proponha o caminho (o que reespelhar, o
  que trazer, o que registrar como divergência conhecida).

## 3. Feche sempre com os artefatos, nesta ordem

1. **Code Connect** nos primitivos do kit (skill `figma-trazer`, seção 4) —
   barateia toda rodada seguinte.
2. **Convenções escritas no próprio arquivo** (skill `figma-convencoes`) — uma
   nota no canvas mais `.description` nos componentes do kit, e o contrato
   estrutural (páginas numeradas, nomes de frame como `Demandas · Lista (/demandas)` e
   `Diálogo · Novo produto (ProductsPage)`, `09 · Propostas` reservada para
   exploração), para que quem abrir o arquivo sem o DSX saiba o padrão de nomes
   em vez de quebrar sem querer o pareamento do ida-e-volta.
3. **Primeiro baseline comitado** — cole `tools/figma/snapshot.js` com
   `MODE = 'full'` num `use_figma` e salve o retorno em
   `design/figma-baseline/<arquivo>.json`. Arquivo grande demais para uma
   resposta: caia para `MODE = 'hashes'` e anote em `## Divergências conhecidas`
   (skill `figma-ciclo`, passo 3 da rodada).
4. **Registro de sincronia, changelog e referência — os três nascem juntos**,
   não em rodadas separadas:

   - `design/figma-sync.md` — com a vez definida e explicada ao usuário; é ele
     que o hook `turn-guard` lê para bloquear escrita indevida.

     ```markdown
     # Sincronia com o Figma

     file: <fileKey>  ·  https://figma.com/design/<fileKey>
     turn: code                        # code | design | applying
     since: <AAAA-MM-DD>
     baseline: design/figma-baseline/

     ## Rodadas
     - r1 · <AAAA-MM-DD> · <espelho completo | implementação inicial> (<páginas>, <N> frames) · turn → <turn>

     ## Pendentes (escopo desta rodada, ainda não construído)
     - Nenhuma

     ## Propostas abertas
     - Nenhuma

     ## Aplicadas na última rodada
     - Nenhuma

     ## Recusadas (com motivo, para não voltarem)
     - Nenhuma

     ## Divergências conhecidas
     - Nenhuma
     ```

   - `design/figma-changelog.jsonl` — a primeira linha (append-only daqui em
     diante), com contagens reais, não estimadas:

     ```jsonl
     {"round":"r1","date":"<AAAA-MM-DD>","direction":"code->figma","author":"figma-levar","summary":"espelho completo, 00-08, <N> frames","frames_created":<N>,"frames_changed":0,"frames_removed":0,"tokens_changed":[],"turn_after":"code","findings":"design/figma-findings/r1.md"}
     ```

     Na porta `figma-primeiro`, `direction` é `figma->code` e `author` é
     `figma-primeiro`.

   - `design/figma-reference.json` — os fatos atuais do arquivo (fileKey,
     páginas → id, coleções `Primitivos`/`Semântico`/`Componente` e seus modos,
     variáveis, estilos de texto, ícones, kit, e a lista `frames` que espelha a
     matriz de cobertura), para que todo agente leia com `Read` antes de
     redescobrir por API. Formato completo e regras de regeneração na skill
     `figma-convencoes`.

   Achados da primeira rodada (bug medido, ação sem efeito, token duplicado)
   vão para `design/figma-findings/r1.md`, com a severidade 0–4 do DSX (skill
   `revisar-ux`) — não ficam só na conversa.

## 4. A vez inicial

- Porta `figma-levar`: `turn: design` **só** se o espelho de fato cobriu tudo a
  que se propôs (confira a matriz de cobertura e se alguma tela/fluxo/estado foi
  adiada em vez de construída). Sobrou algo → liste em `## Pendentes` e mantenha
  `turn: code` até esvaziar. Primeiro espelho grande costuma rodar em várias
  passadas com orçamento fixo; uma delas adiar parte do escopo é normal — virar
  a vez com isso pendente não é.
- Porta `figma-primeiro`: `turn: design` desde o início; o Figma é a fonte
  enquanto o código não cobre o arquivo.

Termine dizendo ao usuário, em voz alta, as duas regras que ninguém lê depois:
**nunca reespelhar com a vez do design** e **regerar o baseline ao fechar a
rodada**.

Argumento recebido (link ou fileKey do Figma, se houver): $ARGUMENTS
