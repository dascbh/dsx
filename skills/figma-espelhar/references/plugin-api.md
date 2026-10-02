# Armadilhas do Plugin API do Figma

Cada item é sintoma → causa → correção. Todas foram pagas em produção; o
Plugin API aceita quase tudo sem reclamar e o erro só aparece renderizado.

## Layout

**Coluna colapsada / linha com altura mínima.**
Duas colunas irmãs com `layoutSizingVertical = 'FILL'` numa linha que faz HUG.
A referência de altura vira circular e tudo encolhe.
→ Uma coluna HUG (define a altura), a outra FILL (estica até ela).

**`counterAxisAlignItems = 'STRETCH'` falha.**
Só aceita `MIN | MAX | CENTER | BASELINE`.
→ Para esticar, use `layoutSizingVertical = 'FILL'` no filho.

**`layoutPositioning = 'ABSOLUTE'` dá erro "parent has layoutMode NONE".**
Foi definido antes do `appendChild`.
→ Anexe primeiro, posicione depois: `p.appendChild(n); n.layoutPositioning = 'ABSOLUTE'; n.x = …`.

**Frame auto-layout vazio ocupa 100×100.**
Célula de ação sem botão, slot condicional que não renderizou.
→ Não crie o frame quando não há conteúdo; ou colapse:
`n.layoutSizingVertical = 'FIXED'; n.resize(n.width, 1)`.

**Rótulo posicionado acima da borda some (cortado).**
`createAutoLayout()` cria o frame com `clipsContent = true` por padrão. Um filho
absoluto com `y` negativo (o rótulo no entalhe de um campo MUI outlined) fica
fora da caixa e é cortado — no frame do campo **e** em qualquer wrapper acima.
→ `clipsContent = false` no frame **e** no wrapper (achado 2026-08-18, fase
Fundações; corrigido em `field()` de `tools/figma/preludio.js`).

**Nome do nó não vem do objeto de props.**
Não confie em `createAutoLayout(dir, { name })`.
→ Nomeie explicitamente: `n.name = 'Chip'`. O nome é o que permite varrer e
reparar depois — vale a linha extra.

## Texto e tabelas

**Texto vaza da célula / é cortado no meio.**
Nó de texto com largura automática dentro de coluna de largura fixa.
→ Nesta ordem: `t.textAutoResize = 'HEIGHT'` → `t.layoutSizingHorizontal = 'FILL'`
→ `t.maxLines = 1` → `t.textTruncation = 'ENDING'`. Ordem invertida às vezes não
aplica.

**Tabela transborda o card.**
Some sempre antes de desenhar:
`Σ larguras + (nº colunas − 1) × itemSpacing ≤ largura interna do container`.
Numa tela com rail lateral, a largura interna é
`largura do main − padding − rail − gap − padding do card`. Erre para menos.

**`createTextStyle` / `characters` falham com "unloaded font".**
→ `await figma.loadFontAsync(...)` para toda família+estilo **antes** de criar
ou alterar qualquer texto — inclusive ao só reposicionar nós de texto existentes.

## Cor e variáveis

**Opacidade some em paint ligado a variável.**
Passar `opacity` no paint antes de `setBoundVariableForPaint` é ignorado.
→ Read-modify-write:

```js
node.fills = [P('color/action/primary')];
const f = JSON.parse(JSON.stringify(node.fills));
f[0].opacity = 0.14;
node.fills = f;
```

**A mesma tinta volta ao sólido depois.**
Em filhos de instância o override é volátil.
→ Ajuste o **componente principal** quando puder. Se não der, faça uma varredura
de conferência no fim (procure `opacity === 1` com a variável esperada) e
**confira renderizado**.

**Gradiente não aceita variável.**
`setBoundVariableForPaint` só liga `color` de paint sólido.
→ Use cores literais no gradiente e escreva na legenda que aquele quadro não
acompanha o modo escuro.

## Vetores e setas

**Ícone vira borrão sólido.**
Subpath não fechado: o preenchimento do SVG fecha implicitamente, o Figma não.
→ Feche cada subpath com `Z` (ver skill `figma-fundacoes`).

**Ícone pequeno com glifo vazando ou deslocado.**
`instance.resize(16, 16)` muda só a caixa da instância; o vetor interno só
acompanha se a constraint dele for `SCALE` — e o Plugin API aceita `MIN/MIN`
sem reclamar (uma fundação inteira de 51 ícones já saiu assim).
→ Na instância, use `i.rescale(tamanho / 24)` em vez de `resize` (é o que
`icon()` de `tools/figma/preludio.js` faz). No componente, `constraints: SCALE`
em **todo** vetor filho. Confira instanciando em ≤ 16px e olhando
(skill `figma-convencoes`, retrocompatibilidade).

**`vectorPaths` rejeita o `d`.**
O parser só entende `M/L/C/Q/Z` absolutos — `H`, `V`, `S`, `T`, `A` falham.
→ Normalize antes: `node <DSX>/tools/figma/normalizar-svg-path.cjs "<d>"`
(ou `require` do mesmo arquivo — converte para absolutos e fecha todo subpath
com `Z`; arco `A` lança erro, use a variante do ícone sem arco).

**Seta com ponta nos dois lados.**
`strokeCap` em `LINE` vale para as duas extremidades.
→ `strokeCap = 'NONE'` e desenhe a ponta como `createPolygon()` de 3 pontos,
rotacionado conforme a direção (0 cima, 90 esquerda, 180 baixo, 270 direita).

**Spinner.** `createEllipse()` + `arcData: { startingAngle: 0, endingAngle: 4.6,
innerRadius: 0.82 }`, sem fill e com stroke.

## Componentes e instâncias — a armadilha cara

**O MCP componentiza estruturas repetidas por conta própria.** Depois de alguns
scripts aparecem componentes que você não criou (`UI/Chip`, `UI/Botão · …`) e as
peças já desenhadas viram instâncias deles. Isso **achata variações**:

- chips contornados perdem a borda;
- chips preenchidos ficam com o rótulo na cor do fundo (some);
- botões perdem o ícone à esquerda e a borda do nível secundário.

→ Depois de cada rodada grande, confira renderizado. Reparo mecânico e seguro:

```js
// contorno: a cor do próprio rótulo preserva o tom
if (!filled && chip.strokes.length === 0) {
  chip.strokes = [JSON.parse(JSON.stringify(label.fills))[0]];
  chip.strokeWeight = 1;
}
// rótulo de chip preenchido: força o token de contraste
if (filled) label.fills = [P('color/text/on-action')];
// ícone de botão: instância não aceita filho novo — destaque antes
const frame = botao.detachInstance();
frame.insertChild(0, icone);
```

**Nunca apague nó por heurística de tamanho.** "Frame pequeno solto na página"
pode ser o **componente principal** de Chip ou Botão — apagá-lo quebra o arquivo
inteiro. Inspecione `type` e `name` antes.

**Se apagou um componente:** `figma.getNodeByIdAsync(id)` pode ainda resolvê-lo
com `removed === false` e `parent === null` — nesse caso basta
`page.appendChild(n)` para restaurar, e as instâncias voltam sozinhas.

**Id de filho de instância** (`I123:4;5:6`) nem sempre resolve em
`getNodeByIdAsync`. → Chegue nele por `findOne`/`findAll` a partir da instância.

## Verificação

`node.screenshot({ scale })` devolve a imagem inline — bom para conferir 1–3
nós por script. `get_screenshot` devolve URL (bem mais barato em tokens) — bom
para inspeção detalhada.

Escala importa: uma tinta de 14% renderizada a 0,4× lê como sólida. Ao conferir
tinta, contraste ou borda de 1px, use escala ≥ 1 no nó específico, não na tela
inteira.
