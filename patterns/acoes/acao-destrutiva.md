---
id: acao-destrutiva
titulo: Como tratar ações destrutivas?
categoria: acoes
componentes: [botao, modal, snackbar]
tipo: decisao-contextual
impacto: alto
status: recomendado
evidencia: moderada
wcag: ["3.3.4", "2.4.3", "1.4.1", "2.1.2"]
relacionados: [confirmar-exclusao, desfazer, confirmar-acao, fechar-modal, hierarquia-de-botoes]
---

# Como tratar ações destrutivas?

> **Regra:** Ajuste a proteção ao impacto, à frequência e à reversibilidade: prefira Desfazer ou arquivar; reserve confirmação com rótulo específico para ações raras, amplas ou irreversíveis.

## Contexto

Ações destrutivas excluem dados, removem acesso, descartam alterações ou afetam outras pessoas. O objetivo não é confirmar todo clique, e sim dosar a fricção pelo custo de um erro.

Confirmar tudo gera fadiga e clique automático; não confirmar nada expõe a perdas permanentes. A decisão depende de quanto dano a ação causa, da frequência com que ocorre e de poder ser desfeita.

O critério WCAG 3.3.4 exige ao menos uma proteção (reversão, conferência ou confirmação) para ações que alteram ou excluem dados controláveis, sem impor modal universal.

## Decisão

- **SE** a ação é frequente, de baixo impacto e reversível **ENTÃO** execute de imediato e mostre feedback com "Desfazer".
- **SE** o item pode ser recuperado **ENTÃO** prefira arquivar, desativar ou enviar à lixeira.
- **SE** a ação é rara, irreversível ou de alto impacto **ENTÃO** confirme, explicando o que será afetado e se há recuperação.
- **SE** a exclusão é em massa ou tem dependências **ENTÃO** mostre quantidade, escopo e efeitos antes da decisão.
- **SE** o alcance é muito grande ou permanente **ENTÃO** considere exigir digitar o nome do objeto; **SENÃO** não exija texto.
- **SE** a confirmação usa modal **ENTÃO** rotule o botão final com verbo + objeto e dê destaque de perigo somente a ele, sem depender só de cor.
- **SE** a decisão é difícil de reverter **ENTÃO** inicie o foco no cancelamento ou na opção menos destrutiva.
- **SE** é remover vínculo (não apagar o recurso) **ENTÃO** use fricção menor e linguagem de "remover".
- **SENÃO** não interrompa o fluxo com diálogo.

## Quando usar

- Exclusão permanente e descarte sem recuperação.
- Remoção de acesso ou membros.
- Ações em massa ou que afetam terceiros.
- Mudanças difíceis de reverter.

## Quando evitar

- Ações rotineiras e reversíveis → **use em vez disso:** Desfazer.
- Modal apenas para informar → **use em vez disso:** mensagem inline ou toast.
- Confirmação genérica ou texto de consequência escondido → **use em vez disso:** título e botão específicos.
- Digitar frase para toda exclusão → **use em vez disso:** reservar a casos de grande alcance.

## Faça

- Nomeie ação e objeto no título e no botão.
- Explique a consequência de forma visível.
- Mantenha Cancelar claro e fácil de alcançar.
- Devolva o foco a um destino lógico ao fechar.

## Evite

- Rótulos "Sim", "OK", "Confirmar".
- Várias ações destrutivas competindo por destaque.
- Esconder o alcance da ação.
- Remover o caminho de recuperação quando existia.

## Acessibilidade

- Diálogo semântico com nome e descrição associados; fundo inerte (modal real).
- Foco entra no diálogo, Tab e Shift+Tab ficam contidos, Esc fecha quando adequado (WCAG 2.1.2, 2.4.3).
- Ao fechar, devolva o foco ao acionador; se ele sumiu, leve a destino lógico e estável.
- Risco comunicado por texto, não só cor, ícone ou posição (WCAG 1.4.1).

## Microcópia

| Situação | Exemplo |
|---|---|
| Botão final | "Excluir projeto" |
| Descarte | "Descartar alterações" |
| Cancelar | "Cancelar" ou "Continuar editando" |
| Consequência | "Esta ação não pode ser desfeita. Os 12 arquivos do projeto serão removidos." |
| Reversível | "Item excluído. Desfazer" |

## Checklist de verificação

- [ ] Impacto, alcance e reversibilidade foram definidos?
- [ ] Ações reversíveis usam Desfazer em vez de modal?
- [ ] O botão final traz verbo e objeto?
- [ ] A consequência está explícita?
- [ ] Só o comando destrutivo tem ênfase de perigo?
- [ ] Cancelar é claro e acessível?
- [ ] Exclusões em massa mostram o escopo?
- [ ] O foco entra, fica contido e retorna a destino lógico?
- [ ] A decisão funciona sem depender de cor?

## Fundamentação

- WCAG 2.2, 3.3.4 (Error Prevention): reversão, conferência ou confirmação para alterar ou excluir dados.
- W3C WAI-ARIA APG (Dialog Modal): foco, ciclo de teclado, retorno; início na opção menos destrutiva.
- Apple Human Interface Guidelines (Alerts): uso parcimonioso; confirmar só ações raras e irreversíveis.
- IBM Carbon (Modal Usage): variante de perigo, título e botão descrevem a ação.
- GitHub Primer (Delete e ConfirmationDialog): fricção proporcional ao custo do erro; foco inicial no cancelamento.
- GOV.UK Design System (Button): botão de aviso para consequências sérias; não depender só da cor.
