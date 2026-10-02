---
id: botao-flutuante
titulo: Quando usar botão flutuante?
categoria: acoes
componentes: [botao-flutuante, fab, botao]
tipo: decisao-contextual
impacto: medio
status: usar-com-cautela
evidencia: moderada
wcag: ["4.1.2", "2.5.8", "2.1.1", "2.4.7", "2.3.3"]
relacionados: [icone-sem-texto, botao-icone-e-texto, hierarquia-de-botoes, alvo-de-toque]
---

# Quando usar botão flutuante?

> **Regra:** Use botão flutuante somente para uma única ação primária, frequente e construtiva, sem cobrir conteúdo nem competir com a navegação.

## Contexto

O botão flutuante põe uma ação em evidência sobre o conteúdo e a deixa ao alcance enquanto a página rola. O custo é que, fixo na tela, ele pode tampar informações, campos, controles, navegação ou avisos temporários.

Pesam na escolha a prioridade da ação, a frequência de uso, o dispositivo, a densidade da tela e a clareza do ícone. Sem critério, o botão oculta conteúdo, compete na hierarquia e faz uma ação secundária parecer a principal.

Ações construtivas e recorrentes, como criar, adicionar, compartilhar ou iniciar, são o caso de uso. No desktop, não é uma forma de economizar espaço.

## Decisão

- **SE** existe uma ação principal, construtiva e recorrente na tela **ENTÃO** pode usar um botão flutuante.
- **SE** há várias ações com a mesma prioridade **ENTÃO** use barra de ações ou toolbar.
- **SE** a ação só faz sentido ao lado de um campo, card ou seção **ENTÃO** prefira botão inline.
- **SE** a ação é destrutiva, rara ou de difícil entendimento **ENTÃO** evite o botão flutuante.
- **SE** o ícone é ambíguo **ENTÃO** adicione rótulo visível (versão estendida).
- **SE** a tela é um formulário ou é muito densa **ENTÃO** prefira ação inline ou barra persistente.
- **SE** o botão cobrir conteúdo, navegação inferior, teclado virtual, banners ou toasts **ENTÃO** reposicione ou troque o padrão.
- **SENÃO** use um botão comum na hierarquia da página.

Limite: um único botão flutuante por tela ou contexto.

## Quando usar

- Ação principal e recorrente da tela.
- Ação continua relevante durante a rolagem.
- Ícone ou rótulo comunica claramente a finalidade.
- Há espaço para não cobrir conteúdo ou controles.
- A posição se adapta ao dispositivo e à área segura.

## Quando evitar

- Várias ações de mesma prioridade → **use em vez disso:** toolbar ou barra de ações.
- Ação ligada a uma seção específica → **use em vez disso:** botão inline.
- Ação destrutiva ou rara → **use em vez disso:** menu ou botão comum com confirmação.
- Significado dependente de ícone ambíguo → **use em vez disso:** botão com texto.
- Funciona só com mouse ou hover → **use em vez disso:** controle operável por toque e teclado.

## Faça

- Priorize uma ação.
- Use rótulo visível quando o significado não for imediato.
- Reserve espaço ao redor do botão.
- Respeite áreas seguras, navegação inferior e teclado virtual.
- Mantenha foco visível.
- Teste com conteúdo real, zoom e leitor de tela.
- Adapte a posição à plataforma e à direção de leitura; o canto inferior direito é comum, mas não universal.

## Evite

- Usar por moda.
- Empilhar vários botões flutuantes.
- Cobrir cards, campos ou mensagens.
- Esconder o nome da ação.
- Depender só de cor ou sombra para destacá-lo.
- Usar para ações destrutivas.

## Acessibilidade

- Use um elemento button nativo com nome acessível que descreva a ação ("Criar nota", não "Mais") (4.1.2).
- Garanta Tab, Enter e Espaço, foco visível e ordem previsível (2.1.1, 2.4.7).
- Área de interação mínima de 24 x 24 CSS pixels, ou exceção de espaçamento (2.5.8).
- Não use apenas cor, sombra, movimento ou posição para transmitir a ação.
- Respeite prefers-reduced-motion em animações (2.3.3) e verifique que o botão não cobre conteúdo ampliado.
- Teste teclado, toque, leitor de tela, voz, zoom e tamanhos de tela.

## Microcópia

| Situação | Exemplo |
|---|---|
| Nome acessível só com ícone | "Criar nota" |
| Versão estendida | "Nova mensagem" |
| Compartilhar | "Compartilhar lista" |
| Evitar | "Mais", "Botão", "+" sem nome |

## Checklist de verificação

- [ ] A tela tem no máximo um botão flutuante.
- [ ] A ação é construtiva e recorrente.
- [ ] O botão tem nome acessível específico.
- [ ] O botão não cobre conteúdo, campos, navegação ou mensagens em nenhum tamanho de tela.
- [ ] A posição respeita áreas seguras e teclado virtual.
- [ ] A área de toque é de pelo menos 24 x 24 CSS pixels.
- [ ] Tab, Enter e Espaço funcionam e o foco é visível.
- [ ] Animações respeitam prefers-reduced-motion.
- [ ] A ação não seria melhor em toolbar ou botão inline.

## Fundamentação

- Material Design 3, FAB: destaque para a ação primária ou mais comum; evitar ações menores, destrutivas ou pouco claras; limitar a quantidade por tela.
- Android Developers, botão de ação flutuante: variações padrão, pequena, grande e estendida e casos de uso de criação.
- Material UI, botão de ação flutuante: um por tela para a ação primária.
- Baymard Institute, pesquisa de e-commerce móvel e filtros móveis: ações fixas devem ser avaliadas quanto a tamanho, posição e sobreposição de conteúdo.
- WCAG 2.2, critérios 4.1.2 (nome, função, valor) e 2.5.8 (tamanho mínimo do alvo).
- IBM Carbon, acessibilidade de botão: teclado e nomes para botões só com ícone.
