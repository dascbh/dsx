---
id: mostrar-senha
titulo: Mostrar ou ocultar senha: como deve funcionar?
categoria: autenticacao
componentes: [campo-de-senha, botao-de-visibilidade]
tipo: recomendacao
impacto: critico
status: recomendado
evidencia: forte
wcag: ["3.3.8", "4.1.2", "2.1.1", "2.5.8", "1.3.5", "2.4.7"]
relacionados: [requisitos-de-senha, confirmar-senha, recuperar-senha, label-vs-placeholder]
---

# Mostrar ou ocultar senha: como deve funcionar?

> **Regra:** Oculte a senha por padrão e ofereça um botão opcional, com nome acessível, que alterna a visibilidade sem apagar o valor, mover o foco ou bloquear colar e gerenciadores de senha.

## Contexto

Ocultar os caracteres reduz a exposição visual, mas aumenta erros de digitação, sobretudo em telas pequenas, com senhas longas ou geradas por gerenciador. Por isso login, cadastro e recuperação devem permitir conferir o valor de forma clara e opcional.

O controle não pode interromper o preenchimento: precisa preservar valor, foco, seleção e recursos de entrada como teclado, autofill e colagem. A exposição só deve ocorrer por ação intencional da pessoa e ser fácil de reverter.

A decisão equilibra prevenção de erros e risco de exposição no contexto real de uso.

## Decisão

- **SE** existe campo de senha (login, cadastro, troca, redefinição) **ENTÃO** inclua botão de mostrar/ocultar.
- **SE** o campo é aberto ou depois de uma confirmação **ENTÃO** mantenha a senha oculta.
- **SE** a pessoa aciona o botão **ENTÃO** alterne a visibilidade, preservando valor, seleção e foco.
- **SE** o botão está em estado oculto **ENTÃO** o nome acessível é "Mostrar senha"; **SE** visível **ENTÃO** "Ocultar senha".
- **SE** usa só ícone **ENTÃO** inclua nome acessível e não dependa só da troca de ícone ou cor.
- **SE** o campo é de login **ENTÃO** use `type="password"` com `autocomplete="current-password"`; **SE** é criação ou troca **ENTÃO** `autocomplete="new-password"`.
- **SE** o dispositivo é mobile **ENTÃO** garanta alvo confortável que não cubra o texto nem fique colado a outra ação.
- **SENÃO** nunca revele a senha automaticamente nem bloqueie colagem.

## Quando usar

- Login, cadastro, troca e redefinição de senha.
- Senhas longas, geradas ou difíceis de conferir.
- Interfaces móveis.

## Quando evitar

- Revelar a senha automaticamente → **use em vez disso:** ação explícita.
- Ícone ambíguo sem texto acessível → **use em vez disso:** botão com nome.
- Contexto em que a exposição é inaceitável por política → **use em vez disso:** manter oculto e reforçar apoio à digitação (colar, gerenciador).

## Faça

- Use um botão real próximo ao campo.
- Preserve valor, foco e seleção ao alternar.
- Permita digitar, colar e usar gerenciadores.
- Mantenha contraste e foco visível.
- Teste criação, login, troca e recuperação.

## Evite

- Apagar, truncar ou reformatar a senha ao alternar.
- Mover o foco ou fechar o teclado virtual sem necessidade.
- Alvo pequeno.
- Estado sem identificação.
- Bloquear autofill ou colagem.

## Acessibilidade

- O botão é um `<button>` real, ativável por Enter e Espaço (2.1.1).
- O nome acessível reflete a ação atual e o estado é comunicável (4.1.2).
- Esconda do leitor de tela o ícone decorativo quando o nome já anuncia a ação.
- Permitir colar e gerenciadores apoia a autenticação acessível (3.3.8) e o autocomplete correto atende 1.3.5.
- Área de toque suficiente (2.5.8) e foco visível (2.4.7).

## Microcópia

| Situação | Exemplo |
|---|---|
| Botão com senha oculta | "Mostrar senha" |
| Botão com senha visível | "Ocultar senha" |
| Rótulo do campo | "Senha" |
| Dica | "Use pelo menos 8 caracteres." |

## Checklist de verificação

- [ ] A senha começa oculta.
- [ ] O botão tem nome acessível que indica a próxima ação.
- [ ] O valor permanece intacto ao alternar.
- [ ] O foco continua previsível.
- [ ] O controle funciona com teclado.
- [ ] O alvo é confortável no mobile.
- [ ] Colar e autofill funcionam.
- [ ] Gerenciadores de senha funcionam.
- [ ] A exposição depende de ação explícita.
- [ ] Foi testado com leitor de tela.

## Fundamentação

- NIST SP 800-63B (verificadores de senha e considerações de experiência do usuário): opção de exibir a senha, permitir gerenciadores e colagem.
- WCAG 2.2, 3.3.8 (autenticação acessível): mostrar senha opcionalmente, autofill e colagem.
- W3C WAI-ARIA APG (Disclosure) e técnica H100: botão operável, nomes acessíveis e autocomplete.
- GOV.UK Design System (Password input) e USWDS (página de login): campo oculto por padrão e controle textual.
- Material Design: alternância entre mascarado e visível no campo de senha.
- Padrão Digital GOV.BR (Input): estrutura e estados de campos.
