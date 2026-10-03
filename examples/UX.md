---
version: alpha
name: Pactum
description: Plataforma web de gestão de contratos comerciais de uma distribuidora de alimentos (fictícia), desktop, densidade alta, uso diário pelo time comercial e jurídico.
owner: time-de-produto-pactum
updated: 2026-10-02
product:
  persona: Analista de contratos que acompanha vencimentos, reajustes e renovações de 1.800 contratos com varejistas e fornecedores
  register: operational
  platform: desktop
  density: high
navigation:
  model: "menu lateral por área + abas na página de detalhe"
  max-depth: 3
  back: mandatory
archetypes:
  monitoring-dashboard: ["/inicio"]
  operational-list: ["/contratos", "/reajustes"]
  detail-side-panel: ["/contratos (painel do cliente)"]
  master-detail: ["/clientes"]
  document-viewer: ["/contratos/:id/documento"]
  editor-with-panel: ["/minutas/:id"]
  step-wizard: ["/contratos/novo"]
  library: ["/modelos"]
  settings: ["/configuracoes"]
  public-decision-page: ["/aceite/:token"]
  form-dialog: ["Registrar reajuste", "Adicionar responsável"]
  confirmation-dialog: ["Encerrar contrato", "Descartar minuta"]
actions:
  primary-per-region: 1
  primary-position: top-right
  dialog-order: cancel-action
  destructive-specific-label: true
confirmation:
  irreversible: type-name
  reversible: undo
feedback:
  success: toast
  field-error: inline
  system-error: page-alert
  skeleton-after-ms: 1000
states: [loading, empty, empty-filtered, error, no-access, success]
forms:
  label: always-visible
  validation: on-blur
  required: mark-optional
content:
  glossary: docs/glossario.md
  buttons: verb-object
  forbidden: [tenant, payload, job, status_code, null, ERP_ID]
flows:
  max-journey-steps: 10
  max-stacked-dialogs: 1
  dead-ends: 0
verification:
  selectors:
    regions: ["header", "nav", "aside", "main", "[role=dialog]"]
    dialog: "[role=dialog]"
    primary: ".MuiButton-contained"
    destructive: ".MuiButton-containedError, .MuiButton-colorError"
    button: "button, [role=button]"
    field: "input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select"
---

# Pactum — UX

Produto fictício, usado como exemplo de referência do formato. As decisões abaixo vieram do código (mapas de `.dsx/maps/`), de 6 entrevistas com analistas e do registro de chamados de suporte do primeiro semestre; o que foi deduzido sem evidência direta está marcado "(inferido)". Em conflito, vale o comportamento mais restritivo (confirmação, retorno visível) até a próxima revisão.

## Visão geral

O Pactum é a mesa de trabalho do time de contratos da distribuidora: 9 analistas e 3 advogadas passam o dia nele, em monitor de 24", acompanhando o que vence, o que precisa de reajuste e o que está em negociação. A pessoa abre o produto para responder "o que eu preciso resolver hoje?" e fecha quando a fila do dia zerou.

O cliente varejista só toca o produto pela página pública de aceite de renovação, sem login.

O Pactum **nunca** aplica reajuste, renovação ou encerramento sem que uma pessoa confirme na tela, e **nunca** envia nada ao cliente sem mostrar antes o texto exato que ele vai receber.

## Personas e tarefas

| Persona | Tarefa | Frequência | Erro crítico |
|---|---|---|---|
| Analista de contratos | Tratar a fila de vencimentos dos próximos 60 dias | Diária, 20–40 itens | Deixar um contrato renovar automaticamente com preço defasado |
| Analista de contratos | Registrar reajuste anual pelo índice do contrato | Semanal, picos em janeiro e julho | Aplicar o índice errado ou sobre a base errada |
| Advogada | Revisar e aprovar minuta de aditivo | 5–10 por semana | Aprovar cláusula alterada sem perceber a alteração |
| Gestor comercial | Ver carteira por cliente e risco de vencimento | Semanal | Decidir com número desatualizado |
| Cliente varejista (externo) | Aceitar ou recusar a renovação proposta | Uma vez por contrato por ano | Aceitar sem ver o novo valor |

## Arquitetura da informação

Quatro áreas no menu lateral, com estes nomes exatos: **Início**, **Contratos**, **Reajustes**, **Clientes**. Abaixo, separadas por divisor: **Modelos** e **Configurações**.

- **Início** é a entrada: o que vence, o que está parado e o que espera a pessoa.
- **Contratos** é a lista de trabalho; cada contrato abre num detalhe com abas *Resumo*, *Documento*, *Aditivos*, *Histórico*.
- **Reajustes** é uma fila própria porque o trabalho é em lote por índice e mês.
- **Clientes** agrupa contratos por razão social; o detalhe do cliente nunca edita contrato, só leva até ele.
- **Modelos** guarda as minutas-base aprovadas pelo jurídico.

O número do contrato (ex.: CT-2026-0412) é o identificador que aparece em toda tela; o código interno do ERP nunca aparece.

## Navegação

Menu lateral fixo, sempre visível, com a área atual marcada. Na página de detalhe, migalha "Contratos › CT-2026-0412" no topo e abas logo abaixo do título. Profundidade máxima 3: área → detalhe → aba ou editor. O editor de minuta é o nível mais fundo e tem botão "Voltar ao contrato" no cabeçalho.

Filtros da lista vivem na URL: voltar do detalhe devolve a lista com os mesmos filtros, a mesma página e a linha de onde se saiu destacada por 2 s.

## Arquétipos de tela

| Tela | Arquétipo | Variação | Desvio |
|---|---|---|---|
| `/inicio` | monitoring-dashboard | três blocos de fila com contagem | Sem gráficos: cada bloco é uma lista curta clicável, porque a pergunta é "o que fazer", não "como está" |
| `/contratos` | operational-list | with-bulk-actions | — |
| `/reajustes` | operational-list | with-bulk-actions | Agrupada por índice (IPCA, IGP-M) com subtotal no cabeçalho do grupo |
| painel do cliente em `/contratos` | detail-side-panel | — | — |
| `/clientes` | master-detail | lista à esquerda | — |
| `/contratos/:id/documento` | document-viewer | metadados à direita | — |
| `/minutas/:id` | editor-with-panel | painel de comparação | O painel abre por padrão em "Diferenças em relação ao modelo", não em "Propriedades" |
| `/contratos/novo` | step-wizard | 4 etapas | — |
| `/modelos` | library | — | — |
| `/configuracoes` | settings | — | — |
| `/aceite/:token` | public-decision-page | — | — |
| "Registrar reajuste", "Adicionar responsável" | form-dialog | — | — |
| "Encerrar contrato", "Descartar minuta" | confirmation-dialog | digitar o número | — |

Cada arquétipo da coluna do meio é um cartão `archetypes/<id>.md` do DSX; os desvios desta tabela valem só para o Pactum.

## Layout e regiões

- **Cabeçalho do produto** (56 px): logo, busca global por número de contrato ou razão social, avatar. Nada de ação de página aqui.
- **Menu lateral** (240 px, recolhe para 64 px): as seis áreas.
- **Cabeçalho da página**: migalha, título (o único `h1`), metadado curto (situação, vencimento) e a ação primária à direita.
- **Conteúdo**: lista, documento ou editor.
- **Painel lateral** (420 px, sobre o conteúdo, sem escurecer a página): detalhe rápido sem sair da lista; fecha com Esc e devolve o foco à linha.

## Ações

- Uma ação primária (botão cheio) por região, no canto superior direito do cabeçalho da página: "Novo contrato", "Registrar reajustes selecionados", "Aprovar minuta".
- Secundárias em botão contornado ao lado da primária, no máximo duas; o resto vai no menu "Mais ações".
- Ações por linha aparecem como ícone com rótulo acessível e dica ao passar o mouse; no máximo três por linha.
- Destrutiva com rótulo específico: "Encerrar contrato", "Descartar minuta". Nunca "Confirmar", "OK" ou "Sim".
- Ação que a pessoa não pode executar por permissão fica **escondida**; ação que ela poderá executar depois de cumprir uma condição fica **visível e desabilitada com o motivo ao lado** ("Aprovar minuta — falta a revisão do jurídico").

## Feedback e estados

- Sucesso: toast de 6 s com o que aconteceu e, quando reversível, "Desfazer" ("Reajuste registrado em 14 contratos. Desfazer").
- Erro de campo: abaixo do campo, ao sair dele. Erro de sistema: alerta no topo do conteúdo, com "Tentar de novo" e o que já foi salvo.
- Carregando: esqueleto com a forma da tela quando a espera passa de 1 s; antes disso, nada.
- Vazio: diz por que está vazio e oferece o próximo passo. Lista vazia por filtro tem "Limpar filtros", nunca o convite de primeiro uso.
- Sem acesso: página com o nome da área, o motivo e quem concede o acesso.

| Tipo de tela | Vazio | Erro |
|---|---|---|
| Lista operacional | "Nenhum contrato vence nos próximos 60 dias." | Alerta acima da tabela; a tabela anterior continua visível |
| Editor com painel | Não se aplica (sempre há texto) | Alerta no cabeçalho; o texto digitado nunca é descartado |
| Página pública de decisão | — | Página com o contato do analista responsável |

## Formulários

- Rótulo sempre visível acima do campo; o exemplo vai no texto de apoio, nunca só no placeholder.
- Quase todos os campos são obrigatórios, então se marca o que é **opcional**.
- Até 5 campos e uma decisão: diálogo ("Registrar reajuste"). Mais que isso, ou com etapas que dependem umas das outras: página ou assistente ("Novo contrato").
- Valor monetário com máscara de real e duas casas; data no formato dd/mm/aaaa com calendário opcional.
- O botão de envio nunca fica desabilitado para impedir erro: ao clicar com pendência, o foco vai ao primeiro campo com problema.

## Conteúdo e microcopy

- Glossário no arquivo `glossario.md` da pasta de documentação do projeto; "contrato", "aditivo", "minuta", "reajuste" e "renovação" têm um único sentido cada.
- Botões com verbo + objeto: "Registrar reajuste", "Enviar para aceite", "Aprovar minuta".
- Termos de implementação nunca aparecem: tenant, payload, job, status_code, null, ERP_ID.
- Tom direto, na segunda pessoa implícita: "Revise o novo valor antes de enviar."
- Fórmula de erro: o que houve + o que fazer ("Não foi possível calcular o reajuste: o contrato não tem índice. Defina o índice na aba Resumo.").
- Fórmula de confirmação destrutiva: consequência + o que não volta ("O contrato CT-2026-0412 deixa de gerar cobranças a partir de 01/11/2026. Esta ação não pode ser desfeita.").

## Fluxos

| Jornada | Início → fim | Passos | Troca de canal |
|---|---|---|---|
| Tratar vencimento | Início → contrato → enviar para aceite | 5 | E-mail ao cliente com link para `/aceite/:token` |
| Reajuste em lote | Reajustes → selecionar → registrar → conferir | 4 | — |
| Aditivo | Contrato → nova minuta → revisão jurídica → aprovação | 8 | Notificação à advogada |
| Novo contrato | Contratos → assistente (4 etapas) → contrato criado | 6 | — |

Limites: nenhuma jornada passa de 10 passos; nunca mais de um diálogo aberto; o aceite pelo cliente termina numa página que diz o que acontece depois e com quem falar.

## Faça e não faça

### Faça

- Devolva a lista com filtros, página e linha de origem ao voltar do detalhe — 3 chamados por semana pediam isso antes da mudança.
- Mostre o valor antigo, o índice e o valor novo lado a lado antes de registrar um reajuste.
- Abra o editor de minuta com as diferenças em relação ao modelo à vista; a advogada aprova olhando o que mudou.
- Use o número do contrato como título do detalhe e na migalha.

### Não faça

- Não use diálogo de confirmação para ação reversível; ofereça "Desfazer" no toast. O diálogo antigo em "Arquivar" era confirmado sem leitura.
- Não empilhe diálogo sobre diálogo: "Adicionar responsável" de dentro de "Registrar reajuste" fazia a pessoa perder o reajuste digitado.
- Não mostre o código do ERP nem a situação técnica de integração na tela do analista.
- Não esconda o botão de aprovar quando falta uma condição; deixe visível, desabilitado, com o motivo.

## Instruções para agentes

- Consulte este arquivo antes de criar ou rearranjar qualquer tela do Pactum; ache o arquétipo da tela na seção "Arquétipos de tela" e leia o cartão correspondente.
- Preserve: uma primária por região no topo direito, menu lateral com as seis áreas, filtros na URL, retorno visível em toda tela não raiz.
- Tela nova sem arquétipo na tabela: proponha o arquétipo e registre a linha antes de construir.
- Valide com `node <DSX>/tools/lint-ux-md.mjs UX.md` e rode o ux-lint de tela e de fluxo sobre as capturas; achado de severidade 3 ou 4 bloqueia a entrega.
