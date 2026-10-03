---
name: figma-trazer
description: "Traz mudanças do Figma para o código na camada certa (token, componente, tela, texto), com os gates do DSX e recusas registradas. Use quando pedirem para aplicar no código o que mudou no Figma."
argument-hint: "[frames ou relatório de diff]"
---

# figma-trazer — aplicar no lugar certo, não onde a mudança apareceu

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

O erro que define esta fase: a pessoa mudou o espaçamento numa tela no Figma, e
você muda o espaçamento **daquela tela** no código. Três rodadas depois o app
tem cinco espaçamentos diferentes para o mesmo caso e o design system morreu.

Uma mudança visual que aparece em três telas é mudança de **primitivo ou de
token** — quase nunca de tela.

Resumo da rodada (o resto da skill detalha cada passo):

- Comece pelo relatório de diff (`/dsx:figma-diff`), não pelo olho: comparar
  dois frames lado a lado acha as mudanças grandes e perde as de 2px, que são as
  que quebram o design system.
- Ordem obrigatória: **token → primitivo → composição → texto**. Assim a
  composição já usa a peça nova.
- Trave e devolva, em vez de aplicar, o que rebaixa contraste, remove o segundo
  canal de um estado, cria padrão que não existe no kit, contraria um padrão
  marcado `evitar` no catálogo, muda token sem alguém ter olhado o efeito nas
  outras telas, ou desfaz achado já registrado como intencional.
- Feche a rodada: verifique reespelhando a tela tocada, atualize
  `design/figma-sync.md` (aplicadas, recusadas **com motivo**, vez → `code`),
  regere o baseline, acrescente a linha no changelog e grave os achados.

## Antes de qualquer coisa

Carregue a skill **`figma-design-to-code`** antes de chamar `get_design_context`.
Ela é pré-requisito obrigatório do MCP e evita implementação por adivinhação.
Para qualquer `use_figma` (snapshot, reespelho), carregue antes a **`figma-use`**.

Confira a vez em `design/figma-sync.md`: a volta roda com `turn: applying`
(troque com `/dsx:figma-vez applying` — a troca exige o relatório de diff
produzido e revisado). Com a vez em `applying`, ninguém mexe nos mesmos
arquivos por fora. Registro legado com `vez: aplicando` vale como `turn: applying`.

Leia também `design/figma-changelog.jsonl` (a última rodada: `summary`,
`direction`, ponteiro de `findings`) e o `design/figma-findings/<rodada>.md` que ela
aponta — é lá que pode já estar explicado algo que pareceria uma divergência
nova, ou uma proposta que já foi recusada com motivo.

Ferramentas úteis nesta direção:

| ferramenta | para quê |
|---|---|
| `get_design_context` | a estrutura e os valores do frame — a leitura principal |
| `get_screenshot` | o que a coisa deve parecer, para conferir no fim |
| `get_variable_defs` | quais variáveis o frame usa — é isto que diz se virou token |
| `get_code_connect_map` | qual componente de código já corresponde a qual componente do Figma |
| `get_metadata` | mapa raso quando você ainda não sabe em que nó entrar |

## 1. Descubra o que mudou — pelo diff, não pelo olho

Se o projeto mantém o ciclo (skill `figma-ciclo`), **comece pelo relatório de
diff**: snapshot novo comparado ao baseline versionado devolve a lista exata de
mudanças, já agrupada. Não tente achar a diferença olhando dois frames lado a
lado — você acha as grandes e perde as de 2px, que são justamente as que
quebram o design system.

```bash
# snapshot atual via use_figma com tools/figma/snapshot.js
# (MODE='hashes' → depois 'full' nos frames alterados)
node <DSX>/tools/figma/diff-baseline.cjs \
     design/figma-baseline/app.json /tmp/atual.json
```

Quando o diff for grande o bastante para poluir a conversa, delegue ao agente
`leitor-figma`: ele tira o retrato, roda o diff e devolve só o relatório
classificado.

Sem baseline (primeira volta, ou projeto sem ciclo montado): peça ao usuário a
lista de frames alterados e leia o frame **e o equivalente no espelho**. Varrer
o arquivo inteiro procurando diferença custa caro e erra — e é o sinal de que
vale montar o ciclo (`/dsx:figma-iniciar`) antes da próxima rodada.

Propostas que o designer deixou na página `09 · Propostas` seguem o formato da
skill `figma-propostas`; leia cada uma com o frame de origem que ela cita.

## 1b. Prove no código que a divergência existe lá

**Auditoria feita sobre o espelho pode estar medindo o espelho.** Antes de aceitar
qualquer achado como mudança de produto, confirme no código que o problema existe
lá — custa um `grep` e evita mudar o app inteiro por um defeito de desenho.

Sinais de que o achado é do espelho, não do app:

- **A variação some no código.** "Botões com três alturas nos diálogos" costuma
  virar um único `<Button>` sem `size`; a variação veio do helper que desenhou.
- **A assimetria não tem lógica de produto.** Duas variantes de um componente
  mudaram e a terceira não — ninguém decide isso; ferramenta decide. (A
  componentização automática do servidor MCP é a suspeita número um.)
- **O achado contraria uma decisão registrada** (ADR, `DESIGN.md`, documento de
  fundação) sem que a proposta cite a decisão. O designer não estava
  discordando: estava descrevendo o que viu.
- **O que a proposta pede já existe** do lado do código, e faltava só no Figma.

Quando for ruído do espelho, o produto da rodada não é código: é **corrigir o
espelho** para a próxima auditoria medir o app — e dizer isso ao usuário com a
prova, não como opinião. Registre em `Recusadas` com a evidência, senão a mesma
proposta volta na rodada seguinte com mais convicção.

## 2. Classifique cada mudança antes de escrever qualquer linha

Esta é a fase que decide a qualidade do resultado. Quando o diff existe, ele já
entrega a classificação pronta — a **mesma mudança em ≥ 2 frames** cai em
`primitivo`, mudança de valor de variável ou estilo cai em `token`, e o resto é
`composição`. Confira o julgamento, não o refaça.

| classe | sinal | onde aplicar | como, no DSX |
|---|---|---|---|
| **token** | cor, raio, espaçamento, tamanho/peso de fonte, elevação | os tokens DTCG (ou o arquivo de tema) — e some ao escopo a varredura de regressão do app inteiro | skill `tokens` + `figma-to-tokens.mjs` + `build-tokens.mjs` (seção 3a) |
| **primitivo** | mudou um componente do kit, ou o mesmo ajuste aparece em ≥ 2 telas | o componente compartilhado, uma vez | regras da skill `construir-ui` + `lint-raw-values` |
| **composição** | ordem, agrupamento, o que aparece e o que some numa tela específica | o arquivo daquela página | regras da skill `construir-ui` + `lint-raw-values` |
| **texto** | rótulo, microcópia, mensagem de erro/vazio | a string no lugar de origem — nunca duplicada na tela | skill `ux-writing` (glossário, fórmulas) |
| **padrão novo** | não existe primitivo que resolva | **pare e proponha**; não invente um componente no meio de uma tela | `patterns/index.json` primeiro; regra nova → `DESIGN.md` via skill `design-md` |

Escreva a classificação antes de codar e mostre ao usuário quando houver
`token` ou `padrão novo` na lista — os dois têm custo muito além da tela onde
apareceram.

### Cada proposta contra o catálogo de padrões

Antes de aceitar uma proposta de interação (não só visual), procure a decisão
que ela toma em `patterns/index.json` (campos `id`, `regra`, `status`) e abra o
cartão (`arquivo`) quando o caso não for trivial. Exemplos:

- erro de formulário que passou a aparecer em toast → `toast-vs-inline-alert`
  (erro de campo fica junto do campo, não num toast que some);
- formulário longo movido para dentro de um modal → `when-to-avoid-modal`;
- exclusão que ganhou diálogo de confirmação em ação rotineira →
  `confirm-deletion` / `undo`;
- botão que virou só ícone → `icon-only-button`.

Proposta que contraria um padrão com `status: "evitar"` (ou um `antipadrao`)
**volta como gate**, com o `id` do padrão e a regra no motivo. Proposta que cai
num padrão `usar-com-cautela` passa, mas o motivo da exceção precisa estar
escrito — leia a seção **Decisão** do cartão e confira se o caso se encaixa.

## 2b. Tela nova não é mudança — é outro trabalho

O diff traz uma seção `Frames novos no Figma`. Não implemente direto: um frame
novo pode ser quatro coisas, e três delas não viram rota.

| é | como reconhecer | o que fazer |
|---|---|---|
| **rota nova** | conteúdo e propósito que nenhuma tela cobre | trate como feature, não como ajuste (abaixo) |
| **estado novo** de tela existente | mesma tela em outra situação (vazio, erro, permissão) | implemente dentro da rota que já existe |
| **exploração** | duas ou três versões do mesmo frame | pergunte qual venceu; as outras não viram código |
| **duplicata** | resolve o que uma tela já resolve, com outro nome | decisão de produto — não crie a segunda |

Para rota nova, o frame **não basta**. Antes de escrever qualquer linha, colete
o que o Figma não carrega: rota e navegação de entrada/saída, origem dos dados,
papel que tem acesso, estados (vazio, carregando, erro, sem permissão),
comportamento das ações e o que é irreversível, e o que acontece em tela
estreita. `.dsx/maps/flows.md` e `.dsx/maps/tasks.md` podem já responder
onde ela se conecta e quais são seus passos; `.dsx/maps/domain.md` (ou
`domain.json`) pode já responder de onde vêm os dados. Consulte-os antes de
perguntar. O que nenhum deles cobre é pergunta ao usuário, não invenção sua.

**Compatibilidade:** ao procurar um mapa, leia primeiro `.dsx/maps/`; se não
existir, aceite os legados `.dsx/mapas/` (nomes em português: `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes`; chaves JSON antigas em camelCase, como `generatedAt` ou `subPages`, valem como as novas em snake_case; tudo com o aviso "nome antigo, renomeie para X") e `.claude/figma-claude/` (`user-flows.md`,
`task-flows.md`, `domain-map.md`, `ui-map.json`, `project-map.json`) e avise que
ele será regravado no caminho novo na próxima execução de `mapear`.

Se o projeto ainda não tem esse esqueleto — porque nasceu no Figma —, o
procedimento inteiro é a skill `figma-primeiro`, não esta.

## 3. Aplique

Na ordem: token → primitivo → composição → texto. Assim a composição já usa a
peça nova, e você não escreve o mesmo ajuste duas vezes.

### 3a. Token

Com tokens DTCG no projeto, não edite o JSON à mão a partir do que você leu no
frame — gere o diff a partir do snapshot:

```bash
# snapshot completo (MODE='full') salvo de use_figma com tools/figma/snapshot.js
node <DSX>/tools/figma/figma-to-tokens.mjs --snapshot /tmp/atual-full.json --tokens tokens/
```

A ponte compara as variáveis do snapshot com os tokens e imprime as mudanças
por token — valor ou alias, por modo `Claro`/`Escuro` (`color/text/primary` no
Figma = `color.text.primary` no DTCG), além das **Variáveis novas no Figma**
(sem token correspondente), das **Sugestões** (valor cru que deveria ser alias
para um primitivo) e dos **Tokens sem variável no Figma**. Revise a lista com o
usuário (token é mudança de app inteiro) e só então grave:

```bash
node <DSX>/tools/figma/figma-to-tokens.mjs --snapshot /tmp/atual-full.json --tokens tokens/ --write
node <DSX>/tools/build-tokens.mjs --tokens tokens/
```

Com `--write`, a ponte só altera tokens **existentes** e roda o gate de
contraste de `contrast-pairs.json` (sai com código 1 se algum par reprovar; aí
reverta os arquivos de tokens com `git checkout` e devolva a proposta). Variável
nova no Figma nunca vira token automaticamente: é classe `padrão novo` /
decisão — crie pela skill `tokens`, se aprovada, e rode a ponte de novo.

Daí em diante vale a skill `tokens`: componente nunca consome primitivo, tema
escuro com as mesmas chaves do claro, e todo par novo declarado em
`contrast-pairs.json`. **`build-tokens.mjs` falhando em contraste bloqueia a
mudança** — não "conserte" ajustando o par na mão para passar; devolva a
proposta com a razão medida. Se a mudança alterou o papel de uma cor (onde ela
pode ou não aparecer), atualize a tabela **Colors** do `DESIGN.md` pela skill
`design-md`.

Sem tokens DTCG (tema MUI, Tailwind, variáveis CSS soltas), aplique no arquivo
de tema do projeto, no formato dele, com as mesmas regras de camada da skill
`tokens`, e confira cada par afetado com `tools/contrast.mjs`.

### 3b. Primitivo e composição

Valem as regras da skill `construir-ui`: só tokens semânticos, todos os estados
obrigatórios (vazio, carregando, erro, sucesso, foco, desabilitado), reuso do
kit antes de markup novo. Ao terminar, rode
`node <DSX>/tools/lint-raw-values.mjs <arquivos tocados>` — valor cru que entrou
nesta rodada é regressão.

### 3c. Texto

Toda string nova ou alterada passa pela skill `ux-writing`: glossário do
projeto (mesmo conceito = mesma palavra em todas as telas), fórmulas de botão,
erro, vazio e confirmação. O texto do frame é proposta, não cópia final — se
contradiz o glossário, o glossário ganha e a divergência vai no motivo.

### Regras que valem sempre

- **Só token, nunca valor cru.** Se o Figma mostra `#007a00`, ache o token que
  tem esse valor e use o token. Se não existe token, é mudança de token (classe
  acima), não um hex no meio do JSX.
- **Reuse o primitivo.** Antes de escrever markup novo, procure o componente que
  já resolve. O Figma frequentemente descreve um `Card` que o kit já tem.
  `.dsx/maps/ui-map.json`, se existir, já tem o kit de componentes
  categorizado; `.dsx/maps/project-map.json` ao menos tem onde os componentes
  moram.
- **Não traga do Figma o que o Figma não sabe.** Estado de carregamento, erro,
  vazio, foco, teclado, leitor de tela, comportamento responsivo além do frame
  desenhado — nada disso está lá. Preserve o que o código já faz; um frame que
  não mostra o estado vazio não é ordem de removê-lo.
- **Contraste é regressão, não gosto.** Não confie no olho — meça:

  ```bash
  node <DSX>/tools/contrast.mjs "#767676" "#ffffff"   # AA/AAA para texto, texto grande e UI
  ```

  Se a mudança joga um par texto/fundo abaixo de 4,5:1 (3:1 para texto grande
  ou componente de UI), não aplique: registre e devolva. Vale mesmo quando
  ficou mais bonito.
- **Regra nova de uso é documentação, não só código.** Componente novo, variante
  nova ou token com papel novo que a rodada aprovou → atualize o `DESIGN.md`
  pela skill `design-md` (componentes: variantes, estados, contraindicações;
  cores: a tabela Colors). Sem isso, o próximo agente que construir tela não
  sabe que a regra existe.

## 4. Code Connect — pague uma vez, colha sempre

Se o projeto vai fazer isso mais de uma vez, mapeie os primitivos do kit para
os componentes do Figma (`add_code_connect_map`). A partir daí
`get_design_context` devolve o nome do componente de código em vez de uma
árvore de frames, e a aplicação deixa de ser tradução.

Mapeie o kit (botão, chip, card, campo, tabela), não as telas.

## 5. Verifique fechando o ciclo

Rode o app e olhe. Depois **reespelhe a tela tocada** (skill `figma-espelhar`,
só aquele frame) e compare com a proposta lado a lado. Se as duas não batem,
uma das duas está errada — e você descobre agora, não na próxima rodada.

Verifique nos dois temas se o projeto tem modo escuro: token trocado sem olhar
o escuro é o jeito mais comum de introduzir contraste ruim.

Passe as telas tocadas pela skill `acessibilidade`: foco visível, ordem de
tabulação, alvo de toque ≥ 24×24 px (44 px em toque — padrão `touch-target`),
estado nunca comunicado só por cor (padrão `not-color-alone`). Proposta que removeu
o segundo canal de um estado não passa, mesmo que o diff a mostre aprovada pelo
designer.

## 6. Devolva o que não foi aplicado

Toda proposta recusada volta com motivo, uma linha cada:

```
Recusadas nesta rodada
- Chip de status sem borda (frame 09/03) — cor deixaria de ser acompanhada de
  forma; o contorno é o segundo canal (padrão not-color-alone).
- Densidade da tabela em 24px (frame 09/07) — o registro do produto é console
  denso; mudaria a régua de todas as listas, não só desta.
- Erro de CPF em toast (frame 04/02) — contraria toast-vs-inline-alert: erro de
  campo fica junto do campo.
- color/text/muted → neutral/500 (token) — build-tokens falhou: 3,9:1 sobre
  color/bg/canvas, mínimo 4,5:1.
```

Sem isso a mesma proposta volta na rodada seguinte, e ninguém lembra por que
foi recusada da primeira vez.

## Encerramento

Atualize o registro de sincronia do projeto (`design/figma-sync.md`, skill
`figma-ciclo`): o que foi aplicado, o que foi recusado **com motivo** e a quem
passa a vez (`turn: code`). Sem esse passo, a próxima rodada de espelho apaga o
trabalho de design que acabou de virar código. Regere o baseline
(`design/figma-baseline/`) a partir do arquivo como ficou — baseline velho faz a
próxima rodada reapresentar como novidade tudo que você acabou de aplicar.

Feche também com uma linha nova em `design/figma-changelog.jsonl`
(`direction: "figma->code"`, `tokens_changed` com os nomes das variáveis que a
ponte gravou) e, se algum achado não virou código nesta rodada (fora de escopo,
precisa de decisão de produto), registre em `design/figma-findings/<rodada>.md`
com a severidade 0–4 da skill `revisar-ux` — é o mesmo formato que a ida usa, e
é o que permite ao próximo agente (dos dois lados) saber o que já foi visto e
recusado sem reabrir a investigação do zero. Se a rodada mudou fundação ou
estrutura do arquivo, regenere `design/figma-reference.json` (skill
`figma-convencoes`).
