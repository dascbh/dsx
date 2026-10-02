---
name: ux-writing
description: Escreve e revisa todo texto visível da interface em pt-BR — rótulos, botões, links, mensagens de erro, estados vazios, toasts, confirmações, onboarding, tooltips e textos de IA — com tom de voz definido em 4 dimensões, vocabulário consistente entre telas (glossário) e ortografia/concordância corretas. Use ao criar ou alterar qualquer string visível, quando rótulos "não batem" entre telas, quando mensagens de erro forem genéricas ("Algo deu errado"), ou para revisar a microcópia de um fluxo inteiro.
---

# UX writing

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/` são relativos a ela.

Referências: `knowledge/fundamentos/ux-writing.md`, `patterns/ux-writing/*` (texto de botão, texto de link, mensagem de erro útil).

## Antes de escrever

1. Leia o glossário do projeto, se existir (DESIGN.md, `docs/`, ou strings existentes). **Mesmo conceito = mesma palavra em todas as telas.** Se não existir, monte um com os 10–20 termos do domínio a partir das strings atuais e aponte divergências.
2. Identifique o tom de voz nas 4 dimensões (formal↔casual, sério↔divertido, respeitoso↔irreverente, entusiasmado↔objetivo). Interface de tarefa tende a objetivo e respeitoso. O tom **muda com o momento**: erro e perda de dinheiro pedem mais sobriedade que boas-vindas.

## Fórmulas

| Elemento | Fórmula | Exemplo |
|---|---|---|
| Botão | verbo no infinitivo + objeto | "Salvar alterações", "Enviar proposta" — nunca "OK", "Sim", "Enviar" solto quando há ambiguidade |
| Link | descreve o destino | "Ver política de reembolso" — nunca "clique aqui" |
| Erro de campo | o que aconteceu + como resolver, sem culpar | "Informe um CEP com 8 números." |
| Erro de sistema | o que houve + o que foi preservado + próximo passo | "Não conseguimos salvar agora. Suas alterações continuam aqui. Tente de novo em instantes." |
| Estado vazio | o que é este lugar + por que está vazio + ação | "Nenhuma fatura ainda. As faturas aparecem aqui depois do primeiro pagamento." |
| Confirmação destrutiva | ação + objeto + consequência; botões repetem o verbo | "Excluir o projeto 'Site 2026'? Os 14 arquivos serão apagados e não podem ser recuperados." → [Cancelar] [Excluir projeto] |
| Sucesso | o que foi feito (+ desfazer se cabível) | "Proposta enviada para Ana Souza." [Desfazer] |
| Carregamento longo | o que está acontecendo + quanto falta | "Gerando relatório… cerca de 30 segundos." |
| Conteúdo de IA | rótulo + limite + ação | "Resumo gerado por IA. Confira os valores antes de enviar." |

## Regras

- Frases curtas; uma ideia por frase; a informação mais importante primeiro.
- Voz ativa, segunda pessoa implícita ("Informe seu e-mail"), sem "o usuário" na interface.
- Sem jargão técnico ou interno ("payload", "erro 500", nome de tabela). Código técnico só como detalhe secundário para suporte — `patterns/feedback/codigo-de-erro-tecnico.md`.
- Não culpe ("Você digitou errado") nem infantilize ("Ops! 🙈") em erro.
- Números como algarismos; datas e moeda no formato brasileiro (`01/10/2026`, `R$ 1.234,56`).
- Sentence case em títulos e botões ("Criar conta", não "Criar Conta").
- Plural e gênero gerados por código: trate 0, 1 e N ("Nenhum item", "1 item", "3 itens").
- Siglas com gênero correto ("a API", "o PDF"); crase e acentuação revisadas.
- Rótulos de campo não terminam com dois-pontos quando acima do campo; placeholder nunca substitui rótulo.

## Revisão de um fluxo

1. Extraia todas as strings do fluxo (código ou tela) para uma tabela: `tela | elemento | texto atual`.
2. Marque: inconsistência de termo, fórmula violada, tom fora do momento, erro de português, texto que não ajuda a decidir.
3. Proponha a reescrita na coluna ao lado, com o motivo em ≤ 8 palavras.
4. Atualize o glossário com qualquer termo decidido.

Saída: a tabela `tela | elemento | atual | proposto | motivo` + glossário atualizado.
