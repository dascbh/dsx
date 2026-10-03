---
id: settings
title: Configurações
summary: Tela de ajustes persistentes de conta, módulo ou organização, agrupados em seções, com salvamento previsível e uma zona separada para ações de risco.
register: [operational, consumer]
when-to-use: SE a pessoa ajusta preferências ou parâmetros que valem daqui para frente, sem ordem obrigatória entre eles ENTÃO use configurações
avoid-when: os ajustes têm ordem e dependência (use assistente em etapas), são parte do trabalho diário sobre um registro (use o detalhe do registro) ou são um único interruptor (coloque-o junto do que ele afeta)
regions: [page-header, section-menu, section-body, section-footer, danger-zone]
primary-action: { region: section-footer, position: bottom-right, max: 1 }
states: [loading, unsaved-changes, saving, field-error, error, no-access, success]
patterns: [autosave-vs-save, required-fields, validation-timing, form-errors, destructive-action, confirm-action, disabled-button, success-confirmation, tabs, preserve-data-after-error, label-vs-placeholder]
variations: [save-per-section, save-on-change, top-tabs]
rules: [T1, T3, T4, T5, T6, T7, F5]
---

# Configurações

Dados da organização, membros e papéis, integrações, régua de cobrança, preferências de notificação. A pessoa visita pouco, com um objetivo específico, e precisa achar a seção rápido, entender o efeito de cada ajuste e ter certeza de que salvou. Ações irreversíveis (excluir organização, revogar integração) moram longe dos ajustes comuns.

## Quando usar

- **SE** há mais de ~3 grupos de ajustes **ENTÃO** use `section-menu` à esquerda (ou `top-tabs` com até 5 grupos); uma seção por vez.
- **SE** os ajustes da seção formam um conjunto que deve ser aplicado junto **ENTÃO** use `save-per-section` com rodapé e aviso de alterações não salvas.
- **SE** cada ajuste é independente e de efeito imediato e reversível (interruptores de preferência) **ENTÃO** use `save-on-change` com confirmação discreta por controle.
- **SE** um ajuste tem efeito amplo ou sobre terceiros (ligar cobrança automática, mudar papel de alguém) **ENTÃO** explique o efeito junto do controle e confirme antes de aplicar.
- **SE** a ação é destrutiva ou irreversível **ENTÃO** vai para a `danger-zone`, no fim da seção, com confirmação proporcional.
- **SENÃO** (um único ajuste) **ENTÃO** coloque-o junto do que ele afeta, sem tela própria.

## Mapa de regiões

```
┌──────────────────────────────────────────────────────────────┐
│ page-header  Configurações (h1)                                │
├──────────────────┬───────────────────────────────────────────┤
│ section-menu     │ section-body  Organização (h2)             │
│ ▌Organização     │ Nome         [______________]              │
│  Membros         │ CNPJ         [______________]              │
│  Integrações     │ Fuso horário [America/Sao_Paulo ▾]         │
│  Notificações    │ ───────────────────────────────────────── │
│                  │ section-footer  Alterações não salvas      │
│                  │                   [Descartar] [Salvar alt.]│
│                  │ ───────────────────────────────────────── │
│                  │ danger-zone  Excluir organização […]       │
└──────────────────┴───────────────────────────────────────────┘
```

## O que vai em cada região

- **page-header** — `h1` "Configurações" (ou "Configurações de <módulo>"); sem ações.
- **section-menu** — lista de seções com a atual marcada (`aria-current`); cada seção tem endereço próprio para ser linkada. Seções sem permissão não aparecem.
- **section-body** — título da seção (`h2`), uma frase de contexto, campos com rótulo visível e texto de ajuda que descreve o efeito ("Lembretes saem às 8h no fuso escolhido"). Grupos com subtítulo quando a seção é longa.
- **section-footer** — no modelo de salvar por seção: indicação de alterações pendentes, "Descartar alterações" e a primária "Salvar alterações". Fixo ao rolar quando a seção é longa.
- **danger-zone** — bloco separado visualmente no fim, com título claro, explicação da consequência e botão destrutivo com rótulo específico ("Excluir organização").

## Ações

- **Primária:** uma, no `section-footer`, bottom-right — "Salvar alterações", desabilitada enquanto nada mudou (com o motivo implícito pela ausência de pendência) ou enquanto houver erro de campo.
- **Descartar:** secundária, volta aos valores salvos.
- **Destrutivas:** só na `danger-zone`; irreversível pede confirmação que nomeia o alvo — digitar o nome para alvos de grande impacto.
- **Sair com pendência:** trocar de seção ou de página com alterações não salvas pergunta antes ("Sair sem salvar?").

## Estados

- **loading** — esqueleto dos campos; menu já navegável.
- **unsaved-changes** — aviso no rodapé ("Você tem alterações não salvas") e primária habilitada; ao tentar sair, confirmação.
- **saving** — primária com indicador, campos bloqueados.
- **field-error** — erro junto ao campo, em texto; foco no primeiro campo com erro ao tentar salvar.
- **error** — falha ao salvar: alerta na seção, valores digitados preservados, "Tentar novamente".
- **no-access** — sem papel para alterar: campos em leitura com explicação ("Só administradores alteram estes dados"); seção inteira restrita não aparece no menu.
- **success** — "Alterações salvas" breve; rodapé volta ao estado sem pendência.

## Variações

### save-per-section
Rodapé com "Salvar alterações" por seção.
**Favorece:** ajustes interdependentes, validação conjunta, efeito controlado.
**Piora:** risco de sair sem salvar — exige aviso de pendência e confirmação ao sair.

### save-on-change
Cada controle aplica na hora, com confirmação por controle ("Salvo").
**Favorece:** preferências independentes e reversíveis; menos passos.
**Piora:** inadequado para campos de texto que passam por estados inválidos; sem desfazer, erro de toque vira mudança real.

### top-tabs
Seções como abas horizontais abaixo do cabeçalho.
**Favorece:** até 5 seções curtas; telas sem espaço lateral.
**Piora:** não escala; nomes longos quebram; aba com pendência não salva precisa de marcação.

## Anti-padrões

- Misturar campos que salvam sozinhos com campos que exigem "Salvar" na mesma seção.
- "Excluir organização" ao lado de "Salvar alterações".
- Texto de ajuda que repete o rótulo em vez de dizer o efeito.
- Perder alterações ao trocar de seção sem aviso.
- Interruptor que dispara ação irreversível sem confirmação.
- Seção restrita visível e toda desabilitada sem explicação.

## Checklist

- [ ] Um modelo de salvamento por seção, declarado e coerente.
- [ ] Uma primária no rodapé da seção; destrutivas só na zona de risco, com rótulo específico.
- [ ] Rótulos visíveis e ajuda que descreve o efeito.
- [ ] Aviso e confirmação ao sair com alterações pendentes.
- [ ] Seção atual marcada e com endereço próprio.
- [ ] Erro de salvamento preserva o que foi digitado.
