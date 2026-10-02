---
id: campos-obrigatorios
titulo: Como indicar corretamente campos obrigatórios?
categoria: formularios
componentes: [campo-de-texto, label, fieldset, legend, formulario]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["3.3.2", "1.3.1", "1.4.1", "4.1.2"]
relacionados: [label-vs-placeholder, erros-em-formularios, ordem-dos-campos, momento-da-validacao]
---

# Como indicar corretamente campos obrigatórios?

> **Regra:** Marque a obrigatoriedade em texto no rótulo, com uma única convenção por formulário, e exponha o estado também de forma programática.

## Contexto

A pessoa precisa saber, antes de enviar, quais campos são necessários. Um campo marcado só de vermelho, com símbolo sem legenda ou sem indicação para tecnologia assistiva pode parecer opcional.

Sinalizar cedo evita envios incompletos e idas e vindas para corrigir. Uma convenção clara também ajuda quem usa zoom, leitor de tela ou comando de voz a compreender a tarefa antes de tocar em cada campo.

Antes de marcar, pergunte se o campo precisa existir: exigir dado que a tarefa não usa é o pior caso.

## Decisão

- **SE** quase todos os campos são obrigatórios **ENTÃO** marque os opcionais com "(opcional)" e diga no topo que os demais são obrigatórios.
- **SE** a maioria é opcional **ENTÃO** marque os obrigatórios com "(obrigatório)".
- **SE** todos são obrigatórios **ENTÃO** informe isso uma vez no subtítulo e não marque campo a campo.
- **SE** usar asterisco **ENTÃO** explique o significado no início do formulário e exponha o estado também em texto ou atributo.
- **SE** o campo é obrigatório **ENTÃO** aplique `required` (ou `aria-required`) e associe o rótulo ao campo.
- **SE** um grupo de opções é obrigatório **ENTÃO** use `fieldset` e `legend` e marque a legenda.
- **SE** o dado não é necessário para a tarefa **ENTÃO** remova o campo.
- **SENÃO** use "(obrigatório)" no rótulo, a convenção mais explícita.

## Quando usar

- Formulários com campos obrigatórios e opcionais.
- Grupos de opções obrigatórias.
- Formulários longos ou críticos.
- Interfaces usadas com teclado ou leitor de tela.

## Quando evitar

- Obrigatoriedade só pela cor → **use em vez disso:** texto no rótulo.
- Asterisco sem legenda → **use em vez disso:** legenda explícita ou texto.
- Convenções misturadas (obrigatório e opcional ao mesmo tempo) → **use em vez disso:** uma só convenção.
- Regra escondida no placeholder → **use em vez disso:** rótulo visível.

## Faça

- Escolha uma convenção e aplique em todo o produto.
- Associe cada rótulo ao seu campo.
- Teste a leitura com leitor de tela.

## Evite

- Marcar campos sem validação correspondente.
- Exigir dados que a tarefa não usa.
- Usar asterisco para indicar campo opcional.
- Marcar quase todos os campos quando a exceção é pequena.

## Acessibilidade

- Rótulos ou instruções para entrada de dados (3.3.2); indicação no rótulo ou na legenda do grupo (técnica H90).
- Estado obrigatório exposto programaticamente (`required`), não só visualmente (1.3.1, 4.1.2).
- Não dependa só de cor (1.4.1).
- Teste rótulo, indicação e instruções com teclado, zoom e leitor de tela.

## Microcópia

| Situação | Exemplo |
|---|---|
| Campo obrigatório | "Nome completo (obrigatório)" |
| Campo opcional | "Telefone (opcional)" |
| Todos obrigatórios | "Todos os campos são obrigatórios." |
| Legenda de asterisco | "* Campo obrigatório" |

## Checklist de verificação

- [ ] Todos os campos obrigatórios estão identificados em texto.
- [ ] Há uma única convenção no formulário.
- [ ] A convenção está explicada quando usa asterisco.
- [ ] A indicação não depende só de cor.
- [ ] O atributo `required` (ou equivalente) está presente.
- [ ] Cada rótulo está associado ao seu campo.
- [ ] Grupos de opções usam `fieldset` e `legend`.
- [ ] Nenhum campo exige dado desnecessário.

## Fundamentação

- WCAG 2.2, critério 3.3.2 (Labels or Instructions): rótulos ou instruções, o que inclui marcar os campos obrigatórios.
- W3C, técnica H90: indicar obrigatoriedade no rótulo ou na legenda.
- Material Design 3 (text fields): asterisco no rótulo com explicação em texto auxiliar.
- Padrão Digital de Governo (GOV.BR), formulário e input: "(obrigatório)" ou "(opcional)" no rótulo, uma convenção por formulário.
- U.S. Web Design System (Form): indicar obrigatório ou opcional e usar `required`.
- Adobe Spectrum (Field label): marcar só a minoria e explicar o asterisco.
- AMAWeb (checklist e manual de acessibilidade): não indicar obrigatório só pela cor.
