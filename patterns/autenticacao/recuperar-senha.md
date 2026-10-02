---
id: recuperar-senha
titulo: Como criar uma recuperação de senha clara?
categoria: autenticacao
componentes: [link-esqueci-senha, campo-de-identificador, campo-de-codigo, formulario-de-redefinicao]
tipo: recomendacao
impacto: critico
status: recomendado
evidencia: forte
wcag: ["3.3.2", "3.3.1", "1.4.1", "3.3.8", "2.1.1"]
relacionados: [requisitos-de-senha, mostrar-senha, confirmar-senha, sessao-expirada, erros-em-formularios]
---

# Como criar uma recuperação de senha clara?

> **Regra:** Disponibilize "Esqueci minha senha" perto do login, dê resposta neutra que não revele se a conta existe, envie link ou código de uso único com validade e descreva o passo seguinte e as alternativas.

## Contexto

Esquecer a senha é situação esperada, não exceção. A recuperação deve devolver o acesso sem tratar a pessoa como suspeita, sem revelar se uma conta existe e sem criar caminho mais frágil que o próprio login.

O fluxo descreve o passo seguinte, recorre a um canal já vinculado à conta e abre uma saída quando a mensagem ou o código não chega. Segurança e clareza são desenhadas em conjunto.

Um fluxo frouxo favorece o sequestro de contas; um fluxo opaco ou sem alternativa trava pessoas legítimas e sobrecarrega o suporte. Numa pesquisa em e-commerce, demora, filtros de spam e falhas no e-mail de recuperação causaram abandono expressivo entre clientes com conta; o dado é contextual, mas reforça o valor de feedback e orientação.

## Decisão

- **SE** a tela é de login **ENTÃO** coloque "Esqueci minha senha" próximo ao campo de senha.
- **SE** a pessoa informa o identificador **ENTÃO** responda sempre com a mesma mensagem neutra, exista a conta ou não.
- **SE** o fluxo é iniciado **ENTÃO** envie link ou código aleatório, de uso único e validade limitada, pelo canal associado à conta.
- **SE** o token foi usado ou expirou **ENTÃO** invalide-o no servidor.
- **SE** há tentativas ou reenvios **ENTÃO** limite-os para conter abuso.
- **SE** a conta é de maior risco **ENTÃO** exija combinação de fatores compatível com o impacto.
- **SE** o e-mail ou código não chega **ENTÃO** oriente: verificar spam, aguardar, conferir o endereço mascarado, pedir novo código, procurar suporte ou outro método.
- **SE** é a tela de nova senha **ENTÃO** mostre requisitos antes do envio, aceite colar e gerenciador de senhas e diga como corrigir valor inválido.
- **SE** a troca concluiu **ENTÃO** confirme, notifique a conta e leve ao login ou à tarefa de origem, quando seguro.
- **SENÃO** nunca envie senha atual, dica de senha ou senha provisória por e-mail.

## Quando usar

- Qualquer conta com senha redefinível.
- Acesso que depende de e-mail, telefone, app ou código de recuperação.
- Login, cadastro e checkout, em que a tarefa pode ser interrompida.
- Produtos com MFA, com recuperação compatível com o risco.
- Pessoa sem acesso ao canal principal.

## Quando evitar

- Pessoa autenticada que ainda pode trocar a senha → **use em vez disso:** troca na área de conta.
- Enviar senha atual ou dica → **use em vez disso:** link ou código de uso único.
- Perguntas de segurança como único fator → **use em vez disso:** canal associado mais verificação.
- Informar se o identificador existe → **use em vez disso:** mensagem neutra.
- Recuperação mais fraca que a autenticação → **use em vez disso:** nível equivalente de garantia.

## Faça

- Explique o próximo passo em cada tela.
- Preserve a tarefa de origem para retornar depois.
- Ofereça suporte ou método alternativo seguro.
- Notifique a redefinição à conta.

## Evite

- Código previsível.
- Tentativas ilimitadas.
- Fazer a pessoa recomeçar sem orientação.
- Login automático por padrão após redefinir.
- Mensagens que confirmam contas cadastradas.

## Acessibilidade

- Link ou botão com nome claro, rótulo permanente e instrução vinculada ao campo (3.3.2).
- Código legível por teclado e leitor de tela, que aceita colar; sem depender de cor, posição ou imagem (1.4.1).
- Resultado em texto, foco em ponto previsível, sem revelar dados da conta.
- Erros identificados em texto e associados ao controle (3.3.1).
- Não exija transcrever código sem permitir colar (3.3.8).
- Teste com teclado, leitor de tela, zoom, mobile, conexão lenta e pessoas sem acesso ao canal principal.

## Microcópia

| Situação | Exemplo |
|---|---|
| Link | "Esqueci minha senha" |
| Resposta neutra | "Se houver uma conta com este e-mail, enviaremos instruções em alguns minutos." |
| Não chegou | "Não recebeu? Confira o spam ou peça um novo código." |
| Sucesso | "Senha alterada. Entre com a nova senha." |
| Notificação | "Sua senha foi alterada. Se não foi você, fale com o suporte." |

## Checklist de verificação

- [ ] "Esqueci minha senha" está próximo ao login.
- [ ] A resposta não revela se a conta existe.
- [ ] O link ou código é de uso único, aleatório e com prazo.
- [ ] Há limite de tentativas e reenvios.
- [ ] A senha atual nunca é enviada.
- [ ] Perguntas de segurança não são o único fator.
- [ ] Requisitos da nova senha aparecem antes do envio.
- [ ] É possível colar código e senha.
- [ ] Existe orientação para quando o e-mail ou código não chegar.
- [ ] O token é invalidado após o uso.
- [ ] A pessoa é notificada após a redefinição.
- [ ] A tarefa de origem é preservada quando possível.

## Fundamentação

- OWASP (Forgot Password Cheat Sheet): resposta consistente, proteção contra enumeração, tokens aleatórios de uso único, expiração e limite de abuso.
- NIST SP 800-63B-4 (recuperação de conta): recuperação como operação de risco próprio e notificação após a recuperação.
- Baymard Institute (requisitos de senha e destino após login ou redefinição): problemas de e-mail de redefinição geram abandono; preservar a intenção original; evidência de e-commerce.
- Padrão Digital de Governo (GOV.BR): meios de recuperação variados e atendimento quando as opções digitais falham.
- WCAG 2.2, critérios 3.3.2 e 3.3.1 (W3C WAI): rótulos, instruções e identificação de erros em texto.
