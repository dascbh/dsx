---
id: preservar-dados-apos-erro
titulo: Como preservar os dados preenchidos após um erro no formulário?
categoria: formularios
componentes: [formulario, campo, resumo-de-erros]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["3.3.1", "3.3.3", "1.4.1", "4.1.3"]
relacionados: [erros-em-formularios, onde-exibir-erros, tentar-novamente, sessao-expirada]
---

# Como preservar os dados preenchidos após um erro no formulário?

> **Regra:** Após um erro, reexiba o formulário com todos os valores válidos mantidos e destaque apenas os campos que precisam de correção; descarte somente segredos, como senha e código de segurança do cartão.

## Contexto

Quando um formulário falha, a pessoa não deve perder o que já preencheu. Apagar tudo transforma um erro localizado em retrabalho: lembrar, localizar e redigitar o que já estava certo, com mais esforço, frustração e abandono.

Preservar não quer dizer guardar indefinidamente. O rascunho serve enquanto a tarefa é retomada, com proteção adequada; segredos e arquivos obedecem a regras de segurança próprias.

Em testes de checkout, dados de cartão apagados por erro em outro campo levaram a abandono. A evidência é de checkout; valide no seu contexto.

## Decisão

- **SE** a validação falha **ENTÃO** reexiba o formulário com textos, seleções e opções válidas preservados.
- **SE** só um campo está errado **ENTÃO** marque apenas ele; não reinicie a tarefa.
- **SE** há erros **ENTÃO** mostre resumo no início, com links para cada campo, e repita a mensagem junto ao campo.
- **SE** o campo é senha ou código de segurança do cartão **ENTÃO** não retenha após a autorização; peça novamente.
- **SE** o campo é arquivo que o navegador não repopula **ENTÃO** explique e ofereça nova seleção.
- **SE** a falha é temporária **ENTÃO** permita tentar de novo sem apagar a entrada.
- **SE** o formulário é longo ou em etapas **ENTÃO** preserve os dados enquanto a tarefa estiver ativa, em voltar/avançar e recarregamentos inevitáveis (apenas dados não sensíveis).
- **SE** o usuário escolheu limpar ou cancelar, a sessão expirou ou o contexto é de outro usuário **ENTÃO** descarte e avise.
- **SENÃO** não altere o formato dos valores em silêncio.

## Quando usar

- Após validação com erro, no cliente ou no servidor.
- Formulários longos e etapas com voltar e avançar.
- Falhas temporárias e novas tentativas.
- Dados difíceis de redigitar.

## Quando evitar

- Senhas e códigos de segurança após autorização → **use em vez disso:** pedir de novo.
- Sessão expirada ou política exigindo descarte → **use em vez disso:** explicar o descarte.
- Dado que não pertence à tarefa atual → **use em vez disso:** não persistir.

## Faça

- Preserve textos e seleções válidos.
- Mantenha rótulo, valor e instrução visíveis juntos.
- Leve o foco de forma previsível ao primeiro erro ou ao resumo.
- Proteja o rascunho ativo e limite sua duração.

## Evite

- Limpar o formulário inteiro.
- Exigir redigitação global.
- Persistir senha ou CVV.
- Esconder a causa do erro.
- Confundir erro técnico com erro de validação.

## Acessibilidade

- Descreva o erro em texto (WCAG 3.3.1) e sugira a correção quando possível (WCAG 3.3.3).
- Associe cada mensagem ao controle com `aria-describedby` e use `aria-invalid="true"` no campo inválido.
- O resumo pode receber o foco ou conduzir ao primeiro erro, mantendo a ordem do formulário.
- Não dependa só de cor, borda ou ícone (WCAG 1.4.1).
- Teste recarregamento, expiração, zoom, teclado, leitor de tela e conexão lenta.

## Microcópia

| Situação | Exemplo |
|---|---|
| Resumo | "Corrija 1 campo para continuar." |
| Campo | "Informe um CEP com 8 números." |
| Cartão | "Por segurança, digite novamente o código do cartão." |
| Arquivo | "Selecione o arquivo novamente." |

## Checklist de verificação

- [ ] Campos válidos continuam preenchidos?
- [ ] Seleções e opções foram preservadas?
- [ ] Só o campo inválido está destacado?
- [ ] O resumo leva a cada campo?
- [ ] A mensagem explica como corrigir?
- [ ] Senhas e códigos de segurança não são retidos?
- [ ] É possível tentar novamente sem perder dados?
- [ ] O descarte por cancelar ou expirar é explicado?

## Fundamentação

- Baymard Institute: dados de cartão apagados levam a abandono (contexto de checkout); diretriz de preservação de entradas.
- W3C WAI (Easy Checks e User Notification): campos sem erro permanecem preenchidos; resumo com links e aria-describedby.
- WCAG 2.2, 3.3.1 (Error Identification).
- GOV.UK Design System (recuperar de erros de validação): reexibir com respostas preservadas, resumo e mensagens junto ao campo.
- PCI SSC: códigos de verificação não podem ser retidos após a autorização.
- Padrão Digital GOV.BR (Input): mensagens contextuais associadas ao campo.
