---
name: arranjar-tela
description: "Propõe 2–3 arranjos para uma tela, nova ou existente, a partir do arquétipo e suas variações; mostra no Stitch ao lado da tela atual capturada do código, o dono escolhe e a tela é construída e reverificada. Use para rearranjar, reorganizar ou montar o layout de uma tela."
argument-hint: "<rota, arquivo da tela ou descrição da tela nova>"
---

# Arranjar tela

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `arquetipos/` são relativos a ela; caminhos sem prefixo (`UX.md`, `DESIGN.md`, `.dsx/`, `.stitch/`, `src/`) são do projeto do usuário.

**Arranjo** = onde cada coisa da tela fica (regiões, ação primária, filtros, painel), não a aparência. A aparência continua no `DESIGN.md`. Esta skill não escolhe pelo dono: mostra opções comparáveis, com o custo de cada uma, e constrói a escolhida.

## 1. Enquadre a tela

1. Leia o `UX.md` do projeto (se existir) e o `DESIGN.md`. Sem `UX.md`, siga com o que o código mostra e sugira a skill `ux-md` no fim.
2. Escreva em 3 linhas: **para quem**, **tarefa principal** (início e fim) e **frequência**. Para tela existente, use o mapa de fluxo (`.dsx/mapas/fluxos-<modulo>.json`) para saber de onde a pessoa chega e para onde vai.
3. **Identifique o arquétipo.** SE a tela está na seção "Arquétipos de tela" do `UX.md` → ENTÃO use esse. SENÃO leia o `quando-usar`/`evitar-quando` dos cartões de `arquetipos/` e escolha pelo tipo de tarefa. SE duas tarefas de tipos diferentes disputam a tela → ENTÃO diga isso antes de arranjar; separar pode ser a melhor proposta.
4. Leia `arquetipos/<id>.md` inteiro: regiões, ação primária, estados, padrões, **variações** e anti-padrões.

## 2. Diagnostique a tela atual (só tela existente)

1. Capture a tela pelo código com a skill de captura do projeto (ex.: `code-to-stitch`), nos estados que importam (com dados, vazio, erro).
2. Rode o gate objetivo sobre a captura e guarde a saída:
   ```bash
   node <DSX>/tools/ux-lint/tela.mjs <captura.html> --ux UX.md
   ```
3. Liste o que a tela atual faz contra o cartão: região que falta ou sobra, primária fora do lugar, estado ausente, anti-padrão presente. Cada item cita a regra T* do ux-lint ou o item do cartão.

## 3. Proponha 2–3 arranjos

Parta das **variações** do cartão (e dos desvios já declarados no `UX.md`). Para cada arranjo, entregue:

| Campo | Conteúdo |
|---|---|
| Nome | o da variação no cartão, ou "atual ajustado" |
| Mapa de regiões | diagrama ASCII curto |
| Favorece | a tarefa ou persona que ganha (ex.: tratar lote de 40 itens) |
| Piora | o custo honesto (ex.: detalhe exige um clique a mais) |
| Resolve | regras T* e itens do diagnóstico que deixam de falhar |
| Fere o UX.md? | política que precisaria mudar (registre como desvio se o dono escolher) |

Regras: no máximo 3 arranjos; um deles pode ser "atual com ajustes mínimos" quando a tela existente está perto do cartão; nunca proponha arranjo que viole `acoes.primarias-por-regiao`, os estados obrigatórios ou acessibilidade.

## 4. Mostre no Stitch

Use a skill `stitch` (e as oficiais para a mecânica).

1. **Tela existente:** suba a captura do código como tela "Atual". **Nunca gere a tela atual por texto** (`generate_screen_from_text`): o texto reinterpreta e a comparação perde valor.
2. **Arranjos:** podem ser gerados ou editados no Stitch, porque são propostas. Parta da tela atual (edição) quando ela existe, para isolar a mudança de arranjo; use o design system sincronizado do `DESIGN.md`.
3. Critique cada arranjo com o passo de crítica da skill `stitch` (`tools/stitch/analisar-html.mjs`) antes de mostrar.
4. Apresente lado a lado: Atual | Arranjo 1 | Arranjo 2 (| Arranjo 3), com a tabela do passo 3 abaixo.

## 5. Peça a escolha ao dono

Pergunte qual arranjo seguir, em uma mensagem, com a recomendação e o motivo em uma frase. Não construa antes da resposta. SE o dono pede mistura de dois → ENTÃO descreva o arranjo resultante e confirme. SE a escolha fere o `UX.md` → ENTÃO registre o desvio na seção 5 (ou proponha mudar a política) na mesma entrega.

## 6. Construa e reverifique

1. Construa com a skill `construir-ui` (componentes e tokens do projeto; o HTML do Stitch é referência, nunca código colado).
2. Recapture a tela e rode de novo:
   ```bash
   node <DSX>/tools/ux-lint/tela.mjs <captura-nova.html> --ux UX.md
   ```
   Nenhum achado novo; os achados que o arranjo prometia resolver sumiram.
3. Atualize o `UX.md` se a tela mudou de arquétipo, variação ou desvio, e rode `node <DSX>/tools/lint-ux-md.mjs UX.md`.

## Saída

```
Tela: … | Arquétipo: … | Tarefa: …
Diagnóstico: <achados com regra/cartão>
Arranjos: 1 … (favorece/piora/resolve) · 2 … · 3 …
Stitch: <projeto/telas>
Escolha do dono: … | Desvio registrado: …
Reverificação: ux-lint antes N achados → depois M; lint-ux-md OK
```

## Checklist

- [ ] Arquétipo identificado pela tarefa e cartão lido.
- [ ] Tela atual veio da captura do código, não de texto.
- [ ] 2–3 arranjos, cada um com favorece, piora e regras que resolve.
- [ ] Escolha do dono registrada antes de construir.
- [ ] ux-lint de tela rodado depois; `UX.md` atualizado se mudou o arquétipo ou o desvio.


## Lições do piloto (AURIS, editor de minuta, 2026-10-02)

- **`edit_screens` sobre a captura do código é o melhor caminho para arranjos de tela existente:** o Stitch edita o próprio HTML com operações de DOM e mantém o CSS real do produto — o arranjo sai com a cara do produto, não reinterpretado.
- **Sempre edite uma cópia:** às vezes a edição altera a tela de origem no lugar. Envie a captura uma vez como "Atual" e uma cópia por arranjo ("Arranjo N · base"); peça no prompt "crie uma NOVA versão".
- Telas criadas por edição podem não ter posição no canvas: crie a instância (`PATCH …?updateMask=screenInstances`) ao organizar a linha "Atual · Arranjo 1 · Arranjo 2 · Arranjo 3".
- **Reverifique cada arranjo com `tools/ux-lint/tela.mjs`** baixando o HTML gerado: a proposta deve zerar os achados que motivaram o rearranjo e não criar outros (no piloto, um arranjo resolveu T1/T3 e criou um T4 — campo de seleção sem rótulo).
- Olhe a captura inteira: ação primária no rodapé de um painel com rolagem pode ficar abaixo da dobra; na construção, fixe o rodapé.
