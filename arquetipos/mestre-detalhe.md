---
id: mestre-detalhe
titulo: Mestre-detalhe
resumo: Duas colunas na mesma tela, a lista à esquerda e o registro selecionado à direita, para percorrer itens em sequência sem trocar de página.
registro: [operacional]
quando-usar: SE a pessoa percorre registros um após o outro e precisa ver o conteúdo de cada um com a lista sempre à mão ENTÃO use mestre-detalhe
evitar-quando: a comparação entre linhas por várias colunas é a tarefa principal, o detalhe é longo demais para meia tela ou o uso é majoritariamente em celular
regioes: [cabecalho-da-pagina, coluna-mestre, coluna-detalhe]
acao-primaria: { regiao: coluna-detalhe, posicao: topo-direita, max: 1 }
estados: [carregando, vazio, nada-selecionado, vazio-por-filtro, erro, sem-acesso, sucesso]
padroes: [paginacao-vs-scroll, estado-vazio, busca-sem-resultados, filtros-ativos, abas, skeleton-vs-spinner, foco-de-teclado, breadcrumbs]
variacoes: [duas-colunas-fixas, mestre-recolhivel, detalhe-empilhado-no-mobile]
regras: [T1, T3, T6, T7, F1, F5]
---

# Mestre-detalhe

Caixa de entrada de pendências, fila de documentos para revisar, lista de comentários de uma minuta: a pessoa abre um, resolve, passa para o próximo. A lista dá orientação ("onde estou, quanto falta"); o detalhe dá o conteúdo. As duas convivem na mesma tela, e a seleção é o fio que as liga.

## Quando usar

- **SE** a tarefa é processar itens em sequência (ler, decidir, seguir) **ENTÃO** use mestre-detalhe; ofereça "próximo" e "anterior" no detalhe.
- **SE** a lista identifica cada item com 2–3 informações (título, status, data) **ENTÃO** a coluna-mestre é uma lista compacta, não uma tabela.
- **SE** o detalhe precisa de mais de ~60% da largura para ser útil (documento, editor) **ENTÃO** troque para `documento-com-visor` ou `editor-com-painel`, com a lista como navegação recolhível.
- **SE** a pessoa compara linhas por muitas colunas **ENTÃO** use `lista-operacional`; o mestre-detalhe esconde colunas.
- **SE** a consulta ao detalhe é ocasional e curta, partindo de uma tabela **ENTÃO** use `painel-lateral-de-detalhe` sobre a lista.
- **SENÃO** prefira páginas separadas (lista → página do registro) com retorno visível.

## Mapa de regiões

```
┌──────────────────────────────────────────────────────────────┐
│ cabecalho-da-pagina  Título (h1) · [Buscar…] [Filtro ▾]       │
├───────────────────────┬──────────────────────────────────────┤
│ coluna-mestre         │ coluna-detalhe                        │
│ ▌Item A    Pendente   │ Título do item (h2)    [Ação primária]│
│  Item B    Em revisão │ ‹ anterior · 3 de 41 · próximo ›      │
│  Item C    Concluído  │ ───────────────────────────────────── │
│  Item D    Pendente   │ Conteúdo do item selecionado          │
│  …                    │ Metadados · histórico                 │
│ 41 itens              │                                       │
└───────────────────────┴──────────────────────────────────────┘
```

## O que vai em cada região

- **cabecalho-da-pagina** — `h1` do conjunto, busca e no máximo dois filtros que afetam a coluna-mestre; ação de criar, se houver, como secundária (a primária da tela é a ação sobre o item aberto).
- **coluna-mestre** — lista compacta: título do item, status em texto, data ou responsável. Item selecionado com marcação visual forte e `aria-current`. Rolagem própria, independente do detalhe. Contagem no pé ("41 itens") e carregamento progressivo ou paginação simples.
- **coluna-detalhe** — título do item (`h2`, não `h1`), ação primária sobre ele no topo-direita, navegação "anterior / próximo" com posição ("3 de 41"), conteúdo e metadados. Se o conteúdo tiver partes, use abas dentro do detalhe, nunca uma segunda lista.

## Ações

- **Primária:** uma só, na `coluna-detalhe`, topo-direita — a ação que resolve o item ("Aprovar", "Marcar como revisado"). Ao concluir, ofereça ir ao próximo pendente automaticamente, com aviso.
- **Secundárias:** junto da primária, com menor ênfase; destrutivas em menu "Mais ações".
- **Seleção:** clicar na lista troca o detalhe sem recarregar a tela; setas do teclado percorrem a lista quando ela tem foco; a URL guarda o item aberto.
- **Alterações não salvas no detalhe:** trocar de item pergunta antes de descartar, ou salva rascunho automaticamente — escolha uma política e aplique em todo o produto.

## Estados

- **carregando** — esqueleto na lista; no detalhe, esqueleto só depois que um item é escolhido. Troca de item mostra indicador no detalhe sem apagar a lista.
- **vazio** — não há itens: a coluna-mestre explica, a coluna-detalhe some ou exibe a ação de criar.
- **nada-selecionado** — há itens mas nenhum aberto: o detalhe orienta ("Escolha um item à esquerda") ou abre o primeiro pendente — decida e documente.
- **vazio-por-filtro** — a busca não trouxe nada: mensagem na lista com "Limpar filtros"; o detalhe mantém o último item aberto apenas se ele ainda pertence ao resultado.
- **erro** — falha da lista bloqueia a tela inteira com "Tentar novamente"; falha do detalhe fica só na coluna-detalhe, e a lista segue navegável.
- **sem-acesso** — item específico restrito: o detalhe explica, a lista continua; conjunto inteiro restrito: tela de sem acesso.
- **sucesso** — ação concluída: o status do item muda na lista na hora, confirmação breve, foco vai para o próximo item ou permanece, conforme a política.

## Variações

### duas-colunas-fixas
Lista com largura fixa (~320 px) e detalhe ocupando o resto.
**Favorece:** processamento contínuo em desktop; orientação constante.
**Piora:** em telas médias o detalhe fica apertado; documentos largos ficam ilegíveis.

### mestre-recolhivel
A lista recolhe para uma faixa estreita (ou some) com um botão de alternância; o detalhe ganha a largura.
**Favorece:** detalhe rico (documento, formulário longo) sem perder o "próximo".
**Piora:** a orientação some quando recolhida; o botão precisa de nome acessível e estado (`aria-expanded`).

### detalhe-empilhado-no-mobile
Em tela estreita, lista e detalhe viram duas telas, com "voltar" no topo do detalhe.
**Favorece:** celular; cada tela com largura total.
**Piora:** perde a visão simultânea; exige preservar a posição de rolagem da lista ao voltar.

## Anti-padrões

- Dois `h1` (um em cada coluna).
- Detalhe sem nenhuma indicação de qual item da lista está aberto.
- Trocar de item descartando alterações sem aviso.
- Rolagem única da página arrastando lista e detalhe juntos.
- Tabela de oito colunas espremida na coluna-mestre.
- Depois de aprovar, voltar ao topo da lista em vez de seguir para o próximo.

## Checklist

- [ ] Um único `h1`; o título do item é `h2`.
- [ ] Item aberto marcado na lista (visual e `aria-current`) e refletido na URL.
- [ ] Uma primária por região, no topo-direita do detalhe.
- [ ] "Anterior / próximo" com posição no conjunto.
- [ ] Política única para alterações não salvas ao trocar de item.
- [ ] Erro do detalhe não derruba a lista.
- [ ] Em tela estreita, detalhe vira tela própria com retorno visível.
