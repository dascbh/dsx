---
name: figma-espelhar
description: Roda a ida do ciclo — reconstrói no Figma as telas de um app que já existe em código, uma tela por rota, um frame por diálogo e por estado, os fluxos em raias, tudo derivado do código e não redesenhado, na trilha essencial ou completa (e, da rodada 2 em diante, só o que o código mudou). Use quando pedirem "põe o app no Figma", "recria as telas no Figma", "espelha o produto no Figma", quando o time não tem arquivo de design e o código é a única fonte de verdade, quando precisar de um "antes" fiel para embasar um redesenho, ou para reespelhar telas que mudaram no código. Não use para desenhar tela nova — para isso, wireframe primeiro.
---

# figma-espelhar — o código é a fonte, o Figma é o espelho

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

Times que construíram o produto direto no código costumam não ter arquivo de
design, ou têm um que divergiu há anos. O reflexo errado é redesenhar no Figma
"do jeito que deveria ser": sai um arquivo bonito que **não descreve o
produto**, e a primeira pessoa que confiar nele implementa algo que não existe.

Esta skill faz o contrário — deriva o arquivo do código, peça por peça, e
termina com uma prova de cobertura.

**Entrada (opcional):** `[essencial|completa] [rota ou arquivo, para reespelho pontual]`.

## Antes de escrever qualquer coisa no Figma — a vez

Leia o registro de sincronia (`design/figma-sync.md`, skill `figma-ciclo`):

- Se `vez: design`, **pare** e diga ao usuário. Há refino em curso; espelhar
  agora sobrescreve. (O hook `guarda-vez` também bloqueia, mas não deixe o hook
  ser o primeiro a avisar.) Registro legado com `turn: design` vale igual.
- Se não houver registro, o projeto ainda não tem ciclo: ofereça
  `/dsx:figma-iniciar`.

Da rodada 2 em diante, **reespelho é incremental**: só as telas que o código
mudou desde a última sincronia.

```bash
git diff --name-only <ultimo-sync>..HEAD -- src/pages src/components src/theme.ts
```

(Ajuste os caminhos à estrutura do projeto — `.dsx/mapas/mapa-projeto.md` diz
onde ficam páginas, componentes e tema.)

## Regra zero — é espelho, não redesenho

Se uma tela está feia, inconsistente ou quebrada no código, **desenhe como
está** e registre o achado num quadro à parte (e no arquivo de achados — ver
"Achados"). Corrigir no Figma cria uma mentira: alguém compara os dois e
conclui que a implementação regrediu.

Vale para densidade estranha, cor fora do token, ausência de tratamento mobile,
lista sem estado vazio. O espelho mostra o produto; a crítica é outro trabalho
(skill `revisar-ux`).

**A outra forma de quebrar a regra zero: descrever em vez de desenhar.** Uma
tela com conteúdo denso ou dinâmico — uma thread de chat, uma tabela ao vivo,
um compositor com controles reais — não é licença para escrever como ela
seria em vez de construí-la. Uma legenda como *"Compositor habilitado — envia
para `POST /channels/:id/messages`"* descreve comportamento; não é espelho da
UI, e passa numa conferência só por screenshot tão limpa quanto a coisa real
passaria. Construa os nós de verdade — balões de mensagem com os dados
fictícios do mapa de domínio, chips de filtro reais, botões reais com seus
rótulos e ícones reais — do mesmo jeito que toda outra tela é construída,
mesmo que custe mais chamadas. Se a densidade de uma tela genuinamente não
cabe no orçamento da trilha, diga isso em voz alta e registre como decisão de
escopo em `Divergências conhecidas` no `figma-sync.md` — não substitua por
prosa em silêncio deixando a matriz de cobertura reportar como feito.

## Trilha proporcional — pergunte o alvo antes de começar

| trilha | entrega | quando |
|---|---|---|
| **Essencial** | fundações + uma tela por rota + fluxos | onboarding de designer, apresentação do produto, base de redesenho |
| **Completa** | + diálogos, estados/variações, responsivo, matriz de cobertura | o Figma vira documentação viva e alguém vai auditar contra o código |

A completa de um app médio passa de cem frames e de vinte chamadas ao MCP. Na
dúvida, faça a essencial e ofereça a completa.

## Ferramenta

MCP oficial do Figma. **Carregue a skill `figma-use` antes de toda chamada a
`use_figma`** e `figma-create-new-file` antes de `create_new_file`. Carregue
também **`figma-generate-design`** — a skill oficial do próprio Figma para
montar telas a partir de código — pela ordem de construção wrapper-first, pela
descoberta reusar-antes-de-criar e pela asserção de família tipográfica; as
fases abaixo assumem essas mecânicas em vez de rederivá-las. Se o usuário tem
mais de um time/plano, pergunte em qual criar o arquivo antes de criar.

Chamada a partir da skill `figma-levar`? Ela já conferiu a vez e os mapas —
siga direto para as fases abaixo usando `.dsx/mapas/mapa-ui.json` e
`.dsx/mapas/dominio.json` como fonte do que é construído, não o inventário
por grep desta skill.

**Onde ler os mapas.** Procure primeiro em `.dsx/mapas/`; se não existir,
aceite o legado `.claude/figma-claude/` (`ui-map.*`, `project-map.*`,
`user-flows.*`, `task-flows.*`, `journey-map.*`, `domain-map.*`,
`design-system.json`) e avise que ele será regravado no caminho novo na
próxima execução da skill `mapear`. Antes de qualquer `use_figma` de
descoberta, leia `design/figma-reference.json` (skill `figma-convencoes`) —
ids de coleção, frame de ícones e chrome já estão lá.

## Fases

**1. Inventário.** Enumere as superfícies a partir do código, não da memória:
rotas do roteador, diálogos, painéis, overlays, estados. Use a skill
`figma-cobertura` — ela produz a checklist que vira a matriz no fim. Pular esta
fase é o que faz o espelho parecer completo e não estar. Se
`.dsx/mapas/mapa-ui.md` existe, comece por ele — já tem a hierarquia de
páginas, modais e estados resolvida; caia para `.dsx/mapas/mapa-projeto.md`
para a estrutura geral, e rode de novo a skill `mapear` antes se o projeto
mudou desde que algum dos dois foi escrito.

**2. Fundações.** Variáveis com modos claro/escuro, escala numérica, estilos de
texto e os ícones reais do projeto. Use a skill `figma-fundacoes`. A fonte de
verdade é `DESIGN.md` + tokens do projeto: tokens DTCG (`tokens/*.tokens.json`)
quando existirem; senão `.dsx/mapas/design-system.json` — se ele ainda não
existe, rode a skill `mapear` antes (ela extrai tokens com adaptadores por
framework — MUI, Tailwind, variáveis CSS — em vez de heurística de grep, e
aponta onde o código diverge do próprio tema declarado).

**3. Chrome como componente.** AppBar, menu lateral (aberto e recolhido) — o que
se repete em toda tela vira `COMPONENT`, e as telas usam instâncias. Corta o
custo das fases seguintes pela metade.

**4. Telas.** Uma por rota, montada com a biblioteca de helpers
`tools/figma/preludio.js` (colada no topo de cada script `use_figma`; preencha
o bloco CONFIGURE com os ids de `design/figma-reference.json`) em vez de nós
soltos — sai com auto-layout de verdade, não posicionamento absoluto.
Armadilhas em [references/plugin-api.md](references/plugin-api.md). Antes de
compor algo que parece repetir um padrão de outra tela, correlacione com o kit
em vez de recriar — skill `figma-convencoes`, seção 3 (e seção 5 se o kit ainda
não tiver a peça).

Uma rota cuja entrada em `mapa-ui.json` lista `subPages` com
`navVisible: true` precisa de **um frame por sub-página**, não um para o pai —
mesmo que compartilhem o componente de origem. Monte cada uma com o
filtro/estado daquela sub-página de fato aplicado (dados reais daquele filtro,
de `dominio.json`), não uma cópia do conteúdo do pai. Um componente
compartilhado servindo três destinos visíveis na navegação são três frames,
nunca um.

**5. Diálogos e estados.** Um frame por diálogo sobre um scrim; um por variação
relevante: vazio, carregando, erro, cada desfecho de um fluxo com mais de um
fim, menus e toasts. Use uma DSL de blocos (`['field', rótulo, valor]`,
`['alert', tom, texto]`) — sem ela, trinta diálogos viram trinta scripts
irrepetíveis. Se `.dsx/mapas/tarefas.md` existe, use as listas de passos dele
para saber quantos frames uma tarefa de vários passos realmente precisa, em
vez de rederivar do componente.

**6. Fluxos.** Raias por ator, caixas com título + subtítulo, conectores em
cotovelo com **uma** ponta de seta. Some o mapa de rotas: é o diagrama mais
consultado e o mais barato. Se `.dsx/mapas/fluxos.md` existe, parta dos
fluxos nomeados e dos pontos de entrada/saída dele em vez de retraçar chamadas
de navegação; `.dsx/mapas/jornada.md` dá às raias seus atores
(personas/papéis) e os estágios que valem mostrar.

**7. Responsivo.** Desenhe mobile **só onde o código tem breakpoint de verdade**.
Onde não tem, desenhe o resultado real do viewport estreito e registre como
achado — é informação, não omissão.

**8. Cobertura.** Feche com a matriz (skill `figma-cobertura`), conferindo a
checklist da fase 1 contra o que existe no arquivo.

## Dados de exemplo

Realistas e fictícios, do domínio do produto, com **estados de risco visíveis**:
algo atrasado, algo devolvido, algo aguardando decisão, um campo não informado.
Uma lista onde tudo está verde não mostra o design system — mostra o caso feliz,
que é justamente o que o design não precisa provar. Se `.dsx/mapas/dominio.md`
existe, tire de lá os campos, enums e regras de negócio em vez de inventar
alguns que pareçam plausíveis.

Nunca `Lorem ipsum`, nunca "Item 1 / Item 2", nunca nome de empresa real que não
seja a do próprio usuário. Declare na capa que os dados são fictícios.

## Organização do arquivo

Páginas numeradas — a numeração é o índice:

```
00 · Fundamentos      capa + cor + tipografia/forma
01 · Componentes      ícones, chrome, kit de primitivos
02 · <app principal>  uma tela por rota
03 · <outro perfil>   portal de outro papel + telas públicas
04 · Fluxos
05 · Diálogos
06 · Estados e variações
07 · Responsivo
08 · Cobertura
09 · Propostas        reservada à exploração de design (skill figma-propostas), nunca conteúdo de produto
```

Se `.dsx/mapas/jornada.md` encontrou mais de uma persona/papel, use-o para
decidir a divisão `02`/`03`/… — não adivinhe pelos caminhos de rota.

O nome do frame carrega a origem no código — sem isso a matriz de cobertura
vira adivinhação:

```
Demandas · Lista (/demandas)
Diálogo · Novo produto (ProductsPage)
Overlay · menu de notificações (NotificationBell)
```

O contrato completo de nomenclatura, quando uma página nova se justifica, e
como editar um componente do kit sem quebrar instância: skill
`figma-convencoes`.

## Verificação — a cada fase, sem exceção

Tire **screenshot de cada frame** e olhe. O Plugin API aceita layouts
impossíveis sem reclamar: coluna colapsada em 10px, tabela transbordando o card,
texto branco em fundo branco, ícone virado do avesso. Você só descobre olhando.

Nunca declare uma fase pronta sem ter visto o resultado renderizado.

Screenshot pega layout quebrado; não pega substituição de conteúdo — um frame
com auto-layout arrumado e um parágrafo explicativo passa numa olhada de layout
tão fácil quanto um com UI de verdade. Antes de fechar a fase Telas, escolha as
2–3 telas mais densas ou dinâmicas (chat, tabelas ao vivo, compositores com
vários campos) e compare a árvore de nós real do frame com o JSX/render do
componente de origem, elemento por elemento — não só o screenshot. É essa
conferência que pega um agente pegando o atalho "descreve num nó de texto em
vez de construir" sob pressão de tempo; um `figma-sync.md` cheio de
divergências corretamente registradas não prova que isso não aconteceu — só
prova o que foi procurado.

## Achados — dado, não narrativa

Uma rodada de espelho frequentemente descobre coisas reais sobre o produto
(bug de responsivo medido, botão que não faz nada, token duplicado, lista sem
estado vazio). Dois registros, sempre os dois:

1. **No Figma**, um quadro de achado ao lado do frame (borda tracejada, token
   `color/feedback/warning-icon`), com o texto curto do achado — é o que um
   designer vê.
2. **No repositório**, em `design/figma-achados/<rodada>.md` (ex.:
   `design/figma-achados/r3.md`) — se o achado só existe na resposta de chat
   que gerou a rodada, some assim que a conversa for arquivada.

Um bloco por achado, com a escala de severidade 0–4 do DSX (definida na skill
`revisar-ux`: 0 não é problema · 1 cosmético · 2 menor · 3 maior ·
4 catástrofe; severidade = frequência × impacto × persistência; barreira de
acessibilidade que bloqueia a tarefa é sempre 4):

Mesmo formato do arquivo de achados da skill `figma-ciclo` (um `###` por
achado, id `A-<rodada>-<nn>`):

```markdown
### A-r3-02 · Tabela de demandas transborda em 1024px
- onde: `src/pages/DemandsPage.tsx:142` · frame `02 · Demandas › Demandas · Lista (/demandas)`
- o que acontece: abaixo de 1100px a coluna "Prazo" sai do card; não há scroll horizontal
- por que é problema: a pessoa perde o prazo, que é a informação de risco da lista
- severidade: 3
- evidência: screenshot do frame em 1024px; Σ larguras 1180 > largura interna 1008
- espelhado como: desenhado como está (regra zero), quadro de achado ao lado do frame
- destino: correção no código (skill `construir-ui`) — não no Figma
```

Precisão de revisão adversarial: medido, com arquivo:linha, nunca "parece
estranho". Ordene por severidade. Achado de severidade ≥ 3 também é citado em
uma linha no relatório final ao usuário.

## Definition of done

- [ ] Toda rota do roteador tem frame — ou está declarada fora de escopo, com motivo
- [ ] Todo diálogo do código tem frame (trilha completa)
- [ ] Variáveis com os dois modos + um frame de prova em modo escuro
- [ ] Ícones são os do projeto, não aproximações
- [ ] Nenhuma tabela transborda o container; nenhum texto sai do frame
- [ ] Matriz de cobertura ligando cada arquivo de UI aos frames
- [ ] Achados registrados como achado (quadro no Figma + `design/figma-achados/<rodada>.md`, com severidade 0–4), não corrigidos no desenho
- [ ] Cada frame foi visto renderizado
- [ ] Nenhuma tela substitui por texto descritivo os elementos interativos que
      de fato contém (balões de mensagem, chips, botões, campos de formulário) —
      conferido contra o código nas telas mais densas, não só por screenshot

## Fechamento da rodada

Sem estes passos, a próxima rodada de diff reapresenta tudo como novidade:

1. **Regere o baseline** (`tools/figma/snapshot.js` colado em `use_figma`;
   mecanismo na skill `figma-ciclo`, [references/diff.md](../figma-ciclo/references/diff.md)).
2. **Atualize o registro** `design/figma-sync.md` (rodada, frames tocados,
   `Divergências conhecidas`, a quem passa a vez).
3. **Append** de uma linha em `design/figma-changelog.jsonl`
   (`"direcao": "codigo->figma"`, contagens reais de frames
   criados/alterados/removidos, `"achados": "design/figma-achados/<rodada>.md"`).
4. **Regenere** `design/figma-reference.json` se fundação ou estrutura mudou
   (skill `figma-convencoes`).

## Isto é a ida de um ciclo

O espelho é o passo 1 de um ida-e-volta contínuo: código → Figma → refino →
código. Antes de espelhar **um arquivo que já existe**, leia o registro de
sincronia do projeto (skill `figma-ciclo`) — reespelhar enquanto a vez é do
design apaga o refinamento feito lá.

Da rodada 2 em diante, reespelhe só as telas que o código mudou desde a última
sincronia. A volta é a skill `figma-trazer`.
