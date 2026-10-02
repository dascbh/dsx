---
name: padroes
description: "Consulta o catálogo de 77 padrões de interface para decidir com critério: modal ou página, toast ou inline, tabela ou cards, quando validar, confirmar ou oferecer desfazer. Use em qualquer dúvida entre componentes ou comportamentos."
---

# Consultar padrões de interface

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos abaixo são relativos a ela.

## Como encontrar o padrão

1. Leia `patterns/index.json` (leve, uma linha por padrão: `id`, `titulo`, `categoria`, `componentes`, `regra`, `status`, `impacto`). Ou `patterns/README.md` para a mesma informação em tabela.
2. Filtre pela decisão em jogo — busque por componente (`modal`, `toast`, `tabela`, `botão`), por categoria ou por palavra da pergunta.
3. Se a `regra` resolver o caso, aplique-a e cite o id do padrão.
4. Se o caso tiver nuance (contexto incomum, conflito entre padrões), abra o cartão e siga a seção **Decisão** (regras SE → ENTÃO), depois **Quando evitar** (que aponta alternativas).
5. Antes de considerar a decisão implementada, rode o **Checklist de verificação** do cartão.

## Categorias

| Categoria | Cobre |
|---|---|
| `acoes` | hierarquia e posição de botões, link vs botão, ícone sem texto, botão desabilitado, confirmação, desfazer, ações destrutivas, duplo clique, FAB |
| `formularios` | rótulos, obrigatórios, ordem dos campos, validação, mensagens de erro, etapas, autosave, upload, dropdown, autopreenchimento |
| `feedback` | carregamento (skeleton/spinner/longo), vazio, sucesso, toast/alerta/inline, falhas, tentar novamente, código de erro, progresso |
| `busca-filtros` | estrutura de filtros, aplicação automática, filtros ativos, busca sem resultados |
| `dados` | tabela vs cards, ordenação, paginação de tabela, tabela no mobile, filtro de período |
| `navegacao` | navegação principal, abas, breadcrumbs, paginação vs scroll, links em nova aba |
| `modais` | quando usar, quando evitar, como fechar |
| `autenticacao` | requisitos de senha, mostrar senha, confirmar senha, recuperar senha, sessão expirada |
| `acessibilidade` | foco de teclado, alvo de toque, não usar só cor |
| `ux-writing` | texto de botão, texto de link, mensagens de erro úteis |
| `ia` | rotular conteúdo de IA, incerteza, fontes, revisar resultado, confirmar ação da IA, recuperar erro da IA |
| `ecommerce` | carrinho, CEP, checkout como convidado, variações de produto |
| `conteudo` | carrossel e carrossel automático |

## Quando os padrões conflitam

- **Acessibilidade e prevenção de perda de dados vencem** conveniência e estética.
- Padrão com `status: evitar` só pode ser usado com justificativa explícita registrada.
- Se dois padrões recomendados apontarem caminhos diferentes, prefira o que reduz **custo de erro** para a pessoa (reversibilidade > velocidade).
- Se o DESIGN.md do projeto contradizer um padrão, siga o DESIGN.md **e** aponte a divergência no relatório — pode ser decisão consciente ou dívida.

## Formato de resposta

Quando usado para responder uma pergunta:

```
Decisão: <o que fazer, em uma frase>
Padrão: <id> (<status>, impacto <impacto>)
Por quê: <1–2 frases ligando o contexto do usuário à regra>
Cuidados: <itens do checklist mais prováveis de serem esquecidos>
Alternativa se <condição>: <outro padrão>
```

## Contribuindo com um padrão novo

Use `templates/padrao.md`, salve em `patterns/<categoria>/<id>.md` e rode `node tools/lint-patterns.mjs --index` para validar e regenerar o índice.
