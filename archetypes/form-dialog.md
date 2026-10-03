---
id: form-dialog
title: Diálogo de formulário
summary: Janela modal curta que coleta poucos dados para criar ou alterar algo sem tirar a pessoa da tela em que ela está.
register: [operational, consumer]
when-to-use: SE a tarefa pede poucos campos, nasce de uma tela e deve voltar a ela ao terminar ENTÃO use diálogo de formulário
avoid-when: há mais de ~6 campos ou seções, a pessoa precisa consultar a tela de trás para preencher, o preenchimento leva minutos ou abriria outro diálogo por cima
regions: [dialog-header, dialog-body, dialog-footer]
primary-action: { region: dialog-footer, position: bottom-right, max: 1 }
states: [open, field-error, submitting, error, success]
patterns: [when-to-use-modal, when-to-avoid-modal, close-modal, label-vs-placeholder, required-fields, validation-timing, error-placement, preserve-data-after-error, double-submit, action-placement, keyboard-focus, field-order]
variations: [short-dialog, sectioned-dialog, promote-to-page]
rules: [T1, T2, T4, T6, T7, F4]
---

# Diálogo de formulário

"Novo membro", "Renomear documento", "Adicionar destinatário", "Registrar envio": tarefas de um minuto que nascem numa lista ou num detalhe e devem devolver a pessoa ao mesmo lugar, com o resultado à vista. O diálogo segura a atenção na tarefa curta; quando a tarefa cresce, ele vira armadilha.

## Quando usar

- **SE** a tarefa tem até ~6 campos e uma decisão **ENTÃO** use diálogo de formulário.
- **SE** a pessoa precisa olhar dados da tela de trás para preencher **ENTÃO** use `detail-side-panel` (não bloqueia o fundo) ou formulário de página.
- **SE** o formulário precisa abrir outro diálogo (escolher um item, criar algo auxiliar) **ENTÃO** resolva dentro do mesmo diálogo (campo de busca, troca de conteúdo com "voltar") ou promova a página; nunca empilhe diálogos.
- **SE** o preenchimento pode levar minutos ou ter rascunho **ENTÃO** use `promote-to-page` ou `step-wizard`.
- **SENÃO** (só confirmar uma ação, sem dados) **ENTÃO** é `confirmation-dialog`.

## Mapa de regiões

```
┌──────────────────────────────────────────┐
│ dialog-header  Novo membro (h2)  ✕        │
├──────────────────────────────────────────┤
│ dialog-body                               │
│  Frase curta de contexto (opcional)       │
│  Nome *        [____________________]     │
│  E-mail *      [____________________]     │
│  Papel         [Membro            ▾]      │
│                texto de ajuda             │
├──────────────────────────────────────────┤
│ dialog-footer   [Cancelar] [Adicionar     │
│                                  membro]  │
└──────────────────────────────────────────┘
```

## O que vai em cada região

- **dialog-header** — título com verbo + objeto ("Adicionar membro"), ligado ao diálogo como nome acessível; botão fechar (✕) com nome acessível.
- **dialog-body** — no máximo uma frase de contexto; campos em uma coluna, rótulo visível acima de cada campo, obrigatórios marcados conforme a política do produto, ajuda curta abaixo. Erro de sistema aparece no topo do corpo, não em toast.
- **dialog-footer** — "Cancelar" (secundária) antes da primária, na ordem declarada pelo produto; a primária repete o verbo do título.

## Ações

- **Primária:** uma, no `dialog-footer`, bottom-right, com rótulo verbo + objeto; Enter num campo de linha única envia.
- **Cancelar / fechar / Esc / clique fora:** fecham sem efeito; se houver dados digitados, perguntam antes de descartar (ou o clique fora não fecha).
- **Foco:** ao abrir, vai para o primeiro campo; preso no diálogo enquanto aberto; ao fechar, volta para o controle que abriu.
- **Envio:** bloqueia clique duplo; o diálogo só fecha depois da resposta de sucesso.

## Estados

- **open** — campos vazios ou com valores atuais (edição); primária habilitada (valide no envio e ao sair do campo, não desabilite sem motivo visível).
- **field-error** — mensagem junto ao campo, em texto; foco no primeiro campo com erro; diálogo continua aberto.
- **submitting** — primária com indicador, campos e fechamento bloqueados.
- **error** — falha do sistema: alerta no topo do corpo, dados preservados, primária disponível para tentar de novo.
- **success** — diálogo fecha, confirmação breve na tela de origem e o item criado/alterado aparece destacado nela.

## Variações

### short-dialog
Até 3 campos, largura pequena.
**Favorece:** renomear, adicionar um item, ajustes pontuais; tarefa em segundos.
**Piora:** nada, enquanto a tarefa caber; a tentação é ir enchendo de campos.

### sectioned-dialog
4–6 campos agrupados por subtítulos, largura média, corpo com rolagem própria e rodapé fixo.
**Favorece:** criação de um registro com dados básicos sem sair da lista.
**Piora:** aproxima-se do limite; rolagem dentro de diálogo esconde campos e erros — garanta que o erro role até o campo.

### promote-to-page
O mesmo formulário vira página própria com retorno à tela de origem.
**Favorece:** formulários longos, consulta a outras telas, rascunho, URL compartilhável.
**Piora:** perde o contexto visual da tela de origem; exige caminho de volta e destaque do resultado ao voltar.

## Anti-padrões

- Diálogo que abre outro diálogo.
- Título "Atenção" ou "Formulário" e primária "OK".
- Placeholder no lugar do rótulo.
- Fechar o diálogo antes da resposta do servidor e mostrar erro depois, já sem os dados.
- Clique fora que descarta um formulário preenchido sem perguntar.
- Erro de sistema em toast atrás do diálogo.

## Checklist

- [ ] Título com verbo + objeto, ligado como nome acessível do diálogo.
- [ ] Até ~6 campos, rótulo visível, uma coluna.
- [ ] Uma primária; "Cancelar" antes dela na ordem do produto.
- [ ] Foco inicial no primeiro campo, preso no diálogo, devolvido ao fechar.
- [ ] Fechar com dados pergunta antes de descartar.
- [ ] Erros no campo; erro de sistema no corpo; dados preservados.
- [ ] Nenhum diálogo empilhado.
