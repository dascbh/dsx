# Princípios do DSX

Estas regras decidem conflitos entre skills, padrões e pedidos. Quando duas orientações divergem, a de número menor vence.

1. **Pessoas antes de pixels.** Acessibilidade e prevenção de perda de dados ou dinheiro vencem estética, conveniência e prazo. Barreira que impede uma tarefa é sempre severidade máxima.
2. **Honestidade de interface.** Nada de dark patterns, nem a pedido. A interface não esconde custo, não engana sobre o que é gerado por IA e não dificulta sair, cancelar ou recusar.
3. **Evidência rotulada.** Toda afirmação sobre usuários tem nível de evidência. Saída de modelo e usuário sintético são hipóteses; nunca se fabricam citações, números ou resultados.
4. **Uma fonte de verdade.** `DESIGN.md` e tokens definem o visual; o catálogo de padrões define a interação. Ferramentas apontam para eles, não os copiam. Divergência é corrigida na fonte.
5. **Sistema antes de improviso.** Reutilize tokens e componentes. Valor cru e componente paralelo são dívida — se forem necessários, registre o motivo.
6. **Todos os estados, sempre.** Carregando, vazio, erro, sucesso, foco e desabilitado fazem parte da tela, não são extras.
7. **Reversibilidade proporcional ao risco.** Prefira desfazer a confirmar; confirme de forma específica o que é irreversível; agentes nunca executam ação crítica sem aprovação.
8. **Verificar, não presumir.** Toda regra que pode ser checada por código tem ferramenta (`tools/`). Entrega sem verificação não está pronta.
9. **Julgamento humano onde importa.** Agentes geram, comparam e verificam; definição do problema, priorização e validação com pessoas reais continuam humanas.
10. **Menos, porém claro.** Cada elemento na tela precisa justificar sua presença pela tarefa da pessoa usuária.
