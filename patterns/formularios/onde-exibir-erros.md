---
id: onde-exibir-erros
titulo: Onde exibir mensagens de erro em formulários?
categoria: formularios
componentes: [mensagem-de-erro, resumo-de-erros, alerta-global]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["3.3.1", "1.3.1", "1.4.1", "2.4.3"]
relacionados: [posicao-do-erro-no-campo, erros-em-formularios, toast-alerta-inline, preservar-dados-apos-erro]
---

# Onde exibir mensagens de erro em formulários?

> **Regra:** Erro de campo fica junto ao campo; vários erros ganham resumo navegável no topo; mensagem global é só para falha que afeta o formulário ou o serviço inteiro.

## Contexto

A posição da mensagem decide se a pessoa a encontra, entende e corrige. Mensagem distante passa despercebida ou não deixa claro qual campo precisa de atenção.

O padrão combina três camadas com papéis diferentes: mensagem contextual para o campo, resumo para localizar vários problemas (especialmente em formulários longos ou por teclado e leitor de tela) e mensagem global para o que não pertence a um campo.

Depois do envio, o foco precisa ir a um ponto previsível e os dados preenchidos devem ser mantidos.

## Decisão

- **SE** o erro pertence a um campo **ENTÃO** exiba a mensagem inline junto dele.
- **SE** há vários erros ou o formulário é longo **ENTÃO** adicione resumo no topo com links para cada campo.
- **SE** o envio acabou de falhar **ENTÃO** direcione o foco ao resumo ou ao primeiro campo inválido, sempre do mesmo jeito.
- **SE** o problema afeta o formulário ou o serviço inteiro (indisponibilidade, falha geral) **ENTÃO** use mensagem global com próximo passo.
- **SE** o erro exige correção **ENTÃO** nunca use toast.
- **SE** é validação comum **ENTÃO** nunca use modal.
- **SE** existe resumo **ENTÃO** ele não pode ser o único meio de identificar o erro.
- **SENÃO** mensagem inline.

## Quando usar

- Inline: erros específicos de campo.
- Resumo: vários erros.
- Global: falhas que afetam todo o fluxo.
- Contextual: feedback ligado a um componente.

## Quando evitar

- Erro só no topo → **use em vez disso:** inline mais resumo.
- Mensagem no rodapé ou distante → **use em vez disso:** junto do campo.
- Modal para validação → **use em vez disso:** resumo e inline.
- Toast para erro persistente → **use em vez disso:** inline.
- Várias mensagens globais desconectadas → **use em vez disso:** uma mensagem global única.

## Faça

- Associe cada erro ao seu campo.
- Use o mesmo texto no resumo e no campo.
- Preserve os dados.
- Reserve a mensagem global para o que não se liga a campo.

## Evite

- Remover o preenchimento após o erro.
- Repetir mensagens desconectadas.
- Depender de cor, ícone ou posição.

## Acessibilidade

- Mensagem inline associada programaticamente ao campo (1.3.1).
- Erro descrito em texto (3.3.1); sem depender de cor (1.4.1).
- Resumo com links diretos aos campos (técnica de salto até os erros).
- Ordem de foco previsível após o envio (2.4.3).
- Teste com teclado, zoom e leitor de tela.

## Microcópia

| Situação | Exemplo |
|---|---|
| Título do resumo | "Corrija os campos abaixo para continuar" |
| Item do resumo | "Telefone: inclua o DDD" |
| Global | "Não foi possível enviar agora. Tente novamente em instantes." |
| Inline | "Telefone: inclua o DDD." |

## Checklist de verificação

- [ ] A mensagem aparece junto ao campo afetado.
- [ ] Existe resumo quando há vários erros.
- [ ] Os links do resumo levam aos campos corretos.
- [ ] O resumo não é a única forma de localizar o erro.
- [ ] O foco vai para o resumo ou para o primeiro erro.
- [ ] Os dados preenchidos são preservados.
- [ ] Falhas gerais usam mensagem global.
- [ ] Erros de validação não usam modal nem toast.
- [ ] Foi testado com teclado e leitor de tela.

## Fundamentação

- WCAG 2.2, 3.3.1: erro identificado e descrito em texto, sem posição única.
- W3C técnica G139: mecanismo para saltar aos erros.
- W3C WAI (Form Notifications): mensagem por campo e foco no primeiro inválido.
- GOV.UK Design System (Error summary, Error message): resumo no topo mais mensagem próxima; mesmo texto.
- Padrão Digital GOV.BR (Message): diferencia global e contextual.
- Atlassian Design (Error messages): inline versus global, com próximo passo.
- USWDS (Form) e AMAWeb: validação inline e acessibilidade em formulários.
