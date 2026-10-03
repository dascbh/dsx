# Escolher e construir o design system a partir de referências

## Quando consultar

- Projeto novo sem identidade visual definida, ou redesenho de produto que quer partir de uma base pronta.
- Antes de criar o primeiro `DESIGN.md` (skill `design-md`, Modo B) ou de importar um design system no Stitch.
- Quando alguém sugerir "usa o estilo X" e for preciso saber se X serve para o produto.
- Ao avaliar um `DESIGN.md` de terceiros (biblioteca, repositório, gerado por IA) antes de adotá-lo.

## O problema

Escolher design system por gosto produz duas falhas recorrentes: estética que não aguenta o uso real (um estilo de landing page aplicado a uma tela de trabalho de oito horas) e arquivo bonito com defeito técnico (contraste reprovado, componente que referencia token inexistente). Referência pronta acelera, desde que passe por **triagem pelo registro do produto**, **avaliação objetiva** e **adaptação**, nessa ordem.

## Fontes de referência no DSX

| Fonte | O que é | Onde |
|---|---|---|
| Biblioteca designmd.app | 759 `DESIGN.md` com metadados (categoria, caso de uso, época, estilo, palavras-chave), licença CC BY 4.0 com crédito obrigatório | Índice completo: `referencias/design-md/indice.json`; 40 curados com o arquivo inteiro e nota: `referencias/design-md/curados.json` + `referencias/design-md/designmd-app/` |
| Especificação oficial do formato | Seções canônicas, tipos de token, sub-tokens de componente, regras do linter oficial; CLI `@google/design.md` (`lint`, `diff`, `export`) | Resumo e divergências em `design-md.md`, seção "Especificação oficial e linter oficial" |

Consulta: `node tools/referencias.mjs buscar --registro operacional --uso "dashboard financeiro" --curados`.

## Triagem pelo registro do produto

O **registro** é o tipo de uso que o produto tem; ele decide a família de referências antes de qualquer preferência estética.

| SE o produto é… | ENTÃO o registro é | Procure | Evite |
|---|---|---|---|
| Ferramenta de trabalho diário, tabelas, formulários, dados densos (back-office, jurídico, financeiro, saúde, B2B) | `operacional` | densidade média/alta, tipografia de leitura longa, poucos acentos, componentes completos | gradientes, vidro, neumorfismo, raios grandes, movimento decorativo |
| App de consumo, transação curta, mobile, catálogo | `consumo` | alvos de toque grandes, hierarquia forte de ação, imagem como conteúdo | densidade alta, jargão visual corporativo |
| Leitura, documentação, conteúdo longo | `editorial` | medida de linha 60–75ch, serifa ou humanista de texto, ritmo vertical | contraste baixo "elegante", texto sobre imagem |
| Página de marca, campanha, evento | `marca` | personalidade, tipografia display | levar o estilo para dentro do produto logado |
| Estudo visual, arte, conceito | `experimental` | só como inspiração pontual | adotar como sistema de produto |

O índice já traz `dsx.registro` (triagem automática por palavras do caso de uso e do estilo). Trate como **primeiro filtro**, não como veredito: confira a descrição e o próprio arquivo.

## Avaliação objetiva (antes de mostrar a opção para alguém)

Toda referência candidata passa por:

1. `node tools/referencias.mjs avaliar <arquivo.md>` — linter do DSX + contraste texto/fundo de cada componente + completude (componentes, cores, estilos de texto). Nota 0–100.
2. `npx -y @google/design.md lint <arquivo.md>` — linter oficial (referências quebradas, contraste, tokens órfãos, ordem das seções, chaves desconhecidas).

Regras:

- **SE** algum componente tem contraste de texto abaixo de 4,5:1 **ENTÃO** a opção só pode ser apresentada como "adaptável", com a correção já proposta. Na curadoria inicial, 19 de 59 candidatos tinham o botão primário reprovado (alguns com 1,05:1).
- **SE** a referência não declara componentes **ENTÃO** ela é paleta + tipografia, não design system: a construção vai precisar de mais trabalho, diga isso.
- **SE** o registro do produto é `operacional` e a referência é marcada `experimental` **ENTÃO** descarte.
- **SE** a referência imita a identidade de uma marca real (nome, cor e tipografia proprietárias) **ENTÃO** use como estudo de estrutura, nunca como identidade do produto.

## Como apresentar as opções

- **Três opções dentro do registro + uma contrastante** (outra direção plausível). Mais que isso paralisa; menos esconde o espaço de escolha.
- Para cada opção: o que ela favorece (tarefa, persona), o que ela piora, nota e defeitos encontrados, esforço de adaptação.
- **Mostre aplicado ao produto, não a uma tela genérica**: se o projeto já tem telas, capture-as do código e aplique cada opção no Stitch (`apply_design_system`) — a comparação vira "nossa tela com A, B, C". Sem telas, gere a mesma tela-chave com cada opção.
- Escolha é do dono do produto. Preferência estética sem relação com a tarefa não é argumento para descartar uma opção avaliada.

## Construção: da referência ao DESIGN.md do projeto

1. **Copie a referência escolhida para o projeto como rascunho** e mantenha a linha de crédito (CC BY 4.0) num comentário no fim do arquivo.
2. **Substitua a identidade**: cor de marca do projeto no papel `primary` (gere a rampa com `tools/palette.mjs`), tipografia licenciada e carregada pelo projeto, nome e descrição do produto.
3. **Reconcilie os papéis com o DSX**: papéis semânticos (`text-primary`, `text-secondary`, `border`, `danger`, triplas de estado `*-container`/`on-*-container`/`*-border`) em vez de nomes de aparência.
4. **Corrija o que a avaliação apontou**: contraste, componentes faltando (botão primário, secundário, destrutivo; campo; cartão; chip de estado), estados (hover, foco, desabilitado, erro).
5. **Escreva a prosa do projeto**: persona, densidade, o que nunca pode acontecer. A prosa da referência descreve o estilo, não o produto; reescreva.
6. **Valide**: `node tools/lint-design-md.mjs DESIGN.md` (gates do DSX) e `npx -y @google/design.md lint DESIGN.md` (formato oficial). Exporte tokens com `npx -y @google/design.md export --format dtcg DESIGN.md` quando o projeto usar DTCG.
7. **Leve ao Stitch** pela skill `stitch` (modo Sincronizar) e confira com `tools/stitch/design-system.mjs conferir`.

## Checklist

- [ ] Registro do produto definido antes de olhar estilos.
- [ ] Candidatas avaliadas pelos dois linters; defeitos listados por opção.
- [ ] Três opções no registro + uma contrastante, com o que cada uma favorece e piora.
- [ ] Opções mostradas aplicadas às telas do produto (ou à mesma tela-chave).
- [ ] Identidade substituída (cor, fonte, nome); nada de marca de terceiros no resultado.
- [ ] Contraste e componentes corrigidos; prosa reescrita para o produto.
- [ ] Crédito CC BY mantido no arquivo derivado.
- [ ] Dois linters aprovados; DESIGN.md sincronizado no Stitch.
