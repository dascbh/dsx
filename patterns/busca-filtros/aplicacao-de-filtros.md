---
id: aplicacao-de-filtros
titulo: Filtros devem ser aplicados automaticamente?
categoria: busca-filtros
componentes: [filtro, painel-de-filtros, botao-aplicar, lista-de-resultados]
tipo: decisao-contextual
impacto: medio
status: usar-com-cautela
evidencia: forte
wcag: ["3.2.2", "4.1.3", "1.4.1", "2.4.7"]
relacionados: [estrutura-de-filtros, filtros-ativos, busca-sem-resultados, filtro-de-periodo]
---

# Filtros devem ser aplicados automaticamente?

> **Regra:** Atualize a lista na hora quando a resposta for rápida e a escolha for simples; exija "Aplicar" quando houver várias escolhas combinadas, consulta lenta ou painel que cobre os resultados.

## Contexto

Ao marcar um filtro, a interface pode atualizar a lista imediatamente ou esperar uma confirmação. O primeiro modelo dá retorno instantâneo; o segundo permite compor várias decisões antes de gastar uma consulta.

A escolha depende do número de critérios, do tempo de resposta, do dispositivo e da facilidade de desfazer. No desktop, com filtros e resultados visíveis juntos, a atualização imediata costuma funcionar. No celular, um painel que esconde a lista pede confirmação explícita para evitar recargas sucessivas e perda de orientação.

Além do desempenho, há acessibilidade: atualização que move o foco, rola a página ou não informa a nova contagem prejudica teclado e leitor de tela.

## Decisão

- **SE** há poucos critérios, resposta rápida e efeito fácil de desfazer **ENTÃO** aplique automaticamente.
- **SE** a pessoa escolhe opções em vários grupos **ENTÃO** use botão "Aplicar filtros".
- **SE** a consulta é pesada ou a rede é lenta **ENTÃO** use aplicação manual.
- **SE** o painel de filtros cobre a lista (mobile) **ENTÃO** use confirmação com a contagem, como "Mostrar X resultados".
- **SE** desktop e mobile exigem modelos diferentes **ENTÃO** adote modelo híbrido e mantenha rótulos e estados consistentes.
- **SE** a aplicação é manual **ENTÃO** separe "Aplicar", "Cancelar" e "Limpar", e distinga escolhas pendentes das ativas.
- **SE** a aplicação é automática **ENTÃO** indique carregamento, anuncie a nova contagem e mantenha o foco no controle acionado.
- **SENÃO** comece pela aplicação automática e meça o tempo de resposta com dados reais.

## Quando usar

- Aplicação automática: listas locais e rápidas, uma escolha simples.
- Aplicação manual: painéis com várias categorias, consultas pesadas, filtros em tela cheia no mobile.

## Quando evitar

- Atualizar a cada toque em painel complexo → **use em vez disso:** botão "Aplicar".
- Exigir "Aplicar" para uma única escolha rápida → **use em vez disso:** atualização imediata.
- Recarregar a página inteira sem aviso → **use em vez disso:** atualizar só a região de resultados.

## Faça

- Meça o tempo de resposta antes de decidir.
- Mostre a contagem de resultados (ou prévia) antes de aplicar.
- Permita remover um filtro, limpar todos e desfazer.
- Preserve escolhas pendentes ao fechar e reabrir o painel.
- Teste rede lenta, resultado vazio e mudanças rápidas.

## Evite

- Apagar escolhas ao fechar o painel sem avisar.
- Esconder filtros pendentes.
- Deslocar o foco ou a posição da página após a atualização.
- Usar "Aplicar" sem indicar o que será aplicado.
- Trocar de modelo entre dispositivos sem sinalizar o estado.

## Acessibilidade

- Mudar um filtro não deve provocar mudança de contexto inesperada (3.2.2).
- Anuncie "18 resultados encontrados" ou "Nenhum resultado" em região de status polida, sem roubar o foco (4.1.3).
- Controles com rótulo, agrupamento e estado programáticos; pendente e ativo distinguíveis sem depender de cor (1.4.1).
- "Aplicar", "Cancelar" e "Limpar" alcançáveis por teclado, com foco visível (2.4.7).
- Defina para onde o foco volta após aplicar ou cancelar.

## Microcópia

| Situação | Exemplo |
|---|---|
| Confirmação com contagem | "Mostrar 42 resultados" |
| Aplicar em lote | "Aplicar filtros" |
| Descartar | "Cancelar" |
| Limpar | "Limpar filtros" |
| Status automático | "18 resultados encontrados" |
| Sem resultado | "Nenhum resultado. Remova algum filtro para ampliar a busca." |

## Checklist de verificação

- [ ] O modelo (automático ou manual) condiz com o número de filtros.
- [ ] O tempo de resposta foi aferido com dados reais.
- [ ] Filtros pendentes estão separados dos ativos.
- [ ] Há contagem ou prévia de resultados.
- [ ] É possível cancelar e limpar a combinação.
- [ ] O foco permanece no controle após a atualização.
- [ ] A mudança é anunciada em região de status.
- [ ] O fluxo foi testado em rede lenta e no mobile.
- [ ] O fluxo passou por teste com leitor de tela e teclado.

## Fundamentação

- Baymard Institute: filtragem em tempo real funciona no desktop; no mobile prefere-se ação explícita com contagem.
- IBM Carbon (Filtering, Disclosures): distingue atualização instantânea de aplicação em lote e define botões de aplicar e limpar.
- WCAG 2.2: 3.2.2 (alteração na entrada) e 4.1.3 (mensagens de status).
- W3C WAI técnica ARIA22: região role=status para anúncio polido.
- Red Hat PatternFly (Filters): combinações de filtros, contagem e adaptação mobile.
