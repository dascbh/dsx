---
id: ai-error-recovery
title: Como oferecer recuperação quando a IA falha?
category: ai
components: [alert, button, error-message]
type: recommendation
impact: high
status: recommended
evidence: moderate
wcag: ["3.3.1", "3.3.3", "4.1.3", "1.4.1"]
related: [retry, ai-uncertainty, confirm-ai-action, technical-error-code, helpful-error-message]
---

# Como oferecer recuperação quando a IA falha?

> **Regra:** Identifique a etapa que falhou, explique a causa em linguagem simples, preserve o pedido e o trabalho, e ofereça ao menos uma ação de recuperação específica no mesmo contexto.

## Contexto

Sistemas de IA falham por indisponibilidade, limite de uso, entrada extensa demais, fonte inacessível, permissão insuficiente, resposta interrompida ou erro de ferramenta. Reduzir tudo a um aviso genérico deixa a pessoa num beco sem saída.

A interface deve explicar em linguagem acessível o que falhou e sugerir um passo seguinte à altura da causa, sem perder o trabalho feito. Quando a ação tem efeito externo, diga se algo foi executado, foi executado em parte ou nem começou, de modo a evitar duplicidade na repetição.

## Decisão

- **SE** a falha é temporária ou a resposta foi interrompida **ENTÃO** ofereça "Tentar novamente" ou "Gerar de novo" junto à resposta.
- **SE** é limite de uso ou contexto excedido **ENTÃO** explique o limite e ofereça "Reduzir arquivos", "Iniciar nova conversa" ou aguardar.
- **SE** a entrada é inválida **ENTÃO** ofereça "Editar pedido", apontando o problema.
- **SE** a fonte ou conector falhou **ENTÃO** ofereça "Reconectar fonte" ou revisar permissões.
- **SE** houve ação externa e o estado é incerto **ENTÃO** informe o estado e não ofereça repetir às cegas.
- **SE** foi parcialmente concluída **ENTÃO** mostre o que foi feito e permita revisar antes de repetir.
- **SE** repetir não basta **ENTÃO** ofereça alternativa (status do serviço, permissões, suporte).
- **SE** há identificador técnico **ENTÃO** deixe-o em camada secundária, nunca como ação principal.
- **SE** a recusa é de segurança ou política **ENTÃO** diga isso e permita ajustar o pedido; não a disfarce de erro técnico.
- **SENÃO** preserve prompt, anexos e contexto.

## Quando usar

- Interrupção na geração de texto, imagem, áudio, código ou análise.
- Falha de ferramenta, agente, conector ou integração.
- Limite de uso, excesso de contexto, capacidade indisponível.
- Falha de autenticação, permissão ou conexão.
- Ação com resultado incerto.

## Quando evitar

- Mostrar erro enquanto o estado ainda carrega → **use em vez disso:** indicador de carregamento.
- "Tentar novamente" com risco de duplicar efeito externo → **use em vez disso:** verificar o estado primeiro.
- Código como única explicação → **use em vez disso:** mensagem contextual com código secundário.

## Faça

- Nomeie o que falhou.
- Use verbos específicos nos controles.
- Mantenha a ação de recuperação junto da falha.
- Preserve pedido, arquivos e trabalho.

## Evite

- "Algo deu errado" isolado.
- Painel vazio ou carregamento infinito.
- Repetir automaticamente ação externa sem esclarecer o estado.
- Obrigar a recomeçar quando o contexto pode ser preservado.
- Botão genérico sem consequência clara.

## Acessibilidade

- Mensagem de erro em texto com nome acessível (WCAG 3.3.1) e sugestão de correção (WCAG 3.3.3).
- Anuncie novas falhas em região ao vivo adequada, sem repetir a cada mudança irrelevante (WCAG 4.1.3).
- Causa e próximo passo em texto, não só cor ou ícone (WCAG 1.4.1).
- Ações com nomes explícitos e foco visível; não mova o foco durante a resposta em andamento.
- Preserve conteúdo digitado e anexos.

## Microcópia

| Situação | Exemplo |
|---|---|
| Resposta interrompida | "A resposta foi interrompida. Gerar de novo" |
| Limite | "O arquivo é grande demais. Reduza o tamanho ou divida em partes." |
| Fonte | "Perdemos a conexão com o Drive. Reconectar" |
| Ação parcial | "2 de 5 e-mails foram enviados. Revise antes de continuar." |

## Checklist de verificação

- [ ] A interface identifica o que falhou?
- [ ] A causa está em linguagem compreensível?
- [ ] Há ação de recuperação no mesmo contexto?
- [ ] O controle usa verbo específico?
- [ ] Pedido, arquivos e trabalho foram preservados?
- [ ] O estado de ação externa está claro?
- [ ] Repetir não duplica efeitos?
- [ ] Existe alternativa quando repetir não resolve?
- [ ] Detalhes técnicos ficam em camada secundária?
- [ ] O erro é compreensível sem cor ou ícone?

## Fundamentação

- Microsoft Fluent 2 (Responsible AI): comunicar falhas e manter controle.
- IBM Carbon for AI: padrões de recuperação em experiências de IA.
- Documentação de ajuda de assistentes de IA e de ferramentas de código: orientações de regenerar, reduzir entrada, nova conversa e reenviar pergunta.
- Documentação de conectores de IA: reconexão e permissões.
