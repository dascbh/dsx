---
id: biblioteca
titulo: Biblioteca
resumo: Acervo de itens reutilizáveis (modelos, cláusulas, documentos de referência) organizado em coleções, com busca, visualização rápida e curadoria.
registro: [operacional, editorial]
quando-usar: SE a pessoa procura um item para reutilizar ou consultar, escolhendo por categoria, nome ou conteúdo ENTÃO use biblioteca
evitar-quando: os itens são casos de trabalho com status e prazo (use lista operacional) ou o acervo tem menos de ~10 itens (uma lista simples basta)
regioes: [cabecalho-da-pagina, navegacao-de-colecoes, barra-de-busca, conteudo, visualizacao-rapida]
acao-primaria: { regiao: cabecalho-da-pagina, posicao: topo-direita, max: 1 }
estados: [carregando, vazio, vazio-por-filtro, erro, sem-acesso, sucesso]
padroes: [estrutura-de-filtros, busca-sem-resultados, filtros-ativos, tabela-vs-cards, estado-vazio, upload-de-arquivos, paginacao-vs-scroll, confirmar-exclusao, botao-desabilitado]
variacoes: [grade-de-cartoes, lista-densa, colecoes-em-arvore, com-visualizacao-rapida]
regras: [T1, T3, T5, T6, T7, F1]
---

# Biblioteca

Modelos de contrato, cláusulas aprovadas com alternativas, modelos de aditivo, peças de referência. A diferença para a lista operacional: aqui o item não "anda" — ele é escolhido, copiado, aplicado. A pessoa chega com uma ideia vaga ("aquela cláusula de foro") e precisa reconhecer o item certo pelo conteúdo, não pelo código.

## Quando usar

- **SE** os itens são reutilizados como ponto de partida **ENTÃO** use biblioteca, com "Usar este modelo" como ação central do item.
- **SE** a escolha depende de ver o conteúdo **ENTÃO** use `com-visualizacao-rapida`; abrir e voltar item a item é lento.
- **SE** o acervo tem hierarquia natural (área → tipo → item) **ENTÃO** use `colecoes-em-arvore`; com categorias planas, filtros bastam.
- **SE** há curadoria (quem pode criar, aprovar, travar) **ENTÃO** ações de curadoria aparecem só para quem tem o papel, e o estado do item (rascunho, aprovado, obsoleto) é visível.
- **SE** os itens têm prazo, responsável ou status de trabalho **ENTÃO** é `lista-operacional`.
- **SENÃO** (acervo pequeno) **ENTÃO** uma lista simples numa seção de configurações resolve.

## Mapa de regiões

```
┌──────────────────────────────────────────────────────────────┐
│ cabecalho-da-pagina  Biblioteca (h1)                [Novo modelo]│
├──────────────────┬───────────────────────────────────────────┤
│ navegacao-de-    │ barra-de-busca [Buscar no título e texto…] │
│ colecoes         │ Tipo ▾  Situação ▾   chips ativos ×        │
│ ▸ Contratos (34) ├──────────────────────────┬────────────────┤
│ ▾ Cláusulas (120)│ conteudo                 │ visualizacao-  │
│   · Foro         │ ┌──────┐ ┌──────┐        │ rapida         │
│   · Pagamento    │ │Modelo│ │Modelo│        │ Prévia do texto│
│ ▸ Aditivos (12)  │ └──────┘ └──────┘        │ [Usar modelo]  │
└──────────────────┴──────────────────────────┴────────────────┘
```

## O que vai em cada região

- **cabecalho-da-pagina** — `h1`, primária de criação/importação para curadores; para quem não cura, sem primária.
- **navegacao-de-colecoes** — coleções com contagem; a coleção atual marcada com `aria-current`; "Todos" no topo.
- **barra-de-busca** — busca que procura no título e no conteúdo, destacando o trecho encontrado; filtros por tipo e situação; chips de filtros ativos.
- **conteudo** — cartões ou linhas com nome, trecho inicial ou descrição, situação (aprovado, rascunho, obsoleto) e data de revisão; obsoletos discretos mas encontráveis.
- **visualizacao-rapida** — prévia do item selecionado, metadados (quem aprovou, quando, onde é usado) e a ação de uso; sem edição aqui.

## Ações

- **Primária da página:** uma, no `cabecalho-da-pagina`, topo-direita — criar ou importar, só para quem cura.
- **Ação do item:** "Usar este modelo" / "Inserir cláusula" na visualização rápida ou no cartão; é o objetivo da maioria das visitas.
- **Curadoria:** editar, aprovar, marcar obsoleto, excluir — em "Mais ações"; excluir item em uso avisa onde ele é usado e prefere "marcar como obsoleto".
- **Envio de arquivos:** importação aceita arrastar e soltar, diz formatos e limite antes, mostra progresso por arquivo.

## Estados

- **carregando** — esqueleto dos cartões; coleções já navegáveis.
- **vazio** — biblioteca sem itens: para curadores, explique e ofereça criar/importar; para os demais, diga quem alimenta a biblioteca.
- **vazio-por-filtro** — nada encontrado: mostre o termo e os filtros, sugira buscar em todas as coleções e "Limpar filtros".
- **erro** — falha ao carregar: alerta no conteúdo com "Tentar novamente"; busca preservada.
- **sem-acesso** — coleção restrita: ela não aparece para quem não pode ver; acesso direto por endereço explica a restrição.
- **sucesso** — item criado ou usado: confirmação com link para o resultado ("Minuta criada a partir de Modelo X — Abrir").

## Variações

### grade-de-cartoes
Cartões com nome, trecho e situação.
**Favorece:** reconhecimento visual, acervos médios, primeira exploração.
**Piora:** menos itens por tela; comparar datas e situações fica difícil.

### lista-densa
Linhas com colunas (nome, tipo, situação, revisão), ordenáveis.
**Favorece:** acervos grandes, curadoria, quem sabe o nome do que procura.
**Piora:** reconhecimento pelo conteúdo cai sem a prévia.

### colecoes-em-arvore
Navegação hierárquica à esquerda com contagem por nó.
**Favorece:** taxonomia estável e conhecida pelo time.
**Piora:** itens que pertencem a duas categorias; árvore funda (mais de 3 níveis) desorienta.

### com-visualizacao-rapida
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
- [ ] `vazio` diferente para curador e não curador; `vazio-por-filtro` com "Limpar filtros".
- [ ] Coleção atual marcada; contagens por coleção.
