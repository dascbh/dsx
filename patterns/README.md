# Catálogo de padrões

77 padrões de interface com regra de decisão, critérios de uso, acessibilidade e checklist.
Gerado por `node tools/lint-patterns.mjs --index` — não edite à mão.

**Como um agente usa este catálogo:** encontre a decisão que você está tomando na tabela, leia a **Regra** e, se o caso não for trivial, abra o cartão e siga a seção **Decisão**. Antes de entregar, rode o **Checklist de verificação** do cartão.

Legenda de status: ✅ recomendado · ⚠️ usar com cautela · ⛔ evitar

## acessibilidade

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como indicar o foco de teclado?](acessibilidade/foco-de-teclado.md) | Todo controle acionável por teclado deve mostrar indicador de foco visível, com contraste de pelo menos 3:1 frente às cores vizinhas, sem ficar coberto por elementos fixos. | alto | ✅ |
| [Por que não usar apenas cor para comunicar erros?](acessibilidade/nao-so-cor.md) | Cor reforça o estado, mas nunca é o único sinal: acompanhe-a de texto que diga o problema, perto do elemento afetado. | alto | ✅ |
| [Qual deve ser o tamanho mínimo de um alvo de toque?](acessibilidade/alvo-de-toque.md) | Dimensione a área interativa, não o desenho: mínimo de 24 × 24 CSS px (piso AA) e 44–48 unidades para controles de toque, com espaço entre vizinhos. | alto | ✅ |

## acoes

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Botões devem ter ícone e texto?](acoes/botao-icone-e-texto.md) | Use ícone mais texto quando a ação for pouco familiar, importante ou destrutiva; use só ícone apenas em ações muito conhecidas e compactas, sempre com nome acessível. | alto | ⚠️ |
| [Como definir a hierarquia entre botão primário e secundário?](acoes/hierarquia-de-botoes.md) | Em cada grupo de ações, dê a maior ênfase a uma única ação principal e trate as alternativas com ênfase menor, sempre visíveis e nunca diferenciadas só por cor. | medio | ✅ |
| [Como evitar cliques múltiplos durante o carregamento de uma ação?](acoes/clique-duplo-em-envio.md) | Valide primeiro; na primeira submissão válida, mostre o processamento no próprio botão, ignore novas ativações da mesma ação e garanta idempotência no servidor. | alto | ✅ |
| [Como tratar ações destrutivas?](acoes/acao-destrutiva.md) | Ajuste a proteção ao impacto, à frequência e à reversibilidade: prefira Desfazer ou arquivar; reserve confirmação com rótulo específico para ações raras, amplas ou irreversíveis. | alto | ✅ |
| [Esconder ou desabilitar uma ação indisponível?](acoes/botao-desabilitado.md) | Esconda a ação irrelevante; mantenha visível e explicada a ação central que está temporariamente bloqueada; nunca desabilite sem dizer por quê. | alto | ⚠️ |
| [Link ou botão: qual usar?](acoes/link-vs-botao.md) | Se a pessoa é levada a outro lugar, use link (`<a href>`); se algo acontece no ponto em que ela está, use botão (`<button>`). Defina a semântica antes do visual. | alto | ✅ |
| [Onde posicionar ações primárias e secundárias?](acoes/posicao-de-acoes.md) | Defina uma única ação principal pelo objetivo da tarefa, agrupe as alternativas ao lado dela com menor ênfase e mantenha a mesma posição em telas equivalentes. | medio | ✅ |
| [Quando oferecer a opção Desfazer?](acoes/desfazer.md) | Ofereça "Desfazer" logo após uma ação reversível iniciada pela pessoa, com texto que diga o que mudou, e só se a reversão restaurar o estado completo. | medio | ✅ |
| [Quando pedir confirmação antes de excluir?](acoes/confirmar-exclusao.md) | Peça confirmação só quando a exclusão for irreversível, ampla ou difícil de recuperar; nos demais casos, execute e ofereça "Desfazer". | alto | ⚠️ |
| [Quando pedir confirmação antes de uma ação?](acoes/confirmar-acao.md) | Só peça confirmação para ação irreversível ou de alto custo; em ações rotineiras e recuperáveis, execute e ofereça "Desfazer". | critico | ⚠️ |
| [Quando um botão pode ter só ícone, sem texto?](acoes/icone-sem-texto.md) | Use ícone sozinho apenas para ações universalmente reconhecidas no contexto, sempre com nome acessível; se o ícone precisa de explicação, mantenha o rótulo visível. | alto | ⚠️ |
| [Quando usar botão flutuante?](acoes/botao-flutuante.md) | Use botão flutuante somente para uma única ação primária, frequente e construtiva, sem cobrir conteúdo nem competir com a navegação. | medio | ⚠️ |

## autenticacao

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como comunicar sessão expirada?](autenticacao/sessao-expirada.md) | Avise antes do vencimento com o tempo restante e uma ação "Continuar sessão"; depois do vencimento, explique o motivo, proteja dados sensíveis e leve à reautenticação com retorno ao contexto seguro. | critico | ✅ |
| [Como criar uma recuperação de senha clara?](autenticacao/recuperar-senha.md) | Disponibilize "Esqueci minha senha" perto do login, dê resposta neutra que não revele se a conta existe, envie link ou código de uso único com validade e descreva o passo seguinte e as alternativas. | critico | ✅ |
| [Como informar os requisitos de senha?](autenticacao/requisitos-de-senha.md) | Mostre os requisitos junto ao campo antes da digitação, priorize comprimento e bloqueio de senhas comuns em vez de regras de composição arbitrárias, e nunca impeça colar ou gerenciadores de senha. | critico | ✅ |
| [Mostrar ou ocultar senha: como deve funcionar?](autenticacao/mostrar-senha.md) | Oculte a senha por padrão e ofereça um botão opcional, com nome acessível, que alterna a visibilidade sem apagar o valor, mover o foco ou bloquear colar e gerenciadores de senha. | critico | ✅ |
| [Quando pedir confirmação de senha?](autenticacao/confirmar-senha.md) | Não repita o campo de senha por padrão; use um único campo com "mostrar senha" na criação e reautentique apenas antes de ações sensíveis. | critico | ⚠️ |

## busca-filtros

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como estruturar filtros em uma interface?](busca-filtros/estrutura-de-filtros.md) | Ofereça só filtros que respondem a decisões reais da tarefa, agrupados por significado, com lógica de combinação previsível, estado ativo visível e saída simples (remover um, limpar todos). | alto | ✅ |
| [Como mostrar os filtros ativos?](busca-filtros/filtros-ativos.md) | Depois de aplicar filtros, exiba um resumo visível com nome e valor de cada critério, remoção individual e uma ação "Limpar filtros", fora de qualquer painel fechado. | alto | ✅ |
| [Filtros devem ser aplicados automaticamente?](busca-filtros/aplicacao-de-filtros.md) | Atualize a lista na hora quando a resposta for rápida e a escolha for simples; exija "Aplicar" quando houver várias escolhas combinadas, consulta lenta ou painel que cobre os resultados. | medio | ⚠️ |
| [O que mostrar quando a busca não retorna resultados?](busca-filtros/busca-sem-resultados.md) | Mantenha a consulta digitada, informe com clareza que não há resultados e aponte o caminho mais provável para seguir, sem deslocar o foco. | alto | ✅ |

## conteudo

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Por que evitar carrossel com rotação automática?](conteudo/carrossel-automatico.md) | Não faça o carrossel girar sozinho; prefira controle manual ou seção estática e, se a rotação for inevitável, ofereça pausa visível e pare ao foco ou à interação. | alto | ⛔ |
| [Quando usar carrossel?](conteudo/carrossel.md) | Use carrossel apenas para itens relacionados e de exploração opcional, com controle manual e sem esconder conteúdo essencial. | medio | ✅ |

## dados

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como estruturar filtros de período em dashboards?](dados/filtro-de-periodo.md) | Exiba sempre, em texto, o intervalo ativo, o que ele controla, a data da última atualização dos dados e quais cards ficam fora do recorte. | alto | ⚠️ |
| [Como ordenar dados em tabelas?](dados/ordenacao-de-tabela.md) | Ofereça ordenação apenas em colunas com ordem significativa, mostre sempre a coluna e a direção ativas, ordene pelo valor real e exponha o estado via botão e `aria-sort`. | alto | ✅ |
| [Como tornar tabelas responsivas no mobile?](dados/tabela-responsiva.md) | Escolha a adaptação pela tarefa: SE a pessoa compara colunas, mantenha a grade em contêiner com rolagem horizontal própria; SE consulta registros isolados, empilhe ou use lista, sempre preservando a relação cabeçalho-célula. | alto | ✅ |
| [Quando usar e como configurar paginação em tabelas e listas?](dados/paginacao-de-tabela.md) | Pagine coleções grandes de ordem estável, mostrando a página atual, mantendo página, filtros e ordenação recuperáveis e nomeando todos os controles. | medio | ⚠️ |
| [Quando usar tabela em vez de cards?](dados/tabela-vs-cards.md) | Use tabela quando a pessoa precisa comparar atributos entre itens; use cards para resumos independentes e conteúdo heterogêneo. | alto | ✅ |

## ecommerce

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como alterar quantidade e remover itens no carrinho?](ecommerce/carrinho-editar-itens.md) | Ofereça stepper (mais e menos) com campo numérico quando a faixa for ampla, atualize totais sem botão "Atualizar" e torne a remoção explícita e reversível. | alto | ✅ |
| [Como aproveitar o CEP para completar o endereço no checkout?](ecommerce/endereco-por-cep.md) | Peça o CEP primeiro, consulte ao completar o valor, preencha só o que a fonte retornou e mantenha tudo revisável, editável e com fallback manual. | alto | ✅ |
| [Como exibir variações de produto: tamanho, cor e disponibilidade?](ecommerce/variacoes-de-produto.md) | Mostre cada dimensão de variação como grupo rotulado, recalcule a disponibilidade da combinação após cada escolha e atualize imagem, preço, estoque e compra. | alto | ✅ |
| [Quando oferecer checkout como convidado?](ecommerce/checkout-convidado.md) | Quando a conta não é essencial para concluir a compra, ofereça "Continuar como convidado" de forma explícita e destacada no início da seleção de conta, e proponha criar conta só depois da confirmação do pedido. | alto | ✅ |

## feedback

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como comunicar falhas temporárias do sistema?](feedback/falha-temporaria.md) | Informe o que falhou, diga se a operação foi concluída, está em andamento ou não aconteceu, guarde os dados e proponha uma só ação segura. | alto | ✅ |
| [Como comunicar uma ação concluída com sucesso?](feedback/confirmacao-de-sucesso.md) | Confirme só o resultado real, nomeando a ação e o objeto, perto do contexto, com permanência proporcional ao impacto e sem roubar o foco. | alto | ✅ |
| [Como criar bons estados vazios?](feedback/estado-vazio.md) | Identifique a causa do vazio, explique-a em título curto mais uma frase de contexto e ofereça uma única ação principal coerente com essa causa. | medio | ✅ |
| [Como tratar carregamentos que demoram muito?](feedback/carregamento-longo.md) | Escolha o indicador pela duração e pelo tipo de espera: nada abaixo de 1 s, indeterminado de 1 a 3 s, progresso real acima de 3 s e, acima de 10 s, preserve a tarefa e ofereça continuar, cancelar ou acompanhar depois. | alto | ✅ |
| [Erros técnicos devem mostrar códigos ao usuário?](feedback/codigo-de-erro-tecnico.md) | Explique o impacto e o próximo passo primeiro; mostre um código apenas como referência secundária, rotulada e copiável, quando ele ajudar o suporte a localizar a ocorrência. | medio | ⚠️ |
| [Quando e como oferecer "Tentar novamente" após um erro?](feedback/tentar-novamente.md) | Ofereça "Tentar novamente" só quando a causa for provavelmente temporária e a repetição for segura; preserve o estado, evite duplicidade e dê uma saída após poucas falhas. | medio | ✅ |
| [Quando mostrar porcentagem de progresso?](feedback/porcentagem-de-progresso.md) | Mostre porcentagem apenas quando o total e o avanço forem medidos de verdade; sem medida confiável, use indicador indeterminado com rótulo. | medio | ✅ |
| [Quanto tempo uma notificação temporária deve permanecer?](feedback/duracao-de-toast.md) | Notificação com ação, erro importante ou informação única nunca some sozinha; só mensagens curtas de baixo impacto podem desaparecer, começando em 4 a 10 segundos e ajustadas pelo tamanho do texto. | medio | ⚠️ |
| [Skeleton ou spinner: quando usar cada um?](feedback/skeleton-vs-spinner.md) | Skeleton para a carga inicial de conteúdo com formato conhecido; spinner inline para ações curtas; barra de progresso só quando houver medida real. | medio | ⚠️ |
| [Skeleton screen melhora a percepção de carregamento?](feedback/skeleton-screen.md) | Use skeleton quando a estrutura do conteúdo for previsível e a espera for perceptível; ele melhora a percepção, não o desempenho real. | medio | ⚠️ |
| [Toast, alerta ou mensagem inline: qual usar?](feedback/toast-alerta-inline.md) | Escolha o padrão pelo escopo da mensagem: toast para confirmação breve, inline para algo ligado a um elemento, alerta persistente para condição da página ou do serviço. | medio | ⚠️ |

## formularios

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [A mensagem de erro vai antes ou depois do campo?](formularios/posicao-do-erro-no-campo.md) | Coloque a mensagem na mesma unidade visual do rótulo e do campo, em posição consistente e ligada programaticamente ao controle; após o envio, repita-a em um resumo no topo. | alto | ✅ |
| [Autosave ou botão Salvar?](formularios/autosave-vs-salvar.md) | Use autosave só para mudanças independentes, de baixo risco e reversíveis, sempre com estado de salvamento visível; use botão explícito quando houver revisão, transação ou efeito externo. | alto | ⚠️ |
| [Como definir a sequência dos campos em um formulário?](formularios/ordem-dos-campos.md) | Ordene os campos pela tarefa da pessoa, não pelo banco de dados, e faça ordem visual, ordem do HTML e ordem do Tab seguirem a mesma lógica. | alto | ✅ |
| [Como estruturar etapas em formulários longos?](formularios/etapas-de-formulario.md) | Organize cada etapa por objetivo, mostre posição e progresso separados da navegação e preserve, permita revisar e recupere os dados ao avançar, voltar ou retomar. | alto | ✅ |
| [Como estruturar mensagens de erro em formulários?](formularios/erros-em-formularios.md) | Toda mensagem de erro de campo nomeia o campo pelo rótulo, descreve o problema, diz como corrigir, fica ligada ao controle e não apaga o que a pessoa digitou. | alto | ✅ |
| [Como indicar corretamente campos obrigatórios?](formularios/campos-obrigatorios.md) | Marque a obrigatoriedade em texto no rótulo, com uma única convenção por formulário, e exponha o estado também de forma programática. | alto | ✅ |
| [Como preservar os dados preenchidos após um erro no formulário?](formularios/preservar-dados-apos-erro.md) | Após um erro, reexiba o formulário com todos os valores válidos mantidos e destaque apenas os campos que precisam de correção; descarte somente segredos, como senha e código de segurança do cartão. | alto | ✅ |
| [Como projetar uma boa experiência de envio de arquivos?](formularios/upload-de-arquivos.md) | Mostre formatos e limites antes da seleção, use botão nativo acessível (arrastar e soltar é só alternativa), exiba o estado de cada arquivo e explique como corrigir cada falha. | alto | ✅ |
| [Label ou placeholder: o que usar em formulários?](formularios/label-vs-placeholder.md) | Todo campo tem label visível e associado; o placeholder serve apenas como exemplo curto ou formato, nunca como identificação. | alto | ✅ |
| [Onde exibir mensagens de erro em formulários?](formularios/onde-exibir-erros.md) | Erro de campo fica junto ao campo; vários erros ganham resumo navegável no topo; mensagem global é só para falha que afeta o formulário ou o serviço inteiro. | alto | ✅ |
| [Quando dividir um formulário em várias etapas?](formularios/dividir-formulario.md) | Reduza campos antes de dividir telas; só crie etapas quando houver grupos com objetivo claro, e então preserve os dados, mostre o progresso e permita voltar e revisar. | alto | ⚠️ |
| [Quando usar dropdown e quando evitar?](formularios/dropdown.md) | Use dropdown apenas para escolha única entre valores predefinidos; poucas opções pedem opções visíveis e listas longas pedem busca. | alto | ✅ |
| [Quando usar preenchimento automático?](formularios/autopreenchimento.md) | Use preenchimento automático para reduzir digitação, mas mantenha todos os campos visíveis, editáveis e confirmáveis pela pessoa. | alto | ✅ |
| [Quando validar campos durante o preenchimento?](formularios/momento-da-validacao.md) | Valide ao avançar ou enviar; antecipe o feedback somente quando o valor estiver completo ou o requisito puder ser mostrado sem interromper a digitação. | alto | ⚠️ |

## ia

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como comunicar limites e incerteza de respostas de IA?](ia/incerteza-da-ia.md) | Comunique a incerteza perto do resultado, com linguagem proporcional ao desempenho real e ligada a uma ação concreta (conferir, comparar, ver fontes, pedir revisão); mostre número de confiança só se for válido e compreensível. | alto | ✅ |
| [Como deixar pessoas revisarem e editarem resultados gerados por IA?](ia/revisar-resultado-da-ia.md) | Apresente todo resultado de IA como proposta que a pessoa pode aceitar, editar, refinar, regenerar ou descartar antes que ele afete uma decisão, comunicação ou fluxo. | alto | ✅ |
| [Como mostrar fontes e critérios nas respostas de IA?](ia/fontes-da-ia.md) | Ligue cada afirmação relevante à fonte que a sustenta, deixe a fonte abrível e, em saídas de alto impacto, mostre também os critérios, dados e limites usados. | alto | ✅ |
| [Como oferecer recuperação quando a IA falha?](ia/recuperar-erro-da-ia.md) | Identifique a etapa que falhou, explique a causa em linguagem simples, preserve o pedido e o trabalho, e ofereça ao menos uma ação de recuperação específica no mesmo contexto. | alto | ✅ |
| [Como sinalizar que um conteúdo foi gerado por IA?](ia/rotular-conteudo-ia.md) | Rotule com texto claro, junto ao conteúdo, tudo o que a IA gerou ou transformou de forma material, delimitando o escopo exato e sem sugerir revisão ou exatidão que não existem. | alto | ✅ |
| [Quando pedir confirmação antes de uma ação executada pela IA?](ia/confirmar-acao-da-ia.md) | A IA prepara a ação sem executá-la; peça confirmação explícita imediatamente antes de qualquer efeito relevante, externo, destrutivo, financeiro ou difícil de reverter, mostrando alvo, escopo e consequência. | alto | ✅ |

## modais

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como fechar um modal corretamente?](modais/fechar-modal.md) | Todo modal tem uma saída visível e nomeada, descarta dados somente com confirmação e devolve o foco ao elemento que o abriu. | alto | ✅ |
| [Quando não usar modal?](modais/quando-evitar-modal.md) | Trate o modal como último recurso: use-o só para decisão curta que exige atenção imediata; fluxos longos, mensagens rotineiras e textos extensos ficam na página. | alto | ⛔ |
| [Quando usar modal?](modais/quando-usar-modal.md) | Use modal só para decisão ou tarefa curta que exige atenção imediata; se uma página, mensagem inline ou painel lateral resolver, não use modal. | alto | ✅ |

## navegacao

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como criar uma navegação principal clara?](navegacao/navegacao-principal.md) | Mostre poucos destinos no primeiro nível, com rótulos na linguagem do público, separados de ações, em posição consistente, com a seção atual indicada e operação sem depender de hover. | alto | ✅ |
| [Links devem abrir em nova aba?](navegacao/link-em-nova-aba.md) | Por padrão, abra links na mesma aba; reserve a nova aba para resguardar uma tarefa em curso e avise sempre no próprio link. | medio | ⚠️ |
| [Paginação, "Carregar mais" ou scroll infinito?](navegacao/paginacao-vs-scroll.md) | Se localizar e retornar pesam mais, adote paginação; se explorar e comparar pesam mais, adote "Carregar mais"; deixe o scroll infinito para feeds em que seguir rolando é a própria tarefa. | medio | ⚠️ |
| [Quando usar abas?](navegacao/abas.md) | Use abas só para poucos conteúdos relacionados, de mesma importância e independentes o bastante para serem vistos um de cada vez. | medio | ✅ |
| [Quando usar breadcrumbs?](navegacao/breadcrumbs.md) | Use breadcrumbs só quando existir hierarquia real de páginas, e trate o retorno aos resultados como uma ação separada da trilha. | medio | ✅ |

## ux-writing

| Padrão | Regra | Impacto | Status |
|---|---|---|---|
| [Como escrever mensagens de erro úteis?](ux-writing/mensagem-de-erro-util.md) | Toda mensagem de erro deve nomear o campo, descrever o problema em texto simples e indicar a correção (formato, limite ou valor esperado), sem culpar a pessoa. | alto | ✅ |
| [Como escrever o texto de um botão?](ux-writing/texto-de-botao.md) | Inicie o rótulo com um verbo e nomeie o resultado da ação; se alguém puder indagar "enviar o quê?" ou "continuar para onde?", inclua o objeto ou o destino. | alto | ✅ |
| [Por que evitar "clique aqui" em links?](ux-writing/texto-de-link.md) | O texto do link deve informar o destino ou o propósito por si só; nunca use "clique aqui", "aqui" ou "leia mais" como único texto clicável. | alto | ✅ |
