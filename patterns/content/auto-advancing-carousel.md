---
id: auto-advancing-carousel
title: Por que evitar carrossel com rotação automática?
category: content
components: [carousel, pause-control, position-indicator]
type: anti-pattern
impact: high
status: avoid
evidence: strong
wcag: ["2.2.2", "2.1.1", "2.4.7", "1.4.10"]
related: [carousel, main-navigation, keyboard-focus, tabs]
---

# Por que evitar carrossel com rotação automática?

> **Regra:** Não faça o carrossel girar sozinho; prefira controle manual ou seção estática e, se a rotação for inevitável, ofereça pausa visível e pare ao foco ou à interação.

## Contexto

O carrossel automático muda o conteúdo sem que ninguém acione controle algum. Parece um jeito eficaz de mostrar várias mensagens, mas encurta o tempo de leitura, atrapalha decisões e tira a atenção de quem usa teclado, toque, zoom ou leitor de tela.

A rotação cria uma mudança de contexto não solicitada: o clique pode cair em outro slide, o texto some antes de ser lido e parte do conteúdo nunca é vista. Testes de e-commerce encontraram problemas de usabilidade em parcela relevante dos carrosséis avaliados e recomendam evitar autorrotação no mobile.

Na maioria dos casos, uma seção estática ou um carrossel manual resolve melhor e é mais simples de implementar.

## Decisão

- **SE** a interface é móvel ou por toque **ENTÃO** desative a rotação automática.
- **SE** o conteúdo é essencial, uma oferta importante ou o único caminho para uma tarefa **ENTÃO** use uma seção estática, fora dos slides.
- **SE** o slide exige leitura atenta **ENTÃO** use controle manual.
- **SE** há razão clara para rotacionar em desktop **ENTÃO** ofereça botão visível de pausa e retomada, acessível por teclado.
- **SE** houver rotação **ENTÃO** pare ao receber foco ou hover e não reinicie sem ação explícita.
- **SE** a rotação passa de 5 segundos e ocorre ao lado de outro conteúdo **ENTÃO** é obrigatório haver mecanismo de pausar, parar ou ocultar.
- **SE** o sistema indica movimento reduzido **ENTÃO** não inicie a rotação.
- **SENÃO** use carrossel manual com anterior, próximo e indicação de posição.

## Quando usar

- Rotação automática apenas com objetivo claro e conteúdo secundário.
- Controle de pausa visível e acessível.
- Parada ao foco e à interação.
- Teste com teclado, toque e leitor de tela.

## Quando evitar

- Interfaces móveis ou por toque → **use em vez disso:** seção estática ou carrossel manual.
- Texto que exige leitura cuidadosa → **use em vez disso:** blocos estáticos.
- Cada slide é importante → **use em vez disso:** exibir todos em grade.
- Carrossel como única rota para uma tarefa → **use em vez disso:** links na navegação.
- Sem pausa clara → **use em vez disso:** controle manual.

## Faça

- Priorize controle manual.
- Mantenha o botão de pausa visível e rotulado.
- Repita o conteúdo essencial fora do carrossel.
- Dê tempo suficiente de leitura e respeite movimento reduzido.

## Evite

- Trocar slides sem ação da pessoa.
- Reiniciar a rotação depois de foco ou interação.
- Depender só de pontos para navegar.
- Esconder conteúdo essencial em slide.
- Limitar o tempo de leitura.

## Acessibilidade

- Critério 2.2.2: mecanismo para pausar, parar ou ocultar movimento que começa sozinho, dura mais de 5 s e aparece junto de outro conteúdo.
- O botão de pausa é operável por teclado, tem nome claro e permanece localizável.
- Padrão APG: parar a rotação ao foco ou hover e não retomar sem ação explícita.
- Comunique slide atual e posição sem mover o foco de forma inesperada.
- Não use só cor, movimento ou pontos como indicação; respeite `prefers-reduced-motion`.

## Microcópia

| Situação | Exemplo |
|---|---|
| Pausar | "Pausar apresentação" |
| Retomar | "Retomar apresentação" |
| Posição | "Slide 2 de 5" |
| Navegar | "Slide anterior" / "Próximo slide" |

## Checklist de verificação

- [ ] A rotação automática é realmente necessária.
- [ ] O conteúdo funciona sem autoplay.
- [ ] Existe botão de pausa visível e operável por teclado.
- [ ] A rotação para ao receber foco e após interação.
- [ ] Há controles de anterior e próximo.
- [ ] O conteúdo essencial também aparece fora do carrossel.
- [ ] No mobile não há rotação automática.
- [ ] Movimento reduzido é respeitado.
- [ ] Leitor de tela e zoom foram testados.

## Fundamentação

- WCAG 2.2, critério 2.2.2 (Pause, Stop, Hide): requisito mínimo para movimento automático; não prova que autoplay seja boa escolha.
- W3C WAI-ARIA APG (Carousel Pattern): parar ao foco ou hover, controle de parada e anúncio do slide atual.
- W3C WAI (tutorial de carrosséis): movimento precisa ser controlável.
- Baymard Institute (carrosséis de home e controles de página): evitar autorrotação em mobile, controles claros, seção estática como alternativa; evidência contextual de e-commerce.
- Nielsen Norman Group: pausar a rotação, permitir escolha direta do slide e repetir o conteúdo importante fora do carrossel.
