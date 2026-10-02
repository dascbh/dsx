---
id: rotular-conteudo-ia
titulo: Como sinalizar que um conteúdo foi gerado por IA?
categoria: ia
componentes: [etiqueta, chip, tooltip]
tipo: decisao-contextual
impacto: alto
status: recomendado
evidencia: moderada
wcag: ["1.4.1", "1.1.1", "1.4.13", "2.1.1"]
relacionados: [incerteza-da-ia, fontes-da-ia, revisar-resultado-da-ia, confirmar-acao-da-ia]
---

# Como sinalizar que um conteúdo foi gerado por IA?

> **Regra:** Rotule com texto claro, junto ao conteúdo, tudo o que a IA gerou ou transformou de forma material, delimitando o escopo exato e sem sugerir revisão ou exatidão que não existem.

## Contexto

Conteúdos de IA convivem com textos, dados e decisões humanas. Sem sinal de origem, a pessoa pode tomar o resultado por humano, definitivo ou revisado, mesmo sem essa garantia.

A regra não pede rótulo para qualquer uso auxiliar. O foco é o conteúdo gerado ou materialmente alterado, no ponto em que alguém precisa interpretá-lo, verificar ou usá-lo.

O rótulo indica origem; não prova exatidão. Deve operar junto de fontes, revisão e comunicação de incerteza. Algumas jurisdições têm obrigações de transparência próprias, então considere o contexto regulatório aplicável.

## Decisão

- **SE** a IA gera texto, imagem, áudio, código, dado, resumo ou classificação exibidos **ENTÃO** rotule o conteúdo.
- **SE** a IA reescreve, completa ou transforma materialmente algo do usuário **ENTÃO** rotule.
- **SE** apenas parte de uma tabela, cartão ou campo veio da IA **ENTÃO** posicione o rótulo no escopo exato dessa parte.
- **SE** a assistência é mínima (ex.: correção ortográfica) **ENTÃO** avalie o contexto antes de rotular.
- **SE** origem, fontes, modelo ou revisão humana importam **ENTÃO** ofereça explicação acessível por interação no próprio rótulo.
- **SE** não houve revisão humana confirmada **ENTÃO** não use "Revisado" ou "Verificado".
- **SE** o conteúdo pode ser compartilhado ou reutilizado **ENTÃO** mantenha o rótulo nesses estados.
- **SENÃO** use "Gerado por IA" ou "Criado com IA" em posição consistente.

## Quando usar

- Resultados de IA exibidos na interface.
- Conteúdo do usuário reescrito por IA.
- Recomendações ou sínteses que orientam decisão.
- Parte de um conjunto gerada por IA.

## Quando evitar

- Rotular a página inteira só porque existe função de IA em outro ponto → **use em vez disso:** rótulo no conteúdo específico.
- Sugerir revisão ou precisão inexistente → **use em vez disso:** texto fiel ao que ocorreu.
- Brilho ou ícone sem texto → **use em vez disso:** texto visível ou nome acessível.

## Faça

- Use rótulo textual curto, junto ao conteúdo.
- Mantenha posição e termos consistentes em listas, cartões e tabelas.
- Separe origem do conteúdo de eventual revisão humana.
- Dê acesso às explicações pelo próprio rótulo.

## Evite

- Depender só de cor, ícone ou brilho.
- Espalhar o rótulo para conteúdo não gerado por IA.
- Apresentar o rótulo como selo de qualidade.
- Remover o rótulo onde o conteúdo ainda será interpretado ou reutilizado.

## Acessibilidade

- Texto visível ou nome acessível equivalente; não só cor ou forma (WCAG 1.4.1).
- Se o rótulo abre explicações: focável por teclado, foco visível, Esc fecha, foco volta ao acionador (WCAG 1.4.13, 2.1.1).
- Não coloque a divulgação essencial só em hover.
- Para conteúdo visual ou multimodal, ofereça indicação textual equivalente (WCAG 1.1.1) e nos metadados.

## Microcópia

| Situação | Exemplo |
|---|---|
| Rótulo padrão | "Gerado por IA" |
| Reescrita | "Reescrito com IA" |
| Parte do conjunto | "Resumo gerado por IA" |
| Aviso | "Pode conter imprecisões. Confira antes de usar." |

## Checklist de verificação

- [ ] O rótulo está junto do conteúdo correspondente?
- [ ] O escopo do rótulo é exato?
- [ ] O texto descreve o que a IA realmente fez?
- [ ] Nenhum termo sugere revisão ou exatidão não confirmada?
- [ ] O rótulo permanece ao compartilhar ou reutilizar?
- [ ] Funciona sem depender de cor, brilho ou ícone?
- [ ] Explicações abrem por teclado e fecham com Esc?
- [ ] O contexto regulatório foi considerado?

## Fundamentação

- Microsoft Fluent (IA responsável): comunicar onde e como a IA é usada e apoiar verificação.
- IBM Carbon (AI label): reconhecimento, explicabilidade e escopo.
- Google PAIR: explicações úteis para transparência.
- Regulamento Europeu de IA, art. 50: deveres de transparência em contextos determinados, sem supor aplicação universal.
- Exemplos de produtos de mensagens, fotos e redes sociais usam rótulos "AI info"/"AI generated" junto ao conteúdo.
