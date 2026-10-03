---
name: figma-fundacoes
description: "Leva a fundação do código ao Figma: tokens DTCG viram variáveis em 3 coleções com modos Claro/Escuro, tipografia vira estilos e ícones reais viram componentes. Use para pôr o design system ou os tokens no Figma."
---

# figma-fundacoes — os tokens do código, não uma paleta nova

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

Design system no Figma que não veio do código vira ficção em duas semanas.
Esta skill transporta a fundação **dos tokens e do tema para variáveis do
Figma**, com os dois temas ligados por modo, para que trocar o modo de um frame
reproduza o tema escuro do app inteiro.

## Antes de qualquer coisa

Carregue a skill **`figma-use`** antes de toda chamada a `use_figma`, e
**`figma-create-new-file`** antes de `create_new_file`. Carregue também a
**`figma-generate-library`** — a skill oficial do próprio Figma para montar
design system a partir de código — antes de criar qualquer variável ou
componente. A descoberta "reusar antes de criar" dela importa especificamente
aqui: `getLocalVariableCollectionsAsync()` só enxerga variáveis locais e vai
dizer, errado, que "nada existe" quando o arquivo na verdade usa uma biblioteca
publicada. Pular qualquer uma dessas causa falhas difíceis de diagnosticar.

Se o usuário tem mais de um time/plano no Figma, pergunte em qual criar o
arquivo — mover depois é trabalho manual dele.

## 1. Achar a fonte de verdade

A fonte de verdade da ida é o **`DESIGN.md` + os tokens do projeto**. Procure
nesta ordem e pare no primeiro que existir:

1. **Tokens DTCG** — `tokens/*.tokens.json` ou `*.tokens.json` na raiz (as três
   camadas da skill `tokens`: `primitives`, `semantic.light`, `semantic.dark`,
   `component`). Com eles, o caminho é a ponte da seção 2A — nada de
   reinterpretar o tema à mão.
2. **`.dsx/maps/design-system.json`** — a skill `mapear` já fez a extração
   ciente de framework (MUI / Tailwind v3/v4 / variáveis CSS, não heurística de
   grep) mais a detecção mecânica de *hazards* de drift entre os tokens
   declarados e o que o código usa de fato.
3. **`.dsx/maps/ui-map.json`** — o bloco `design_system`, mais leve, do
   mapeamento de UI (tokens de cor, escala de espaçamento, tamanhos de fonte,
   ícones em uso): dá para trabalhar, mas é menos profundo.
4. **`.dsx/maps/project-map.json`** — ao menos o arquivo de tema e o pacote
   de ícones.
5. **Tema detectado** — busque e pare no primeiro que existir:

```bash
# tema/tokens
ls tokens/*.tokens.json *.tokens.json src/theme.ts src/theme/* tailwind.config.* tokens.json design-tokens.* 2>/dev/null
# documento de fundação (às vezes existe e vale mais que o código)
ls DESIGN.md design/foundation.md docs/design-system.md .claude/*/design.md 2>/dev/null
# pacote de ícones
grep -m1 -o '"@[^"]*icons[^"]*"' package.json
```

**Compatibilidade:** ao procurar um mapa, leia primeiro `.dsx/maps/`; se não
existir, aceite os legados `.dsx/mapas/` (nomes em português: `mapa-projeto`, `mapa-ui`, `fluxos`, `tarefas`, `jornada`, `dominio`, `confirmacoes`; chaves JSON antigas em camelCase, como `generatedAt` ou `subPages`, valem como as novas em snake_case; tudo com o aviso "nome antigo, renomeie para X") e `.claude/figma-claude/` (`design-system.json`,
`ui-map.json`, `project-map.json`) e avise que ele será regravado no caminho
novo na próxima execução de `mapear`.

Leia o **`DESIGN.md`** (ou o documento de fundação, se for o que houver) mesmo
quando os tokens existirem: ele traz **as regras** (qual token pode carregar
texto, qual densidade, hierarquia de botão) que o código sozinho não conta. A
tabela **Colors** do `DESIGN.md` (Papel | Token | Onde aparece | Onde NUNCA
aparece) é a fonte das descrições das variáveis e das legendas das amostras —
é o que transforma um quadro de cores em design system. Se não houver
`DESIGN.md`, sugira gerar com a skill `design-md` (Modo A) antes ou depois
desta fase; não invente regras para preencher a legenda.

## 2. Variáveis de cor e de dimensão

O esquema é sempre o mesmo, em três coleções:

| Coleção | Modos | Valores |
|---|---|---|
| `Primitivos` | `Valor` (modo único) | valores crus da rampa (`color/brand/600`, `space/4`) |
| `Semântico` | `Claro`, `Escuro` | **aliases** para Primitivos (`color/text/primary` → `color/neutral/950` no Claro) |
| `Componente` | `Valor` (modo único) | **aliases** para Semântico (`button/primary/bg` → `color/action/primary`) — resolvem conforme o modo aplicado no frame |

Nome de variável = caminho do token DTCG com `/` no lugar de `.`:
`color.text.primary` → `color/text/primary`, `color.feedback.danger-icon` →
`color/feedback/danger-icon`, `space.stack-md` → `space/stack-md`,
`radius.control` → `radius/control`.

### 2A. Com tokens DTCG — a ponte

Não traduza o JSON à mão. A ponte do DSX lê as três camadas e gera um script
idempotente para colar em `use_figma`:

```bash
# plano (para revisar o que vai ser criado: coleções, modos, variáveis, aliases, scopes)
node <DSX>/tools/figma/tokens-to-figma.mjs --tokens tokens/ --json
# script para use_figma
node <DSX>/tools/figma/tokens-to-figma.mjs --tokens tokens/ --script > /tmp/vars.js
```

`--tokens` aponta para o diretório com `primitives.tokens.json`,
`semantic.light.tokens.json`, `semantic.dark.tokens.json` e
`component.tokens.json`. O script cria (ou reusa, pelo nome) as coleções
`Primitivos`, `Semântico` e `Componente`, os modos (`Valor`; `Claro`/`Escuro`
no Semântico), cada
variável com o tipo certo (`COLOR`, `FLOAT`), os **aliases** entre camadas
(`createVariableAlias`) e os `scopes`. Rodar de novo não duplica nada — reusa
coleção e variável pelo nome e só atualiza valores. Cole o conteúdo de
`/tmp/vars.js` em `use_figma` (carregada a `figma-use`) e confira o retorno.

Depois do script, **enriqueça as descrições** com a tabela Colors do
`DESIGN.md`: para cada linha, `variable.description = "<Onde aparece>. Nunca:
<Onde NUNCA aparece>."` — é o que o designer vê ao passar o mouse sobre a
variável no painel. Se o token já tem `$description` no DTCG, mantenha-a; a
regra do `DESIGN.md` complementa, não substitui.

Revise o plano antes de colar: um token semântico com valor cru (sem alias)
no DTCG é dívida da skill `tokens`, não algo para "consertar" no Figma —
registre como achado.

### 2B. Sem tokens DTCG — tema do projeto

Mantenha os nomes semânticos do tema dele, mas com o mesmo esquema de três
coleções quando possível (cores cruas em `Primitivos`, papéis em `Semântico`
com modos `Claro` e `Escuro`). Uma variável por token semântico — **não** por
cor crua. Nomeie pelo papel, agrupando com `/`:

```
color/bg/canvas · color/bg/surface · color/bg/hover
color/border/default · color/border/card
color/text/primary · color/text/secondary · color/text/disabled
color/brand/primary-main · color/brand/primary-dark · color/brand/primary-contrast
color/feedback/success · color/feedback/warning · color/feedback/danger
```

Se o tema não tem camada de primitivos (só valores diretos por modo), crie só
`Semântico` com valores diretos e registre isso como achado — não invente uma
rampa.

### Scopes e cores fora da semântica

Defina `scopes` por variável (`FRAME_FILL`, `SHAPE_FILL`, `TEXT_FILL`,
`STROKE_COLOR`; `GAP`, `WIDTH_HEIGHT`, `CORNER_RADIUS` para números) — é o que
faz o Figma sugerir a variável certa no lugar certo depois. Primitivos ficam com
`scopes = []` (escondidos dos seletores): ninguém deve pintar um frame com
`color/brand/600` direto, só com o semântico. Confira os scopes no plano
(`--json`) da ponte; no caminho 2B, defina você.

Se o tema tem cores de identidade fora da faixa semântica (avatar por tipo de
registro, paleta categórica de gráfico), crie um grupo próprio (`entity/…`) e
diga na amostra que ela está deliberadamente fora da semântica de estado.

## 3. Escala numérica e tipografia

**Espaçamento, raio e tamanhos.** Com tokens DTCG, a escala de espaçamento
(`space.*`), os raios (`radius.*`) e os tamanhos (`size.touch-target`,
`size.control-md`…) já saem da ponte como variáveis `FLOAT` — primitivos em
`Primitivos`, papéis (`space/stack-md`, `space/inset-lg`, `radius/control`) em
`Semântico`. Sem DTCG, crie você as variáveis numéricas com raio, espaçamento,
alturas e larguras fixas que o app usa de fato (escala do `DESIGN.md`, seção
Layout, ou `.dsx/maps/design-system.json`).

**Estilos de texto.** A escala tipográfica do DSX (`font.size.*`,
`font.lineHeight.*`, `font.weight.*`, `font.family.*` nos primitivos, e o bloco
`typography:` do front matter do `DESIGN.md` — `h1`, `body`…) vira um estilo de
texto por nível, com os **tamanhos reais** — inclusive os quebrados: se o app
usa `13,5px` no corpo, o estilo é 13,5. Um arquivo que "arredonda para 14" já
não é espelho. Se o `DESIGN.md` e os tokens divergirem num tamanho, o código
(tokens compilados) ganha, e a divergência vira achado.

Nomeie os estilos pelo papel + o componente de origem, para o designer saber
onde cada um vive: `Título/Página (h4)`, `Rótulo/Cabeçalho de tabela`,
`Número/StatStrip 21`. Quando o tamanho vem de variável, vincule
(`setBoundVariable('fontSize', …)`) em vez de digitar o número.

## 4. Ícones reais

Extraia os `d` do pacote do projeto e crie um componente por ícone. Ícone
aproximado é a forma mais rápida de o arquivo deixar de descrever o produto.

```bash
# exemplo com @mui/icons-material — adapte o regex ao pacote
grep -o 'd: "[^"]*"' node_modules/@pkg/icons/Nome.js | sed 's/^d: "//; s/"$//'
```

O Figma **não aceita o `d` cru**: o parser de `vectorPaths` só entende
`M/L/C/Q/Z` absolutos. Rode `tools/figma/normalize-svg-path.cjs` antes
(`node <DSX>/tools/figma/normalize-svg-path.cjs "<d>"`) — ele converte
`H/V/S/T` e, o mais importante, **fecha cada subpath com `Z`**. Sem isso, todo
ícone com furo (círculo com miolo, documento com linhas) renderiza como borrão.

Crie cada ícone como `COMPONENT` de 24×24 com o vetor em `(0,0)` e
`constraints: SCALE` — assim a instância redimensiona junto. Ao instanciar em
outro tamanho, use `i.rescale((size||18)/24)`, não `resize` (o prelúdio
`tools/figma/prelude.js` já faz isso): `resize` muda a caixa e deixa o glifo
para trás.

## 5. Amostras que ensinam

Dois quadros, não um: **Cor** (amostra + nome da variável + valores dos dois
modos + a regra da casa) e **Tipografia, forma e botões** (espécime com texto
real do produto, não "The quick brown fox", + a hierarquia de botão com a regra
de cada nível).

A legenda é metade do valor. `color/action/primary nunca carrega texto
(2,9:1)` vale mais que a amostra sozinha. A legenda de cada amostra de cor vem,
nesta ordem:

1. a linha da tabela **Colors** do `DESIGN.md` para aquele token (Onde aparece /
   Onde NUNCA aparece);
2. o contraste medido com `tools/contrast.mjs` contra o fundo em que o app
   realmente o usa;
3. se `.dsx/maps/design-system.json` existir, os `hazards[]` pertinentes —
   "usado como hex cru em 3 lugares em vez deste token" é legenda melhor que
   qualquer uma improvisada.

## Armadilhas do Plugin API

**Nome de variável não aceita ponto.** `space/0.5` falha com "invalid variable
name". Use `space/4`, `space/8` (o valor em px). Tokens DTCG com ponto no
segmento (ex.: `space.0.5`) precisam de renome na skill `tokens` — confira o
plano da ponte; não contorne só no Figma.

**Opacidade em paint com variável não persiste na criação.** Passar
`opacity` no paint antes de `setBoundVariableForPaint` é ignorado. Faça
read-modify-write, sempre:

```js
node.fills = [P('color/action/primary')];
const f = JSON.parse(JSON.stringify(node.fills));
f[0].opacity = 0.14;
node.fills = f;
```

**Em filhos de instância isso é volátil.** Overrides de fill em nós dentro de
instâncias podem voltar ao valor do componente. Prefira ajustar o **componente
principal**; se precisar de override, faça uma varredura de conferência no fim
e olhe o resultado renderizado.

**Estilo de fonte varia por família.** Plus Jakarta Sans usa `SemiBold` e
`ExtraBold` (sem espaço); Inter usa `Semi Bold` e `Extra Bold` (com espaço).
Confirme com `figma.listAvailableFontsAsync()` antes de assumir.

**`createTextStyle` exige a fonte carregada.** `figma.loadFontAsync` para cada
estilo que você vai usar, antes de qualquer `characters` ou
`setTextStyleIdAsync`.

**Alias entre coleções exige a variável de destino já criada.**
`createVariableAlias` precisa do objeto da variável alvo; crie `Primitivos`
inteira antes de `Semântico`, e `Semântico` antes de `Componente`.

## Verificação

Screenshot dos dois quadros e da grade de ícones, e **olhe**. Ícone quebrado,
amostra com contraste errado e estilo com line-height absurdo só aparecem
renderizados. Para contraste, não confie na amostra a olho: confira o par real
em que o app renderiza texto.

```bash
node <DSX>/tools/contrast.mjs "#767676" "#ffffff"   # imprime AA/AAA para texto, texto grande e UI
```

Com tokens DTCG, rode também `node <DSX>/tools/build-tokens.mjs --tokens tokens/ --check` (ou o
build do projeto): se os pares de `contrast-pairs.json` falham no código, a
fundação no Figma vai carregar a mesma falha — registre como achado, não
"corrija" só no Figma.

Depois crie um frame qualquer com o modo `Escuro` aplicado para provar que os
dois modos funcionam — confira o contraste lá também, porque um par que passa
no claro falha fácil quando o fundo vira. Confirme a constraint dos ícones de
verdade, não só que você a definiu: instancie um ícone em tamanho pequeno
(≤16px) e veja se o glifo encolhe junto (skill `figma-convencoes`, regras de
ícone e componente do kit).

Achados desta fase (hex cru fora da paleta, divergência entre `DESIGN.md` e
tokens, par que falha) usam a escala de severidade 0–4 da skill `revisar-ux` e
vão para `design/figma-findings/<rodada>.md`.

## Fechamento

Regenere `design/figma-reference.json` (skill `figma-convencoes`) com os ids
das coleções de variáveis, dos estilos de texto, do frame de ícones e do chrome
criados nesta fase — é o que as fases seguintes (telas, diálogos) leem em vez
de redescobrir. Se esta fase foi uma rodada própria (não a primeira fase de um
espelho), acrescente uma linha em `design/figma-changelog.jsonl` (skill
`figma-ciclo`) com `tokens_changed` listando as variáveis criadas ou mudadas.
