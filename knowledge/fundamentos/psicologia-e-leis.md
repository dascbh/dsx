# Psicologia cognitiva e leis de UX

> **Quando consultar**
> - Ao decidir quantas opções, campos ou ações mostrar numa tela.
> - Ao dimensionar e posicionar alvos clicáveis e ações perigosas.
> - Ao agrupar elementos, escolher contêineres e espaçamentos.
> - Ao justificar por que algo "não parece clicável" ou "não funciona como esperado".
> - Ao revisar textos que enquadram escolhas (preço, risco, recusa) ou ao questionar uma solução querida pelo time.

Estas leis descrevem tendências da percepção e da decisão humana. Use-as para **justificar e prever**, não como fórmulas que substituem teste.

---

## 1. Carga cognitiva

A memória de trabalho é pequena. Cada esforço gasto para decifrar a tela é esforço que sai da tarefa.

| Tipo | O que é | O que fazer |
|---|---|---|
| Intrínseca | Complexidade própria da tarefa (declarar imposto, configurar permissões) | Não dá para eliminar; organize em fases e dê bons padrões |
| Extrínseca | Esforço criado pela apresentação (rótulos vagos, excesso, instruções longe da ação, ordem ilógica) | **Elimine.** É onde o design mais ganha |
| Pertinente | Esforço que constrói entendimento útil | Preserve; nem todo esforço é ruim |

**Regras**
- Mostre só o necessário para o próximo passo; o resto sob demanda.
- Ponha instruções junto do controle a que se referem.
- Prefira reconhecimento: listas, sugestões, valores recentes, resumo do passo anterior.
- Use padrões sensatos (defaults) quando a maioria escolheria o mesmo.
- Agrupe e hierarquize; um bloco de 20 itens soltos custa mais que 4 grupos de 5.
- Mantenha padrões consistentes; cada variação é algo novo a aprender.

**Anti-padrões**
- Supor que menos elementos sempre significa menos esforço (remover contexto necessário aumenta a carga).
- Subdividir demais: telas curtas em excesso trocam leitura por navegação.
- Ícones sem rótulo para economizar espaço.
- Simplificar a ponto de tirar controle da pessoa.

**Sinais observáveis de sobrecarga:** hesitação, voltas de navegação, erros repetidos, pedidos de ajuda, abandono.

---

## 2. Lei de Fitts

O tempo para alcançar um alvo cresce com a distância e diminui com o tamanho: `T = a + b · log2(1 + D/L)` (D = distância, L = largura do alvo no eixo do movimento).

**Regras**
- Ponha a ação perto de onde a atenção já está ("Continuar" logo abaixo do último campo).
- A área acionável pode e deve ser maior que o ícone visível (padding de toque).
- Ações frequentes ou importantes ganham área maior.
- Bordas e cantos da tela funcionam como alvos "infinitos" para ponteiro; use-os para menus fixos em desktop.
- Afaste controles concorrentes; ações destrutivas recebem distância de segurança da ação mais comum.
- Considere uso com uma mão no celular: a parte inferior central é mais alcançável que os cantos superiores.

**Limiares de tamanho**

| Referência | Mínimo |
|---|---|
| WCAG 2.2 AA (2.5.8) | 24 × 24 px CSS, ou espaçamento equivalente até o vizinho |
| WCAG 2.2 AAA (2.5.5) | 44 × 44 px CSS |
| Diretriz iOS | 44 × 44 pt |
| Diretriz Android | 48 × 48 dp |
| Distância entre alvos de toque | ≥ 8 px |

SE o alvo é de toque ENTÃO projete com 44–48 px; trate 24 px como piso legal, não como meta. Ver [alvo-de-toque](../../patterns/acessibilidade/alvo-de-toque.md) e [botao-flutuante](../../patterns/acoes/botao-flutuante.md).

**Limites.** Fitts mede movimento, não compreensão. Não resolve rótulo ambíguo, dúvida entre opções ou recuperação de erro.

---

## 3. Lei de Hick

O tempo de decisão cresce (de forma logarítmica) com o número de alternativas equivalentes. Cinco ações de mesmo peso custam mais que duas, e custam ainda mais se forem parecidas.

**Regras**
- Formule a decisão principal da tela numa frase antes de distribuir os elementos.
- Destaque **uma** ação recomendada; mantenha as alternativas acessíveis, com menor peso. Ver [hierarquia-de-botoes](../../patterns/acoes/hierarquia-de-botoes.md).
- Agrupe opções em categorias reconhecíveis pelo público (valide com card sorting).
- Em listas longas, ofereça busca e filtros em vez de rolagem ([estrutura-de-filtros](../../patterns/busca-filtros/estrutura-de-filtros.md)).
- Separe o comum do avançado com rótulo específico ("Configurações avançadas de cobrança", não "Mais opções").
- Ao reduzir opções por contexto, explique o critério e permita ver tudo.

**Decisões**
- SE há mais de 7 ações de mesmo nível numa barra ENTÃO agrupe, priorize ou mova para menu de overflow.
- SE o público é especialista e usa tudo com frequência ENTÃO exponha a complexidade bem agrupada em vez de escondê-la.
- SE a redução de opções esconde custo, cancelamento ou recusa ENTÃO pare: é dark pattern ([dark-patterns.md](dark-patterns.md)).

**Contextos de risco:** onboarding com vários caminhos, checkout com tudo ao mesmo tempo, comparação de planos, configurações que misturam básico e técnico, catálogo sem filtros.

---

## 4. Gestalt

A percepção agrupa elementos antes de ler o conteúdo. Use o agrupamento para comunicar estrutura.

| Princípio | Regra operacional |
|---|---|
| Proximidade | Rótulo, campo e ajuda juntos; espaço **entre** grupos claramente maior que **dentro** (proporção ≥ 2:1, ex. 8 px dentro, 24 px entre) |
| Semelhança | Mesma aparência = mesma função. Diferença visual só para diferença funcional |
| Região comum | Card, painel ou fundo indica pertencimento. Use com parcimônia; cards demais viram ruído |
| Figura e fundo | O principal se destaca por contraste e escala; se tudo é intenso, nada se destaca |
| Continuidade | Alinhamentos e eixos guiam o olho; desalinhamento acidental parece erro |
| Fechamento | A mente completa formas; ícones podem ser simples, mas ações essenciais precisam de rótulo |
| Simetria e ordem | Grades e listas alinhadas parecem estáveis e previsíveis |

**Anti-padrões:** aplicar semelhança a elementos de funções diferentes; espaço uniforme que não distingue grupos; cards dentro de cards; priorizar simetria sobre a conclusão da tarefa.

---

## 5. Affordance e signifiers

- **Affordance real:** a ação existe no sistema.
- **Affordance percebida:** o que a pessoa acredita que pode fazer.
- **Signifier:** a pista (visual, textual, espacial, sonora) que comunica onde e como agir.

O problema de interface quase sempre é de signifier: algo clicável que parece texto, ou texto que parece botão.

**Por elemento**

| Elemento | Signifiers mínimos |
|---|---|
| Botão | Preenchimento ou borda, contraste, rótulo com verbo, estados hover/foco/pressionado/desabilitado |
| Link | Cor distinta **e** sublinhado (ou outra pista além da cor) no corpo do texto |
| Campo | Borda ou fundo, rótulo persistente, foco visível |
| Controle (toggle, checkbox) | Estado atual legível sem depender só de cor |

**Regras**
- O que é clicável parece clicável; o que não é, não parece.
- Rótulos descrevem a consequência ("Excluir projeto"), não o genérico ("OK").
- Projete todos os estados antes de validar.
- Não dependa só de cor ou movimento; garanta nome acessível e foco visível ([foco-de-teclado](../../patterns/acessibilidade/foco-de-teclado.md)).

Ver [link-vs-botao](../../patterns/acoes/link-vs-botao.md), [botao-desabilitado](../../patterns/acoes/botao-desabilitado.md).

---

## 6. Modelos mentais

Modelo mental é a explicação interna e incompleta que a pessoa usa para prever como algo funciona. Três modelos precisam coincidir: o do usuário, o conceitual do designer e o implementado no sistema.

**Regras**
- Siga convenções que o público já domina (Lei de Jakob).
- Torne visíveis modos, filtros e permissões ativos; estado oculto gera "por que fez isso?".
- Dê feedback compreensível sobre a consequência de cada ação importante.
- Ofereça reversibilidade; ela reduz ansiedade e estimula exploração.
- Use o vocabulário do domínio do usuário, não o do time.

**Como descobrir o modelo do público:** entrevistas sobre tarefas reais (vocabulário espontâneo, expectativa do que acontece), card sorting, tree testing, teste com pensar em voz alta pedindo a expectativa **antes** do clique.

**Anti-padrões:** projetar pelo modelo do time; copiar concorrente sem entender por quê; mudar padrão de forma brusca sem transição; confundir metáfora visual com explicação.

---

## 7. Vieses que afetam decisões de design

### Enquadramento (framing)

A forma de apresentar muda a decisão mesmo com fatos idênticos (Kahneman e Tversky).
- Atributo: "99% de disponibilidade" vs. "1% de indisponibilidade".
- Meta: ganho de agir ("Garanta sua vaga") vs. perda de não agir ("Não fique de fora").
- Denominação: "R$ 3,30 por dia" vs. "R$ 1.200 por ano".

**Regras**
- Use enquadramento para ajudar a ver valor **real**, com o total sempre visível. SE mostra preço por dia ENTÃO mostre também o total cobrado e a periodicidade.
- Enquadramento de perda só quando o risco é real (segurança, saúde, finanças).
- SE o enquadramento esconde custo, induz por culpa ou dificulta a saída ENTÃO é dark pattern.

### Viés de confirmação

Tendência a buscar e valorizar o que confirma a hipótese prévia.
- Em pesquisa: perguntas indutivas ("achou fácil, né?").
- Em design: protótipo polido demais faz crítica virar "erro do usuário".
- Em métrica: escolher só o número que confirma.

**Mitigação:** escreva antes o que provaria que a hipótese está errada; use perguntas abertas e neutras; triangule qualitativo e quantitativo. **Para agentes:** trate a própria primeira solução como suspeita e procure o caso que a quebra.

### Kill your darlings

Abandonar ideias atraentes que não servem à tarefa. Custo irrecuperável e apego seguram ideias fracas.

**Sinais de ideia zumbi:** precisa de explicação longa para ser "intuitiva"; uso raro (abaixo de ~5% do público); resolve problema hipotético; desvia da tarefa principal; manutenção custa mais que o valor.

**Ferramentas:** RICE (alcance × impacto × confiança ÷ esforço); MoSCoW, decidindo explicitamente o que fica de fora. Critique a solução, nunca a pessoa; registre o que foi descartado e por quê.

---

## Checklist de auditoria

- [ ] A tela tem uma decisão principal identificável e uma ação recomendada destacada (Hick).
- [ ] Opções numerosas estão agrupadas, filtráveis ou em revelação progressiva, sem esconder o crítico.
- [ ] Alvos de toque ≥ 44 px (mínimo absoluto 24 px) e ≥ 8 px entre vizinhos (Fitts).
- [ ] Ação principal perto do conteúdo que a motiva; ação destrutiva afastada.
- [ ] Espaço entre grupos claramente maior que dentro dos grupos (Gestalt).
- [ ] Mesma aparência só para mesma função; cards usados com parcimônia.
- [ ] Todo elemento clicável tem signifier além da cor; nada não clicável parece botão.
- [ ] Modos, filtros e permissões ativos são visíveis.
- [ ] Instruções junto ao controle; nenhum dado precisa ser memorizado entre telas.
- [ ] Preço e risco apresentados com total e periodicidade, sem enquadramento manipulador.
- [ ] A solução proposta foi confrontada com pelo menos um contra-exemplo.
