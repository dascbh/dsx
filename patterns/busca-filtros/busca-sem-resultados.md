---
id: busca-sem-resultados
titulo: O que mostrar quando a busca não retorna resultados?
categoria: busca-filtros
componentes: [campo-de-busca, estado-vazio, filtros, regiao-de-status]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["4.1.3", "3.3.1", "2.4.3"]
relacionados: [estado-vazio, filtros-ativos, tentar-novamente, estrutura-de-filtros]
---

# O que mostrar quando a busca não retorna resultados?

> **Regra:** Mantenha a consulta digitada, informe com clareza que não há resultados e aponte o caminho mais provável para seguir, sem deslocar o foco.

## Contexto

Com zero resultados, a pessoa quer saber se o conteúdo inexiste, se a consulta ficou restrita demais, se há filtros ligados ou se ocorreu falha técnica. O estado não deve limpar o texto digitado nem encerrar a tarefa.

Encare a ausência de resultados como um estado de recuperação. Benchmarks de busca indicam que páginas "nenhum resultado" com dicas genéricas viram beco sem saída, enquanto sugestões atreladas à consulta dão um próximo passo.

Causas diferentes exigem estados diferentes: combinação de filtros sem correspondência, falha de rede e base vazia não são a mesma situação.

## Decisão

- **SE** a busca retorna zero resultados **ENTÃO** mantenha o texto no campo, informe "nenhum resultado" e repita o termo na mensagem.
- **SE** há filtros ativos **ENTÃO** liste-os e ofereça remover um a um e "Limpar filtros".
- **SE** a consulta parece ter erro de grafia **ENTÃO** sugira a grafia provável ou termos mais amplos e sinônimos.
- **SE** existem alternativas realmente relacionadas à intenção **ENTÃO** mostre categorias ou conteúdos próximos.
- **SE** não há alternativa relevante **ENTÃO** não invente resultados para preencher a tela.
- **SE** a requisição falhou **ENTÃO** mostre estado de erro com "Tentar novamente", não "sem resultados".
- **SE** a busca ainda carrega **ENTÃO** mostre carregamento, não estado vazio.
- **SE** sugestões podem expor conteúdo protegido ou registro sensível **ENTÃO** omita-as.
- **SENÃO** ofereça "Limpar busca" e mantenha o campo disponível.

## Quando usar

- Buscas em sites, catálogos, bibliotecas e bases de conhecimento.
- Consultas livres com termos variados.
- Combinações de filtros que podem zerar o resultado.
- Buscas remotas que podem demorar ou falhar.

## Quando evitar

- Consulta ainda carregando → **use em vez disso:** estado de carregamento.
- Falha técnica → **use em vez disso:** mensagem de erro com nova tentativa.
- Conjunto pequeno → **use em vez disso:** navegação direta em vez de busca livre.

## Faça

- Mantenha a consulta visível e editável.
- Diga o que aconteceu e o que tentar a seguir.
- Permita remover filtros no próprio estado vazio.
- Mantenha a busca disponível na tela.

## Evite

- Tela em branco sem explicação.
- Apagar o termo digitado.
- Dicas genéricas sem relação com a consulta.
- Sugestões sem relação com a intenção.
- Esconder os filtros que causaram o zero.

## Acessibilidade

- Campo de busca com rótulo visível e valor preservado.
- Anuncie o resultado numa região de status (por exemplo, role="status", polida), sem mover o foco (4.1.3).
- A mensagem não depende só de cor, ícone ou posição.
- Teclado alcança o campo, os filtros removíveis e as sugestões; foco visível preservado.
- Teste com leitor de tela, zoom, reflow e mobile.

## Microcópia

| Situação | Exemplo |
|---|---|
| Zero resultados | "Nenhum resultado para 'cadeira gamer'." |
| Dica | "Confira a grafia ou use termos mais amplos." |
| Com filtros | "Nenhum resultado com os filtros atuais. Remova um filtro para ver mais." |
| Ação | "Limpar filtros" |
| Falha | "Não foi possível buscar agora. Tentar novamente" |

## Checklist de verificação

- [ ] A consulta continua visível no campo.
- [ ] A mensagem informa que não há resultados e cita o termo.
- [ ] O estado diferencia zero resultado, filtro restritivo e falha técnica.
- [ ] Existe ação clara de recuperação (ajustar, limpar, tentar de novo).
- [ ] Filtros ativos podem ser removidos no próprio estado.
- [ ] Sugestões, quando existem, têm relação com a intenção.
- [ ] A mudança é anunciada sem mover o foco.
- [ ] O fluxo funciona com teclado e leitor de tela.

## Fundamentação

- Baymard Institute (busca e navegação mobile; página de nenhum resultado; filtros de e-commerce): dicas genéricas viram beco sem saída; sugestões contextuais e remoção de filtros ajudam a recuperar.
- WCAG 2.2, critério 4.1.3 (Status Messages): "nenhum resultado" exposto sem deslocar o foco.
- W3C WAI (exemplo com role=status em resultados de busca): comunicação de contagem, inclusive zero.
- W3C WAI, técnica G161: correção ortográfica e sinônimos ampliam a recuperação.
- IBM Carbon (padrão de busca): referência de estrutura de busca e feedback.
