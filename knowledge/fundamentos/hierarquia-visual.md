# Hierarquia visual

> **Quando consultar**
> - Ao montar o layout de qualquer tela, card, dialog ou dashboard.
> - Quando "tudo parece igual", a ação principal se perde ou a tela "parece poluída".
> - Ao definir escala tipográfica, espaçamento e densidade de uma interface.
> - Ao revisar se a ordem visual, a ordem de leitura e a ordem de foco coincidem.

Hierarquia visual é a ordem em que a tela é percebida: o que vem primeiro, depois e por último. Ela deve refletir a **prioridade real da tarefa**, não a vontade de destacar tudo.

---

## 1. Processo

1. **Nomeie a tarefa principal** da tela numa frase ("revisar e pagar o pedido").
2. **Classifique o conteúdo** em três níveis:
   - Essencial: o que a pessoa precisa para decidir e agir.
   - Apoio: o que ajuda a decidir (contexto, comparação, ajuda).
   - Detalhe: o que pode ficar sob demanda (metadados, histórico, configurações).
3. **Construa o caminho de atenção:** um ponto de entrada (título ou dado-chave) → informação de apoio → ação principal.
4. **Remova ou rebaixe** o que compete com esse caminho.
5. **Valide em todos os estados:** conteúdo real longo, vazio, erro, carregando, tela estreita, zoom de 200%.

---

## 2. Alavancas de hierarquia

| Alavanca | Como funciona | Regra |
|---|---|---|
| Tamanho e escala | O maior é visto primeiro | Tamanho proporcional à prioridade; não aumente o que é secundário |
| Contraste | Luminosidade, cor, peso, preenchimento | Reserve a cor de destaque para a ação principal e estados; não use em decoração |
| Peso tipográfico | Negrito atrai antes do regular | No máximo 2 pesos por bloco (ex. 400 e 600) |
| Espaço | Espaço em volta isola e valoriza | Mais espaço em torno do essencial; menos dentro dos grupos |
| Posição | Topo e início da linha de leitura pesam mais | Ponto de entrada no topo; ação principal perto do conteúdo que a motiva |
| Alinhamento | Eixos comuns indicam pertencimento | Poucos eixos (1–3 por tela); evite centralizar blocos de texto longos |
| Cor e saturação | Cor saturada sobressai sobre neutros | Use 1 cor de destaque; estados semânticos (erro, sucesso, alerta) só para estado |
| Profundidade | Sombra e elevação trazem para frente | Elevação para camadas (menu, modal), não para destacar conteúdo comum |

---

## 3. Regras numéricas

**Tipografia**
- Escala com razão constante entre 1,2 e 1,333 (ex.: 14 → 16 → 20 → 24 → 32).
- Até 4 tamanhos de texto numa mesma tela; mais que isso dilui a diferença.
- Diferença mínima perceptível entre níveis: ~20% de tamanho **ou** mudança de peso + tamanho.
- Corpo de texto: 16 px na web (mínimo 14 px em interfaces densas); entrelinha 1,4–1,6.
- Comprimento de linha: 45–75 caracteres para leitura contínua.
- Títulos: entrelinha 1,1–1,3; espaço acima do título maior que abaixo (o título pertence ao que vem depois).

**Espaçamento**
- Use escala de base 4 ou 8 (4, 8, 12, 16, 24, 32, 48, 64).
- Espaço entre grupos ≥ 2× o espaço dentro do grupo.
- Rótulo colado ao seu campo (4–8 px); campos entre si 16–24 px; seções 32–48 px.

**Contraste (WCAG 2.2 AA)**
- Texto normal: ≥ 4,5:1.
- Texto grande (≥ 24 px, ou ≥ 18,66 px em negrito): ≥ 3:1.
- Componentes de interface e gráficos informativos (bordas de campo, ícones, foco): ≥ 3:1.

**Ações**
- Uma ação primária por contexto visual (tela, dialog, card de seção). Ver [hierarquia-de-botoes](../../patterns/acoes/hierarquia-de-botoes.md) e [posicao-de-acoes](../../patterns/acoes/posicao-de-acoes.md).
- Ações secundárias com menor peso (contorno ou texto); destrutivas com tratamento próprio e afastadas.

---

## 4. Padrões de varredura

As pessoas raramente leem tudo; elas varrem. Organize para o padrão provável.

| Padrão | Quando ocorre | Como projetar |
|---|---|---|
| F | Páginas densas de texto, listas, resultados de busca | Informação decisiva nas primeiras palavras de títulos e itens; subtítulos frequentes; início das linhas carregando significado |
| Z | Telas com pouco texto, landing, cards simples | Marca/título no canto superior esquerdo, dado-chave no topo, ação principal no fim do percurso (inferior direito ou logo abaixo do conteúdo) |
| Camadas (layer cake) | Conteúdo com bons subtítulos | Subtítulos descritivos que permitem pular direto ao trecho certo |
| Pontos (spotted) | Busca de algo específico (preço, data, link) | Formatação consistente para o dado procurado: números alinhados, datas no mesmo formato |

**Regras**
- Comece títulos, rótulos e itens de lista pela palavra que diferencia ("Fatura de março", não "Sua fatura referente ao mês de março").
- Alinhe números à direita em tabelas e use algarismos tabulares.
- Em idiomas da esquerda para a direita, o canto superior esquerdo é o ponto de entrada padrão; não coloque ali algo irrelevante.

---

## 5. Densidade

Densidade é quanta informação cabe por área. Não existe "certa"; existe adequada ao uso.

| Contexto | Densidade | Sinais |
|---|---|---|
| Uso ocasional, público amplo, mobile | Confortável | Linhas de 48–56 px, mais espaço, uma tarefa por tela |
| Uso diário por especialistas, tabelas, back-office | Compacta | Linhas de 32–40 px, mais colunas, atalhos |
| Misto | Oferecer alternância | Controle de densidade persistente por usuário |

**Regras**
- SE a pessoa precisa comparar muitos itens ENTÃO priorize densidade (tabela) sobre cards decorativos ([tabela-vs-cards](../../patterns/dados/tabela-vs-cards.md)).
- SE a pessoa está aprendendo ou decidindo algo de alto risco ENTÃO priorize espaço e foco.
- Compacto não pode reduzir alvo de toque abaixo do mínimo nem texto abaixo de ~12–13 px.
- Densidade alta exige hierarquia ainda mais clara: alinhamento rigoroso, separadores leves, zebra ou hover em linhas.

---

## 6. Teste do borrão (squint test)

1. Aperte os olhos ou aplique desfoque de ~5–8 px na captura da tela.
2. Anote os 3 primeiros elementos que ainda se destacam.
3. Compare com a classificação essencial/apoio/detalhe.

- SE o primeiro elemento percebido não é o ponto de entrada nem a ação principal ENTÃO a hierarquia está invertida.
- SE nada se destaca ENTÃO falta contraste de escala ou peso.
- SE mais de 3 coisas disputam o primeiro lugar ENTÃO há destaque demais; rebaixe.
- Repita em escala de cinza: se a hierarquia some sem cor, ela depende demais de cor.

---

## 7. Hierarquia e acessibilidade

- Níveis de título semânticos (h1 → h2 → h3) devem coincidir com a hierarquia visual; não escolha a tag pelo tamanho.
- Um único h1 por página, descrevendo a tarefa ou o conteúdo.
- Ordem do DOM = ordem de leitura = ordem de foco = ordem visual. Reordenar só com CSS cria divergência para teclado e leitor de tela.
- Hierarquia não pode depender só de cor ou só de tamanho.
- A hierarquia precisa sobreviver a zoom de 200% e reflow em 320 px de largura.

---

## 8. Anti-padrões

- **Destacar tudo:** vários elementos em negrito, cor de destaque e tamanho grande; a prioridade desaparece.
- **Ação principal escondida:** abaixo da dobra, com o mesmo peso das secundárias ou longe do conteúdo.
- **Hierarquia só na landing:** telas internas viram listas planas.
- **Dados fictícios curtos no design:** nomes de 5 letras e valores redondos escondem quebras reais.
- **Semântica divergente:** visual diz uma ordem, estrutura HTML diz outra.
- **Cor de destaque como decoração:** quando a cor de ação aparece em ícones e enfeites, o botão principal deixa de se destacar.
- **Excesso de containers:** cards dentro de cards, bordas por toda parte, em vez de espaço.

---

## Checklist de auditoria

- [ ] A tarefa principal da tela cabe numa frase e o layout a reflete.
- [ ] No teste do borrão, o primeiro elemento percebido é o ponto de entrada ou a ação principal.
- [ ] Há uma única ação primária por contexto visual.
- [ ] No máximo 4 tamanhos de texto e 2 pesos por bloco; escala com razão constante.
- [ ] Espaço entre grupos ≥ 2× o espaço interno; escala de 4/8 px respeitada.
- [ ] Contraste de texto ≥ 4,5:1 (grande ≥ 3:1) e de componentes ≥ 3:1.
- [ ] Títulos, rótulos e itens começam pela palavra que diferencia.
- [ ] Densidade adequada ao uso (comparar vs. aprender), sem reduzir alvos ou texto abaixo do mínimo.
- [ ] Hierarquia validada com conteúdo real longo, estados vazios/erro/carregando, 320 px e zoom de 200%.
- [ ] Títulos semânticos, ordem de leitura e ordem de foco coincidem com a ordem visual.
- [ ] A hierarquia continua legível em escala de cinza.
