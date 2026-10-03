---
id: temporary-failure
title: Como comunicar falhas temporárias do sistema?
category: feedback
components: [alert, inline-message, toast, unavailable-page, button]
type: recommendation
impact: high
status: recommended
evidence: strong
wcag: ["4.1.3", "1.4.1", "2.2.1", "3.3.1"]
related: [retry, preserve-data-after-error, technical-error-code, toast-vs-inline-alert, long-loading]
---

# Como comunicar falhas temporárias do sistema?

> **Regra:** Informe o que falhou, diga se a operação foi concluída, está em andamento ou não aconteceu, guarde os dados e proponha uma só ação segura.

## Contexto

A falha temporária acontece quando o sistema, a rede ou um serviço externo não consegue finalizar a operação naquele momento, mas a pessoa pode tentar mais tarde. Não se trata de erro de preenchimento: os dados informados não são o problema.

A mensagem deve esclarecer duas dúvidas: o que houve e o que é seguro fazer. Antes de sugerir "Tentar novamente", diga em que pé está a operação. Assim se evitam envios em duplicidade, pagamentos repetidos e perda de confiança.

Uma mensagem genérica aumenta a incerteza e leva a repetição, abandono ou duplicação. Mensagens hostis transferem à pessoa o trabalho de interpretar o problema.

## Decisão

- **SE** a falha é localizada (um bloco de conteúdo) **ENTÃO** use mensagem inline junto ao conteúdo afetado.
- **SE** o serviço inteiro está indisponível **ENTÃO** use mensagem persistente ou página de indisponibilidade.
- **SE** a falha é breve, clara e recuperável sem registro **ENTÃO** pode usar notificação temporária.
- **SE** a falha exige ação **ENTÃO** não use toast que some; mantenha a mensagem visível.
- **SE** o servidor não confirmou o resultado **ENTÃO** diga "Não foi possível confirmar" e oriente a conferir o histórico antes de repetir.
- **SE** a operação não chegou a iniciar ou pode ser repetida sem risco **ENTÃO** use "Tentar novamente" como ação principal.
- **SE** a operação pode ter sido criada mesmo sem confirmação **ENTÃO** ofereça consulta persistente do status em vez de reenvio.
- **SE** a falha persiste **ENTÃO** ofereça alternativa concreta: voltar mais tarde, ver status ou falar com suporte.
- **SE** há incidente em andamento **ENTÃO** atualize a informação sem prometer prazo desconhecido.
- **SENÃO** descreva a falha na linguagem da tarefa, sem código técnico.

## Quando usar

- Falha de rede ou servidor.
- Serviço externo indisponível.
- Resultado ainda não confirmado.
- Falha que afeta uma área inteira.

## Quando evitar

- Problema nos dados do campo → **use em vez disso:** erro de validação junto ao campo.
- Operação ainda processando → **use em vez disso:** estado de carregamento.
- Falha permanente → **use em vez disso:** mensagem que explique a mudança, sem sugerir nova tentativa.
- Tentativas sem limite → **use em vez disso:** limite e alternativa de suporte.

## Faça

- Circunscreva o escopo: "Não foi possível carregar seus pedidos".
- Preserve o que a pessoa digitou, selecionou ou anexou.
- Mantenha o contexto da tarefa.
- Registre o erro para a equipe, sem expô-lo à pessoa.

## Evite

- Culpar a pessoa.
- Dizer apenas "Erro".
- Estimular repetição de operação incerta.
- Apagar o preenchimento.
- Jargão técnico e prazo incerto.
- Depender só de vermelho.

## Acessibilidade

- Falha dinâmica sem urgência: região `role="status"` já presente no DOM antes do texto, anúncio polido, sem roubar foco (4.1.3).
- Erro urgente: `role="alert"` com parcimônia.
- Texto, não só cor, ícone ou som (1.4.1).
- Botão de nova tentativa com nome acessível, foco visível e operação por teclado; não pode sumir antes de ser lido (2.2.1).
- Associe a mensagem ao conteúdo afetado.

## Microcópia

| Situação | Exemplo |
|---|---|
| Carregamento falhou | "Não foi possível carregar seus pedidos. Tentar novamente" |
| Resultado incerto | "Não conseguimos confirmar o envio. Confira em Histórico antes de enviar de novo." |
| Serviço fora | "Estamos com instabilidade. Seus dados foram mantidos. Tente de novo em alguns minutos." |
| Persistente | "Ainda não deu certo. Fale com o suporte." |

## Checklist de verificação

- [ ] A mensagem identifica o que falhou.
- [ ] Distingue falha do sistema de erro de preenchimento.
- [ ] Diz se a operação terminou, segue em processamento ou não ocorreu.
- [ ] Deixa claro se é seguro tentar de novo.
- [ ] Os dados preenchidos foram preservados.
- [ ] Há uma ação de recuperação clara.
- [ ] Existe alternativa quando a falha persiste.
- [ ] O texto não usa jargão nem código técnico.
- [ ] O estado é anunciado sem mover o foco.
- [ ] A ação opera com leitor de tela e teclado.

## Fundamentação

- Nielsen Norman Group (mensagens de erro hostis): evitar transferir à pessoa o trabalho de interpretar o problema; explicar e indicar saída.
- WCAG 2.2, critério 4.1.3 (Status Messages): erros e estados anunciados sem mover o foco.
- W3C WAI, técnica ARIA19: região de alerta ou live region mantida no DOM antes da atualização.
- Baymard Institute (validação e preservação de entradas): mensagens específicas e preservação de dados reduzem esforço; evidência de checkout.
- IBM Carbon (notificação) e Adobe Spectrum (toast): formatos inline, toast e acionável conforme contexto.
- GOV.UK Design System (página de problema no serviço): orientar a tentar depois, destino das respostas e canais alternativos.
- Padrão Digital de Governo (GOV.BR), Message: mensagens de estado objetivas e acessíveis.
