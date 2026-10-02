---
id: confirmar-senha
titulo: Quando pedir confirmação de senha?
categoria: autenticacao
componentes: [campo-de-senha, mostrar-senha, reautenticacao, mfa]
tipo: decisao-contextual
impacto: critico
status: usar-com-cautela
evidencia: forte
wcag: ["3.3.8", "1.3.5", "3.3.2"]
relacionados: [mostrar-senha, requisitos-de-senha, recuperar-senha, preservar-dados-apos-erro]
---

# Quando pedir confirmação de senha?

> **Regra:** Não repita o campo de senha por padrão; use um único campo com "mostrar senha" na criação e reautentique apenas antes de ações sensíveis.

## Contexto

"Confirmar senha" tem dois sentidos distintos: digitar de novo uma senha nova para flagrar erro de digitação, ou comprovar a identidade outra vez antes de uma ação sensível. As regras diferem e não devem ser misturadas.

Na criação ou redefinição, o segundo campo soma esforço e atrapalha gerenciadores de senha. Repetir não garante senha melhor: a pessoa pode colar o mesmo valor, repetir o mesmo erro ou abandonar o fluxo.

Em alterações críticas, uma sessão aberta não prova que quem está na frente da tela é a titular. Ali, a reautenticação proporcional ao risco é o que protege a conta.

## Decisão

- **SE** a pessoa está criando ou redefinindo a senha **ENTÃO** use um único campo com alternância mostrar/ocultar, requisitos visíveis e validação clara.
- **SE** testes mostrarem erros relevantes de digitação mesmo com "mostrar senha" **ENTÃO** adicione "Confirmar nova senha".
- **SE** a ação é sensível (alterar senha, e-mail principal, recuperação, MFA, dados financeiros, permissões) **ENTÃO** reautentique no momento da ação.
- **SE** a conta usa senha e o risco é moderado **ENTÃO** peça a senha atual.
- **SE** o risco é alto **ENTÃO** exija um fator adicional ou autenticação resistente a phishing.
- **SE** houve autenticação forte recente e ainda válida **ENTÃO** não peça de novo.
- **SE** a ação é rotineira e de baixo risco **ENTÃO** não peça credencial.
- **SENÃO** um campo único de senha.

## Quando usar

- Troca de senha, do e-mail principal ou dos métodos de recuperação.
- Desativar MFA ou adicionar dispositivo confiável.
- Ver ou modificar dados muito sensíveis.
- Transações e permissões de alto impacto.
- Após inatividade, recuperação de conta ou atividade suspeita.

## Quando evitar

- Segundo campo obrigatório em todo cadastro → **use em vez disso:** campo único com mostrar senha.
- Ações rotineiras de baixo risco → **use em vez disso:** nenhuma verificação adicional.
- Logo após autenticação forte válida → **use em vez disso:** reaproveitar a sessão de maior confiança por um período.
- Quando a senha não é o melhor fator → **use em vez disso:** MFA ou outro fator.
- Quando a repetição bloqueia gerenciadores → **use em vez disso:** campo único.

## Faça

- Defina o risco da ação antes de escolher o mecanismo.
- Explique o motivo antes do campo.
- Use rótulos separados para "Senha atual", "Nova senha" e, só se for indispensável, "Confirmar nova senha".
- Permita colar e aceite gerenciadores de senha.
- Valide a correspondência sem apagar os valores digitados.
- Mostre o erro junto ao campo.
- Confirme o resultado e notifique por canal confiável após mudança crítica.

## Evite

- Repetir o campo por padrão.
- Bloquear colar.
- Pedir senha em excesso.
- Confundir senha atual com nova.
- Depender só da sessão aberta para ações críticas.
- Apagar valores após erro.
- Revelar credenciais em mensagens.

## Acessibilidade

- Mantenha rótulos visíveis e específicos; não dependa só da posição dos campos (3.3.2).
- Não bloqueie copiar, colar, preenchimento automático nem gerenciadores; autenticação não deve exigir memorização ou transcrição sem alternativa (3.3.8).
- Use autocomplete="current-password" na senha existente e autocomplete="new-password" na nova senha e em sua confirmação (1.3.5).
- Associe requisitos e erros ao campo e anuncie mudanças sem interromper a digitação.
- O botão de mostrar senha precisa de nome acessível específico e comunicar seu estado.
- Preserve o foco e teste teclado, leitor de tela, zoom, contraste e mobile.

## Microcópia

| Situação | Exemplo |
|---|---|
| Motivo da reautenticação | "Por segurança, confirme sua senha atual para alterar o e-mail." |
| Rótulos | "Senha atual", "Nova senha", "Confirmar nova senha" |
| Divergência | "As senhas não coincidem. Confira a nova senha e tente de novo." |
| Botão | "Confirmar e alterar e-mail" |
| Pós-alteração | "Senha alterada. Enviamos um aviso para o seu e-mail." |

## Checklist de verificação

- [ ] O fluxo distingue revisar uma senha nova de reautenticar.
- [ ] A criação de senha usa um único campo com mostrar/ocultar, salvo evidência de teste em contrário.
- [ ] A reautenticação ocorre junto da ação sensível.
- [ ] O motivo da confirmação aparece antes do campo.
- [ ] Colar e gerenciadores de senha funcionam.
- [ ] Os valores de autocomplete são current-password e new-password.
- [ ] O erro de divergência não apaga os valores.
- [ ] O botão de mostrar senha tem nome acessível e estado.
- [ ] Mudanças críticas geram confirmação e notificação.

## Fundamentação

- Padrão de campo de senha do GOV.UK Design System: evitar o campo "confirmar senha", sobretudo com mostrar/ocultar.
- OWASP, guias de autenticação e MFA: pedir nova autenticação após eventos de risco e antes de ações críticas; exigir MFA em ações sensíveis.
- NIST SP 800-63B, reautenticação: frequência e força conforme risco e nível de garantia.
- WCAG 2.2, critério 3.3.8: autenticação sem exigir memorização ou transcrição.
- WCAG 2.2, critério 1.3.5: propósito de entrada identificável (current-password, new-password).
- Adobe Spectrum, campo de texto: requisitos junto ao campo para reduzir erros.
- Documentação pública de grandes produtos sobre modo de reautenticação e verificação para ações sensíveis: reautenticar só diante de risco e manter confiança temporária.
