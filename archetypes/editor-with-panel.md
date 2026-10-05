---
id: editor-with-panel
title: Editor com painel
summary: Tela de produção de um documento ou objeto complexo, com a área de edição ao centro e um painel lateral de apoio (comentários, variáveis, sugestões, verificação).
register: [operational, editorial]
when-to-use: SE a pessoa constrói ou altera um conteúdo longo e precisa de apoio contextual sem sair dele ENTÃO use editor com painel
avoid-when: o conteúdo é um formulário de poucos campos (use diálogo de formulário ou configurações), o documento está congelado (use documento com visor) ou não existe apoio lateral que justifique o painel
regions: [page-header, toolbar, editing-area, side-panel, status-bar]
primary-action: { region: page-header, position: top-right, max: 1 }
states: [loading, saving, saved, conflict, error, no-access, read-only, success]
patterns: [autosave-vs-save, undo, preserve-data-after-error, tabs, review-ai-output, label-ai-content, ai-sources, session-expired, icon-only-button, disabled-button, success-confirmation]
variations: [fixed-right-panel, collapsible-panel, tabbed-panel, focus-without-panel]
rules: [T1, T3, T4, T6, T7, F5]
---

# Editor com painel

Pedido de compra com muitas linhas, especificação técnica, modelo de documento, regra complexa: a pessoa passa horas aqui. A área de edição precisa de calma e largura; o painel traz o que ajuda a escrever certo — comentários, campos a preencher, alternativas aprovadas, verificações, sugestões de IA. O cabeçalho diz em que estado o trabalho está e qual o próximo passo do ciclo.

## Quando usar

- **SE** o conteúdo é longo e editado em várias sessões **ENTÃO** use editor com painel com salvamento automático e indicador de estado sempre visível.
- **SE** há apoio contextual que a pessoa consulta enquanto escreve (comentários, variáveis, itens do catálogo, verificação) **ENTÃO** esse apoio vai no `side-panel`, nunca em diálogo que cobre o texto.
- **SE** o painel tem mais de um tipo de apoio **ENTÃO** use a variação `tabbed-panel`; não empilhe tudo num painel rolante.
- **SE** partes do conteúdo são geradas ou sugeridas por IA **ENTÃO** marque a origem, mostre a base e exija aceite explícito antes de entrar no texto.
- **SE** algo bloqueia o próximo passo (pendência, campo obrigatório, desvio a aprovar) **ENTÃO** a primária fica desabilitada com o motivo, e o painel lista as pendências com link para cada ponto do texto.
- **SENÃO** (conteúdo curto, sem apoio) **ENTÃO** um formulário de página ou `form-dialog` basta.

## Mapa de regiões

```
┌──────────────────────────────────────────────────────────────┐
│ page-header ‹ Pedidos / Título (h1)  Rascunho  [Primária]        │
├──────────────────────────────────────────────────────────────┤
│ toolbar  B I U · Título ▾ · Inserir ▾ · ↶ ↷                  │
├──────────────────────────────────────────┬───────────────────┤
│ editing-area                             │ side-panel         │
│                                          │ [Coment.|Campos|✓] │
│   Texto em largura de leitura            │ • Pendência 1 →    │
│   (60–80 caracteres por linha)           │ • Comentário de Ana│
│                                          │ • Sugestão (IA)    │
├──────────────────────────────────────────┴───────────────────┤
│ status-bar  Salvo há 10 s · 2 pendências · 3.412 palavras      │
└──────────────────────────────────────────────────────────────┘
```

## O que vai em cada região

- **page-header** — caminho de volta, título do documento (`h1`, editável no lugar se fizer sentido), etiqueta de situação (Rascunho, Em revisão, Aprovado), ação primária do ciclo e menu "Mais ações" (duplicar, exportar, histórico, excluir).
- **toolbar** — formatação e inserção agrupadas por função, desfazer/refazer; botões só com ícone têm nome acessível e dica com atalho. Fixa no topo ao rolar.
- **editing-area** — o conteúdo, em largura de leitura; trechos com status especial (travado, sugerido por IA, com comentário) marcados com mais de um sinal (cor + ícone ou sublinhado + rótulo).
- **side-panel** — apoio contextual ligado ao ponto do texto: clicar num item do painel leva ao trecho, e selecionar um trecho filtra o painel. Itens de IA trazem rótulo de origem e ações "Aceitar", "Editar", "Descartar".
- **status-bar** — estado de salvamento com horário, contagem de pendências (link para o painel), métricas do conteúdo. Mensagens aqui são `aria-live` educado.

## Ações

- **Primária:** uma, no `page-header`, top-right — avançar o ciclo ("Enviar para aprovação", "Exportar pedido"). Salvar não é primária quando há salvamento automático.
- **Bloqueio:** primária desabilitada enquanto houver pendência impeditiva, com o motivo junto ("2 pendências impedem o envio") e caminho para resolvê-las.
- **Desfazer:** desfazer/refazer sempre disponíveis para edição; ação que não se desfaz (enviar, congelar versão) pede confirmação.
- **Destrutiva:** excluir o documento só no menu "Mais ações", com confirmação que nomeia o documento.

## Estados

- **loading** — esqueleto do texto e do painel; a barra de ferramentas aparece desabilitada até o conteúdo chegar.
- **saving** — indicador discreto na barra de status ("Salvando…"); nunca bloqueia a digitação.
- **saved** — "Salvo às 14:32" ou "há 10 s"; a pessoa sabe que pode fechar.
- **conflict** — outra pessoa ou sessão alterou o mesmo conteúdo: avise antes de sobrescrever, mostre quem e quando, e ofereça comparar, manter a minha ou recarregar a outra.
- **error** — falha ao salvar: alerta persistente (não toast que some) com "Tentar novamente"; o texto digitado continua no editor e, se possível, numa cópia local.
- **no-access** — sem permissão para editar nem ver: tela explica; se puder ver mas não editar, vá para `read-only`.
- **read-only** — documento congelado ou sem permissão de edição: barra de ferramentas some, faixa explica o motivo e o caminho ("Criar nova versão").
- **success** — passo do ciclo concluído (enviado, exportado): confirmação com o que acontece agora e situação atualizada no cabeçalho.

## Variações

### fixed-right-panel
Painel sempre aberto com ~320–380 px.
**Favorece:** trabalho com muitos comentários ou pendências; revisão.
**Piora:** área de edição mais estreita; em telas médias o texto fica apertado.

### collapsible-panel
Painel abre e fecha por botão (com `aria-expanded`) e lembra a escolha da pessoa.
**Favorece:** escrita concentrada com apoio sob demanda; telas médias.
**Piora:** pendências escondidas podem passar despercebidas — mostre a contagem no botão de abrir.

### tabbed-panel
Um painel, várias abas (Comentários, Campos, Verificação, Sugestões).
**Favorece:** vários tipos de apoio sem multiplicar painéis.
**Piora:** a informação da aba fechada some; aba com pendência precisa de contador visível.

### focus-without-panel
Modo de escrita: painel e barra de ferramentas recolhidos, só o texto e a barra de status.
**Favorece:** redação longa sem distração.
**Piora:** apoio e pendências ficam fora de vista; o caminho de saída do modo precisa ser óbvio.

## Anti-padrões

- Botão "Salvar" como primária ao lado de salvamento automático (dois modelos ao mesmo tempo).
- Falha de salvamento comunicada por toast que desaparece.
- Sugestão de IA inserida direto no texto, sem rótulo e sem aceite.
- Comentários em diálogo modal que cobre o trecho comentado.
- Primária desabilitada sem dizer o que falta.
- Trechos travados indicados só por cor de fundo.
- Sair da tela sem aviso quando há alteração não salva.

## Checklist

- [ ] `h1` com o nome do documento; situação visível no cabeçalho.
- [ ] Um modelo de salvamento só, com estado e horário visíveis.
- [ ] Uma primária; desabilitada com motivo e caminho quando bloqueada.
- [ ] Painel ligado ao texto nos dois sentidos (clicar leva ao trecho).
- [ ] Conteúdo de IA rotulado, com base e aceite explícito.
- [ ] Conflito e erro de salvamento tratados sem perda de texto.
- [ ] Ícones da barra com nome acessível; status especiais com mais de um sinal.
- [ ] Caminho de volta visível e aviso ao sair com alteração pendente.
