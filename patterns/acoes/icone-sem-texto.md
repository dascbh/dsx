---
id: icone-sem-texto
titulo: Quando um botão pode ter só ícone, sem texto?
categoria: acoes
componentes: [botao, botao-de-icone, tooltip]
tipo: decisao-contextual
impacto: alto
status: usar-com-cautela
evidencia: forte
wcag: ["1.1.1", "4.1.2", "2.4.7", "2.5.8", "1.4.11", "2.5.3"]
relacionados: [botao-icone-e-texto, texto-de-botao, alvo-de-toque, link-vs-botao]
---

# Quando um botão pode ter só ícone, sem texto?

> **Regra:** Use ícone sozinho apenas para ações universalmente reconhecidas no contexto, sempre com nome acessível; se o ícone precisa de explicação, mantenha o rótulo visível.

## Contexto

Ícones reduzem densidade e aceleram a varredura em barras de ferramentas e ações recorrentes. Mas um mesmo símbolo pode ser lido de formas diferentes e perde sentido fora do contexto onde foi aprendido.

O risco não é o ícone em si, e sim retirar o rótulo sem verificar se a ação continua clara para quem não vê o símbolo, amplia a tela, usa comando de voz ou troca de dispositivo. Sem nome acessível, o botão é anunciado como "botão" vazio.

O custo sobe quando ícones semelhantes representam ações distintas, quando a ação é destrutiva ou quando muitos controles compactos ficam lado a lado.

## Decisão

- **SE** a ação é familiar, o contexto a explica e o controle tem nome acessível **ENTÃO** ícone sozinho é aceitável.
- **SE** o ícone exige explicação antes de a pessoa agir **ENTÃO** mantenha um rótulo visível.
- **SE** a ação é nova, rara ou ambígua **ENTÃO** use ícone com texto.
- **SE** a ação é destrutiva **ENTÃO** use rótulo visível ou confirmação clara.
- **SE** o botão se repete em lista **ENTÃO** inclua o objeto no nome acessível ("Excluir relatório mensal").
- **SE** o controle é alternável **ENTÃO** exponha o estado (aria-pressed ou equivalente).
- **SE** usa tooltip **ENTÃO** trate-o como apoio visual, nunca como único nome.
- **SENÃO** prefira texto visível.

## Quando usar

- Fechar, pesquisar, reproduzir mídia e outras convenções fortes.
- Barras de ferramentas compactas com ações recorrentes.
- Ícones com convenção consolidada no próprio produto.

## Quando evitar

- Ações novas ou pouco frequentes → **use em vez disso:** ícone com texto.
- Ícone com mais de uma interpretação plausível → **use em vez disso:** rótulo visível.
- Mesmo ícone para ações diferentes → **use em vez disso:** ícones distintos e nomes distintos.
- Controles pequenos e agrupados → **use em vez disso:** espaçamento e área de toque adequados.

## Faça

- Comece nomeando a ação com um verbo.
- Dê nome acessível que descreva a função, não o desenho.
- Mantenha foco visível, contraste e estado pressionado.
- Oculte da tecnologia assistiva o ícone decorativo ao lado de rótulo visível.
- Teste a compreensão com pessoas, sem explicação prévia.

## Evite

- Escrever "botão" no nome acessível.
- Depender só de tooltip para nomear.
- Esconder rótulos sem validar.
- Reduzir a área de toque para caber mais ícones.
- Remover o contorno de foco.

## Acessibilidade

- Todo botão com ícone precisa de nome não vazio (1.1.1, 4.1.2).
- Nome via texto visualmente oculto, aria-label ou aria-labelledby.
- Foco visível (2.4.7), contraste do ícone (1.4.11) e área de toque suficiente (2.5.8).
- Se houver rótulo visível, o nome acessível contém esse texto (2.5.3).
- Tooltip não substitui nome acessível: não cobre toque nem leitor de tela.

## Microcópia

| Situação | Exemplo |
|---|---|
| Nome acessível de fechar | "Fechar" |
| Pesquisa | "Pesquisar" |
| Item de lista | "Excluir relatório mensal" |
| Salvar | "Salvar alterações" |
| Tooltip | "Compartilhar" |

## Checklist de verificação

- [ ] A ação é familiar neste contexto.
- [ ] O botão tem nome acessível não vazio.
- [ ] O nome descreve a ação, não o desenho.
- [ ] Controles repetidos têm nomes diferenciados.
- [ ] Ícones decorativos ao lado de texto estão ocultos da tecnologia assistiva.
- [ ] Ações ambíguas ou destrutivas têm rótulo visível.
- [ ] O tooltip não é a única identificação.
- [ ] O foco é visível.
- [ ] A área de toque atende o mínimo do projeto.
- [ ] O controle opera com teclado, zoom, toque e leitor de tela.

## Fundamentação

- W3C WAI-ARIA APG (nomes e descrições acessíveis; padrão Button): nome obrigatório, preferência por texto visível, aria-pressed.
- WCAG 2.2: 1.1.1, 4.1.2 e regra de botão de imagem com nome.
- Baymard Institute: ícones acompanhados de texto reduzem ambiguidade; botões precisam de intenção, foco e área de toque.
- GitHub Primer (Links and buttons): nome visualmente oculto em botões de ícone.
- Apple Human Interface Guidelines (Buttons): função comunicada por símbolo, rótulo ou ambos.
- Padrão Digital GOV.BR (Button): aria-label, tooltip, foco e área mínima de toque.
