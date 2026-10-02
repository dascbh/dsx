---
id: multimodal
area: ia
titulo: UX multimodal (tela, toque, texto, voz, câmera)
evidencia: contextual
relacionados: [ux-para-agentes, generative-ui, evals]
---

# UX multimodal

> **Quando consultar**
> - Ao adicionar voz, câmera, áudio, gesto ou compartilhamento de tela a um fluxo que já tem tela e toque.
> - Ao decidir qual modalidade assume cada etapa de uma tarefa.
> - Ao especificar o estado compartilhado entre modalidades, permissões de captura e fallbacks.
> - Ao planejar testes de uma experiência que alterna modalidades.
>
> **Não consultar para:** continuidade entre canais (site → atendimento), que é omnichannel; nem para escolher componentes gerados, que é `generative-ui.md`.

## 1. Definição e fronteiras

UX multimodal é coordenar diferentes formas de entrada e saída **dentro da mesma tarefa**, com **um único estado** compartilhado. Ter um botão de microfone e outro de câmera não torna um produto multimodal; a coordenação, sim.

| Conceito | O que muda | Exemplo |
|---|---|---|
| Multimodal | Modalidades combinadas ou alternadas numa tarefa | Aponta a câmera, pergunta por voz, confirma na tela |
| Omnichannel | Continuidade entre canais/pontos de contato | Começa no app, termina na loja |
| Conversacional | Diálogo como forma principal | Chat ou assistente de voz |
| Generative UI | A composição da tela é gerada | IA escolhe tabela ou formulário |

Os conceitos podem coexistir, mas não são sinônimos. Multimodalidade é campo antigo da interação humano-computador; o que mudou é que modelos atuais interpretam fala, imagem e texto numa camada comum, tornando a coordenação viável em produtos de massa. `[evidência: contextual]`

## 2. Princípio central: uma tarefa, um estado

O histórico pertence à **tarefa**, não à modalidade. Se a pessoa apontou a câmera para um objeto e disse "essa peça está certa?", a referência a "essa peça" precisa sobreviver quando a conversa continua por voz ou quando ela toca numa opção na tela.

Especifique o estado da interação, não só as telas:

```yaml
estado_da_tarefa:
  objetivo_atual: "diagnosticar luz piscando no equipamento"
  objetos_referenciados: [{ id: painel-frontal, origem: camera, confianca: baixa }]
  modalidade_ativa: [camera, voz]
  capturas_ativas: { microfone: true, camera: true }
  escolhas_feitas: ["modelo X confirmado por toque"]
  permissoes: { camera: concedida_nesta_sessao }
  risco_da_proxima_acao: baixo
  alternativas_se_falhar: { camera: "descrever por texto", voz: "digitar" }
```

Regras condicionais típicas:
- **SE** a câmera estiver indisponível **ENTÃO** ofereça descrição por texto mantendo o restante do estado.
- **SE** a confiança na identificação for baixa **ENTÃO** destaque na tela o que foi reconhecido e peça confirmação antes de seguir.
- **SE** a próxima ação tiver impacto financeiro, legal ou irreversível **ENTÃO** exija revisão persistente em tela.

## 3. Forças e limites de cada modalidade

| Modalidade | Serve bem para | Cuidado com |
|---|---|---|
| Tela e toque | Comparar, revisar, selecionar com precisão, manter informação persistente | Excesso de informação, alvos pequenos, exigir mãos livres |
| Voz | Expressar intenção complexa rápido, mãos ocupadas | Ruído, privacidade, ambiguidade, revisar conteúdo longo |
| Câmera | Referenciar objetos, documentos, ambiente | Permissão, terceiros no quadro, luz, enquadramento, interpretação errada |
| IA (camada) | Relacionar sinais, manter contexto, adaptar resposta | Erro probabilístico, excesso de autonomia, opacidade |

## 4. Escolha da modalidade por contexto

A pergunta certa é: **qual modalidade reduz esforço sem aumentar risco neste momento?**

| Contexto | Principal | Apoio / fallback |
|---|---|---|
| Mãos ocupadas | Voz | Tela para revisar passos e confirmar |
| Comparar alternativas | Tela | Voz para refinar critérios |
| Identificar algo físico | Câmera + voz | Tela mostrando o que foi reconhecido |
| Ambiente público ou sensível | Texto + tela | Áudio opcional, nunca obrigatório |
| Ação financeira, jurídica ou irreversível | Tela com revisão explícita | Voz só como apoio, nunca escondendo a confirmação |
| Necessidade de acessibilidade ou preferência | Escolha da pessoa | Mecanismos concorrentes sempre que possível |

Voz não é "mais natural" por padrão: é ótima cozinhando, péssima num ônibus ou para revisar vinte opções.

## 5. Sete regras

1. **Tarefa antes da tecnologia.** Mapeie o que a pessoa precisa, onde está e o que a impede. **SE** um formulário simples resolve **ENTÃO** não adicione voz nem câmera.
2. **Preserve contexto na troca.** Objetos citados, filtros, escolhas, permissões e estado atravessam a mudança de modalidade. Trocar deve parecer trocar de instrumento, não de aplicativo.
3. **Use modalidades complementares.** Uma compensa o limite da outra: voz expressa, tela permite revisar, câmera mostra, áudio libera a atenção visual.
4. **Torne a percepção visível.** Indique quando microfone e câmera começam e param, o que está sendo analisado, o que foi enviado e como interromper. Permita conferir a referência interpretada antes de decisões importantes.
5. **Confirme o que importa em formato persistente.** Uma fala desaparece. Valores, destinatários e consequências de ações relevantes são revisados em tela (ver [`confirmar-acao-da-ia`](../../patterns/ia/confirmar-acao-da-ia.md)).
6. **Projete correção e fallback antes do caminho ideal.** Fala não reconhecida, câmera bloqueada, pouca luz, rede caindo, objeto identificado errado. Fallback é rota alternativa que preserva estado, não mensagem de erro final (ver [`recuperar-erro-da-ia`](../../patterns/ia/recuperar-erro-da-ia.md)).
7. **Nunca force uma modalidade.** Mecanismos de entrada disponíveis devem poder ser usados de forma concorrente (WCAG 2.5.6). Nova modalidade amplia caminhos; não vira requisito.

## 6. Acessibilidade não é "ter voz"

- Voz ajuda quem prefere não usar as mãos e cria barreira para quem não fala ou não pode falar no momento.
- Câmera ajuda a reconhecer objetos e é inviável sem luz, para pessoas com baixa visão em certas tarefas, ou quando captar imagem é inadequado.
- Mantenha **equivalência de informação**: resposta crítica apenas em áudio exclui quem não ouve ou precisa reler; confirmação apenas visual exclui o caso inverso. Decida o que precisa ser redundante, persistente ou adaptável.

## 7. Privacidade e confiança

Câmera e microfone captam o entorno: pessoas ao fundo, documentos, endereços, conversas alheias à tarefa. Permissão não é só o pop-up do sistema operacional. A experiência comunica:
- por que a captura é necessária;
- quando está ativa;
- o que foi enviado e para onde;
- como interromper;
- que alternativa existe.

Quando a IA interpreta a captura, mostre a conclusão antes de executar algo relevante. Interpretar intenção e executar consequência são problemas diferentes.

## 8. Anti-padrões

- **Teatro de modalidade:** voz ou câmera adicionadas porque existem, não porque resolvem.
- **Perda de estado na troca:** a pessoa repete filtros, referências ou dados.
- **Resposta monolítica:** tudo pela mesma modalidade (comparar 20 opções em áudio).
- **Captura escondida:** sensor ativo sem indicação clara.
- **Sem fallback:** o fluxo depende de reconhecimento perfeito.
- **Confundir multimodal com acessível.**
- **Automação prematura:** executar ação antes de resolver a confiança na interpretação.

## 9. Testes e métricas

Roteiro de teste deve incluir:
- troca de modalidade no meio da tarefa (começar por voz e continuar na tela; câmera e depois texto);
- condições reais: ruído, pouca luz, uma mão ocupada, rede instável, câmera bloqueada, reconhecimento errado;
- observação de repetição (a pessoa informa de novo algo já dito ou mostrado?);
- entendimento do estado (sabe o que o sistema ouve, vê, processa e vai fazer?);
- correção sem recomeçar;
- alternativa funcional quando uma modalidade não é desejável.

| Aspecto | Indicador | Revela |
|---|---|---|
| Conclusão | Sucesso da tarefa | Se a combinação chega ao resultado |
| Continuidade | Sucesso após troca de modalidade | Se o contexto sobrevive |
| Correção | Ciclos de correção por tarefa | Se erros de reconhecimento são reparáveis |
| Esforço | Tempo, repetições, passos supérfluos | Se a multimodalidade reduziu trabalho |
| Controle | Cancelamentos, desfazer, ações indevidas | Equilíbrio entre autonomia e confirmação |
| Preferência | Modalidade escolhida por contexto | Se o produto respeita condições reais |

Mais trocas de modalidade podem significar flexibilidade ou confusão; interprete com dados qualitativos.

## 10. Checklist

- [ ] Cada modalidade adicionada tem justificativa de redução de esforço.
- [ ] Existe especificação de estado compartilhado (objetivo, referências, escolhas, permissões, capturas ativas).
- [ ] A troca de modalidade não exige repetir informação.
- [ ] Indicadores visíveis de captura ativa e controle para interromper.
- [ ] Ações relevantes têm confirmação persistente em tela.
- [ ] Fallback definido para cada modalidade, preservando estado.
- [ ] Toda informação crítica tem equivalente em outra modalidade.
- [ ] Nenhuma modalidade é obrigatória quando há alternativa viável.
- [ ] Testes incluem trocas, condições adversas e erros de reconhecimento.
