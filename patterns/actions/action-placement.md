---
id: action-placement
title: Onde posicionar ações primárias e secundárias?
category: actions
components: [button, button-group, form, modal, side-panel]
type: recommendation
impact: medium
status: recommended
evidence: moderate
wcag: ["2.4.3", "2.4.7", "1.4.1", "2.5.8", "1.3.2"]
related: [button-hierarchy, button-text, close-modal, keyboard-focus]
---

# Onde posicionar ações primárias e secundárias?

> **Regra:** Defina uma única ação principal pelo objetivo da tarefa, agrupe as alternativas ao lado dela com menor ênfase e mantenha a mesma posição em telas equivalentes.

## Contexto

Quando há mais de uma ação, a pessoa precisa saber rápido qual caminho é o objetivo e quais são alternativas, apoio ou cancelamento. Este padrão trata de posição, alinhamento e ordem, e complementa a hierarquia visual entre botões.

Não existe posição universal. Formulários de página, modais, painéis laterais e fluxos em etapas pedem arranjos diferentes; o que importa é decidir a lógica uma vez e repeti-la.

A ação principal vem do objetivo da tarefa, não da cor ou da posição.

## Decisão

- **SE** há várias ações **ENTÃO** escolha uma só ação de alta ênfase por contexto.
- **SE** é formulário de página **ENTÃO** coloque o grupo de ações ao final do conteúdo, alinhado ao início do formulário, se esse for o padrão do produto.
- **SE** é modal, painel lateral ou fluxo progressivo **ENTÃO** a principal pode ficar à direita (grupo horizontal).
- **SE** os botões estão empilhados (inclusive mobile) **ENTÃO** a ação principal fica na posição final do grupo.
- **SE** existe ação secundária (cancelar, voltar, revisar) **ENTÃO** posicione-a perto da principal, com menor ênfase.
- **SE** várias telas são semelhantes **ENTÃO** repita exatamente a mesma ordem.
- **SE** a ação é destrutiva **ENTÃO** trate-a como papel próprio, nunca como principal por padrão.
- **SENÃO** siga a convenção do design system do produto e aplique-a de forma uniforme.

## Quando usar

- Uma ação principal com uma ou mais alternativas.
- Tarefas de avançar, salvar ou concluir.
- Fluxos em etapas, modais, painéis e formulários.

## Quando evitar

- Dois botões com a mesma ênfase alta → **use em vez disso:** um primário e um secundário.
- Destaque primário em cancelar ou voltar → **use em vez disso:** estilo secundário ou de texto.
- Ações sem relação no mesmo grupo → **use em vez disso:** grupos separados.
- Botões fixos no topo de formulário longo sem relação com o conteúdo → **use em vez disso:** ao final do conteúdo.

## Faça

- Escreva rótulos objetivos para cada ação.
- Mantenha a ordem visual igual à ordem da tarefa.
- Garanta espaçamento e área de toque entre as ações.
- Deixe a ação principal facilmente alcançável no mobile.

## Evite

- Mover o botão principal sem motivo.
- Misturar ações não relacionadas.
- Comunicar prioridade só por cor, tamanho ou posição.
- Esconder ações longe do conteúdo.

## Acessibilidade

- Use `<button>` nativo com rótulo que descreva o resultado.
- A ordem visual não pode contradizer a ordem de leitura e de foco (1.3.2, 2.4.3).
- Foco visível e previsível (2.4.7).
- A hierarquia não depende só de cor (1.4.1).
- Espaçamento e área de toque adequados (2.5.8); estados de foco, pressionado, desativado e carregamento visíveis.

## Microcópia

| Situação | Exemplo |
|---|---|
| Principal | "Salvar alterações" |
| Secundária | "Cancelar" |
| Etapa | "Continuar" e "Voltar" |
| Destrutiva | "Excluir conta" |

## Checklist de verificação

- [ ] Existe uma única ação de alta ênfase.
- [ ] A ação principal representa o objetivo da tarefa.
- [ ] As secundárias têm ênfase menor.
- [ ] Os botões do grupo têm relação entre si.
- [ ] A posição é igual em telas equivalentes.
- [ ] Cancelar e voltar não parecem ações principais.
- [ ] No formulário, o grupo vem depois do conteúdo.
- [ ] Empilhados, a principal fica por último.
- [ ] A hierarquia funciona sem depender de cor.
- [ ] O foco é visível e a ordem de tabulação segue a visual.

## Fundamentação

- IBM Carbon (Button usage; Forms pattern): uma ação de alta ênfase por contexto e posição por tipo de interface.
- Padrão Digital GOV.BR (Button): níveis de ênfase e convenção contextual de posição.
- Apple Human Interface Guidelines (Buttons): ação mais provável em destaque e papéis primário, cancelar e destrutivo.
- Baymard Institute: destaque, posição consistente e microcópia descritiva em e-commerce, com ressalva de transferência.
- W3C (Focus Order): a ordem de foco preserva significado e operabilidade.
