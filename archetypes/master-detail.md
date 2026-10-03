---
id: master-detail
title: Mestre-detalhe
summary: Duas colunas na mesma tela, a lista à esquerda e o registro selecionado à direita, para percorrer itens em sequência sem trocar de página.
register: [operational]
when-to-use: SE a pessoa percorre registros um após o outro e precisa ver o conteúdo de cada um com a lista sempre à mão ENTÃO use master-detail
avoid-when: a comparação entre linhas por várias colunas é a tarefa principal, o detalhe é longo demais para meia tela ou o uso é majoritariamente em celular
regions: [page-header, master-column, detail-column]
primary-action: { region: detail-column, position: top-right, max: 1 }
states: [loading, empty, nothing-selected, empty-filtered, error, no-access, success]
patterns: [pagination-vs-scroll, empty-state, no-search-results, active-filters, tabs, skeleton-vs-spinner, keyboard-focus, breadcrumbs]
variations: [two-fixed-columns, collapsible-master, stacked-detail-on-mobile]
rules: [T1, T3, T6, T7, F1, F5]
---

# Mestre-detalhe

Caixa de entrada de pendências, fila de documentos para revisar, lista de comentários de uma minuta: a pessoa abre um, resolve, passa para o próximo. A lista dá orientação ("onde estou, quanto falta"); o detalhe dá o conteúdo. As duas convivem na mesma tela, e a seleção é o fio que as liga.

## Quando usar

- **SE** a tarefa é processar itens em sequência (ler, decidir, seguir) **ENTÃO** use master-detail; ofereça "próximo" e "anterior" no detalhe.
- **SE** a lista identifica cada item com 2–3 informações (título, status, data) **ENTÃO** a master-column é uma lista compacta, não uma tabela.
- **SE** o detalhe precisa de mais de ~60% da largura para ser útil (documento, editor) **ENTÃO** troque para `document-viewer` ou `editor-with-panel`, com a lista como navegação recolhível.
- **SE** a pessoa compara linhas por muitas colunas **ENTÃO** use `operational-list`; o master-detail esconde colunas.
- **SE** a consulta ao detalhe é ocasional e curta, partindo de uma tabela **ENTÃO** use `detail-side-panel` sobre a lista.
- **SENÃO** prefira páginas separadas (lista → página do registro) com retorno visível.

## Mapa de regiões

```
┌──────────────────────────────────────────────────────────────┐
│ page-header  Título (h1) · [Buscar…] [Filtro ▾]               │
├───────────────────────┬──────────────────────────────────────┤
│ master-column         │ detail-column                         │
│ ▌Item A    Pendente   │ Título do item (h2)    [Ação primária]│
│  Item B    Em revisão │ ‹ anterior · 3 de 41 · próximo ›      │
│  Item C    Concluído  │ ───────────────────────────────────── │
│  Item D    Pendente   │ Conteúdo do item selecionado          │
│  …                    │ Metadados · histórico                 │
│ 41 itens              │                                       │
└───────────────────────┴──────────────────────────────────────┘
```

## O que vai em cada região

- **page-header** — `h1` do conjunto, busca e no máximo dois filtros que afetam a master-column; ação de criar, se houver, como secundária (a primária da tela é a ação sobre o item aberto).
- **master-column** — lista compacta: título do item, status em texto, data ou responsável. Item selecionado com marcação visual forte e `aria-current`. Rolagem própria, independente do detalhe. Contagem no pé ("41 itens") e carregamento progressivo ou paginação simples.
- **detail-column** — título do item (`h2`, não `h1`), ação primária sobre ele no top-right, navegação "anterior / próximo" com posição ("3 de 41"), conteúdo e metadados. Se o conteúdo tiver partes, use abas dentro do detalhe, nunca uma segunda lista.

## Ações

- **Primária:** uma só, na `detail-column`, top-right — a ação que resolve o item ("Aprovar", "Marcar como revisado"). Ao concluir, ofereça ir ao próximo pendente automaticamente, com aviso.
- **Secundárias:** junto da primária, com menor ênfase; destrutivas em menu "Mais ações".
- **Seleção:** clicar na lista troca o detalhe sem recarregar a tela; setas do teclado percorrem a lista quando ela tem foco; a URL guarda o item aberto.
- **Alterações não salvas no detalhe:** trocar de item pergunta antes de descartar, ou salva rascunho automaticamente — escolha uma política e aplique em todo o produto.

## Estados

- **loading** — esqueleto na lista; no detalhe, esqueleto só depois que um item é escolhido. Troca de item mostra indicador no detalhe sem apagar a lista.
- **empty** — não há itens: a master-column explica, a detail-column some ou exibe a ação de criar.
- **nothing-selected** — há itens mas nenhum aberto: o detalhe orienta ("Escolha um item à esquerda") ou abre o primeiro pendente — decida e documente.
- **empty-filtered** — a busca não trouxe nada: mensagem na lista com "Limpar filtros"; o detalhe mantém o último item aberto apenas se ele ainda pertence ao resultado.
- **error** — falha da lista bloqueia a tela inteira com "Tentar novamente"; falha do detalhe fica só na detail-column, e a lista segue navegável.
- **no-access** — item específico restrito: o detalhe explica, a lista continua; conjunto inteiro restrito: tela de sem acesso.
- **success** — ação concluída: o status do item muda na lista na hora, confirmação breve, foco vai para o próximo item ou permanece, conforme a política.

## Variações

### two-fixed-columns
Lista com largura fixa (~320 px) e detalhe ocupando o resto.
**Favorece:** processamento contínuo em desktop; orientação constante.
**Piora:** em telas médias o detalhe fica apertado; documentos largos ficam ilegíveis.

### collapsible-master
A lista recolhe para uma faixa estreita (ou some) com um botão de alternância; o detalhe ganha a largura.
**Favorece:** detalhe rico (documento, formulário longo) sem perder o "próximo".
**Piora:** a orientação some quando recolhida; o botão precisa de nome acessível e estado (`aria-expanded`).

### stacked-detail-on-mobile
Em tela estreita, lista e detalhe viram duas telas, com "voltar" no topo do detalhe.
**Favorece:** celular; cada tela com largura total.
**Piora:** perde a visão simultânea; exige preservar a posição de rolagem da lista ao voltar.

## Anti-padrões

- Dois `h1` (um em cada coluna).
- Detalhe sem nenhuma indicação de qual item da lista está aberto.
- Trocar de item descartando alterações sem aviso.
- Rolagem única da página arrastando lista e detalhe juntos.
- Tabela de oito colunas espremida na master-column.
- Depois de aprovar, voltar ao topo da lista em vez de seguir para o próximo.

## Checklist

- [ ] Um único `h1`; o título do item é `h2`.
- [ ] Item aberto marcado na lista (visual e `aria-current`) e refletido na URL.
- [ ] Uma primária por região, no top-right do detalhe.
- [ ] "Anterior / próximo" com posição no conjunto.
- [ ] Política única para alterações não salvas ao trocar de item.
- [ ] Erro do detalhe não derruba a lista.
- [ ] Em tela estreita, detalhe vira tela própria com retorno visível.
