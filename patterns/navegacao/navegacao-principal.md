---
id: navegacao-principal
titulo: Como criar uma navegação principal clara?
categoria: navegacao
componentes: [cabecalho, nav, menu, submenu, menu-mobile]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["2.4.1", "2.4.7", "1.3.1", "2.1.1", "1.4.4", "1.4.10", "3.2.3"]
relacionados: [breadcrumbs, abas, link-em-nova-aba, paginacao-vs-scroll]
---

# Como criar uma navegação principal clara?

> **Regra:** Mostre poucos destinos no primeiro nível, com rótulos na linguagem do público, separados de ações, em posição consistente, com a seção atual indicada e operação sem depender de hover.

## Contexto

A navegação principal é o grupo fixo de links para as áreas mais relevantes. Ela converte a arquitetura de informação em uma estrutura que a pessoa reconhece, percorre com o olhar e reaproveita de página em página.

Ser claro não significa expor tudo no mesmo nível. Significa ordenar por importância e pela linguagem de quem usa, separar navegação de ações e dar um caminho previsível às áreas que sustentam as tarefas centrais.

Rótulos vagos, excesso de opções e hierarquia profunda aumentam o esforço e dificultam prever destinos. Menu que só funciona com hover, esconde o foco ou fecha ao menor movimento exclui pessoas.

## Decisão

- **SE** definir os itens **ENTÃO** parta das tarefas e áreas mais usadas, não do organograma.
- **SE** o primeiro nível tem muitos itens **ENTÃO** agrupe ou rebaixe: mantenha poucos destinos relevantes (teste para confirmar o limite do seu contexto).
- **SE** um item é ação (criar, entrar, sair, buscar) **ENTÃO** tire-o do grupo de destinos e trate como botão ou controle próprio.
- **SE** itens têm relação clara **ENTÃO** use submenu e mantenha a hierarquia curta o bastante para prever o destino.
- **SE** a página pertence a uma seção **ENTÃO** marque-a como atual, por texto e estrutura.
- **SE** a tela é pequena **ENTÃO** preserve os destinos essenciais e garanta abrir, percorrer e fechar o menu por toque e teclado.
- **SE** a estrutura é vasta **ENTÃO** reforce com busca, breadcrumbs, links contextuais ou páginas de índice.
- **SE** o item exige "Mais" ou ícone sem texto para um destino essencial **ENTÃO** mostre-o com texto.
- **SENÃO** mantenha posição, nomes e comportamento idênticos em todas as páginas.

## Quando usar

- Sites com várias áreas recorrentes.
- Produtos com tarefas em módulos distintos.
- Portais, intranets e catálogos extensos.
- Navegação global e local bem diferenciadas.

## Quando evitar

- Navegação principal para todas as ações → **use em vez disso:** botões e menus de ação dedicados.
- Páginas isoladas no mesmo nível das áreas → **use em vez disso:** agrupar ou usar links contextuais.
- Categorias essenciais sob "Mais" → **use em vez disso:** exibi-las com nome próprio.
- Menus profundos sem teste → **use em vez disso:** hierarquia curta e breadcrumbs.
- Dependência de hover → **use em vez disso:** abertura por clique, toque e teclado.

## Faça

- Use rótulos curtos e familiares.
- Indique a seção atual.
- Preserve foco e estado ao navegar.
- Teste caminhos com tarefas reais em desktop e mobile.

## Evite

- Jargão interno.
- Encher o primeiro nível.
- Ícones sem texto para destinos importantes.
- Mudar rótulos de uma página para outra.
- Tratar o menu como decoração.

## Acessibilidade

- Use `<header>` e `<nav aria-label="Navegação principal">`, com links em lista e mecanismo para pular blocos repetidos (2.4.1).
- Várias regiões de navegação recebem nomes acessíveis distintos.
- Links para destinos, botões para abrir submenus com `aria-expanded`; seção atual com `aria-current="page"`.
- Não aplique `role="menubar"`, `menu` e `menuitem` a navegação comum de site; isso exige comportamento de aplicativo.
- Foco visível, ordem lógica, contraste, zoom de 200% e reflow a 400% (2.4.7, 1.4.4, 1.4.10), teclado e leitor de tela.
- Navegação consistente entre páginas (3.2.3).

## Microcópia

| Situação | Exemplo |
|---|---|
| Rótulo de região | "Navegação principal" |
| Item atual | "Pedidos" (com estado atual) |
| Abrir submenu | "Abrir submenu de Produtos" |
| Menu mobile | "Abrir menu" / "Fechar menu" |

## Checklist de verificação

- [ ] Os itens principais representam tarefas e áreas importantes.
- [ ] Os rótulos usam linguagem familiar ao público.
- [ ] Navegação e ações estão separadas.
- [ ] A hierarquia tem poucos níveis compreensíveis.
- [ ] A seção atual está identificada.
- [ ] Submenus funcionam sem depender de hover.
- [ ] A navegação funciona com teclado e toque.
- [ ] O menu móvel mantém os destinos essenciais.
- [ ] Existe busca ou rota complementar quando a estrutura é extensa.
- [ ] A arquitetura foi testada com tarefas reais.

## Fundamentação

- U.S. Web Design System (Header): seções principais como links, rótulos curtos, sem jargão.
- W3C WAI (tutorial de menus e design de navegação): semântica, estados, teclado, ponteiro, toque e consistência.
- W3C WAI, técnica H101 e landmark de navegação: regiões nomeadas para tecnologia assistiva.
- Baymard Institute (categorias como navegação principal no mobile): categorias escondidas sob item genérico geram problemas; achado de e-commerce.
- Nielsen Norman Group (checklist de design de menus): visibilidade, rótulos familiares, consistência e localização da área atual.
- Padrão Digital de Governo (GOV.BR), Menu: variações de menu em diferentes resoluções.
