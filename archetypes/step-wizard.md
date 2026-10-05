---
id: step-wizard
title: Assistente em etapas
summary: Fluxo guiado que divide uma tarefa longa ou rara em etapas ordenadas, com uma decisão por vez e revisão antes de concluir.
register: [operational, consumer]
when-to-use: SE a tarefa é longa, pouco frequente ou tem etapas que dependem das respostas anteriores ENTÃO use assistente em etapas
avoid-when: a pessoa faz a tarefa todo dia e conhece os campos (use formulário de página), há menos de ~6 campos (use diálogo de formulário) ou as etapas não têm ordem natural (use configurações)
regions: [page-header, step-trail, step-body, navigation-footer]
primary-action: { region: navigation-footer, position: bottom-right, max: 1 }
states: [loading, field-error, error, submitting, success, draft-restored]
patterns: [split-form, form-steps, validation-timing, form-errors, error-placement, preserve-data-after-error, required-fields, label-vs-placeholder, double-submit, success-confirmation, action-placement, file-upload]
variations: [horizontal-trail, vertical-side-trail, final-review-step, wizard-in-dialog]
rules: [T1, T3, T4, T6, T7, F3, F5]
---

# Assistente em etapas

Criar um projeto novo com partes e responsáveis, importar uma planilha e mapear colunas, montar um lote de pedidos a partir de requisições aprovadas. Tarefas que a pessoa faz poucas vezes, com decisões que dependem umas das outras. O assistente reduz a carga a uma pergunta por vez e mostra sempre onde a pessoa está e quanto falta.

## Quando usar

- **SE** a tarefa tem grupos de decisão com ordem natural (dados → partes → documentos → revisão) **ENTÃO** cada grupo vira uma etapa; de 3 a 6 etapas.
- **SE** uma resposta muda as etapas seguintes **ENTÃO** a trilha se atualiza à vista da pessoa, nunca pula etapas em silêncio.
- **SE** a conclusão cria algo caro de desfazer (envia, cobra, publica) **ENTÃO** inclua a `final-review-step` com tudo editável.
- **SE** a tarefa leva mais de alguns minutos **ENTÃO** guarde rascunho e permita sair e retomar.
- **SE** a pessoa repete a tarefa diariamente **ENTÃO** troque por formulário de página único, com seções; o assistente vira atrito.
- **SENÃO** (poucos campos, uma decisão) **ENTÃO** use `form-dialog`.

## Mapa de regiões

```
┌──────────────────────────────────────────────────────────────┐
│ page-header  Novo projeto (h1)          Sair e salvar         │
├──────────────────────────────────────────────────────────────┤
│ step-trail  ✓ Dados ── ● Partes ── ○ Documentos ── ○ Rev      │
│                   Etapa 2 de 4                                │
├──────────────────────────────────────────────────────────────┤
│ step-body   Título da etapa (h2) + 1 frase de orientação      │
│                  Campo  [__________]                          │
│                  Campo  [__________]  texto de ajuda          │
├──────────────────────────────────────────────────────────────┤
│ navigation-footer  [Voltar]                    [Continuar]    │
└──────────────────────────────────────────────────────────────┘
```

## O que vai em cada região

- **page-header** — `h1` com o objetivo ("Novo projeto"), e a saída: "Sair e salvar rascunho" ou "Cancelar" com aviso se houver dados. Nada mais.
- **step-trail** — etapas com nome curto e estado (concluída, atual, pendente, com erro), mais "Etapa X de Y" em texto. Etapas concluídas são clicáveis para revisão; pendentes, não.
- **step-body** — título da etapa (`h2`), uma frase dizendo por que pedimos isto, campos com rótulo visível e ajuda. Uma coluna. Erros junto ao campo e um resumo no topo ao tentar avançar.
- **navigation-footer** — "Voltar" à esquerda (secundária), "Continuar" à direita (primária); na última etapa, a primária diz o que acontece ("Criar projeto", "Enviar 12 pedidos").

## Ações

- **Primária:** uma, no `navigation-footer`, bottom-right — "Continuar" nas etapas intermediárias e verbo + objeto na final.
- **Voltar:** sempre disponível a partir da etapa 2, sem perder o que foi preenchido.
- **Sair:** salva rascunho ou pede confirmação quando o descarte perde dados.
- **Envio final:** bloqueia clique duplo, mostra progresso e só conclui depois da resposta do servidor.

## Estados

- **loading** — dados iniciais (listas de opções, rascunho) chegando: esqueleto no corpo; trilha já visível.
- **field-error** — validação ao sair do campo; ao clicar em "Continuar" com erro, resumo no topo com links para cada campo e foco no resumo; a etapa fica marcada com erro na trilha.
- **error** — falha do sistema ao avançar ou concluir: alerta na etapa, dados preservados, "Tentar novamente".
- **submitting** — primária com indicador e desabilitada; demais controles bloqueados; para lotes, progresso por item.
- **success** — página de conclusão: o que foi criado, onde encontrar, próximo passo provável; nunca volta para uma etapa vazia.
- **draft-restored** — ao reabrir, avise que um rascunho foi recuperado, de quando, e ofereça descartar e começar do zero.

## Variações

### horizontal-trail
Etapas numa linha acima do corpo.
**Favorece:** 3–5 etapas com nomes curtos; telas largas.
**Piora:** nomes longos ou mais de 5 etapas não cabem; em celular vira "Etapa X de Y" só.

### vertical-side-trail
Etapas numa coluna à esquerda, com subetapas possíveis.
**Favorece:** fluxos longos, etapas com nomes descritivos, retorno frequente a etapas anteriores.
**Piora:** consome largura; parece formulário de configurações se as etapas não tiverem ordem clara.

### final-review-step
Última etapa mostra o resumo de todas as respostas, com "Alterar" por bloco.
**Favorece:** conclusão cara de desfazer; confiança antes de enviar.
**Piora:** uma etapa a mais; se o resumo não for editável no lugar, a pessoa navega para trás e se perde.

### wizard-in-dialog
Etapas dentro de um diálogo grande (2–3 etapas curtas).
**Favorece:** tarefa curta que nasce de outra tela e volta a ela.
**Piora:** pouco espaço; perde a URL por etapa; não serve para rascunho longo nem para mais de 3 etapas.

## Anti-padrões

- Trilha que permite pular para etapa ainda não preenchida e depois falha.
- "Voltar" que apaga o que foi digitado.
- Validação que só aparece no envio final, apontando para três etapas atrás.
- Rótulo "Próximo" na última etapa, que na verdade envia.
- Assistente para tarefa diária de três campos.
- Sucesso como toast que some, deixando a pessoa numa tela vazia.

## Checklist

- [ ] 3–6 etapas, nomes curtos, "Etapa X de Y" em texto.
- [ ] Uma primária no rodapé à direita; "Voltar" à esquerda sem perda de dados.
- [ ] Rótulo da última primária descreve o resultado.
- [ ] Erros junto ao campo e resumo no topo ao avançar.
- [ ] Rascunho salvo e retomado com aviso.
- [ ] Envio final protegido contra clique duplo.
- [ ] Página de sucesso com próximo passo; jornada dentro do limite de passos do produto.
