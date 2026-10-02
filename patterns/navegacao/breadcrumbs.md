---
id: breadcrumbs
titulo: Quando usar breadcrumbs?
categoria: navegacao
componentes: [breadcrumbs, navegacao-secundaria]
tipo: recomendacao
impacto: medio
status: recomendado
evidencia: moderada
wcag: ["2.4.8", "2.4.4", "1.4.10", "2.4.7", "1.3.1"]
relacionados: [abas, navegacao-principal, paginacao-vs-scroll, filtros-ativos]
---

# Quando usar breadcrumbs?

> **Regra:** Use breadcrumbs só quando existir hierarquia real de páginas, e trate o retorno aos resultados como uma ação separada da trilha.

## Contexto

Breadcrumbs são navegação secundária que mostra a posição da página na hierarquia e permite subir para níveis mais amplos. Não substituem o menu principal e não representam o caminho que a pessoa percorreu.

Existem duas necessidades separadas: a trilha hierárquica, fundada na arquitetura do conteúdo, e o retorno fundado no histórico, como "Voltar aos resultados". Em produtos com busca, filtros e entrada por link externo, misturar as duas desorienta a pessoa.

O valor aparece em páginas internas acessadas diretamente, sem passar pela home. Em estruturas rasas, páginas isoladas ou fluxos lineares, o componente vira ruído e sugere uma hierarquia que não existe.

## Decisão

- **SE** o produto tem hierarquia profunda e a pessoa pode chegar direto a páginas internas **ENTÃO** use breadcrumbs.
- **SE** é catálogo, base de conhecimento ou portal extenso **ENTÃO** use breadcrumbs.
- **SE** a estrutura é rasa e a posição já é evidente **ENTÃO** não use.
- **SE** é home, landing page isolada ou página sem pai relevante **ENTÃO** não use.
- **SE** é um fluxo linear (formulário, checkout) **ENTÃO** use indicador de progresso, não breadcrumbs.
- **SE** a pessoa precisa recuperar busca, filtros e ordenação **ENTÃO** ofereça "Voltar aos resultados" além da trilha.
- **SE** o nível não corresponde a uma página existente **ENTÃO** não o inclua.
- **SE** a tela é pequena **ENTÃO** compacte por truncamento, agrupamento ou menu de ancestrais, sem deixar nenhum nível inacessível.
- **SENÃO** não adicione o componente por hábito.

## Quando usar

- Hierarquia de conteúdo profunda.
- Páginas internas acessadas por busca ou link externo.
- Catálogos, bases de conhecimento e portais extensos.
- Subir para a categoria pai é tarefa frequente.

## Quando evitar

- Home e páginas sem pai relevante → **use em vez disso:** nenhuma trilha.
- Sites rasos → **use em vez disso:** menu principal.
- Fluxos lineares → **use em vez disso:** indicador de progresso.
- Substituto do menu principal → **use em vez disso:** navegação principal.
- Trilha baseada no caminho casual da sessão → **use em vez disso:** hierarquia real mais ação de voltar.

## Faça

- Modele a trilha a partir da arquitetura, não do histórico.
- Faça cada nível anterior apontar para uma página existente.
- Termine com o nome da página atual.
- Use os mesmos nomes da navegação, dos títulos e das categorias.
- Posicione de forma consistente, depois do cabeçalho e antes do título.
- Teste entradas diretas por busca e link externo.

## Evite

- Exibir em toda página.
- Inventar níveis para SEO.
- Usar rótulos vagos.
- Confundir com etapas de um processo.
- Apagar filtros ao voltar.
- Esconder a trilha no mobile sem alternativa.

## Acessibilidade

- Marque como região de navegação rotulada (nav com nome acessível) e use lista ordenada (1.3.1).
- Níveis anteriores são links com nomes compreensíveis (2.4.4); o item atual pode ser texto ou link com aria-current="page".
- Esconda separadores decorativos da leitura assistiva.
- Links e controles de truncamento operáveis por teclado, com foco visível e contraste (2.4.7).
- Em telas estreitas, quebre, trunque ou abra lista de ancestrais, sem impedir o acesso aos níveis; teste zoom de 200% e 400% (1.4.10).
- A trilha não pode ser o único modo de chegar a uma área importante.
- Quando houver mais de um nav na página, rotule cada um.

## Microcópia

| Situação | Exemplo |
|---|---|
| Rótulo da região | "Você está em" |
| Trilha | "Início > Móveis > Mesas > Mesa de jantar" |
| Retorno com contexto | "Voltar aos resultados" |
| Truncamento | "Mostrar níveis anteriores" |

## Checklist de verificação

- [ ] Existe hierarquia real com pelo menos dois níveis.
- [ ] Cada nível anterior é um link para página existente.
- [ ] A página atual está identificada no fim da trilha.
- [ ] Os rótulos são iguais aos da navegação e dos títulos.
- [ ] A trilha está dentro de nav com nome acessível e usa lista ordenada.
- [ ] Separadores decorativos não são lidos.
- [ ] Quando há busca ou filtros, existe "Voltar aos resultados" que os preserva.
- [ ] No mobile, os ancestrais continuam acessíveis.
- [ ] Funciona com teclado, zoom de 400% e leitor de tela.

## Fundamentação

- U.S. Web Design System, breadcrumb: navegação secundária; evitar em sites simples, landing pages e processos passo a passo; marcação com nav, lista ordenada e aria-current.
- Padrão Digital GOV.BR, breadcrumb: navegação estrutural, página atual, truncamento e telas pequenas.
- W3C WAI, técnica G65 e padrão de breadcrumb da WAI-ARIA APG: trilha hierárquica, região rotulada e aria-current.
- Baymard Institute: dois tipos de breadcrumbs (hierarquia e histórico) e comportamento em páginas de produto móveis; evidência específica de e-commerce.
- W3C Design System: implementação acessível e rótulo quando há mais de um nav.
- Nielsen Norman Group, relatório de intranets: exemplos de trilha para localização.
- WCAG 2.2, critério 2.4.8 (localização).
