# Referências de DESIGN.md

Conteúdo de **terceiros**, guardado para consulta e como ponto de partida da skill `escolher-ds`. Não é texto do DSX: a regra de redação própria do repositório não se aplica aqui, e nada desta pasta deve ser editado à mão (regenere com `tools/referencias.mjs`).

| Arquivo | O que é |
|---|---|
| `indice.json` | Metadados dos 759 estilos da biblioteca designmd.app (título, descrição, categoria, caso de uso, época, estilo, palavras-chave, URL) + classificação do DSX (`dsx.registro`, `dsx.tema`, `dsx.experimental`) |
| `curados.json` | Os 40 estilos selecionados para produto, com nota do DSX (0–100), contagem de tokens e defeitos (contraste reprovado, erros, avisos) |
| `designmd-app/<slug>.md` | O DESIGN.md completo de cada curado, sem alterações, com a linha de crédito no fim |

## Licença e crédito

Os arquivos da biblioteca designmd.app (https://designmd.app/library) estão sob **Creative Commons Attribution 4.0 International (CC BY 4.0)**: podem ser copiados, modificados e usados, inclusive comercialmente, desde que se credite designmd.app e se mantenham as notas de autoria e licença. Cada cópia aqui termina com essa nota; todo DESIGN.md derivado deve mantê-la.

Vários estilos são inspirados em design systems de empresas reais (nomes como Polaris, Primer, Carbon, Airbnb). Use-os como estudo de estrutura; não leve marca, cor ou tipografia proprietária de terceiros para o produto.

## Como foi feita a curadoria

1. Índice completo pela API pública (`node tools/referencias.mjs indice`).
2. Triagem: ~60 candidatos de registro `operacional`, `consumo` e `editorial`, sem marca `experimental`.
3. Avaliação (`node tools/referencias.mjs curar`): linter do DSX (erro −15, aviso −3), contraste texto/fundo de cada componente (< 4,5:1 −15) e completude (componentes, ≥ 4 cores, ≥ 3 estilos de texto).
4. Ficaram os 40 de maior nota. Cinco deles têm o botão primário com contraste reprovado e foram mantidos por cobrirem consumo; aparecem em `curados.json` com o defeito e só podem ser usados com a correção.

Atualizar: `node tools/referencias.mjs indice` (metadados) · `node tools/referencias.mjs baixar <slug>` (novo curado) · `node tools/referencias.mjs curar` (reavaliar).
