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

O `UX.md` **escolhe e fixa** decisões que os padrões deixam em aberto ("qual destas opções este produto usa, sempre") e diz **em que tipo de tela** cada regra vale, apontando para os arquétipos do catálogo (`arquetipos/`). Ele não repete os padrões: referencia-os pelo id.

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
produto:
  persona: <quem usa e para quê>          # obrigatório
  registro: operacional                   # operacional | consumo | editorial | marca (ver knowledge/design-system/escolher-design-system.md)
  plataforma: desktop                     # desktop | mobile | ambos
  densidade: alta                         # baixa | media | alta
navegacao:
  modelo: <ex.: "menu lateral + abas na página">
  profundidade-maxima: 3                  # níveis a partir da entrada do módulo
  retorno: obrigatorio                    # obrigatorio | opcional — obrigatorio: toda tela não raiz tem caminho de volta visível
arquetipos:                               # tipo de tela → rotas/telas do produto (ids de arquetipos/)
  lista-operacional: ["/contratos"]
  editor-com-painel: ["/contratos/minutas/:id"]
acoes:
  primarias-por-regiao: 1                 # máximo de ações primárias (botão cheio) por região
  posicao-primaria: topo-direita          # topo-direita | rodape-direita | junto-ao-conteudo
  ordem-dialogo: cancelar-acao            # cancelar-acao (Cancelar à esquerda) | acao-cancelar
  destrutiva-rotulo-especifico: true      # "Excluir minuta", nunca "Confirmar"/"OK"/"Sim"
confirmacao:
  irreversivel: dialogo                   # dialogo | digitar-nome
  reversivel: desfazer                    # desfazer | nenhuma
feedback:
  sucesso: toast                          # toast | inline | pagina
  erro-de-campo: inline
  erro-de-sistema: alerta-na-pagina
  esqueleto-acima-de-ms: 1000
estados: [carregando, vazio, erro, sem-acesso, sucesso]   # toda tela implementa estes
formularios:
  rotulo: sempre-visivel                  # nunca só placeholder
  validacao: ao-sair-do-campo             # ao-sair-do-campo | ao-enviar | em-tempo-real
  obrigatorios: marcar-obrigatorios       # marcar-obrigatorios | marcar-opcionais
conteudo:
  glossario: <caminho do glossário ou "inline">
  botoes: verbo-objeto                    # "Criar aditivo", não "OK"
  proibidos: [snapshot, tenant, RLS]      # termos de implementação que nunca aparecem na tela
fluxos:
  max-passos-jornada: 12
  max-dialogos-empilhados: 1
  becos-sem-saida: 0                      # telas (não diálogo) sem nenhuma saída
verificacao:                              # como o ux-lint reconhece o kit do projeto nas capturas
  seletores:
    regioes: ["header", "nav", "aside", "main", "[role=dialog]"]
    dialogo: "[role=dialog]"
    rodape-dialogo: ".MuiDialogActions-root"   # opcional: onde ficam os botões do diálogo (T2); sem ele, o ux-lint infere
    primaria: ".MuiButton-contained"
    destrutiva: ".MuiButton-containedError, .MuiButton-colorError"
    botao: "button, [role=button]"
    campo: "input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), textarea, select"
```

Chaves desconhecidas geram aviso no linter (`tools/lint-ux-md.mjs`). Valores podem ser omitidos; omitido = vale o padrão do DSX acima.

## Seções do corpo (nesta ordem)

| # | Seção (`##`) | Deve responder |
|---|---|---|
| 1 | Visão geral | Para quem, para quê, em que contexto de uso; o que a experiência nunca faz |
| 2 | Personas e tarefas | Tarefas principais por persona, frequência, o que é crítico errar |
| 3 | Arquitetura da informação | Onde cada coisa mora; nomes das áreas; o que é entrada, o que é detalhe |
| 4 | Navegação | Modelo, profundidade, como se volta, como se sabe onde se está |
| 5 | Arquétipos de tela | Que tipo é cada tela (link para `arquetipos/<id>.md`) e desvios declarados |
| 6 | Layout e regiões | Regiões fixas do produto (cabeçalho, menu, conteúdo, painel), o que vai em cada uma |
| 7 | Ações | Hierarquia, posição, quantas primárias, destrutivas, desabilitado × escondido |
| 8 | Feedback e estados | Política de feedback; os cinco estados e como cada tipo de tela os mostra |
| 9 | Formulários | Rótulos, validação, obrigatórios, longos × curtos (diálogo × página) |
| 10 | Conteúdo e microcopy | Glossário, verbos, tom, termos proibidos, fórmulas de erro/vazio/confirmação |
| 11 | Fluxos | Jornadas principais, limites, onde a pessoa troca (ex.: link para terceiro) |
| 12 | Faça e não faça | ≥ 3 cada, derivados de problemas reais |
| 13 | Instruções para agentes | Quando consultar, o que preservar, como validar |

Títulos em pt-BR (acima) são os canônicos. Equivalentes em inglês aceitos pelo linter: Overview, Personas & Tasks, Information Architecture, Navigation, Screen Archetypes, Layout & Regions, Actions, Feedback & States, Forms, Content & Microcopy, Flows, Do's and Don'ts, Agent Instructions.

## Arquétipos de tela (`arquetipos/`)

O catálogo de **tipos de tela** do DSX — o nível acima dos padrões. Cada cartão `arquetipos/<id>.md` tem:

```yaml
---
id: lista-operacional
titulo: Lista operacional
resumo: <uma frase>
registro: [operacional]
quando-usar: <frase SE→ENTÃO>
evitar-quando: <frase>
regioes: [cabecalho-da-pagina, barra-de-filtros, conteudo, rodape-da-lista]
acao-primaria: { regiao: cabecalho-da-pagina, posicao: topo-direita, max: 1 }
estados: [carregando, vazio, vazio-por-filtro, erro, sem-acesso]
padroes: [estrutura-de-filtros, filtros-ativos, paginacao-de-tabela, ordenacao-de-tabela, estado-vazio]   # ids de patterns/
variacoes: [com-acoes-em-lote, cards-no-mobile]
regras: [T1, T3, T4]                      # regras do ux-lint que se aplicam
---
```

Os cinco estados de `estados` no UX.md são o **mínimo**; um arquétipo pode exigir estados próprios (`link-expirado`, `nada-selecionado`, `conflito`…). `acao-primaria` descreve a região de ação principal; se o arquétipo tem outra (ex.: mestre-detalhe: criar no cabeçalho, resolver no detalhe), descreva-a no corpo, em **Ações** — o limite do T1 vale por região de qualquer forma.

Corpo: **Quando usar** (SE → ENTÃO), **Mapa de regiões** (diagrama ASCII), **O que vai em cada região**, **Ações**, **Estados**, **Variações** (cada uma com o que favorece e o que piora — são os "arranjos" oferecidos pela skill `arranjar-tela`), **Anti-padrões**, **Checklist**.

## Verificação (`tools/ux-lint/`)

| Id | Nível | Regra | Fonte do limite |
|---|---|---|---|
| T1 | tela | No máximo `acoes.primarias-por-regiao` ações primárias por região (diálogo conta como região própria; a página atrás de um diálogo não conta) | `acoes`, `verificacao.seletores` |
| T2 | tela | Em diálogo, a ação de cancelar fica antes (à esquerda) da ação principal, conforme `acoes.ordem-dialogo` | `acoes.ordem-dialogo` |
| T3 | tela | Exatamente um título principal (`h1`) por tela; em captura com diálogo aberto não é avaliada (a tela de base é avaliada na própria captura) | — |
| T4 | tela | Todo campo tem rótulo visível ou nome acessível; placeholder sozinho reprova | `formularios.rotulo` |
| T5 | tela | Ação destrutiva com rótulo genérico ("Confirmar", "OK", "Sim", "Continuar") reprova | `acoes.destrutiva-rotulo-especifico` |
| T6 | tela | Termo de `conteudo.proibidos` no texto visível reprova | `conteudo.proibidos` |
| T7 | tela | Botão com rótulo que não é verbo + objeto ("OK", "Sim", "Enviar" sozinho em contexto ambíguo) gera aviso | `conteudo.botoes` |
| F1 | fluxo | Tela (não diálogo) sem nenhuma transição de saída | `fluxos.becos-sem-saida` |
| F2 | fluxo | Tela fora de todas as jornadas (órfã de jornada) — aviso, não erro | — |
| F3 | fluxo | Jornada com mais passos que `fluxos.max-passos-jornada` | `fluxos` |
| F4 | fluxo | Diálogo aberto a partir de outro diálogo além de `fluxos.max-dialogos-empilhados` | `fluxos` |
| F5 | fluxo | Tela não raiz sem transição de volta (para a tela de onde se chega ou para a mãe) | `navegacao.retorno` |

Entradas: capturas HTML das telas (ex.: skill de captura pelo código do projeto) e o mapa de fluxo `.dsx/mapas/fluxos-<modulo>.json` (formato da skill de mapeamento: `telas`, `transicoes` com `gatilho` e `evidencia arquivo:linha`, `jornadas`). Saída: achados com id da regra, tela, região, evidência e severidade (0–4, escala de `heuristicas-nielsen.md`).

**Regiões.** O T1 conta primárias por região reconhecida pelos seletores. Se o produto põe barra de ações, conteúdo e painel lateral dentro de um único `main`, o T1 trata tudo como uma região: marque `aside`/`section` com nome no código ou declare seletores de região mais finos em `verificacao.seletores.regioes`. Um achado de T1 numa `main` grande pode ser falta de semântica, não excesso de primárias — confira na captura.

O que a máquina não mede — clareza da hierarquia, adequação do arquétipo à tarefa, carga cognitiva, se o texto se entende — fica com a revisão por julgamento (skill `revisar-ux`, percurso cognitivo da jornada sobre as capturas).

## Checklist

- [ ] Front matter com produto, navegação, arquétipos, ações, confirmação, feedback, estados, formulários, conteúdo, fluxos e seletores de verificação.
- [ ] Toda tela do produto mapeada a um arquétipo (ou desvio declarado na seção 5).
- [ ] 13 seções, na ordem; Faça e não faça com ≥ 3 itens cada, vindos de problemas reais.
- [ ] `node tools/lint-ux-md.mjs UX.md` sem erro.
- [ ] `node tools/ux-lint/fluxo.mjs` e `node tools/ux-lint/tela.mjs` rodados; achados de severidade ≥ 3 viraram dívida registrada.
