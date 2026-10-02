---
id: texto-de-botao
titulo: Como escrever o texto de um botão?
categoria: ux-writing
componentes: [botao]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: moderada
wcag: ["2.5.3", "2.4.6"]
relacionados: [texto-de-link, hierarquia-de-botoes, icone-sem-texto, confirmar-exclusao]
---

# Como escrever o texto de um botão?

> **Regra:** Inicie o rótulo com um verbo e nomeie o resultado da ação; se alguém puder indagar "enviar o quê?" ou "continuar para onde?", inclua o objeto ou o destino.

## Contexto

O rótulo do botão faz parte da orientação da tarefa. Ele precisa antecipar o que acontece ao acionar o controle, sem obrigar a pessoa a deduzir o efeito de uma palavra genérica.

Rótulo curto não é sinônimo de rótulo vago. A escolha depende do que está visível na tela: etapa do fluxo, objeto afetado e demais ações próximas.

Rótulos genéricos empurram a interpretação para o usuário, atrasam a comparação entre ações e aumentam a chance de clique errado. Em listas com botões repetidos, "Editar" ou "Excluir" soltos também são insuficientes para quem navega por leitor de tela.

## Decisão

- **SE** o botão inicia uma ação ou avança uma etapa **ENTÃO** use verbo no infinitivo no começo do rótulo ("Salvar", "Baixar", "Cadastrar").
- **SE** o verbo sozinho deixa dúvida sobre objeto ou destino **ENTÃO** acrescente o complemento ("Salvar alterações", "Continuar para o pagamento").
- **SE** o efeito real é diferente da mecânica técnica **ENTÃO** nomeie o efeito ("Criar conta" em vez de "Enviar").
- **SE** duas ou mais ações no mesmo grupo soam parecidas **ENTÃO** diferencie-as ("Salvar rascunho" e "Publicar", nunca dois "Salvar").
- **SE** o botão se repete em lista ou tabela **ENTÃO** inclua o objeto no nome acessível ("Excluir relatório mensal").
- **SE** o título, a instrução ou o feedback da etapa usam um termo **ENTÃO** reutilize exatamente esse termo no botão.
- **SENÃO** use o rótulo mais curto que ainda preveja o resultado, em sentence case.

## Quando usar

- Botões que iniciam ação ou mudam de etapa.
- Fluxos com salvar, revisar, pagar ou publicar.
- Telas com várias ações próximas que precisam ser distinguidas.
- Rótulos que precisam funcionar fora do contexto visual, como em lista de elementos de leitor de tela.

## Quando evitar

- Rótulos como "Ação" ou "Clique aqui" → **use em vez disso:** verbo + objeto.
- "Enviar" quando o efeito pode ser nomeado → **use em vez disso:** o nome do efeito.
- "Continuar" em fluxo longo sem destino → **use em vez disso:** "Continuar para <etapa>".
- Perguntas, slogans e pontuação decorativa → **use em vez disso:** verbo direto.

## Faça

- Comece com verbo no infinitivo.
- Nomeie o resultado e, se necessário, o objeto.
- Use os mesmos termos do restante do fluxo.
- Mantenha o rótulo curto, em sentence case.
- Teste o rótulo isolado, numa lista de controles.

## Evite

- Repetir o mesmo rótulo para ações diferentes.
- Trocar o termo do botão sem trocar o do restante do fluxo.
- Transformar o botão em frase explicativa.
- Usar apenas símbolos como rótulo.

## Acessibilidade

- Use o elemento nativo `<button>` para ações da interface.
- O nome acessível deve conter o texto visível do botão (WCAG 2.5.3), para que comando de voz funcione.
- Em controles repetidos, acrescente o objeto ao nome acessível mantendo as palavras visíveis no início.
- Valide teclado, foco, estados de carregamento e mensagem pós-ação; um bom rótulo não compensa botão sem foco ou sem feedback.

## Microcópia

| Situação | Exemplo |
|---|---|
| Salvar edição | "Salvar alterações" |
| Avançar em checkout | "Continuar para o pagamento" |
| Criar conta | "Criar conta" |
| Rascunho vs. publicação | "Salvar rascunho" / "Publicar" |
| Item em lista | "Excluir relatório mensal" |

## Checklist de verificação

- [ ] O rótulo começa com verbo?
- [ ] Alguém prevê o resultado sem ler o parágrafo da tela?
- [ ] Nenhum botão usa "Ação", "Clique aqui" ou "Enviar" quando o efeito é nomeável?
- [ ] Ações próximas têm rótulos distintos?
- [ ] O rótulo usa o mesmo termo do título e do feedback da etapa?
- [ ] O rótulo está em sentence case?
- [ ] O nome acessível contém o texto visível?
- [ ] Botões repetidos têm o objeto no nome acessível?

## Fundamentação

- W3C WAI-ARIA APG (nomes e descrições acessíveis): preferir texto visível, nomes curtos e distintos, palavras mais importantes primeiro.
- WCAG 2.2, critério 2.5.3 (Label in Name): nome acessível contém o texto visível.
- Baymard Institute: nome programático preserva a essência do rótulo visível; evitar "Apply" quando a ação pode ser automática (contexto de checkout).
- U.S. Web Design System: texto curto, sentence case, começar com verbo.
- Padrão Digital GOV.BR: rótulo obrigatório no botão, verbos no infinitivo.
- Adobe Spectrum: rótulos como verbos, resultado claro, texto conciso.
- GOV.UK Design System: rótulos variam conforme o comportamento real do serviço ("Continue" vs. "Confirm and send").
