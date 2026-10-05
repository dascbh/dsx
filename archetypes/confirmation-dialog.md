---
id: confirmation-dialog
title: Diálogo de confirmação
summary: Interrupção curta que pede uma decisão explícita antes de uma ação de consequência séria, dizendo o que vai acontecer e com o quê.
register: [operational, consumer]
when-to-use: SE a ação é irreversível, afeta outras pessoas ou tem custo alto e não pode ser desfeita depois ENTÃO use diálogo de confirmação
avoid-when: a ação é reversível (ofereça desfazer), é frequente e de baixo risco ou a confirmação seria só um hábito de clicar em sim
regions: [dialog-header, dialog-body, dialog-footer]
primary-action: { region: dialog-footer, position: bottom-right, max: 1 }
states: [open, running, error, success]
patterns: [confirm-action, confirm-deletion, destructive-action, undo, button-text, close-modal, keyboard-focus, button-hierarchy, double-submit, confirm-ai-action, when-to-use-modal]
variations: [simple-confirmation, type-to-confirm, undo-instead-of-confirm, confirmation-with-consequences]
rules: [T1, T2, T5, T6, T7, F4]
---

# Diálogo de confirmação

"Excluir projeto", "Enviar 12 pedidos aos fornecedores", "Revogar acesso de Ana", "Aplicar sugestões do agente a 300 itens". Confirmação existe para dar uma última chance consciente — e só funciona se for rara. Confirmar tudo treina a pessoa a clicar sem ler, e a confirmação que importava passa batida.

## Quando usar

- **SE** a ação não pode ser desfeita (exclusão definitiva, envio a terceiros, cobrança) **ENTÃO** use diálogo de confirmação.
- **SE** a ação pode ser desfeita **ENTÃO** não confirme: execute e ofereça desfazer (variação `undo-instead-of-confirm`).
- **SE** o alvo é de grande impacto (organização inteira, projeto com dados de muitas pessoas) **ENTÃO** use `type-to-confirm`.
- **SE** a ação afeta vários itens ou tem efeitos colaterais **ENTÃO** use `confirmation-with-consequences`, com contagem e exemplos.
- **SE** a ação foi proposta por um agente de IA **ENTÃO** a confirmação mostra exatamente o que será feito e em quais itens, e a pessoa decide; nunca execute por padrão.
- **SENÃO** (ação comum e de baixo risco) **ENTÃO** execute direto com feedback.

## Mapa de regiões

```
┌──────────────────────────────────────────┐
│ dialog-header                             │
│  Excluir o projeto "Aquisição Beta"? (h2) │
├──────────────────────────────────────────┤
│ dialog-body                               │
│  Os 48 documentos e o checklist serão     │
│  excluídos. Esta ação não pode ser        │
│  desfeita.                                │
├──────────────────────────────────────────┤
│ dialog-footer  [Cancelar] [Excluir        │
│                                 projeto]  │
└──────────────────────────────────────────┘
```

## O que vai em cada região

- **dialog-header** — pergunta com o verbo e o alvo nomeado ("Excluir o projeto Aquisição Beta?"), nunca "Tem certeza?" ou "Atenção".
- **dialog-body** — consequência concreta em uma ou duas frases: o que some, quem é afetado, se pode ser desfeito; quando houver, o campo de digitar o nome, com rótulo visível.
- **dialog-footer** — "Cancelar" antes da ação, na ordem do produto; a ação repete o verbo e o objeto ("Excluir projeto") e usa o estilo destrutivo quando apaga ou revoga.

## Ações

- **Primária:** uma, no `dialog-footer`, bottom-right — o próprio verbo da ação com objeto; destrutiva com estilo de perigo. Nunca "Confirmar", "Sim" ou "OK".
- **Foco inicial:** em "Cancelar" (ou no campo de digitar) quando a ação é destrutiva; Enter não deve executar a destrutiva por acidente.
- **Cancelar / Esc / ✕:** fecham sem efeito e devolvem o foco ao controle de origem.
- **Execução:** bloqueia clique duplo; o diálogo só fecha depois do resultado.

## Estados

- **open** — pergunta, consequência e ações; na variação de digitar, a ação fica desabilitada até o texto conferir, com a regra dita no rótulo.
- **running** — ação com indicador, ambos os botões bloqueados; para lotes longos, progresso.
- **error** — falha: mensagem no corpo dizendo o que não aconteceu (e, em lote, quantos itens foram e quantos não), opção de tentar de novo.
- **success** — diálogo fecha, confirmação breve na tela de origem com o resultado ("Projeto excluído"); em lote, resumo com contagem.

## Variações

### simple-confirmation
Pergunta, consequência, Cancelar e ação.
**Favorece:** irreversíveis de alvo único e impacto moderado.
**Piora:** se usada para tudo, vira clique automático.

### type-to-confirm
A pessoa digita o nome do alvo para habilitar a ação.
**Favorece:** alvos de grande impacto; impede confirmação por reflexo.
**Piora:** atrito alto; usada em ações comuns, irrita e é contornada com copiar e colar.

### undo-instead-of-confirm
Sem diálogo: a ação executa e uma notificação oferece "Desfazer" por alguns segundos.
**Favorece:** ações reversíveis e frequentes (arquivar, mover); fluxo sem interrupção.
**Piora:** exige que o sistema realmente consiga desfazer; a notificação precisa durar o bastante e ser alcançável por teclado.

### confirmation-with-consequences
Corpo com contagem, lista resumida dos itens afetados (os primeiros e "mais N") e efeitos colaterais.
**Favorece:** ações em lote e propostas de agente; a pessoa vê o alcance real.
**Piora:** diálogo maior; lista longa precisa de rolagem própria e resumo no topo.

## Anti-padrões

- "Tem certeza?" com botões "Sim" e "Não".
- Confirmação para ação reversível e frequente.
- Foco inicial no botão destrutivo.
- Botão destrutivo com estilo de primária comum.
- Confirmação que não diz o que será perdido.
- Confirmação aberta sobre outro diálogo.
- Ação de agente executada antes de a pessoa ver o alcance.

## Checklist

- [ ] Usada só para irreversível, de alto custo ou que afeta terceiros.
- [ ] Título com verbo e alvo nomeado; corpo com a consequência concreta.
- [ ] Ação com verbo + objeto, estilo destrutivo quando apaga; nunca rótulo genérico.
- [ ] "Cancelar" antes da ação; foco inicial seguro.
- [ ] Execução protegida contra clique duplo; diálogo fecha só com o resultado.
- [ ] Em lote, contagem antes e resumo depois.
- [ ] Nenhum diálogo empilhado.
