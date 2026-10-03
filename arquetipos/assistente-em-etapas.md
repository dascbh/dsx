---
id: assistente-em-etapas
titulo: Assistente em etapas
resumo: Fluxo guiado que divide uma tarefa longa ou rara em etapas ordenadas, com uma decisão por vez e revisão antes de concluir.
registro: [operacional, consumo]
quando-usar: SE a tarefa é longa, pouco frequente ou tem etapas que dependem das respostas anteriores ENTÃO use assistente em etapas
evitar-quando: a pessoa faz a tarefa todo dia e conhece os campos (use formulário de página), há menos de ~6 campos (use diálogo de formulário) ou as etapas não têm ordem natural (use configurações)
regioes: [cabecalho-da-pagina, trilha-de-etapas, corpo-da-etapa, rodape-de-navegacao]
acao-primaria: { regiao: rodape-de-navegacao, posicao: rodape-direita, max: 1 }
estados: [carregando, erro-de-campo, erro, enviando, sucesso, rascunho-retomado]
padroes: [dividir-formulario, etapas-de-formulario, momento-da-validacao, erros-em-formularios, onde-exibir-erros, preservar-dados-apos-erro, campos-obrigatorios, label-vs-placeholder, clique-duplo-em-envio, confirmacao-de-sucesso, posicao-de-acoes, upload-de-arquivos]
variacoes: [trilha-horizontal, trilha-vertical-lateral, etapa-de-revisao-final, assistente-em-dialogo]
regras: [T1, T3, T4, T6, T7, F3, F5]
---

# Assistente em etapas

Criar um projeto novo com partes e responsáveis, importar uma planilha e mapear colunas, montar um lote de minutas a partir de um acervo. Tarefas que a pessoa faz poucas vezes, com decisões que dependem umas das outras. O assistente reduz a carga a uma pergunta por vez e mostra sempre onde a pessoa está e quanto falta.

## Quando usar

- **SE** a tarefa tem grupos de decisão com ordem natural (dados → partes → documentos → revisão) **ENTÃO** cada grupo vira uma etapa; de 3 a 6 etapas.
- **SE** uma resposta muda as etapas seguintes **ENTÃO** a trilha se atualiza à vista da pessoa, nunca pula etapas em silêncio.
- **SE** a conclusão cria algo caro de desfazer (envia, cobra, publica) **ENTÃO** inclua a `etapa-de-revisao-final` com tudo editável.
- **SE** a tarefa leva mais de alguns minutos **ENTÃO** guarde rascunho e permita sair e retomar.
- **SE** a pessoa repete a tarefa diariamente **ENTÃO** troque por formulário de página único, com seções; o assistente vira atrito.
- **SENÃO** (poucos campos, uma decisão) **ENTÃO** use `dialogo-de-formulario`.

## Mapa de regiões

```
┌──────────────────────────────────────────────────────────────┐
│ cabecalho-da-pagina  Novo projeto (h1)          Sair e salvar │
├──────────────────────────────────────────────────────────────┤
│ trilha-de-etapas  ✓ Dados ── ● Partes ── ○ Documentos ── ○ Rev│
│                   Etapa 2 de 4                                │
├──────────────────────────────────────────────────────────────┤
│ corpo-da-etapa   Título da etapa (h2) + 1 frase de orientação │
│                  Campo  [__________]                          │
│                  Campo  [__________]  texto de ajuda          │
├──────────────────────────────────────────────────────────────┤
│ rodape-de-navegacao  [Voltar]                    [Continuar]  │
└──────────────────────────────────────────────────────────────┘
```

## O que vai em cada região

- **cabecalho-da-pagina** — `h1` com o objetivo ("Novo projeto"), e a saída: "Sair e salvar rascunho" ou "Cancelar" com aviso se houver dados. Nada mais.
- **trilha-de-etapas** — etapas com nome curto e estado (concluída, atual, pendente, com erro), mais "Etapa X de Y" em texto. Etapas concluídas são clicáveis para revisão; pendentes, não.
- **corpo-da-etapa** — título da etapa (`h2`), uma frase dizendo por que pedimos isto, campos com rótulo visível e ajuda. Uma coluna. Erros junto ao campo e um resumo no topo ao tentar avançar.
- **rodape-de-navegacao** — "Voltar" à esquerda (secundária), "Continuar" à direita (primária); na última etapa, a primária diz o que acontece ("Criar projeto", "Enviar 12 minutas").

## Ações

- **Primária:** uma, no `rodape-de-navegacao`, rodape-direita — "Continuar" nas etapas intermediárias e verbo + objeto na final.
- **Voltar:** sempre disponível a partir da etapa 2, sem perder o que foi preenchido.
- **Sair:** salva rascunho ou pede confirmação quando o descarte perde dados.
- **Envio final:** bloqueia clique duplo, mostra progresso e só conclui depois da resposta do servidor.

## Estados

- **carregando** — dados iniciais (listas de opções, rascunho) chegando: esqueleto no corpo; trilha já visível.
- **erro-de-campo** — validação ao sair do campo; ao clicar em "Continuar" com erro, resumo no topo com links para cada campo e foco no resumo; a etapa fica marcada com erro na trilha.
- **erro** — falha do sistema ao avançar ou concluir: alerta na etapa, dados preservados, "Tentar novamente".
- **enviando** — primária com indicador e desabilitada; demais controles bloqueados; para lotes, progresso por item.
- **sucesso** — página de conclusão: o que foi criado, onde encontrar, próximo passo provável; nunca volta para uma etapa vazia.
- **rascunho-retomado** — ao reabrir, avise que um rascunho foi recuperado, de quando, e ofereça descartar e começar do zero.

## Variações

### trilha-horizontal
Etapas numa linha acima do corpo.
**Favorece:** 3–5 etapas com nomes curtos; telas largas.
**Piora:** nomes longos ou mais de 5 etapas não cabem; em celular vira "Etapa X de Y" só.

### trilha-vertical-lateral
Etapas numa coluna à esquerda, com subetapas possíveis.
**Favorece:** fluxos longos, etapas com nomes descritivos, retorno frequente a etapas anteriores.
**Piora:** consome largura; parece formulário de configurações se as etapas não tiverem ordem clara.

### etapa-de-revisao-final
Última etapa mostra o resumo de todas as respostas, com "Alterar" por bloco.
**Favorece:** conclusão cara de desfazer; confiança antes de enviar.
**Piora:** uma etapa a mais; se o resumo não for editável no lugar, a pessoa navega para trás e se perde.

### assistente-em-dialogo
Etapas dentro de um diálogo grande (2–3 etapas curtas).
**Favorece:** tarefa curta que nasce de outra tela e volta a ela.
**Piora:** pouco espaço; perde a URL por etapa; não serve para rascunho longo nem para mais de 3 etapas.

## Anti-padrões

- Trilha que permite pular para etapa ainda não preenchida e depois falha.
- "Voltar" que apaga o que foi digitado.
- Validação que só aparece no envio final, apontando para três etapas atrás.
- Rótulo "Próximo" na última etapa, que na verdade envia.
- Assistente para tarefa diária de três campos.
- Sucesso como toast que some, deixando a pessoa numa tela vazia.

## Checklist

- [ ] 3–6 etapas, nomes curtos, "Etapa X de Y" em texto.
- [ ] Uma primária no rodapé à direita; "Voltar" à esquerda sem perda de dados.
- [ ] Rótulo da última primária descreve o resultado.
- [ ] Erros junto ao campo e resumo no topo ao avançar.
- [ ] Rascunho salvo e retomado com aviso.
- [ ] Envio final protegido contra clique duplo.
- [ ] Página de sucesso com próximo passo; jornada dentro do limite de passos do produto.
