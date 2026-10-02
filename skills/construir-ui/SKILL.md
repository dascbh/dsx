---
name: construir-ui
description: Constrói ou altera interface (página, componente, formulário, tabela, modal, dashboard) DENTRO do design system do projeto — lê o DESIGN.md e os tokens, reutiliza componentes existentes, aplica os padrões de interação do catálogo, implementa todos os estados (vazio, carregando, erro, sucesso, foco, desabilitado) e verifica contraste, valores crus e acessibilidade antes de entregar. Use sempre que for escrever ou modificar código de UI, quando a tela "não parece profissional", destoa do resto do app ou foi feita sem sistema.
---

# Construir UI dentro do sistema

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Todos os caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` abaixo são relativos a ela. Caminhos sem prefixo (`DESIGN.md`, `src/`) são do projeto do usuário.

O objetivo não é "uma tela bonita", é **uma tela que parece ter sido feita pelo mesmo time que fez o resto do produto** e que funciona em todos os estados, para todas as pessoas.

## 0. Pré-condições

1. Procure `DESIGN.md` na raiz do projeto. **Se não existir**, pare e rode a skill `iniciar` (ou `design-md` no modo "extrair do código"). Construir sem fonte visual é a principal causa de drift.
2. Localize a fonte de tokens (CSS variables, tema do Tailwind, `tokens/*.json`, tema MUI…) e a pasta de componentes compartilhados. Anote os caminhos.
3. Se existirem mapas do projeto (`.dsx/mapas/`, gerados pela skill `mapear`), leia os relevantes antes de desenhar: `fluxos.json` (de onde a tela é alcançada e para onde leva), `tarefas.json` (passos e dependências), `dominio.json` (de onde vêm os dados, cardinalidades), `jornada.json` (persona e momento). Itens em `uncertain` não são fato — confirme com o usuário ou rode `confirmar-mapas`.
4. Se o projeto mantém o ciclo com o Figma (`design/figma-sync.md` existe) e a vez é `design`, **não altere as telas que estão em refino** sem combinar — a mudança vai colidir com a próxima volta (skill `figma-vez`). Ao concluir com vez `codigo`, as telas tocadas entram no próximo reespelho incremental (`figma-espelhar`).
5. Se a tela vem do Stitch (`.stitch/designs/<slug>.html|png`), ela é **referência de layout e conteúdo**, não código: siga o modo "Trazer" da skill `stitch` (cores mapeadas por papel, componentes do projeto, correções que a crítica apontou).
6. Se a tarefa for uma feature nova sem problema definido ("faz uma tela de X"), pergunte **para quem** e **qual tarefa** a tela resolve antes de desenhar. Uma frase basta.

## 1. Descoberta antes de escrever código

Faça este inventário **antes** de criar qualquer arquivo:

- [ ] Quais componentes existentes resolvem partes da tela? (busque por nome: `Button`, `Input`, `Dialog`, `Table`, `EmptyState`, `Skeleton`, `Toast`…)
- [ ] Existe tela semelhante no produto? Abra-a: ela define layout, posição de ações e densidade que você deve repetir.
- [ ] Quais decisões de interação a tela exige? Para cada uma, consulte o catálogo `patterns/README.md` (ou `patterns/index.json`) — exemplos: modal ou página? toast ou inline? paginação ou "carregar mais"? tabela ou cards? quando validar o campo?

Registre as decisões numa lista curta (`decisão → padrão aplicado`). Ela entra no relatório final.

## 2. Regras de construção

**Tokens**
- Use **somente tokens semânticos** (`--color-text-primary`, `--space-stack-md`). Nunca primitivos (`--color-brand-600`) em componente, nunca valor cru (`#5754ed`, `13px`).
- Se faltar um token, **não invente valor**: proponha o token novo (nome + papel + valor + contraste) no relatório e use o mais próximo existente.

**Componentes**
- Reutilize. Só crie componente novo se nenhum existente servir **e** explique por quê.
- Variante nova de componente existente exige justificativa registrada (seção Components do DESIGN.md).

**Layout e hierarquia** (detalhes: `knowledge/fundamentos/hierarquia-visual.md`, `knowledge/design-system/espacamento-e-layout.md`)
- Um `h1` por página. Hierarquia por tamanho/peso/espaço antes de cor/caixas.
- Uma ação primária por região. Posição consistente com telas do mesmo tipo (`patterns/acoes/posicao-de-acoes.md`, `patterns/acoes/hierarquia-de-botoes.md`).
- Espaçamento só da escala; agrupe por proximidade (Gestalt).
- Texto corrido ≤ 68ch.

**Formulários** (`knowledge/fundamentos/formularios.md`)
- Rótulo visível sempre; placeholder nunca substitui rótulo.
- Validação ao sair do campo ou ao enviar; erro junto ao campo + resumo no topo se houver vários; nunca apagar o que a pessoa digitou.
- Não desabilite o botão de envio para "evitar erro" — `patterns/acoes/botao-desabilitado.md`.

**Texto** — siga `skills/ux-writing/SKILL.md`: botões com verbo + objeto, erros que dizem o que houve e como resolver, vocabulário igual ao do resto do produto.

## 3. Estados obrigatórios

Toda superfície que recebe dados ou ação implementa:

| Estado | Padrão de referência |
|---|---|
| Carregando | `patterns/feedback/skeleton-vs-spinner.md`, `patterns/feedback/carregamento-longo.md` |
| Vazio (primeiro uso, sem resultado, limpo pelo usuário) | `patterns/feedback/estado-vazio.md`, `patterns/busca-filtros/busca-sem-resultados.md` |
| Erro (validação, falha temporária, permissão) | `patterns/formularios/erros-em-formularios.md`, `patterns/feedback/falha-temporaria.md`, `patterns/feedback/tentar-novamente.md` |
| Sucesso | `patterns/feedback/confirmacao-de-sucesso.md`, `patterns/feedback/toast-alerta-inline.md` |
| Envio em andamento | `patterns/acoes/clique-duplo-em-envio.md` |
| Interativos: hover, foco visível, ativo, desabilitado | `patterns/acessibilidade/foco-de-teclado.md` |

Se o projeto tiver tema escuro, verifique os dois temas.

## 4. Verificação antes de entregar

Rode e corrija até passar:

```bash
node <DSX>/tools/lint-raw-values.mjs <pastas-alteradas>     # zero valores crus
node <DSX>/tools/contrast.mjs "<texto>" "<fundo>"           # para cada par novo de cor
node <DSX>/tools/lint-design-md.mjs DESIGN.md               # se você alterou o DESIGN.md
```

Se houver app rodando, abra a tela (navegador ou screenshot) e confira: largura 320px, zoom 200%, navegação só por teclado (Tab/Shift+Tab/Enter/Esc), tema escuro.

Checklist mínimo de acessibilidade (completo em `skills/acessibilidade/SKILL.md`):
- [ ] Todo controle tem nome acessível; ícone sem texto tem `aria-label`.
- [ ] Ordem de foco segue a ordem visual; foco nunca fica escondido.
- [ ] Alvo de toque ≥ 24px (padrão 44px).
- [ ] Erro comunicado por texto + ícone, não só cor; ligado ao campo por `aria-describedby`.
- [ ] Mudanças dinâmicas importantes anunciadas (`role="status"` / `role="alert"`).

## 5. Relatório de entrega

Termine com, no máximo, 15 linhas:

```
Componentes reutilizados: …
Componentes/variantes novos (com motivo): …
Tokens usados: … | Tokens propostos: …
Decisões de interação: <decisão> → <padrão>
Estados implementados: carregando ✔ vazio ✔ erro ✔ sucesso ✔ foco ✔ …
Verificações: lint-raw-values 0 ocorrências · contraste OK · teclado OK · 320px OK
Pendências / riscos: …
```

Para uma segunda opinião independente, peça ao subagente `revisor-ux` que revise a tela **sem** receber seu raciocínio.
