---
id: detail-side-panel
title: Painel lateral de detalhe
summary: Painel que desliza da borda sobre a tela atual para mostrar ou editar um registro sem perder a lista ou o contexto de onde a pessoa veio.
register: [operational]
when-to-use: SE a pessoa consulta ou ajusta um registro rapidamente e logo volta à lista ou à tela de origem ENTÃO use painel lateral de detalhe
avoid-when: o detalhe é longo ou é onde a pessoa trabalha por muito tempo (use página própria ou master-detail), a tarefa exige toda a largura ou abriria outro painel ou diálogo por cima
regions: [panel-header, panel-body, panel-footer]
primary-action: { region: panel-footer, position: bottom-right, max: 1 }
states: [loading, error, no-access, item-removed, editing, success]
patterns: [when-to-use-modal, when-to-avoid-modal, close-modal, keyboard-focus, tabs, action-placement, skeleton-vs-spinner, autosave-vs-save, link-vs-button, preserve-data-after-error]
variations: [overlay, push-content, read-with-page-link]
rules: [T1, T2, T3, T6, T7, F4, F5]
---

# Painel lateral de detalhe

Ver os dados de um destinatário, conferir o histórico de um item, ajustar o responsável de uma pendência, ler um comentário inteiro. A lista continua lá, na mesma posição de rolagem, com os filtros intactos. O painel é a resposta para "quero só olhar isso" sem pagar o custo de ir e voltar.

## Quando usar

- **SE** a consulta é curta e a pessoa vai seguir pela lista **ENTÃO** use painel lateral; a linha aberta fica marcada.
- **SE** a pessoa só lê e às vezes precisa do registro completo **ENTÃO** use `read-with-page-link` com "Abrir página completa".
- **SE** a pessoa precisa interagir com a lista enquanto o painel está aberto (abrir o próximo, comparar) **ENTÃO** use `push-content`, que não bloqueia o fundo.
- **SE** a edição tem mais que poucos campos ou dura minutos **ENTÃO** leve a uma página ou ao `editor-with-panel`.
- **SE** a ação dentro do painel precisa de confirmação **ENTÃO** a confirmação substitui o rodapé do painel ou é um único diálogo; nunca painel sobre painel.
- **SENÃO** (o detalhe é o centro do trabalho) **ENTÃO** use `master-detail` ou página própria.

## Mapa de regiões

```
┌──────────────────────────────┬───────────────────────────────┐
│ lista (tela de origem,        │ panel-header                   │
│ esmaecida se sobreposto)      │ Nome do registro (h2)    ✕     │
│                               │ Situação · atualizado há 2 h   │
│  ▌linha aberta                ├───────────────────────────────┤
│   linha                       │ panel-body                     │
│   linha                       │ [Dados | Histórico]            │
│                               │ Campo: valor                   │
│                               │ Campo: valor                   │
│                               ├───────────────────────────────┤
│                               │ panel-footer [Cancelar]        │
│                               │                  [Salvar]      │
└──────────────────────────────┴───────────────────────────────┘
```

## O que vai em cada região

- **panel-header** — nome do registro (`h2`; o `h1` continua sendo o da tela de origem), situação, fechar (✕) com nome acessível; opcionalmente "anterior / próximo" e "Abrir página completa".
- **panel-body** — dados em pares rótulo: valor, em leitura por padrão; edição campo a campo ou por "Editar" que transforma o bloco em formulário; abas quando há mais de dois grupos. Rolagem própria.
- **panel-footer** — aparece só no modo de edição: "Cancelar" antes de "Salvar alterações"; em leitura, o painel não tem rodapé ou mostra uma ação de navegação.

## Ações

- **Primária:** uma, no `panel-footer`, bottom-right, apenas quando há edição; em leitura, nenhuma primária.
- **Fechar:** ✕, Esc e (no modo sobreposto) clique fora; com edição pendente, pergunta antes de descartar.
- **Foco:** ao abrir, vai para o título do painel; no modo sobreposto, fica preso no painel; ao fechar, volta para a linha que o abriu.
- **Endereço:** o registro aberto vai para a URL, para recarregar e compartilhar abrindo o mesmo painel.
- **Destrutivas:** em "Mais ações" no cabeçalho, com confirmação.

## Estados

- **loading** — painel abre na hora com esqueleto; nunca espera os dados para começar a deslizar.
- **error** — falha ao carregar ou salvar: mensagem no corpo, "Tentar novamente", dados digitados preservados.
- **no-access** — sem permissão para este registro: o painel explica; a lista não oferece abrir o que a pessoa não pode ver.
- **item-removed** — o registro foi excluído ou movido por outra pessoa enquanto o painel estava aberto: diga isso e ofereça fechar; atualize a lista.
- **editing** — campos editáveis, rodapé com Cancelar e Salvar, aviso de pendência ao tentar fechar.
- **success** — confirmação breve, painel volta à leitura com os valores novos, linha da lista atualizada.

## Variações

### overlay
Painel por cima da tela, fundo esmaecido e bloqueado (comportamento de diálogo).
**Favorece:** foco no registro; telas médias; edição curta.
**Piora:** a lista fica inacessível — abrir o próximo exige fechar; é modal, e valem todas as regras de diálogo.

### push-content
O painel ocupa uma coluna e a lista encolhe ao lado, ambos interativos.
**Favorece:** percorrer itens com o painel aberto; comparação rápida.
**Piora:** a lista perde colunas; em telas médias fica estreita demais — defina quais colunas somem.

### read-with-page-link
Painel só de leitura com resumo e "Abrir página completa" para editar e ver tudo.
**Favorece:** consulta rápida sem duplicar formulários de edição; uma fonte de verdade para a edição.
**Piora:** quem quer só ajustar um campo precisa trocar de tela.

## Anti-padrões

- Painel que abre outro painel ou um diálogo de formulário por cima.
- `h1` dentro do painel competindo com o da tela.
- Fechar ao clicar fora descartando edição sem perguntar.
- Painel que só começa a abrir depois de os dados chegarem.
- Formulário de vinte campos dentro do painel.
- Fechar o painel e perder a posição de rolagem e os filtros da lista.

## Checklist

- [ ] Título `h2` com o nome do registro; `h1` da tela preservado.
- [ ] Leitura por padrão; primária só no modo de edição.
- [ ] Foco no título ao abrir e de volta à linha ao fechar; preso no modo sobreposto.
- [ ] Fechar com edição pendente pergunta antes.
- [ ] Registro aberto refletido na URL; lista intacta ao fechar.
- [ ] `item-removed` tratado; nenhum painel ou diálogo empilhado.
