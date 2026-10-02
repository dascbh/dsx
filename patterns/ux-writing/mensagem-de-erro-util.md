---
id: mensagem-de-erro-util
titulo: Como escrever mensagens de erro úteis?
categoria: ux-writing
componentes: [mensagem-de-erro, campo-de-texto, resumo-de-erros]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["3.3.1", "3.3.3", "1.4.1", "4.1.3"]
relacionados: [erros-em-formularios, posicao-do-erro-no-campo, onde-exibir-erros, preservar-dados-apos-erro, codigo-de-erro-tecnico]
---

# Como escrever mensagens de erro úteis?

> **Regra:** Toda mensagem de erro deve nomear o campo, descrever o problema em texto simples e indicar a correção (formato, limite ou valor esperado), sem culpar a pessoa.

## Contexto

"Ocorreu um erro" não diz o que houve nem como continuar. Uma mensagem útil transforma a falha em orientação: identifica o campo, descreve o problema e aponta a correção.

Mensagens vagas aumentam a incerteza e empurram a pessoa para tentativa e erro. Mensagens específicas reduzem o esforço de recuperação e evitam que ela abandone o formulário ou preencha tudo de novo.

Quando existem campo e resumo de erros, o texto precisa ser o mesmo nos dois.

## Decisão

- **SE** o erro é de entrada **ENTÃO** nomeie o campo afetado e descreva a regra em linguagem simples.
- **SE** a correção é conhecida **ENTÃO** diga o formato, o limite ou o valor esperado.
- **SE** o campo obrigatório está vazio **ENTÃO** peça o dado ("Informe seu e-mail"), não declare "campo inválido".
- **SE** o valor está fora de limite **ENTÃO** cite o limite e o valor encontrado, quando útil.
- **SE** o dado é incompatível com outro **ENTÃO** nomeie os dois campos envolvidos.
- **SE** há campo e resumo de erros **ENTÃO** use o mesmo texto nos dois.
- **SE** a dica de correção comprometeria a segurança **ENTÃO** use mensagem neutra (por exemplo, no login).
- **SE** o problema é do serviço **ENTÃO** não use esta mensagem; use o padrão de falha temporária.
- **SENÃO** preserve o que foi digitado e mantenha o campo editável.

## Quando usar

- Campo obrigatório vazio.
- Formato ou valor incorreto.
- Texto acima ou abaixo do limite.
- Dado incompatível com outro.
- Erro detectado após o envio e que a pessoa pode corrigir.

## Quando evitar

- Falha exclusiva do serviço → **use em vez disso:** mensagem de falha temporária.
- Mensagem que só diz "inválido" → **use em vez disso:** regra mais correção.
- Texto que culpa a pessoa → **use em vez disso:** frase neutra sobre o dado.
- Código técnico sem ajuda → **use em vez disso:** linguagem de tarefa.
- Repetir instrução já visível → **use em vez disso:** só o que falta corrigir.

## Faça

- Identifique o campo.
- Descreva o problema.
- Indique a correção.
- Use linguagem simples e consistente.
- Preserve os dados digitados.

## Evite

- "Ocorreu um erro".
- "Campo inválido".
- Culpar a pessoa ("Você digitou errado").
- Códigos técnicos.
- Instruções vagas.
- Repetição desnecessária.

## Acessibilidade

- Erro de entrada detectado automaticamente identifica o item e descreve o problema em texto (3.3.1).
- Ofereça sugestão de correção quando conhecida, salvo se comprometer segurança ou finalidade (3.3.3).
- Associe a mensagem ao campo por meio programático; resumo navegável quando houver vários erros.
- Não dependa só de cor, ícone ou posição (1.4.1); anuncie sem roubar o foco quando dinâmico (4.1.3).
- Teste que campo, erro e orientação são lidos em ordem compreensível com teclado, zoom e leitor de tela.

## Microcópia

| Situação | Exemplo |
|---|---|
| Vazio | "Informe seu e-mail." |
| Formato | "O CPF deve ter 11 números. Exemplo: 123.456.789-09." |
| Limite | "A senha precisa ter pelo menos 8 caracteres." |
| Incompatível | "A data final deve ser depois da data inicial." |
| Evitar | "Campo inválido." |

## Checklist de verificação

- [ ] A mensagem identifica o campo.
- [ ] O problema está descrito com clareza.
- [ ] A mensagem indica como corrigir.
- [ ] O texto usa linguagem simples e não culpa a pessoa.
- [ ] Os dados preenchidos foram preservados.
- [ ] A mensagem está associada ao campo programaticamente.
- [ ] O texto é idêntico no campo e no resumo.
- [ ] Foi testado com teclado e leitor de tela.

## Fundamentação

- WCAG 2.2, critério 3.3.1 (Error Identification): identificar o item e descrever o problema em texto.
- WCAG 2.2, critério 3.3.3 (Error Suggestion): sugerir correção quando conhecida.
- Nielsen Norman Group (diretrizes de mensagens de erro): mensagens próximas, específicas, construtivas, sem jargão e sem culpa.
- GOV.UK Design System (mensagem de erro): explicar o que ocorreu e como corrigir, alinhar com o rótulo e preservar dados.
- Padrão Digital de Governo (GOV.BR), Message: linguagem clara e feedback acessível.
- AMAWeb (manual de acessibilidade digital): comunicação acessível de erros em formulários.
- Adobe Spectrum (escrita de erros): mensagens específicas e ação seguinte.
