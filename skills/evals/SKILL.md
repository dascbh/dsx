---
name: evals
description: "Cria avaliações repetíveis para UI gerada por agentes e features de IA: casos, gates, limiares, avaliador por critério (código, LLM-juiz, humano) e regressões. Use para medir aderência ao design system ou comparar versões."
---

# Evals de UI e de IA

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `evals/`, `tools/` são relativos a ela.

Referências: `knowledge/ia/evals.md`; rubricas prontas em `evals/rubricas/`; casos de exemplo em `evals/casos/`.

## 1. Comece pela tarefa

Escreva: *quem* usa, *para fazer o quê*, *o que é um resultado bom* — em linguagem de produto. Só depois derive critérios. Métrica escolhida antes da tarefa mede o que é fácil, não o que importa.

## 2. Critérios em quatro tipos (nunca faça média entre tipos)

| Tipo | Papel | Exemplo (UI gerada por agente) |
|---|---|---|
| **Gate** | binário; reprova a versão | zero valores crus; nenhum par de contraste < mínimo; foco visível |
| **Limiar** | mínimo aceitável | nota ≥ 3/4 em "hierarquia visual" |
| **Meta** | otimização contínua | menos componentes novos por tela |
| **Guardrail** | não pode piorar | tempo de geração, tamanho do bundle |

## 3. Avaliador certo para cada critério

- **Código** (preferir sempre que possível): `tools/lint-raw-values.mjs`, `tools/contrast.mjs`, `tools/lint-design-md.mjs`, axe/Playwright, validação de schema, estado final do sistema.
- **LLM-juiz:** critérios abertos (clareza do texto, adequação do padrão de interação). Rubrica com âncoras descritivas por nota e exemplos de aprovado/reprovado; um critério por chamada; peça evidência antes da nota. **Calibre** contra ≥ 20 julgamentos humanos e reporte concordância.
- **Humano:** julgamento de domínio, segurança, casos ambíguos, calibração do juiz.

## 4. Casos

Arquivo JSONL em `evals/casos/` (veja `evals/casos/ui-gerada.jsonl`). Misture:
- **típicos** (o pedido comum),
- **borda** (lista vazia, texto 3× maior, 320px, tema escuro, erro de rede),
- **adversariais** (pedido para usar cor fora da paleta, para "remover o outline", para criar modal para tudo),
- **regressões** (toda falha real vira caso, com o id do incidente).

## 5. Rode e reporte

- **N ≥ 3 tentativas por caso** — sistemas generativos variam; reporte taxa de aprovação e variância, não um único resultado.
- Compare versões (prompt, skill, DESIGN.md, modelo) no **mesmo** conjunto.
- Para RAG: avalie separado recuperação, suficiência do contexto, fidelidade da resposta e acerto da citação.
- Para agentes: avalie trajetória (ferramenta certa, ações proibidas não executadas, confirmação pedida nos riscos altos) **e** estado final.

## Rubricas prontas

- `evals/rubricas/ui-gerada.yaml` — tela gerada por agente dentro do design system.
- `evals/rubricas/design-md.yaml` — qualidade do DESIGN.md (espelha a skill `design-md`).
- `evals/rubricas/feature-ia.yaml` — UX de feature com IA/agente.

## Saída

```
Versão avaliada: …   Conjunto: N casos × K tentativas
Gates: <gate> X/N ✔ …   (qualquer ✘ = reprovado)
Limiares: <critério> média ± dp (mín. exigido)
Metas / guardrails: …
Falhas novas → casos de regressão adicionados: …
Concordância juiz × humano: κ ou % (se houver juiz)
```
