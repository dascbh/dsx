# Catálogo de arquétipos de tela

> **Quando consultar**
> - Antes de construir ou rearranjar uma tela: para decidir **que tipo de tela ela é** e, a partir disso, quais regiões ela tem, onde fica a ação primária e que estados precisa mostrar.
> - Ao escrever a seção 5 (Arquétipos de tela) e a chave `arquetipos` do `UX.md` de um projeto.
> - Ao revisar uma tela que "parece confusa": muitas vezes ela mistura dois arquétipos.

## O que é

Um **arquétipo** é um tipo recorrente de tela, definido pela tarefa que a pessoa faz nela — não pela aparência. Cada cartão `arquetipos/<id>.md` fixa:

- **quando usar** e quando não, em decisões SE → ENTÃO;
- **regiões** (com diagrama) e o que vai em cada uma;
- **onde fica a ação primária** e quantas pode haver;
- **estados** que a tela precisa mostrar;
- **variações** — arranjos alternativos, cada um com o que favorece e o que piora;
- **anti-padrões** e **checklist**;
- os **padrões** de interação que se aplicam (ids de `patterns/`) e as **regras** da verificação automática de UX (T1–T7, F1–F5) que valem para ele.

O contrato do formato está em `knowledge/fundamentos/ux-md.md` (seção "Arquétipos de tela").

## Três níveis, um não repete o outro

| Nível | Responde | Onde |
|---|---|---|
| Padrão | Uma micro-decisão isolada: modal ou página, onde exibir o erro, toast ou alerta | `patterns/` |
| Arquétipo | Que tipo de tela é esta, como ela se organiza e se comporta | `arquetipos/` (este catálogo) |
| `UX.md` do projeto | Quais arquétipos o produto usa, em que rotas, e quais opções em aberto o produto fixou | raiz do projeto |

O arquétipo cita padrões pelo id e não repete o conteúdo deles. O `UX.md` cita arquétipos pelo id, mapeia as telas reais do produto a eles e declara desvios.

## Como escolher

Comece pela tarefa principal da tela — o que a pessoa vem fazer ali na maioria das visitas.

1. **SE** quem usa a tela é alguém de fora do produto, sem conta, respondendo uma vez **ENTÃO** [pagina-publica-de-decisao](pagina-publica-de-decisao.md).
2. **SE** a tarefa é curta, nasce em outra tela e volta a ela:
   - **SE** só falta uma decisão sobre uma ação séria e irreversível **ENTÃO** [dialogo-de-confirmacao](dialogo-de-confirmacao.md);
   - **SE** faltam poucos dados (até ~6 campos) **ENTÃO** [dialogo-de-formulario](dialogo-de-formulario.md);
   - **SE** é consultar ou ajustar um registro sem perder a lista **ENTÃO** [painel-lateral-de-detalhe](painel-lateral-de-detalhe.md).
3. **SE** a tarefa é longa ou rara, com etapas que dependem umas das outras **ENTÃO** [assistente-em-etapas](assistente-em-etapas.md).
4. **SE** a tela gira em torno de um conteúdo único:
   - **SE** a pessoa produz ou altera esse conteúdo **ENTÃO** [editor-com-painel](editor-com-painel.md);
   - **SE** o conteúdo está pronto e a pessoa lê, confere ou despacha **ENTÃO** [documento-com-visor](documento-com-visor.md).
5. **SE** a tela gira em torno de muitos itens:
   - **SE** a pessoa só quer saber a situação e onde agir primeiro **ENTÃO** [painel-de-acompanhamento](painel-de-acompanhamento.md);
   - **SE** os itens são reutilizáveis (modelos, cláusulas) e escolhidos pelo conteúdo **ENTÃO** [biblioteca](biblioteca.md);
   - **SE** a pessoa processa os itens um após o outro, lendo cada um **ENTÃO** [mestre-detalhe](mestre-detalhe.md);
   - **SENÃO** (localizar, comparar e agir sobre registros de trabalho) **ENTÃO** [lista-operacional](lista-operacional.md).
6. **SE** a pessoa ajusta parâmetros persistentes, sem ordem entre eles **ENTÃO** [configuracoes](configuracoes.md).
7. **SENÃO** a tela provavelmente mistura tarefas: separe-a em telas, cada uma com um arquétipo, ou declare o desvio no `UX.md`.

Arquétipos se combinam por **composição**, não por mistura: uma `lista-operacional` abre um `painel-lateral-de-detalhe`, que pode pedir um `dialogo-de-confirmacao`. Cada peça segue o próprio cartão.

## Os 12 arquétipos

| Arquétipo | Para quê | Ação primária | Variações |
|---|---|---|---|
| [lista-operacional](lista-operacional.md) | Localizar, triar e agir sobre muitos registros de trabalho | Cabeçalho, topo-direita | lote, cards no mobile, filtros laterais, agrupada por status |
| [mestre-detalhe](mestre-detalhe.md) | Processar itens em sequência com a lista sempre visível | Detalhe, topo-direita | colunas fixas, mestre recolhível, empilhado no mobile |
| [documento-com-visor](documento-com-visor.md) | Ler, conferir e despachar documento pronto | Cabeçalho, topo-direita | painel à direita, tela cheia, comparação lado a lado |
| [editor-com-painel](editor-com-painel.md) | Produzir conteúdo longo com apoio contextual | Cabeçalho, topo-direita | painel fixo, recolhível, com abas, modo foco |
| [assistente-em-etapas](assistente-em-etapas.md) | Guiar tarefa longa ou rara, uma decisão por vez | Rodapé, direita | trilha horizontal, trilha lateral, revisão final, em diálogo |
| [painel-de-acompanhamento](painel-de-acompanhamento.md) | Mostrar a situação e o que pede atenção | Cabeçalho (opcional) | indicadores primeiro, pendências primeiro, por perfil |
| [biblioteca](biblioteca.md) | Encontrar e reutilizar itens de um acervo curado | Cabeçalho (curadores) | grade, lista densa, coleções em árvore, prévia |
| [configuracoes](configuracoes.md) | Ajustar parâmetros persistentes com segurança | Rodapé da seção | salvar por seção, salvar ao alterar, abas no topo |
| [pagina-publica-de-decisao](pagina-publica-de-decisao.md) | Terceiro sem conta lê e responde uma vez | Junto à decisão | binária, com motivo, com identificação, documento longo |
| [dialogo-de-formulario](dialogo-de-formulario.md) | Coletar poucos dados sem sair da tela | Rodapé do diálogo | curto, com seções, promover a página |
| [dialogo-de-confirmacao](dialogo-de-confirmacao.md) | Última decisão consciente antes do irreversível | Rodapé do diálogo | simples, digitar para confirmar, desfazer, consequências listadas |
| [painel-lateral-de-detalhe](painel-lateral-de-detalhe.md) | Consultar ou ajustar um registro sem perder o contexto | Rodapé do painel (só em edição) | sobreposto, empurrando, leitura com link |

## Mantendo o catálogo

- Arquétipo novo: copie um cartão existente, ajuste o front matter e as oito seções do corpo (`Quando usar`, `Mapa de regiões`, `O que vai em cada região`, `Ações`, `Estados`, `Variações`, `Anti-padrões`, `Checklist`), e rode `node tools/lint-arquetipos.mjs --index`.
- O linter (`tools/lint-arquetipos.mjs`) confere: campos obrigatórios, `id` igual ao nome do arquivo, `registro` no enum, `acao-primaria` com região existente e posição válida, ids de `padroes` existentes em `patterns/index.json`, `regras` dentro de T1–T7/F1–F5, ao menos 2 variações (cada uma com `### <id>`, **Favorece:** e **Piora:**), toda região e todo estado descritos no corpo em negrito, seções na ordem, diagrama em bloco de código, checklist com itens e ausência de URL.
- `arquetipos/index.json` é gerado pelo linter — não edite à mão.
- Redação própria; não cite fontes por URL.

## Checklist

- [ ] A tela tem uma tarefa principal e um arquétipo; combinações são composição (lista + painel + diálogo), não mistura.
- [ ] Regiões, posição da primária e estados seguem o cartão, ou o desvio está declarado no `UX.md`.
- [ ] A variação escolhida foi comparada com ao menos uma alternativa pelo que favorece e piora.
- [ ] `node tools/lint-arquetipos.mjs` sem erro depois de qualquer mudança no catálogo.
