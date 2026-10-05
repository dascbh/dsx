# Elementos de tela comparados entre design systems

> **Quando consultar**
> - Ao decidir o texto, a posição ou o uso de um botão, rótulo de campo, dica (tooltip), título, descrição ou mensagem, e houver mais de uma convenção possível.
> - Ao montar as opções de um levantamento de texto (skill `ux-writing`): cada opção deve dizer de que convenção vem.
> - Quando alguém disser "no sistema X é assim": confira aqui se é convenção geral ou escolha local.

Resumo em redação própria das convenções públicas mais citadas — Material Design 3 (Google), Carbon (IBM), Polaris (Shopify), GOV.UK Design System, Atlassian Design System e Human Interface Guidelines (Apple). As diretrizes mudam; confira a fonte (`fontes-de-ux.md`) antes de citar uma regra como definitiva. A coluna **DSX** é a escolha padrão deste framework para produto em pt-BR; o `UX.md` do projeto pode fixar outra.

## Botão

| Aspecto | Material 3 | Carbon | Polaris | GOV.UK | Atlassian | Apple HIG | DSX |
|---|---|---|---|---|---|---|---|
| Rótulo | curto, diz a ação | 1–3 palavras, verbo | verbo + objeto ("Adicionar produto") | verbo, descreve o que acontece ("Continuar", "Salvar e continuar") | curto, verbo | verbo ou nome curto da ação | **verbo + objeto**, até 4 palavras ("Criar pedido") |
| Caixa | só a primeira maiúscula | só a primeira maiúscula | só a primeira maiúscula | só a primeira maiúscula | só a primeira maiúscula | **cada palavra maiúscula** (inglês) | só a primeira maiúscula; em pt-BR caixa de título soa traduzido |
| Pontuação | sem ponto | sem ponto | sem ponto | sem ponto | sem ponto | sem ponto | sem ponto, sem travessão, sem parêntese |
| Primária por área | uma ação de maior ênfase | uma primária por grupo | uma primária por seção | uma por página (a página faz uma coisa) | uma primária por grupo | uma ação padrão por janela | **uma por região** (regra T1) |
| Ordem no diálogo | confirmar à direita, descartar à esquerda | primária à direita | primária à direita | não usa diálogo como padrão | primária à direita | ação padrão à direita | **Cancelar à esquerda da ação** |
| Rótulos vagos | evita "OK" sem contexto | evita "Sim/Não" | evita "OK"; repete o verbo do título | evita "Clique aqui" | evita "OK" quando há consequência | "OK" só para reconhecer informação | nunca "OK", "Sim", "Confirmar" sozinho em ação com consequência |

**Opções recorrentes** para um botão que leva um nome ("Remover da lista — Ricardo Almeida"):
- A · ícone de remover com nome acessível "Remover Ricardo Almeida" e o nome visível na linha (Carbon, Atlassian: ação por linha);
- B · texto "Remover" na linha, nome no nome acessível (Polaris);
- C · ação em menu da linha "Mais ações ▸ Remover" (Material, quando há várias ações por item).

## Rótulo de campo

| Aspecto | Material 3 | Carbon | Polaris | GOV.UK | Atlassian | Apple HIG | DSX |
|---|---|---|---|---|---|---|---|
| Posição | dentro do campo, sobe ao focar (filled/outlined) | **acima** do campo | acima | **acima**, com dica entre rótulo e campo | acima | à esquerda (formulários de janela) ou acima | **acima** ou flutuante do kit; nunca só placeholder |
| Texto de ajuda | abaixo do campo | abaixo do campo | abaixo do campo | entre rótulo e campo ("dica") | abaixo | abaixo ou rodapé | abaixo, uma frase, só se mudar o que a pessoa digita |
| Obrigatório × opcional | asterisco nos obrigatórios | "(opcional)" nos opcionais | "(opcional)" | **"(opcional)"**; obrigatório é o padrão | asterisco | varia | uma convenção por formulário (o `UX.md` fixa) |
| Pontuação | sem dois-pontos | sem dois-pontos | sem dois-pontos | sem dois-pontos | sem dois-pontos | dois-pontos em rótulo à esquerda | sem dois-pontos |

## Dica (tooltip)

| Aspecto | Material 3 | Carbon | Polaris | GOV.UK | Atlassian | Apple HIG | DSX |
|---|---|---|---|---|---|---|---|
| Para quê | nomear ícone; complemento breve | definição curta ou rótulo de ícone | rótulo de ícone, informação extra não essencial | **evita** dica; usa texto visível ou "detalhes" expansível | rótulo de ícone, atalho de teclado | nomear controle sem texto | nomear botão só de ícone; nunca informação essencial |
| Tamanho | poucas palavras | 1 frase curta | 1 frase | — | poucas palavras | poucas palavras | até ~8 palavras; explicação longa vira texto de ajuda visível |
| Repetir o rótulo | não | não | não | — | não | não | não (regra X7) |
| Em controle desabilitado | evita | evita | evita | — | evita | evita | não: explique o bloqueio em texto visível |

## Título e descrição

| Aspecto | Material 3 | Carbon | Polaris | GOV.UK | Atlassian | Apple HIG | DSX |
|---|---|---|---|---|---|---|---|
| Título de página | um, curto, diz onde se está | um por página | nome do objeto ou da tarefa | **um h1 por página**, a pergunta ou a tarefa | um | título da janela | um `h1`, sem separador composto ("X — Y" vira título + contexto abaixo) |
| Título de diálogo | diz a ação ou a pergunta | diz a ação | verbo do botão principal repetido ("Excluir produto?" → "Excluir") | — | diz a ação | diz a ação | pergunta ou ação + objeto ("Excluir o pedido?") e botão com o mesmo verbo |
| Descrição sob o título | opcional, curta | opcional | só se acrescentar | conteúdo antes do formulário, curto | opcional | opcional | **só se acrescentar** algo que o título não diz; nunca reformular o título (regra X3) |
| Caixa | primeira maiúscula | primeira maiúscula | primeira maiúscula | primeira maiúscula | primeira maiúscula | cada palavra maiúscula (títulos, inglês) | primeira maiúscula |

## Mensagens (erro, vazio, alerta)

| Aspecto | Convergência entre os sistemas | DSX |
|---|---|---|
| Erro de campo | junto ao campo, diz o que fazer ("Informe a data do contrato") | igual; sem "inválido" sozinho |
| Erro de sistema | diz o que aconteceu, o que a pessoa pode fazer e se o dado foi preservado | igual; sem código técnico sozinho |
| Estado vazio | diz o que aparecerá ali e a primeira ação | igual; uma ação, não duas primárias |
| Alerta | um por região, tom proporcional ao risco | igual; cor nunca é o único sinal |

## Checklist

- [ ] Cada opção oferecida num levantamento diz de que convenção vem (ou "escolha do produto").
- [ ] O `UX.md` do projeto fixa uma opção por aspecto (posição do rótulo, obrigatório × opcional, ordem no diálogo).
- [ ] Texto visível sem travessão, sem título composto, sem parêntese explicativo, sem ponto final em botão (ver `marcas-de-texto-gerado.md`).
