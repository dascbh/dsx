---
id: lista-operacional
titulo: Lista operacional
resumo: Tela de trabalho diário que mostra muitos registros do mesmo tipo para a pessoa encontrar, comparar e agir sobre eles.
registro: [operacional]
quando-usar: SE a tarefa principal é localizar, triar ou acompanhar muitos registros do mesmo tipo ENTÃO use lista operacional
evitar-quando: o conjunto tem poucos itens heterogêneos, a pessoa precisa ler o conteúdo inteiro de cada item ou a tarefa é editar um item só
regioes: [cabecalho-da-pagina, barra-de-filtros, barra-de-acoes-em-lote, conteudo, rodape-da-lista]
acao-primaria: { regiao: cabecalho-da-pagina, posicao: topo-direita, max: 1 }
estados: [carregando, vazio, vazio-por-filtro, erro, sem-acesso, sucesso]
padroes: [estrutura-de-filtros, filtros-ativos, aplicacao-de-filtros, paginacao-de-tabela, ordenacao-de-tabela, estado-vazio, busca-sem-resultados, tabela-vs-cards, tabela-responsiva, skeleton-screen, acao-destrutiva]
variacoes: [com-acoes-em-lote, cards-no-mobile, filtros-em-painel-lateral, agrupada-por-status]
regras: [T1, T3, T5, T6, T7, F1]
---

# Lista operacional

A tela onde a pessoa passa o dia: contratos em andamento, pedidos a aprovar, documentos pendentes, itens a classificar. O valor está em **achar rápido, comparar linhas lado a lado e despachar** — não em ler cada registro por inteiro. Densidade e previsibilidade vencem decoração.

## Quando usar

- **SE** a pessoa trabalha sobre muitos registros do mesmo tipo (dezenas a milhares) **ENTÃO** use lista operacional com tabela.
- **SE** os registros são comparados por atributos (status, data, valor, responsável) **ENTÃO** cada atributo vira coluna ordenável; não esconda atributo de comparação dentro do detalhe.
- **SE** a tarefa mais frequente é "achar um registro específico" **ENTÃO** a busca textual fica visível na barra de filtros, não atrás de um ícone.
- **SE** a pessoa precisa ler ou editar o registro sem perder a posição na lista **ENTÃO** combine com `painel-lateral-de-detalhe` ou troque para `mestre-detalhe`.
- **SE** os itens são reutilizáveis (modelos, cláusulas) e a pessoa escolhe por semelhança visual ou por categoria **ENTÃO** prefira `biblioteca`.
- **SE** a pessoa só precisa saber "como estão as coisas" sem agir item a item **ENTÃO** prefira `painel-de-acompanhamento`.
- **SENÃO** (menos de ~7 itens, heterogêneos) **ENTÃO** uma lista simples dentro de outra tela resolve; não monte o arquétipo completo.

## Mapa de regiões

```
┌──────────────────────────────────────────────────────────────┐
│ cabecalho-da-pagina   Título (h1) · contagem    [Ação primária]│
├──────────────────────────────────────────────────────────────┤
│ barra-de-filtros  [Buscar…] [Status ▾] [Período ▾]  Limpar     │
│                   chips: Status: Pendente ×  Resp.: Ana ×      │
├──────────────────────────────────────────────────────────────┤
│ barra-de-acoes-em-lote (só com seleção) 3 selecionados [Ação] │
├──────────────────────────────────────────────────────────────┤
│ conteudo   ☐ Nome ▲      Status      Responsável   Atualizado │
│            ☐ ……………      ● Pendente  Ana           há 2 h     │
│            ☐ ……………      ● Concluído Bruno         ontem      │
├──────────────────────────────────────────────────────────────┤
│ rodape-da-lista  1–50 de 1.284     [‹] 1 2 3 … 26 [›]  50/pág │
└──────────────────────────────────────────────────────────────┘
```

## O que vai em cada região

- **cabecalho-da-pagina** — título único da tela (o `h1`, com o nome do conjunto no plural: "Contratos"), contagem total opcional, a ação primária de criação ("Novo contrato") e no máximo duas ações secundárias de página (exportar, importar). Nada de filtro aqui.
- **barra-de-filtros** — busca textual primeiro, à esquerda; depois os 3–5 filtros mais usados como controles visíveis; o restante em "Mais filtros". Abaixo, os filtros ativos como chips removíveis e "Limpar filtros". A barra reflete o estado na URL para a lista poder ser compartilhada e restaurada ao voltar.
- **barra-de-acoes-em-lote** — aparece só quando há seleção; diz quantos itens estão selecionados, oferece "Selecionar todos os N resultados" quando a seleção cobre só a página, e as ações que valem para o lote. Substitui visualmente a barra de filtros ou fica fixa logo acima da tabela.
- **conteudo** — a tabela. Primeira coluna identifica o registro e é o link para o detalhe; status com texto e cor (nunca só cor); números alinhados à direita; datas relativas com a absoluta no título. Ações por linha no fim da linha, no máximo duas visíveis e o resto em menu "Mais ações".
- **rodape-da-lista** — intervalo exibido e total, paginação e tamanho de página. Em lista curta (uma página só) o rodapé mostra apenas a contagem.

## Ações

- **Primária:** uma só, no `cabecalho-da-pagina`, topo-direita — normalmente criar um registro do tipo listado. Se a tela não cria nada, não invente primária; deixe a região sem botão cheio.
- **Por linha:** abrir (o link da primeira coluna) e no máximo duas ações frequentes como botão de texto ou ícone com nome acessível; destrutivas vão para o menu "Mais ações", nunca como ícone solto ao lado de "Editar".
- **Em lote:** só aparecem com seleção; a destrutiva em lote diz quantos itens afeta no rótulo ("Arquivar 12 contratos") e pede confirmação proporcional (ver `dialogo-de-confirmacao`).
- **Desabilitado × escondido:** ação que a pessoa nunca poderá usar (falta de permissão) some; ação que depende de estado do registro fica desabilitada com o motivo no texto de ajuda.

## Estados

- **carregando** — esqueleto com as colunas e a altura de ~10 linhas; cabeçalho e filtros já interativos. Ao paginar ou filtrar, mantenha as linhas antigas esmaecidas com indicador discreto em vez de piscar a tela.
- **vazio** — nenhum registro existe ainda: explique o que aparece aqui e ofereça a ação primária ("Nenhum contrato ainda. Crie o primeiro ou importe uma planilha.").
- **vazio-por-filtro** — existem registros, mas o filtro não trouxe nenhum: diga isso, mostre os filtros ativos e ofereça "Limpar filtros". Nunca reutilize a mensagem do vazio inicial.
- **erro** — falha ao carregar: alerta na própria região de conteúdo com o que aconteceu e "Tentar novamente"; filtros continuam visíveis e preservados.
- **sem-acesso** — a pessoa não pode ver este conjunto: título continua, conteúdo explica a quem pedir acesso; nenhuma ação primária.
- **sucesso** — depois de criar, editar ou agir em lote: confirmação breve (toast) e a linha afetada destacada por alguns segundos, na posição em que ficou.

## Variações

### com-acoes-em-lote
Caixas de seleção na primeira coluna e `barra-de-acoes-em-lote` ao selecionar.
**Favorece:** triagem de volume (arquivar, atribuir, mudar status de dezenas de itens de uma vez); reduz cliques repetidos.
**Piora:** adiciona uma coluna e um modo de seleção que confunde quem só quer abrir itens; aumenta o risco de ação destrutiva em massa — exige confirmação com contagem e, se possível, desfazer.

### cards-no-mobile
Abaixo de um ponto de quebra, cada linha vira um cartão com título, status e dois atributos-chave; o restante vai para o detalhe.
**Favorece:** uso em telas estreitas sem rolagem horizontal; toque confortável.
**Piora:** perde comparação lado a lado e ordenação por coluna; precisa de um seletor de ordenação explícito no topo.

### filtros-em-painel-lateral
Filtros numa coluna à esquerda, sempre abertos, em vez de uma barra horizontal.
**Favorece:** conjuntos com muitos critérios combináveis (8+), contagem por opção, refino exploratório.
**Piora:** rouba largura da tabela; em telas médias força rolagem horizontal; exagera para quem só busca por nome.

### agrupada-por-status
Linhas agrupadas por status (ou etapa), com cabeçalho de grupo recolhível e contagem.
**Favorece:** fluxos com etapas claras, onde a pergunta é "o que está parado em cada fase".
**Piora:** paginação fica ambígua (por grupo ou global); ordenação por outra coluna quebra o agrupamento — declare qual vence.

## Anti-padrões

- Mesma mensagem para "nada cadastrado" e "nenhum resultado para o filtro".
- Filtro que se perde ao abrir o detalhe e voltar.
- Status comunicado só pela cor do ponto.
- Três botões cheios no cabeçalho (criar, importar, exportar) disputando a primária.
- Ícone de lixeira solto em cada linha, ao lado de editar, sem confirmação.
- Paginação que volta para a página 1 depois de qualquer ação na linha.
- Tabela que encolhe colunas até truncar o identificador do registro.
- Ação em lote que age só na página visível quando a pessoa acreditava ter selecionado tudo.

## Checklist

- [ ] Um único `h1` com o nome do conjunto; no máximo uma ação primária no cabeçalho.
- [ ] Busca textual visível; filtros ativos mostrados como chips com "Limpar filtros".
- [ ] Estado de filtros, ordenação e página preservado ao voltar do detalhe (URL).
- [ ] `vazio` e `vazio-por-filtro` têm textos e ações diferentes.
- [ ] Status com texto além da cor; números alinhados à direita.
- [ ] Destrutivas no menu da linha ou em lote, com rótulo específico e confirmação com contagem.
- [ ] Esqueleto no primeiro carregamento; sem tela piscando ao paginar.
- [ ] Em tela estreita, sem rolagem horizontal da página (cards ou colunas prioritárias).
