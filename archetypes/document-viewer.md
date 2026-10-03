---
id: document-viewer
title: Documento com visor
summary: Tela de leitura de um documento pronto (contrato, parecer, PDF enviado) com metadados e ações ao lado, sem edição do conteúdo.
register: [operational, editorial]
when-to-use: SE a pessoa precisa ler, conferir ou despachar um documento que não edita nesta tela ENTÃO use documento com visor
avoid-when: a pessoa vai alterar o texto (use editor com painel), o documento é curto o bastante para caber num painel lateral ou a tarefa é comparar muitos documentos ao mesmo tempo
regions: [page-header, viewer-toolbar, viewer, info-panel]
primary-action: { region: page-header, position: top-right, max: 1 }
states: [loading, processing, error, no-access, unavailable, success]
patterns: [breadcrumbs, tabs, long-loading, skeleton-screen, link-in-new-tab, icon-only-button, temporary-failure, retry, disabled-button]
variations: [viewer-with-right-panel, fullscreen-viewer, side-by-side-comparison]
rules: [T1, T3, T6, T7, F5]
---

# Documento com visor

O documento é o protagonista: a versão assinada de um contrato, um PDF enviado por terceiro, um parecer final. A pessoa lê, confere dados contra metadados, baixa, encaminha ou registra uma decisão. A tela não edita o texto — e deixa isso claro para ninguém procurar o cursor.

## Quando usar

- **SE** o conteúdo é um arquivo ou versão fechada (assinada, enviada, congelada) **ENTÃO** use documento com visor, e diga no cabeçalho que é somente leitura e por quê.
- **SE** a pessoa confere o documento contra dados estruturados (partes, valores, datas) **ENTÃO** esses dados ficam no `info-panel`, lado a lado com o texto.
- **SE** o documento tem várias versões **ENTÃO** a versão exibida aparece no cabeçalho, e trocar de versão é uma ação explícita no painel — nunca um visor que muda sozinho.
- **SE** a pessoa precisa alterar o texto **ENTÃO** ofereça "Editar" que leva ao `editor-with-panel` (ou "Criar nova versão" quando a atual está congelada).
- **SE** a tarefa é comparar duas versões **ENTÃO** use a variação `side-by-side-comparison`.
- **SENÃO** (documento curto, consulta rápida a partir de uma lista) **ENTÃO** `detail-side-panel` resolve.

## Mapa de regiões

```
┌──────────────────────────────────────────────────────────────┐
│ page-header  ‹ Contratos / Título do documento (h1)            │
│   Versão 3 · assinada em 12/03 · somente leitura [Ação prim.] │
├───────────────────────────────────────────┬──────────────────┤
│ viewer-toolbar  ‹ 2/14 › · − 100% + · ⌕   │ painel-de-       │
├───────────────────────────────────────────┤ informacoes      │
│ viewer                                    │ Partes           │
│  ┌─────────────────────────────────┐      │ Valor · Vigência │
│  │  página do documento            │      │ Versões          │
│  │                                 │      │ Histórico        │
│  └─────────────────────────────────┘      │                  │
└───────────────────────────────────────────┴──────────────────┘
```

## O que vai em cada região

- **page-header** — caminho de volta (trilha ou "‹ Voltar para …"), título do documento como `h1`, linha de estado (versão, situação, data, "somente leitura"), ação primária e até duas secundárias (baixar, compartilhar).
- **viewer-toolbar** — navegação de páginas com "página X de Y", zoom, busca no texto, alternar tela cheia. Controles só com ícone precisam de nome acessível e dica.
- **viewer** — o documento em largura de leitura confortável; rolagem própria; texto selecionável quando o formato permite. Destaques da busca visíveis, com contagem.
- **info-panel** — dados estruturados para conferência, lista de versões com a atual marcada, histórico de eventos. Se tiver mais de três blocos, use abas no painel ("Dados", "Versões", "Histórico").

## Ações

- **Primária:** uma, no `page-header`, top-right — o próximo passo do ciclo do documento ("Enviar para assinatura", "Registrar recebimento"). Se não há próximo passo, a primária pode ser "Baixar".
- **Secundárias:** baixar, imprimir, copiar link — com ênfase menor; "abrir em nova aba" avisa que abre em nova aba.
- **Indisponíveis:** ação que depende de estado ("Enviar" em documento ainda processando) aparece desabilitada com o motivo visível.
- **Edição:** nunca editável no visor; "Editar" ou "Criar nova versão" leva a outra tela.

## Estados

- **loading** — esqueleto da página no visor e do painel; cabeçalho com título já visível.
- **processing** — arquivo enviado ainda sendo convertido ou analisado: diga o que está acontecendo, há quanto tempo e se a pessoa pode sair e voltar; nada de spinner mudo por minutos.
- **error** — falha ao abrir: alerta no visor com "Tentar novamente" e "Baixar arquivo original" quando possível; o painel continua útil.
- **no-access** — sem permissão para este documento: tela explica e indica a quem pedir; nenhum trecho do conteúdo vaza no título.
- **unavailable** — o documento existia e foi removido, substituído ou expirou: diga qual, quando, e leve à versão vigente se houver.
- **success** — depois de uma ação (enviado, registrado): confirmação breve e a linha de estado do cabeçalho atualizada.

## Variações

### viewer-with-right-panel
Visor ocupa ~70% e o painel de informações fica fixo à direita.
**Favorece:** conferência de dados contra o texto; despacho rápido.
**Piora:** documentos largos (planilhas, plantas) ficam pequenos; em telas médias o painel precisa recolher.

### fullscreen-viewer
Painel recolhido; visor ocupa a tela; cabeçalho reduzido a título e "Sair da tela cheia".
**Favorece:** leitura longa e atenta, apresentação em reunião.
**Piora:** some o contexto (versão, dados); a primária fica a um clique de distância.

### side-by-side-comparison
Dois visores sincronizados (versão anterior × atual), com diferenças destacadas e navegação "próxima diferença".
**Favorece:** revisão de alterações entre versões, conferência de aditivos.
**Piora:** exige largura; diferenças só por cor reprovam — use também marcação de inserção/remoção em texto; rolagem sincronizada precisa poder ser desligada.

## Anti-padrões

- Visor que parece editável (cursor de texto, barra de formatação) num documento congelado.
- Trocar a versão exibida sem a pessoa pedir.
- Spinner indefinido durante processamento longo.
- Controles de zoom e página só com ícone, sem nome acessível.
- Título genérico ("Documento") em vez do nome do documento.
- Sem caminho de volta para a lista de onde a pessoa veio.

## Checklist

- [ ] `h1` com o nome do documento; versão e situação visíveis no cabeçalho.
- [ ] "Somente leitura" explícito quando aplicável, com caminho para editar ou criar nova versão.
- [ ] Uma primária no cabeçalho; ações de visor com nome acessível.
- [ ] Processamento longo com mensagem, tempo e possibilidade de sair.
- [ ] Erro do visor não derruba o painel; oferta de baixar o original.
- [ ] Caminho de volta visível.
