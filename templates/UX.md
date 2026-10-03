---
version: alpha
name: <Nome do produto>
description: <Tipo de produto, público e densidade. Ex.: "Plataforma B2B de contratos para o jurídico interno, desktop, densidade alta.">
owner: <time ou pessoa que mantém este arquivo>
updated: <AAAA-MM-DD>
# Quem usa e em que registro. persona e registro são obrigatórios.
produto:
  persona: <quem usa e para quê, numa frase>
  registro: <operacional | consumo | editorial | marca>
  plataforma: <desktop | mobile | ambos>
  densidade: <baixa | media | alta>
navegacao:
  modelo: <ex.: "menu lateral + abas na página">
  profundidade-maxima: 3          # níveis a partir da entrada do módulo
  retorno: obrigatorio            # toda tela não raiz tem caminho de volta visível
# Tipo de tela → rotas/telas do produto. Ids válidos: os cartões de arquetipos/.
arquetipos:
  lista-operacional: ["<rota>"]
  mestre-detalhe: ["<rota>"]
  dialogo-de-confirmacao: ["<nome do diálogo>"]
acoes:
  primarias-por-regiao: 1         # máximo de botões cheios por região
  posicao-primaria: <topo-direita | rodape-direita | junto-ao-conteudo>
  ordem-dialogo: <cancelar-acao | acao-cancelar>
  destrutiva-rotulo-especifico: true
confirmacao:
  irreversivel: <dialogo | digitar-nome>
  reversivel: <desfazer | nenhuma>
feedback:
  sucesso: <toast | inline | pagina>
  erro-de-campo: inline
  erro-de-sistema: alerta-na-pagina
  esqueleto-acima-de-ms: 1000
estados: [carregando, vazio, erro, sem-acesso, sucesso]
formularios:
  rotulo: sempre-visivel
  validacao: <ao-sair-do-campo | ao-enviar | em-tempo-real>
  obrigatorios: <marcar-obrigatorios | marcar-opcionais>
conteudo:
  glossario: <caminho do glossário ou "inline">
  botoes: verbo-objeto
  proibidos: [<termo de implementação>, <outro termo>]   # nunca aparecem na tela
fluxos:
  max-passos-jornada: 12
  max-dialogos-empilhados: 1
  becos-sem-saida: 0
# Como o ux-lint reconhece o kit do projeto nas capturas. Ajuste ao seu kit (MUI, shadcn, próprio).
verificacao:
  seletores:
    regioes: ["header", "nav", "aside", "main", "[role=dialog]"]
    dialogo: "[role=dialog]"
    primaria: "<seletor do botão primário>"
    destrutiva: "<seletor do botão destrutivo>"
    botao: "button, [role=button]"
    campo: "input:not([type=hidden]), textarea, select"
---

# <Nome do produto> — UX

<!-- Diga de onde vieram as decisões (código, mapas de .dsx/mapas/, pesquisa) e o que vence em caso de conflito.
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

<!-- Tabela: tela/rota | arquétipo (link arquetipos/<id>.md) | variação escolhida | desvio declarado (ou "—").
     Toda tela do front matter aparece aqui. Desvio = o que difere do cartão e por quê. -->

| Tela | Arquétipo | Variação | Desvio |
|---|---|---|---|
| <rota> | <id do arquétipo> | <variação> | <desvio e motivo, ou —> |

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
- Valide com `node <DSX>/tools/lint-ux-md.mjs UX.md` e com o ux-lint de tela e fluxo.
