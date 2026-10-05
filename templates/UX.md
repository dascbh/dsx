---
# version é a versão DESTE documento (semver). Suba no mesmo commit da mudança de UI:
#   arquétipo novo ou trocado, política (actions, confirmation, feedback, forms, navigation, flows, states) ou desvio → menor (1.2.0 → 1.3.0)
#   só texto, exemplo, evidência ou correção de redação → patch (1.2.0 → 1.2.1)
#   mudança que invalida o que agentes já construíram (troca de modelo de navegação, de register) → maior (1.x → 2.0.0)
# e atualize `updated`. format é a versão do formato UX.md do DSX.
version: 1.0.0
format: alpha
name: <Nome do produto>
description: <Tipo de produto, público e densidade. Ex.: "App web de pedidos de compra para o time de suprimentos, desktop, densidade alta.">
owner: <time ou pessoa que mantém este arquivo>
updated: <AAAA-MM-DD>
# Quem usa e em que registro. persona e register são obrigatórios. Chaves e valores em inglês; o texto livre, em pt-BR.
product:
  persona: <quem usa e para quê, numa frase>
  register: <operational | consumer | editorial | brand>
  platform: <desktop | mobile | both>
  density: <low | medium | high>
navigation:
  model: <ex.: "menu lateral + abas na página">
  max-depth: 3                    # níveis a partir da entrada do módulo
  back: mandatory                 # toda tela não raiz tem caminho de volta visível (mandatory | optional)
# Tipo de tela → rotas/telas do produto. Ids válidos: os cartões de archetypes/.
archetypes:
  operational-list: ["<rota>"]
  master-detail: ["<rota>"]
  confirmation-dialog: ["<nome do diálogo>"]
actions:
  primary-per-region: 1           # máximo de botões cheios por região
  primary-position: <top-right | bottom-right | inline>
  dialog-order: <cancel-action | action-cancel>
  destructive-specific-label: true
confirmation:
  irreversible: <dialog | type-name>
  reversible: <undo | none>
feedback:
  success: <toast | inline | page>
  field-error: inline
  system-error: page-alert
  skeleton-after-ms: 1000
states: [loading, empty, error, no-access, success]
forms:
  label: always-visible
  validation: <on-blur | on-submit | realtime>
  required: <mark-required | mark-optional>
content:
  glossary: <caminho do glossário ou "inline">   # por módulo: { default: <caminho>, <módulo>: <caminho ou inline> }
  buttons: verb-object
  forbidden: [<termo de implementação>, <outro termo>]   # nunca aparecem na tela
  proper-nouns: []                # nomes próprios do domínio que podem ter maiúscula no meio (X10)
flows:
  max-journey-steps: 12
  max-stacked-dialogs: 1
  dead-ends: 0
# Como o ux-lint reconhece o kit do projeto nas capturas. Ajuste ao seu kit (MUI, shadcn, próprio).
# Onde as ferramentas acham capturas, mapa e código (docs/project-paths.md). Apague o que for o padrão do DSX.
paths:
  captures: .dsx/captures/<module>
  code: [<pasta do front onde o texto nasce>]
verification:
  kit: <auto | generic | mui | shadcn | chakra | antd | bootstrap>   # perfil de seletores do kit de componentes
  selectors:
    regions: ["header", "nav", "aside", "main", "[role=dialog]"]
    dialog: "[role=dialog]"
    primary: "<seletor do botão primário; apague para usar o do kit>"
    destructive: "<seletor do botão destrutivo; apague para usar o do kit>"
    button: "button, [role=button]"
    field: "input:not([type=hidden]), textarea, select"
# Desvios aceitos: o que difere do cartão do arquétipo ou de uma política, com motivo e dono. Achado de regra listada
# em `rules` numa tela de `screens` (ids do mapa de fluxo/capturas) vira "desvio aceito" no registro de achados e não
# conta como aberto. Apague o bloco se não houver desvio.
deviations:
  - id: D1
    screens: [<id da tela>]
    rules: [<id da regra, ex.: L9>]
    reason: "<por que o produto difere aqui>"
    decided-by: "<quem aceitou>"
    until: <AAAA-MM-DD, opcional>
---

# <Nome do produto> — UX

<!-- Diga de onde vieram as decisões (código, mapas de .dsx/maps/, pesquisa) e o que vence em caso de conflito.
     Marque com "(inferido)" o que foi deduzido sem evidência explícita. Apague todos os comentários ao preencher. -->

## Visão geral

<!-- Para quem, para quê, em que contexto de uso (dispositivo, frequência, pressa). Termine com o que a
     experiência NUNCA faz (ex.: "nunca aplica uma decisão sem confirmação humana"). -->

<Parágrafo de visão geral>

## Personas e tarefas

<!-- Tabela: persona | tarefa principal | frequência | o que é crítico errar. Tarefas, não telas. -->

| Persona | Tarefa | Frequência | Erro crítico |
|---|---|---|---|
| <persona> | <tarefa> | <diária/semanal/rara> | <o que custa caro errar> |

## Arquitetura da informação

<!-- Áreas do produto com os nomes que aparecem na tela; o que é entrada (lista, painel) e o que é detalhe. -->

<Áreas e onde cada coisa mora>

## Navegação

<!-- Modelo (menu lateral, abas, migalhas), profundidade máxima, como se volta, como se sabe onde se está. -->

<Modelo de navegação>

## Arquétipos de tela

<!-- Tabela: tela/rota | arquétipo (link archetypes/<id>.md) | variação escolhida | desvio declarado (ou "—").
     Toda tela do front matter aparece aqui. Desvio = o que difere do cartão e por quê. -->

| Tela | Arquétipo | Variação | Desvio |
|---|---|---|---|
| <rota> | <id do arquétipo> | <variação> | <id do desvio (D1) ou —> |

### Desvios declarados

<!-- Uma linha por desvio, com o mesmo id do bloco `deviations` do front matter (o linter confere os dois). -->

| # | Tela | Desvio | Motivo |
|---|---|---|---|
| D1 | <id da tela> | <o que difere do cartão ou da política> | <motivo e custo> |

## Layout e regiões

<!-- Regiões fixas do produto (cabeçalho, menu, conteúdo, painel) e o que vai em cada uma. -->

<Regiões>

## Ações

<!-- Hierarquia (primária, secundária, terciária), posição, quantas primárias, destrutivas, desabilitado × escondido. -->

<Política de ações>

## Feedback e estados

<!-- Política de feedback (toast, inline, alerta) e como cada tipo de tela mostra os cinco estados. -->

<Feedback e estados>

## Formulários

<!-- Rótulos, validação, obrigatórios; quando o formulário vai em diálogo e quando vira página. -->

<Regras de formulário>

## Conteúdo e microcopy

<!-- Glossário (termo da tela ↔ conceito), verbos dos botões, tom, termos proibidos, fórmulas de erro/vazio/confirmação. -->

<Conteúdo e microcopy>

## Fluxos

<!-- Jornadas principais (início → fim, nº de passos), limites, onde a pessoa troca de canal (link para terceiro, e-mail). -->

<Fluxos>

## Faça e não faça

<!-- Mínimo 3 em cada bloco, cada um vindo de um problema real (tela, achado, reclamação). Critério observável. -->

### Faça

- <regra concreta>
- <regra concreta>
- <regra concreta>

### Não faça

- <proibição concreta>
- <proibição concreta>
- <proibição concreta>

## Instruções para agentes

<!-- Quando consultar este arquivo, o que preservar, como validar (comandos). -->

- Consulte antes de criar ou rearranjar qualquer tela; identifique o arquétipo pela seção 5.
- Toda mudança de UI que altera comportamento (tela nova, arquétipo, política, fluxo, estado) atualiza este arquivo no mesmo commit, com `version` e `updated`.
- Valide com `node <DSX>/tools/lint-ux-md.mjs UX.md --score --map <mapa> --screens <capturas>`, com o drift (`node <DSX>/tools/ux-lint/ux-md-drift.mjs UX.md --module <m> --root .`) e com o ux-lint de tela e fluxo.
