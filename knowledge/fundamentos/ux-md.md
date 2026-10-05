# UX.md — contrato de experiência do produto

> **Quando consultar**
> - Ao criar, extrair do código ou avaliar o `UX.md` de um projeto (skill `ux-md`).
> - Antes de construir ou rearranjar uma tela (skills `construir-ui`, `arranjar-tela`): o `UX.md` diz que tipo de tela é, onde fica cada coisa e como ela se comporta.
> - Ao rodar a verificação de UX sobre capturas e mapa de fluxo (`tools/ux-lint/`).
> - Ao pontuar o `UX.md` (rubrica de 100 pontos e gates), conferir se ele ainda descreve o produto (drift) ou declarar um desvio que silencia achados.

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

O `UX.md` tem a mesma importância e a mesma dinâmica do `DESIGN.md`: é criado e ligado ao contexto dos agentes pela skill `iniciar`, a skill `construir-ui` para sem ele, tem nota de 100 pontos com gates (`lint-ux-md.mjs --score`, rubrica `evals/rubrics/ux-md.yaml`) e conferência de drift contra o produto (`tools/ux-lint/ux-md-drift.mjs`). Toda mudança de UI que altera comportamento atualiza o `UX.md` no mesmo commit. Inventário de onde cada um é tratado: `docs/ux-md-parity.md`.

Formato: `format: alpha`, próprio do DSX. `version` é a versão **do documento** (semver), não do formato.

## Schema do front matter

```yaml
version: 1.3.0                            # versão deste documento (semver; ver "Versão e frescor")
format: alpha                             # versão do formato UX.md do DSX
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
  operational-list: ["/orders"]
  editor-with-panel: ["/orders/:id/edit"]
actions:
  primary-per-region: 1                   # máximo de ações primárias (botão cheio) por região
  primary-position: top-right             # top-right | bottom-right | inline
  dialog-order: cancel-action             # cancel-action (Cancelar à esquerda) | action-cancel
  destructive-specific-label: true        # "Excluir pedido", nunca "Confirmar"/"OK"/"Sim"
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
  glossary: <caminho do glossário ou "inline">   # ou por módulo: { default: <caminho>, purchasing: <caminho ou inline> }
  buttons: verb-object                    # "Criar pedido", não "OK"
  forbidden: [snapshot, tenant, RLS]      # termos de implementação que nunca aparecem na tela
  proper-nouns: [Word, Excel]             # nomes próprios do domínio, fora da regra de caixa de título (X10)
flows:
  max-journey-steps: 12
  max-stacked-dialogs: 1
  dead-ends: 0                            # telas (não diálogo) sem nenhuma saída
paths:                                    # onde as ferramentas acham os artefatos (docs/project-paths.md); omitido = padrão do DSX
  captures: .dsx/captures/<module>        # capturas <nn>-<tela>[.<estado>].html; <module> vira o módulo
  code: [src]                             # pastas onde o texto nasce; sem isso, detectadas pela stack
verification:                             # como o ux-lint reconhece o kit do projeto nas capturas
  kit: auto                               # perfil de seletores: auto | generic | mui | shadcn | chakra | antd | bootstrap (tools/ux-lint/lib/kits.mjs)
  selectors:                              # cada chave declarada vence o perfil do kit
    regions: ["header", "nav", "aside", "main", "[role=dialog]"]
    dialog: "[role=dialog]"
    dialog-footer: ".modal-footer"        # opcional: onde ficam os botões do diálogo (T2); sem ele, vale o do kit ou o ux-lint infere
    primary: ".btn-primary"               # opcional: sem ele, vale o do kit
    destructive: ".btn-danger"            # opcional: sem ele, vale o do kit
    button: "button, [role=button]"
    field: "input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), textarea, select"
deviations:                               # desvios aceitos (ver "Desvios declarados"); silenciam os achados cobertos
  - id: D3
    screens: [modelo-editor, lote-passo-1] # ids das telas no mapa/capturas; "*" = todas
    rules: [T3, L6]                       # ids de regra (T, F, S, C, L, X, U); vazio = só documental
    reason: "Tarefa dentro da aba Biblioteca; o h1 é o da página"
    decided-by: "dono do produto"
    until: 2026-12-31                     # opcional: depois disso o desvio não cobre mais nada
```

Chaves e valores do front matter são em inglês; o texto livre (persona, modelo, rotas) e o corpo, em pt-BR.

Chaves desconhecidas geram aviso no linter (`tools/lint-ux-md.mjs`). Valores podem ser omitidos; omitido = vale o padrão do DSX acima.

**Transição de nomes (2026-10, `docs/renames-2026-10.md`).** Até a versão 0.4 as chaves e os valores eram em português (`produto.registro: operacional`, `acoes.posicao-primaria: topo-direita`, `estados: [carregando, …]`, ids de arquétipo como `lista-operacional`). O linter e o `ux-lint` ainda **leem** esses nomes, convertem para os novos e avisam "nome antigo, renomeie para X"; nada é escrito com nome antigo. A tabela de conversão é uma só: `tools/ux-lint/lib/legacy.mjs`. Flags antigas das ferramentas (`--arquetipos`, `--telas`, `--falhar-em`…) funcionam como apelido com aviso, pela tabela `tools/lib/legacy-cli.mjs`.

**Convenção de chaves:** o front matter YAML do `UX.md` usa kebab-case (`primary-position`, `skeleton-after-ms`); o mapa `flows-<module>.json` e toda saída `--json` do `ux-lint` usam snake_case (`persona_switches`, `by_rule`, `dialog_open`).

## Versão e frescor

- `version` é semver do documento. **Menor** (1.2.0 → 1.3.0): arquétipo novo ou trocado, política nova ou mudada (`actions`, `confirmation`, `feedback`, `forms`, `navigation`, `flows`, `states`), desvio novo ou retirado. **Patch** (1.2.0 → 1.2.1): só texto, exemplo, evidência, correção de redação. **Maior** (1.x → 2.0.0): mudança que invalida o que agentes já construíram (modelo de navegação, `product.register`, troca de kit que muda os seletores).
- `updated` (AAAA-MM-DD) muda junto com `version`.
- **Mesma mudança, mesmo commit:** tela nova, tela removida, arquétipo, política, estado ou fluxo alterado no código atualiza o `UX.md` (e o mapa `.dsx/maps/flows-<module>.json`) no mesmo commit. O drift (U5) acusa `updated` mais velho que a última mudança do mapa ou das capturas.
- Até o DSX 0.6, `version: alpha` era a versão do formato. O linter ainda aceita, com aviso: troque por `version: 1.0.0` e `format: alpha`.

## Desvios declarados

A tabela de desvios da seção 5 (D1, D2…) explica por que uma tela difere do cartão do arquétipo ou de uma política. O bloco `deviations` do front matter é a versão verificável dela: cada desvio diz **quais telas** (`screens`, ids do mapa de fluxo ou das capturas) e **quais regras** (`rules`, ids T/F/S/C/L/X ou U do drift) ele cobre, o motivo (`reason`), quem aceitou (`decided-by`) e, opcionalmente, até quando (`until`).

- Um achado do ux-lint fica coberto quando a regra dele está em `rules` e todas as telas dele estão em `screens`. No registro de achados ele vira `accepted-deviation`: não conta como aberto nem na trava (`findings.mjs check`), aparece na página com o motivo e volta a `open` quando o desvio sai do `UX.md` ou vence (`knowledge/fundamentos/achados-de-ux.md`).
- `rules: []` deixa o desvio só documental: explica, mas não silencia nada.
- Tela listada num desvio conta como "declarada" para a cobertura (U1 e gate `essential-coverage`).
- O linter confere que os ids da tabela do corpo e do bloco são os mesmos.
- Desvio não é dívida disfarçada: o que o produto deveria corrigir vai em "Não faça" (com prazo no backlog), não em `deviations`. Dívida que precisa ficar quieta por um tempo pode ser desvio com `until`.

## Nota e gates (rubrica de 100 pontos)

`node tools/lint-ux-md.mjs UX.md --score [--map .dsx/maps/flows-<module>.json] [--screens <capturas>] [--geometry <pasta>] [--json]` calcula a nota de forma determinística, com evidência por critério (rubrica completa em `evals/rubrics/ux-md.yaml`):

| Critério | Peso | Como mede |
|---|---:|---|
| Cobertura de telas com arquétipo | 20 | telas do mapa e das capturas com arquétipo ou desvio; sem inventário, no máximo metade |
| Políticas declaradas com evidência | 15 | as 15 chaves de política declaradas + referências `arquivo:linha` e padrões citados no corpo (15 = cheio) |
| Estados declarados e descritos | 10 | os 5 estados base em `states` e descritos em "Feedback e estados" |
| Fluxos com limites justificados | 10 | `flows` completo, jornadas na seção 11 e limites citados no texto |
| Glossário resolvível | 10 | `content.glossary` declarado, resolve e tem termos com "nunca chamar de" (8 = cheio); por módulo, média |
| Faça e não faça concretos | 10 | ≥ 3 em cada bloco e itens com âncora concreta (tela, arquivo, número, rótulo exato) |
| Seletores de verificação | 10 | seletores básicos + `dialog-footer` ou `archetype-regions` |
| Frescor | 10 | `version` semver, `updated` válido e recente (≤ 90 dias), sem telas mais novas que ele |
| Desvios estruturados | 5 | tabela do corpo e bloco `deviations` com os mesmos ids |

Faixas: **90–100** robusto · **75–89** utilizável com lacunas · **60–74** revisar antes de virar autoridade · **< 60** alto risco (o agente vai inventar comportamento).

Gates (qualquer ✘ reprova, independentemente da nota): `lint` (0 erros), `essential-coverage` (toda tela do inventário com arquétipo ou desvio), `policy-fidelity` (nenhuma política contrariada pela maioria das telas medidas; o resto por amostra humana), `connected-to-agent` (`CLAUDE.md`, `AGENTS.md` ou regra de ferramenta do projeto cita o `UX.md`) e `no-conflict` (juiz). Critérios abertos — o arquétipo casa com a tarefa, as políticas são reais, os itens vêm de problemas reais, as instruções são acionáveis, o desvio é justificado — ficam com o subagente `juiz-de-evals`, pela rubrica.

## Drift UX.md × produto (`tools/ux-lint/ux-md-drift.mjs`)

`node tools/ux-lint/ux-md-drift.mjs UX.md [--map <mapa>] [--screens <capturas>] [--geometry <pasta>] [--module <m> --root <projeto>] [--json] [--fail-at 2]` confronta o arquivo com o produto, como a conferência front matter × código faz com o `DESIGN.md`. A auditoria (`audit.mjs`) roda o drift como pré-requisito e avisa "UX.md desatualizado: …" no relatório.

| Id | Sev | Acusa |
|---|---|---|
| U1 | 2 | Tela do mapa ou das capturas sem arquétipo e fora de todo desvio |
| U2 | 2 | Entrada de `archetypes` que não nomeia nenhuma tela do mapa (tela removida ou renomeada) |
| U3 | 2 | Política que a maioria (mais da metade, mínimo 2 telas) das telas de um arquétipo já não segue: `primary-per-region` (T1), `dialog-order` (T2), `destructive-specific-label` (T5) e, com geometria, `primary-position` (L1). Telas cobertas por desvio da regra não contam |
| U4 | 2 | Estado de `states` que nenhuma captura tem (`<nn>-<tela>.<estado>.html`) |
| U5 | 1 | `updated` anterior à última mudança do mapa ou das capturas (último commit; sem git, data do arquivo) |
| U6 | 1 | Desvio vencido (`until` no passado) ou que cita tela fora do mapa |

O drift não entra no registro de achados: ele diz que o **documento** está velho, não que a tela está errada. A correção é atualizar o `UX.md` (skill `ux-md`, Modo C) e subir `version`/`updated`.

## Glossário por módulo

`content.glossary` aceita um caminho (`.md` com tabela de colunas "Termo" e "Nunca chamar de"/"Evitar"), `inline` (tabela no corpo do `UX.md`), um mapa termo → sinônimos, ou um **mapa por módulo**: `{ default: design/product.md, purchasing: inline }`. O mapa é por módulo quando tem `default` ou quando todos os valores são caminhos `.md`, `inline` ou mapas. `consistency.mjs` (C3) e `text.mjs` escolhem a entrada pelo `--module` (a auditoria repassa o dela); módulo sem entrada usa `default`. No `text.mjs`, os termos canônicos com maiúscula no meio ("Ordem de Compra") valem como nomes próprios no X10.

## Seções do corpo (nesta ordem)

| # | Seção (`##`) | Deve responder |
|---|---|---|
| 1 | Visão geral | Para quem, para quê, em que contexto de uso; o que a experiência nunca faz |
| 2 | Personas e tarefas | Tarefas principais por persona, frequência, o que é crítico errar |
| 3 | Arquitetura da informação | Onde cada coisa mora; nomes das áreas; o que é entrada, o que é detalhe |
| 4 | Navegação | Modelo, profundidade, como se volta, como se sabe onde se está |
| 5 | Arquétipos de tela | Que tipo é cada tela (link para `archetypes/<id>.md`) e desvios declarados (tabela D1… espelhada no bloco `deviations`) |
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
{ "screens": [{ "id": "lista", "name": "Pedidos", "type": "page", "route": "/orders", "parent": null, "persona": "analista" }],
  "transitions": [{ "id": "t1", "from": "lista", "to": "detalhe", "trigger": { "type": "button", "label": "Abrir" }, "evidence": "src/Lista.tsx:42" }],
  "journeys": [{ "id": "j1", "name": "Aprovar pedido", "steps": ["t1", "t2"], "persona_switches": [] }] }
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

**Consistência (`tools/ux-lint/consistency.mjs`).** `node tools/ux-lint/consistency.mjs <pasta-de-capturas> [--ux UX.md] [--json]`. Compara o inventário de botões, títulos e abas de todas as capturas (o mesmo inventário do verificador de texto). Critério de "mesma ação" no C1: mesmo grupo de verbo — excluir/remover/apagar; salvar/gravar; criar/novo/adicionar; editar/alterar; baixar/exportar/download — sobre o mesmo objeto (a primeira palavra de conteúdo depois do verbo, sem plural; "Adicionar à proposta" tem destino, não objeto). Rótulo só com verbo pega o objeto do nome acessível ou do título do diálogo; sem objeto nenhum, fica fora. Cancelar/voltar/fechar só conta dentro de diálogo e com o mesmo papel: "dispensar" quando o rodapé tem ação principal, "fechar" quando não tem; o ✕ de ícone fica fora. O C2 compara o mesmo rótulo só no mesmo contexto: o gatilho na página ("Remover", texto) e a confirmação no diálogo ("Remover", cheio) têm papéis diferentes. O C3 usa o glossário (`content.glossary`: caminho de um `.md` com tabela de colunas "Termo" e "Nunca chamar de"/"Evitar", mapa termo → sinônimos, ou `inline` para a tabela no próprio UX.md) e uma lista curta de pares conhecidos (configurações × preferências, modelo × template…); termo de evitar que é termo canônico de outra linha não conta. Glossário de outro domínio do produto (ex.: o de Finanças aplicado a Compras) gera falso positivo: declare o glossário do módulo (`content.glossary: { default: …, contratos: … }`, ver "Glossário por módulo") e rode com `--module`.

Os dois escrevem `--json` em `snake_case`, que o registro de achados lê (`findings.mjs register --states st.json --consistency c.json`; famílias `states` e `consistency`, ids `st-` e `c-`).

**Layout e hierarquia (`tools/ux-lint/measure.mjs` + `tools/ux-lint/layout.mjs`).** O parser de HTML não calcula layout; a geometria vem de um navegador. Dois passos:

1. `node tools/ux-lint/measure.mjs <pasta-de-capturas> --out <pasta-geometria> [--ux UX.md] [--width 1440]` abre cada captura estática (`file://`, sem servidor) em janela de 1440×900, espera fontes e rede, e grava `<nome>.geometry.json` com caixa, fonte, cor, região e papel de cada elemento relevante (formato documentado no topo de `tools/ux-lint/lib/geometry.mjs`). O Playwright é do projeto, não do DSX: o comando o procura (`playwright` ou `@playwright/test`) a partir do diretório atual e, sem ele, explica como instalar — a análise L fica indisponível.
2. `node tools/ux-lint/layout.mjs <pasta-geometria> [--ux UX.md] [--archetypes <pasta>] [--json] [--fail-at 3]` aplica L1–L9 sem navegador. A tela liga-se ao arquétipo pelo id no nome da captura (`<nn>-<tela>`), comparado com os ids e rotas de `archetypes` (a rota é comparada com o `<title>` da captura); do cartão vêm `regions` (L9) e `primary-action.position` (L1). O L9 só roda no estado principal (captura sem sufixo de estado).

Como cada regra mede: o **L1** compara o centro da primária com a caixa de referência (o diálogo, ou o `main`): *top-right* = metade direita (centro além de 60% da largura) e topo a até 240 px do início do conteúdo; *bottom-right* = 60% à direita e no último quarto (no diálogo, último terço); *inline* não é cobrado. Basta uma primária em foco na posição; a primária de um painel lateral não conta quando o arquétipo pede a primária no cabeçalho, e a **primária de linha** também não: a que está na mesma linha de um campo do próprio formulário ("Nova categoria" + Adicionar) ou ao lado do título da sua seção ("Signatários" + Novo signatário) tem posição relativa à linha, não à região. O **L2** conta, só na primeira dobra e fora do cabeçalho e menu do produto, botões cheios (seletor `primary` ou fundo saturado), textos ≥ 1,25× o corpo com peso ≥ 600 e blocos de fundo saturado com ≥ 2.500 px²; o que está dentro de outro elemento contado, e blocos saturados encostados (células de um cabeçalho de tabela), contam uma vez. O **L3** compara tamanhos de fonte calculados (números puros, como o valor de um indicador, não contam como "texto maior"). O **L4** agrupa campos por formulário, fieldset, diálogo, painel ou cartão mais próximo e mede a borda esquerda do contorno do campo (não do `<input>` interno); rótulo flutuante dentro do campo não é borda. O **L5** forma grupos de botões pelo pai no DOM, fundindo botões encostados (≤ 8 px) na mesma linha; links não formam grupo, destrutiva afastada de propósito e vão preenchido por conteúdo (o "pág. 1 de 3" entre anterior e próxima) não reprovam. O **L6** mede a partir do topo da página — ou do topo do diálogo, porque o diálogo é fixo na janela e a captura estática não limita a altura dele; título e primária dentro do cabeçalho/rodapé do diálogo não reprovam. O **L7** só olha texto corrido (duas linhas ou mais, ou uma linha com ≥ 120 caracteres) e calcula caracteres por linha pelo número de linhas renderizadas (altura ÷ entrelinha). O **L8** aplica a exceção de espaçamento da WCAG (círculo de 24 px em volta do alvo sem tocar outro alvo) e a de link dentro de frase; alvos repetidos com o mesmo rótulo na mesma região viram um achado. O **L9** procura a região pela marcação declarada (`data-region="<id>"` no código ou `verification.selectors.archetype-regions: { side-panel: "aside.painel" }` no UX.md; título, conteúdo e ações de diálogo, stepper e paginação do MUI já vêm reconhecidos) e, sem ela, por heurística geométrica (coluna à direita para painel, faixa de controles para barra de ferramentas, bloco largo para área de conteúdo); `bulk-actions-bar`, `danger-zone` e `quick-view` só aparecem em certas condições e não são cobradas.

Limites mudam pela chave opcional `layout` do front matter (kebab-case: `fold`, `max-emphasis`, `emphasis-ratio`, `align-tolerance`, `max-left-edges`, `label-gap`, `action-gap`, `max-line-chars`, `min-target`, `top-band`). O `--json` em `snake_case` traz, por achado, `rule`, `severity`, `region`, `message` (com a medida), `anchor` (rótulo ou seletor do elemento, sem coordenadas), `evidence` (`captura.html › caminho do elemento`), `elements` e `measure`; o registro de achados o lê com `findings.mjs register --layout l.json` (família `layout`, ids `l-`, âncora tela + regra + região + elemento — a medida pode mudar sem mudar o id). Sinais de falso positivo a conferir na captura: desvio já declarado na seção 5 (declare-o também em `deviations` com a regra, para o registro marcá-lo como `accepted-deviation`) (primária "Adicionar" dentro de um diálogo de gestão, editor sem painel), tela que na verdade é um estado do arquétipo (página "já respondido" sem área de decisão) e títulos em sobrelinha (caixa alta pequena acima de cartões) no L3.

O que a máquina não mede — clareza da hierarquia, adequação do arquétipo à tarefa, carga cognitiva, se o texto se entende — fica com a revisão por julgamento (skill `revisar-ux`, percurso cognitivo da jornada sobre as capturas).

## Checklist

- [ ] `version` em semver e `updated` do dia da última mudança; subiu no mesmo commit da mudança de UI.
- [ ] Desvios da seção 5 também no bloco `deviations` (com `rules` quando silenciam achado).
- [ ] `node tools/lint-ux-md.mjs UX.md --score --map … --screens …` com todos os gates de código ✔ e nota registrada; `ux-md-drift.mjs` sem achado.
- [ ] Front matter com `product`, `navigation`, `archetypes`, `actions`, `confirmation`, `feedback`, `states`, `forms`, `content`, `flows` e `verification.selectors`, em inglês (o linter aceita os nomes antigos com aviso).
- [ ] Toda tela do produto mapeada a um arquétipo (ou desvio declarado na seção 5).
- [ ] 13 seções, na ordem; Faça e não faça com ≥ 3 itens cada, vindos de problemas reais.
- [ ] `node tools/lint-ux-md.mjs UX.md` sem erro.
- [ ] `node tools/ux-lint/flow.mjs` e `node tools/ux-lint/screen.mjs` rodados; achados de severidade ≥ 3 viraram dívida registrada.
- [ ] Geometria medida (`measure.mjs`) e `layout.mjs` rodado; achados L de severidade 2 conferidos na captura antes de virar dívida.
- [ ] Estados capturados (`<nn>-<tela>.<estado>.html`) e `node tools/ux-lint/states.mjs` e `consistency.mjs` rodados sobre a pasta de capturas.
