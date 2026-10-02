---
id: autosave-vs-salvar
titulo: Autosave ou botão Salvar?
categoria: formularios
componentes: [formulario, editor, botao, indicador-de-estado]
tipo: decisao-contextual
impacto: alto
status: usar-com-cautela
evidencia: moderada
wcag: ["4.1.3", "3.3.4", "2.1.1"]
relacionados: [desfazer, preservar-dados-apos-erro, tentar-novamente, confirmar-acao]
---

# Autosave ou botão Salvar?

> **Regra:** Use autosave só para mudanças independentes, de baixo risco e reversíveis, sempre com estado de salvamento visível; use botão explícito quando houver revisão, transação ou efeito externo.

## Contexto

Ao alterar um campo, o sistema decide se grava na hora ou espera uma ação explícita. Essa escolha define o que a pessoa entende como concluído, o que ela pode desfazer e o que acontece quando sai da tela.

Autosave e botão Salvar não são a versão moderna e a antiga de uma mesma solução: expressam modelos de compromisso distintos. O ponto central não é a contagem de cliques, e sim o intervalo entre o estado real do sistema e o modelo mental da pessoa.

Sem feedback, ela não sabe se a mudança foi salva, está pendente ou já disparou efeitos em outras partes do produto.

## Decisão

- **SE** a alteração é independente das demais, de baixo risco e reversível **ENTÃO** use autosave por campo.
- **SE** a tarefa é longa ou frequente e perder trabalho é custoso **ENTÃO** use autosave de rascunho.
- **SE** vários campos precisam ser revisados ou aplicados juntos **ENTÃO** use botão Salvar.
- **SE** a mudança tem efeito financeiro, legal, de segurança, privacidade ou publicação **ENTÃO** exija ação explícita (Salvar, Aplicar, Publicar).
- **SE** cada gravação pode disparar workflow, notificação ou auditoria **ENTÃO** não use autosave.
- **SE** há rascunho e versão final **ENTÃO** combine: autosave do rascunho e botão para o compromisso final.
- **SE** usar autosave **ENTÃO** mostre "Salvando", "Salvo" e falha perto do conteúdo, e ofereça desfazer ou reverter.
- **SE** usar botão **ENTÃO** avise ao sair com alterações pendentes, com opções salvar, descartar ou cancelar a saída.
- **SENÃO** use botão Salvar, que é o modelo mais previsível.

## Quando usar

- Autosave: configurações independentes, editores de rascunho, formulários longos de campos isolados.
- Botão Salvar: grupos de campos interdependentes, transações, publicações, dados sensíveis.
- Combinação: editor com rascunho automático e publicação manual.

## Quando evitar

- Autosave silencioso → **use em vez disso:** indicador de estado visível.
- Autosave de formulário transacional inteiro → **use em vez disso:** botão com revisão.
- Autosave de senha, permissão ou dado financeiro → **use em vez disso:** etapa explícita.
- Botão Salvar escondido ou sem aviso ao sair → **use em vez disso:** botão visível e proteção de saída.
- Mesmos rótulos para Salvar, Aplicar e Publicar → **use em vez disso:** verbos distintos por consequência.

## Faça

- Defina o que "salvar" significa em cada tela e mantenha consistência entre telas equivalentes.
- Defina um gatilho de envio coerente (ao sair do campo ou após pausa) sem prometer intervalo universal.
- Confirme no servidor antes de exibir "Salvo".
- Preserve alterações pendentes quando o salvamento falhar.

## Evite

- Toast breve para falha que exige ação.
- Aplicar automaticamente mudança de alto risco ou difícil de reverter.
- Salvar grupo incompleto de campos como versão final.
- Esconder efeitos imediatos como cobrança, envio ou mudança de permissão.

## Acessibilidade

- O estado de salvamento deve ser texto, não só cor ou animação.
- Exponha atualizações dinâmicas como mensagem de status sem mover o foco (4.1.3).
- Falhas que exigem ação ficam em alerta persistente com "Tentar novamente".
- Salvar, Descartar, Desfazer e Tentar novamente funcionam por teclado, com foco visível.
- Autosave não substitui validação nem confirmação exigida pelo risco (3.3.4).

## Microcópia

| Situação | Exemplo |
|---|---|
| Em andamento | "Salvando…" |
| Sucesso | "Alteração salva" |
| Falha | "Não foi possível salvar. Suas alterações estão preservadas." |
| Ação de falha | "Tentar novamente" |
| Saída com pendência | "Você tem alterações não salvas. Salvar, descartar ou continuar editando?" |

## Checklist de verificação

- [ ] A tela mostra se a alteração está salvando, salva ou pendente.
- [ ] O comportamento é igual em telas equivalentes.
- [ ] Autosave só é usado em mudanças individuais, de baixo risco e reversíveis.
- [ ] Campos que precisam ser aplicados juntos usam botão.
- [ ] Nenhum autosave dispara efeito financeiro, de segurança, privacidade ou publicação.
- [ ] Existe desfazer, reverter ou histórico.
- [ ] Falha de salvamento fica visível e permite tentar de novo.
- [ ] Sair com pendência oferece salvar, descartar ou cancelar.
- [ ] "Salvo" só aparece após confirmação do servidor.

## Fundamentação

- Nielsen Norman Group (eficiência versus expectativas): remover o Salvar reduz a sensação de controle; com autosave, comunique o estado e permita reverter.
- Nielsen Norman Group (Cancel vs Close): distinguir fechar, cancelar, salvar e descartar com trabalho em andamento.
- GitLab Pajamas (salvamento e feedback): autosave por campo, status inline, retry e cautela com dados sensíveis; diretriz contextual.
- Microsoft Power Apps (autosave em apps orientados a modelo): estado visível e alerta de que automações disparam a cada gravação.
- Documentação técnica de autosave em editor colaborativo: confirmação no servidor e risco de versões obsoletas.
- WCAG 2.2, critério 4.1.3: mensagens de status sem roubo de foco.
