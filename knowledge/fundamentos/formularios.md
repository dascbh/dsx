# Formulários

> **Quando consultar**
> - Ao criar, revisar ou reduzir qualquer formulário: cadastro, checkout, contato, configuração, filtro complexo.
> - Ao decidir rótulo vs. placeholder, momento de validação, posição de erro ou divisão em etapas.
> - Ao escolher o tipo de campo e o teclado móvel para cada dado.
> - Quando há abandono, erros repetidos ou reclamação de "formulário burocrático".

Um bom formulário tem propósito claro, esforço proporcional ao benefício, orientação no momento certo e recuperação simples. Cada campo é um custo para a pessoa.

---

## 1. Estrutura: comece pela tarefa

Antes de desenhar, escreva qual tarefa a pessoa conclui e qual decisão o sistema toma com os dados. Então, para **cada campo**, pergunte:

- Que decisão depende desta informação?
- Dá para obtê-la depois, com contexto e consentimento?
- O campo reduz um risco real ou atende a um hábito interno?
- A pessoa consegue responder sem pesquisar ou interpretar termos técnicos?
- Se o campo sumir, o que deixa de funcionar?

SE a resposta for vaga ENTÃO marque o campo para remoção ou coleta posterior.

**Regras de estrutura**
- Agrupe campos relacionados conforme o modelo mental da pessoa (dados pessoais, endereço, pagamento), com título de grupo quando houver mais de ~5 campos.
- Use **uma coluna** para sequências lineares. Exceção: pares curtos e naturalmente ligados (cidade + UF, validade + CVV).
- Largura do campo sugere o tamanho da resposta (CEP curto, endereço longo).
- Ação principal logo após o último campo, alinhada à coluna de leitura ([action-placement](../../patterns/actions/action-placement.md)).
- Explique por que dados sensíveis são pedidos ("Usamos o telefone só para avisar sobre a entrega").

---

## 2. Ordem dos campos

- Siga a ordem em que a pessoa tem as informações (o que sabe de cabeça primeiro, o que precisa buscar depois) ou a ordem de documentos físicos que ela consulta.
- Do geral ao específico; do menos ao mais sensível.
- Campos que determinam outros vêm antes (país antes de estado; CEP antes de rua, preenchendo o endereço automaticamente: [address-by-postal-code](../../patterns/ecommerce/address-by-postal-code.md)).
- Ordem de tabulação = ordem visual.

Ver [field-order](../../patterns/forms/field-order.md).

---

## 3. Rótulos, ajuda e obrigatoriedade

- Rótulo **visível, persistente e acima do campo** (melhor varredura e funciona em telas estreitas). Placeholder nunca substitui rótulo: some ao digitar, tem contraste baixo e parece valor preenchido ([label-vs-placeholder](../../patterns/forms/label-vs-placeholder.md)).
- Rótulo associado programaticamente ao controle (`<label for>` ou equivalente).
- Texto de ajuda **antes** do erro: formato, exemplo, limite ("Até 10 MB, em PDF ou JPG").
- Marque obrigatoriedade de forma consistente. SE a maioria é obrigatória ENTÃO marque os opcionais com "(opcional)"; SE a maioria é opcional ENTÃO marque os obrigatórios. Asterisco exige legenda e texto acessível ([required-fields](../../patterns/forms/required-fields.md)).
- Requisitos de senha visíveis antes de digitar e atualizados enquanto digita ([password-requirements](../../patterns/authentication/password-requirements.md), [show-password](../../patterns/authentication/show-password.md)).

---

## 4. Tipo de campo

| Resposta | Componente |
|---|---|
| Sim/não com efeito imediato | Toggle |
| Sim/não que vale ao enviar, ou aceite | Checkbox único |
| 2–5 opções exclusivas | Radio visível |
| 6–15 opções exclusivas | Select / dropdown ([dropdown](../../patterns/forms/dropdown.md)) |
| Mais de 15 opções ou valor conhecido de cabeça | Campo com busca/autocomplete |
| Várias opções independentes | Checkboxes |
| Quantidade pequena | Stepper ou campo numérico |
| Data conhecida (nascimento) | Campo de texto com máscara dd/mm/aaaa (calendário só como apoio) |
| Data próxima a escolher (agendamento) | Seletor de calendário |
| Arquivo | Upload com tipos e tamanho aceitos declarados ([file-upload](../../patterns/forms/file-upload.md)) |

**Regras**
- Não use select para 2–3 opções; esconde as alternativas e custa dois cliques.
- Permita digitação manual onde ela é mais rápida que o seletor.
- Pré-selecione um padrão só quando ele é neutro e o mais provável; nunca em consentimento, cobrança extra ou permissão.

---

## 5. Teclados móveis e preenchimento automático

| Dado | `type` | `inputmode` | `autocomplete` |
|---|---|---|---|
| E-mail | `email` | `email` | `email` |
| Telefone | `tel` | `tel` | `tel` |
| CPF, CNPJ, CEP, código de verificação | `text` | `numeric` | `postal-code` (CEP), `one-time-code` (código) |
| Valor monetário | `text` | `decimal` | — |
| Quantidade inteira | `text` ou `number` | `numeric` | — |
| URL | `url` | `url` | `url` |
| Busca | `search` | `search` | `off` quando sugestões próprias |
| Nome | `text` | `text` | `name`, `given-name`, `family-name` |
| Endereço | `text` | `text` | `street-address`, `address-level2` (cidade), `address-level1` (UF) |
| Senha nova / atual | `password` | — | `new-password` / `current-password` |
| Cartão | `text` | `numeric` | `cc-number`, `cc-exp`, `cc-csc`, `cc-name` |

**Regras**
- Não use `type="number"` para identificadores (CPF, CEP, cartão): remove zeros à esquerda e aceita rolagem do mouse.
- Máscaras devem aceitar colagem com ou sem pontuação e não brigar com o cursor.
- Desative autocorreção e capitalização automática em e-mail, usuário e códigos (`autocapitalize="off"`, `spellcheck="false"`).
- Nunca bloqueie colar em senha ou e-mail.
- Ver [autopreenchimento](../../patterns/forms/autofill.md).

---

## 6. Validação

| Momento | Use para |
|---|---|
| Ao sair do campo (blur) | Padrão para formato e consistência |
| Enquanto digita | Só para dar progresso positivo (requisitos de senha cumpridos, contador de caracteres), ou para **remover** um erro já mostrado assim que corrigido |
| Ao enviar | Campos vazios obrigatórios, regras que cruzam campos, validação de servidor |
| Nunca | Acusar erro antes de a pessoa terminar de digitar; validar a cada tecla com mensagem negativa |

**Regras**
- Valide também no servidor; a validação do cliente é conveniência.
- Seja tolerante na entrada: aceite espaços, pontuação e variações e normalize você mesmo.
- Ver [validation-timing](../../patterns/forms/validation-timing.md).

---

## 7. Erros

- Mensagem **junto ao campo**, logo abaixo dele, associada programaticamente (`aria-describedby`), com ícone + texto + cor (nunca só cor: [not-color-alone](../../patterns/accessibility/not-color-alone.md)).
- Ao enviar com erros: resumo no topo com links para cada campo **e** mensagem em cada campo; mova o foco para o resumo ou para o primeiro campo com erro.
- Texto diz como corrigir: "Informe uma data no formato dd/mm/aaaa", não "Data inválida".
- **Preserve tudo** que foi digitado após qualquer falha, inclusive de servidor (exceto senha e dados de cartão quando a política exigir).
- Ver [form-errors](../../patterns/forms/form-errors.md), [error-placement](../../patterns/forms/error-placement.md), [field-error-position](../../patterns/forms/field-error-position.md), [preserve-data-after-error](../../patterns/forms/preserve-data-after-error.md), [helpful-error-message](../../patterns/ux-writing/helpful-error-message.md).

---

## 8. Formulários em várias etapas

**Decisão**
- SE o formulário tem até ~7 campos de um mesmo assunto ENTÃO uma página.
- SE há grupos com objetivos distintos, ramificações condicionais ou mais de ~10–12 campos ENTÃO considere etapas.
- SE cada etapa não tem um objetivo nomeável ENTÃO não divida: dividir só aumenta navegação.

**Regras**
- Indicador de progresso com nome das etapas ("Endereço · Pagamento · Revisão"), não só números.
- 3–5 etapas é o intervalo confortável; mais que isso, revise o escopo.
- "Voltar" preserva os dados; salve o progresso entre etapas.
- Etapa de revisão antes de ações com consequência (pagamento, envio oficial), com "Editar" em cada bloco.
- Não peça na etapa 1 o que só será usado na 4.

Ver [split-form](../../patterns/forms/split-form.md), [form-steps](../../patterns/forms/form-steps.md), [autosave-vs-save](../../patterns/forms/autosave-vs-save.md).

---

## 9. Envio e confirmação

- Botão nomeia a ação ("Solicitar orçamento", "Salvar endereço"), não "Enviar".
- Evite botão desabilitado sem explicação; prefira deixar habilitado e mostrar os erros ao enviar ([disabled-button](../../patterns/actions/disabled-button.md)).
- Após o clique: estado de processamento no botão e bloqueio de envio duplicado ([double-submit](../../patterns/actions/double-submit.md)).
- Após o sucesso: o que foi feito, o que acontece agora e onde acompanhar ([success-confirmation](../../patterns/feedback/success-confirmation.md)).
- Confirmação de senha ou e-mail repetido só quando o erro é caro e não há recuperação fácil ([confirm-password](../../patterns/authentication/confirm-password.md)).

---

## 10. Acessibilidade

- Todo controle tem nome acessível igual ou contendo o rótulo visível.
- Grupos de radio/checkbox em `fieldset` com `legend`.
- Foco visível em todos os campos ([keyboard-focus](../../patterns/accessibility/keyboard-focus.md)); ordem de foco lógica.
- Instruções não dependem só de cor, ícone ou posição ("os campos em vermelho").
- Funciona com teclado, zoom de 200%, leitor de tela e em 320 px de largura.
- Tempo limite de sessão avisado com opção de estender ([session-expired](../../patterns/authentication/session-expired.md)).

---

## 11. Anti-padrões

- Placeholder como rótulo.
- Campos "porque sempre pedimos".
- Validação agressiva a cada tecla.
- Erro só por cor ou só no topo.
- Apagar o formulário após erro.
- Botão desabilitado sem dizer o que falta.
- Consentimento ou serviço extra pré-marcado ([dark-patterns.md](dark-patterns.md)).
- Custos ou termos que só aparecem no último passo.
- Captcha antes de qualquer alternativa menos invasiva.

---

## 12. Métricas

Taxa de início → conclusão; abandono por etapa e por campo; quantidade e tipo de erros de validação; tempo de preenchimento e tempo corrigindo; envios duplicados; contatos de suporte; qualidade do dado recebido. Combine com observação: o funil mostra **onde** se abandona, a conversa mostra **por quê**.

---

## Checklist de auditoria

- [ ] Cada campo tem uma decisão que depende dele; nenhum pode ser coletado depois.
- [ ] Uma coluna para fluxos lineares; grupos com título; ordem lógica igual à ordem de tab.
- [ ] Rótulos visíveis, acima do campo, associados ao controle; placeholder só como exemplo.
- [ ] Formato e requisitos mostrados antes do erro; obrigatório/opcional sinalizado consistentemente.
- [ ] Tipo de campo adequado ao número de opções; nada de select para 2–3 opções.
- [ ] `type`, `inputmode` e `autocomplete` corretos; colar permitido; máscaras tolerantes.
- [ ] Validação no blur ou no envio, nunca acusando erro durante a digitação.
- [ ] Erros junto ao campo, com texto de correção, sem depender de cor; resumo ao enviar; foco movido.
- [ ] Dados preservados após qualquer falha.
- [ ] Etapas só quando cada uma tem objetivo; progresso nomeado; voltar sem perder dados; revisão antes de agir.
- [ ] Botão com verbo + objeto, estado de processamento, sem envio duplicado.
- [ ] Nenhum consentimento, custo ou serviço pré-selecionado ou oculto.
- [ ] Funciona com teclado, leitor de tela, zoom de 200% e 320 px.
