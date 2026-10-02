# Componentes

## Quando consultar

- Ao criar um componente novo ou uma variante nova.
- Ao documentar um componente ou preparar o handoff para desenvolvimento.
- Ao decidir em que nível de composição algo pertence (átomo, molécula, organismo…).
- Ao documentar um design system a partir de um produto que já existe.

## Regras

1. **Reuse antes de criar.** Procure no catálogo um componente que resolva o problema com as propriedades existentes. Componente novo nasce de problema recorrente (vários times ou várias telas resolvendo a mesma coisa sozinhos), não de preferência visual.
2. **Variante só para diferença estrutural ou de hierarquia.** Diferença de conteúdo vira propriedade ou slot.
3. **Todo componente interativo implementa a matriz de estados completa** (abaixo) antes de ser publicado.
4. **Todo componente consome só tokens semânticos** (ou de componente). Lista de tokens faz parte da documentação.
5. **Mesmo nome em design, código e documentação.**
6. **Documente no momento da criação**, com o template desta página. Componente sem "quando não usar" é convite ao uso errado.

## Atomic Design como mapa de composição

Os cinco níveis do Atomic Design ajudam a decidir onde algo mora e o que reutiliza o quê. São organização, não obrigação: adapte se a estrutura do produto pedir outra taxonomia, mas mantenha a ideia de níveis com dependência num só sentido.

| Nível | O que é | Exemplos | Regra |
|---|---|---|---|
| Átomo | Elemento indivisível, sustentado por tokens | Botão, input, label, ícone, badge | Contém todos os estados e a base de acessibilidade |
| Molécula | Grupo de átomos com um propósito único | Campo de formulário (label + input + ajuda + erro), busca (input + botão) | Um trabalho só; sem lógica de página |
| Organismo | Seção autônoma e contextual | Header, tabela com filtros, formulário de endereço, card de produto completo | Pode conter estado próprio; mudança aqui propaga para muitas telas |
| Template | Esqueleto de página sem conteúdo final | Layout de listagem, layout de detalhe | Valida grid, hierarquia e responsividade |
| Página | Template com conteúdo real | Tela de pedidos com dados reais | Revela problemas de texto longo, vazio, erro; achados voltam aos níveis inferiores |

SE → ENTÃO:

- **SE** o elemento não faz sentido dividido **ENTÃO** átomo.
- **SE** combina átomos para uma única tarefa **ENTÃO** molécula.
- **SE** tem significado próprio numa região da tela **ENTÃO** organismo.
- **SE** um problema aparece na página com dados reais **ENTÃO** corrija no nível mais baixo que o causa, não com exceção na página.

Armadilhas: átomos órfãos que não usam tokens; template com conteúdo "de exemplo" decidido cedo demais; hierarquia tão rígida que bloqueia composições legítimas.

## Anatomia

Toda especificação de componente nomeia:

- **Partes**: contêiner, rótulo, ícone(s), indicador, texto de ajuda, contador, slot.
- **Tokens por parte**: ex. contêiner `color.bg.surface` + `radius.card` + `space.inset-md`.
- **Regras de tamanho**: o que cresce, o que trunca, mínimo e máximo, comportamento com texto 2× maior (tradução, zoom).
- **Slots**: áreas de conteúdo flexível (cabeçalho, corpo, rodapé de card; ícone inicial/final do botão).
- **Comportamento com tecnologia assistiva**: papel, nome, estados anunciados.

## Matriz de estados obrigatórios

| Estado | O que comunica | Implementação típica (tokens do repo) | Aplica a |
|---|---|---|---|
| Default | Repouso | Cores base do papel | Todos |
| Hover | "Isto responde ao ponteiro" | `color.action.primary-hover`, `secondary-hover`; transição `motion.feedback` | Interativos com ponteiro |
| Focus-visible | Posição do foco de teclado | Anel `size.focus-ring` em `color.border.focus` | Todos os focáveis |
| Active / pressed | Ação sendo acionada | `color.action.primary-active` | Botões, itens clicáveis |
| Selected / checked | Escolha atual | Forma + cor; `aria-selected`/`aria-checked`/`aria-current` | Abas, opções, itens de lista, toggles |
| Disabled | Indisponível agora | `color.action.disabled` + `color.action.disabled-text`; motivo explicado quando possível | Interativos |
| Loading | Em processamento | Spinner ou skeleton; `aria-busy`; bloqueia reenvio; mantém dimensões | Botões de envio, listas, cards, tabelas |
| Error | Algo falhou ou é inválido | `color.feedback.danger-*` + ícone + texto específico + `aria-invalid` | Campos, formulários, blocos de dados |
| Empty | Não há conteúdo ainda | Mensagem que explica e próxima ação | Listas, tabelas, buscas, painéis |
| Success | Ação concluída | `color.feedback.success-*` + ícone + texto; anúncio via `role="status"` | Formulários, ações assíncronas |

Regras da matriz:

- Estados se combinam (focus + error, hover + selected). Especifique as combinações que aparecem; o foco nunca é escondido por outro estado.
- Hover não pode ser o único jeito de descobrir uma função (não existe em toque).
- Loading preserva o tamanho do componente para não deslocar o layout.
- Empty diferencia "nada ainda" (primeiro uso), "nada encontrado" (filtro/busca) e "sem permissão"; cada um tem mensagem e ação próprias.
- Error diz o que aconteceu e como resolver; nunca "Erro inesperado" sozinho.

## Variantes e propriedades

Eixos de variante recomendados (poucos valores em cada):

| Eixo | Valores típicos | Exemplo |
|---|---|---|
| Hierarquia / ênfase | `primary`, `secondary`, `tertiary` (ghost) | Botão |
| Intenção | `default`, `danger` (e, em feedback, `success`, `warning`, `info`) | Botão destrutivo, alerta |
| Tamanho | `sm`, `md`, `lg` (mapeiam para `size.control-*`) | Botão, input |

Tudo o mais vira propriedade:

- Texto (rótulo, ajuda).
- Booleano (mostrar ícone, mostrar contador, `fullWidth`).
- Troca de instância (qual ícone).
- Slot (conteúdo livre e controlado).

Regra prática: **3 variantes de botão resolvem a grande maioria dos casos**. Se o catálogo tem 15, há duplicação ou propriedades mal desenhadas. Desacoplamento frequente de instâncias na ferramenta de design sinaliza falta de flexibilidade legítima; investigue antes de criar variante.

## Nomes de API

- Componente em PascalCase com nome de função: `Button`, `TextField`, `Dialog`, `Toast`, não `BlueButton` ou `CardNovo`.
- Propriedades com o mesmo nome na ferramenta de design e no código: `variant`, `size`, `intent`, `disabled`, `loading`, `iconStart`, `iconEnd`.
- Valores de propriedade espelham os nomes de token: `variant="primary"` usa `color.action.primary`; `size="md"` usa `size.control-md`; `intent="danger"` usa `color.action.danger`.
- Booleanos afirmativos (`disabled`, `loading`, `required`), nunca negativos (`notDisabled`).
- Eventos por intenção (`onSelect`, `onDismiss`), não por gesto (`onClickX`).
- Estados controláveis expõem par valor/evento (`open` + `onOpenChange`).
- Nada de `style` ou `color` livre como propriedade pública: abre porta para valor cru.

## Template de documentação

Use esta ordem em toda página de componente:

1. **Nome e resumo** — que problema resolve, numa frase.
2. **Quando usar / quando não usar** — com o componente alternativo para cada "não".
3. **Anatomia** — partes nomeadas.
4. **Variantes e propriedades (API)** — tabela com nome, tipo, padrão, descrição.
5. **Estados** — a matriz acima preenchida, com representação visual.
6. **Comportamento** — teclado, toque, foco, casos extremos.
7. **Conteúdo** — tamanho de texto, tom, microcópia, truncamento, vazio.
8. **Responsividade** — o que muda por largura ou contêiner.
9. **Acessibilidade** — papel, nome, estados, anúncios, contraste (pares consumidos).
10. **Tokens usados** — lista exata.
11. **Exemplos** — uso real e código.
12. **Limitações e diferenças de plataforma.**
13. **Status e histórico** — `estável`, `beta`, `depreciado`; versão em que entrou ou mudou.

A documentação deve permitir que alguém escolha, implemente e adapte o componente **sem conversar com quem o criou**.

## Handoff para desenvolvimento

Checklist do pacote entregue:

- **Fundação**: links para os tokens usados; nada de valor solto em anotação.
- **Componentes**: nome idêntico ao do código; propriedades equivalentes; conexão design ↔ código registrada quando a ferramenta permite.
- **Layout**: breakpoints, colunas, gutters e largura máxima com tokens; o que é fluido e o que é fixo.
- **Matriz de comportamento**: elemento × largura pequena × largura grande × regra de negócio (ex.: navegação lateral no desktop, barra inferior no mobile, só para usuário autenticado).
- **Estados e casos extremos**: loading (skeleton ou spinner), erro com o texto real, vazio, conteúdo muito longo, falha de API e fallback, permissão negada.
- **Acessibilidade**: ordem de foco, headings, nomes acessíveis de ícones, anúncios, pares de contraste.
- **Movimento**: propriedade animada (`opacity`, `transform`), duração por token (`motion.*`), curva por token (`easing.*`), versão com movimento reduzido. Nunca "desliza suavemente".
- **Ativos**: ícones em SVG, imagens otimizadas com dimensões.
- **Conteúdo**: textos finais, não lorem ipsum.
- **Versão**: em qual versão do sistema o design se baseia; mudanças que quebram explicitadas.

Anti-padrões de handoff: "o link do arquivo é a documentação"; só o caminho feliz; nomes diferentes entre design e código; espaçamentos fora da escala; ignorar restrições da plataforma.

## Documentar um design system a partir de um produto existente

Inconsistência em produto legado é acúmulo histórico, não descuido. O trabalho é revelar o sistema implícito e separar padrão de exceção.

1. **Inventário de interface.** Capture cada ocorrência de botão, campo, estilo de texto, card, navegação, modal, mensagem. Agrupe por função.
2. **Cubra seis categorias mínimas**: cores (marca, feedback, neutras), tipografia (famílias, pesos, tamanhos, entrelinhas), espaçamento (paddings, margens, gaps), estados de componente, componentes e variantes, padrões de layout (grid, colunas, breakpoints).
3. **Extraia valores reais.** Leia estilos computados no navegador ou o CSS; rode `node tools/lint-raw-values.mjs <src> --json` para listar hex e px soltos; procure múltiplos de 4/8 já recorrentes.
4. **Cure.** Una duplicatas (cinco cinzas quase iguais viram um passo de rampa), classifique cada variação como padrão ou exceção, nomeie por função.
5. **Normalize em tokens.** Gere rampas com `tools/palette.mjs`, escala com `tools/type-scale.mjs` e `tools/spacing-scale.mjs`; aproxime os valores encontrados aos passos gerados; registre os pares em `contrast-pairs.json`; rode `tools/build-tokens.mjs`.
6. **Formalize** num `DESIGN.md` (ver `design-md.md`), marcando o que foi **observado** e o que foi **inferido**.
7. **Migre incrementalmente**: componentes compartilhados primeiro, telas depois. Meça o drift a cada rodada.

Sintomas típicos a resolver: várias versões de botão sem hierarquia clara; a mesma função com hex diferentes; combinações tipográficas sem explicação; padding sem padrão.

## Anti-padrões

- Componente novo para cada tela.
- Variante para cada diferença de texto ou ícone.
- Estados só "default e hover".
- Vazio e erro esquecidos porque o protótipo tinha dados perfeitos.
- Nomes divergentes entre ferramenta de design e código.
- Propriedade pública que aceita cor ou px livres.
- Documentação escrita meses depois, por quem não criou o componente.

## Checklist

- [ ] Verifiquei que nenhum componente existente resolve o caso.
- [ ] Nível de composição definido; dependências só para níveis inferiores.
- [ ] Anatomia com partes e tokens nomeados.
- [ ] Matriz de estados completa, incluindo loading, error, empty e success onde se aplicam.
- [ ] Variantes só por hierarquia, intenção e tamanho; o resto em propriedades/slots.
- [ ] API com nomes idênticos aos de design e aos tokens.
- [ ] Página de documentação com as 13 seções e status.
- [ ] Pacote de handoff com casos extremos, movimento e acessibilidade.
