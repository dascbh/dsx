---
id: ordem-dos-campos
titulo: Como definir a sequência dos campos em um formulário?
categoria: formularios
componentes: [formulario, fieldset, legend, campo-condicional]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["2.4.3", "1.3.2", "1.3.1", "3.3.2"]
relacionados: [etapas-de-formulario, dividir-formulario, campos-obrigatorios, label-vs-placeholder, dropdown]
---

# Como definir a sequência dos campos em um formulário?

> **Regra:** Ordene os campos pela tarefa da pessoa, não pelo banco de dados, e faça ordem visual, ordem do HTML e ordem do Tab seguirem a mesma lógica.

## Contexto

A sequência dos campos conduz o diálogo entre a pessoa e o serviço. Se espelha o banco de dados, a estrutura interna da empresa ou um layout em duas colunas, a pessoa tem de decifrar o formulário em vez de responder às perguntas.

Parta da tarefa e das decisões envolvidas. Elimine dados dispensáveis, junte campos afins e coloque antes as perguntas que definem elegibilidade, rota ou campos seguintes.

Não existe ordem universal. A melhor sequência varia com a tarefa, o conhecimento da pessoa, as dependências entre respostas e a real necessidade do serviço.

## Decisão

- **SE** o campo não é necessário à tarefa **ENTÃO** remova-o antes de ordenar.
- **SE** uma resposta define elegibilidade ou caminho **ENTÃO** pergunte-a primeiro.
- **SE** campos têm relação entre si **ENTÃO** agrupe-os com `fieldset` e `legend`.
- **SE** existe dependência **ENTÃO** peça a causa antes do efeito: tipo antes de detalhes, país antes de estado, data inicial antes da final.
- **SE** um campo só é relevante para parte do público **ENTÃO** mostre-o condicionalmente logo após a escolha que o gera.
- **SE** o formulário é longo e tem objetivos distintos **ENTÃO** divida em etapas lógicas.
- **SE** o layout usa duas colunas **ENTÃO** confirme que a leitura não cruza a tela; prefira uma coluna.
- **SE** o CSS reordena campos ou há `tabindex` positivo **ENTÃO** remova e reordene no HTML.
- **SENÃO** teste o caminho mais comum e os desvios antes de fixar a sequência definitiva.

## Quando usar

- Dois ou mais campos relacionados.
- Resposta que define elegibilidade ou próximo caminho.
- Campos condicionais ou etapas.
- Assuntos diferentes que precisam de agrupamento.
- Ordem atual que causa dúvida, erro ou abandono.

## Quando evitar

- Sequência copiada do banco de dados → **use em vez disso:** sequência da tarefa.
- Campos condicionais irrelevantes visíveis para todos → **use em vez disso:** exibição condicional.
- Assuntos misturados sem grupos → **use em vez disso:** grupos nomeados.
- CSS ou `tabindex` positivo criando outra ordem → **use em vez disso:** ordem no HTML.
- Regra fixa aplicada sem observar a tarefa → **use em vez disso:** teste com pessoas.

## Faça

- Comece pelo objetivo da tarefa.
- Pergunte a elegibilidade cedo.
- Mostre só o que importa.
- Teste os caminhos comuns e alternativos.

## Evite

- Misturar assuntos.
- Revelar campos irrelevantes.
- Colunas sem lógica de leitura.
- Esconder dependências.
- Começar pelo campo mais difícil sem pesquisa.

## Acessibilidade

- Ordem de foco preserva significado e operabilidade (2.4.3); sequência de leitura com sentido (1.3.2).
- Mantenha a ordem do HTML igual à visual; não reorganize campos por CSS.
- `fieldset` e `legend` para grupos, rótulos visíveis e instruções associadas (1.3.1, 3.3.2).
- Campos condicionais aparecem no ponto esperado da sequência, sem saltos de foco.
- Teste com teclado, leitor de tela, zoom, voz e tela pequena.

## Microcópia

Não se aplica.

## Checklist de verificação

- [ ] A ordem segue a tarefa da pessoa.
- [ ] Perguntas de elegibilidade vêm antes do preenchimento longo.
- [ ] Campos relacionados estão agrupados.
- [ ] Dependências aparecem na ordem correta.
- [ ] Campos irrelevantes ficam ocultos.
- [ ] A ordem visual corresponde à ordem do HTML.
- [ ] A navegação por Tab preserva o sentido.
- [ ] Grupos usam `fieldset` e `legend`.
- [ ] Caminho comum e alternativos foram testados.

## Fundamentação

- WCAG 2.2, critério 2.4.3 (Focus Order): ordem de foco preserva significado; relação entre DOM e ordem visual.
- W3C WAI (tutorial de formulários): pedir só o necessário, agrupar controles e dividir formulários longos.
- U.S. Web Design System (Form): mesma ordem no HTML e na tela, layout vertical simples.
- GOV.UK Service Manual (estruturação de formulários): justificar cada pergunta, começar pela elegibilidade e usar ramificação.
- IBM Carbon (padrão de formulários): Tab, rótulos visíveis e instruções antes do preenchimento.
- Nielsen Norman Group (usabilidade de formulários e agrupamento com espaço em branco): sequência lógica, uma coluna e agrupamento; a ordem depende do contexto.
- Adobe Spectrum (design inclusivo): exemplo de estrutura em ordem lógica versus fora de ordem.
