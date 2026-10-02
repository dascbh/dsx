# Ética e inclusão em pesquisa

## Quando consultar

- Ao planejar qualquer estudo com pessoas: recrutamento, consentimento, gravação, armazenamento e compartilhamento.
- Ao decidir compensação/incentivo.
- Ao incluir pessoas com deficiência, usuários de tecnologia assistiva ou grupos vulneráveis.
- Ao implantar heatmap, session replay ou qualquer coleta de comportamento.
- Ao enviar transcrições ou gravações para ferramentas de IA, transcrição ou nuvem.
- Ao desenhar experimentos (fake door, A/B) que afetam pessoas reais.

Este arquivo não é parecer jurídico. Questões de base legal, dados sensíveis e transferência internacional vão para jurídico/privacidade.

## 1. Três camadas que não se confundem

1. **Padrão ético**: respeito, ausência de dano, honestidade, autonomia da pessoa.
2. **Consentimento informado**: a pessoa entende e aceita o que vai acontecer.
3. **Conformidade com a LGPD**: tratamento de dados pessoais com base legal, finalidade, necessidade, transparência e segurança.

Assinar um termo não resolve as três. Consentimento é uma das bases legais previstas na LGPD, não a única; a escolha da base é decisão jurídica.

## 2. Princípios operacionais

- **Minimização**: colete só o que a pergunta exige. Se a idade exata não muda o recrutamento nem a análise, peça faixa ou nada.
- **Participação informada como processo**: explique antes, relembre no início da sessão, permita retirar a participação depois.
- **Autorização em camadas**: permita aceitar a entrevista sem câmera, a gravação só de áudio, o uso interno sem uso em apresentações externas.
- **Mapeamento do ecossistema de dados**: cada ferramenta de transcrição, IA ou nuvem é um novo operador. Verifique retenção, uso para treinamento de modelos e exclusão **antes** de subir material identificável.
- **Equilíbrio de poder**: funcionário convidado pelo chefe, cliente que depende do serviço, incentivo alto para quem está em situação vulnerável. Ajuste o desenho para que recusar seja realmente possível.
- **Autoridade de interromper**: o pesquisador pode pausar, pular perguntas ou encerrar se a dignidade ou o bem-estar estiverem em risco.

## 3. Consentimento: o que a pessoa precisa saber

Em linguagem simples, antes da sessão:

- Quem conduz e para quê (finalidade ligada à decisão).
- O que será feito e por quanto tempo.
- O que será registrado (áudio, vídeo, tela, notas) e se é opcional.
- Quem vai acessar, inclusive observadores. Observadores silenciosos devem ser anunciados.
- Onde fica guardado, por quanto tempo, e como será descartado.
- Se trechos (falas, clipes) poderão ser mostrados e para quem.
- Compensação e que ela não depende do desempenho nem de opinião favorável.
- Que pode parar a qualquer momento, sem consequência, e como pedir exclusão depois.
- Contato para dúvidas.

Template de abertura de sessão está em `templates/roteiro-entrevista.md` e `templates/roteiro-teste-usabilidade.md`.

## 4. Tratamento de dados (orientado pela LGPD)

Checklist de planejamento:

- [ ] Finalidade escrita: que decisão este estudo apoia?
- [ ] Lista de dados coletados, cada um com justificativa.
- [ ] Sensibilidade esperada (saúde, finanças, crenças, dados de menores).
- [ ] Escopo de gravação definido.
- [ ] Quem acessa o quê (bruto vs. síntese).
- [ ] Ferramentas de terceiros verificadas.
- [ ] Prazo de retenção por tipo de material (gravação, transcrição, notas, síntese).
- [ ] Mecanismo de retirada e exclusão.
- [ ] Regras de compartilhamento de falas e clipes.

Regras:

- **Pseudonimização** (P01, P02…) não é **anonimização**. Em amostras pequenas, combinar cargo, empresa e cidade pode reidentificar alguém. Remova ou generalize atributos combinados.
- Guarde a chave que liga pseudônimo e identidade separada do material de pesquisa, com acesso restrito.
- Dados públicos continuam protegidos; reuso exige considerar finalidade original e expectativa da pessoa.
- Defina retenção curta para gravações brutas; mantenha a síntese pseudonimizada por mais tempo, se necessário.
- Clipes e prints em apresentações: borre rostos, nomes e dados na tela, salvo autorização específica.

**SE** houver base legal incerta, dados sensíveis, menores, transferência internacional, contrato de fornecedor pouco claro, reuso de base antiga ou domínio de alto risco (saúde, finanças, segurança) **ENTÃO** escale para jurídico/privacidade antes de coletar.

### Heatmaps e session replay

- Mascare campos sensíveis (documentos, dados financeiros, senhas, texto livre) **antes** da coleta, não depois.
- Base legal, transparência na política de privacidade e consentimento revogável quando aplicável.
- Acesso restrito e retenção definida.
- Conformidade declarada pelo fornecedor não garante conformidade da sua implementação; teste a máscara.

### Experimentos com pessoas reais

- Fake door: saída honesta e imediata; nunca cobrar por algo inexistente; nada de urgência ou escassez falsas; não usar em fluxos de pagamento, saúde ou segurança.
- A/B: defina guardrails e critério de interrupção por dano; não teste manipulação, preço discriminatório ou dark patterns.

## 5. Compensação

- Compense pelo **tempo**, não pelo resultado. Nunca condicione a conclusão de tarefas, a opiniões favoráveis ou a "boa participação".
- Pague também quem desistiu no meio ou cuja sessão falhou por problema técnico do estudo.
- Valor proporcional ao tempo e ao perfil (especialistas e profissionais costumam exigir mais), sem ser tão alto que pressione quem está em situação vulnerável a aceitar.
- Inclua o tempo extra de adaptações (pausas, configuração de tecnologia assistiva) no cálculo.
- Informe o valor e a forma de pagamento no convite. Ofereça formatos acessíveis de recebimento.
- Em B2B, verifique se a empresa do participante permite receber incentivo; ofereça alternativas (doação, por exemplo).

## 6. Pesquisa inclusiva

Diferencie duas coisas:

- **Acessibilidade do estudo**: a pessoa consegue participar (convite, triagem, agendamento, consentimento, plataforma, sessão).
- **Teste de acessibilidade do produto**: a interface funciona com tecnologias assistivas e cumpre padrões (WCAG 2.2).

Regras:

1. Escreva pergunta específica: "como usuários de leitor de tela percebem, corrigem e confirmam erros no checkout mobile?", não "testar acessibilidade".
2. Recrute por **necessidade funcional e tecnologia usada** (leitor de tela, ampliação, controle por voz, navegação por teclado, legendas), dispositivo, sistema e experiência na tarefa. Diagnóstico sozinho não define o comportamento.
3. Inclua pessoas com deficiência desde as primeiras rodadas. Inclusão no final reduz a influência sobre as decisões.
4. Evite participação simbólica: uma pessoa não representa um grupo inteiro. Escreva "neste estudo, uma participante usando leitor de tela não percebeu a mensagem de erro", nunca "pessoas cegas não conseguem usar".
5. Torne acessíveis o convite, o formulário de triagem, o termo de consentimento, o agendamento e a ferramenta de chamada.
6. Faça verificação técnica antes da sessão: protótipo com nomes acessíveis e foco por teclado, compatibilidade com a tecnologia da pessoa, áudio, legendas.
7. Negocie adaptações individualmente (tempo extra, pausas, formato do material, intérprete de Libras, uso do próprio dispositivo e configuração habitual). Documente.
8. Na sessão: mesma disciplina metodológica de sempre; não complete frases; fale com o participante, não com o acompanhante.
9. Na análise, separe a origem da barreira: produto, estudo (protótipo inacessível, instrução confusa) ou contexto (conexão, ambiente).
10. Variação entre participantes é dado, não ruído.
11. Não trate participantes como consultores universais de acessibilidade.

Matriz de planejamento:

| Necessidade de acesso | Método | Adaptação | Evidência observável | Limitação |
|---|---|---|---|---|
| <ex.: leitor de tela no celular> | <teste moderado remoto> | <usa o próprio aparelho; +15 min> | <percebe e corrige erro de campo> | <um único leitor/sistema testado> |

Pesquisa inclusiva não garante representatividade estatística, conformidade total nem ausência de barreiras. Declare isso.

Inclusão vai além de deficiência: considere letramento, idioma, conectividade, dispositivos modestos, faixa etária, região e renda no recrutamento quando forem relevantes para o público do produto.

## Armadilhas

- Acumular gravações sem política de retenção.
- Confundir conveniência com conformidade (subir transcrição numa ferramenta de IA sem checar).
- Observadores invisíveis.
- Recrutar sempre os mesmos perfis "fáceis".
- Generalizar a experiência de uma pessoa com deficiência para todo um grupo.
- Compensação condicionada a desempenho.

## O que um agente pode / não pode fazer

> **Pode:** revisar o plano contra os checklists deste arquivo; propor lista mínima de dados; redigir termos e convites em linguagem simples; sugerir adaptações e verificar acessibilidade de materiais; pseudonimizar transcrições; sinalizar quando o caso deve ir a jurídico/privacidade.
>
> **Não pode:** decidir base legal ou aprovar tratamento de dados sensíveis; receber ou processar dados identificáveis sem confirmação de que a ferramenta é autorizada; definir sozinho elegibilidade de populações vulneráveis; aprovar experimentos com pessoas reais; afirmar conformidade legal ou com WCAG a partir de inspeção parcial.
