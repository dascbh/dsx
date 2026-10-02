# <NomeDoComponente>

<!-- Documentação de componente legível por pessoas e agentes. A seção "Quando NÃO usar" é obrigatória:
componente sem contraindicação é convite ao uso errado. -->

**Status:** experimental | estável | depreciado (substituto: <…>) · **Dono:** <time> · **Desde:** <versão>

## Propósito

<Uma frase: que problema de interface este componente resolve.>

## Quando usar

- <situação>

## Quando NÃO usar

- <situação> → use <alternativa>

## Anatomia

| Parte | Obrigatória | Token(s) |
|---|---|---|
| <container> | sim | `color.bg.surface`, `radius.card`, `space.inset-md` |
| <rótulo> | sim | `color.text.primary`, tipografia `label` |
| <ícone> | não | `color.text.secondary` |

## Variantes

| Variante | Uso | Não combinar com |
|---|---|---|
| <primary> | <ação principal da região, 1 por região> | <outra primary na mesma região> |

## Estados

| Estado | Visual | Comportamento | Implementado |
|---|---|---|---|
| Padrão | | | ✔/✘ |
| Hover | | | |
| Foco visível | anel 2px `color.border.focus`, ≥ 3:1 | | |
| Ativo / pressionado | | | |
| Desabilitado | | explicar o motivo próximo ao controle | |
| Carregando | | bloqueia reenvio, mantém largura | |
| Erro | ícone + texto + cor | `aria-invalid`, mensagem via `aria-describedby` | |
| Vazio | | | |
| Sucesso | | | |

## API

| Prop | Tipo | Padrão | Descrição |
|---|---|---|---|
| <variant> | `'primary' \| 'secondary' \| 'danger'` | `'secondary'` | |

## Acessibilidade

- Elemento nativo / papel ARIA: <…>
- Teclado: <teclas e comportamento>
- Nome acessível: <de onde vem>
- Anúncios dinâmicos: <role="status"/"alert" quando…>
- Critérios WCAG relevantes: <…>

## Conteúdo

- Rótulo: <regra, ex.: verbo + objeto, ≤ 3 palavras>
- Exemplos: "<bom>" · ~~"<ruim>"~~

## Padrões relacionados

- `patterns/<categoria>/<id>.md`

## Changelog

| Versão | Mudança | Migração |
|---|---|---|
| <x.y.z> | <…> | <…> |
