---
id: porcentagem-de-progresso
titulo: Quando mostrar porcentagem de progresso?
categoria: feedback
componentes: [barra-de-progresso, indicador-de-carregamento]
tipo: recomendacao
impacto: medio
status: recomendado
evidencia: moderada
wcag: ["4.1.3", "4.1.2", "1.4.1", "1.4.11", "2.2.2"]
relacionados: [skeleton-vs-spinner, carregamento-longo, upload-de-arquivos, tentar-novamente]
---

# Quando mostrar porcentagem de progresso?

> **Regra:** Mostre porcentagem apenas quando o total e o avanço forem medidos de verdade; sem medida confiável, use indicador indeterminado com rótulo.

## Contexto

Uma porcentagem promete que existe um total e que o número mostra o caminho até a conclusão. Sem total conhecido, ela cria falsa precisão e, se muda de forma inexplicável ou trava, derruba a confiança e faz a espera parecer maior.

Antes de mostrar o número, verifique quatro pontos: o avanço é mensurável, a medida é estável, a tarefa tem início e fim definidos e a pessoa precisa acompanhá-la. Se faltar algum, informe só o estado da operação.

Quando o avanço se dá entre fases controladas pela pessoa, use etapas; não converta fases de duração desigual em percentual enganoso.

## Decisão

- **SE** o sistema conhece o tamanho total (arquivos, itens, bytes, etapas quantificáveis) **ENTÃO** use barra determinada com valor real de 0 a 100%.
- **SE** uma medida absoluta é mais útil **ENTÃO** mostre "42 de 100 itens" no lugar ou junto do percentual.
- **SE** o total ou o avanço são desconhecidos **ENTÃO** use indicador indeterminado com rótulo; não invente percentual, tempo restante ou etapa.
- **SE** o total só se torna conhecido durante o processamento **ENTÃO** comece indeterminado e passe a determinado quando houver medida confiável.
- **SE** o percentual é derivado só do tempo decorrido ou de estimativa sem base **ENTÃO** não o exiba.
- **SE** a operação é rápida a ponto de o indicador virar apenas ruído **ENTÃO** dispense o indicador.
- **SE** a tarefa é longa **ENTÃO** nomeie a tarefa, informe o resultado ao terminar e ofereça cancelar, tentar novamente ou retomar quando for seguro.
- **SE** o total muda **ENTÃO** explique a mudança; o avanço não pode diminuir nem reiniciar sem aviso.
- **SENÃO** indicador indeterminado.

## Quando usar

- Total de arquivos, itens ou bytes conhecido.
- Avanço calculado com dados reais.
- Tarefa com início, fim e conclusão definidos.
- Processamento demorado com avanço significativo.

## Quando evitar

- Total ou avanço desconhecidos → **use em vez disso:** indicador indeterminado.
- Porcentagem por tempo decorrido → **use em vez disso:** estado "Processando".
- Fases de duração muito desigual → **use em vez disso:** indicador de etapas.
- Operação instantânea → **use em vez disso:** nenhum indicador.

## Faça

- Confirme o total antes de mostrar o número.
- Mantenha o valor estável e arredonde.
- Use rótulo que nomeie a tarefa.
- Comunique conclusão e falha.
- Ofereça saída segura.

## Evite

- Inventar porcentagem ou prometer prazo incerto.
- Reiniciar a barra sem explicação.
- Casas decimais sem medição real.
- Vários indicadores concorrentes.
- Comunicar o estado só por cor ou movimento.

## Acessibilidade

- Rótulo visível e nome acessível para a tarefa (4.1.2).
- Determinado: `role="progressbar"` com `aria-valuemin`, `aria-valuemax` e `aria-valuenow` consistentes com o valor mostrado.
- Indeterminado: omita `aria-valuenow`; não forneça número fictício.
- Atualize via `role="status"` ou `aria-live="polite"`, sem deslocar o foco (4.1.3); use `aria-busy="true"` na região afetada.
- Contraste do indicador (1.4.11) e sem depender só de cor (1.4.1).

## Microcópia

| Situação | Exemplo |
|---|---|
| Determinado | "Enviando arquivos: 4 de 12" |
| Percentual | "Importação em 42%" |
| Indeterminado | "Processando…" |
| Concluído | "Importação concluída: 120 contatos adicionados." |
| Falha | "A importação falhou. Tentar novamente" |

## Checklist de verificação

- [ ] O total é conhecido.
- [ ] O valor vem de dados reais.
- [ ] O valor não diminui nem reinicia sem explicação.
- [ ] O rótulo identifica a tarefa.
- [ ] "4 de 12" foi avaliado como alternativa mais clara.
- [ ] Sem medida confiável, o estado é indeterminado.
- [ ] O resultado final é comunicado.
- [ ] Há saída ou recuperação segura.
- [ ] O progresso é anunciado sem mover o foco.
- [ ] Foi testado com teclado, zoom e leitor de tela.

## Fundamentação

- IBM Carbon (Progress bar): estados determinado e indeterminado, rótulos e valores.
- Padrão Digital GOV.BR (Loading): loading determinado com cancelar e indeterminado sem prometer duração.
- GitHub Primer (ProgressBar): contexto textual como "4 de 12 tarefas".
- W3C ARIA Authoring Practices: aria-valuenow omitido quando o valor é desconhecido.
- WCAG 2.2, 4.1.3: progresso e status sem receber foco.
- Baymard Institute (fluxo de checkout): indicador de etapas deve espelhar o processo real.
- Nielsen Norman Group (indicadores de progresso): visibilidade torna esperas longas compreensíveis.
