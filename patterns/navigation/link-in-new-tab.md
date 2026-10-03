---
id: link-in-new-tab
title: Links devem abrir em nova aba?
category: navigation
components: [link, external-link-icon]
type: contextual-decision
impact: medium
status: caution
evidence: strong
wcag: ["2.4.4", "3.2.5", "3.2.2", "1.4.1"]
related: [link-vs-button, link-text, main-navigation, breadcrumbs]
---

# Links devem abrir em nova aba?

> **Regra:** Por padrão, abra links na mesma aba; reserve a nova aba para resguardar uma tarefa em curso e avise sempre no próprio link.

## Contexto

Um link normal leva ao destino na mesma aba, e a pessoa conta com o botão Voltar. Forçar nova aba muda o contexto de navegação e o histórico daquela aba, o que desorienta quando acontece sem aviso.

A decisão é útil quando é preciso consultar algo externo sem perder o que já foi preenchido. Fora disso, é uma imposição do site: o navegador já deixa a pessoa escolher nova aba com Ctrl ou Command, ou pelo menu de contexto.

Leitores de tela podem não anunciar a mudança, e a nova aba pode ser confundida com a página de origem.

## Decisão

- **SE** não é preciso manter a página atual **ENTÃO** abra na mesma aba.
- **SE** sair da página faria perder dados de uma tarefa em andamento **ENTÃO** abra em nova aba.
- **SE** a pessoa precisa consultar referência externa sem interromper o fluxo **ENTÃO** nova aba é aceitável.
- **SE** abrir em nova aba **ENTÃO** avise no texto do link ("abre em nova aba") ou no nome acessível.
- **SE** usar ícone de link externo **ENTÃO** trate-o como reforço, nunca como único aviso.
- **SE** usar `target="_blank"` **ENTÃO** inclua `rel="noopener noreferrer"`, conforme a política do projeto.
- **SE** o link está em menu, breadcrumb, resultado de busca ou rodapé **ENTÃO** nunca force nova aba.
- **SENÃO** mesma aba.

## Quando usar

- Tarefa em andamento perderia dados ao sair.
- Referência, documento ou ferramenta complementar ao trabalho atual.
- O contexto já indica uma superfície independente.

## Quando evitar

- Navegação comum entre páginas do mesmo site → **use em vez disso:** mesma aba.
- Links externos por preferência de marketing → **use em vez disso:** mesma aba.
- Link dentro de formulário não concluído sem salvar → **use em vez disso:** nova aba com aviso ou salvar rascunho.
- Aviso só em tooltip, ícone ou cor → **use em vez disso:** aviso no texto.

## Faça

- Escreva o destino no texto do link.
- Mantenha o aviso no nome acessível.
- Teste o retorno ao fluxo ao fechar a nova aba.
- Revise a segurança de cada `target="_blank"`.

## Evite

- Forçar nova aba em todo link externo.
- Usar "clique aqui" ou "saiba mais".
- Esconder o aviso em tooltip.
- Depender só do ícone.

## Acessibilidade

- O propósito do link deve ser determinável pelo texto ou contexto (2.4.4).
- Abrir nova aba é mudança de contexto; o critério 3.2.5 (AAA) pede que ela ocorra por solicitação ou possa ser desativada.
- O aviso precisa estar disponível por teclado, leitor de tela e lista de links.
- Aviso visualmente oculto continua no nome acessível sem substituir o destino visível.
- Não use só cor ou ícone para sinalizar (1.4.1).

## Microcópia

| Situação | Exemplo |
|---|---|
| Link com aviso | "Consultar o manual do usuário (abre em nova aba)" |
| Documento externo | "Termos do parceiro (abre em nova aba)" |
| Link comum | "Voltar para pedidos" |
| Evitar | "Clique aqui" |

## Checklist de verificação

- [ ] O link abre na mesma aba por padrão.
- [ ] Existe motivo concreto para nova aba.
- [ ] O aviso aparece antes da ativação.
- [ ] O texto informa o destino.
- [ ] O aviso faz parte do nome acessível.
- [ ] O ícone externo é só reforço.
- [ ] O link é compreensível em lista de links.
- [ ] `target="_blank"` vem com `rel="noopener noreferrer"`.
- [ ] O retorno ao fluxo foi testado.

## Fundamentação

- WCAG 2.2: 2.4.4 (propósito do link) e 3.2.5 (mudança sob solicitação, AAA).
- W3C WAI técnica H83: indicar nova janela no texto do link.
- GitHub Primer (Links and buttons): não forçar nova aba.
- Microsoft Fluent 2 (Link): aviso prévio e ícone de abertura externa.
- Adobe Spectrum (Link): texto comunica o destino.
- MDN Web Docs (rel noopener): proteção de window.opener.
