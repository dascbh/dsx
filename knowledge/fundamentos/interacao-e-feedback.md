# Interação e feedback

> **Quando consultar**
> - Ao especificar o comportamento de um controle, ação assíncrona ou transição.
> - Ao decidir que retorno mostrar (e quando) depois de um clique, envio ou carregamento.
> - Ao projetar microinterações, animações de estado, estados vazios ou primeiro uso.
> - Ao revisar uma tela que "não responde", "parece travada" ou "não diz o que fazer".

---

## 1. Design de interação: o que especificar

Design de interação define como a pessoa age e como o sistema responde. Pense em cinco dimensões:

| Dimensão | Cobre | Pergunta |
|---|---|---|
| Palavras | Rótulos, mensagens | O texto diz a ação e o resultado? |
| Representação visual | Ícones, cor, tipografia | O estado é reconhecível? |
| Objetos e espaço | Dispositivo, postura, uma mão vs. mesa | O controle é alcançável neste contexto? |
| Tempo | Duração, ritmo, animação, espera | A resposta chega no tempo certo? |
| Comportamento | Regras e reações do sistema | O que acontece em cada caso, inclusive o de erro? |

Princípios de Norman que cada controle precisa responder: **visibilidade** (o que posso fazer?), **feedback** (o que aconteceu?), **restrições** (o que me impede de errar?), **mapeamento** (controle e efeito são coerentes?), **affordance/signifier** (como sei que posso agir?), **consistência** (funciona como os parecidos?).

**Para cada controle, especifique:** gatilho → regras → feedback → estados (padrão, hover, foco, pressionado, carregando, sucesso, erro, desabilitado) → saída (como desfazer ou sair).

---

## 2. Limiares de tempo de resposta

| Tempo | Percepção | O que mostrar |
|---|---|---|
| ≤ 0,1 s | Instantâneo; a pessoa sente que causou o efeito | Só a mudança de estado do controle (pressionado, marcado) |
| 0,1–1 s | Percebe a demora, mas mantém o fluxo de pensamento | Nada extra ou indicador discreto; evite spinner que pisca |
| 1–10 s | A atenção começa a se perder | Indicador de carregamento; skeleton se a estrutura é conhecida |
| > 10 s | A pessoa vai fazer outra coisa | Progresso determinado (etapa ou %), estimativa, possibilidade de cancelar ou continuar em segundo plano e avisar ao terminar |

**Regras**
- SE a resposta pode levar entre ~0,3 e 1 s ENTÃO atrase o indicador em ~300 ms para evitar flash, e quando aparecer mantenha-o por pelo menos ~500 ms.
- SE a estrutura do conteúdo é previsível ENTÃO use skeleton; SE não é, ou a ação é um envio, use spinner no próprio botão. Ver [skeleton-vs-spinner](../../patterns/feedback/skeleton-vs-spinner.md), [skeleton-screen](../../patterns/feedback/skeleton-screen.md).
- SE a operação passa de 10 s ENTÃO mostre progresso real e permita cancelar. Ver [carregamento-longo](../../patterns/feedback/carregamento-longo.md).
- Só mostre porcentagem se ela corresponder a trabalho medido ([porcentagem-de-progresso](../../patterns/feedback/porcentagem-de-progresso.md)).
- Ao enviar, bloqueie reenvio e mostre estado de carregamento no botão ([clique-duplo-em-envio](../../patterns/acoes/clique-duplo-em-envio.md)).
- Em ações de baixo risco com alta taxa de sucesso, considere atualização otimista com reversão clara se falhar. Em pagamentos, **nunca** declare sucesso antes da confirmação real.

---

## 3. Feedback

Toda ação relevante tem resposta perceptível e fiel ao estado real.

| Tipo | Função | Exemplo |
|---|---|---|
| Confirmação | Ação concluída | "Pedido enviado. Você recebe o código de rastreio por e-mail." |
| Estado | Situação atual | Selecionado, salvo, pausado, indisponível |
| Progresso | Quanto falta | "Passo 2 de 4", barra de upload |
| Orientação | Próximo passo | Dica no estado vazio |
| Recuperação | O que deu errado e como corrigir | "Sem conexão. Suas alterações ficam salvas aqui e serão enviadas ao reconectar." |

**Três momentos:** imediato (o clique foi registrado), durante a espera (algo está acontecendo), depois (o que mudou e o que vem agora).

**Regras**
- Feedback proporcional ao risco: discreto para salvar um campo, explícito para pagar.
- Explique consequência e próximo passo, não só "Sucesso".
- Use mais de um canal: texto + visual + anúncio programático (região `aria-live`) para tecnologias assistivas.
- Escolha o veículo pelo escopo: inline para o campo, alerta para a seção ou página, toast para confirmação passageira e não crítica. Ver [toast-alerta-inline](../../patterns/feedback/toast-alerta-inline.md), [duracao-de-toast](../../patterns/feedback/duracao-de-toast.md).
- Toast não carrega erro que exige ação nem informação que a pessoa precisa reler; não mova o foco para ele.
- Validação imediata não é agressiva: não acuse erro antes de a pessoa ter chance de terminar ([momento-da-validacao](../../patterns/formularios/momento-da-validacao.md)).
- Falhas temporárias: diga que é temporário, preserve o que foi feito e ofereça nova tentativa ([falha-temporaria](../../patterns/feedback/falha-temporaria.md), [tentar-novamente](../../patterns/feedback/tentar-novamente.md)).

**Anti-padrões:** mensagem genérica; notificações empilhadas sem prioridade; feedback só por cor, som ou animação; descartar dados na falha; progresso inventado.

---

## 4. Microinterações

Anatomia (Saffer):
1. **Gatilho** — iniciado pela pessoa (clique, gesto) ou pelo sistema (mensagem chegou).
2. **Regras** — o que acontece e o que não pode acontecer.
3. **Feedback** — o que se vê, ouve ou sente.
4. **Loops e modos** — repetição, duração, variações de contexto.

Exemplos: alternar um toggle, marcar favorito, puxar para atualizar, medidor de força de senha, indicador de "digitando".

**Limiares de animação**

| Uso | Duração |
|---|---|
| Mudança de estado de controle (hover, toggle) | 100–200 ms |
| Entrada/saída de elementos pequenos (tooltip, menu) | 150–250 ms |
| Transições de painel, modal, página | 250–400 ms |
| Teto para animação funcional | ~500 ms |

- Entrada com desaceleração (ease-out), saída com aceleração (ease-in); saída um pouco mais curta que a entrada.
- Respeite `prefers-reduced-motion`: troque deslocamentos e zooms por fade ou mudança instantânea.
- Nada pisca mais de 3 vezes por segundo.
- O estado precisa ser legível sem a animação.

**Anti-padrões:** animação decorativa em ação frequente; animação desproporcional à ação; atrasar a tarefa para exibir efeito; comportamento diferente em controles iguais; custo de desempenho perceptível.

---

## 5. Estados vazios

Tela vazia é oportunidade de orientar. Explique a causa, nomeie o que falta e ofereça o próximo passo.

| Tipo | Objetivo | Conteúdo mínimo | Ação |
|---|---|---|---|
| Primeiro uso | Mostrar valor e iniciar | O que vai aparecer aqui e por que importa | Criar o primeiro item |
| Busca sem resultado | Recuperar a busca | Termo buscado, sugestões de grafia/termos | Ajustar busca ([busca-sem-resultados](../../patterns/busca-filtros/busca-sem-resultados.md)) |
| Filtros que excluem tudo | Mostrar a causa | Filtros ativos | Remover um filtro ou limpar todos ([filtros-ativos](../../patterns/busca-filtros/filtros-ativos.md)) |
| Concluído | Reconhecer a conquista | "Tudo em dia" | Nenhuma ou próxima tarefa opcional |
| Sem permissão | Explicar o requisito | Quem pode conceder acesso | Pedir acesso |
| Falha temporária | Não confundir com ausência | É erro, não vazio | Tentar novamente |

**Regras**
- Distinga vazio de carregando e de erro; cada um tem visual e texto próprios.
- Uma frase costuma bastar; título + uma linha + uma ação.
- Uma ação primária; nenhum botão se não houver ação relevante.
- Texto antes de ilustração; ilustração subordinada, nunca com cara de clicável, e sem empurrar a ação para fora da tela.
- Dados de exemplo identificados como fictícios e removíveis.
- Nunca limpe o termo de busca nem os filtros da pessoa.

Ver [estado-vazio](../../patterns/feedback/estado-vazio.md).

---

## 6. Onboarding

Objetivo: levar a pessoa ao **primeiro valor real**, não a concluir um tour.

**Padrões**
- **Revelação progressiva:** o essencial primeiro, o avançado quando for pedido.
- **Ajuda contextual:** dica no lugar e no momento da ação; dica desconectada é ignorada.
- **Estado vazio como guia:** o primeiro uso de cada área ensina a criar o primeiro item.
- **Tarefa de primeiro valor:** defina qual ação demonstra que a pessoa entendeu o produto e otimize o caminho até ela.
- **Checklist de configuração:** quando há várias etapas obrigatórias, mostre progresso e permita fazer fora de ordem.

**Regras**
- Uma ação principal com verbo claro (criar, importar, convidar).
- Minimize decisões e campos antes do primeiro valor; colete o resto depois.
- Permita pular, pausar e rever, salvo exigência regulatória.
- Peça permissões (notificação, localização, câmera) no momento em que fazem sentido, explicando o benefício antes do pedido do sistema.
- Meça comportamento (conclusão da tarefa de valor, retenção), não visualização de telas nem cliques em "Entendi".

**Anti-padrões:** carrossel obrigatório de apresentação; bloquear o produto até terminar o tour; dicas que voltam sem poder dispensar; informação necessária escondida num passo pulável; pedir todas as permissões na primeira tela.

---

## Checklist de auditoria

- [ ] Cada controle tem gatilho, regras, feedback, estados e saída especificados.
- [ ] Resposta visual em ≤ 0,1 s para toda interação.
- [ ] Indicador de carregamento para esperas > 1 s; progresso real e cancelamento para > 10 s.
- [ ] Sem flash de spinner em respostas rápidas; sem porcentagem inventada.
- [ ] Envios bloqueiam duplo clique e mostram carregamento no botão.
- [ ] Feedback proporcional ao risco, com consequência e próximo passo.
- [ ] Mensagens importantes anunciadas a tecnologias assistivas sem roubar o foco.
- [ ] Animações funcionais entre 100 e 400 ms, respeitando movimento reduzido.
- [ ] Vazio, carregando e erro são estados distintos, cada um com texto e ação apropriados.
- [ ] Busca e filtros vazios preservam o que a pessoa digitou e mostram como sair.
- [ ] Onboarding leva a uma tarefa de valor definida, pode ser pulado e revisto.
- [ ] Permissões pedidas no contexto, com benefício explicado.
