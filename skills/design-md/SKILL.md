---
name: design-md
description: Cria, atualiza ou avalia o DESIGN.md de um projeto — o arquivo que traduz a linguagem visual (tokens, tipografia, layout, componentes, estados, faça/não faça) em contexto legível por agentes. Três modos — extrair de um produto/código existente, definir para projeto novo, ou auditar um DESIGN.md existente com rubrica de 100 pontos e gates de reprovação. Use quando o projeto não tiver DESIGN.md, quando agentes gerarem UI inconsistente, quando os tokens mudarem, ou quando pedirem para "avaliar/validar/melhorar o DESIGN.md".
---

# DESIGN.md: criar, atualizar, avaliar

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `templates/`, `tools/`, `examples/` são relativos a ela.

Referência completa: `knowledge/design-system/design-md.md`. Template: `templates/DESIGN.md`. Exemplo preenchido e aprovado: `examples/DESIGN.md`.

**Princípio:** o valor do arquivo está no que ele **impede o agente de adivinhar**. Valor sem intenção é metade do trabalho: o YAML diz *o quê*, a prosa diz *quando, por que e onde não usar*.

## Escolha o modo

- Não existe DESIGN.md e há produto/código → **Modo A: extrair**
- Não existe DESIGN.md e o projeto é novo → **Modo B: definir**
- Existe DESIGN.md → **Modo C: avaliar** (e depois corrigir as lacunas)

## Modo A — Extrair de produto existente

1. **Inventário real**: se `.dsx/mapas/design-system.json` existir (skill `mapear`), parta dele — já traz tokens por adaptador (MUI, Tailwind v3/v4, CSS vars, DTCG), valores em uso, `hazards[]` de drift e um rascunho de front matter. Senão, delegue ao subagente `extrator-design-system`. Levante: fonte de tokens (CSS vars, tema Tailwind/MUI, `*.tokens.json`), cores efetivamente usadas (conte ocorrências), escalas de fonte/espaço/raio, componentes compartilhados e seus estados.
2. **Nomeie por papel, não por aparência**: `primary`, `text-secondary`, `danger` — nunca `blue-500` no front matter. Valores usados uma única vez são candidatos a drift, não a token.
3. **Escreva a prosa com evidência**: para cada regra, de onde ela veio (arquivo, tela). Marque com `(inferido)` tudo o que você deduziu sem ver explicitamente.
4. **Faça/Não faça a partir de erros reais**: inconsistências encontradas no inventário viram "Não faça".
5. **Pergunte ao usuário** só o que o código não responde: personalidade, densidade-alvo, o que nunca pode acontecer.
6. Valide (passo "Validação" abaixo).

## Modo B — Definir para projeto novo

1. Entreviste em uma rodada: tipo de produto e uso (tarefa x vitrine), público e contexto de uso (mobile em trânsito? desktop 8h/dia?), densidade, 1 cor de marca, tom de voz.
2. Gere a base com as ferramentas (detalhes na skill `tokens`):
   ```bash
   node tools/palette.mjs "<cor-da-marca>" --format dtcg
   node tools/type-scale.mjs --base 16 --ratio major-third   # 1.2 para denso; 1.333 para editorial
   node tools/spacing-scale.mjs --base 4
   ```
3. Atribua papéis semânticos e verifique **cada par texto/fundo** com `tools/contrast.mjs` **antes** de escrever o arquivo.
4. Preencha `templates/DESIGN.md` inteiro. Nenhuma seção pode ficar só com comentário.

## Regras de escrita (valem para A e B)

- Troque adjetivos por critérios observáveis: ~~"moderno e clean"~~ → "no máximo uma cor de destaque por viewport; hierarquia por tipografia e espaço; sem sombra em cards".
- Cores: tabela **Papel | Token | Onde aparece | Onde NUNCA aparece**.
- Tipografia: regras de **hierarquia** ("h1 é o título único da página"), não só tamanhos.
- Componentes: variantes + **todos os estados** (padrão, hover, foco, ativo, desabilitado, carregando, erro, vazio, sucesso) + contraindicações.
- Acessibilidade: números (contraste, alvo de toque, zoom), nunca "deve ser acessível".
- Inclua a seção **Agent Instructions**: *quando* consultar, *o que* preservar, *como* validar.
- Não invente componentes que não existem em produção. Não contradiga os tokens.

## Modo C — Avaliar (rubrica de 100 pontos)

**Passo 1 — Gates objetivos (automáticos):**
```bash
node tools/lint-design-md.mjs DESIGN.md
```
Qualquer ERRO reprova, independentemente da nota.

**Passo 2 — Gates de julgamento** (reprovação automática se qualquer um falhar):
1. Contradiz o produto/tokens reais sem justificativa registrada.
2. Pares essenciais de cor abaixo do mínimo WCAG.
3. O arquivo não chega ao contexto do agente (não está referenciado em CLAUDE.md/AGENTS.md/regras da ferramenta).
4. Instruções conflitantes para o mesmo contexto (ex.: DESIGN.md diz uma coisa, `.cursor/rules` diz outra).

**Passo 3 — Nota**, com evidência por critério:

| Critério | Peso | Pergunta |
|---|---:|---|
| Fidelidade à fonte | 15 | Tokens e componentes correspondem ao produto (amostre 5 telas/arquivos)? |
| Validade técnica | 10 | Passa no linter, referências resolvem? |
| Tokens semânticos | 10 | Nomes por função, escalas coerentes, sem duplicação? |
| Intenção e prosa | 15 | A prosa explica decisões que o valor sozinho não explica? |
| Componentes e estados | 15 | Componentes centrais têm variantes e todos os estados? |
| Acessibilidade | 15 | Regras verificáveis com números? |
| Responsividade | 8 | Mobile, conteúdo longo, vazio/erro/carregando? |
| Guardrails | 5 | "Não faça" específicos, ligados a erros reais? |
| Operação com agente | 4 | Comprovadamente carregado no contexto do agente? |
| Manutenção | 3 | Dono, data, rotina de revisão? |

Faixas: **90–100** robusto · **75–89** utilizável com lacunas · **60–74** revisar antes de virar autoridade · **< 60** alto risco (o agente vai inventar decisões centrais).

**Passo 4 — Geração controlada** (teste de aceitação): peça uma tela nova usando só o DESIGN.md e o código do projeto. Liste o que o agente teve de inventar (cor, espaçamento, estado, componente). Cada invenção é uma lacuna do arquivo.

**Saída do Modo C:**
```
Gates: lint ✔/✘ · fidelidade ✔/✘ · contraste ✔/✘ · conexão ✔/✘ · conflitos ✔/✘
Nota: NN/100 (faixa)
Por critério: <critério> NN/peso — evidência
Lacunas reveladas na geração controlada: …
Correções priorizadas (máx. 7): …
```

## Validação (todos os modos)

1. `node tools/lint-design-md.mjs DESIGN.md` sem erros.
2. Se o projeto usa tokens DTCG: `node tools/build-tokens.mjs` sem falhas de contraste, e os valores do front matter batem com `tokens/build/*.json`.
3. Conecte ao agente — a skill `iniciar` faz isso; mínimo: uma linha em `CLAUDE.md`/`AGENTS.md` dizendo "Antes de qualquer mudança de interface, leia `DESIGN.md`".
4. Registre `owner` e `updated` no front matter.
