---
name: figma-vez
description: "Lê ou troca de quem é a vez no ciclo com o Figma (code, design, applying), validando o que a troca exige. Use ao passar o arquivo para o design ou ao fechar uma rodada de refino."
argument-hint: "[code|design|applying]"
---

# figma-vez — ler ou trocar a vez

> **Raiz do DSX:** dois níveis acima do diretório base desta skill. Caminhos `knowledge/`, `patterns/`, `tools/`, `templates/` são relativos a ela; caminhos sem prefixo (`design/`, `.dsx/`, `src/`) são do projeto do usuário.

Leia ou troque a vez no registro de sincronia (`design/figma-sync.md` ou
equivalente — o hook `turn-guard` também aceita o mesmo
`figma-sync.md` numa pasta `design` dentro de `docs`, ou `.figma-sync.md` na raiz). Doutrina na skill `figma-ciclo`.

O registro aceita os nomes antigos em português (`vez:` no lugar de `turn:`;
`codigo` → `code`, `aplicando` → `applying`) com o aviso "nome antigo,
renomeie para X". Ao escrever, grave sempre `turn:` com o valor novo
(`code | design | applying`). O argumento também aceita `codigo` e `aplicando`.

**Sem argumento**: diga de quem é a vez, desde quando, e o que isso proíbe agora
(tabela "A regra" da skill `figma-ciclo`). Se `## Pendentes` tiver itens,
diga também — é a informação que distingue "pode seguir" de "volte e termine".
Se não houver registro, diga isso: sem vez escrita, ninguém sabe de quem é a
vez, e a resposta correta é perguntar antes de escrever em qualquer um dos lados
(`/dsx:figma-iniciar` cria o registro).

**Com argumento**, valide antes de escrever — a troca tem pré-requisito:

| para | exige |
|---|---|
| `design` | baseline atual comitado em `design/figma-baseline/` (senão o diff da volta não tem "antes") **e** `## Pendentes` vazio no registro — baseline comitado prova que existe um "antes" contra o qual diferenciar, não que esta rodada terminou o que se propôs a construir |
| `applying` | relatório de diff produzido (`/dsx:figma-diff`) e revisado |
| `code` | rodada fechada: aplicadas e recusadas registradas (com o gate que travou cada recusada), baseline regerado, uma linha nova em `design/figma-changelog.jsonl`, achados salvos em `design/figma-findings/<rodada>.md` se houver |

Se o pré-requisito não estiver cumprido, **não troque**: diga o que falta. Trocar
a vez sem baseline é o jeito silencioso de perder o refino do design na rodada
seguinte; trocar para `design` com itens em `## Pendentes` é o jeito silencioso
de fazer uma rodada inacabada parecer fechada — a próxima pessoa a abrir o
arquivo (ou a próxima sessão do agente) não tem como distinguir "pode refinar"
de "volte e termine isto primeiro". Se pedirem para trocar para `design` mesmo
assim com itens em `## Pendentes`, diga isso explicitamente e pergunte se esses
itens estão de fato prontos (mova-os para o registro de aplicadas/cobertas da
rodada) ou se saíram de escopo agora (mova-os para `## Divergências conhecidas`,
com motivo) — não troque em silêncio em nenhum dos dois casos.

Como verificar o baseline sem adivinhar:

```bash
git status --short design/figma-baseline/      # vazio = nada pendente de commit
git log -1 --format='%h %ad %s' -- design/figma-baseline/
```

Registre a data da troca no campo `desde:` e uma linha do que aconteceu na seção
`## Rodadas`.

Nova vez: $ARGUMENTS
