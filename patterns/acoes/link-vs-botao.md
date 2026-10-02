---
id: link-vs-botao
titulo: Link ou botão: qual usar?
categoria: acoes
componentes: [link, botao]
tipo: recomendacao
impacto: alto
status: recomendado
evidencia: forte
wcag: ["4.1.2", "2.1.1", "2.4.4", "2.4.7", "1.3.1"]
relacionados: [texto-de-link, texto-de-botao, link-em-nova-aba, icone-sem-texto]
---

# Link ou botão: qual usar?

> **Regra:** Se a pessoa é levada a outro lugar, use link (`<a href>`); se algo acontece no ponto em que ela está, use botão (`<button>`). Defina a semântica antes do visual.

## Contexto

Link e botão podem ter estilo semelhante, mas o visual não determina o comportamento. O link leva a um destino com URL; o botão dispara uma ação na página, num formulário ou em outro componente.

Trocar a semântica por conveniência de estilo ou de script elimina comportamentos esperados: abrir em outra aba, copiar o endereço, acessar o menu de contexto, reagir às teclas corretas e ser lido com o papel certo pelos leitores de tela.

Classifique a intenção da interação primeiro. A aparência vem depois e pode ser invertida sem trocar o elemento.

## Decisão

- **SE** existe um destino representável por URL (página, seção, arquivo, e-mail, telefone) **ENTÃO** use `<a href>`.
- **SE** a interação envia, salva, exclui, abre modal ou menu, expande, alterna estado ou executa operação **ENTÃO** use `<button>`.
- **SE** a navegação é a chamada principal **ENTÃO** mantenha `<a>` e estilize como botão.
- **SE** a ação é secundária **ENTÃO** mantenha `<button>` e estilize de forma discreta.
- **SE** o botão está dentro de um formulário **ENTÃO** use `type="submit"` para enviar e `type="button"` para o que não deve enviar.
- **SE** um componente visual recebe URL **ENTÃO** renderize link por baixo; **SE** dispara ação **ENTÃO** renderize botão.
- **SENÃO** (dúvida) pergunte: "isso muda de lugar ou muda algo aqui?"

## Quando usar

- Link: outra página, seção da mesma página, documento, download, e-mail, telefone.
- Botão: enviar, salvar, excluir, abrir modal ou menu, expandir, alternar.

## Quando evitar

- Botão com JavaScript para navegar → **use em vez disso:** `<a href>`.
- Link com `href="#"` para executar ação → **use em vez disso:** `<button>`.
- `role="button"` ou `role="link"` como primeira opção → **use em vez disso:** elemento nativo.
- Escolher o elemento pelo visual → **use em vez disso:** escolher pela intenção.

## Faça

- Defina "destino ou ação" antes de escolher o componente.
- Escreva texto que diga o destino ou o resultado.
- Preserve foco visível, estados e feedback.
- Teste copiar endereço, abrir em nova aba e menu de contexto nos links.
- Teste o botão com Enter e Espaço.

## Evite

- Usar div ou span clicável no lugar de elemento nativo.
- Remover o contorno de foco para esconder a diferença.
- Rótulos vagos como "clique aqui" ou "enviar" sem contexto.
- Diferenciar link e botão só por cor ou formato.

## Acessibilidade

- Elementos nativos expõem nome, papel, estado e teclado (4.1.2, 2.1.1).
- Link ativa com Enter; botão com Enter e Espaço.
- O propósito do link deve ser compreensível fora do parágrafo (2.4.4).
- Foco visível (2.4.7) e ordem lógica.
- Controles customizados inevitáveis exigem nome, papel, estado e teclas testados com tecnologia assistiva.

## Microcópia

| Situação | Exemplo |
|---|---|
| Link de destino | "Ver política de reembolso" |
| Botão de ação | "Salvar alterações" |
| Link com aparência de botão | "Ir para o painel" |
| Botão que abre modal | "Adicionar membro" |
| Evitar | "Clique aqui" |

## Checklist de verificação

- [ ] A interação foi classificada como destino ou ação.
- [ ] O elemento HTML corresponde a essa intenção.
- [ ] Todo link tem `href` com destino real.
- [ ] Todo botão tem o `type` correto.
- [ ] O texto informa destino ou resultado.
- [ ] O controle funciona por teclado.
- [ ] Links mantêm copiar, nova aba e menu de contexto.
- [ ] Nenhum link usa `href="#"` para ação.
- [ ] O foco é visível.
- [ ] A aparência não contradiz a semântica.

## Fundamentação

- MDN Web Docs (elementos a e button): hiperlink com href, uso de type e substituição de links falsos por botão.
- W3C WAI-ARIA APG (Link Pattern) e técnica H91: preferir elementos nativos; role não traz comportamento de navegação.
- GitHub Primer (Links and buttons): navegação versus ação; link com aparência de botão continua link.
- Adobe Spectrum (Link, Button): links em texto corrido, hierarquia visual de botões.
- Padrão Digital GOV.BR (Button): teclado, foco, área de toque e tag button.
