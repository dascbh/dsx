# Design tokens

## Quando consultar

- Ao criar, renomear, remover ou consumir qualquer token.
- Ao adicionar um tema (escuro, alto contraste, marca) ou um modo (densidade).
- Ao rodar o pipeline de tokens deste repositório ou interpretar um erro dele.
- Quando um componente "não troca de tema" ou aparece valor cru no código.

## Conceito em uma frase

Token é um **nome estável para uma decisão de design**. O valor pode mudar; o nome e o papel não. O código de UI conhece apenas nomes; os valores moram em arquivos de token e chegam por referência.

## Regras

1. **Nunca escreva valor cru em código de UI.** Hex, `rgb()`, `oklch()`, px fora de token, `z-index` mágico e valores arbitrários de framework utilitário são proibidos fora de `tokens/`.
2. **Componentes consomem a camada semântica** (ou a de componente). Primitivos só alimentam semânticos.
3. **Nomeie pela função, não pela aparência.** `color.text.muted`, nunca `color.cinza-claro`.
4. **Toda cor semântica usada como texto ou contorno essencial precisa de um par declarado** em `tokens/contrast-pairs.json`.
5. **Tema troca valores, nunca nomes.** O tema escuro tem as mesmas chaves que o claro.
6. **Não edite `tokens/build/`.** É saída gerada; a fonte é sempre `tokens/*.tokens.json`.
7. **Crie token quando o valor for compartilhado ou carregar decisão.** Valor usado uma única vez, sem intenção reaproveitável, não justifica token novo; reavalie se ele deveria ser um token existente.

## As três camadas

| Camada | Pergunta que responde | No repositório | Quem consome |
|---|---|---|---|
| 1. Primitivo | "Quais valores existem?" | `tokens/primitives.tokens.json` | Somente a camada 2 |
| 2. Semântico | "Para que serve este valor?" | `tokens/semantic.light.tokens.json` e `semantic.dark.tokens.json` | Componentes e telas |
| 3. Componente (opcional) | "Qual decisão é exclusiva deste componente?" | Ainda não existe no repo | O próprio componente |

### Camada 1: primitivos

Inventário bruto, sem intenção de uso. No repo:

- Cor: `color.white`, `color.black`, e rampas de 11 passos (`50, 100, 200, …, 900, 950`) para `color.brand`, `color.neutral`, `color.success`, `color.danger`, `color.warning`, `color.info`.
- Espaço: `space.<multiplicador>` sobre unidade de 4px: `space.0` (0), `space.0_5` (2px), `space.1` (4px), `space.1_5` (6px), `space.2` (8px), `space.3` (12px), `space.4` (16px), `space.5` (20px), `space.6` (24px), `space.8` (32px), `space.10` (40px), `space.12` (48px), `space.16` (64px), `space.20` (80px), `space.24` (96px), `space.32` (128px).
- Raio: `radius.none` (0), `sm` (4px), `md` (8px), `lg` (12px), `xl` (16px), `full` (9999px).
- Tipografia: `font.family.sans`, `font.family.mono`, `font.weight.regular|medium|semibold|bold` (400–700), `font.size.12|14|16|20|25|31|39|49|61`, `font.lineHeight.tight|snug|normal` (1.1 / 1.25 / 1.5).
- Movimento: `duration.instant|fast|base|slow` (0 / 120 / 200 / 320 ms), `easing.standard|enter|exit` (cubic-bezier).
- Elevação: `shadow.sm|md|lg`.

### Camada 2: semânticos

Dão papel ao valor. No repo:

- `color.bg.*` (`canvas`, `surface`, `sunken`, `overlay`, `inverse`)
- `color.text.*` (`primary`, `secondary`, `muted`, `inverse`, `link`, `on-action`)
- `color.border.*` (`default`, `strong`, `focus`)
- `color.action.*` (`primary`, `primary-hover`, `primary-active`, `secondary`, `secondary-hover`, `danger`, `danger-hover`, `disabled`, `disabled-text`)
- `color.feedback.*` (`success|danger|warning|info` × `-bg|-text|-icon`)
- `color.ai.*` (`accent`, `surface`) para marcar conteúdo gerado por IA
- `space.inset-xs|sm|md|lg`, `space.stack-sm|md|lg`, `space.inline-sm|md`, `space.section`
- `size.touch-target` (44px), `size.control-sm|md|lg` (32/40/48px), `size.focus-ring` (2px), `size.measure` (68ch)
- `radius.control`, `radius.card`, `radius.pill`
- `motion.feedback`, `motion.transition`, `motion.overlay`

### Camada 3: componente

Use **só** quando um componente precisa de uma decisão que não é papel geral do sistema (ex.: sub-marca que muda só o raio do botão). Excesso de tokens de componente vira um segundo sistema paralelo. Se for criar, aponte sempre para um semântico:

```json
{
  "button": {
    "primary": {
      "bg":      { "$type": "color",     "$value": "{color.action.primary}" },
      "bg-hover":{ "$type": "color",     "$value": "{color.action.primary-hover}" },
      "radius":  { "$type": "dimension", "$value": "{radius.control}" },
      "height":  { "$type": "dimension", "$value": "{size.control-md}" }
    }
  }
}
```

(Exemplo ilustrativo: `button.*` não existe hoje no repositório.)

## Gramática de nomes

Forma geral: `categoria.papel.variante-estado`.

| Segmento | Valores usados no repo | Observação |
|---|---|---|
| categoria | `color`, `space`, `size`, `radius`, `font`, `duration`, `easing`, `shadow`, `motion` | Primeira palavra sempre é o tipo de decisão |
| papel | `bg`, `text`, `border`, `action`, `feedback`, `ai`; `inset`, `stack`, `inline`, `section` | Descreve função |
| variante | `primary`, `secondary`, `muted`, `danger`, `success`, `sm`, `md`, `lg` | Importância, tipo ou tamanho |
| estado | `hover`, `active`, `disabled`, `focus` | Sufixo com hífen: `primary-hover` |

Regras de nome:

- Delimitador de grupo é o **ponto** no JSON; no CSS vira hífen: `color.text.primary` → `--color-text-primary`; `space.inset-md` → `--space-inset-md`.
- Primitivos numéricos usam o **passo da rampa** (`brand.600`) ou o **multiplicador da grade** (`space.4` = 4 × 4px). Decimais usam sublinhado: `space.0_5`.
- O nome tem que ser dedutível: quem conhece `color.feedback.danger-text` deve adivinhar `color.feedback.warning-text`.
- Mesmo vocabulário em design, código e documentação. Variável na ferramenta de design `color/text/primary` corresponde a `color.text.primary`.
- Proibido: nomes de aparência (`azul-escuro`), nomes relativos sem definição (`maior`), nomes de origem (`frame-231`), versões (`card-final-v2`).

## Formato W3C DTCG

O repo segue o formato do Design Tokens Community Group:

- Todo token tem `$value`; `$type` é obrigatório no repo (pode ser herdado do grupo pai; o build já trata essa herança).
- `$description` é opcional, mas **use em todo token semântico cujo uso não seja óbvio**. Ela vira documentação para pessoas e agentes.
- Grupos são objetos aninhados; chaves iniciadas por `$` são metadados, não tokens.
- Tipos usados: `color`, `dimension`, `fontFamily`, `fontWeight`, `number`, `duration`, `cubicBezier`, `shadow`.

```json
{
  "color": {
    "text": {
      "muted": {
        "$type": "color",
        "$value": "{color.neutral.600}",
        "$description": "Mínimo permitido para texto: >= 4.5:1 sobre canvas"
      }
    }
  }
}
```

### Aliases

- Referência é `{caminho.do.token}`; o build resolve recursivamente e **falha** em referência inexistente ou circular.
- Um alias pode estar inteiro (`"{space.4}"`) ou embutido numa string; prefira o alias inteiro.
- Alias semântico → primitivo é o caso normal (`radius.control` → `radius.md`; `motion.feedback` → `duration.fast`). Alias semântico → semântico é permitido quando um papel deriva de outro, e é o que um token de componente faz (`button.primary.bg` → `color.action.primary`).
- Valor literal na camada semântica só quando não há primitivo equivalente e criar um seria ruído (no repo: `color.bg.overlay` com alfa e `size.*`). Documente o porquê na `$description`.

## Temas e modos

- Tema claro = `semantic.light.tokens.json` (base completa).
- Tema escuro = `semantic.dark.tokens.json`, que **redefine apenas o que muda** (no repo, só `color.*`). Chaves ausentes herdam do claro; por isso `space.*` e `size.*` não se repetem.
- O build **rejeita** chave no escuro que não exista no claro. Isso garante paridade de nomes.
- Componentes nunca perguntam "qual tema estou?". Eles leem `var(--color-bg-surface)` e o tema decide.

SE → ENTÃO:

- **SE** precisa de alto contraste ou de outra marca **ENTÃO** crie outro arquivo semântico com as mesmas chaves e um seletor próprio no build; não crie tokens novos para isso.
- **SE** precisa de densidade compacta **ENTÃO** é um modo que remapeia `space.inset-*`/`size.control-*`; veja `espacamento-e-layout.md`.
- **SE** um valor é idêntico nos dois temas **ENTÃO** não o repita no escuro (herda).
- **SE** uma cor tem o mesmo primitivo nos dois temas **ENTÃO** suspeite: quase sempre o escuro precisa de outro passo da rampa. Veja `cor.md`.

### Saída CSS gerada

`tokens/build/tokens.css` contém:

1. `:root { … }` com todos os primitivos + semânticos do tema claro.
2. `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` com os semânticos escuros: o sistema do usuário decide, a menos que a página force claro.
3. `:root[data-theme="dark"] { … }` para forçar escuro independentemente da preferência.

## Pipeline do repositório

| Comando | Faz |
|---|---|
| `node tools/build-tokens.mjs` | Achata os três arquivos, resolve aliases, valida paridade de temas, checa cada par de `contrast-pairs.json` nos dois temas, grava `tokens/build/tokens.css`, `tokens.light.json`, `tokens.dark.json`. Sai com código 1 se algum par falhar |
| `node tools/build-tokens.mjs --check` | Mesmas validações, sem gravar arquivos. Use em CI |
| `node tools/palette.mjs "#5754ed" --name brand --format dtcg` | Gera rampa 50–950 em OKLCH pronta para colar em `primitives.tokens.json` (formatos: `json`, `css`, `dtcg`) |
| `node tools/type-scale.mjs --base 16 --ratio major-third` | Gera escala tipográfica; `--fluid` gera `clamp()` |
| `node tools/spacing-scale.mjs --base 4 --format dtcg` | Gera a escala de espaço |
| `node tools/contrast.mjs "#627187" "#ffffff"` | Contraste de um par, com níveis AA/AAA |
| `node tools/contrast.mjs --pairs tokens/contrast-pairs.json --tokens tokens/build/tokens.light.json` | Valida pares contra um tema resolvido |
| `node tools/lint-raw-values.mjs src/` | Lista valores crus e mostra drift por 1000 linhas; `--json` para máquina |

Formato de um par em `contrast-pairs.json`:

```json
{ "fg": "color.text.muted", "bg": "color.bg.surface", "min": 4.5, "use": "texto de apoio em card" }
```

Cores com alfa (hex de 8 dígitos, como `color.bg.overlay`) são ignoradas na checagem, pois o contraste depende do que está atrás; valide-as manualmente sobre o conteúdo real.

### Fluxo para adicionar um token

1. Decida a camada. Papel novo → semântico. Valor novo sem papel → primitivo.
2. Edite `tokens/primitives.tokens.json` e/ou `semantic.light.tokens.json`.
3. Se for cor, adicione o valor escuro em `semantic.dark.tokens.json` e o par em `contrast-pairs.json`.
4. Rode `node tools/build-tokens.mjs`. Corrija toda `FALHA`.
5. Consuma no código como `var(--<caminho-com-hífens>)`.
6. Rode `node tools/lint-raw-values.mjs` no código alterado.

## Consumo em código

```css
.card {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-card);
  padding: var(--space-inset-md);
}
.card > * + * { margin-block-start: var(--space-stack-md); }
.card a { color: var(--color-text-link); }
```

`1px` de borda é aceito pelo linter (só valores de 2px para cima são sinalizados). Se um valor cru for realmente inevitável, marque a linha com o comentário `dsx-ignore` e justifique; o escape é auditável por busca.

## Anti-padrões

- Componente lendo `--color-brand-600` direto: quebra o tema escuro e o rebranding.
- Token semântico com nome de cor (`color.bg.blue`).
- Repetir no tema escuro o mesmo primitivo do claro "porque funciona".
- Tokens sem `$description` em papéis ambíguos.
- Arquivo único misturando camadas.
- Editar `tokens/build/*` à mão.
- Criar token de componente para cada propriedade de cada componente.
- Tratar o build como opcional: pares de contraste não validados viram dívida silenciosa.

## Checklist

- [ ] Token novo está na camada certa e tem nome funcional dedutível.
- [ ] `$type` e `$value` presentes; `$description` quando o uso não é óbvio.
- [ ] Alias aponta para token existente; nenhum ciclo.
- [ ] Cor nova tem valor no tema escuro e par em `contrast-pairs.json`.
- [ ] `node tools/build-tokens.mjs` passou sem `FALHA`.
- [ ] Nenhum arquivo em `tokens/build/` foi editado manualmente.
- [ ] Código de UI consome apenas `var(--…)` semântico; `lint-raw-values` sem ocorrências novas.
