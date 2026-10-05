---
id: library
title: Biblioteca
summary: Acervo de itens reutilizáveis (modelos, itens de catálogo, documentos de referência) organizado em coleções, com busca, visualização rápida e curadoria.
register: [operational, editorial]
when-to-use: SE a pessoa procura um item para reutilizar ou consultar, escolhendo por categoria, nome ou conteúdo ENTÃO use biblioteca
avoid-when: os itens são casos de trabalho com status e prazo (use lista operacional) ou o acervo tem menos de ~10 itens (uma lista simples basta)
regions: [page-header, collection-navigation, search-bar, content, quick-view]
primary-action: { region: page-header, position: top-right, max: 1 }
states: [loading, empty, empty-filtered, error, no-access, success]
patterns: [filter-structure, no-search-results, active-filters, table-vs-cards, empty-state, file-upload, pagination-vs-scroll, confirm-deletion, disabled-button]
variations: [card-grid, dense-list, collection-tree, with-quick-view]
rules: [T1, T3, T5, T6, T7, F1]
---

# Biblioteca

Itens de catálogo aprovados com alternativas, modelos de pedido, especificações técnicas, listas de preço de referência. A diferença para a lista operacional: aqui o item não "anda" — ele é escolhido, copiado, aplicado. A pessoa chega com uma ideia vaga ("aquele parafuso inox de 8 mm") e precisa reconhecer o item certo pelo conteúdo, não pelo código.

## Quando usar

- **SE** os itens são reutilizados como ponto de partida **ENTÃO** use biblioteca, com "Usar este modelo" como ação central do item.
- **SE** a escolha depende de ver o conteúdo **ENTÃO** use `with-quick-view`; abrir e voltar item a item é lento.
- **SE** o acervo tem hierarquia natural (área → tipo → item) **ENTÃO** use `collection-tree`; com categorias planas, filtros bastam.
- **SE** há curadoria (quem pode criar, aprovar, travar) **ENTÃO** ações de curadoria aparecem só para quem tem o papel, e o estado do item (rascunho, aprovado, obsoleto) é visível.
- **SE** os itens têm prazo, responsável ou status de trabalho **ENTÃO** é `operational-list`.
- **SENÃO** (acervo pequeno) **ENTÃO** uma lista simples numa seção de configurações resolve.

## Mapa de regiões

```
┌──────────────────────────────────────────────────────────────┐
│ page-header  Biblioteca (h1)                [Novo modelo]        │
├──────────────────┬───────────────────────────────────────────┤
│ collection-      │ search-bar [Buscar no título e texto…]     │
│ navigation       │ Tipo ▾  Situação ▾   chips ativos ×        │
│ ▸ Modelos (34)   ├──────────────────────────┬────────────────┤
│ ▾ Itens (120)    │ content                  │ quick-view     │
│   · Foro         │ ┌──────┐ ┌──────┐        │                │
│   · Pagamento    │ │Modelo│ │Modelo│        │ Prévia do texto│
│ ▸ Especific. (12)│ └──────┘ └──────┘        │ [Usar modelo]  │
└──────────────────┴──────────────────────────┴────────────────┘
```

## O que vai em cada região

- **page-header** — `h1`, primária de criação/importação para curadores; para quem não cura, sem primária.
- **collection-navigation** — coleções com contagem; a coleção atual marcada com `aria-current`; "Todos" no topo.
- **search-bar** — busca que procura no título e no conteúdo, destacando o trecho encontrado; filtros por tipo e situação; chips de filtros ativos.
- **content** — cartões ou linhas com nome, trecho inicial ou descrição, situação (aprovado, rascunho, obsoleto) e data de revisão; obsoletos discretos mas encontráveis.
- **quick-view** — prévia do item selecionado, metadados (quem aprovou, quando, onde é usado) e a ação de uso; sem edição aqui.

## Ações

- **Primária da página:** uma, no `page-header`, top-right — criar ou importar, só para quem cura.
- **Ação do item:** "Usar este modelo" / "Adicionar ao pedido" na visualização rápida ou no cartão; é o objetivo da maioria das visitas.
- **Curadoria:** editar, aprovar, marcar obsoleto, excluir — em "Mais ações"; excluir item em uso avisa onde ele é usado e prefere "marcar como obsoleto".
- **Envio de arquivos:** importação aceita arrastar e soltar, diz formatos e limite antes, mostra progresso por arquivo.

## Estados

- **loading** — esqueleto dos cartões; coleções já navegáveis.
- **empty** — biblioteca sem itens: para curadores, explique e ofereça criar/importar; para os demais, diga quem alimenta a biblioteca.
- **empty-filtered** — nada encontrado: mostre o termo e os filtros, sugira buscar em todas as coleções e "Limpar filtros".
- **error** — falha ao carregar: alerta no conteúdo com "Tentar novamente"; busca preservada.
- **no-access** — coleção restrita: ela não aparece para quem não pode ver; acesso direto por endereço explica a restrição.
- **success** — item criado ou usado: confirmação com link para o resultado ("Pedido criado a partir de Modelo X — Abrir").

## Variações

### card-grid
Cartões com nome, trecho e situação.
**Favorece:** reconhecimento visual, acervos médios, primeira exploração.
**Piora:** menos itens por tela; comparar datas e situações fica difícil.

### dense-list
Linhas com colunas (nome, tipo, situação, revisão), ordenáveis.
**Favorece:** acervos grandes, curadoria, quem sabe o nome do que procura.
**Piora:** reconhecimento pelo conteúdo cai sem a prévia.

### collection-tree
Navegação hierárquica à esquerda com contagem por nó.
**Favorece:** taxonomia estável e conhecida pelo time.
**Piora:** itens que pertencem a duas categorias; árvore funda (mais de 3 níveis) desorienta.

### with-quick-view
Coluna de prévia à direita do conteúdo.
**Favorece:** escolher pelo texto sem abrir e voltar.
**Piora:** consome largura; em tela estreita vira painel sobreposto.

## Anti-padrões

- Busca só no título quando a pessoa lembra do conteúdo.
- Botão de curadoria visível (e desabilitado) para quem nunca terá o papel.
- Excluir modelo em uso sem dizer onde ele é usado.
- Itens obsoletos misturados aos aprovados sem marcação.
- Abrir o item em página nova para cada espiada.

## Checklist

- [ ] Busca no título e no conteúdo, com trecho destacado.
- [ ] Situação do item visível (aprovado, rascunho, obsoleto).
- [ ] Ação de uso a um clique a partir da prévia.
- [ ] Curadoria só para quem tem o papel; exclusão com aviso de uso e alternativa "obsoleto".
- [ ] `empty` diferente para curador e não curador; `empty-filtered` com "Limpar filtros".
- [ ] Coleção atual marcada; contagens por coleção.
