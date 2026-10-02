---
id: upload-de-arquivos
titulo: Como projetar uma boa experiência de envio de arquivos?
categoria: formularios
componentes: [input-de-arquivo, area-de-arrastar-e-soltar, lista-de-arquivos, barra-de-progresso]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["3.3.2", "3.3.1", "2.1.1", "4.1.3", "1.4.1"]
relacionados: [erros-em-formularios, tentar-novamente, carregamento-longo, porcentagem-de-progresso, preservar-dados-apos-erro]
---

# Como projetar uma boa experiência de envio de arquivos?

> **Regra:** Mostre formatos e limites antes da seleção, use botão nativo acessível (arrastar e soltar é só alternativa), exiba o estado de cada arquivo e explique como corrigir cada falha.

## Contexto

Enviar um arquivo implica escolher um item fora da interface, checar restrições, aguardar o processamento e perceber quando acabou. Sem dados sobre formatos, limites, progresso e erros, a pessoa seleciona o arquivo errado, repete a ação ou perde o trabalho.

Uma boa experiência torna os requisitos visíveis antes da escolha, oferece botão acessível, permite arrastar e soltar como conveniência, mostra o estado por arquivo e dá caminho de recuperação.

Os padrões documentados em design systems são soluções de implementação, não regra universal. A escolha considera tipo e tamanho do arquivo, conexão, dispositivo, importância da tarefa e sensibilidade dos dados.

## Decisão

- **SE** o documento é necessário à tarefa **ENTÃO** ofereça botão claro de seleção baseado em input nativo de arquivo.
- **SE** há restrições **ENTÃO** informe antes da escolha: formatos aceitos, tamanho máximo, quantidade, obrigatoriedade e finalidade (se houver dúvida).
- **SE** arrastar e soltar agrega conveniência **ENTÃO** ofereça-o como alternativa, nunca como único caminho.
- **SE** um arquivo é selecionado **ENTÃO** mostre nome, tamanho e, quando útil, miniatura; permita remover ou substituir sem reiniciar o formulário.
- **SE** o envio é assíncrono **ENTÃO** mostre estados distintos: enviando, concluído, rejeitado, interrompido e com erro.
- **SE** vários arquivos são aceitos **ENTÃO** mostre o resultado de cada um separadamente; um inválido não esconde os demais.
- **SE** um arquivo falha **ENTÃO** explique o motivo e ofereça tentar de novo ou escolher outro, sem apagar os válidos.
- **SE** usa o atributo `accept` **ENTÃO** trate-o só como orientação e valide tipo real, tamanho, autorização e conteúdo no servidor.
- **SENÃO** não exija upload que a tarefa não precisa.

## Quando usar

- Documentos necessários para concluir a tarefa.
- Envio de um ou vários arquivos.
- Processamento demorado.
- Formatos ou tamanhos limitados.
- Arquivos que podem falhar individualmente.

## Quando evitar

- Documento não necessário → **use em vez disso:** remover o campo.
- Restrições não explicadas → **use em vez disso:** texto de ajuda visível antes da seleção.
- Sem progresso nem resultado → **use em vez disso:** estados por arquivo.
- Muitos arquivos em modal estreito → **use em vez disso:** página ou painel amplo.
- Arrastar e soltar como único caminho → **use em vez disso:** botão mais arrastar.

## Faça

- Explique formatos e limites.
- Mostre os arquivos selecionados e o progresso.
- Permita remover e substituir.
- Explique cada erro com a correção.
- Valide também no servidor.

## Evite

- Esconder limites.
- Feedback genérico como "Erro no envio".
- Bloquear a tela sem necessidade.
- Apagar arquivos válidos por causa de um inválido.
- Aceitar tipo apenas pela extensão do nome.
- Depender só da validação do navegador.

## Acessibilidade

- `<label>` associado ao `input type="file"`; seleção possível por teclado (2.1.1).
- Requisitos em texto, associados ao campo (3.3.2); sucesso e erro não dependem só de cor ou ícone (1.4.1).
- Anuncie arquivo selecionado, envio concluído e falha como mensagens de status (4.1.3); evite anunciar cada pequeno avanço de progresso.
- Foco previsível ao fechar o seletor; remover e substituir com nome acessível e teclado.
- Erros identificados em texto com a correção (3.3.1).

## Microcópia

| Situação | Exemplo |
|---|---|
| Requisitos | "PDF, JPG ou PNG, até 10 MB. Máximo de 3 arquivos." |
| Botão | "Escolher arquivo" |
| Alternativa | "ou arraste e solte aqui" |
| Progresso | "Enviando contrato.pdf…" |
| Erro de tamanho | "contrato.pdf tem 14 MB. O limite é 10 MB. Escolha um arquivo menor." |
| Tentar de novo | "Tentar novamente" |

## Checklist de verificação

- [ ] Formatos aceitos estão descritos antes da seleção.
- [ ] Tamanho máximo e quantidade estão informados.
- [ ] Existe botão acessível para selecionar arquivos.
- [ ] Arrastar e soltar é só alternativa.
- [ ] Cada arquivo selecionado é identificado e tem estado próprio.
- [ ] É possível remover ou substituir um arquivo.
- [ ] Cada erro explica como corrigir e há nova tentativa.
- [ ] A seleção funciona com teclado.
- [ ] Mudanças de estado chegam a tecnologias assistivas.
- [ ] A validação também ocorre no servidor.

## Fundamentação

- W3C WAI (tutorial de formulários) e WCAG 2.2, critério 3.3.2: rótulos, instruções, validação e feedback com controles nativos.
- MDN (atributo accept): orienta o seletor, não substitui validação no servidor.
- OWASP (File Upload Cheat Sheet): tipo, tamanho, autorização, armazenamento seguro e análise de conteúdo.
- IBM Carbon, Shopify Polaris, U.S. Web Design System: botão, drop zone, estados, remoção e erro; referências de implementação.
- Padrão Digital de Governo (GOV.BR), Upload e Loading: clique, arrastar, múltiplos arquivos e processamento.
- Baymard Institute (formulários): redução de atrito em tarefas críticas; generalização limitada para uploads.
