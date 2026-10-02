---
id: abas
titulo: Quando usar abas?
categoria: navegacao
componentes: [abas, tablist, painel]
tipo: recomendacao
impacto: medio
status: recomendado
evidencia: forte
wcag: ["4.1.2", "2.1.1", "1.4.11", "2.4.7", "1.4.10"]
relacionados: [breadcrumbs, carrossel, navegacao-principal, estrutura-de-filtros]
---

# Quando usar abas?

> **Regra:** Use abas só para poucos conteúdos relacionados, de mesma importância e independentes o bastante para serem vistos um de cada vez.

## Contexto

Abas alternam painéis dentro do mesmo contexto, mostrando um por vez. Compactam a interface, mas escondem conteúdo: a pessoa precisa deduzir pelo rótulo o que há em cada painel e lembrar o que viu ao alternar.

A escolha depende da relação entre os conteúdos e da tarefa, não da quantidade de texto. Quando os grupos são relacionados e os rótulos claros, o componente reduz a sobrecarga visual; quando são diferentes, numerosos ou exigem comparação, a alternância custa caro.

Nem toda faixa horizontal é aba. Filtros, carrosséis, paginação e indicadores de progresso traduzem relações distintas.

## Decisão

- **SE** os conteúdos são visões equivalentes do mesmo objeto, área ou tarefa **ENTÃO** use abas.
- **SE** os grupos não têm relação direta **ENTÃO** use navegação própria, links ou páginas separadas.
- **SE** os itens são etapas de um processo **ENTÃO** use indicador de progresso, não abas.
- **SE** a pessoa precisa comparar conteúdos **ENTÃO** mostre-os juntos.
- **SE** o conteúdo é crítico para concluir a tarefa **ENTÃO** deixe visível, fora das abas.
- **SE** as abas são filtros ou modos do mesmo conjunto de dados **ENTÃO** use controle de filtro ou segmentado.
- **SE** a lista de abas cresce ou os rótulos ficam longos **ENTÃO** reavalie: página aberta ou acordeão.
- **SE** o painel carrega sem atraso perceptível **ENTÃO** ative a aba ao receber foco.
- **SE** há carregamento ou consulta demorada **ENTÃO** use ativação manual (Enter ou Espaço).
- **SE** as abas levam a páginas diferentes **ENTÃO** use links com URLs reais e indique a página atual.
- **SENÃO** abra a aba mais útil para a maioria como padrão.

## Quando usar

- Configurações relacionadas do mesmo objeto.
- Visões equivalentes de um painel.
- Poucas categorias do mesmo assunto.
- Detalhes complementares que não precisam aparecer juntos.
- Painéis que carregam sem perder estado.

## Quando evitar

- Etapas obrigatórias → **use em vez disso:** indicador de progresso ou formulário em etapas.
- Comparação simultânea → **use em vez disso:** conteúdo lado a lado.
- Seções essenciais de página de produto → **use em vez disso:** seções expandidas ou acordeão.
- Listas longas de destinos diferentes → **use em vez disso:** navegação principal.
- Abas dentro de abas → **use em vez disso:** achatar a estrutura.

## Faça

- Escreva rótulos curtos e previsíveis.
- Destaque a aba ativa com indicador perceptível.
- Conecte visualmente cada aba ao seu painel.
- Preserve o estado e os dados do painel ao alternar.
- No celular, use rolagem horizontal com indicação de abas fora da área visível.
- Valide se as pessoas entendem os rótulos e percebem os outros painéis.

## Evite

- Esconder informação crítica na aba secundária.
- Usar abas para etapas ou filtros.
- Forçar comparação por alternância.
- Criar muitas abas.
- Empilhar várias linhas de abas.
- Aninhar abas.
- Indicar a aba ativa só por cor.

## Acessibilidade

- Estrutura semântica: role="tablist", role="tab" e role="tabpanel", com aria-controls e aria-labelledby; aria-selected="true" só na ativa; nome acessível no conjunto (4.1.2).
- O foco entra na aba ativa; setas Esquerda e Direita em listas horizontais, Cima e Baixo em verticais; Enter ou Espaço ativam no modo manual (2.1.1).
- Indicador de seleção e foco com contraste suficiente (1.4.11, 2.4.7).
- Em telas estreitas, a rolagem horizontal deve funcionar por teclado e toque; teste zoom de 200% e 400% (1.4.10).
- O foco não pode desaparecer quando o painel muda.

## Microcópia

| Situação | Exemplo |
|---|---|
| Rótulos de abas | "Resumo", "Pagamentos", "Histórico" |
| Nome do conjunto (leitor de tela) | "Detalhes do cliente" |
| Painel carregando | "Carregando histórico..." |
| Painel vazio | "Nenhum pagamento registrado neste período." |

## Checklist de verificação

- [ ] Todas as abas tratam do mesmo objeto ou contexto.
- [ ] Os rótulos têm no máximo duas palavras ou cabem sem quebra.
- [ ] Não há abas dentro de abas.
- [ ] A aba padrão é a mais útil para a maioria.
- [ ] Nenhuma informação crítica fica só em aba secundária.
- [ ] A aba ativa tem indicador além da cor.
- [ ] role tablist, tab e tabpanel e aria-selected estão corretos.
- [ ] Setas navegam entre abas.
- [ ] No mobile, existe indicação de abas fora da área visível.
- [ ] Trocar de aba não apaga dados já preenchidos.

## Fundamentação

- Nielsen Norman Group, uso correto de abas: conteúdos relacionados, poucos grupos, rótulos curtos, painel inicial útil, sem comparação entre abas.
- W3C WAI-ARIA Authoring Practices, padrão de abas e exemplo de ativação automática: papéis, relações, teclado e quando usar ativação automática ou manual.
- Padrão Digital GOV.BR, aba: rótulos breves, telas pequenas, não aninhar.
- Material Design, abas: diferença entre abas, paginação e carrossel.
- IBM Carbon, abas: não usar para comparação, progresso ou filtragem.
- Baymard Institute: seções essenciais de páginas de produto escondidas em abas horizontais geram problemas (achado específico, não proibição geral).
