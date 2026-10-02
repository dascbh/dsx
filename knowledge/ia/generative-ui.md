---
id: generative-ui
area: ia
titulo: Generative UI (interface gerada em tempo de uso)
evidencia: sinal
relacionados: [ux-para-agentes, evals, multimodal]
---

# Generative UI

> **Quando consultar**
> - Quando o produto vai decidir, durante o uso, **qual forma de interface** apresentar (tabela, formulário, gráfico, controles) conforme a intenção da pessoa.
> - Ao projetar o catálogo de componentes que um agente pode compor, ou as regras do que nunca pode mudar.
> - Ao decidir se uma área deve ser gerada ou continuar fixa.
> - Ao avaliar saídas de UI geradas por agente (ver também a rubrica em `evals.md`).
>
> **Não confundir com:** ferramentas que geram mockups ou código para a equipe revisar antes de publicar. Isso é IA assistindo o processo de design (ver `divida-de-experiencia.md`). Generative UI acontece **dentro do produto, em tempo de uso**.

## 1. Definição

Generative UI é a interface criada ou adaptada dinamicamente por IA enquanto a pessoa usa o produto, em função da intenção, do contexto e dos dados disponíveis naquele momento.

Três situações que convivem e devem ser distinguidas:

| Abordagem | O que varia | Estrutura |
|---|---|---|
| Interface tradicional | Apenas os dados | Fixa |
| Personalização | Ordem, destaque, recomendações | Fixa na arquitetura |
| Generative UI | A própria forma de apresentar e interagir | Composta a cada situação |

Também não é sinônimo de chatbot: a conversa pode ser a entrada, mas a resposta pode virar seletor de data, tabela filtrável ou checkboxes quando isso reduz esforço.

**Nível de evidência:** a área está em formação. Há produtos e pesquisas concretos (sinal forte), e um estudo acadêmico de 2026 encontrou preferência humana maior por interfaces geradas para a tarefa do que por conversa pura em certas condições, com ganho de até 72% no cenário avaliado. Trate como resultado específico daquele estudo, não como garantia para qualquer produto. `[evidência: sinal]`

## 2. Como funciona (ciclo)

1. A pessoa expressa intenção (texto, voz, seleção, arquivo, imagem).
2. O sistema interpreta objetivo e contexto (estado da conversa, permissões, dados do produto, resultados de ferramentas).
3. Decide qual forma de interface serve à situação.
4. **Compõe dentro de um espaço permitido.**
5. A pessoa interage, gerando novo contexto; o sistema atualiza só o necessário.

O trabalho de design se desloca: em vez de definir cada tela, define-se **o espaço dentro do qual telas podem ser produzidas** e os critérios para julgar o que foi produzido.

## 3. Três níveis de maturidade

| Nível | O que a IA decide | Liberdade | Risco |
|---|---|---|---|
| **1. Controles contextuais** | Quando inserir botões, checkboxes, campos dentro de uma estrutura estável | Baixa | Baixo |
| **2. Composição por catálogo** | Quais componentes aprovados usar e como combiná-los (cards, tabelas, formulários, gráficos) via especificação declarativa | Média | Moderado |
| **3. Experiência específica da tarefa** | Página, ferramenta, simulador ou miniaplicação inteira | Alta | Alto |

**Regra:** comece no nível 1 ou 2. Só avance para o 3 quando houver suíte de avaliação, fallback testado e isolamento de execução. Quanto mais liberdade, mais difícil garantir consistência, acessibilidade, desempenho, segurança e previsibilidade.

## 4. Invariantes

Defina explicitamente o que **nunca** é gerado. Por padrão, são invariantes:

- Navegação global e posição dos elementos de orientação.
- Identidade visual (tokens, tipografia, marca).
- Mensagens legais, consentimentos e avisos obrigatórios.
- Ações de alto risco ou críticas (pagar, excluir, publicar, alterar acesso) e suas confirmações.
- Rótulo de conteúdo gerado por IA ([`rotular-conteudo-ia`](../../patterns/ia/rotular-conteudo-ia.md)).
- Controles de cancelar, desfazer e sair.

Só **áreas contextuais** se adaptam. Consistência não serve apenas à marca: é ela que permite à pessoa aprender caminhos e formar memória espacial.

## 5. Composição declarativa por catálogo

Prefira que o agente **descreva** o que precisa ser exibido e que a aplicação **renderize** com seus próprios componentes. Executar código arbitrário escrito pelo modelo abre uma superfície de risco muito maior. Existem especificações abertas nessa linha (intenção de interface declarativa, renderização pelo cliente).

Cada componente do catálogo precisa declarar, para leitura por agente:

```yaml
componente: tabela-comparativa
proposito: "Comparar 2 a 8 itens em atributos comuns"
usar_quando: ["usuário pede comparação", "itens compartilham >= 3 atributos"]
nao_usar_quando: ["1 item", "mais de 8 itens (usar lista filtrável)", "dados sem atributos comuns"]
propriedades:
  itens: { tipo: lista, min: 2, max: 8 }
  atributos: { tipo: lista, min: 3 }
  destaque: { tipo: enum, valores: [nenhum, melhor-valor] }
estados: [carregando, vazio, erro, parcial]
combinacoes_invalidas:
  - "dentro de modal em mobile"
  - "junto de outro componente de comparação na mesma resposta"
acessibilidade: "cabeçalhos de linha e coluna obrigatórios; ordem de leitura por linha"
```

Regras:
- **SE** o componente não está no catálogo **ENTÃO** o agente não pode usá-lo; recorre ao fallback.
- **SE** a combinação está listada como inválida **ENTÃO** a renderização deve rejeitá-la de forma determinística (validação de schema), não depender do modelo "lembrar".
- Valores visuais vêm sempre de tokens; nunca valores crus gerados.

## 6. Fallbacks

A geração pode atrasar, falhar ou produzir algo que não passa nos critérios. O produto precisa continuar utilizável.

| Situação | Fallback |
|---|---|
| Geração lenta | Esqueleto do componente provável + conteúdo textual assim que disponível |
| Geração falhou | Resposta em texto estruturado + ação de tentar novamente |
| Spec inválida (schema) | Componente padrão seguro (lista ou texto) com os mesmos dados |
| Dados insuficientes | Pedir a informação faltante em formulário mínimo, não inventar |
| Camada generativa indisponível | Interface fixa equivalente para a tarefa |

**NUNCA** deixe uma saída órfã: toda composição gerada mantém estado visível, controle e caminho de recuperação.

## 7. Quando gerar e quando a interface fixa vence

Gere quando:
- o contexto varia muito entre pessoas e pedidos;
- há muitas combinações de dados e opções;
- a melhor forma depende da pergunta;
- o trabalho é exploratório ou analítico;
- texto puro obriga esforço desnecessário (digitar o que poderia ser selecionado).

Mantenha fixa quando:
- a tarefa é frequente e a pessoa já conhece o caminho (velocidade e repetição);
- a operação é de alto risco e exige revisão clara e comportamento idêntico;
- o ambiente é regulado e precisa de auditoria;
- a ação é simples e gerar só adiciona latência;
- mudar posições prejudicaria memória espacial.

**SE** um botão fixo resolve melhor e mais rápido **ENTÃO** não gere outro botão. O cenário realista é híbrido: estrutura estável, personalização onde dados conhecidos bastam, geração onde o formato ideal depende da tarefa.

## 8. Fluxo de design em quatro passos

1. **Resultado antes de tela.** Defina o que a pessoa precisa conseguir e os critérios de sucesso. Separe o que pode variar do que é invariante.
2. **Catálogo confiável.** Liste componentes, propriedades, contextos de uso, contraindicações e combinações inválidas. Disponibilizar não basta: sem regra de uso, surgem composições plausíveis e erradas.
3. **Estados de falha e acessibilidade na infraestrutura.** Carregando, erro, parcial, fallback. Componentes acessíveis reduzem risco, mas hierarquia, ordem de foco, relação entre controles e conteúdo e anúncio de atualizações dinâmicas precisam ser avaliados na composição final.
4. **Avaliar dinamicamente e testar com pessoas.** Revisar uma tela não basta quando há milhares possíveis. Monte evals e amostre saídas reais.

## 9. Critérios de avaliação

Para cada saída gerada, julgar:

- **Adequação do formato:** o tipo de componente era o certo para a tarefa?
- **Completude:** a informação necessária para decidir está presente?
- **Conclusão da tarefa:** a pessoa consegue terminar o que queria?
- **Conformidade com o catálogo:** só componentes e combinações permitidos, só tokens.
- **Invariantes preservados:** navegação, identidade, avisos e ações críticas intactos.
- **Acessibilidade da composição:** semântica, foco, contraste, leitura por tecnologia assistiva.
- **Consistência entre variações:** pedidos semelhantes geram composições reconhecivelmente semelhantes.
- **Comportamento em falha:** dados faltantes e erros levam ao fallback correto.

Rubrica completa em YAML: `evals.md`, seção 8.

## 10. Anti-padrões

- **Variabilidade sem propósito:** mudar a forma sem reduzir esforço, só acrescentando latência.
- **Imprevisibilidade** que quebra memória espacial em tarefas recorrentes.
- **Geração sem controle:** execução de código arbitrário em vez de especificação declarativa.
- **Acessibilidade testada em uma tela estática** quando o sistema gera milhares de combinações.
- **Ausência de fallback.**
- **Saídas órfãs:** composição sem estado visível, sem controle, sem recuperação.
- **Ação de alto risco dentro de área gerada**, sem confirmação invariante.
- **GenUI como objetivo em si**, não como resposta a um problema de esforço.

## 11. Checklist

- [ ] O nível de maturidade (1, 2 ou 3) está declarado e justificado.
- [ ] Os invariantes estão listados e protegidos por validação, não por instrução ao modelo.
- [ ] Cada componente do catálogo tem propósito, usar/não usar, propriedades, estados e combinações inválidas.
- [ ] A geração é declarativa e validada por schema antes de renderizar.
- [ ] Todos os fallbacks da seção 6 existem e foram testados.
- [ ] Ações de alto risco ficam fora da área gerada ou passam por confirmação fixa.
- [ ] Há suíte de avaliação com os critérios da seção 9 e amostragem de produção.
- [ ] Houve teste com pessoas para confirmar que a adaptação reduz esforço.
