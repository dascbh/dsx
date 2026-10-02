---
id: confirmacao-de-sucesso
titulo: Como comunicar uma ação concluída com sucesso?
categoria: feedback
componentes: [toast, mensagem-inline, pagina-de-confirmacao, regiao-de-status]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["4.1.3", "1.4.1", "2.2.1", "2.1.1"]
relacionados: [toast-alerta-inline, duracao-de-toast, desfazer, falha-temporaria, carregamento-longo]
---

# Como comunicar uma ação concluída com sucesso?

> **Regra:** Confirme só o resultado real, nomeando a ação e o objeto, perto do contexto, com permanência proporcional ao impacto e sem roubar o foco.

## Contexto

A mensagem de sucesso atesta que o sistema terminou uma ação e afasta a dúvida sobre o ocorrido. Pesa mais quando o resultado não aparece na interface, envolve envio de dados ou deve servir como comprovante.

O retorno deve refletir o estado verdadeiro. Se o sistema apenas recebeu o pedido e ainda vai processá-lo, escreva "Solicitação recebida" ou "Processamento iniciado", jamais "Concluído". Só mostre sucesso quando a fonte responsável confirmar.

A visibilidade do estado do sistema é heurística clássica: a pessoa precisa saber se a interação foi reconhecida e concluída.

## Decisão

- **SE** a mudança já é inequívoca na própria interface **ENTÃO** não mostre mensagem extra.
- **SE** a ação é simples e reversível **ENTÃO** use alteração visível no componente ou toast breve.
- **SE** a ação ocorre em formulário ou área da página **ENTÃO** use mensagem inline próxima ao local.
- **SE** o resultado é uma compra, contrato, inscrição ou comprovante **ENTÃO** adote página ou seção persistente com número, data, resumo e próximos passos.
- **SE** o sistema só recebeu a solicitação **ENTÃO** comunique "recebida" ou "em processamento", não sucesso.
- **SE** a operação é assíncrona **ENTÃO** mostre estados separados (enviado, em processamento, concluído) e um local persistente para consultar depois.
- **SE** há próximo passo **ENTÃO** diga onde acompanhar ou quando esperar resposta e inclua ação só se útil ("Ver pedido").
- **SE** a mensagem tem ação **ENTÃO** garanta outro caminho para a mesma função caso ela desapareça.
- **SENÃO** use mensagem curta nomeando o que foi feito.

## Quando usar

- Após enviar ou salvar dados cujo resultado não é visível.
- Ao concluir operação assíncrona.
- Ao criar, atualizar ou mover um item.
- Após pagamentos, inscrições e solicitações.

## Quando evitar

- Mudança já inequívoca → **use em vez disso:** nenhuma mensagem.
- Antes da confirmação do servidor → **use em vez disso:** estado de processamento.
- Cada microinteração rotineira → **use em vez disso:** feedback no próprio controle.
- Comprovante importante em toast → **use em vez disso:** página persistente.
- Conteúdo promocional na confirmação → **use em vez disso:** mensagem objetiva.

## Faça

- Nomeie a ação e o objeto concluído.
- Posicione perto de onde a ação aconteceu.
- Ofereça comprovante quando necessário.
- Deixe o tempo de exibição suficiente para ler e agir.

## Evite

- Antecipar o sucesso ao pressionar o botão.
- Escrever só "Sucesso!".
- Depender da cor verde.
- Usar modal sem decisão necessária.
- Repetir a mesma mensagem em vários locais.

## Acessibilidade

- Região de status já existente no DOM antes da atualização (`role="status"`, com `aria-atomic="true"` se a mensagem inteira deve ser relida); não desloque o foco para toast passivo (4.1.3).
- Se a conclusão abre nova página, reflita o resultado no título e no primeiro heading.
- Mensagem com ação acessível por teclado; informações críticas não dependem de tempo curto (2.2.1).
- Resultado em texto, não só verde, ícone ou animação (1.4.1); respeite movimento reduzido.
- Não anuncie sucessos rotineiros em excesso.

## Microcópia

| Situação | Exemplo |
|---|---|
| Edição | "Perfil atualizado." |
| Upload | "Arquivo enviado para Documentos." |
| Recebido | "Solicitação recebida. Avisaremos por e-mail quando terminar." |
| Pagamento | "Pagamento aprovado. Pedido nº 4821." |
| Ação | "Ver pedido" / "Baixar recibo" |

## Checklist de verificação

- [ ] A mensagem só aparece após a conclusão confirmada.
- [ ] O resultado não era evidente sem ela.
- [ ] Nomeia a ação e o objeto, sem "Sucesso!" genérico.
- [ ] O formato corresponde ao impacto da tarefa.
- [ ] Fica perto do contexto da ação.
- [ ] Comprovantes e próximos passos permanecem disponíveis.
- [ ] Não depende só de cor ou ícone.
- [ ] O leitor de tela recebe o estado sem que o foco mude.
- [ ] O tempo de exibição permite leitura e interação.

## Fundamentação

- Nielsen Norman Group (visibilidade do estado do sistema): a pessoa precisa saber se a interação foi reconhecida e concluída.
- WCAG 2.2, critério 4.1.3 (Status Messages): sucesso, progresso e erro anunciados sem receber foco.
- W3C WAI, técnica G199: confirmação explícita após envio reduz esforço de verificação.
- W3C WAI, técnica ARIA22: `role="status"` e `aria-atomic` para anúncios sem deslocar foco.
- Baymard Institute (confirmação de pedido): confirmações pouco claras dificultam verificar a compra; evidência específica de checkout.
- IBM Carbon (notificação), Material Design 3 (snackbar), Atlassian (flag), Adobe Spectrum (toast), Padrão Digital de Governo (Message): formatos e proporção de feedback.
