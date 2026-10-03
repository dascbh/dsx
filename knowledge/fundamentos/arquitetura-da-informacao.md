# Arquitetura da informação, findability, fluxos e fidelidade

> **Quando consultar**
> - Ao decidir onde algo mora (rota nova, aba, seção, modal), como se chama e como se conecta ao resto.
> - Ao estruturar ou revisar menus, navegação, busca e categorias.
> - Ao desenhar o user flow de uma feature antes das telas.
> - Ao escolher a fidelidade de wireframe ou protótipo para a próxima decisão.

Arquitetura da informação (AI) organiza, nomeia e conecta conteúdo e funções para que as pessoas **encontrem, entendam e ajam**. A tela é consequência dessa estrutura, não o contrário.

---

## 1. Os quatro sistemas

| Sistema | Decide | Pergunta de controle |
|---|---|---|
| Organização | Como agrupar (por tarefa, tema, público, etapa, ordem alfabética, data) | O agrupamento segue a lógica de uso do público? |
| Rotulagem | Como nomear grupos, páginas, links e ações | Uma pessoa do público prevê o conteúdo pelo nome? |
| Navegação | Como se move entre partes (global, local, contextual, utilitária) | A pessoa sabe onde está, de onde veio e para onde pode ir? |
| Busca | Como encontrar sem navegar | A busca entende o vocabulário real e orienta quando falha? |

---

## 2. Processo

1. **Inventário:** liste todo conteúdo e função existentes; marque duplicatas e órfãos.
2. **Auditoria:** avalie clareza, atualidade e relevância; decida o que sai.
3. **Tarefas e público:** quais são as tarefas principais, com que frequência, por quem.
4. **Agrupamento por lógica de uso** (validar com card sorting aberto ou fechado).
5. **Hierarquia:** defina níveis e profundidade.
6. **Rotulagem:** nomes claros, específicos e do vocabulário do público.
7. **Mapa estrutural (sitemap):** visualize a árvore e os atalhos transversais.
8. **Validação:** tree testing (encontram o item na árvore, sem interface?) e teste de usabilidade.
9. **Transposição** para fluxos, wireframes e protótipos.

### Onde algo deve morar

- SE é uma área que a pessoa visita de forma independente e recorrente ENTÃO rota própria na navegação.
- SE é uma visão alternativa do mesmo objeto, no mesmo nível ENTÃO aba ([abas](../../patterns/navigation/tabs.md)).
- SE é parte do mesmo objeto e lida junto ENTÃO seção na mesma página.
- SE é uma tarefa curta e focada que não exige outro contexto ENTÃO modal ([when-to-use-modal](../../patterns/modals/when-to-use-modal.md), [when-to-avoid-modal](../../patterns/modals/when-to-avoid-modal.md)).
- SE já existe uma entidade com o mesmo significado ENTÃO reuse-a e o nome dela; não crie uma paralela.

---

## 3. Hierarquia e profundidade

- Organize por tarefa do público, nunca pelo organograma.
- Navegação global com 5–7 itens de primeiro nível; acima disso, agrupe ([main-navigation](../../patterns/navigation/main-navigation.md)).
- Prefira árvore mais larga e rasa a funda: páginas críticas a no máximo 3 níveis (cliques) do ponto de entrada.
- Categorias mutuamente distintas: SE duas categorias geram dúvida sobre onde algo está ENTÃO funda, renomeie ou crie atalho cruzado.
- Proibido "Outros", "Diversos", "Geral" como categoria de primeiro nível; são sintomas de agrupamento inacabado.
- Conteúdo crítico deve ter **mais de um caminho**: menu, busca e link contextual.

---

## 4. Rotulagem

- Use palavras que o público usa (entrevistas, tickets, termos buscados), com sinônimos mapeados na busca.
- Rótulo específico prevê o conteúdo: "Notas fiscais" > "Documentos"; "Alterar senha" > "Segurança" quando é o que a pessoa procura.
- Mesmo conceito, mesmo nome em menu, título de página, breadcrumb e botão. Ver [ux-writing.md](ux-writing.md#5-consistência-de-glossário).
- Título da página = rótulo do link que leva a ela.
- Evite rótulos criativos ou de marketing na navegação.

---

## 5. Navegação

| Tipo | Função | Padrões |
|---|---|---|
| Global | Acesso às áreas principais de qualquer lugar | Barra superior, menu lateral, barra inferior no mobile (3–5 itens) |
| Local | Dentro de uma área | Submenu, abas, navegação secundária |
| Contextual | Ligações entre itens relacionados | Links no conteúdo, "relacionados" |
| Orientação | Onde estou | Item ativo destacado, título, [breadcrumbs](../../patterns/navigation/breadcrumbs.md) |

**Regras**
- Item ativo sempre indicado (não só por cor).
- Breadcrumbs quando a hierarquia tem 3+ níveis e a pessoa pode chegar por busca ou link externo.
- Links abrem na mesma aba, salvo exceções justificadas ([link-in-new-tab](../../patterns/navigation/link-in-new-tab.md)).
- Paginação, "carregar mais" ou rolagem infinita conforme a tarefa ([pagination-vs-scroll](../../patterns/navigation/pagination-vs-scroll.md)).
- Voltar retorna ao estado anterior (posição de rolagem, filtros, busca).

---

## 6. Findability

Findability é a facilidade de **encontrar, reconhecer e recuperar** algo quando se precisa. É diferente de *discoverability* (perceber algo que não se sabia que existia) e de usabilidade (operar depois de achar).

### Quatro situações

| Situação | O que a pessoa faz | O que a interface precisa |
|---|---|---|
| Item conhecido | Procura algo nomeável ("segunda via do boleto") | Rótulos do público, sinônimos, autocomplete, correspondência tolerante |
| Exploratória | Sabe o objetivo, não a resposta | Filtros combináveis, comparação, refinamento, resultados com contexto |
| Descoberta | Não sabe que existe | Links contextuais, agrupamentos e exemplos que revelam possibilidades |
| Recuperação | Já viu, não lembra onde | Histórico, recentes, favoritos, navegação estável |

### Busca

- Aceite sinônimos, plurais, acentos ausentes e erros de digitação.
- Sugira enquanto digita; mostre buscas recentes.
- Ordene por relevância e explique por que o resultado apareceu (trecho destacado).
- Filtros combináveis, visíveis quando ativos e fáceis de limpar ([active-filters](../../patterns/search-filters/active-filters.md), [filter-structure](../../patterns/search-filters/filter-structure.md), [applying-filters](../../patterns/search-filters/applying-filters.md)).
- Zero resultados: mostre o termo, sugira correção, alternativas e caminhos ([no-search-results](../../patterns/search-filters/no-search-results.md)).
- Preserve a consulta e os filtros ao voltar dos resultados.
- Busca não corrige organização confusa, e boa organização não dispensa busca.

### Métodos

| Método | Responde | Não responde |
|---|---|---|
| Card sorting | Como o público agrupa e nomeia | Se encontra na estrutura final |
| Tree testing | Se encontra na hierarquia, sem interface | Se a interface ajuda ou atrapalha |
| Teste de primeiro clique | Se a primeira decisão vai no caminho certo | Se conclui a tarefa |
| Teste de usabilidade | Experiência completa | Cobertura estatística |
| Logs de busca, tickets | Vocabulário real e lacunas | Por que a pessoa falhou |

---

## 7. User flow

Mapa do caminho para concluir uma tarefa: entrada, ações, decisões, respostas do sistema, desvios e saídas.

**Notação mínima**

| Símbolo | Significado |
|---|---|
| Retângulo | Tela ou etapa |
| Losango | Decisão (do usuário ou do sistema), com saídas rotuladas ("sim/não", "logado/visitante") |
| Retângulo arredondado / pílula | Início e fim (sucesso, abandono, erro) |
| Seta | Transição, rotulada com a ação que a dispara |
| Nota | Regra de negócio, estado ou observação |

**Como construir**
1. Escreva o objetivo em linguagem do usuário ("receber o produto em casa até sexta"), não do sistema ("acessar o checkout").
2. Defina os pontos de entrada (home, e-mail, busca, link direto, notificação).
3. Mapeie o caminho de sucesso com as ações essenciais (não microdetalhes de interface).
4. Acrescente decisões, ramos condicionais (permissão, status, plano), caminhos de erro, vazios e abandono.
5. Marque onde o sistema age (envia e-mail, valida, cobra).
6. Procure passos elimináveis.
7. Valide com tarefas representativas.

**Níveis de maturidade:** task flow (linear, uma tarefa) → flow com decisões → wireflow (flow com miniaturas de tela).

**Anti-padrões:** só caminho feliz; mapear a estrutura interna em vez da intenção; um diagrama gigante para tudo; detalhar interface cedo demais; esquecer ramos por perfil ou permissão.

---

## 8. Wireframe e protótipo: escolha da fidelidade

| Fidelidade | Contém | Use para | Não use para |
|---|---|---|---|
| Baixa | Caixas, texto real curto, anotações, cinza | Explorar alternativas de estrutura, alinhar fluxo, workshops | Validar estética ou microinteração |
| Média | Proporções reais, hierarquia, componentes genéricos, conteúdo realista | Testar arquitetura, formulários, dashboards; alinhar com stakeholders | Aprovar identidade visual |
| Alta | Visual final, tokens, interações realistas, estados | Testar jornadas críticas, handoff, validação final | Explorar estrutura (gera apego e feedback sobre cor) |

**Decisão**
- SE a dúvida é "qual estrutura/ordem/agrupamento" ENTÃO baixa.
- SE a dúvida é "as pessoas encontram e entendem" ENTÃO média, com conteúdo realista.
- SE a dúvida é "a interação, o tempo ou o detalhe visual funcionam" ENTÃO alta, só no trecho em questão.
- Suba a fidelidade apenas depois que a estrutura foi validada.

**Regras para wireframes e protótipos**
- Todo protótipo começa com uma hipótese escrita e o critério que a confirma ou refuta.
- Use conteúdo real e volumes realistas; *lorem ipsum* e nomes curtos escondem problemas de hierarquia.
- Inclua estados: vazio, carregando, erro, sucesso, conteúdo extremo, permissões diferentes.
- Apresente em sequência (fluxo), não telas soltas; anote comportamentos e condições.
- Mostre adaptação mobile e desktop quando ambos importam.
- Conecte as ações principais; não perca tempo ligando todos os caminhos secundários.
- Teste com o público, não só com o time.

---

## Checklist de auditoria

- [ ] Agrupamento por tarefa do público, validado (card sorting/tree testing) ou marcado como hipótese.
- [ ] Rótulos específicos, do vocabulário do público, iguais em menu, título, breadcrumb e botão.
- [ ] Sem categorias "Outros/Diversos"; categorias não se sobrepõem.
- [ ] 5–7 itens na navegação global; páginas críticas a ≤ 3 níveis; mais de um caminho para conteúdo crítico.
- [ ] Localização atual sempre indicada; voltar preserva estado.
- [ ] Nova funcionalidade alocada pela regra rota/aba/seção/modal, sem duplicar entidade existente.
- [ ] Busca tolera erros e sinônimos, mostra filtros ativos e orienta em zero resultados.
- [ ] User flow com objetivo do usuário, entradas, decisões rotuladas, erros, vazios e abandono.
- [ ] Fidelidade do wireframe/protótipo escolhida pela pergunta a responder; conteúdo realista; estados incluídos.
