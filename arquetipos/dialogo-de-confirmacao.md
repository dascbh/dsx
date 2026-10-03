---
id: dialogo-de-confirmacao
titulo: Diálogo de confirmação
resumo: Interrupção curta que pede uma decisão explícita antes de uma ação de consequência séria, dizendo o que vai acontecer e com o quê.
registro: [operacional, consumo]
quando-usar: SE a ação é irreversível, afeta outras pessoas ou tem custo alto e não pode ser desfeita depois ENTÃO use diálogo de confirmação
evitar-quando: a ação é reversível (ofereça desfazer), é frequente e de baixo risco ou a confirmação seria só um hábito de clicar em sim
regioes: [cabecalho-do-dialogo, corpo-do-dialogo, rodape-do-dialogo]
acao-primaria: { regiao: rodape-do-dialogo, posicao: rodape-direita, max: 1 }
estados: [aberto, executando, erro, sucesso]
padroes: [confirmar-acao, confirmar-exclusao, acao-destrutiva, desfazer, texto-de-botao, fechar-modal, foco-de-teclado, hierarquia-de-botoes, clique-duplo-em-envio, confirmar-acao-da-ia, quando-usar-modal]
variacoes: [confirmacao-simples, digitar-para-confirmar, desfazer-em-vez-de-confirmar, confirmacao-com-consequencias-listadas]
regras: [T1, T2, T5, T6, T7, F4]
---

# Diálogo de confirmação

"Excluir projeto", "Enviar 12 minutas para assinatura", "Revogar acesso de Ana", "Aplicar sugestões do agente a 300 itens". Confirmação existe para dar uma última chance consciente — e só funciona se for rara. Confirmar tudo treina a pessoa a clicar sem ler, e a confirmação que importava passa batida.

## Quando usar

- **SE** a ação não pode ser desfeita (exclusão definitiva, envio a terceiros, cobrança) **ENTÃO** use diálogo de confirmação.
- **SE** a ação pode ser desfeita **ENTÃO** não confirme: execute e ofereça desfazer (variação `desfazer-em-vez-de-confirmar`).
- **SE** o alvo é de grande impacto (organização inteira, projeto com dados de muitas pessoas) **ENTÃO** use `digitar-para-confirmar`.
- **SE** a ação afeta vários itens ou tem efeitos colaterais **ENTÃO** use `confirmacao-com-consequencias-listadas`, com contagem e exemplos.
- **SE** a ação foi proposta por um agente de IA **ENTÃO** a confirmação mostra exatamente o que será feito e em quais itens, e a pessoa decide; nunca execute por padrão.
- **SENÃO** (ação comum e de baixo risco) **ENTÃO** execute direto com feedback.

## Mapa de regiões

```
┌──────────────────────────────────────────┐
│ cabecalho-do-dialogo                      │
│  Excluir o projeto "Aquisição Beta"? (h2) │
├──────────────────────────────────────────┤
│ corpo-do-dialogo                          │
│  Os 48 documentos e o checklist serão     │
│  excluídos. Esta ação não pode ser        │
│  desfeita.                                │
├──────────────────────────────────────────┤
│ rodape-do-dialogo  [Cancelar] [Excluir    │
│                                 projeto]  │
└──────────────────────────────────────────┘
```

## O que vai em cada região

- **cabecalho-do-dialogo** — pergunta com o verbo e o alvo nomeado ("Excluir o projeto Aquisição Beta?"), nunca "Tem certeza?" ou "Atenção".
- **corpo-do-dialogo** — consequência concreta em uma ou duas frases: o que some, quem é afetado, se pode ser desfeito; quando houver, o campo de digitar o nome, com rótulo visível.
- **rodape-do-dialogo** — "Cancelar" antes da ação, na ordem do produto; a ação repete o verbo e o objeto ("Excluir projeto") e usa o estilo destrutivo quando apaga ou revoga.

## Ações

- **Primária:** uma, no `rodape-do-dialogo`, rodape-direita — o próprio verbo da ação com objeto; destrutiva com estilo de perigo. Nunca "Confirmar", "Sim" ou "OK".
- **Foco inicial:** em "Cancelar" (ou no campo de digitar) quando a ação é destrutiva; Enter não deve executar a destrutiva por acidente.
- **Cancelar / Esc / ✕:** fecham sem efeito e devolvem o foco ao controle de origem.
- **Execução:** bloqueia clique duplo; o diálogo só fecha depois do resultado.

## Estados

- **aberto** — pergunta, consequência e ações; na variação de digitar, a ação fica desabilitada até o texto conferir, com a regra dita no rótulo.
- **executando** — ação com indicador, ambos os botões bloqueados; para lotes longos, progresso.
- **erro** — falha: mensagem no corpo dizendo o que não aconteceu (e, em lote, quantos itens foram e quantos não), opção de tentar de novo.
- **sucesso** — diálogo fecha, confirmação breve na tela de origem com o resultado ("Projeto excluído"); em lote, resumo com contagem.

## Variações

### confirmacao-simples
Pergunta, consequência, Cancelar e ação.
**Favorece:** irreversíveis de alvo único e impacto moderado.
**Piora:** se usada para tudo, vira clique automático.

### digitar-para-confirmar
A pessoa digita o nome do alvo para habilitar a ação.
**Favorece:** alvos de grande impacto; impede confirmação por reflexo.
**Piora:** atrito alto; usada em ações comuns, irrita e é contornada com copiar e colar.

### desfazer-em-vez-de-confirmar
Sem diálogo: a ação executa e uma notificação oferece "Desfazer" por alguns segundos.
**Favorece:** ações reversíveis e frequentes (arquivar, mover); fluxo sem interrupção.
**Piora:** exige que o sistema realmente consiga desfazer; a notificação precisa durar o bastante e ser alcançável por teclado.

### confirmacao-com-consequencias-listadas
Corpo com contagem, lista resumida dos itens afetados (os primeiros e "mais N") e efeitos colaterais.
**Favorece:** ações em lote e propostas de agente; a pessoa vê o alcance real.
**Piora:** diálogo maior; lista longa precisa de rolagem própria e resumo no topo.

## Anti-padrões

- "Tem certeza?" com botões "Sim" e "Não".
- Confirmação para ação reversível e frequente.
- Foco inicial no botão destrutivo.
- Botão destrutivo com estilo de primária comum.
- Confirmação que não diz o que será perdido.
- Confirmação aberta sobre outro diálogo.
- Ação de agente executada antes de a pessoa ver o alcance.

## Checklist

- [ ] Usada só para irreversível, de alto custo ou que afeta terceiros.
- [ ] Título com verbo e alvo nomeado; corpo com a consequência concreta.
- [ ] Ação com verbo + objeto, estilo destrutivo quando apaga; nunca rótulo genérico.
- [ ] "Cancelar" antes da ação; foco inicial seguro.
- [ ] Execução protegida contra clique duplo; diálogo fecha só com o resultado.
- [ ] Em lote, contagem antes e resumo depois.
- [ ] Nenhum diálogo empilhado.
