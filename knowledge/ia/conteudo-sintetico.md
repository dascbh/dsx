---
id: conteudo-sintetico
area: ai
title: Conteúdo sintético — rotulagem, procedência e limites da detecção
evidence: contextual
related: [rag-e-fontes, evidencia-e-fontes, ux-para-agentes]
---

# Conteúdo sintético: rotulagem, procedência e detecção

> **Quando consultar**
> - Ao exibir na interface texto, imagem, áudio, vídeo, código, resumo ou classificação gerados ou alterados por IA.
> - Ao projetar upload, exportação, compartilhamento ou publicação de imagens (o que preservar, o que remover).
> - Ao projetar ou descrever um recurso que "verifica se uma imagem é de IA".
> - Ao escrever a conclusão de uma verificação de origem.
>
> **Componente de rótulo:** as regras visuais e de posição estão em [`label-ai-content`](../../patterns/ai/label-ai-content.md). Este documento cobre o raciocínio por trás e a camada de arquivo/procedência.

## 1. Rotulagem na interface: princípios

O rótulo informa **origem**; não prova exatidão nem revisão. Ele trabalha junto de fontes ([`ai-sources`](../../patterns/ai/ai-sources.md)), incerteza ([`ai-uncertainty`](../../patterns/ai/ai-uncertainty.md)) e revisão ([`review-ai-output`](../../patterns/ai/review-ai-output.md)).

Decisões essenciais:
- **SE** a IA gerou ou transformou **materialmente** o conteúdo **ENTÃO** rotule no ponto em que a pessoa interpreta ou usa esse conteúdo.
- **SE** só parte do conjunto veio da IA **ENTÃO** o rótulo delimita exatamente essa parte.
- **SE** a assistência foi mínima (ortografia) **ENTÃO** avalie o contexto antes de rotular; não iguale a conteúdo gerado.
- **SE** não houve revisão humana confirmada **ENTÃO** nunca use "verificado" ou "revisado".
- **SE** o conteúdo pode ser copiado, exportado ou publicado **ENTÃO** a informação de origem viaja junto (no rótulo e, para arquivos, nos metadados/credenciais da seção 2).
- Rótulo textual e com nome acessível; nunca só ícone, brilho ou cor. Algumas jurisdições impõem obrigações específicas de transparência; verifique o contexto regulatório.

Vocabulário fiel ao que aconteceu:

| Situação | Texto |
|---|---|
| Gerado do zero | "Gerado por IA" |
| Conteúdo da pessoa reescrito ou completado | "Editado com IA" / "Completado com IA" |
| Resumo de fontes | "Resumo gerado por IA" + acesso às fontes |
| Revisado por pessoa, com registro | "Gerado por IA · revisado por [papel] em [data]" |

## 2. Procedência no arquivo: o básico

Para imagens, existem camadas de informação diferentes. Não são nomes diferentes da mesma coisa.

| Camada | Função | Exemplos de campo | Cuidado |
|---|---|---|---|
| **EXIF** | Dados técnicos de captura | Fabricante/modelo, data, exposição, abertura, ISO, orientação, GPS | Data depende do relógio do aparelho; editável; dados de câmera podem sobreviver a edições com IA |
| **IPTC** | Descrição editorial e direitos | Criador, crédito, legenda, direitos, licença; versões recentes do padrão incluem propriedades sobre uso de IA (sistema, prompt) | É declaração, não autorização nem prova; presença dos campos de IA depende da ferramenta |
| **XMP** | Estrutura para gravar e transportar metadados entre aplicativos | Título, descrição, palavras-chave, histórico de edição; muitas vezes carrega os campos IPTC | Ver "IPTC" e "XMP" juntos não significa dados duplicados ou conflitantes |
| **Perfil ICC** | Interpretação de cor | Perfil sRGB incorporado | Não diz nada sobre autoria nem uso de IA; campo "espaço de cor: sRGB" no EXIF não prova perfil ICC incorporado |
| **Credenciais de conteúdo (C2PA)** | Histórico de procedência com integridade verificável | Emissor, ações declaradas (captura, edição, geração), estado da validação | Registra origem **declarada**; não verifica se a cena retratada é verdadeira |
| **Marca d'água incorporada** | Sinal inserido no próprio conteúdo por sistemas compatíveis | Não aparece na lista de metadados | Só um verificador compatível com aquela tecnologia a detecta |

Regras para quem projeta fluxos de imagem:
- **Preserve o original** antes de qualquer limpeza ou edição.
- **Verifique antes de remover:** limpar metadados primeiro destrói o histórico que se queria entender.
- **Remover EXIF não remove tudo:** IPTC, XMP, ICC e marcas d'água seguem mecanismos próprios. Inspecione o arquivo **resultante**, não confie no nome do botão.
- **Privacidade por padrão em cópias públicas:** ofereça remover GPS de fotos pessoais antes de publicar; acervos podem precisar manter autoria e dados técnicos.
- **Ao gerar imagem com IA no produto**, grave a procedência (credencial C2PA e/ou campos IPTC/XMP de IA) e não a apague na exportação.
- Miniatura, captura de tela e arquivo convertido são **outros arquivos**; podem ter perdido tudo.

## 3. Limites da detecção

Três famílias de sinal técnico, que não são equivalentes:
1. **Metadados** (EXIF/IPTC/XMP): pistas sobre software e fluxo de trabalho.
2. **Credenciais C2PA:** histórico declarado com integridade verificável.
3. **Marca d'água incorporada:** presença de um sinal de um sistema específico.

E dois tipos de indício fraco:
- **Detectores por classificação** devolvem estimativa do próprio método; sem conhecer testes, classes avaliadas e limites, uma porcentagem não é prova.
- **Pistas visuais** (mãos, sombras, texto, reflexos) servem para decidir o que investigar, não para concluir. Imagens humanas têm erros; imagens geradas podem ser coerentes.

### Interpretação de resultados
| Achado | Conclusão permitida |
|---|---|
| Credencial válida declara geração por IA | Evidência técnica sobre aquela etapa e aquele arquivo; registrar emissor, ação e estado. Fatos retratados continuam a investigar |
| Credencial declara edição com IA | "Editado com IA" ≠ "gerado por IA"; não estender a conclusão à imagem inteira |
| Campo de software cita ferramenta com IA | O arquivo passou por ela (se o campo não foi alterado); não mede quanto foi gerado |
| Nenhum metadado, credencial ou marca detectados | **Origem inconclusiva.** Compatível com foto que perdeu dados e com imagem gerada sem registro |
| Sinais conflitantes ou validação falhou | Registrar cada observação; buscar o original; não escolher o sinal conveniente |

**Regra de ouro:** "não detectado" descreve o alcance de um teste; não confirma ausência. Nenhum teste único identifica todo conteúdo produzido ou editado por qualquer IA.

### Escrita da conclusão
Conclua com frases curtas e verificáveis, nunca "real" ou "falso":
- "O arquivo analisado contém credencial válida que declara edição com IA."
- "Não foram encontrados sinais compatíveis nos testes realizados; a origem permanece inconclusiva."

### Verificação em cinco passos
1. Obter a versão mais próxima do original e registrar de onde veio e por onde passou.
2. Ler os metadados; não tratar ausência como prova.
3. Consultar credenciais de conteúdo; ler ações declaradas e estado da validação.
4. Usar verificador específico quando houver motivo, sabendo que tipo de sinal ele procura.
5. Confrontar com contexto: publicação original, declaração do responsável, versões anteriores, fontes independentes.

## 4. Implicações para UI de verificação

- Mostre **qual tipo de sinal** cada verificação procura e seu escopo.
- Use três estados, não dois: **sinal encontrado**, **sinal não encontrado (inconclusivo)**, **verificação falhou**.
- Nunca exiba selo "Autêntico" a partir de ausência de sinais de IA.
- Ao exibir percentual de detector, informe que é estimativa e qual o método.
- Separe "procedência verificada" de "conteúdo verdadeiro".

## 5. Anti-padrões

- Rótulo de IA aplicado à página inteira por existir IA em outro ponto.
- Rótulo só com ícone ou brilho.
- "Verificado" sem revisão real.
- Limpar metadados antes de verificar.
- Concluir "não é IA" porque nenhum sinal foi encontrado.
- Tratar perfil ICC ou ausência de EXIF como pista de IA.
- Exportar imagem gerada no produto sem procedência.
- Percentual de detector apresentado como prova.

## 6. Checklist

- [ ] Todo conteúdo gerado ou materialmente transformado tem rótulo textual, no escopo exato.
- [ ] O vocabulário distingue gerado, editado, resumido e revisado.
- [ ] Exportação e compartilhamento preservam a informação de origem.
- [ ] Imagens geradas no produto recebem procedência (C2PA e/ou IPTC/XMP).
- [ ] Fluxos de upload preservam o original e verificam antes de limpar.
- [ ] Remoção de metadados é conferida no arquivo resultante; GPS removível em cópias públicas.
- [ ] UI de verificação tem estado "inconclusivo" e não emite selo de autenticidade por ausência.
- [ ] Conclusões escritas como observações verificáveis, não "real/falso".
