---
id: botao-icone-e-texto
titulo: Botões devem ter ícone e texto?
categoria: acoes
componentes: [botao, botao-de-icone, icone]
tipo: decisao-contextual
impacto: alto
status: usar-com-cautela
evidencia: moderada
wcag: ["2.5.3", "4.1.2", "1.1.1", "2.1.1"]
relacionados: [icone-sem-texto, texto-de-botao, alvo-de-toque, hierarquia-de-botoes]
---

# Botões devem ter ícone e texto?

> **Regra:** Use ícone mais texto quando a ação for pouco familiar, importante ou destrutiva; use só ícone apenas em ações muito conhecidas e compactas, sempre com nome acessível.

## Contexto

Ícones agilizam o reconhecimento, mas não formam uma linguagem universal. Com texto, a intenção fica explícita, quem fala comandos de voz é atendido e diminui o esforço de memorizar e interpretar imagens.

Não existe regra que obrigue ícone em todo botão nem texto em todo botão. A decisão depende de familiaridade da ação, contexto, espaço, público e risco.

Primeiro defina o nome da ação; o ícone reforça o significado, não substitui um rótulo necessário. A mesma função deve manter o mesmo nome e o mesmo padrão visual em toda a interface.

## Decisão

- **SE** a ação é pouco familiar, complexa ou sujeita a leituras diferentes **ENTÃO** use ícone e texto.
- **SE** a ação é destrutiva ou envolve dinheiro, privacidade ou acesso **ENTÃO** use texto visível, com ou sem ícone.
- **SE** a tela é pública ou atende públicos variados **ENTÃO** use texto visível.
- **SE** há várias ações próximas **ENTÃO** use texto para diferenciá-las.
- **SE** a ação é muito conhecida, recorrente, o padrão se repete numa toolbar e o espaço é realmente limitado **ENTÃO** use só ícone, com nome acessível e foco visível.
- **SE** a função só se descobre passando o mouse **ENTÃO** adicione texto visível.
- **SE** o símbolo é ambíguo **ENTÃO** adicione texto ou troque o símbolo.
- **SENÃO** use texto, com ícone opcional como reforço.

## Quando usar

- Ícone e texto: ação principal, tela pública, ação com consequência relevante, ações próximas, ícone com mais de uma interpretação, tradução da interface.
- Só ícone: toolbar com padrão repetido, ações universais, contexto que torna a função evidente.

## Quando evitar

- Ícone sozinho que exige hover para ser entendido → **use em vez disso:** rótulo visível.
- Símbolo ambíguo → **use em vez disso:** texto ao lado.
- Ação com perda de dados, dinheiro ou acesso só com ícone → **use em vez disso:** botão com texto.
- Tooltip como única explicação → **use em vez disso:** rótulo que funcione também em toque e teclado.

## Faça

- Escreva primeiro o verbo da ação, depois escolha o ícone.
- Use o mesmo nome para a mesma função em toda a interface.
- Trate o ícone como decoração quando o texto já descreve a ação.
- Teste a compreensão com pessoas do público.

## Evite

- Trocar o nome da ação entre telas.
- Misturar padrões de rótulo sem motivo.
- Esconder o foco do botão.
- Tratar o ícone como enfeite quando ele é o único rótulo.

## Acessibilidade

- Prefira o elemento nativo de botão, operável com Tab, Enter e Espaço.
- Se há texto visível, o nome acessível precisa incluí-lo (2.5.3); trate o ícone como decorativo.
- Em botão só com ícone, dê nome que descreva a função, como "Fechar", não o símbolo "X" (4.1.2, 1.1.1).
- Não dependa de hover; garanta foco, toque, leitor de tela e comando de voz.

## Microcópia

| Situação | Exemplo |
|---|---|
| Ação principal | ícone de download + "Baixar relatório" |
| Só ícone, nome acessível | "Fechar" |
| Ação destrutiva | "Excluir conta" |
| Toolbar compacta | "Negrito" (nome acessível) |

## Checklist de verificação

- [ ] O nome da ação foi definido antes do ícone.
- [ ] Ações pouco familiares ou críticas têm texto visível.
- [ ] Botões só com ícone têm nome acessível que descreve a função.
- [ ] O nome acessível contém o texto visível.
- [ ] Nada depende de hover para ser entendido.
- [ ] Uma mesma função recebe o mesmo nome em todas as telas.
- [ ] O botão continua compreensível em tela estreita.
- [ ] Foi testado com teclado e leitor de tela.

## Fundamentação

- WCAG 2.2, critério 2.5.3 (Label in Name): o nome acessível deve conter o texto visível, favorecendo comando de voz.
- WCAG 2.2, critério 4.1.2 (Name, Role, Value): nome, função e estado expostos programaticamente.
- W3C WAI-ARIA APG (Names and Descriptions e Button Pattern): preferir texto visível e descrever a função, não a aparência.
- Baymard Institute (design de botões): microcópia descritiva, consistência e diferenciação; pesquisa contextualizada para e-commerce.
- IBM Carbon e GitHub Primer: implementação de rótulos e foco em botões só com ícone; referências de implementação, não evidência independente.
