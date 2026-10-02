---
id: alvo-de-toque
titulo: Qual deve ser o tamanho mínimo de um alvo de toque?
categoria: acessibilidade
componentes: [botao, botao-de-icone, checkbox, radio, switch, toolbar]
tipo: acessibilidade
impacto: alto
status: recomendado
evidencia: forte
wcag: ["2.5.8", "2.5.5", "2.4.7", "4.1.2"]
relacionados: [botao-icone-e-texto, icone-sem-texto, foco-de-teclado, posicao-de-acoes]
---

# Qual deve ser o tamanho mínimo de um alvo de toque?

> **Regra:** Dimensione a área interativa, não o desenho: mínimo de 24 × 24 CSS px (piso AA) e 44–48 unidades para controles de toque, com espaço entre vizinhos.

## Contexto

A borda visual de um ícone ou botão não precisa ter o mesmo tamanho da região sensível ao toque. Ícone pequeno é aceitável se estiver inserido numa área maior; botão grande encostado em outro ainda provoca toques errados.

Os números 24, 44 e 48 vêm de fontes diferentes: 24 é o piso de conformidade AA, 44 é a referência de plataformas Apple e do nível AAA, e 48 é a referência do Android. Nenhum deles vale como regra única para todo contexto. A escolha depende do custo do erro, da frequência da ação e da densidade necessária.

Alvos pequenos e juntos causam toques acidentais, lentidão e exclusão de quem tem tremor, mobilidade reduzida ou usa o aparelho com uma mão só.

## Decisão

- **SE** o controle é acionado por ponteiro ou toque **ENTÃO** garanta no mínimo 24 × 24 CSS px de área interativa.
- **SE** o alvo é menor que 24 × 24 px **ENTÃO** garanta que um círculo de 24 px centrado nele não toque outro alvo nem o círculo de outro alvo.
- **SE** é botão, ícone ou ação de toque comum **ENTÃO** projete 44 × 44 CSS px (web/iOS) ou 48 × 48 dp (Android).
- **SE** a ação é crítica, irreversível, frequente ou fica na borda da tela **ENTÃO** aumente área e distância além de 44–48.
- **SE** o ícone precisa ficar pequeno **ENTÃO** mantenha o ícone e amplie a área com padding ou pseudo-elemento.
- **SE** o link está dentro de uma frase **ENTÃO** trate como conteúdo em linha (exceção do critério), mas não aplique a exceção a ícones de toolbar.
- **SENÃO** use 44 × 44 como padrão do design system.

## Quando usar

- Botões de ação em telas móveis.
- Botões somente com ícone e controles de toolbar.
- Fechar modal, voltar e ações de topo.
- Checkbox, radio e switch.
- Ações frequentes ou irreversíveis.

## Quando evitar

- Medir só o ícone visível → **use em vez disso:** medir a área clicável completa.
- Tratar 24 px como tamanho ideal → **use em vez disso:** 24 como piso e 44–48 como meta.
- Encolher alvos para caber mais ações → **use em vez disso:** agrupar em menu de overflow.
- Aplicar exceções sem avaliar contexto → **use em vez disso:** testar com toque real.

## Faça

- Defina o hit area no componente base, não por tela.
- Separe ações vizinhas com espaço mensurável.
- Dê mais área às ações críticas.
- Teste em aparelho real, com uma mão e com zoom.

## Evite

- Quatro ícones pequenos comprimidos numa barra.
- Áreas interativas sobrepostas.
- Esconder a área ampliada sem feedback de foco ou pressão.
- Exigir toque preciso para ação importante.

## Acessibilidade

- WCAG 2.2, critério 2.5.8 (AA): mínimo de 24 × 24 CSS px; exceções para espaçamento, alvo equivalente, texto em linha, controle do agente de usuário e necessidade essencial.
- Critério 2.5.5 (AAA): 44 × 44 CSS px.
- Ampliar a área não pode remover o foco visível (2.4.7), esconder estado nem alterar o nome acessível (4.1.2).
- Garanta operação por teclado e por tecnologia assistiva em todos os controles.

## Microcópia

Não se aplica.

## Checklist de verificação

- [ ] Todo alvo tem pelo menos 24 × 24 CSS px ou cumpre a exceção de espaçamento.
- [ ] Controles de toque comuns têm 44–48 unidades de área.
- [ ] A área interativa de ícones é maior que o desenho quando necessário.
- [ ] Controles vizinhos têm separação medida e suficiente.
- [ ] Ações críticas têm área e distância maiores que as demais.
- [ ] Não existem áreas interativas sobrepostas.
- [ ] O foco de teclado continua visível.
- [ ] Nome e estado acessíveis foram preservados.
- [ ] A tela foi testada em dispositivo real.

## Fundamentação

- WCAG 2.2, critério 2.5.8 (Target Size Minimum): limite mínimo AA de 24 × 24 px, mais as exceções previstas.
- WCAG 2.2, critério 2.5.5 (Target Size Enhanced): 44 × 44 px, exigido no AAA.
- Apple Human Interface Guidelines: região de toque de 44 × 44 pt e atenção ao espaçamento.
- Android Developers (acessibilidade): área de 48 × 48 dp, com padding compondo a área.
- U.S. Web Design System: transforma o requisito de 24 px em teste de componente.
- Estudo de Parhi, Karlson e Bederson sobre interação com o polegar: alvos físicos mais largos elevam desempenho e preferência; o equivalente em pixels varia conforme o dispositivo.
