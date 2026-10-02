# Tendências (sinais e hipóteses)

> **Quando consultar**
> - Ao projetar produtos com IA que age em nome da pessoa, interfaces geradas dinamicamente ou fluxos que outros agentes vão consumir.
> - Ao discutir direção de produto ou de design system para os próximos anos.
> - **Não** use este arquivo como fonte de regra. Tudo aqui é sinal ou hipótese; as regras vivem nos outros arquivos de fundamentos e nos pattern cards.

**Status do conteúdo:** leituras do mercado em 2026 sobre o que tende a ganhar peso em 2027. Cada item traz o sinal, a hipótese de impacto, o risco e o que já é prudente fazer (que costuma ser a aplicação de princípios estáveis a um contexto novo). Revise este arquivo a cada ciclo; descarte o que não se confirmar.

---

## Leitura geral

**Sinal:** o trabalho de design desloca-se de desenhar telas para desenhar **comportamento**: o que o sistema faz em nome da pessoa, com que limites, com que registro e com que recuperação.

**Hipótese:** a qualidade de um produto passa a ser julgada tanto pelas decisões que o sistema toma quanto pela interface que exibe.

---

## Sinais de UX

### 1. UX agêntica
- **Sinal:** sistemas interpretam objetivos e executam várias etapas sozinhos.
- **Hipótese:** o design passa a definir portões de decisão, níveis de autonomia e fricção estratégica.
- **Risco:** autonomia sem supervisão; boa parte de projetos agênticos pode ser abandonada por custo e governança fraca.
- **Prudente hoje:** toda ação com consequência mostra o que vai fazer e pede confirmação proporcional ao risco ([confirmar-acao-da-ia](../../patterns/ia/confirmar-acao-da-ia.md)); registro legível do que foi feito; desfazer.

### 2. Interfaces contextuais e generativas
- **Sinal:** telas montadas em tempo real conforme contexto.
- **Hipótese:** o design system vira um conjunto de regras e limites do que pode ser gerado, mais que uma biblioteca de telas.
- **Risco:** perda de previsibilidade, consistência e acessibilidade em combinações não testadas.
- **Prudente hoje:** validar automaticamente cada variação gerada contra tokens, estados e WCAG.

### 3. Confiança como camada funcional
- **Sinal:** transparência deixa de ser texto legal e vira parte da interface.
- **Hipótese:** origem do conteúdo, nível de certeza e histórico de ações tornam-se componentes padrão.
- **Risco:** rótulo genérico "gerado por IA" que não informa nada; ou explicação demais, que sobrecarrega.
- **Prudente hoje:** rotular com propósito ([rotular-conteudo-ia](../../patterns/ia/rotular-conteudo-ia.md)), mostrar fontes ([fontes-da-ia](../../patterns/ia/fontes-da-ia.md)) e incerteza ([incerteza-da-ia](../../patterns/ia/incerteza-da-ia.md)).

### 4. IA invisível
- **Sinal:** automações antecipam necessidades e removem passos.
- **Hipótese:** menos interação explícita, mais resultado pronto.
- **Risco:** lógica relevante escondida; difícil retomar o controle; produto "parece não fazer nada".
- **Prudente hoje:** mostrar o que foi feito automaticamente e como reverter ([revisar-resultado-da-ia](../../patterns/ia/revisar-resultado-da-ia.md)).

### 5. Agentes como usuários
- **Sinal:** agentes de software navegam, preenchem formulários e compram.
- **Hipótese:** dados estruturados, semântica correta e políticas claras viram parte da experiência.
- **Risco:** injeção de instruções por conteúdo externo; dados desatualizados replicados em escala.
- **Prudente hoje:** HTML semântico, rótulos associados, `autocomplete` correto e estados explícitos já servem a pessoas e a agentes ([formularios.md](formularios.md)).

### 6. Pesquisa aumentada por IA
- **Sinal:** transcrição e síntese ficam rápidas e baratas.
- **Hipótese:** o gargalo passa a ser formular boas perguntas e julgar nuance.
- **Risco:** usuários sintéticos produzem respostas superficiais ou favoráveis demais.
- **Prudente hoje:** usar simulação só para gerar hipóteses, nunca como evidência ([avaliacao-de-usabilidade.md](avaliacao-de-usabilidade.md)).

### 7. Design systems para humanos e agentes
- **Sinal:** agentes geram interface a partir de componentes e tokens.
- **Hipótese:** documentação legível por máquina (regras, decisões SE/ENTÃO, anti-padrões) vira parte do design system.
- **Risco:** saída plausível e errada: estado faltando, contraste insuficiente, token ignorado.
- **Prudente hoje:** validar toda saída gerada (código, estados, acessibilidade) antes de aceitar.

### 8. Acessibilidade como governança
- **Sinal:** falhas automáticas detectáveis (contraste, campos sem rótulo, imagens sem alternativa) continuam presentes na grande maioria dos sites.
- **Hipótese:** acessibilidade migra de checklist pós-lançamento para regra contínua em componentes e CI.
- **Prudente hoje:** testes automáticos de acessibilidade no pipeline e revisão manual dos fluxos críticos.

### 9. Avaliação do comportamento da IA
- **Sinal:** times de UX passam a usar evals.
- **Hipótese:** critérios de UX (interpretou o objetivo? pediu confirmação? comunicou incerteza? recuperou o erro?) entram nos conjuntos de avaliação.
- **Prudente hoje:** escrever casos de teste para ambiguidade, falha e recuperação ([recuperar-erro-da-ia](../../patterns/ia/recuperar-erro-da-ia.md)).

### 10. Prêmio humano
- **Sinal:** execução fica barata.
- **Hipótese:** ganham valor julgamento, pesquisa de qualidade, acabamento, empatia e escolha do que **não** construir.

---

## Sinais de produto digital

| Sinal | Hipótese | Cuidado |
|---|---|---|
| Produtos nativos de IA | IA como proposta central, não chat anexado | Valor real vs. novidade |
| Agentes executores | "Estados de autonomia" projetados (sugere, prepara, executa com confirmação, executa sozinho) | Limites e reversão claros |
| Experiência por intenção | A pessoa descreve o resultado; o sistema traduz em operações | Confirmar diante de ambiguidade |
| Automação proativa | Evolução reativo → assistivo → proativo → autônomo | Permitir desligar e ajustar |
| Hiperpersonalização | Experiência ajustada ao indivíduo | Depende de dados confiáveis e consentidos; explicar o porquê |
| Software legível por máquina | API e dados estruturados como parte da UX | Segurança e atualização |
| Soluções verticais e regionais | Especialização vence generalismo | Linguagem e regulação locais |
| Cobrança por uso/resultado | Preço ligado a valor entregue | Transparência de custo ([dark-patterns.md](dark-patterns.md)) |
| Velocidade vs. relevância | Construir é barato; escolher o que construir é o gargalo | Discovery ganha peso |
| Confiança como funcionalidade | A pessoa precisa saber o quê, por quê e como retomar o controle | Sem sobrecarregar de explicação |

---

## Princípios estáveis que estas tendências reforçam

Estas não são hipóteses; são regras já presentes nos outros arquivos, com peso maior em produtos com IA:

- Ação com consequência → prévia do que vai acontecer, confirmação proporcional ao risco, registro, desfazer ([heuristicas-nielsen.md](heuristicas-nielsen.md), H3 e H5).
- Mostrar incerteza e fontes em vez de confiança fingida (H1, H9).
- Não esconder decisões relevantes em nome de menos cliques (H1, [dark-patterns.md](dark-patterns.md)).
- Toda variação gerada passa pela mesma auditoria de acessibilidade e estados.

---

## Checklist de auditoria

- [ ] Nenhuma decisão de design foi justificada **apenas** por uma tendência deste arquivo.
- [ ] Ações executadas por IA têm prévia, confirmação proporcional ao risco, histórico e desfazer.
- [ ] Conteúdo gerado é rotulado com propósito, com fontes e incerteza quando relevantes.
- [ ] Automações mostram o que fizeram e como reverter.
- [ ] Interfaces geradas foram validadas contra tokens, estados e WCAG.
- [ ] Simulações com IA foram tratadas como hipótese, não como evidência.
- [ ] Este arquivo foi revisado no último ciclo e itens não confirmados foram removidos.
