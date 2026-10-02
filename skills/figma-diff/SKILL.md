---
name: figma-diff
description: "Tira o retrato atual do arquivo do Figma e compara com o baseline versionado, gerando o relatório já classificado em token, primitivo e composição. Use para ver o que mudou no Figma antes de trazer para o código."
argument-hint: "[páginas ou frames a limitar, opcional]"
---

# figma-diff — o que mudou no Figma desde o baseline

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

Produza o relatório de diff do arquivo do Figma. Mecanismo em
[../figma-ciclo/references/diff.md](../figma-ciclo/references/diff.md).

Antes de começar, leia `design/figma-sync.md` (o arquivo e o baseline de
registro) e a última linha de `design/figma-changelog.jsonl` — o `resumo` e a
`direcao` da última rodada, e o ponteiro para os achados que talvez já expliquem
algo que pareceria divergência nova. Diff é leitura: roda em qualquer vez,
inclusive `design` — o hook `guarda-vez` deixa passar o que não escreve no
arquivo.

1. **Fase 1 — hashes.** Cole `tools/figma/snapshot.js` com `MODE = 'hashes'`
   num `use_figma` (carregue a skill `figma-use` antes). Resposta pequena.
   Compare cada `frames[chave].hash` com o do baseline.
2. **Fase 2 — detalhe.** Só nos frames cujo hash difere do baseline: rode de
   novo com `MODE = 'full'` e `TARGETS` preenchido com esses frames (aceita
   `"Página › Frame"` ou só o nome do frame). Salve o retorno em arquivo
   temporário. Se a resposta truncar por tamanho, divida `TARGETS` em lotes
   menores e junte os `frames` num só JSON.
3. **Comparação.**

```bash
node <DSX>/tools/figma/diff-baseline.cjs design/figma-baseline/<arquivo>.json /tmp/atual.json
```

O script é `.cjs` de propósito (o `package.json` do DSX é `"type": "module"`) e
aceita baselines do fluxo anterior com chaves em pt-BR. Se o baseline foi tirado
só com hashes, os frames alterados aparecem em "Mudaram, mas o baseline não tem
detalhe" — é o sinal para detalhar com `TARGETS` nesta rodada e regerar o
baseline completo desses frames ao fechar.

Entregue o relatório ao usuário **sem aplicar nada** e aponte, em uma linha, o
que é `token` (afeta o app inteiro — exige varredura nos dois temas), o que é
`primitivo` (≥ 2 frames — aplica uma vez no componente compartilhado) e o que é
`composição` (1 frame). Se aparecer a seção "Possível problema de
nomenclatura", diga: é a convenção `Tipo · instância` violada, e o diff está
deixando de agrupar um primitivo por isso (skill `figma-convencoes`). Se houver
frames novos, lembre que tela nova não é mudança — a triagem está em
`figma-trazer`. Mudança em massa `FRAME`→`INSTANCE` é componentização automática
do MCP: ruído, não decisão de design.

Quando o inventário ou o diff forem grandes o bastante para poluir a conversa,
delegue as duas fases e a comparação ao agente `leitor-figma` e traga só o
relatório.

Escopo opcional: $ARGUMENTS
