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

Entradas: capturas HTML das telas (ex.: skill de captura pelo código do projeto) e o mapa de fluxo `.dsx/maps/flows-<module>.json`:

```json
{ "screens": [{ "id": "lista", "name": "Contratos", "type": "page", "route": "/contratos", "parent": null, "persona": "analista" }],
  "transitions": [{ "id": "t1", "from": "lista", "to": "detalhe", "trigger": { "type": "button", "label": "Abrir" }, "evidence": "src/Lista.tsx:42" }],
  "journeys": [{ "id": "j1", "name": "Renovar contrato", "steps": ["t1", "t2"], "persona_switches": [] }] }
```

`type` da tela: `page`, `dialog`, `tab`, `panel` ou `drawer` (`dialog` e `modal` contam como diálogo nas regras F1/F4). O formato antigo (`telas`, `transicoes` com `de`/`para`, `gatilho {tipo, rotulo}`, `evidencia`, `jornadas` com `passos` e `trocas_persona`, tipo `dialogo`) é lido com aviso.

Saída (`--json`): achados com `rule`, `severity` (0–4, escala de `heuristicas-nielsen.md`), `message`, `evidence` e a tela (`screen`, no fluxo) ou região (`region`, na tela); `--fail-at <n>` define a severidade que faz o comando sair com 1 (padrão 3).

**Regiões.** O T1 conta primárias por região reconhecida pelos seletores. Se o produto põe barra de ações, conteúdo e painel lateral dentro de um único `main`, o T1 trata tudo como uma região: marque `aside`/`section` com nome no código ou declare seletores de região mais finos em `verification.selectors.regions`. Um achado de T1 numa `main` grande pode ser falta de semântica, não excesso de primárias — confira na captura.

O que a máquina não mede — clareza da hierarquia, adequação do arquétipo à tarefa, carga cognitiva, se o texto se entende — fica com a revisão por julgamento (skill `revisar-ux`, percurso cognitivo da jornada sobre as capturas).

## Checklist

- [ ] Front matter com `product`, `navigation`, `archetypes`, `actions`, `confirmation`, `feedback`, `states`, `forms`, `content`, `flows` e `verification.selectors`, em inglês (o linter aceita os nomes antigos com aviso).
- [ ] Toda tela do produto mapeada a um arquétipo (ou desvio declarado na seção 5).
- [ ] 13 seções, na ordem; Faça e não faça com ≥ 3 itens cada, vindos de problemas reais.
- [ ] `node tools/lint-ux-md.mjs UX.md` sem erro.
- [ ] `node tools/ux-lint/flow.mjs` e `node tools/ux-lint/screen.mjs` rodados; achados de severidade ≥ 3 viraram dívida registrada.
