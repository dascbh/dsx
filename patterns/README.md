# Catálogo de padrões

77 padrões de interface com regra de decisão, critérios de uso, acessibilidade e checklist.
Gerado por `node tools/lint-patterns.mjs --index` — não edite à mão.

**Como um agente usa este catálogo:** encontre a decisão que você está tomando na tabela, leia a **Regra** e, se o caso não for trivial, abra o cartão e siga a seção **Decisão**. Antes de entregar, rode o **Checklist de verificação** do cartão.

Legenda de status: ✅ recommended (recomendado) · ⚠️ caution (usar com cautela) · ⛔ avoid (evitar)

## accessibility

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como indicar o foco de teclado?](accessibility/keyboard-focus.md) | Todo controle acionável por teclado deve mostrar indicador de foco visível, com contraste de pelo menos 3:1 frente às cores vizinhas, sem ficar coberto por elementos fixos. | high | ✅ |
| [Por que não usar apenas cor para comunicar erros?](accessibility/not-color-alone.md) | Cor reforça o estado, mas nunca é o único sinal: acompanhe-a de texto que diga o problema, perto do elemento afetado. | high | ✅ |
| [Qual deve ser o tamanho mínimo de um alvo de toque?](accessibility/touch-target.md) | Dimensione a área interativa, não o desenho: mínimo de 24 × 24 CSS px (piso AA) e 44–48 unidades para controles de toque, com espaço entre vizinhos. | high | ✅ |

## actions

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Botões devem ter ícone e texto?](actions/icon-and-text-button.md) | Use ícone mais texto quando a ação for pouco familiar, importante ou destrutiva; use só ícone apenas em ações muito conhecidas e compactas, sempre com nome acessível. | high | ⚠️ |
| [Como definir a hierarquia entre botão primário e secundário?](actions/button-hierarchy.md) | Em cada grupo de ações, dê a maior ênfase a uma única ação principal e trate as alternativas com ênfase menor, sempre visíveis e nunca diferenciadas só por cor. | medium | ✅ |
| [Como evitar cliques múltiplos durante o carregamento de uma ação?](actions/double-submit.md) | Valide primeiro; na primeira submissão válida, mostre o processamento no próprio botão, ignore novas ativações da mesma ação e garanta idempotência no servidor. | high | ✅ |
| [Como tratar ações destrutivas?](actions/destructive-action.md) | Ajuste a proteção ao impacto, à frequência e à reversibilidade: prefira Desfazer ou arquivar; reserve confirmação com rótulo específico para ações raras, amplas ou irreversíveis. | high | ✅ |
| [Esconder ou desabilitar uma ação indisponível?](actions/disabled-button.md) | Esconda a ação irrelevante; mantenha visível e explicada a ação central que está temporariamente bloqueada; nunca desabilite sem dizer por quê. | high | ⚠️ |
| [Link ou botão: qual usar?](actions/link-vs-button.md) | Se a pessoa é levada a outro lugar, use link (`<a href>`); se algo acontece no ponto em que ela está, use botão (`<button>`). Defina a semântica antes do visual. | high | ✅ |
| [Onde posicionar ações primárias e secundárias?](actions/action-placement.md) | Defina uma única ação principal pelo objetivo da tarefa, agrupe as alternativas ao lado dela com menor ênfase e mantenha a mesma posição em telas equivalentes. | medium | ✅ |
| [Quando oferecer a opção Desfazer?](actions/undo.md) | Ofereça "Desfazer" logo após uma ação reversível iniciada pela pessoa, com texto que diga o que mudou, e só se a reversão restaurar o estado completo. | medium | ✅ |
| [Quando pedir confirmação antes de excluir?](actions/confirm-deletion.md) | Peça confirmação só quando a exclusão for irreversível, ampla ou difícil de recuperar; nos demais casos, execute e ofereça "Desfazer". | high | ⚠️ |
| [Quando pedir confirmação antes de uma ação?](actions/confirm-action.md) | Só peça confirmação para ação irreversível ou de alto custo; em ações rotineiras e recuperáveis, execute e ofereça "Desfazer". | critical | ⚠️ |
| [Quando um botão pode ter só ícone, sem texto?](actions/icon-only-button.md) | Use ícone sozinho apenas para ações universalmente reconhecidas no contexto, sempre com nome acessível; se o ícone precisa de explicação, mantenha o rótulo visível. | high | ⚠️ |
| [Quando usar botão flutuante?](actions/floating-action-button.md) | Use botão flutuante somente para uma única ação primária, frequente e construtiva, sem cobrir conteúdo nem competir com a navegação. | medium | ⚠️ |

## ai

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como comunicar limites e incerteza de respostas de IA?](ai/ai-uncertainty.md) | Comunique a incerteza perto do resultado, com linguagem proporcional ao desempenho real e ligada a uma ação concreta (conferir, comparar, ver fontes, pedir revisão); mostre número de confiança só se for válido e compreensível. | high | ✅ |
| [Como deixar pessoas revisarem e editarem resultados gerados por IA?](ai/review-ai-output.md) | Apresente todo resultado de IA como proposta que a pessoa pode aceitar, editar, refinar, regenerar ou descartar antes que ele afete uma decisão, comunicação ou fluxo. | high | ✅ |
| [Como mostrar fontes e critérios nas respostas de IA?](ai/ai-sources.md) | Ligue cada afirmação relevante à fonte que a sustenta, deixe a fonte abrível e, em saídas de alto impacto, mostre também os critérios, dados e limites usados. | high | ✅ |
| [Como oferecer recuperação quando a IA falha?](ai/ai-error-recovery.md) | Identifique a etapa que falhou, explique a causa em linguagem simples, preserve o pedido e o trabalho, e ofereça ao menos uma ação de recuperação específica no mesmo contexto. | high | ✅ |
| [Como sinalizar que um conteúdo foi gerado por IA?](ai/label-ai-content.md) | Rotule com texto claro, junto ao conteúdo, tudo o que a IA gerou ou transformou de forma material, delimitando o escopo exato e sem sugerir revisão ou exatidão que não existem. | high | ✅ |
| [Quando pedir confirmação antes de uma ação executada pela IA?](ai/confirm-ai-action.md) | A IA prepara a ação sem executá-la; peça confirmação explícita imediatamente antes de qualquer efeito relevante, externo, destrutivo, financeiro ou difícil de reverter, mostrando alvo, escopo e consequência. | high | ✅ |

## authentication

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como comunicar sessão expirada?](authentication/session-expired.md) | Avise antes do vencimento com o tempo restante e uma ação "Continuar sessão"; depois do vencimento, explique o motivo, proteja dados sensíveis e leve à reautenticação com retorno ao contexto seguro. | critical | ✅ |
| [Como criar uma recuperação de senha clara?](authentication/password-recovery.md) | Disponibilize "Esqueci minha senha" perto do login, dê resposta neutra que não revele se a conta existe, envie link ou código de uso único com validade e descreva o passo seguinte e as alternativas. | critical | ✅ |
| [Como informar os requisitos de senha?](authentication/password-requirements.md) | Mostre os requisitos junto ao campo antes da digitação, priorize comprimento e bloqueio de senhas comuns em vez de regras de composição arbitrárias, e nunca impeça colar ou gerenciadores de senha. | critical | ✅ |
| [Mostrar ou ocultar senha: como deve funcionar?](authentication/show-password.md) | Oculte a senha por padrão e ofereça um botão opcional, com nome acessível, que alterna a visibilidade sem apagar o valor, mover o foco ou bloquear colar e gerenciadores de senha. | critical | ✅ |
| [Quando pedir confirmação de senha?](authentication/confirm-password.md) | Não repita o campo de senha por padrão; use um único campo com "mostrar senha" na criação e reautentique apenas antes de ações sensíveis. | critical | ⚠️ |

## content

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Por que evitar carrossel com rotação automática?](content/auto-advancing-carousel.md) | Não faça o carrossel girar sozinho; prefira controle manual ou seção estática e, se a rotação for inevitável, ofereça pausa visível e pare ao foco ou à interação. | high | ⛔ |
| [Quando usar carrossel?](content/carousel.md) | Use carrossel apenas para itens relacionados e de exploração opcional, com controle manual e sem esconder conteúdo essencial. | medium | ✅ |

## data

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como estruturar filtros de período em dashboards?](data/date-range-filter.md) | Exiba sempre, em texto, o intervalo ativo, o que ele controla, a data da última atualização dos dados e quais cards ficam fora do recorte. | high | ⚠️ |
| [Como ordenar dados em tabelas?](data/table-sorting.md) | Ofereça ordenação apenas em colunas com ordem significativa, mostre sempre a coluna e a direção ativas, ordene pelo valor real e exponha o estado via botão e `aria-sort`. | high | ✅ |
| [Como tornar tabelas responsivas no mobile?](data/responsive-table.md) | Escolha a adaptação pela tarefa: SE a pessoa compara colunas, mantenha a grade em contêiner com rolagem horizontal própria; SE consulta registros isolados, empilhe ou use lista, sempre preservando a relação cabeçalho-célula. | high | ✅ |
| [Quando usar e como configurar paginação em tabelas e listas?](data/table-pagination.md) | Pagine coleções grandes de ordem estável, mostrando a página atual, mantendo página, filtros e ordenação recuperáveis e nomeando todos os controles. | medium | ⚠️ |
| [Quando usar tabela em vez de cards?](data/table-vs-cards.md) | Use tabela quando a pessoa precisa comparar atributos entre itens; use cards para resumos independentes e conteúdo heterogêneo. | high | ✅ |

## ecommerce

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como alterar quantidade e remover itens no carrinho?](ecommerce/cart-edit-items.md) | Ofereça stepper (mais e menos) com campo numérico quando a faixa for ampla, atualize totais sem botão "Atualizar" e torne a remoção explícita e reversível. | high | ✅ |
| [Como aproveitar o CEP para completar o endereço no checkout?](ecommerce/address-by-postal-code.md) | Peça o CEP primeiro, consulte ao completar o valor, preencha só o que a fonte retornou e mantenha tudo revisável, editável e com fallback manual. | high | ✅ |
| [Como exibir variações de produto: tamanho, cor e disponibilidade?](ecommerce/product-variants.md) | Mostre cada dimensão de variação como grupo rotulado, recalcule a disponibilidade da combinação após cada escolha e atualize imagem, preço, estoque e compra. | high | ✅ |
| [Quando oferecer checkout como convidado?](ecommerce/guest-checkout.md) | Quando a conta não é essencial para concluir a compra, ofereça "Continuar como convidado" de forma explícita e destacada no início da seleção de conta, e proponha criar conta só depois da confirmação do pedido. | high | ✅ |

## feedback

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como comunicar falhas temporárias do sistema?](feedback/temporary-failure.md) | Informe o que falhou, diga se a operação foi concluída, está em andamento ou não aconteceu, guarde os dados e proponha uma só ação segura. | high | ✅ |
| [Como comunicar uma ação concluída com sucesso?](feedback/success-confirmation.md) | Confirme só o resultado real, nomeando a ação e o objeto, perto do contexto, com permanência proporcional ao impacto e sem roubar o foco. | high | ✅ |
| [Como criar bons estados vazios?](feedback/empty-state.md) | Identifique a causa do vazio, explique-a em título curto mais uma frase de contexto e ofereça uma única ação principal coerente com essa causa. | medium | ✅ |
| [Como tratar carregamentos que demoram muito?](feedback/long-loading.md) | Escolha o indicador pela duração e pelo tipo de espera: nada abaixo de 1 s, indeterminado de 1 a 3 s, progresso real acima de 3 s e, acima de 10 s, preserve a tarefa e ofereça continuar, cancelar ou acompanhar depois. | high | ✅ |
| [Erros técnicos devem mostrar códigos ao usuário?](feedback/technical-error-code.md) | Explique o impacto e o próximo passo primeiro; mostre um código apenas como referência secundária, rotulada e copiável, quando ele ajudar o suporte a localizar a ocorrência. | medium | ⚠️ |
| [Quando e como oferecer "Tentar novamente" após um erro?](feedback/retry.md) | Ofereça "Tentar novamente" só quando a causa for provavelmente temporária e a repetição for segura; preserve o estado, evite duplicidade e dê uma saída após poucas falhas. | medium | ✅ |
| [Quando mostrar porcentagem de progresso?](feedback/progress-percentage.md) | Mostre porcentagem apenas quando o total e o avanço forem medidos de verdade; sem medida confiável, use indicador indeterminado com rótulo. | medium | ✅ |
| [Quanto tempo uma notificação temporária deve permanecer?](feedback/toast-duration.md) | Notificação com ação, erro importante ou informação única nunca some sozinha; só mensagens curtas de baixo impacto podem desaparecer, começando em 4 a 10 segundos e ajustadas pelo tamanho do texto. | medium | ⚠️ |
| [Skeleton ou spinner: quando usar cada um?](feedback/skeleton-vs-spinner.md) | Skeleton para a carga inicial de conteúdo com formato conhecido; spinner inline para ações curtas; barra de progresso só quando houver medida real. | medium | ⚠️ |
| [Skeleton screen melhora a percepção de carregamento?](feedback/skeleton-screen.md) | Use skeleton quando a estrutura do conteúdo for previsível e a espera for perceptível; ele melhora a percepção, não o desempenho real. | medium | ⚠️ |
| [Toast, alerta ou mensagem inline: qual usar?](feedback/toast-vs-inline-alert.md) | Escolha o padrão pelo escopo da mensagem: toast para confirmação breve, inline para algo ligado a um elemento, alerta persistente para condição da página ou do serviço. | medium | ⚠️ |

## forms

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [A mensagem de erro vai antes ou depois do campo?](forms/field-error-position.md) | Coloque a mensagem na mesma unidade visual do rótulo e do campo, em posição consistente e ligada programaticamente ao controle; após o envio, repita-a em um resumo no topo. | high | ✅ |
| [Autosave ou botão Salvar?](forms/autosave-vs-save.md) | Use autosave só para mudanças independentes, de baixo risco e reversíveis, sempre com estado de salvamento visível; use botão explícito quando houver revisão, transação ou efeito externo. | high | ⚠️ |
| [Como definir a sequência dos campos em um formulário?](forms/field-order.md) | Ordene os campos pela tarefa da pessoa, não pelo banco de dados, e faça ordem visual, ordem do HTML e ordem do Tab seguirem a mesma lógica. | high | ✅ |
| [Como estruturar etapas em formulários longos?](forms/form-steps.md) | Organize cada etapa por objetivo, mostre posição e progresso separados da navegação e preserve, permita revisar e recupere os dados ao avançar, voltar ou retomar. | high | ✅ |
| [Como estruturar mensagens de erro em formulários?](forms/form-errors.md) | Toda mensagem de erro de campo nomeia o campo pelo rótulo, descreve o problema, diz como corrigir, fica ligada ao controle e não apaga o que a pessoa digitou. | high | ✅ |
| [Como indicar corretamente campos obrigatórios?](forms/required-fields.md) | Marque a obrigatoriedade em texto no rótulo, com uma única convenção por formulário, e exponha o estado também de forma programática. | high | ✅ |
| [Como preservar os dados preenchidos após um erro no formulário?](forms/preserve-data-after-error.md) | Após um erro, reexiba o formulário com todos os valores válidos mantidos e destaque apenas os campos que precisam de correção; descarte somente segredos, como senha e código de segurança do cartão. | high | ✅ |
| [Como projetar uma boa experiência de envio de arquivos?](forms/file-upload.md) | Mostre formatos e limites antes da seleção, use botão nativo acessível (arrastar e soltar é só alternativa), exiba o estado de cada arquivo e explique como corrigir cada falha. | high | ✅ |
| [Label ou placeholder: o que usar em formulários?](forms/label-vs-placeholder.md) | Todo campo tem label visível e associado; o placeholder serve apenas como exemplo curto ou formato, nunca como identificação. | high | ✅ |
| [Onde exibir mensagens de erro em formulários?](forms/error-placement.md) | Erro de campo fica junto ao campo; vários erros ganham resumo navegável no topo; mensagem global é só para falha que afeta o formulário ou o serviço inteiro. | high | ✅ |
| [Quando dividir um formulário em várias etapas?](forms/split-form.md) | Reduza campos antes de dividir telas; só crie etapas quando houver grupos com objetivo claro, e então preserve os dados, mostre o progresso e permita voltar e revisar. | high | ⚠️ |
| [Quando usar dropdown e quando evitar?](forms/dropdown.md) | Use dropdown apenas para escolha única entre valores predefinidos; poucas opções pedem opções visíveis e listas longas pedem busca. | high | ✅ |
| [Quando usar preenchimento automático?](forms/autofill.md) | Use preenchimento automático para reduzir digitação, mas mantenha todos os campos visíveis, editáveis e confirmáveis pela pessoa. | high | ✅ |
| [Quando validar campos durante o preenchimento?](forms/validation-timing.md) | Valide ao avançar ou enviar; antecipe o feedback somente quando o valor estiver completo ou o requisito puder ser mostrado sem interromper a digitação. | high | ⚠️ |

## modals

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como fechar um modal corretamente?](modals/close-modal.md) | Todo modal tem uma saída visível e nomeada, descarta dados somente com confirmação e devolve o foco ao elemento que o abriu. | high | ✅ |
| [Quando não usar modal?](modals/when-to-avoid-modal.md) | Trate o modal como último recurso: use-o só para decisão curta que exige atenção imediata; fluxos longos, mensagens rotineiras e textos extensos ficam na página. | high | ⛔ |
| [Quando usar modal?](modals/when-to-use-modal.md) | Use modal só para decisão ou tarefa curta que exige atenção imediata; se uma página, mensagem inline ou painel lateral resolver, não use modal. | high | ✅ |

## navigation

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como criar uma navegação principal clara?](navigation/main-navigation.md) | Mostre poucos destinos no primeiro nível, com rótulos na linguagem do público, separados de ações, em posição consistente, com a seção atual indicada e operação sem depender de hover. | high | ✅ |
| [Links devem abrir em nova aba?](navigation/link-in-new-tab.md) | Por padrão, abra links na mesma aba; reserve a nova aba para resguardar uma tarefa em curso e avise sempre no próprio link. | medium | ⚠️ |
| [Paginação, "Carregar mais" ou scroll infinito?](navigation/pagination-vs-scroll.md) | Se localizar e retornar pesam mais, adote paginação; se explorar e comparar pesam mais, adote "Carregar mais"; deixe o scroll infinito para feeds em que seguir rolando é a própria tarefa. | medium | ⚠️ |
| [Quando usar abas?](navigation/tabs.md) | Use abas só para poucos conteúdos relacionados, de mesma importância e independentes o bastante para serem vistos um de cada vez. | medium | ✅ |
| [Quando usar breadcrumbs?](navigation/breadcrumbs.md) | Use breadcrumbs só quando existir hierarquia real de páginas, e trate o retorno aos resultados como uma ação separada da trilha. | medium | ✅ |

## search-filters

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como estruturar filtros em uma interface?](search-filters/filter-structure.md) | Ofereça só filtros que respondem a decisões reais da tarefa, agrupados por significado, com lógica de combinação previsível, estado ativo visível e saída simples (remover um, limpar todos). | high | ✅ |
| [Como mostrar os filtros ativos?](search-filters/active-filters.md) | Depois de aplicar filtros, exiba um resumo visível com nome e valor de cada critério, remoção individual e uma ação "Limpar filtros", fora de qualquer painel fechado. | high | ✅ |
| [Filtros devem ser aplicados automaticamente?](search-filters/applying-filters.md) | Atualize a lista na hora quando a resposta for rápida e a escolha for simples; exija "Aplicar" quando houver várias escolhas combinadas, consulta lenta ou painel que cobre os resultados. | medium | ⚠️ |
| [O que mostrar quando a busca não retorna resultados?](search-filters/no-search-results.md) | Mantenha a consulta digitada, informe com clareza que não há resultados e aponte o caminho mais provável para seguir, sem deslocar o foco. | high | ✅ |

## ux-writing

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como escrever mensagens de erro úteis?](ux-writing/helpful-error-message.md) | Toda mensagem de erro deve nomear o campo, descrever o problema em texto simples e indicar a correção (formato, limite ou valor esperado), sem culpar a pessoa. | high | ✅ |
| [Como escrever o texto de um botão?](ux-writing/button-text.md) | Inicie o rótulo com um verbo e nomeie o resultado da ação; se alguém puder indagar "enviar o quê?" ou "continuar para onde?", inclua o objeto ou o destino. | high | ✅ |
| [Por que evitar "clique aqui" em links?](ux-writing/link-text.md) | O texto do link deve informar o destino ou o propósito por si só; nunca use "clique aqui", "aqui" ou "leia mais" como único texto clicável. | high | ✅ |
