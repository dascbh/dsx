---
id: link-text
title: Por que evitar "clique aqui" em links?
category: ux-writing
components: [link]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["2.4.4", "2.4.9", "2.5.3", "1.4.1"]
related: [link-vs-button, link-in-new-tab, button-text, keyboard-focus]
---

# Por que evitar "clique aqui" em links?

> **Regra:** O texto do link deve informar o destino ou o propósito por si só; nunca use "clique aqui", "aqui" ou "leia mais" como único texto clicável.

## Contexto

Links levam a outra página, seção, documento ou recurso. As pessoas os localizam por varredura visual, pelo teclado ou pela lista de links do leitor de tela. Se vários dizem só "clique aqui" ou "saiba mais", o destino se perde longe da frase ao redor.

Esta regra cobre a redação. Escolher entre link e botão, abrir em nova aba, foco e contraste têm padrões próprios.

Um benchmark de 33 sites de e-commerce relatou descrição insuficiente do destino em 67% deles; o número vale para aquela amostra e setor, mas mostra que o problema é recorrente.

## Decisão

- **SE** o link leva a um destino **ENTÃO** nomeie a página, seção, arquivo ou recurso no próprio texto ("Consultar os critérios WCAG 2.2").
- **SE** o texto é "aqui", "clique aqui" ou "leia mais" isolado **ENTÃO** reescreva com as palavras informativas dentro do link.
- **SE** links próximos levam a destinos diferentes **ENTÃO** use textos diferentes.
- **SE** links têm a mesma função e destino **ENTÃO** use o mesmo texto.
- **SE** o contexto é indispensável **ENTÃO** mantenha-o na mesma frase, parágrafo, item ou célula e associe-o programaticamente.
- **SE** o link baixa arquivo ou muda de contexto **ENTÃO** informe formato e, se relevante, tamanho ("Baixar contrato (PDF, 2 MB)").
- **SE** o link é só imagem ou ícone **ENTÃO** forneça nome acessível que descreva o destino.
- **SE** é navegação **ENTÃO** use `<a href>` nativo; **SE** é ação **ENTÃO** use botão.
- **SENÃO** escreva texto curto, em sentence case, coerente com o título da página de destino.

## Quando usar

- Listas de recursos, artigos, documentos e resultados.
- Cards que repetem a mesma ação para conteúdos distintos.
- Downloads em que formato ou tamanho influenciam a decisão.
- Navegação por teclado ou por lista de links.

## Quando evitar

- "Clique aqui", "aqui", "este link" como único texto → **use em vez disso:** nome do destino.
- "Leia mais" repetido para destinos distintos → **use em vez disso:** "Ler sobre <assunto>".
- Parágrafo inteiro dentro do link → **use em vez disso:** poucas palavras informativas.
- URL longa como rótulo → **use em vez disso:** nome do recurso.
- "Link para…" → **use em vez disso:** direto o destino (o leitor de tela já anuncia "link").

## Faça

- Nomeie o destino.
- Informe downloads e mudanças de contexto.
- Diferencie links repetidos acrescentando o objeto.
- Teste o texto numa lista isolada de links.

## Evite

- Depender só de posição, cor, ícone ou imagem vizinha.
- Esconder o destino.
- Frases longas como texto do link.

## Acessibilidade

- WCAG 2.4.4 (A): propósito determinável pelo texto ou pelo contexto programaticamente associado.
- Teste em lista isolada com teclado e leitor de tela; se vários forem anunciados como "saiba mais", acrescente o objeto.
- Não esconda texto visível claro atrás de `aria-label` diferente (WCAG 2.5.3).
- Link só de imagem ou ícone precisa de nome acessível.
- Foco visível e diferenciação além da cor (WCAG 1.4.1) complementam esta regra.

## Microcópia

| Situação | Exemplo |
|---|---|
| Documento | "Consultar a política de privacidade" |
| Download | "Baixar relatório de acessibilidade (PDF)" |
| Planos | "Saiba mais sobre o plano empresarial" |
| Nova aba | "Abrir documentação em nova aba" |

## Checklist de verificação

- [ ] O texto informa o destino ou propósito?
- [ ] O link faz sentido fora da frase?
- [ ] Links próximos com destinos diferentes têm textos diferentes?
- [ ] Links para o mesmo destino usam o mesmo texto?
- [ ] Nenhum link usa "clique aqui", "aqui" ou "leia mais" isolado?
- [ ] Downloads e mudanças de contexto são informados?
- [ ] O link usa `<a>` com `href` válido?
- [ ] O texto foi testado em lista de links com leitor de tela?

## Fundamentação

- WCAG 2.2, 2.4.4 (Link Purpose in Context): propósito pelo texto ou contexto associado.
- GOV.UK Service Manual (escrita para interfaces): propósito no próprio texto; leitores de tela listam links isolados.
- Baymard Institute (links de navegação em e-commerce): textos genéricos e dependência de contexto (benchmark de 33 sites).
- Nielsen Norman Group (padrão F de leitura): palavras informativas em links apoiam a varredura.
- MDN (elemento `<a>`): link nativo com `href`.
- Adobe Spectrum e IBM Carbon (Link) e U.S. Web Design System: texto significativo e único.
