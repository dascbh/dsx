---
id: revisar-resultado-da-ia
titulo: Como deixar pessoas revisarem e editarem resultados gerados por IA?
categoria: ia
componentes: [campo-de-texto, editor, sugestao-de-ia, botao]
tipo: decisao-contextual
impacto: alto
status: recomendado
evidencia: moderada
wcag: ["2.1.1", "2.4.7", "4.1.3", "1.4.1", "2.4.3"]
relacionados: [confirmar-acao-da-ia, rotular-conteudo-ia, incerteza-da-ia, recuperar-erro-da-ia]
---

# Como deixar pessoas revisarem e editarem resultados gerados por IA?

> **Regra:** Apresente todo resultado de IA como proposta que a pessoa pode aceitar, editar, refinar, regenerar ou descartar antes que ele afete uma decisão, comunicação ou fluxo.

## Contexto

A IA pode escrever e-mails, sintetizar documentos, preencher campos, classificar registros ou sugerir respostas. Antes que esse resultado guie uma decisão, seja enviado, publicado ou tome o lugar de um conteúdo existente, a pessoa precisa avaliá-lo e, se for o caso, alterá-lo.

Os resultados podem vir incompletos, entender mal o contexto ou repetir uma decisão imprópria. Poder corrigir mantém a pessoa como responsável e impede que uma sugestão probabilística pareça definitiva.

Esta regra cobre o resultado entregue para uso. Ela não dispensa a confirmação antes de uma ação externa: revisar um rascunho é diferente de autorizar envio, publicação ou mudança de dados. O grau de controle deve acompanhar o risco, a reversibilidade e a confiança exigida.

## Decisão

- **SE** a IA produz rascunho, resumo, extração, classificação ou preenchimento que será aproveitado **ENTÃO** apresente como proposta, com aceitar, editar, refinar, regenerar e descartar conforme o contexto.
- **SE** o resultado é longo ou estruturado **ENTÃO** permita correção local, sem regenerar tudo.
- **SE** a sugestão substitui conteúdo existente **ENTÃO** mostre o escopo da mudança e preserve a versão anterior ou um "Desfazer".
- **SE** a pessoa precisa comparar com o original **ENTÃO** exiba a diferença sem depender só de cor.
- **SE** o uso posterior tem efeito externo, financeiro, destrutivo ou de permissões **ENTÃO** conecte a revisão a uma confirmação própria antes de executar.
- **SE** a sugestão é local, reversível e de baixo risco, e a pessoa já a controla **ENTÃO** não exija revisão obrigatória.
- **SENÃO** trate o resultado como proposta até aceite explícito.

## Quando usar

- Rascunhos de texto, e-mails, respostas e documentos.
- Resumo, extração, classificação ou preenchimento de campos a validar.
- Recomendações que orientam decisão de produto, atendimento ou operação.
- Conteúdo que poderá ser publicado, enviado ou compartilhado.
- Alterações propostas para conteúdo existente.

## Quando evitar

- Revisão obrigatória em sugestão local, reversível e de baixo risco → **use em vez disso:** aplicar com "Desfazer".
- Edição como substituta de confirmação em ação externa → **use em vez disso:** confirmação própria da ação.
- Correção escondida em menu genérico → **use em vez disso:** controles visíveis junto ao resultado.
- Obrigar a refazer o pedido inteiro → **use em vez disso:** refino e edição local.
- Resposta final sem possibilidade de editar, recusar ou recuperar → **use em vez disso:** proposta editável.

## Faça

- Trate o resultado como proposta até aceite.
- Permita editar no próprio contexto do resultado.
- Use verbos que descrevem o efeito de cada botão.
- Preserve versão anterior, origem ou desfazer.
- Mostre o escopo antes de substituir conteúdo.
- Eleve a revisão quando o impacto for alto.

## Evite

- Substituir conteúdo automaticamente sem caminho de revisão ou recuperação.
- Reduzir a pessoa a aceitar ou recomeçar.
- Um único botão ambíguo para mudança ampla.
- Destacar só "Aceitar" e esconder descartar e editar.
- Tratar edição local como autorização para enviar ou publicar.
- Apoiar-se apenas em ícones, cores ou animações para indicar o que pode ser corrigido.

## Acessibilidade

- Controles de editar, aceitar, regenerar e descartar com nomes acessíveis e foco visível (2.4.7).
- Uso integral por teclado e ordem de foco coerente com a leitura do resultado (2.1.1, 2.4.3).
- Não use só ícones para revisão ou descarte.
- Quando uma sugestão substituir conteúdo, anuncie a mudança sem roubar o foco e preserve o desfazer (4.1.3).
- Evite atualizações automáticas que desloquem o foco ou façam a pessoa perder o ponto onde lia.
- Em comparações de versões, a diferença não pode depender só de cor (1.4.1).

## Microcópia

| Situação | Exemplo |
|---|---|
| Aceitar | "Inserir no documento" |
| Substituir | "Substituir trecho selecionado" |
| Refinar | "Pedir ajuste" |
| Regenerar | "Gerar outra versão" |
| Descartar | "Descartar sugestão" |
| Rótulo do resultado | "Rascunho sugerido pela IA. Revise antes de usar." |

## Checklist de verificação

- [ ] O resultado aparece como proposta, não como conteúdo definitivo.
- [ ] Há ação visível para aceitar, editar e descartar.
- [ ] A edição ocorre no próprio contexto do resultado.
- [ ] Em conteúdos longos, é possível corrigir só uma parte.
- [ ] Ao substituir conteúdo, há versão anterior ou desfazer.
- [ ] Cada botão nomeia seu efeito.
- [ ] Ação externa posterior pede confirmação própria.
- [ ] Os controles funcionam por teclado com foco visível.
- [ ] Diferenças entre versões não dependem só de cor.

## Fundamentação

- Microsoft HAX Toolkit, diretriz 9 (apoiar correção eficiente) e padrão 9B (edições ricas e detalhadas): facilitar editar, refinar ou recuperar quando a IA erra.
- Amershi e colegas (2019), diretrizes de interação humano-IA: 18 diretrizes avaliadas com profissionais de design.
- Google PAIR, guia People + AI: projetar IA centrada em pessoas e calibrar confiança.
- Documentação pública de assistentes de escrita com IA em editores de texto: manter, regenerar, refinar ou descartar rascunhos; revisão de texto alternativo gerado.
