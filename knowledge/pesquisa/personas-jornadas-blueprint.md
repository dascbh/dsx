# Personas, mapa de empatia, jornada e service blueprint

## Quando consultar

- Ao criar, revisar ou questionar personas.
- Ao sintetizar pesquisa num mapa de empatia.
- Ao mapear a jornada de uma pessoa até um objetivo.
- Ao investigar problemas que nascem nos bastidores (atrasos, retrabalho, repasses entre equipes) com service blueprint.
- Quando alguém pedir "gera umas personas" ou "faz um mapa de jornada" sem pesquisa por trás.

Regra-mãe: estes artefatos são **sínteses de evidência**, não métodos de coleta. Feitos sem pesquisa, são hipóteses e devem ser rotulados assim.

## 1. Personas baseadas em evidência

Persona é um arquétipo que comunica padrões de comportamento, objetivos e contexto de um grupo real de usuários. Serve para alinhar o time e priorizar.

Tipos:

| Tipo | Base | Uso |
|---|---|---|
| Proto-persona | Dados existentes + conhecimento do time | Ponto de partida barato. **Rotular como hipótese** |
| Qualitativa | Entrevistas, observação, testes | Padrão recomendado |
| Estatística | Quali + segmentação quantitativa em escala | Quando é preciso dimensionar segmentos |

Persona de **usuário** (quem opera) é diferente de persona de **comprador** (quem decide a compra). Em B2B, normalmente há as duas, e às vezes um administrador.

Passo a passo:

1. Defina o objetivo e a decisão que as personas vão apoiar.
2. Colete dados qualitativos e comportamentais (entrevistas + analytics).
3. Organize em fatos, padrões, motivações e interpretações.
4. Agrupe por **variáveis comportamentais** (frequência, objetivo, nível de experiência, forma de decidir, contexto de uso), não por demografia.
5. Verifique os padrões com nova evidência (entrevistas de acompanhamento, observação, survey).
6. Documente poucas personas, tipicamente 3 a 5. Muitas dispersam o foco.
7. Marque data, base de evidência (n, fontes) e lacunas. Revise periodicamente: com mais frequência em mercados voláteis, pelo menos uma vez ao ano como padrão.

Regras:

- **SE** a persona não tem fonte declarada **ENTÃO** ela é proto-persona; diga isso no título.
- **SE** um atributo demográfico não muda comportamento **ENTÃO** remova-o; ele só cria estereótipo.
- **SE** duas personas se comportam igual diante das decisões do produto **ENTÃO** funda as duas.
- A citação representativa deve ser **real**, de participante identificado por pseudônimo. Nunca invente.
- Foto de banco de imagens e nome fictício são opcionais; o padrão comportamental é obrigatório.

Personas sintéticas (geradas por LLM):

- Servem para levantar hipóteses, imaginar casos extremos e gerar roteiros e casos de teste.
- **Não** servem para "entrevistar", validar conceitos, dar nota SUS ou substituir participantes.
- Toda saída deve levar o rótulo `HIPÓTESE — persona sintética, não validada`.

Template: `templates/persona.md`.

## 2. Mapa de empatia

Ferramenta de síntese para condensar o que se sabe sobre uma pessoa num contexto. Pule se só adicionar cerimônia.

Quadrantes clássicos: **Diz** · **Pensa** · **Faz** · **Sente**. Versão estendida acrescenta contexto, dores e ganhos.

Regras de preenchimento:

| Quadrante | Conteúdo | Marcação |
|---|---|---|
| Diz | Citação literal | Com fonte (P04, 12:30) |
| Faz | Comportamento observado, específico | Com fonte |
| Pensa | Inferência | Marcar "inferência" |
| Sente | Emoção e o gatilho que a provocou | Marcar se foi relatado ou inferido |

Passo a passo: pessoa e contexto específicos ("gestor financeiro aprovando pagamento urgente pelo celular") → objetivo do mapa → evidências reunidas antes → contribuição individual antes da discussão → preencher → buscar padrões → **destacar contradições** (diz que confia, mas sempre confere: confere o quê, exatamente?) → listar lacunas como próximas perguntas de pesquisa → registrar data, segmento e fontes.

Um mapa por pessoa/contexto. Fundir perfis diferentes num mapa só apaga os padrões.

## 3. Mapa de jornada

Visualiza o caminho de uma pessoa até um objetivo, combinando ações com pensamentos, emoções e pontos de contato. Seu maior valor é alinhar a organização em torno de um entendimento comum.

Componentes:

1. **Ator**: uma persona por mapa, baseada em pesquisa.
2. **Cenário e expectativas**: situação real (produto existente) ou projetada (produto novo).
3. **Fases**: de 3 a 7, nomeadas do ponto de vista da pessoa (descobrir → avaliar → contratar → usar → pedir ajuda).
4. **Ações, pensamentos e emoções** por fase, com citações reais e uma curva emocional.
5. **Oportunidades**, cada uma com dono, métrica e evidência.

Template (texto):

```
Ator: <persona>   Cenário: <situação e objetivo>   Expectativas: <o que espera>
Status: <atual | futuro>   Base: <estudos, n, período>

| | <Fase 1> | <Fase 2> | <Fase 3> | <Fase 4> |
|---|---|---|---|---|
| Ações | | | | |
| Pensamentos/perguntas (citações com fonte) | | | | |
| Emoção (−2 a +2) | | | | |
| Pontos de contato | | | | |
| Dores (com evidência) | | | | |
| Oportunidades | | | | |

Oportunidades: <descrição> | dono <nome/papel> | métrica <indicador> | evidência <IDs>
```

Regras:

- **SE** a emoção ou o pensamento não foi observado nem relatado **ENTÃO** marque como hipótese.
- **SE** o mapa tem várias personas misturadas **ENTÃO** separe.
- **SE** a oportunidade não tem dono **ENTÃO** ela não vai acontecer; defina um.
- Mantenha o nível narrativo; detalhe de clique pertence ao fluxo de tarefa.
- Date o mapa e revise quando o serviço mudar.

Relacionados: **experience map** (mais abstrato, independe de produto); **service blueprint** (acrescenta operação interna); **story map** (planejamento de entrega).

## 4. Service blueprint

Liga as ações do cliente aos pontos de contato, equipes, operações e sistemas que entregam o serviço. Muitos problemas percebidos pelo cliente nascem fora do canal visível.

Camadas:

1. **Ações do cliente** (verbos: buscar, solicitar, enviar, esperar, receber, avaliar).
2. **Evidências** físicas e digitais (telas, mensagens, e-mails, comprovantes).
3. **Palco**: ações visíveis da organização (atendente, interface, automação).
4. **Bastidor**: ações invisíveis (triagem, aprovação, conferência, atualização de cadastro).
5. **Processos de apoio**: sistemas, integrações, áreas internas, fornecedores.

Linhas separadoras: **interação** (cliente × organização), **visibilidade** (palco × bastidor), **interação interna** (bastidor × apoio).

Quando usar: serviço existente com atrasos, contradições, retrabalho, repasses ou troca de canal; serviço novo, como hipótese operacional; alinhamento entre várias áreas.

Passo a passo:

1. Escopo estreito: um cenário, uma persona, início e fim, uma pergunta ("por que tantas solicitações são reabertas?").
2. Colete dados com clientes **e com a linha de frente**: tickets, métricas, documentação, tempos.
3. Ações do cliente em sequência.
4. Pontos de contato e evidências.
5. Palco e bastidor com especificidade: quem verifica, em qual sistema, qual decisão, o que dispara o passo seguinte.
6. Sistemas de apoio, integrações manuais, digitação duplicada.
7. Marque falhas, esperas, retrabalho, repasses e responsabilidade difusa; priorize por frequência, severidade, esforço operacional e risco.
8. Valide com as equipes que executam (processo real, não o do manual). Registre data, versão, dono e escopo.

Template (texto):

```
Cenário: <...>   Persona: <...>   Início/fim: <...>   Pergunta: <...>
Versão: <data> · Dono: <papel> · Fontes: <entrevistas, tickets, observação>

| Etapa | Ação do cliente | Evidência | Palco | Bastidor | Apoio (sistemas) | Falhas/esperas | Tempo |
|---|---|---|---|---|---|---|---|
| 1 | | | | | | | |
---------------- linha de interação ----------------
---------------- linha de visibilidade -------------
---------------- linha de interação interna --------

Oportunidades: <problema> | afetados | mudança de processo | métrica | dono | quick win ou estrutural
```

Métricas comuns: tempo de espera, recontato, retrabalho, resolução no primeiro contato, conclusão sem ajuda, custo por atendimento.

**SE** o blueprint mostra só canais visíveis **ENTÃO** virou mapa de jornada; volte aos bastidores. **SE** um passo de bastidor não foi confirmado por quem o executa **ENTÃO** marque como "não confirmado".

## Armadilhas

- Personas, jornadas e blueprints feitos só com suposições do time e apresentados como verdade.
- Estereótipos demográficos no lugar de comportamento.
- Confundir persona com segmento de mercado, ou usuário com comprador.
- Mapas sem data, sem dono e nunca atualizados.
- Escopo corporativo gigante num blueprint só.
- Polir o visual em vez de usar o artefato para decidir.

## O que um agente pode / não pode fazer

> **Pode:** estruturar personas, mapas de empatia, jornadas e blueprints a partir de transcrições, notas e dados fornecidos, marcando a origem de cada item; propor clusters comportamentais; apontar lacunas e contradições; sugerir oportunidades; gerar proto-personas e personas sintéticas **rotuladas como hipótese** para orientar a pesquisa.
>
> **Não pode:** preencher "pensa" e "sente" sem dados como se fossem observados; inventar citações representativas; usar personas sintéticas como fonte de validação; descrever a operação real de bastidor sem insumo de quem a executa; declarar uma persona "validada" sem evidência citada.
