# Governança e maturidade

## Quando consultar

- Ao avaliar a qualidade ou a maturidade de um design system.
- Ao propor, aprovar, versionar ou depreciar algo no sistema.
- Ao medir adoção ou drift, ou montar um painel de saúde do sistema.
- Ao argumentar investimento no sistema para liderança.

## Princípios

1. **Design system é produto, não projeto.** Tem usuários (times de produto, agentes), roadmap, suporte e manutenção contínua. Não existe "terminar o design system".
2. **Tamanho da biblioteca não é qualidade.** O que importa é: resolve os casos recorrentes, é usado em produção, mantém coerência no tempo.
3. **Avaliação é amostra com evidência, não certificado.** Declare recorte, data e limites.
4. **Desvio justificado não é dívida.** Padronizar contra a tarefa do usuário é pior que a exceção documentada.
5. **Automatize o critério antes de automatizar a produção.** Gerar mais rápido sem validação multiplica erro.

## Avaliação de qualidade

### Recorte (sempre primeiro)

Registre: produtos, plataformas e times incluídos; versão da biblioteca; data; 2 a 3 fluxos críticos (ex.: cadastro, busca, pagamento); componentes frequentes e críticos (campos, mensagens de erro, navegação).

### Cinco dimensões

| Dimensão | Pergunta | Evidência aceita |
|---|---|---|
| Cobertura e consistência | Os padrões mais usados existem e se comportam igual em todos os canais? | Inventário em design e código; variações encontradas em produção |
| Adoção | Os times usam a versão oficial onde ela se aplica? | Amostra de telas e repositórios; exceções registradas. Acesso à documentação **não** conta |
| Acessibilidade | Componentes e fluxos funcionam com teclado, leitor de tela, zoom, erro? | Testes por componente **e** por fluxo (composição pode falhar) |
| Documentação | Alguém escolhe, implementa e adapta sem perguntar ao autor? | Teste de descoberta (abaixo) |
| Governança | Quem propõe, aprova, publica, corrige? | Histórico de versões, registros de decisão, tempo de atendimento de pedidos |

### Testes práticos

- **Teste de descoberta**: peça a alguém que não mantém o sistema para montar uma tarefa real (ex.: formulário com validação) usando só a documentação. Cada pergunta que exigiu conversa privada é um achado de documentação ou de desenho de componente.
- **Teste de governança**: siga um pedido real recente do início ao fim: priorização, aprovação, testes, comunicação, migração. Sem caso recente, simule uma mudança que quebra. Anote onde a responsabilidade some.
- **Teste de drift**: rode `node tools/lint-raw-values.mjs <src>` nos repositórios consumidores.

### Formato de cada achado

Recorte · achado observado · evidência (captura, passos, trecho de código) · alcance (quantas telas/fluxos) · hipótese de causa (separada da observação) · ação executável · como verificar a correção.

Afirmação ampla ("ninguém usa o sistema") exige amostra e conversa com os times antes de virar conclusão.

### Priorização

1. Barreiras que bloqueiam tarefa ou afetam acesso, segurança ou compreensão.
2. Frequência nos fluxos analisados.
3. Quantidade de produtos afetados.
4. Esforço de correção.

Nunca rebaixe uma barreira grave de acessibilidade por ser difícil de corrigir. O relatório termina em **poucas decisões comprováveis** (corrigir componente, esclarecer orientação, aceitar exceção, melhorar contribuição), não numa lista interminável.

## Rubrica de maturidade

| Nível | Nome | Sinais observáveis | Próximo passo |
|---|---|---|---|
| 0 | Ad hoc | Valores soltos no código, sem tokens, componentes duplicados por tela | Inventário e fundações |
| 1 | Fundação | Tokens de cor, tipografia e espaço; poucos componentes; documentação mínima | Componentes de alto uso com estados |
| 2 | Biblioteca | Componentes em design e código com estados e acessibilidade básica; página por componente | Governança, versão, métricas |
| 3 | Sistema | Dono, SemVer, contribuição definida, métricas de adoção e drift, testes de acessibilidade e contraste no CI | Roadmap, depreciação planejada, consumo por agentes |
| 4 | Produto | Roadmap e suporte, depreciação com prazo, métricas ligadas a resultado de produto, consumo legível por agentes e ferramentas (`DESIGN.md`, `UX.md`, tokens DTCG, linters) | Manter e medir |

Regras de pontuação:

- O nível é o **mais alto cujos sinais estão todos presentes**. Um sinal faltando rebaixa.
- Avalie princípios, documentação e código separadamente se evoluírem em ritmos diferentes; adoção parcial não é fracasso.
- Este repositório entrega, por padrão, peças de nível 3: tokens em camadas, contraste validado no build (`tools/build-tokens.mjs --check`) e métrica de drift (`tools/lint-raw-values.mjs`). Governança humana (dono, contribuição, versão) continua sendo responsabilidade do projeto.

## Métricas

### Adoção

`adoção = ocorrências oficiais ÷ ocorrências elegíveis`

- "Elegível" = lugar onde um componente oficial se aplicaria.
- Separe três contagens: oficial, **variação aprovada** (exceção registrada) e **implementação local sem justificativa**. Reporte a adoção estrita (só oficial) e a taxa de desvio injustificado separadamente; misturá-las esconde a diferença entre adaptação deliberada e deriva.
- Exemplo de leitura: 40 campos elegíveis, 26 oficiais, 8 variações aprovadas, 6 locais → adoção estrita 65%, desvio injustificado 15%.

### Drift

`drift = ocorrências de valor cru ÷ linhas de código de UI × 1000`

- Calculado por `node tools/lint-raw-values.mjs <dir> --json` (campo `drift_per_1000_lines`).
- Regras detectadas: hex cru, cor funcional crua (`rgb()`, `hsl()`, `oklch()`…), px fora da escala (≥ 2px), `z-index` de três dígitos ou mais, valor arbitrário de framework utilitário.
- Linhas com `dsx-ignore` são ignoradas: conte os escapes separadamente e revise-os; escape sem justificativa é drift escondido.
- Use como **tendência**: compare o mesmo repositório entre versões. Meta saudável: drift caindo a cada ciclo e zero em código novo (o linter sai com código 1 se encontrar ocorrências; use isso no CI para diffs).

### Painel de saúde (sete dimensões)

| Dimensão | Métrica sugerida |
|---|---|
| Adoção | % de superfície elegível usando componentes oficiais |
| Cobertura | Fundações e componentes críticos existem (sim/não por item) |
| Reuso | Componentes reutilizados vs. construídos do zero em novas features |
| Qualidade | Drift; pares de contraste em falha; bugs de UI por componente; paridade entre plataformas |
| Documentação | Tempo até resolver uma dúvida; resultado do teste de descoberta |
| Contribuição | Tempo entre necessidade registrada e versão publicada |
| Valor | Horas de retrabalho evitadas e indicadores de produto ligados (ver ROI) |

Na ferramenta de design, acompanhe também: frequência de desacoplamento de instâncias (alta = flexibilidade insuficiente) e soluções duplicadas.

Anti-métricas: visualizações da página de documentação; número de componentes; número de tokens.

## Versionamento (SemVer)

| Tipo | Quando | Exemplos |
|---|---|---|
| **MAJOR** | Quebra API ou comportamento esperado | Renomear/remover token ou propriedade; mudar o significado de um token semântico; remover variante; mudar o comportamento de teclado |
| **MINOR** | Adição compatível | Novo token, componente, variante ou propriedade opcional; novo tema |
| **PATCH** | Correção sem mudança de contrato | Ajuste de valor que mantém o papel (ex.: mover `color.text.muted` um passo para corrigir contraste); bug; documentação |

Regras:

- Toda versão tem nota com **o quê, por quê e como migrar**.
- Renomear token é MAJOR: publique o nome novo, mantenha o antigo como alias depreciado por pelo menos uma versão MINOR, depois remova no MAJOR seguinte.
- Depreciação tem **prazo e condição de remoção** declarados; padrão antigo não convive para sempre com o novo.
- Mudança de valor visível em todas as telas (ex.: nova cor de marca) é tecnicamente PATCH/MINOR, mas comunique como mudança relevante.
- Mantenha visível qual versão está em produção em cada produto consumidor.

## Modelo de governança

| Modelo | Quem decide | Vantagem | Risco |
|---|---|---|---|
| Centralizado | Time do sistema | Coerência | Gargalo, distância dos produtos |
| Federado | Contribuidores distribuídos com revisão formal | Proximidade dos problemas reais | Coordenação cara, lacunas de consistência |
| Híbrido | Núcleo cuida das fundações; times contribuem por processo | Equilíbrio | Papéis ambíguos se não forem escritos |

Mínimo a definir em qualquer modelo: dono, quem pode propor, critérios de aceite, resolução de conflito, versionamento e comunicação, processo de depreciação, canal de feedback.

## Modelo de contribuição

1. **Necessidade**: problema descrito com evidência (telas, times afetados). Sem problema recorrente, sem componente novo.
2. **Proposta (RFC)**: solução, alternativas consideradas, impacto em tokens e componentes existentes.
3. **Revisão** contra princípios, acessibilidade e o catálogo (não duplica nada?).
4. **Implementação** em design e código juntos, com a matriz de estados e o template de documentação.
5. **Validação**: `tools/build-tokens.mjs --check`, testes de acessibilidade, uso em uma tela real.
6. **Publicação** com versão e nota.
7. **Acompanhamento** da adoção.

Dois trilhos: **rápido** para correções (patch, documentação) e **coordenado** para mudanças que quebram ou criam padrão. Meça o tempo de ciclo: contribuição lenta empurra os times para soluções locais, que viram drift.

## Argumentos de ROI (sem números inventados)

Fórmula: `ROI = (benefício − custo) ÷ custo`. Preencha com dados **do próprio contexto**; não importe percentuais de outros lugares como promessa.

Fontes de benefício que valem medir:

- **Retrabalho evitado**: horas gastas recriando componentes ou estilos que já existiam (amostre tickets e PRs).
- **Velocidade**: tempo do protótipo à produção em features que usaram o sistema vs. que não usaram.
- **Qualidade**: bugs de UI e de acessibilidade por release; defeitos de acessibilidade custam muito mais para corrigir em produção do que na especificação, e um componente corrigido corrige todas as telas que o usam.
- **QA**: casos de teste que passam a ser herdados de componentes já validados (contraste validado no build é conformidade herdada).
- **Mudança de marca ou tema**: esforço para trocar uma cor em token vs. em centenas de arquivos.
- **Custo da não adoção**: o que se gasta quando times contornam o sistema.

Como apresentar:

- Para liderança, fale de **tempo de entrega, risco (legal e de acessibilidade) e custo da não adoção**, não de "consistência visual".
- Ligue métricas do sistema (adoção, drift) a métricas intermediárias (retrabalho, bugs) e a métricas de produto (conclusão de tarefa, satisfação). Sem essa cadeia, o sistema otimiza a própria vitrine.
- Se a adoção é baixa, o benefício não existe ainda: o investimento prioritário é adoção, não componente novo.

## Anti-padrões

- Medir sucesso por número de componentes ou visitas à documentação.
- Avaliar só o componente isolado, nunca o fluxo.
- Concluir sem amostra.
- Publicar versão sem nota de migração; atualizações silenciosas.
- Depreciar sem prazo.
- Sistema tão flexível que deixa de orientar decisões.
- Copiar a estrutura de um sistema gigante sem ter a maturidade dele.
- Prometer ROI com percentuais de terceiros.

## Checklist

- [ ] Recorte, versão e data registrados na avaliação.
- [ ] Cinco dimensões avaliadas com evidência; achados no formato completo e priorizados.
- [ ] Nível de maturidade atribuído pelo critério "todos os sinais presentes".
- [ ] Adoção estrita e desvio injustificado reportados separadamente.
- [ ] Drift medido com `tools/lint-raw-values.mjs` e comparado com a rodada anterior.
- [ ] SemVer aplicado; nota de versão com migração; depreciação com prazo.
- [ ] Dono, critérios de aceite e trilhos de contribuição definidos.
- [ ] ROI calculado com dados próprios.
