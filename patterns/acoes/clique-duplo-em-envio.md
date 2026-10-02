---
id: clique-duplo-em-envio
titulo: Como evitar cliques múltiplos durante o carregamento de uma ação?
categoria: acoes
componentes: [botao, formulario]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: moderada
wcag: ["4.1.3", "2.1.1"]
relacionados: [botao-desabilitado, tentar-novamente, confirmacao-de-sucesso, preservar-dados-apos-erro]
---

# Como evitar cliques múltiplos durante o carregamento de uma ação?

> **Regra:** Valide primeiro; na primeira submissão válida, mostre o processamento no próprio botão, ignore novas ativações da mesma ação e garanta idempotência no servidor.

## Contexto

Quando uma ação demora, a pessoa clica de novo para confirmar que o primeiro clique funcionou. Em compras, pagamentos e gravações isso pode duplicar registros ou cobrar duas vezes.

A solução combina três camadas: retorno imediato, bloqueio temporário daquela mesma ativação e proteção no servidor. Só o bloqueio visual não evita reenvio por rede, recarga da página ou concorrência.

O padrão serve para ações com efeito colateral. Não é necessário travar toda interação depois de qualquer clique.

## Decisão

- **SE** a ação cria, grava, paga ou publica **ENTÃO** aplique o padrão completo (feedback + bloqueio + idempotência).
- **SE** os dados ainda são inválidos **ENTÃO** mostre os erros e não entre em estado de processamento.
- **SE** a submissão é válida **ENTÃO** marque a operação como pendente e ignore novas ativações até o fim do ciclo.
- **SE** o envio é feito por clique, Enter ou Space **ENTÃO** bloqueie no evento de submissão do formulário, não só no clique.
- **SE** a ação é filtro, aba, navegação ou reversível sem efeito duplicado **ENTÃO** mantenha o controle interativo.
- **SE** a operação falha **ENTÃO** informe o erro, preserve os dados e reabilite a nova tentativa quando for seguro.
- **SE** a operação pode ser realmente interrompida **ENTÃO** ofereça "Cancelar"; **SENÃO** não ofereça (parar de esperar não desfaz o que foi enviado).
- **SENÃO** gere uma chave de idempotência por tentativa de operação e envie ao servidor.

## Quando usar

- Envio de formulários e criação de registros.
- Salvar, publicar, comprar, pagar, confirmar.
- Importações e exportações.
- Qualquer ação cuja resposta pode parecer silenciosa.

## Quando evitar

- Bloquear antes da validação → **use em vez disso:** validar e só então bloquear.
- Desabilitar permanentemente sem explicar → **use em vez disso:** estado de carregamento com texto.
- Só travar o botão sem proteção no servidor → **use em vez disso:** idempotência ou deduplicação.

## Faça

- Mantenha o botão no mesmo lugar, mostrando o estado de loading.
- Bloqueie apenas a ação em andamento.
- Preserve os dados digitados durante o envio.
- Encerre o ciclo com sucesso ou erro explícito.

## Evite

- Usar atraso fixo (debounce cego) como única proteção.
- Limpar o formulário durante o envio.
- Remover o foco do botão sem motivo.
- Comunicar o estado só por cor.

## Acessibilidade

- Use `<form>` e `<button>` semânticos com um único caminho de submissão.
- Anuncie o estado em região `role="status"` ou `aria-live="polite"` sem mover o foco (WCAG 4.1.3).
- `disabled` nativo pode tirar o botão da tabulação; `aria-disabled="true"` mantém o foco mas exige bloqueio no código.
- Não bloqueie só com `pointer-events: none`, cor ou opacidade.
- Teste Enter, Space, leitor de tela, zoom e movimento reduzido.

## Microcópia

| Situação | Exemplo |
|---|---|
| Processando | "Salvando…" |
| Pagamento | "Processando pagamento…" |
| Erro | "Não foi possível salvar. Seus dados foram mantidos. Tente novamente." |
| Sucesso | "Alterações salvas." |

## Checklist de verificação

- [ ] A validação ocorre antes do bloqueio?
- [ ] O primeiro acionamento mostra feedback imediato?
- [ ] Clique, Enter e Space repetidos são ignorados durante a operação?
- [ ] O botão permanece na mesma posição?
- [ ] Os dados continuam preenchidos?
- [ ] O servidor rejeita ou deduplica a repetição?
- [ ] O estado é anunciado sem mover o foco?
- [ ] Após erro, é possível tentar de novo?

## Fundamentação

- Baymard Institute: duplo clique gera envios idênticos; combinar bloqueio imediato e proteção no back-end (contexto de formulários e e-commerce).
- Baymard Institute (Button Design): estados de progresso e desabilitado.
- IBM Carbon: inline loading com botão desabilitado durante a ação.
- Padrão Digital GOV.BR: estado loading no botão.
- Adobe React Spectrum: estado pendente que bloqueia ativações e é anunciado.
- WCAG 2.2, 4.1.3 (Status Messages): espera, progresso e erro como mensagens de status.
- W3C WAI-ARIA APG (Button) e MDN (aria-disabled): semântica e limites do aria-disabled.
- Stripe (requisições idempotentes): chave de idempotência contra efeitos duplicados.
