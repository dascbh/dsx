# Catálogo de arquétipos de tela

> **Quando consultar**
> - Antes de construir ou rearranjar uma tela: para decidir **que tipo de tela ela é** e, a partir disso, quais regiões ela tem, onde fica a ação primária e que estados precisa mostrar.
> - Ao escrever a seção 5 (Arquétipos de tela) e a chave `archetypes` do `UX.md` de um projeto.
> - Ao revisar uma tela que "parece confusa": muitas vezes ela mistura dois arquétipos.

## O que é

Um **arquétipo** é um tipo recorrente de tela, definido pela tarefa que a pessoa faz nela — não pela aparência. Cada cartão `archetypes/<id>.md` fixa:

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
| Arquétipo | Que tipo de tela é esta, como ela se organiza e se comporta | `archetypes/` (este catálogo) |
| `UX.md` do projeto | Quais arquétipos o produto usa, em que rotas, e quais opções em aberto o produto fixou | raiz do projeto |

O arquétipo cita padrões pelo id e não repete o conteúdo deles. O `UX.md` cita arquétipos pelo id, mapeia as telas reais do produto a eles e declara desvios.

## Como escolher

Comece pela tarefa principal da tela — o que a pessoa vem fazer ali na maioria das visitas.

1. **SE** quem usa a tela é alguém de fora do produto, sem conta, respondendo uma vez **ENTÃO** [public-decision-page](public-decision-page.md).
2. **SE** a tarefa é curta, nasce em outra tela e volta a ela:
   - **SE** só falta uma decisão sobre uma ação séria e irreversível **ENTÃO** [confirmation-dialog](confirmation-dialog.md);
   - **SE** faltam poucos dados (até ~6 campos) **ENTÃO** [form-dialog](form-dialog.md);
   - **SE** é consultar ou ajustar um registro sem perder a lista **ENTÃO** [detail-side-panel](detail-side-panel.md).
3. **SE** a tarefa é longa ou rara, com etapas que dependem umas das outras **ENTÃO** [step-wizard](step-wizard.md).
4. **SE** a tela gira em torno de um conteúdo único:
   - **SE** a pessoa produz ou altera esse conteúdo **ENTÃO** [editor-with-panel](editor-with-panel.md);
   - **SE** o conteúdo está pronto e a pessoa lê, confere ou despacha **ENTÃO** [document-viewer](document-viewer.md).
5. **SE** a tela gira em torno de muitos itens:
   - **SE** a pessoa só quer saber a situação e onde agir primeiro **ENTÃO** [monitoring-dashboard](monitoring-dashboard.md);
   - **SE** os itens são reutilizáveis (modelos, itens de catálogo) e escolhidos pelo conteúdo **ENTÃO** [library](library.md);
   - **SE** a pessoa processa os itens um após o outro, lendo cada um **ENTÃO** [master-detail](master-detail.md);
   - **SENÃO** (localizar, comparar e agir sobre registros de trabalho) **ENTÃO** [operational-list](operational-list.md).
6. **SE** a pessoa ajusta parâmetros persistentes, sem ordem entre eles **ENTÃO** [settings](settings.md).
7. **SENÃO** a tela provavelmente mistura tarefas: separe-a em telas, cada uma com um arquétipo, ou declare o desvio no `UX.md`.

Arquétipos se combinam por **composição**, não por mistura: uma `operational-list` abre um `detail-side-panel`, que pode pedir um `confirmation-dialog`. Cada peça segue o próprio cartão.

## Os 12 arquétipos

| Arquétipo | Para quê | Ação primária | Variações |
|---|---|---|---|
| [operational-list](operational-list.md) | Localizar, triar e agir sobre muitos registros de trabalho | Cabeçalho, top-right | lote, cards no mobile, filtros laterais, agrupada por status |
| [master-detail](master-detail.md) | Processar itens em sequência com a lista sempre visível | Detalhe, top-right | colunas fixas, mestre recolhível, empilhado no mobile |
| [document-viewer](document-viewer.md) | Ler, conferir e despachar documento pronto | Cabeçalho, top-right | painel à direita, tela cheia, comparação lado a lado |
| [editor-with-panel](editor-with-panel.md) | Produzir conteúdo longo com apoio contextual | Cabeçalho, top-right | painel fixo, recolhível, com abas, modo foco |
| [step-wizard](step-wizard.md) | Guiar tarefa longa ou rara, uma decisão por vez | Rodapé, direita | trilha horizontal, trilha lateral, revisão final, em diálogo |
| [monitoring-dashboard](monitoring-dashboard.md) | Mostrar a situação e o que pede atenção | Cabeçalho (opcional) | indicadores primeiro, pendências primeiro, por perfil |
| [library](library.md) | Encontrar e reutilizar itens de um acervo curado | Cabeçalho (curadores) | grade, lista densa, coleções em árvore, prévia |
| [settings](settings.md) | Ajustar parâmetros persistentes com segurança | Rodapé da seção | salvar por seção, salvar ao alterar, abas no topo |
| [public-decision-page](public-decision-page.md) | Terceiro sem conta lê e responde uma vez | Junto à decisão | binária, com motivo, com identificação, documento longo |
| [form-dialog](form-dialog.md) | Coletar poucos dados sem sair da tela | Rodapé do diálogo | curto, com seções, promover a página |
| [confirmation-dialog](confirmation-dialog.md) | Última decisão consciente antes do irreversível | Rodapé do diálogo | simples, digitar para confirmar, desfazer, consequências listadas |
| [detail-side-panel](detail-side-panel.md) | Consultar ou ajustar um registro sem perder o contexto | Rodapé do painel (só em edição) | sobreposto, empurrando, leitura com link |

## Mantendo o catálogo

- Arquétipo novo: copie um cartão existente, ajuste o front matter e as oito seções do corpo (`Quando usar`, `Mapa de regiões`, `O que vai em cada região`, `Ações`, `Estados`, `Variações`, `Anti-padrões`, `Checklist`), e rode `node tools/lint-archetypes.mjs --index`.
- O linter (`tools/lint-archetypes.mjs`) confere: campos obrigatórios, `id` igual ao nome do arquivo, `register` no enum, `primary-action` com região existente e posição válida, ids de `patterns` existentes em `patterns/index.json`, `rules` dentro de T1–T7/F1–F5, ao menos 2 variações (cada uma com `### <id>`, **Favorece:** e **Piora:**), toda região e todo estado descritos no corpo em negrito, seções na ordem, diagrama em bloco de código, checklist com itens e ausência de URL.
- `archetypes/index.json` é gerado pelo linter — não edite à mão.
- Redação própria; não cite fontes por URL.

## Checklist

- [ ] A tela tem uma tarefa principal e um arquétipo; combinações são composição (lista + painel + diálogo), não mistura.
- [ ] Regiões, posição da primária e estados seguem o cartão, ou o desvio está declarado no `UX.md`.
- [ ] A variação escolhida foi comparada com ao menos uma alternativa pelo que favorece e piora.
- [ ] `node tools/lint-archetypes.mjs` sem erro depois de qualquer mudança no catálogo.
