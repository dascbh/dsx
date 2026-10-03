# Fontes externas de UX

> **Quando consultar**
> - Ao criar ou revisar um cartão de `archetypes/`, um padrão de `patterns/` ou um fundamento, e quiser conferir lacunas ou ideias em referências reconhecidas.
> - Quando alguém pedir para "usar o que o site X diz" ou colar trecho de uma referência externa no DSX.
> - Ao citar a origem de uma ideia num relatório, numa skill ou num `UX.md`.

O DSX aprende com referências públicas de UX, mas **escreve tudo com redação própria**. As fontes abaixo são para ler, comparar e citar com crédito; nenhuma delas é texto para colar. Este é o único arquivo de `knowledge/` que lista URLs de fontes: em `patterns/` e `archetypes/` não se cita URL (o linter de padrões bloqueia).

## Fontes

| Fonte | O que tem de melhor | Como o DSX usa | Uso permitido |
|---|---|---|---|
| CamaraUX — [camaraux.com.br](https://camaraux.com.br) | Padrões de UX e artigos em pt-BR, com vocabulário próximo do público brasileiro | Conferir se um padrão ou arquétipo cobre os casos que a comunidade discute; inspirar exemplos em pt-BR | Os termos de uso **proíbem reprodução**. Só citação curta com crédito e link, fora de `patterns/` e `archetypes/` |
| web design rules and guidelines — [github.com/abbas-roholamin/web-design-rules-and-guidelines](https://github.com/abbas-roholamin/web-design-rules-and-guidelines) | Lista compacta de regras práticas de layout, tipografia, formulários e botões | Checagem de lacunas: regra que aparece lá e falta no DSX vira candidata, escrita do zero com critério SE → ENTÃO | **Sem licença** declarada = todos os direitos reservados. Nada de cópia, nem adaptada |
| Leis de UX (Hick, Fitts, Miller, Jakob, proximidade e afins) | Princípios de psicologia cognitiva com nome, úteis para justificar decisões | Fundamentar regras em `psicologia-e-leis.md` e o "porquê" de cartões e padrões | Conceitos são de domínio comum; textos e ilustrações de sites que os compilam não são. Explique com palavras próprias |
| GOV.UK Design System — [design-system.service.gov.uk](https://design-system.service.gov.uk) | Padrões de **página** e de serviço testados com pessoas reais (perguntar uma coisa por página, página de confirmação, verificar respostas) | Referência principal para arquétipos de fluxo público (`public-decision-page`, `step-wizard`) e para texto direto | Conteúdo sob licença aberta com atribuição (Open Government Licence). Mesmo assim, o DSX reescreve: o contexto e o idioma são outros |
| Carbon Design System — [carbondesignsystem.com](https://carbondesignsystem.com) | Diretrizes de uso para produto operacional denso: tabelas de dados, filtros, notificações, estados vazios | Referência para arquétipos operacionais (`operational-list`, `master-detail`, `detail-side-panel`) e densidade | Código sob licença aberta; textos das diretrizes não são para copiar. Redação própria |
| Material Design — [m3.material.io](https://m3.material.io) | Diretrizes de componentes e de layout adaptativo (classes de largura, painéis, navegação por tamanho de tela) | Referência para variações por plataforma (ex.: cards no mobile) e regiões adaptativas | Tratar o texto como protegido; usar a ideia, não a frase |
| Nielsen Norman Group — [nngroup.com](https://www.nngroup.com) | Heurísticas, percurso cognitivo, pesquisas sobre padrões de leitura e formulários | Base de `heuristicas-nielsen.md` e `avaliacao-de-usabilidade.md`; severidade 0–4 | Artigos protegidos por direitos autorais. Conhecimento consolidado, sempre reescrito |

## Como usar uma fonte

1. **Leia para entender, feche, escreva.** Escreva a regra do DSX sem o texto da fonte aberto ao lado. Se a frase saiu igual, reescreva.
2. **Traga o critério, não a frase.** O DSX quer SE → ENTÃO, número ou posição verificável. Uma fonte que diz "seja claro" não vira regra; vira pergunta: claro medido como?
3. **Confronte com o contexto.** GOV.UK escreve para cidadão em serviço público; Carbon para operador corporativo. SE a fonte e o registro do produto divergem → ENTÃO vence o registro (`knowledge/design-system/escolher-design-system.md`).
4. **Duas fontes discordam?** Registre a divergência e decida pelo princípio do DSX (`docs/principios.md`): prevenção de perda e acessibilidade vencem conveniência.
5. **Credite quando citar.** Em relatório ou discussão, cite nome da fonte e link. Em `patterns/` e `archetypes/`, não: ali o texto é do DSX.

## O que NÃO fazer

- Não copie nem traduza trechos, listas ou exemplos de nenhuma fonte para dentro do DSX, nem "levemente adaptados".
- Não reproduza a estrutura de uma página alheia item por item (mesma ordem, mesmos exemplos): isso é cópia com outras palavras.
- Não cole imagem, diagrama ou captura de site externo em `knowledge/`, `patterns/` ou `archetypes/`.
- Não cite URL em `patterns/` nem em `archetypes/`.
- Não trate uma fonte como lei: é evidência a confrontar com o produto e, quando o custo do erro é alto, com teste (skill `pesquisa`).
- Conteúdo de terceiros com licença que permite cópia vai para `references/`, sem alteração e com o crédito exigido, gerado por `tools/references.mjs`; nunca misturado ao texto do DSX.

## Checklist

- [ ] A regra nova foi escrita sem o texto da fonte aberto e não repete frases dela.
- [ ] Tem critério verificável (SE → ENTÃO, número, posição), não só recomendação.
- [ ] Foi confrontada com o registro do produto e com `docs/principios.md`.
- [ ] Nenhuma URL em `patterns/` ou `archetypes/`; crédito com link só em relatórios e neste arquivo.
