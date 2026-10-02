---
name: figma-primeiro
description: "Implementa um projeto que nasce no Figma: fundação vira tokens DTCG e DESIGN.md antes da primeira tela, depois as telas com os gates do DSX. Use quando existe arquivo de design e ainda não há código."
---

# figma-primeiro — a fundação antes da primeira tela

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

Quando o projeto nasce no Figma, o erro é começar pela tela mais bonita. Cada
tela implementada isolada inventa seus próprios espaçamentos, cores e
componentes; na décima, existem dez botões diferentes e nenhum design system —
mesmo que o arquivo do Figma tivesse um.

A ordem não é negociável: **fundação → esqueleto → telas → verificação**.

## Antes de qualquer coisa

Carregue a skill **`figma-design-to-code`** antes de `get_design_context`, e a
**`figma-use`** antes de qualquer `use_figma`.
Ferramentas desta direção: `get_variable_defs` (tokens), `get_design_context`
(estrutura e valores), `get_metadata` (mapa raso), `get_screenshot` (o alvo
visual), `download_assets` (ícones e imagens), `add_code_connect_map` (a ponte
durável).

## 1. Ler o arquivo antes de codar nada

Inventário primeiro — quantas telas existem, e quantas são telas **de verdade**:

```js
// use_figma
return figma.root.children.map(p => ({ page: p.name, frames: p.children.map(c => c.name) }));
```

Classifique cada frame com o usuário, porque o arquivo não diz:

| é | sinal | vira código? |
|---|---|---|
| tela | rota própria, estado próprio | sim |
| variante/estado | mesma tela em outra situação | sim, mas dentro da mesma rota |
| exploração | duas ou três versões da mesma coisa | **não** — pergunte qual venceu |
| rascunho | fora do padrão do resto, meio montado | **não** |
| referência | inspiração, print de concorrente | **não** |

Implementar exploração e rascunho como se fossem telas é a forma mais comum de
entregar um app com o dobro do tamanho que o produto precisa.

## 2. Extrair a fundação — antes da primeira tela

A fundação vira os mesmos artefatos que o resto do DSX lê: **tokens DTCG** em
três camadas (skill `tokens`) e **`DESIGN.md`** (skill `design-md`). Não
transporte variáveis direto para um arquivo de tema escrito à mão — o tema é
saída do build dos tokens, não entrada.

**Variáveis → tokens DTCG.** Tire o retrato completo do arquivo e converta pela
ponte, em vez de copiar `get_variable_defs` valor a valor:

1. Cole `tools/figma/snapshot.js` em `use_figma` com `MODE = 'full'` e salve o
   retorno, por exemplo, em `/tmp/figma-full.json` (o retrato inclui as
   variáveis com seus modos e aliases).
2. Compare com os tokens (num projeto novo, o diretório pode partir dos
   arquivos-base do DSX em `tokens/`, copiados para o projeto):

   ```bash
   node <DSX>/tools/figma/figma-para-tokens.mjs --snapshot /tmp/figma-full.json --tokens tokens/
   ```

   Imprime as mudanças por token — valor ou alias, por modo `Claro`/`Escuro` —
   entre as variáveis do arquivo e os `*.tokens.json`. Revise a lista: nome de
   variável `color/text/primary` corresponde ao token `color.text.primary`; as
   coleções `Primitivos`, `Semântico` e `Componente` correspondem às três
   camadas. A saída tem quatro blocos: **Mudanças de token** (tokens que já
   existem e mudaram de valor ou alias), **Variáveis novas no Figma** (sem token
   correspondente), **Sugestões** (valor cru que deveria ser alias para um
   primitivo existente, ou passo de rampa que falta) e **Tokens sem variável no
   Figma**.
3. **Variáveis novas não viram token sozinhas** — a ponte nunca cria token:
   token novo é decisão. Num projeto que nasce do Figma, quase tudo cai nesse
   bloco na primeira passada. Crie os tokens pela skill `tokens` (camada certa,
   nome por intenção, alias em vez de valor cru, seguindo as Sugestões), usando o
   bloco como inventário; depois rode a ponte de novo até as Variáveis novas
   zerarem ou só restarem as que você decidiu não trazer (com motivo).
4. Com a lista revisada, grave as mudanças nos tokens existentes:

   ```bash
   node <DSX>/tools/figma/figma-para-tokens.mjs --snapshot /tmp/figma-full.json --tokens tokens/ --write
   ```

   Com `--write`, a ponte também roda o gate de contraste de
   `contrast-pairs.json` e sai com código 1 se algum par ficar abaixo do mínimo.
5. Siga a skill `tokens` a partir daí: declare os pares em
   `contrast-pairs.json` e rode o build (`node <DSX>/tools/build-tokens.mjs --tokens tokens/` ou o
   do projeto). **Par que falha contraste bloqueia** — o arquivo do Figma não é
   prova de acessibilidade; devolva ao designer com o par e a razão medida
   (`node <DSX>/tools/contrast.mjs "#fg" "#bg"`).

`get_variable_defs` continua útil para conferir um frame isolado (quais
variáveis ele usa de fato), não como fonte da conversão.

Se o arquivo não segue o esquema de três coleções (uma coleção única com
cores cruas por modo, nomes de aparência como `blue-500` no papel de
semântico), a ponte vai mostrar isso no diff: proponha a camada que falta
(primitivos ou semânticos) na skill `tokens` e devolva a proposta de
nomenclatura ao designer — não renomeie em silêncio só no código.

**Estilos de texto → escala tipográfica.** Mesma coisa: nome, família, peso,
tamanho, entrelinha — para `font.*` nos primitivos e para o bloco
`typography:` do `DESIGN.md`. Tamanhos quebrados (13,5) são preservados.

**Regras → `DESIGN.md`.** Gere com a skill `design-md` no **Modo B (definir)**,
mas com os valores vindos do arquivo, não de entrevista nem de
`palette.mjs`: as cores, a escala e os raios são os que a ponte acabou de
gravar. A entrevista do Modo B fica para o que o Figma não diz — tipo de
produto, público, densidade, tom de voz. A tabela **Colors** (Papel | Token |
Onde aparece | Onde NUNCA aparece) sai das descrições das variáveis e das
legendas das amostras do arquivo; o que não estiver escrito lá, pergunte ao
designer.

**Componentes → primitivos do kit.** Os componentes do arquivo dizem quais peças
o design assume que existem. Implemente as que se repetem em ≥ 2 telas, pelas
regras da skill `construir-ui` (só tokens semânticos, todos os estados).

### Se o arquivo não tem variáveis

É comum: arquivo montado com cores cruas e espaçamentos digitados à mão. Não
siga em frente calado — a primeira entrega passa a ser **propor os tokens**:
levante os valores repetidos, agrupe por papel, monte a proposta em DTCG (skill
`tokens`) e devolva ao designer para ele ligar as variáveis no arquivo — de
preferência com `node <DSX>/tools/figma/tokens-para-figma.mjs --tokens tokens/ --script`,
que gera o script de `use_figma` com as três coleções já no formato que a volta
espera (skill `figma-fundacoes`).

Sem isso, o código nasce com hex espalhado e o ciclo com o Figma nunca fecha.

## 3. Esqueleto antes das telas

Confira antes `.dsx/mapas/mapa-projeto.md` — se a skill `mapear` já rodou, ele
diz o que, se algo, já existe do lado do código antes de você decidir o
esqueleto do zero (compatibilidade: na falta dele, aceite o legado
`.claude/figma-claude/project-map.md` e avise que será regravado no caminho
novo na próxima execução). Decida e confirme com o usuário, antes de
implementar a segunda tela:

- **rotas** — o mapa de navegação (o Figma raramente tem; às vezes há um fluxo);
- **shell** — o que é fixo (topo, menu) e o que troca;
- **papéis** — quem vê o quê; duas telas parecidas costumam ser dois perfis;
- **origem dos dados** — o que vem de API, o que é local, o que ainda não existe.

A arquitetura de informação (rotas, nomes, hierarquia) pode passar pela skill
`ux-ia` quando o arquivo não tiver mapa de navegação.

## 4. Implementar tela a tela, do kit para fora

Siga a skill `construir-ui`. Só token, nunca valor cru (`tools/lint-raw-values.mjs`
confere). Reuse o primitivo; padrão que não existe no kit é decisão de produto,
não improviso no meio da tela — confira em `patterns/index.json` se o padrão
de interação desenhado tem entrada no catálogo e se não é um padrão a evitar.

### O que o Figma não carrega — pergunte, não invente

Para cada tela, antes de fechar:

- **estados**: vazio, carregando, erro, sem permissão. O arquivo mostra o caso
  feliz com seis itens perfeitos; o código precisa dos quatro outros.
- **volume**: o que acontece com 4.000 linhas, texto de 200 caracteres, nome
  que não cabe.
- **dados**: de onde vem cada campo; o que é calculado; o que é opcional.
- **comportamento**: o que cada ação faz, o que exige confirmação, o que é
  irreversível.
- **navegação**: como se chega e para onde se volta.
- **responsivo**: um frame de 1440 não é decisão de responsividade — é o único
  tamanho que alguém desenhou.
- **acessibilidade**: foco, ordem de tabulação, rótulo de ícone sem texto,
  contraste (conferir, não confiar no arquivo) — skill `acessibilidade`.

Registre as respostas junto do código. Elas são metade da especificação e não
estão no Figma. Rode a skill `mapear` de novo depois de implementar um lote de
telas — `.dsx/mapas/dominio.md` e `.dsx/mapas/tarefas.md` passam a capturar
essas respostas, já que agora há código real de onde derivá-las, e a próxima
tela não repergunta o que a anterior já resolveu.

### Armadilhas de tradução

- **Texto é placeholder até prova em contrário.** Nomes, valores e datas do
  arquivo raramente são a cópia final — confirme rótulos e mensagens (skill
  `ux-writing` para glossário e fórmulas).
- **Componente do Figma ≠ componente de código.** O agrupamento do designer é
  visual; a fronteira certa em código é a de estado e reuso.
- **Auto-layout não é CSS.** `HUG`/`FILL` mapeiam bem para flex, mas o Figma não
  tem breakpoint, media query nem conteúdo dinâmico.
- **Ícones: extraia ou mapeie, não redesenhe.** `download_assets` para os do
  arquivo; se o projeto adota uma biblioteca, mapeie cada um para o equivalente
  e mostre a lista ao designer.

## 5. Code Connect desde o começo

Ao criar cada primitivo em código, mapeie para o componente do Figma
(`add_code_connect_map`). É barato agora e transforma toda rodada seguinte:
`get_design_context` passa a devolver o nome do componente de código em vez de
uma árvore de frames.

## 6. Verificar reespelhando

Implementou uma tela? Rode `figma-espelhar` **só nela** e compare com o frame
original. Divergência que você não consegue explicar é bug de implementação ou
decisão não registrada — as duas precisam de tratamento agora, não na entrega.

## 7. Matriz nos dois sentidos

Aqui a cobertura se lê ao contrário do projeto que nasceu em código: **frame do
Figma → rota implementada**, com status. Use `figma-cobertura`, seção de
inversão. É a matriz que responde "quanto do design já virou produto" sem
ninguém precisar abrir os dois lados.

## Ao terminar a primeira leva — monte o ciclo

A partir daí o projeto tem os dois lados, e a pergunta "quem manda agora?"
passa a existir. Monte o registro de sincronia e o baseline
(skill `figma-ciclo`, ou `/dsx:figma-iniciar`): num projeto que nasceu no
Figma, a vez costuma começar em `design`, e o baseline é tirado **no momento em
que você implementa** — é ele que define o "antes" da primeira rodada de diff.
Junto do registro nascem a primeira linha de `design/figma-changelog.jsonl`
(`direcao: "figma->codigo"`) e o primeiro `design/figma-reference.json` (skill
`figma-convencoes`) — os três juntos, não em rodadas separadas.
