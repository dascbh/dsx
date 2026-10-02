---
id: carrossel
titulo: Quando usar carrossel?
categoria: conteudo
componentes: [carrossel, galeria, controles-de-navegacao]
tipo: decisao-contextual
impacto: medio
status: recomendado
evidencia: forte
wcag: ["2.2.2", "1.4.10", "2.1.1", "2.3.3", "2.4.7", "4.1.2"]
relacionados: [carrossel-automatico, abas, alvo-de-toque, estrutura-de-filtros]
---

# Quando usar carrossel?

> **Regra:** Use carrossel apenas para itens relacionados e de exploração opcional, com controle manual e sem esconder conteúdo essencial.

## Contexto

Um carrossel exibe só parte de uma coleção e permite avançar, recuar ou arrastar. Poupa espaço, mas esconde conteúdo e pode trazer movimento, controles de difícil localização e problemas de leitura.

Comece pela tarefa, não pelo componente. Se cada item é importante, independente ou necessário à decisão, uma composição estática é mais clara. O conteúdo escondido pode passar despercebido, e pesquisas encontraram problemas de usabilidade em parcela relevante de carrosséis de páginas iniciais.

Isso não torna o carrossel sempre errado: ele funciona para coleções relacionadas com exploração sequencial opcional, desde que a equipe consiga implementar e testar semântica, controles e controle de movimento.

## Decisão

- **SE** os itens são relacionados e a exploração sequencial traz valor **ENTÃO** carrossel é aceitável.
- **SE** os itens são mensagens independentes ou qualquer um pode ser essencial **ENTÃO** use seção estática.
- **SE** é a única rota para uma chamada, produto ou ação importante **ENTÃO** não use carrossel.
- **SE** há muitos itens **ENTÃO** reduza a coleção ou use grade, lista ou paginação.
- **SE** o carrossel depende só de swipe **ENTÃO** adicione botões anterior e próximo.
- **SE** é galeria de imagens **ENTÃO** use miniaturas ou rótulos úteis em vez de só pontos.
- **SE** a rotação automática for realmente necessária **ENTÃO** ofereça pausar e parar, use intervalo confortável e interrompa ao receber foco ou interação.
- **SENÃO** navegação manual por padrão, sem rotação.

## Quando usar

- Galerias de imagens relacionadas.
- Exploração de itens semelhantes.
- Ordem dos itens faz sentido e a exploração é opcional.
- Controles claros cabem no layout.
- Há tempo para testar acessibilidade.

## Quando evitar

- Mensagens críticas ou única chamada principal → **use em vez disso:** seção estática.
- Conteúdo independente e essencial → **use em vez disso:** blocos visíveis.
- Muitos itens → **use em vez disso:** grade ou paginação.
- Dependência só de swipe → **use em vez disso:** botões e swipe.
- Rotação que distrai → **use em vez disso:** controle manual.

## Faça

- Defina o objetivo do componente.
- Mostre controles anterior e próximo com nomes acessíveis.
- Indique posição atual e total ("2 de 6").
- Use texto real em HTML, redimensionável.
- Pause ao focar ou interagir.
- Teste teclado, toque e zoom.

## Evite

- Esconder informação essencial.
- Usar apenas pontos como navegação.
- Exigir só swipe.
- Trocar slides rapidamente.
- Reiniciar a posição sem motivo.
- Sobrepor controles ao texto.
- Usar imagens com texto embutido.

## Acessibilidade

- Use região semântica com nome acessível, controles anterior e próximo e identificação do slide atual (4.1.2).
- Todos os controles funcionam por teclado e toque, com foco visível e área de toque suficiente (2.1.1, 2.4.7).
- Com rotação automática, ofereça pausar, parar ou ocultar (2.2.2); pare quando o teclado entrar ou houver interação; respeite prefers-reduced-motion (2.3.3).
- Comunique a mudança de slide sem mover o foco de forma inesperada.
- Não dependa só de pontos, cor, posição ou gesto.
- Cada slide deve se manter legível em viewport estreita e com zoom (1.4.10).

## Microcópia

| Situação | Exemplo |
|---|---|
| Botão anterior | "Slide anterior" |
| Botão próximo | "Próximo slide" |
| Posição | "Slide 2 de 6" |
| Pausa | "Pausar rotação" |
| Retomar | "Retomar rotação" |
| Nome da região | "Fotos do produto" |

## Checklist de verificação

- [ ] Os itens são relacionados.
- [ ] O conteúdo essencial também está disponível fora do carrossel.
- [ ] Anterior e próximo estão visíveis e têm nome acessível.
- [ ] Posição atual e total estão indicados.
- [ ] Funciona por teclado e sem depender só de swipe.
- [ ] Sem rotação automática, ou com pausa e parada disponíveis.
- [ ] A rotação para ao focar ou interagir.
- [ ] O texto é HTML real e redimensionável.
- [ ] Funciona em zoom de 400% sem rolagem horizontal da página.
- [ ] Respeita movimento reduzido.

## Fundamentação

- W3C WAI, tutorial de carrosséis e padrão de carrossel da WAI-ARIA APG: semântica, navegação, anúncio de mudanças, pausa e foco.
- WCAG 2.2, critério 2.2.2 (pausar, parar, ocultar) e 1.4.10 (reflow).
- Baymard Institute, requisitos de UX para carrosséis de página inicial: controles proeminentes, slide inicial, não ser rota única, pausa, texto legível, alternativa estática.
- Baymard Institute, controles de página: miniaturas informativas em vez de só pontos.
- Material Design 3, carrossel: variações e navegação de coleções.
