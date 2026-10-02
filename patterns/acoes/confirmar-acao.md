---
id: confirmar-acao
titulo: Quando pedir confirmação antes de uma ação?
categoria: acoes
componentes: [modal-de-confirmacao, toast, etapa-de-revisao]
tipo: decisao-contextual
impacto: critico
status: usar-com-cautela
evidencia: forte
wcag: ["3.3.4", "2.1.1", "2.4.3", "1.4.1"]
relacionados: [desfazer, confirmar-exclusao, acao-destrutiva, quando-usar-modal]
---

# Quando pedir confirmação antes de uma ação?

> **Regra:** Só peça confirmação para ação irreversível ou de alto custo; em ações rotineiras e recuperáveis, execute e ofereça "Desfazer".

## Contexto

Cada confirmação insere uma pausa entre a intenção e o resultado. A pausa previne erros graves, mas atrapalha a tarefa e, se for frequente, ensina a pessoa a clicar sem ler.

O nome da ação não decide nada: "excluir", "enviar" e "alterar" podem ser triviais ou graves. O que decide é a reversibilidade, o alcance, a previsibilidade da consequência e o custo do engano.

O esforço deve acompanhar o risco. Um ritual aplicado a toda exclusão gasta a atenção da pessoa justamente nos momentos em que ela mais precisa dela.

## Decisão

- **SE** a ação é rotineira e reversível **ENTÃO** execute de imediato e ofereça "Desfazer" por tempo suficiente.
- **SE** a ação é simples, imediata e de alto risco (exclusão permanente, remoção de acesso) **ENTÃO** use um diálogo curto de confirmação.
- **SE** a ação envolve compra, contrato, transferência ou envio com vários dados importantes **ENTÃO** use uma etapa de revisão com possibilidade de corrigir antes de concluir.
- **SE** a ação é irreversível e de grande alcance (muitos itens, muitas pessoas, recurso crítico) **ENTÃO** use confirmação reforçada, como digitar o nome do recurso.
- **SE** a consequência já é óbvia e recuperável **ENTÃO** não confirme.
- **SE** o rótulo do botão é ambíguo **ENTÃO** corrija o rótulo em vez de compensar com um diálogo.
- **SENÃO** não adicione confirmação; salvar e editar nunca devem exigir uma.

Antes de decidir, pese quatro fatores: se é possível desfazer, se o dano potencial é alto, se a consequência é esperada e quantos dados ou pessoas serão atingidos.

## Quando usar

- Antes de ação irreversível ou com perda significativa.
- Em compromissos legais ou financeiros.
- Ao excluir muitos itens ou usuários.
- Ao remover acesso, propriedade ou permissões.
- Antes de publicar ou enviar para muitas pessoas.
- Quando a consequência não é evidente pelo contexto.

## Quando evitar

- Ações rotineiras e reversíveis → **use em vez disso:** execução imediata com "Desfazer".
- Após todo salvamento ou pequena edição → **use em vez disso:** salvar sem interrupção e confirmar o resultado.
- Repetir uma decisão que a pessoa já revisou → **use em vez disso:** seguir direto.
- Aviso meramente informativo → **use em vez disso:** mensagem inline ou toast.

## Faça

- Nomeie a ação e o objeto no título ("Excluir projeto?").
- Explique a consequência e diga se há recuperação.
- Exiba a quantidade, o destino ou o alcance quando isso alterar a decisão.
- Repita o verbo específico no botão de confirmação.
- Mantenha "Cancelar" visível como saída segura.
- Confirme o resultado depois da ação.

## Evite

- Perguntar "Tem certeza?".
- Usar "Sim", "Não" ou "OK" como rótulos.
- Empilhar diálogos em sequência.
- Depender só da cor vermelha para sinalizar o risco.
- Exigir digitação quando o risco não justifica.
- Remover a saída segura.

## Acessibilidade

- Implemente como diálogo modal com nome e descrição programáticos (aria-labelledby e aria-describedby).
- Ao abrir, mova o foco para dentro, torne o fundo inerte e mantenha o teclado no modal.
- Em ações perigosas, coloque o foco inicial na opção segura e não faça do botão destrutivo o padrão da tecla Enter.
- Escape equivale a cancelar.
- Ao fechar, devolva o foco ao controle de origem ou a outro ponto lógico se ele deixou de existir.
- Não use só cor, ícone ou posição como sinal de risco (1.4.1).
- Transações financeiras, legais e alterações de dados devem ser reversíveis, verificadas ou confirmáveis (3.3.4).
- Teste com teclado, leitor de tela, zoom e diferentes tamanhos de texto.

## Microcópia

| Situação | Exemplo |
|---|---|
| Título de exclusão | "Excluir o projeto Orçamento 2026?" |
| Consequência | "Os 14 arquivos serão apagados e não poderão ser recuperados." |
| Botão destrutivo | "Excluir projeto" |
| Saída segura | "Cancelar" |
| Ação reversível | "Tarefa arquivada. Desfazer" |
| Remoção de acesso | "Remover o acesso de Ana Lima?" |

## Checklist de verificação

- [ ] A ação não pode ser resolvida apenas com "Desfazer".
- [ ] O título nomeia a ação e o objeto.
- [ ] A mensagem descreve a consequência e informa se há recuperação.
- [ ] O botão de confirmação repete o verbo da ação.
- [ ] "Cancelar" está visível.
- [ ] O foco inicial está na opção segura.
- [ ] Escape cancela o diálogo.
- [ ] O foco retorna a um ponto lógico ao fechar.
- [ ] O risco não é comunicado só por cor.
- [ ] Salvar e editar não disparam confirmação.

## Fundamentação

- Nielsen Norman Group, prevenção de erros: eliminar condições propensas a erro ou confirmar antes do comprometimento, priorizando erros de alto custo.
- Nielsen Norman Group, controle e liberdade do usuário: saídas claras, cancelamento e desfazer.
- WCAG 2.2, critério 3.3.4 e técnica G168: reversão, verificação ou confirmação em transações importantes, sem exigir confirmação em todo salvamento.
- Apple Human Interface Guidelines, alertas: reservar alertas a ações críticas e usar títulos e botões específicos.
- GitHub Primer, padrão de exclusão e diálogo de confirmação: atrito proporcional ao custo, foco inicial seguro, retorno de foco.
- IBM Carbon, modal de perigo: confirmação destrutiva com recurso identificado.
- Atlassian Design System e PatternFly, diretrizes de modal: confirmação que nomeia o registro e descreve o que será perdido.
