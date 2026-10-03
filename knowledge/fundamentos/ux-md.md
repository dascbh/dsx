# UX.md — contrato de experiência do produto

> **Quando consultar**
> - Ao criar, extrair do código ou avaliar o `UX.md` de um projeto (skill `ux-md`).
> - Antes de construir ou rearranjar uma tela (skills `construir-ui`, `arranjar-tela`): o `UX.md` diz que tipo de tela é, onde fica cada coisa e como ela se comporta.
> - Ao rodar a verificação de UX sobre capturas e mapa de fluxo (`tools/ux-lint/`).

## O que é

`UX.md` é o arquivo, na raiz do projeto, que descreve **como o produto se organiza e se comporta** — para pessoas e agentes. É o par do `DESIGN.md`:

| Arquivo | Responde | Exemplos de decisão |
|---|---|---|
| `DESIGN.md` | Como a interface **parece** | cor por papel, tipografia, raio, aparência dos componentes |
| `UX.md` | Como a interface **se organiza e se comporta** | tipos de tela e suas regiões, onde fica a ação primária, quantas primárias por região, modelo de navegação, política de confirmação e de feedback, estados obrigatórios, regras de formulário, vocabulário, limites de fluxo |
| `patterns/` (DSX) | Micro-decisões isoladas | modal ou página, onde exibir o erro, toast ou alerta |

O `UX.md` **escolhe e fixa** decisões que os padrões deixam em aberto ("qual destas opções este produto usa, sempre") e diz **em que tipo de tela** cada regra vale, apontando para os arquétipos do catálogo (`archetypes/`). Ele não repete os padrões: referencia-os pelo id.

Duas camadas, como no `DESIGN.md`:
1. **Front matter YAML** — decisões verificáveis por máquina; `tools/ux-lint/` lê daqui os limites e os seletores.
2. **Corpo Markdown** — o porquê, os critérios, o que nunca fazer.

Status do formato: `version: alpha`, próprio do DSX.

## Schema do front matter

```yaml
version: alpha
name: <produto>
description: <tipo de produto, público, densidade>
owner: <time ou pessoa>
updated: <AAAA-MM-DD>
product:
  persona: <quem usa e para quê>          # obrigatório
  register: operational                   # operational | consumer | editorial | brand (ver knowledge/design-system/escolher-design-system.md)
  platform: desktop                       # desktop | mobile | both
  density: high                           # low | medium | high
navigation:
  model: <ex.: "menu lateral + abas na página">
  max-depth: 3                            # níveis a partir da entrada do módulo
  back: mandatory                         # mandatory | optional — mandatory: toda tela não raiz tem caminho de volta visível
archetypes:                               # tipo de tela → rotas/telas do produto (ids de archetypes/)
  operational-list: ["/contratos"]
  editor-with-panel: ["/contratos/minutas/:id"]
actions:
  primary-per-region: 1                   # máximo de ações primárias (botão cheio) por região
  primary-position: top-right             # top-right | bottom-right | inline
  dialog-order: cancel-action             # cancel-action (Cancelar à esquerda) | action-cancel
  destructive-specific-label: true        # "Excluir minuta", nunca "Confirmar"/"OK"/"Sim"
confirmation:
  irreversible: dialog                    # dialog | type-name
  reversible: undo                        # undo | none
feedback:
  success: toast                          # toast | inline | page
  field-error: inline
  system-error: page-alert
  skeleton-after-ms: 1000
states: [loading, empty, error, no-access, success]   # toda tela implementa estes
forms:
  label: always-visible                   # nunca só placeholder
  validation: on-blur                     # on-blur | on-submit | realtime
  required: mark-required                 # mark-required | mark-optional
content:
  glossary: <caminho do glossário ou "inline">
  buttons: verb-object                    # "Criar aditivo", não "OK"
  forbidden: [snapshot, tenant, RLS]      # termos de implementação que nunca aparecem na tela
  proper-nouns: [Word, Excel]             # nomes próprios do domínio, fora da regra de caixa de título (X10)
flows:
  max-journey-steps: 12
  max-stacked-dialogs: 1
  dead-ends: 0                            # telas (não diálogo) sem nenhuma saída
verification:                             # como o ux-lint reconhece o kit do projeto nas capturas
  selectors:
    regions: ["header", "nav", "aside", "main", "[role=dialog]"]
    dialog: "[role=dialog]"
    dialog-footer: ".MuiDialogActions-root"   # opcional: onde ficam os botões do diálogo (T2); sem ele, o ux-lint infere
    primary: ".MuiButton-contained"
    destructive: ".MuiButton-containedError, .MuiButton-colorError"
    button: "button, [role=button]"
    field: "input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), textarea, select"
```

Chaves e valores do front matter são em inglês; o texto livre (persona, modelo, rotas) e o corpo, em pt-BR.

Chaves desconhecidas geram aviso no linter (`tools/lint-ux-md.mjs`). Valores podem ser omitidos; omitido = vale o padrão do DSX acima.

**Transição de nomes (2026-10, `docs/renames-2026-10.md`).** Até a versão 0.4 as chaves e os valores eram em português (`produto.registro: operacional`, `acoes.posicao-primaria: topo-direita`, `estados: [carregando, …]`, ids de arquétipo como `lista-operacional`). O linter e o `ux-lint` ainda **leem** esses nomes, convertem para os novos e avisam "nome antigo, renomeie para X"; nada é escrito com nome antigo. A tabela de conversão é uma só: `tools/ux-lint/lib/legacy.mjs`. Flags antigas das ferramentas (`--arquetipos`, `--telas`, `--falhar-em`…) funcionam como apelido com aviso, pela tabela `tools/lib/legacy-cli.mjs`.

**Convenção de chaves:** o front matter YAML do `UX.md` usa kebab-case (`primary-position`, `skeleton-after-ms`); o mapa `flows-<module>.json` e toda saída `--json` do `ux-lint` usam snake_case (`persona_switches`, `by_rule`, `dialog_open`).

## Seções do corpo (nesta ordem)

| # | Seção (`##`) | Deve responder |
|---|---|---|
| 1 | Visão geral | Para quem, para quê, em que contexto de uso; o que a experiência nunca faz |
| 2 | Personas e tarefas | Tarefas principais por persona, frequência, o que é crítico errar |
| 3 | Arquitetura da informação | Onde cada coisa mora; nomes das áreas; o que é entrada, o que é detalhe |
| 4 | Navegação | Modelo, profundidade, como se volta, como se sabe onde se está |
| 5 | Arquétipos de tela | Que tipo é cada tela (link para `archetypes/<id>.md`) e desvios declarados |
| 6 | Layout e regiões | Regiões fixas do produto (cabeçalho, menu, conteúdo, painel), o que vai em cada uma |
| 7 | Ações | Hierarquia, posição, quantas primárias, destrutivas, desabilitado × escondido |
| 8 | Feedback e estados | Política de feedback; os cinco estados e como cada tipo de tela os mostra |
| 9 | Formulários | Rótulos, validação, obrigatórios, longos × curtos (diálogo × página) |
| 10 | Conteúdo e microcopy | Glossário, verbos, tom, termos proibidos, fórmulas de erro/vazio/confirmação |
| 11 | Fluxos | Jornadas principais, limites, onde a pessoa troca (ex.: link para terceiro) |
| 12 | Faça e não faça | ≥ 3 cada, derivados de problemas reais |
| 13 | Instruções para agentes | Quando consultar, o que preservar, como validar |

Títulos em pt-BR (acima) são os canônicos. Equivalentes em inglês aceitos pelo linter: Overview, Personas & Tasks, Information Architecture, Navigation, Screen Archetypes, Layout & Regions, Actions, Feedback & States, Forms, Content & Microcopy, Flows, Do's and Don'ts, Agent Instructions.

## Arquétipos de tela (`archetypes/`)

O catálogo de **tipos de tela** do DSX — o nível acima dos padrões. Cada cartão `archetypes/<id>.md` tem:

```yaml
---
id: operational-list
title: Lista operacional
summary: <uma frase>
register: [operational]
when-to-use: <frase SE→ENTÃO>
avoid-when: <frase>
regions: [page-header, filter-bar, content, list-footer]
primary-action: { region: page-header, position: top-right, max: 1 }
states: [loading, empty, empty-filtered, error, no-access]
patterns: [filter-structure, active-filters, table-pagination, table-sorting, empty-state]   # ids de patterns/
variations: [with-bulk-actions, cards-on-mobile]
rules: [T1, T3, T4]                       # regras do ux-lint que se aplicam
---
```

Os cinco estados de `states` no UX.md são o **mínimo**; um arquétipo pode exigir estados próprios (`expired-link`, `nothing-selected`, `conflict`…). `primary-action` descreve a região de ação principal; se o arquétipo tem outra (ex.: master-detail: criar no cabeçalho, resolver no detalhe), descreva-a no corpo, em **Ações** — o limite do T1 vale por região de qualquer forma.

Corpo: **Quando usar** (SE → ENTÃO), **Mapa de regiões** (diagrama ASCII), **O que vai em cada região**, **Ações**, **Estados**, **Variações** (cada uma com o que favorece e o que piora — são os "arranjos" oferecidos pela skill `arranjar-tela`), **Anti-padrões**, **Checklist**.

## Verificação (`tools/ux-lint/`)

| Id | Nível | Regra | Fonte do limite |
|---|---|---|---|
| T1 | tela | No máximo `actions.primary-per-region` ações primárias por região (diálogo conta como região própria; a página atrás de um diálogo não conta) | `actions`, `verification.selectors` |
| T2 | tela | Em diálogo, a ação de cancelar fica antes (à esquerda) da ação principal, conforme `actions.dialog-order` | `actions.dialog-order` |
| T3 | tela | Exatamente um título principal (`h1`) por tela; em captura com diálogo aberto não é avaliada (a tela de base é avaliada na própria captura) | — |
| T4 | tela | Todo campo tem rótulo visível ou nome acessível; placeholder sozinho reprova | `forms.label` |
| T5 | tela | Ação destrutiva com rótulo genérico ("Confirmar", "OK", "Sim", "Continuar") reprova | `actions.destructive-specific-label` |
| T6 | tela | Termo de `content.forbidden` no texto visível reprova | `content.forbidden` |
| T7 | tela | Botão com rótulo que não é verbo + objeto ("OK", "Sim", "Enviar" sozinho em contexto ambíguo) gera aviso | `content.buttons` |
| F1 | fluxo | Tela (não diálogo) sem nenhuma transição de saída | `flows.dead-ends` |
| F2 | fluxo | Tela fora de todas as jornadas (órfã de jornada) — aviso, não erro | — |
| F3 | fluxo | Jornada com mais passos que `flows.max-journey-steps` | `flows` |
| F4 | fluxo | Diálogo aberto a partir de outro diálogo além de `flows.max-stacked-dialogs` | `flows` |
| F5 | fluxo | Tela não raiz sem transição de volta (para a tela de onde se chega ou para a mãe) | `navigation.back` |
| S1 | estados | Estado obrigatório da tela sem captura `<nn>-<tela>.<estado>.html` (regra do que é obrigatório em "Estados", abaixo) | `states`, `archetypes` + `states` do arquétipo |
| S2 | estados | Captura de vazio ou erro sem botão ou link de saída na região do estado | — |
| S3 | estados | Mensagem de erro sem orientação: só "erro", "falhou", código, ou explicação sem verbo do que fazer e sem ação junto | — |
| C1 | consistência | Mesma ação com rótulos diferentes entre telas (grupos de verbo; critério em "Consistência", abaixo) | — |
| C2 | consistência | Mesmo rótulo de botão com variantes visuais diferentes (cheio × contornado × texto) no mesmo contexto | — |
| C3 | consistência | Mesmo conceito com nomes diferentes nos títulos e abas | `content.glossary` |
| L1 | layout | Ação primária fora da posição declarada (sev 2) | `primary-action.position` do arquétipo da tela; sem arquétipo, `actions.primary-position` |
| L2 | hierarquia | Mais de N elementos de peso visual alto na primeira dobra: botão cheio, texto ≥ 1,25× o corpo em negrito, bloco de cor saturada (sev 2) | `layout.max-emphasis` (padrão 3) |
| L3 | hierarquia | Escala de títulos quebrada: `h1` não é o maior texto da tela, ou nível inferior maior que o superior (sev 2) | — |
| L4 | layout | Campos/rótulos de um formulário ou cartões irmãos com bordas esquerdas em mais de 2 posições (ou mais que as colunas da grade), tolerância 4 px (sev 1) | `layout.align-tolerance`, `layout.max-left-edges` |
| L5 | layout | Proximidade: rótulo a mais de 16 px do campo; botões do mesmo grupo a mais de 48 px; elemento mais perto do grupo vizinho que do seu (sev 1) | `layout.label-gap`, `layout.action-gap` |
| L6 | hierarquia | Título ou ação primária fora dos primeiros 900 px (sev 2) | `layout.fold` |
| L7 | layout | Texto corrido com mais de 90 caracteres por linha (sev 1) | `layout.max-line-chars` |
| L8 | layout | Alvo clicável menor que 24×24 px sem espaço livre em volta (WCAG 2.5.8) (sev 2) | `layout.min-target` |
| L9 | layout | Região do arquétipo declarado ausente na tela (sev 1) | `archetypes` + `regions` do arquétipo |

Entradas: capturas HTML das telas (ex.: skill de captura pelo código do projeto) e o mapa de fluxo `.dsx/maps/flows-<module>.json`:

```json
{ "screens": [{ "id": "lista", "name": "Contratos", "type": "page", "route": "/contratos", "parent": null, "persona": "analista" }],
  "transitions": [{ "id": "t1", "from": "lista", "to": "detalhe", "trigger": { "type": "button", "label": "Abrir" }, "evidence": "src/Lista.tsx:42" }],
  "journeys": [{ "id": "j1", "name": "Renovar contrato", "steps": ["t1", "t2"], "persona_switches": [] }] }
```

`type` da tela: `page`, `dialog`, `tab`, `panel` ou `drawer` (`dialog` e `modal` contam como diálogo nas regras F1/F4). O formato antigo (`telas`, `transicoes` com `de`/`para`, `gatilho {tipo, rotulo}`, `evidencia`, `jornadas` com `passos` e `trocas_persona`, tipo `dialogo`) é lido com aviso.

Saída (`--json`): achados com `rule`, `severity` (0–4, escala de `heuristicas-nielsen.md`), `message`, `evidence` e a tela (`screen`, no fluxo) ou região (`region`, na tela); `--fail-at <n>` define a severidade que faz o comando sair com 1 (padrão 3).

**Regiões.** O T1 conta primárias por região reconhecida pelos seletores. Se o produto põe barra de ações, conteúdo e painel lateral dentro de um único `main`, o T1 trata tudo como uma região: marque `aside`/`section` com nome no código ou declare seletores de região mais finos em `verification.selectors.regions`. Um achado de T1 numa `main` grande pode ser falta de semântica, não excesso de primárias — confira na captura.

**Estados (`tools/ux-lint/states.mjs`).** `node tools/ux-lint/states.mjs <pasta-de-capturas> [--ux UX.md] [--archetypes <pasta>] [--json]`. Convenção de captura: `<nn>-<tela>.html` é o estado principal (com dado; num diálogo, o diálogo aberto) e `<nn>-<tela>.<estado>.html` é cada outro estado, com o mesmo `nn` e o mesmo id da tela (`02-acervo.empty.html`, `03-documento.error.html`); o estado usa os ids de `states` (`loading`, `empty`, `empty-filtered`, `error`, `no-access`, ou um do arquétipo). Tipo e mãe de cada tela vêm do `capture-order.json` da pasta (ou da pasta acima), quando existe; sem ele, toda tela que não é diálogo é página. O que é obrigatório, por tipo de tela:

- **Página** — `states` do UX.md ∪ `states` do arquétipo (`archetypes` do UX.md diz qual é), menos o principal (`success`) e os momentâneos (`running`, `submitting`, `saving`). `empty` e `empty-filtered` do UX.md só valem quando o arquétipo tem algum estado vazio (lista, biblioteca, painel de acompanhamento) ou quando a tela não tem arquétipo: detalhe e editor não têm lista vazia.
- **Filha** — aba, painel ou passo com mãe capturada: só o que a mãe ainda não exige; carregar, erro e sem acesso são da mãe.
- **Diálogo** — `error` quando o diálogo tem ação que chama o servidor (primária ou destrutiva), e `field-error` quando o arquétipo o declara e há campo obrigatório. Diálogo não tem `loading`, `empty` nem `no-access`; o principal é `open`.
- **Painel sem arquétipo nem mãe** (ex.: o menu) — nada; declare o arquétipo para exigir estados.

O S2 procura a mensagem do estado (alerta de erro; no vazio, o texto "Nenhum…", "Ainda não…") e olha a região dela (`verification.selectors.regions`, ou o diálogo): abas, ordenação, campos e botões desabilitados não contam como saída. O S3 lê cada alerta de erro (na captura de erro, qualquer `role=alert`) e aceita a mensagem que tem verbo de próximo passo ("tente", "verifique", "peça", "de novo"…) ou uma ação dentro do próprio alerta, salvo quando o texto é só falha ou código.

**Consistência (`tools/ux-lint/consistency.mjs`).** `node tools/ux-lint/consistency.mjs <pasta-de-capturas> [--ux UX.md] [--json]`. Compara o inventário de botões, títulos e abas de todas as capturas (o mesmo inventário do verificador de texto). Critério de "mesma ação" no C1: mesmo grupo de verbo — excluir/remover/apagar; salvar/gravar; criar/novo/adicionar; editar/alterar; baixar/exportar/download — sobre o mesmo objeto (a primeira palavra de conteúdo depois do verbo, sem plural; "Adicionar à minuta" tem destino, não objeto). Rótulo só com verbo pega o objeto do nome acessível ou do título do diálogo; sem objeto nenhum, fica fora. Cancelar/voltar/fechar só conta dentro de diálogo e com o mesmo papel: "dispensar" quando o rodapé tem ação principal, "fechar" quando não tem; o ✕ de ícone fica fora. O C2 compara o mesmo rótulo só no mesmo contexto: o gatilho na página ("Remover", texto) e a confirmação no diálogo ("Remover", cheio) têm papéis diferentes. O C3 usa o glossário (`content.glossary`: caminho de um `.md` com tabela de colunas "Termo" e "Nunca chamar de"/"Evitar", mapa termo → sinônimos, ou `inline` para a tabela no próprio UX.md) e uma lista curta de pares conhecidos (configurações × preferências, modelo × template…); termo de evitar que é termo canônico de outra linha não conta. Glossário de outro domínio do produto (ex.: o do Tributário aplicado a Contratos) gera falso positivo: declare o glossário do módulo.

Os dois escrevem `--json` em `snake_case`, que o registro de achados lê (`findings.mjs register --states st.json --consistency c.json`; famílias `states` e `consistency`, ids `st-` e `c-`).

**Layout e hierarquia (`tools/ux-lint/measure.mjs` + `tools/ux-lint/layout.mjs`).** O parser de HTML não calcula layout; a geometria vem de um navegador. Dois passos:

1. `node tools/ux-lint/measure.mjs <pasta-de-capturas> --out <pasta-geometria> [--ux UX.md] [--width 1440]` abre cada captura estática (`file://`, sem servidor) em janela de 1440×900, espera fontes e rede, e grava `<nome>.geometry.json` com caixa, fonte, cor, região e papel de cada elemento relevante (formato documentado no topo de `tools/ux-lint/lib/geometry.mjs`). O Playwright é do projeto, não do DSX: o comando o procura (`playwright` ou `@playwright/test`) a partir do diretório atual e, sem ele, explica como instalar — a análise L fica indisponível.
2. `node tools/ux-lint/layout.mjs <pasta-geometria> [--ux UX.md] [--archetypes <pasta>] [--json] [--fail-at 3]` aplica L1–L9 sem navegador. A tela liga-se ao arquétipo pelo id no nome da captura (`<nn>-<tela>`), comparado com os ids e rotas de `archetypes` (a rota é comparada com o `<title>` da captura); do cartão vêm `regions` (L9) e `primary-action.position` (L1). O L9 só roda no estado principal (captura sem sufixo de estado).

Como cada regra mede: o **L1** compara o centro da primária com a caixa de referência (o diálogo, ou o `main`): *top-right* = metade direita (centro além de 60% da largura) e topo a até 240 px do início do conteúdo; *bottom-right* = 60% à direita e no último quarto (no diálogo, último terço); *inline* não é cobrado. Basta uma primária em foco na posição; a primária de um painel lateral não conta quando o arquétipo pede a primária no cabeçalho. O **L2** conta, só na primeira dobra e fora do cabeçalho e menu do produto, botões cheios (seletor `primary` ou fundo saturado), textos ≥ 1,25× o corpo com peso ≥ 600 e blocos de fundo saturado com ≥ 2.500 px²; o que está dentro de outro elemento contado, e blocos saturados encostados (células de um cabeçalho de tabela), contam uma vez. O **L3** compara tamanhos de fonte calculados (números puros, como o valor de um indicador, não contam como "texto maior"). O **L4** agrupa campos por formulário, fieldset, diálogo, painel ou cartão mais próximo e mede a borda esquerda do contorno do campo (não do `<input>` interno); rótulo flutuante dentro do campo não é borda. O **L5** forma grupos de botões pelo pai no DOM, fundindo botões encostados (≤ 8 px) na mesma linha; links não formam grupo, destrutiva afastada de propósito e vão preenchido por conteúdo (o "pág. 1 de 3" entre anterior e próxima) não reprovam. O **L6** mede a partir do topo da página — ou do topo do diálogo, porque o diálogo é fixo na janela e a captura estática não limita a altura dele; título e primária dentro do cabeçalho/rodapé do diálogo não reprovam. O **L7** só olha texto corrido (duas linhas ou mais, ou uma linha com ≥ 120 caracteres) e calcula caracteres por linha pelo número de linhas renderizadas (altura ÷ entrelinha). O **L8** aplica a exceção de espaçamento da WCAG (círculo de 24 px em volta do alvo sem tocar outro alvo) e a de link dentro de frase; alvos repetidos com o mesmo rótulo na mesma região viram um achado. O **L9** procura a região pela marcação declarada (`data-region="<id>"` no código ou `verification.selectors.archetype-regions: { side-panel: "aside.painel" }` no UX.md; título, conteúdo e ações de diálogo, stepper e paginação do MUI já vêm reconhecidos) e, sem ela, por heurística geométrica (coluna à direita para painel, faixa de controles para barra de ferramentas, bloco largo para área de conteúdo); `bulk-actions-bar`, `danger-zone` e `quick-view` só aparecem em certas condições e não são cobradas.

Limites mudam pela chave opcional `layout` do front matter (kebab-case: `fold`, `max-emphasis`, `emphasis-ratio`, `align-tolerance`, `max-left-edges`, `label-gap`, `action-gap`, `max-line-chars`, `min-target`, `top-band`). O `--json` em `snake_case` traz, por achado, `rule`, `severity`, `region`, `message` (com a medida), `anchor` (rótulo ou seletor do elemento, sem coordenadas), `evidence` (`captura.html › caminho do elemento`), `elements` e `measure`; o registro de achados o lê com `findings.mjs register --layout l.json` (família `layout`, ids `l-`, âncora tela + regra + região + elemento — a medida pode mudar sem mudar o id). Sinais de falso positivo a conferir na captura: desvio já declarado na seção 5 (primária "Adicionar" dentro de um diálogo de gestão, editor sem painel), tela que na verdade é um estado do arquétipo (página "já respondido" sem área de decisão) e títulos em sobrelinha (caixa alta pequena acima de cartões) no L3.

O que a máquina não mede — clareza da hierarquia, adequação do arquétipo à tarefa, carga cognitiva, se o texto se entende — fica com a revisão por julgamento (skill `revisar-ux`, percurso cognitivo da jornada sobre as capturas).

## Checklist

- [ ] Front matter com `product`, `navigation`, `archetypes`, `actions`, `confirmation`, `feedback`, `states`, `forms`, `content`, `flows` e `verification.selectors`, em inglês (o linter aceita os nomes antigos com aviso).
- [ ] Toda tela do produto mapeada a um arquétipo (ou desvio declarado na seção 5).
- [ ] 13 seções, na ordem; Faça e não faça com ≥ 3 itens cada, vindos de problemas reais.
- [ ] `node tools/lint-ux-md.mjs UX.md` sem erro.
- [ ] `node tools/ux-lint/flow.mjs` e `node tools/ux-lint/screen.mjs` rodados; achados de severidade ≥ 3 viraram dívida registrada.
- [ ] Geometria medida (`measure.mjs`) e `layout.mjs` rodado; achados L de severidade 2 conferidos na captura antes de virar dívida.
- [ ] Estados capturados (`<nn>-<tela>.<estado>.html`) e `node tools/ux-lint/states.mjs` e `consistency.mjs` rodados sobre a pasta de capturas.
