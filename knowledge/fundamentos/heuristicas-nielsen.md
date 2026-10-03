# Heurísticas de Nielsen

> **Quando consultar**
> - Ao revisar qualquer tela, fluxo ou componente e precisar nomear *por que* algo atrapalha o uso.
> - Ao classificar a gravidade de um achado (escala 0–4) antes de propor prioridade.
> - Ao gerar um relatório de avaliação heurística (o processo está em [avaliacao-de-usabilidade.md](avaliacao-de-usabilidade.md)).
> - Ao projetar algo novo: use as perguntas de auditoria como checklist preventivo.

As dez heurísticas são princípios amplos de usabilidade, não regras binárias. Uma violação é um **sinal para investigar no contexto**, não prova de falha. Separe sempre o que é observável (evidência) do que é interpretação (problema potencial).

---

## Escala de severidade (0–4)

Avalie cada achado por três fatores e combine-os:

| Fator | Pergunta | Baixo | Alto |
|---|---|---|---|
| **Frequência** | Quantas pessoas vão esbarrar nisso? | Caso raro, perfil específico | Todo mundo que passa pelo fluxo |
| **Impacto** | Quão difícil é superar quando acontece? | Pequena hesitação | Bloqueio, erro, perda de dados ou dinheiro |
| **Persistência** | A pessoa aprende a contornar ou tropeça toda vez? | Superado uma vez, fica resolvido | Repete a cada uso |

| Nível | Nome | Critério operacional | Ação |
|---|---|---|---|
| 0 | Não é problema | Nenhum dos três fatores é relevante | Descartar ou registrar como nota |
| 1 | Cosmético | Baixo impacto, não atrasa a tarefa | Corrigir se houver folga |
| 2 | Menor | Atrasa ou confunde, mas a pessoa conclui | Prioridade baixa, entra no backlog |
| 3 | Grave | Alto impacto **ou** alta frequência com impacto médio; gera erro recorrente ou abandono | Alta prioridade, corrigir no ciclo atual |
| 4 | Catástrofe | Impede concluir a tarefa, causa perda irrecuperável ou dano financeiro | Bloqueia lançamento |

**Regras de uso**
- Atribua severidade **depois** de consolidar todos os achados, não durante a inspeção.
- SE o fluxo envolve dinheiro, dados pessoais, permissões, exclusão ou ação em massa ENTÃO suba a severidade um nível por padrão.
- SE há perda de dados irrecuperável ENTÃO severidade mínima 3.
- Severidade não é prioridade: um problema grave que afeta poucos, ou que depende de outra entrega, pode ser priorizado depois. Registre as duas coisas separadas.
- Severidade não é custo de negócio: uma fricção de nível 2 repetida milhões de vezes pode custar mais que um nível 4 raro. Quando houver dados, cite-os.

---

## H1. Visibilidade do status do sistema

**Princípio.** A interface informa, em tempo útil, o que está acontecendo depois de cada ação e onde a pessoa está.

**Sinais de violação**
- Botão que não muda de estado ao ser clicado; nada indica que o clique foi registrado.
- Spinner sem prazo nem explicação; operação "processando" sem desfecho.
- Porcentagem de progresso que não corresponde a trabalho real.
- Navegação sem marcar a seção ou o passo atual.

**Perguntas de auditoria**
- Após cada ação, dá para saber se está em andamento, concluída ou falhou?
- O estado exibido corresponde ao estado real do sistema (não à intenção)?
- Existe resposta perceptível em até 0,1 s para confirmar a interação? (limiares em [interacao-e-feedback.md](interacao-e-feedback.md))

**Correção típica.** Estados distintos para ocioso, carregando, sucesso e erro; "Passo 2 de 4"; toast após salvar. Ver [skeleton-vs-spinner](../../patterns/feedback/skeleton-vs-spinner.md), [long-loading](../../patterns/feedback/long-loading.md), [success-confirmation](../../patterns/feedback/success-confirmation.md), [progress-percentage](../../patterns/feedback/progress-percentage.md).

**Severidade típica.** 3 se a ação é financeira ou irreversível e não há confirmação; 2 em ações de baixo risco.

## H2. Correspondência entre o sistema e o mundo real

**Princípio.** Fale a língua do público e siga a ordem natural da tarefa, não a estrutura interna da empresa ou do banco de dados.

**Sinais de violação**
- Códigos técnicos expostos ("Erro 500", "403 Forbidden").
- Rótulos em inglês num produto em português ("Submit", "Dashboard" sem necessidade).
- Siglas internas, nomes de tabelas, jargão de time.
- Campos em ordem diferente da que a pessoa tem em mãos (ex.: documento físico).

**Perguntas de auditoria**
- Uma pessoa do público entende cada palavra e ícone sem treinamento?
- Algum termo veio do organograma ou do código em vez do uso?

**Correção típica.** Trocar termos pelo vocabulário observado em entrevistas, tickets e buscas; usar metáforas conhecidas (lixeira, lupa). Ver [technical-error-code](../../patterns/feedback/technical-error-code.md).

## H3. Controle e liberdade do usuário

**Princípio.** Toda situação aberta por engano tem uma saída clara e barata.

**Sinais de violação**
- Modal sem botão de fechar ou que ignora Esc.
- Formulário longo que perde tudo ao sair da página.
- Exclusão sem desfazer nem período de recuperação.
- Fluxo sem "Voltar" ou com "Cancelar" escondido.

**Perguntas de auditoria**
- Em cada passo reversível, é possível cancelar, voltar e desfazer?
- O que acontece com os dados digitados se a pessoa sair?

**Correção típica.** Desfazer por alguns segundos, rascunho automático, lixeira. Ver [desfazer](../../patterns/actions/undo.md), [close-modal](../../patterns/modals/close-modal.md), [autosave-vs-save](../../patterns/forms/autosave-vs-save.md).

**Severidade típica.** 3–4 quando há perda irrecuperável.

## H4. Consistência e padrões

**Princípio.** Mesmo conceito, mesma palavra, mesmo visual, mesmo comportamento (consistência interna) e respeito às convenções da plataforma (consistência externa; Lei de Jakob: as pessoas passam a maior parte do tempo em outros produtos).

**Sinais de violação**
- "Salvar" numa tela e "Confirmar" noutra para a mesma ação.
- Botão primário que muda de lado entre telas.
- Regras de validação diferentes para o mesmo dado.
- Componentes visualmente parecidos com comportamentos diferentes.

**Perguntas de auditoria**
- Ações equivalentes têm nome, aparência e posição iguais?
- O produto segue padrões do sistema operacional e do setor onde o público já tem hábito?

**Correção típica.** Glossário único, componentes do design system, regra fixa de posição de ações. Ver [action-placement](../../patterns/actions/action-placement.md), [button-hierarchy](../../patterns/actions/button-hierarchy.md).

**Atenção.** Um design system aumenta a consistência, mas não garante usabilidade: o mesmo componente pode funcionar num fluxo e falhar noutro.

## H5. Prevenção de erros

**Princípio.** Evite que o erro aconteça em vez de depender de mensagem depois.

Distinga dois tipos:
- **Deslize** (a pessoa sabe o que quer e executa errado): previna com restrições, máscaras, alvos bem espaçados.
- **Engano** (a decisão em si é errada por falta de informação): previna com clareza de consequência e bons padrões.

**Sinais de violação**
- "Excluir" ao lado de "Salvar", mesmo tamanho e cor.
- Campo de data sem formato indicado.
- Ação destrutiva de um clique sem confirmação nem desfazer.
- Confirmação genérica ("Tem certeza?") que a pessoa aprende a ignorar.

**Perguntas de auditoria**
- Quais são as ações de maior consequência e o que impede o erro nelas?
- A confirmação nomeia o que será perdido e o botão usa o verbo da ação?

**Correção típica.** Máscara e exemplo de formato; separar ações opostas; confirmação que descreve a consequência. Ver [destructive-action](../../patterns/actions/destructive-action.md), [confirm-deletion](../../patterns/actions/confirm-deletion.md), [confirm-action](../../patterns/actions/confirm-action.md), [double-submit](../../patterns/actions/double-submit.md).

## H6. Reconhecimento em vez de memorização

**Princípio.** Deixe opções e informações visíveis ou fáceis de recuperar; reconhecer custa menos que lembrar.

**Sinais de violação**
- Exigir que a pessoa digite um código lembrado de outra tela.
- Ícones sem rótulo para ações pouco frequentes.
- Modal que esconde o dado necessário para decidir.
- Navegação que não mostra onde a pessoa está.

**Perguntas de auditoria**
- A pessoa precisa lembrar algo de outra tela para concluir esta?
- Os ícones são compreensíveis sem passar o mouse?

**Correção típica.** Rótulos visíveis, itens recentes, resumo do passo anterior, breadcrumbs. Ver [breadcrumbs](../../patterns/navigation/breadcrumbs.md), [icon-only-button](../../patterns/actions/icon-only-button.md), [icon-and-text-button](../../patterns/actions/icon-and-text-button.md).

## H7. Flexibilidade e eficiência de uso

**Princípio.** Simples para quem começa, rápido para quem é experiente, sem que os aceleradores atrapalhem o iniciante.

**Sinais de violação**
- Ferramenta de uso diário sem atalhos nem ações em massa.
- Opções avançadas misturadas com as básicas.
- Nenhuma forma de salvar filtros ou preferências.

**Perguntas de auditoria**
- Tarefas frequentes têm caminho curto?
- O iniciante consegue ignorar os aceleradores sem prejuízo?

**Correção típica.** Atalhos documentados, paleta de comandos, filtros salvos, revelação progressiva, [autopreenchimento](../../patterns/forms/autofill.md).

## H8. Design estético e minimalista

**Princípio.** Cada elemento justifica sua presença pelo que comunica. Minimalismo é ausência de ruído, não ausência de conteúdo necessário.

**Sinais de violação**
- Painel com muitos gráficos de mesmo peso, sem prioridade.
- Vários sobrepostos simultâneos (cookies + newsletter + chat).
- Texto denso em onboarding; decoração competindo com a ação principal.

**Perguntas de auditoria**
- Para cada elemento: ajuda a concluir o objetivo desta tela?
- O que compete visualmente com a ação principal?

**Correção típica.** Um objetivo por tela, hierarquia clara (ver [hierarquia-visual.md](hierarquia-visual.md)), remover antes de adicionar.

## H9. Ajudar a reconhecer, diagnosticar e corrigir erros

**Princípio.** A mensagem diz o que houve, onde e como resolver, em linguagem simples, junto do problema, sem culpar a pessoa.

**Fórmula.** `[o que aconteceu] + [onde / por quê] + [o que fazer agora]`.

**Sinais de violação**
- "Algo deu errado" sem próximo passo.
- Todos os erros no topo sem apontar o campo.
- Formulário apagado após falha.
- Erro indicado só por cor.
- Validação disparada a cada tecla.

**Perguntas de auditoria**
- O problema e o campo afetado são identificáveis? Há próximo passo?
- O erro é perceptível sem cor? O foco vai para um lugar previsível?
- Os dados digitados foram preservados?

**Exemplos de correção**

| Antes | Depois |
|---|---|
| Obrigatório | Informe seu nome |
| Entrada inválida | Use o formato dd/mm/aaaa |
| Erro no envio | O arquivo tem mais de 10 MB. Escolha um menor e envie de novo. |

Ver [helpful-error-message](../../patterns/ux-writing/helpful-error-message.md), [form-errors](../../patterns/forms/form-errors.md), [preserve-data-after-error](../../patterns/forms/preserve-data-after-error.md), [not-color-alone](../../patterns/accessibility/not-color-alone.md), [retry](../../patterns/feedback/retry.md).

**Exceção consciente.** Em login, não revelar se o e-mail existe pode ser decisão de segurança. Deve ser deliberada e documentada, nunca acidental.

## H10. Ajuda e documentação

**Princípio.** O ideal é não precisar de ajuda; quando precisar, ela está perto da tarefa, é pesquisável e orientada a passos.

**Sinais de violação**
- Ajuda só em PDF ou central sem busca.
- Tutorial que aparece uma vez e não pode ser revisto.
- Nenhuma ajuda contextual em campos complexos.

**Perguntas de auditoria**
- Quando a pessoa trava, onde está a ajuda e ela responde à tarefa?

**Correção típica.** Texto de apoio no campo, estados vazios explicativos ([empty-state](../../patterns/feedback/empty-state.md)), artigos por tarefa, histórico de novidades.

---

## Onde focar quando o tempo é curto

| Contexto | Heurísticas prioritárias |
|---|---|
| Ações assíncronas (envio, upload, pagamento) | H1, H9 |
| Formulários | H5, H9, H6 |
| Ações destrutivas | H3, H5 |
| Produto complexo ou técnico | H2, H6, H4 |
| Produto que cresceu rápido | H4 |
| Fluxos de alta frequência | H7 |
| Primeiro uso | H6, H2, H10 |

SE o tempo permite um só fluxo ENTÃO comece pelo de maior consequência: checkout, pagamento, permissões, exclusão, operações em massa.

## Extensões para produtos com IA

As dez continuam válidas, mas não cobrem resultados probabilísticos e comportamento adaptativo. Acrescente:
- Comunicar o que o sistema sabe e não sabe fazer ([ai-uncertainty](../../patterns/ai/ai-uncertainty.md)).
- Distinguir respostas de baixa confiança e mostrar fontes ([ai-sources](../../patterns/ai/ai-sources.md)).
- Reforçar controle quando a IA age em nome da pessoa ([confirm-ai-action](../../patterns/ai/confirm-ai-action.md)).
- Permitir revisar, corrigir e desfazer o que a IA fez ([review-ai-output](../../patterns/ai/review-ai-output.md), [ai-error-recovery](../../patterns/ai/ai-error-recovery.md)).
- Avisar quando o comportamento do sistema mudou.

## Heurística não é acessibilidade

Cumprir uma heurística não demonstra conformidade com WCAG, e o contrário também vale. Use heurísticas para compreensão, controle e erro; use auditoria específica (WCAG 2.2, ABNT NBR 17225) para semântica, texto alternativo, contraste, teclado, foco e nomes acessíveis.

---

## Checklist de auditoria

- [ ] Cada ação tem resposta visível e fiel ao estado real (H1).
- [ ] Vocabulário do público, sem códigos técnicos nem siglas internas (H2).
- [ ] Cancelar, voltar, fechar e desfazer disponíveis onde a ação é reversível (H3).
- [ ] Mesmo conceito com mesmo nome, visual, posição e comportamento (H4).
- [ ] Ações destrutivas separadas, confirmadas com consequência nomeada ou com desfazer (H5).
- [ ] Nada precisa ser memorizado de outra tela; ícones de ação rara têm rótulo (H6).
- [ ] Tarefas frequentes têm atalho sem prejudicar iniciantes (H7).
- [ ] Nenhum elemento sem função compete com a ação principal (H8).
- [ ] Erros seguem a fórmula o quê + onde + como resolver, sem culpa, sem depender de cor, preservando dados (H9).
- [ ] Ajuda contextual existe onde a tarefa é complexa (H10).
- [ ] Severidade atribuída após consolidação, com frequência, impacto e persistência explicitados.
- [ ] Fluxos de dinheiro, dados, permissões e exclusão receberam +1 de severidade.
