---
id: divida-de-experiencia
area: ia
titulo: Dívida de experiência com IA, vibe coding e geradores de wireframe
evidencia: contextual
relacionados: [evals, pesquisa-com-ia, generative-ui, evidencia-e-fontes]
---

# Dívida de experiência com IA

> **Quando consultar**
> - Ao gerar telas, fluxos, componentes, textos ou código com IA (vibe coding, geradores de app, geradores de wireframe, agentes de código).
> - Quando o time entrega mais rápido mas suporte, exceções e componentes "quase iguais" aumentam.
> - Ao definir o papel do designer (ou do agente que faz design) num ciclo em que a IA executa.
> - Antes de aceitar uma saída gerada como pronta para produção.

## 1. Definição e tese

**Dívida de experiência** é o custo acumulado de decisões que resolvem a necessidade imediata e tornam o produto mais difícil de entender, usar, manter ou evoluir.

**Tese:** a IA barateia o rascunho, não o erro. Quando produzir fica quase gratuito, a capacidade de gerar passa a superar a capacidade de validar e de manter coerência. O freio natural que o custo de produzir impunha desaparece; se o ritual de decisão continua o mesmo, a IA vira uma fábrica de soluções plausíveis.

A pergunta útil deixa de ser "quanto aceleramos?" e passa a ser "o que não podemos mais deixar passar, agora que produzimos tanto?".

## 2. Quatro padrões de formação

1. **Solução antes do problema.** Pedidos como "coloque um assistente" ou "reduza os passos" parecem objetivos, mas não dizem qual necessidade, risco ou resultado estão em jogo. A IA responde bem à formulação errada.
2. **Erosão de consistência.** Cada pessoa usa prompts, modelos e referências diferentes; surgem variações de componente, estado vazio e mensagem de erro que não conversam entre si.
3. **Acessibilidade adiada.** A saída parece pronta e falha em foco, ordem de leitura, rótulos, contraste, erros e teclado. "Depois" vira retrabalho e barreira.
4. **Automação sem salvaguarda.** A IA recomenda, preenche ou age sem transparência, sem reversão e sem supervisão (ver `ux-para-agentes.md`).

## 3. Sinais de alerta

- Entregas aceleram e chamados de suporte, correções de comportamento e exceções sobem junto.
- Há muitos protótipos e ninguém sabe quais hipóteses foram testadas com pessoas.
- Decisões de interação não têm dono, critério ou vínculo com princípios.
- O design system recebe componentes "quase iguais" para entregas pontuais.
- Mensagens geradas soam naturais e não explicam estado, risco, próximo passo ou recuperação.
- Métricas mostram produção (telas, tickets fechados), não sucesso de tarefa nem confiança.

Nenhum sinal prova que a IA é a causa; todos indicam que só o output está sendo medido.

## 4. Controles: SE → ENTÃO

| SE (sinal) | Dívida | ENTÃO (controle) |
|---|---|---|
| Solução criada sem evidência | Decisão | Enquadrar problema e validar com pesquisa antes de construir |
| Componente novo sem necessidade clara | Consistência | Passar pela governança do design system; reusar o existente |
| Acessibilidade deixada para depois | Acessibilidade | Critérios de aceite e testes automatizados na definição de pronto |
| IA executa sem revisão ou reversão | Confiança e controle | Confirmação proporcional ao risco, histórico e desfazer |
| Mais entregas com mais suporte | Operacional | Medir tarefa, erro e contato com suporte, não só velocidade |
| Muitas alternativas sem critério | Decisão | Princípios, restrições e critérios de escolha explícitos |

### Portão de coerência (antes de publicar qualquer saída gerada)
- [ ] O padrão já existe no sistema? Se sim, foi reutilizado?
- [ ] A linguagem segue o glossário e o tom do produto?
- [ ] Estados de erro, vazio, carregando e recuperação estão desenhados?
- [ ] Funciona com teclado e tecnologia assistiva?
- [ ] A pessoa percebe quando a IA atuou?
- [ ] Dá para revisar, corrigir ou desfazer?
- [ ] Existe saída para pedir ajuda?
- [ ] Qual métrica dirá se funcionou?

### Proporcionalidade
- **SE** a mudança é de baixo impacto (variação de título numa área secundária) **ENTÃO** revisão editorial basta.
- **SE** afeta dinheiro, saúde, privacidade, acesso ou reputação **ENTÃO** exija critério explícito, rastreabilidade, revisão humana e teste no contexto real.

### Meça o custo evitado
Horas economizadas são métrica operacional. Acompanhe também sucesso de tarefa, abandono, erros, suporte, tempo de recuperação e confiança. Um fluxo criado na metade do tempo que aumenta contatos com suporte não ficou mais eficiente; o custo mudou de lugar.

### A IA também paga dívida
Use-a para **inspecionar**: comparar padrões entre telas, achar variações de componente, revisar microcópia, apontar estados ausentes, agrupar chamados recorrentes, preparar auditorias. A decisão sobre o que corrigir continua humana.

## 5. Vibe coding

Descrever em linguagem natural e deixar um agente gerar o código. Na forma inicial, o resultado era aceito quase sem revisão; a prática evoluiu para especificação precisa, revisão do output e validação de arquitetura.

### O que a IA não faz por você
Não considera casos de borda, carga cognitiva, contexto emocional ou modelo mental do usuário. Está comprometida em **dar uma resposta**, certa ou não para aquele fluxo. Não pergunta "e o estado de erro?", "e no mobile?", "isso já existe no sistema?". O designer é o filtro crítico entre o que é gerado e o que chega ao usuário.

### A ressaca do vibe coding
Débito técnico e visual acumulado ao avançar rápido sem revisão estrutural: o app funciona e ninguém sabe por quê; telas divergem sem que ninguém perceba; não há registro de decisão; a segunda versão exige reescrita quase total por falta de fundação.

Causa estrutural: sem contexto compartilhado, **cada geração é isolada**. Duas telas geradas separadamente divergem em cor, hierarquia tipográfica e comportamento de componentes parecidos.

**Antídoto:** estrutura desde o primeiro prompt.
- Defina tokens antes de gerar telas.
- Documente padrões antes de adicionar fluxos.
- Entregue um documento de contexto único (DESIGN.md: tokens, escalas, componentes, estados, voz) que toda geração lê.
- Trate cada geração como parte de um sistema; rode o portão de coerência e os gates de eval (tokens, contraste, catálogo).

Vibe coding amplifica o que já existe: com processo, acelera; sem processo, faz aparecer em horas problemas que antes levavam semanas.

### Escolha de ferramenta por estágio
| Estágio | Tipo de ferramenta | Limite |
|---|---|---|
| Explorar conceito, do zero ao MVP | Geradores de app por conversa | Sem contexto estruturado, telas novas contradizem as anteriores |
| Produção com controle | Editor de código com agente | Mais lento; exige familiaridade com a estrutura do projeto |
| Implementação alinhada ao sistema | Geradores de componente ligados ao design system | Genérico sem contexto visual claro |

## 6. Geradores de wireframe

Transformam descrição, esboço ou captura em estrutura inicial. São **ponto de partida de discussão**, não solução.

### Critérios de escolha
Fidelidade (baixa/alta), edição manual, edição por prompt de partes específicas, múltiplas telas e fluxos, uso de componentes do sistema, prototipação, exportação (design, código, PDF, imagem), colaboração, **privacidade** de prompts e imagens, continuidade para as próximas etapas.

### Fluxo
1. Organize fluxo e arquitetura de informação **antes** de promptar.
2. Especifique público, plataforma, tarefa, elementos obrigatórios e sequência.
3. Gere em **baixa fidelidade**, para não antecipar decisão visual.
4. Revise: tarefa definida por tela, início e fim do fluxo, ação clara, hierarquia, retorno e cancelamento, estados de erro/vazio/carregando/confirmação, formulários mínimos, componentes reconhecíveis, textos sem ambiguidade, teclado, regras de negócio representadas.
5. Itere e valide antes de desenvolver.

### Riscos
Acabamento polido esconde falha de navegação ou lógica; fluxos genéricos ignoram regra de negócio; funcionalidades não pedidas aparecem; estados alternativos faltam; resultado varia entre gerações; dado confidencial vai parar no prompt.

## 7. Papéis do designer quando a IA executa

| Papel | Responsabilidade | Entregável |
|---|---|---|
| **Arquiteto de contexto** | Criar e manter o contexto que orienta toda geração | DESIGN.md, camada de contexto de UX, catálogo com regras de uso |
| **Guardião de qualidade** | Decidir o que é bom o suficiente para chegar ao usuário | Rubricas, gates, revisão crítica do output |
| **Guardião de consistência** | Impedir divergência entre gerações e telas | Governança do sistema, auditoria de drift |

Habilidades que sobem de valor: **especificação precisa** (mais que "engenharia de prompt"), fluência em design system, e **letramento de revisão** de código gerado: reconhecer comportamento inesperado, estado ausente ou estrutura de dados errada para o fluxo, sem precisar ser desenvolvedor.

O trabalho se desloca de velocidade de execução para **qualidade de decisão**: enquadrar o problema, definir critério, antecipar falha, manter julgamento humano e saber o que não deveria existir. Há indício de que confiar mais na IA se associa a menos pensamento crítico percebido, e de que provocações (críticas e alternativas às sugestões) ajudam a recuperá-lo. `[evidência: contextual]` Por isso, peça à IA contra-argumentos e alternativas, não só a primeira resposta.

## 8. Anti-padrões

- Aceitar a primeira formulação do pedido como problema definido.
- Gerar telas sem tokens e sem documento de contexto.
- Criar componente novo por entrega em vez de reutilizar.
- Wireframe em alta fidelidade antes de validar fluxo.
- Medir sucesso por número de telas ou velocidade.
- Mandar dado confidencial para ferramenta sem política de privacidade conhecida.
- Tratar persona, síntese ou lista de dores gerada como descoberta (ver `pesquisa-com-ia.md`).

## 9. Checklist

- [ ] Problema, público, contexto, evidência, restrição e resultado esperado registrados antes do primeiro prompt.
- [ ] Documento de contexto (DESIGN.md) e catálogo entregues a toda geração.
- [ ] Portão de coerência aplicado a cada saída.
- [ ] Nível de validação proporcional ao risco.
- [ ] Acessibilidade na definição de pronto.
- [ ] Métricas incluem tarefa, erro, suporte e confiança.
- [ ] IA usada também para inspecionar e reduzir dívida existente.
