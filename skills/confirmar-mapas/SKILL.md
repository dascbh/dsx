---
name: confirmar-mapas
description: "Confirma com o usuário o que os mapas do projeto inferiram, cruzando com specs e docs, e grava o AS-IS/TO-BE em design/as-is-to-be.md. Use depois de /dsx:mapear, quando a precisão importa antes de construir ou levar ao Figma."
argument-hint: "[caminho para limitar a varredura, opcional — o padrão é o projeto inteiro]"
---

# confirmar-mapas — a passagem guiada da descoberta para o trabalho

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

**Antes de qualquer outra coisa, diga contra qual projeto isto está
rodando** — nome do diretório e caminho — como primeira linha da resposta.
Esta etapa é longa e fala com o usuário várias vezes ao longo de várias
rodadas; numa sessão que alterna entre mais de um projeto, ficar calado
sobre qual está ativo é exatamente como essa confusão acontece no meio da
execução.

O `mapear` é silencioso porque é rápido e barato de rodar de novo — palpite
errado não custa nada, já que ninguém lê os mapas sem confirmação. Mas
`figma-espelhar`, `figma-trazer` e `construir-ui` vão agir sobre
`fluxos.md`, `tarefas.md` e `dominio.json` como se fossem fato. Onde esses
arquivos são na verdade inferência — um fluxo nomeado por palpite, uma
dependência lida do texto da UI, uma relação suposta a partir do formato de
uma API — essa inferência precisa que uma pessoa olhe para ela uma vez, de
propósito, antes que o trabalho comece a se apoiar nela.

Esta skill é essa vez. É a única etapa de descoberta que fala com o usuário
— não é descuido, é o objetivo.

## As quatro fases

1. **Renovar a descoberta.** Rodar o `mapear` de novo, para que tudo abaixo
   parta do estado atual do projeto.
2. **Confrontar.** Rodar o `analisador-specs` contra os seis mapas e as
   specs/docs que o projeto tiver.
3. **O assistente.** Reaplicar o que já foi confirmado numa execução
   anterior (o `mapear` acabou de reduzir tudo a palpite de novo) e então
   confirmar ou corrigir o que sobrar — o que os próprios mapas marcaram
   como incerto, mais o que o `analisador-specs` achou.
4. **Gravar a linha de base.** `design/as-is-to-be.md` — o AS-IS, qualquer
   intenção TO-BE que o assistente trouxe à tona, e o que segue em aberto.

## 1. Renovar a descoberta

Rode `/dsx:mapear` no modo `completo` (passa o escopo, se houver). Espere
terminar antes de continuar — o assistente só é tão bom quanto o que a
descoberta achou. Este é o único caso em que rodar de novo, mesmo que tenha
rodado há poucos minutos, é o certo por padrão: o trabalho inteiro desta
skill é precisão, e a descoberta costuma ser barata.

"Costuma" — num projeto grande não é. Cinco agentes mapeadores em paralelo
numa base larga e profunda já levaram, cada um, mais de vinte minutos na
prática, e o `mapear` acabou de rodá-los uma vez. Se `/dsx:mapear` rodou
nesta mesma sessão, há instantes, sem mudança de código desde então, diga
ao usuário com franqueza quanto rodar de novo vai custar (uma estimativa
real, a partir do que você acabou de ver levar) e ofereça pular direto para
a fase 2 usando os mapas já em disco. Faça a renovação completa por padrão
se ele não responder — precisão continua sendo o objetivo desta skill —
mas nunca gaste esse tempo em silêncio em nome dele sem lhe dar a escolha.

Este passo tem uma consequência que a fase 3 precisa desfazer: os agentes do
`mapear` sempre **regeneram e sobrescrevem por completo** `fluxos.json`,
`tarefas.json` e `dominio.json` do zero, sem memória nenhuma do que uma
pessoa confirmou numa execução anterior desta skill. Deixado assim, isso
reverteria em silêncio toda confirmação passada a um palpite cru. O ledger
de confirmações da fase 3 existe exatamente para sobreviver a isso e
devolver as correções confirmadas.

**Compatibilidade com o fluxo anterior:** ao procurar um mapa ou o ledger,
leia primeiro `.dsx/mapas/`; se não existir, aceite o legado
`.claude/figma-claude/` (`user-flows.*`, `task-flows.*`, `domain-map.*`,
`confirmations.json`…) e avise que ele será regravado no caminho novo. Esta
skill sempre **grava** em `.dsx/mapas/` — em particular, um
`confirmations.json` legado é lido como ledger e regravado como
`.dsx/mapas/confirmacoes.json` ao final da fase 3, sem perder nenhum item.

## 2. Confrontar specs e docs

Rode o agente `analisador-specs` (`agents/analisador-specs.md`). Ele lê os
seis mapas mais as docs que o `mapeador-projeto` encontrou e devolve uma
lista de divergências — uma spec descrevendo algo que nenhum mapa tem, um
mapa sem doc nenhuma por trás de uma regra de consequência, terminologia que
derivou entre uma doc e o código. É um relatório, não um arquivo: incorpore-o
direto à lista de perguntas em aberto da próxima fase.

## 3. O assistente

### Reunir as perguntas em aberto

Junte, dos que existirem:

- o array `uncertain` de `.dsx/mapas/fluxos.json`
- o array `uncertain` de `.dsx/mapas/tarefas.json`
- o array `uncertain` de `.dsx/mapas/dominio.json`
- o relatório de divergências do `analisador-specs`

Essa é a lista completa de candidatos. Priorize: regras de negócio e
relações entre entidades primeiro (as erradas são as que mais custam depois
— dinheiro, permissões, ações irreversíveis), depois dependências entre
tarefas, e por último nomes de fluxo e deriva de terminologia (o mais barato
de errar, e o mais barato de corrigir depois também).

### O ledger de confirmações

Todo candidato vindo dos três arquivos dos mapeadores carrega uma `key` — um
identificador estrutural (uma cadeia de rotas, a localização de uma tarefa,
um par entidade/relação), não texto livre. É essa chave que torna as
reexecuções seguras: a redação muda entre execuções do mesmo agente
mapeador mesmo quando nada no código mudou, então casar por semelhança de
frase não funciona — casar por chave funciona.

`.dsx/mapas/confirmacoes.json` é um ledger **de propriedade exclusiva desta
skill** — o `mapear` e seus agentes nunca o leem nem o gravam. O trabalho
dele é sobreviver ao que a fase 1 acabou de fazer: o `mapear` reduzindo os
três arquivos de origem a palpites crus, não confirmados. Formato (as chaves
JSON ficam em inglês — são contrato de máquina; o valor de `map` é o nome do
mapa no DSX, e na leitura os nomes legados `user-flows`, `task-flows` e
`domain-map` valem como `fluxos`, `tarefas` e `dominio`):

```json
{
  "confirmed": [
    {
      "map": "fluxos",
      "key": "flow:/demands->/demands/new->/demands/:id",
      "why": "nenhum rótulo explícito no código para esta sequência; nomeado a partir do texto da rota/botão",
      "resolution": "confirmed as-is",
      "confirmedAt": "2026-08-18"
    }
  ],
  "open": [
    { "map": "dominio", "key": "entity:Demand/relationship:Item", "item": "tipo da relação Demand -> Item (1:N)", "why": "nenhum schema formal encontrado; inferido do formato aninhado de uma resposta da API", "leftOpenAt": "2026-08-18" }
  ]
}
```

`resolution` é `"confirmed as-is"` (valor literal, contrato de máquina) ou a
própria correção, nas palavras do usuário quando ele deu uma. `why` é
guardado literalmente, como estava no candidato no momento da confirmação —
é a linha de base contra a qual a próxima execução compara para detectar
deriva, então nunca o parafraseie na entrada.

### Reaplicar antes de perguntar qualquer coisa

Antes de o assistente abrir, percorra cada candidato fresco contra o ledger
pela `key` — isto acontece em toda execução, mesmo que no fim nada novo
precise ser perguntado:

- **Chave encontrada em `confirmed`, texto de `why` igual ao guardado** →
  não pergunte. Em vez disso, grave imediatamente a `resolution` guardada no
  ledger dentro do arquivo de origem recém-regenerado, do mesmo jeito que
  "Aplicar as respostas" da fase 3 faria, e então tire o item do array
  `uncertain` daquele arquivo. É este passo que de fato desfaz a
  sobrescrita da fase 1 — pular a pergunta em silêncio não basta sozinho,
  porque o arquivo de origem ainda precisa receber de volta o valor
  confirmado.
- **Chave encontrada em `confirmed`, mas o texto de `why` difere do
  guardado** (o código mudou desde então) → não reaplique; coloque na fila
  do assistente e diga isso ao perguntar: *"você confirmou isto antes, mas
  o código por trás mudou desde então — vale uma segunda olhada."*
- **Chave encontrada em `open`** → volta para a fila do assistente, mas não
  encha a sessão com uma repetição literal de todo item recusado em toda
  execução; depois da primeira reoferta, um curto "ainda em aberto: N itens,
  quer revisitar algum?" basta.
- **Chave que não aparece em lugar nenhum do ledger** → nova; entra na fila
  do assistente normalmente.
- **Uma chave do ledger que não aparece mais entre os candidatos frescos
  desta execução** (a rota/tarefa/entidade a que ela se referia não existe
  mais no código) → aposente-a do ledger; não carregue uma confirmação órfã
  para sempre.

Isto — não o assistente em si — é o mecanismo que torna esta skill segura
para rodar de novo: ela nunca regride um fato confirmado a palpite cru, e
nunca descarta em silêncio um que ficou em aberto.

### Perguntar

Use `AskUserQuestion`, em lotes de poucos itens (a ferramenta aceita no
máximo 4 por chamada), com o que sobrou na fila depois da passada de
reaplicação acima, os de maior prioridade primeiro. Dê ao usuário uma opção
real de dizer "não sei, deixa como inferido" — não arranque um palpite
dele à força. Para o que tiver opções honestamente abertas (o nome real de
um fluxo, a redação exata de uma regra de negócio), deixe o texto livre
(`Other`) carregar a resposta em vez de encaixotá-la numa múltipla escolha.

Mantenha a proporção: um projeto com 3 itens na fila recebe 3 perguntas,
não um assistente inflado. Um com 40 recebe os ~15 primeiros (pela ordem de
prioridade acima) e uma nota explícita de que o resto ficou inferido —
nunca trunque a lista em silêncio.

### Aplicar as respostas

Para cada item resolvido nesta rodada: edite a entrada real no arquivo de
origem (`fluxos.json`/`.md`, `tarefas.json`/`.md` ou `dominio.json`/`.md`)
diretamente — aplique a correção, se houve uma, e então tire o item do array
`uncertain` daquele arquivo — **e** acrescente ou atualize o registro dele
no array `confirmed` de `.dsx/mapas/confirmacoes.json` (chave, mapa, `why`
como estava nesta execução, a resolução, a data de hoje). Pular a gravação
no ledger é o que causou a falha de perda de estado que este mecanismo
existe para impedir — a edição só no arquivo de origem não sobrevive ao
próximo `mapear`.

Para o que o usuário deixou explicitamente em aberto: mantenha no array
`uncertain` do arquivo de origem, registre no array `open` do ledger, e
leve o **mesmo texto original de `item`/`why`** (literal — nunca uma frase
nova sintetizada a partir da conversa) para a seção "Perguntas em aberto"
de `design/as-is-to-be.md`, para ficar visível sem precisar vasculhar quatro
arquivos.

## 4. Gravar a linha de base

`.dsx/mapas/confirmacoes.json` (gravado na fase 3) agora é o registro
durável, item a item — `design/as-is-to-be.md` fica um resumo curto que
aponta para ele, a mesma relação que os seis mapas já têm com
`mapa-projeto.md`/`mapa-ui.md` etc.: um índice, não uma duplicata.

Crie `design/as-is-to-be.md` (ou atualize-o no lugar, se já existir — este
arquivo é de vida longa, não é regenerado do zero como os mapas de
`.dsx/mapas/`). Se só existir o legado `design/figma-harness.md`, leia-o
como ponto de partida (o histórico de validação dele continua valendo),
grave o conteúdo atualizado em `design/as-is-to-be.md` e avise que o
arquivo antigo pode ser removido:

```markdown
# AS-IS / TO-BE

validado: 2026-08-18
mapa-projeto: .dsx/mapas/mapa-projeto.md (gerado 2026-08-18)
mapa-ui: .dsx/mapas/mapa-ui.md (gerado 2026-08-18)
fluxos: .dsx/mapas/fluxos.md (confirmado 2026-08-18)
tarefas: .dsx/mapas/tarefas.md (confirmado 2026-08-18)
jornada: .dsx/mapas/jornada.md (gerado 2026-08-18)
dominio: .dsx/mapas/dominio.md (confirmado 2026-08-18)
confirmacoes: .dsx/mapas/confirmacoes.json

## AS-IS

O que o produto é hoje, segundo os mapas acima, em poucos tópicos — um
ponteiro e um resumo, não uma duplicata dos próprios mapas.

- 12 rotas em 2 personas (solicitante, admin); 9 modais; 41 componentes
- Domínio: 9 entidades (Demand, Item, Customer, …), 22 regras de negócio
- 3 itens incertos resolvidos nesta rodada, 1 deixado em aberto (ver abaixo)

## TO-BE

Intenção de produto que o assistente trouxe à tona, se houver — mudanças
que o usuário disse que estão vindo, ainda não refletidas no código.
`Nada declarado` se a conversa não trouxe nada voltado ao futuro; não
invente um roadmap.

## Perguntas em aberto

Itens que o usuário deixou explicitamente sem confirmação, com o porquê,
para a próxima rodada saber que ainda são frágeis:

- tipo da relação Demand -> Item (1:N) — o usuário não tinha certeza se um
  Item pode pertencer a mais de uma Demand; não há schema para conferir.

## Histórico de validação

- 2026-08-18 · confirmar-mapas · 14 itens revistos, 13 confirmados, 1 deixado em aberto

## Passagem

Este arquivo é o retrato único da fundação — não é tocado pelas rodadas
individuais de espelho/volta. Daqui em diante, `/dsx:figma-iniciar` abre a
primeira rodada do ciclo, e `design/figma-sync.md` (skill `figma-ciclo`)
registra cada rodada depois disso. Não duplique aqui mudanças rodada a
rodada; acrescente ao Histórico de validação só quando `confirmar-mapas`
rodar de novo.
```

Mantenha a seção AS-IS realmente curta — é um índice dos seis mapas, não
uma reescrita deles. Se ela crescer além do que cabe numa tela, é sinal de
que está duplicando conteúdo que já mora nos mapas.

## Regras de não regressão

- **Nunca toque em `design/figma-sync.md` nem na linha de base do lado do
  Figma (`design/figma-baseline/`).** Esses pertencem à skill `figma-ciclo`
  e só existem depois que `/dsx:figma-iniciar` rodou. Se `figma-sync.md` já
  existir (o ciclo já está vivo), esta skill ainda roda com segurança — ela
  só grava nos mapas de `.dsx/mapas/`, em `.dsx/mapas/confirmacoes.json` e
  em `design/as-is-to-be.md`, nunca no registro de sincronia, e nunca muda
  `vez:`.
- **Uma entrada em `Recusadas` de `design/figma-sync.md`, se já existir,
  pesa mais que um palpite do assistente.** Se uma proposta já foi recusada
  explicitamente num ciclo vivo, não deixe a inferência do assistente
  reabri-la — confira `figma-sync.md` antes de aplicar uma correção que
  toque o mesmo terreno.
- **Nunca chame `use_figma`.** Esta skill é só código e docs, como o
  `mapear` — nunca precisa da vez e é segura em qualquer vez do ciclo.
- **Nunca sobrescreva em silêncio um fato confirmado.** O `mapear` regenera
  `fluxos.json`/`tarefas.json`/`dominio.json` do zero a cada execução e não
  tem memória do que uma pessoa confirmou — essa memória mora inteira em
  `.dsx/mapas/confirmacoes.json`, que só esta skill grava. A prosa de
  `design/as-is-to-be.md` é um resumo para pessoas; o ledger, casado pela
  `key`, é contra o que a fase 3 de fato compara. Se o ledger for perdido
  ou apagado (e não houver legado `.claude/figma-claude/confirmations.json`
  para ler), trate todo item como novo — não adivinhe o que era confirmado
  a partir só da prosa.

## Passagem

Diga ao usuário, em poucas linhas, o que foi confirmado e o que segue em
aberto — esta é a única etapa de descoberta que pode falar, então use isso,
mas mantenha a proporção do que de fato aconteceu (algumas linhas, não uma
transcrição do assistente). Depois aponte o próximo passo: `/dsx:figma-iniciar`
se o projeto vai entrar no ciclo com o Figma; senão, a skill de trabalho que
motivou a validação (`construir-ui`, `design-md`, `revisar-ux`…), que agora
lê mapas confirmados.
