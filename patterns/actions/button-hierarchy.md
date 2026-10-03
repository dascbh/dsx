---
id: button-hierarchy
title: Como definir a hierarquia entre botão primário e secundário?
category: actions
components: [button, button-group]
type: recommendation
impact: medium
status: recommended
evidence: moderate
wcag: ["1.4.1", "1.4.3", "2.4.7", "2.4.3"]
related: [action-placement, button-text, disabled-button, link-vs-button]
---

# Como definir a hierarquia entre botão primário e secundário?

> **Regra:** Em cada grupo de ações, dê a maior ênfase a uma única ação principal e trate as alternativas com ênfase menor, sempre visíveis e nunca diferenciadas só por cor.

## Contexto

Uma tela costuma reunir várias ações: salvar e cancelar, continuar e voltar, publicar e salvar rascunho. O visual dos botões deve indicar a prioridade relativa, sem ocultar alternativas nem escolher pela pessoa.

Quando todos os botões têm o mesmo peso, a pessoa compara opções antes de agir. Quando vários parecem primários, o sinal de prioridade se perde e cresce a hesitação ou o clique errado.

A hierarquia vale por área: uma página pode ter mais de um grupo de ações, mas cada grupo precisa de uma prioridade compreensível.

## Decisão

- **SE** o grupo tem uma ação que cumpre o objetivo da tarefa **ENTÃO** marque essa ação como primária (uma por grupo).
- **SE** existem alternativas relacionadas (cancelar, voltar, salvar rascunho) **ENTÃO** use ênfase secundária e mantenha-as visíveis.
- **SE** há uma terceira ação de baixa prioridade **ENTÃO** use ênfase terciária (texto) em vez de um segundo botão cheio.
- **SE** duas ações têm a mesma importância **ENTÃO** use o mesmo peso nas duas e não force um destaque.
- **SE** o destaque empurraria a pessoa a uma opção que não é claramente melhor **ENTÃO** equilibre os pesos.
- **SE** a diferença entre níveis depende só de cor **ENTÃO** adicione preenchimento versus contorno, texto e posição.
- **SENÃO** siga a convenção de ordem do produto, validada em teste, inclusive em telas pequenas.

## Quando usar

- Ação que atende ao objetivo da tela ou etapa.
- Grupo com uma ação principal e alternativas relacionadas.
- Pares como salvar versus cancelar ou continuar versus voltar.
- Produto com convenção consistente de níveis de ênfase.

## Quando evitar

- Ações de igual prioridade → **use em vez disso:** botões com o mesmo peso.
- Ação importante escondida como secundária → **use em vez disso:** promover a visível.
- Hierarquia só por cor → **use em vez disso:** forma, preenchimento, rótulo e posição.
- Destaque usado para pressionar → **use em vez disso:** pesos equilibrados.

## Faça

- Nomeie a ação principal antes de desenhar o grupo.
- Limite o destaque primário a uma ocorrência por área.
- Use rótulos com verbo que descrevam o resultado.
- Teste o grupo em mobile, zoom e alto contraste.

## Evite

- Destacar todos os botões.
- Tratar o secundário como irrelevante ou escondê-lo.
- Copiar posições de outro produto sem testar.
- Rótulos ambíguos como "OK".

## Acessibilidade

- Não comunique prioridade só por cor (1.4.1).
- Garanta contraste de texto e de limites de componente (1.4.3, 1.4.11).
- Mantenha foco visível (2.4.7) e ordem de foco igual à ordem lógica das ações (2.4.3).
- Use o elemento nativo de botão com nome acessível igual ao rótulo visível.
- Valide com teclado, zoom, leitor de tela e contraste elevado.

## Microcópia

| Situação | Exemplo |
|---|---|
| Primária | "Publicar página" |
| Secundária | "Salvar rascunho" |
| Alternativa | "Cancelar" |
| Etapa | "Continuar" / "Voltar" |

## Checklist de verificação

- [ ] Cada grupo de ações tem no máximo um botão primário.
- [ ] O botão primário corresponde ao objetivo da tarefa.
- [ ] As alternativas continuam visíveis e legíveis.
- [ ] A diferença entre níveis não depende só de cor.
- [ ] Os rótulos descrevem a ação com verbo.
- [ ] A ordem de foco segue a ordem lógica.
- [ ] A hierarquia se mantém em mobile e com zoom.

## Fundamentação

- Padrão Digital de Governo (GOV.BR), componente Button: níveis de ênfase e limite da ênfase primária a ações estratégicas; a posição é convenção do sistema.
- U.S. Web Design System (Button e Button group): estilo distinto para a ação importante, rótulos curtos com verbo e poucos botões por grupo.
- Atlassian Design System (Button): primário para a ação mais importante da área, com ocorrência limitada.
- Adobe Spectrum (Button e Cards): níveis de ênfase e hierarquia aplicada em contexto.
- WCAG 2.2, critério 1.4.1: informação não pode depender só de cor.
