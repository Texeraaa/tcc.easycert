---
tipo: rascunho
status: v2-reframe
---

# TCC — Pré-banca (rascunho — reframe 2026-10-27 com slots vazios)

Esqueleto da pré-banca sob o reframe para emissão e validação de certificados. 19 slides físicos: 16 com conteúdo (declarados abaixo) e 3 slots vazios (11, 13, 15) reservados para posicionamento manual dos diagramas e dos screenshots do portal. Formato compatível com o script `scripts/build-pre-banca.py` (dispatch por `## Slide N — ...`).

Spec: [[superpowers/specs/2026-10-27-pre-banca-reframe-certificados-design]].

---

## Slide 1 — Capa

> **Desenvolvimento de uma Plataforma Web para Emissão e Validação de Certificados Acadêmicos, Baseada em Desenvolvimento Acelerado**
>
> Discente: Pedro Henrique Teixeira
> Orientador: Prof. Robson Leandro Carvalho Canato

## Slide 2 — Instituição

> GRADUAÇÃO EM CIÊNCIA DA COMPUTAÇÃO
> Faculdade Municipal Professor Franco Montoro — FMPFM

## Slide 3 — Introdução · Contextualização

- As **atividades complementares** são componente curricular obrigatório na educação superior brasileira (Diretrizes Curriculares Nacionais, CNE/CES).
- O **certificado** é o instrumento concreto que comprova essas atividades — tanto o que a **IES emite** (eventos próprios: palestras, oficinas, semanas acadêmicas) quanto o que o **aluno traz de fora** (cursos, voluntariado, representação estudantil).
- A integralização desses certificados em carga horária é **condição para colação de grau**.
- Em IES de pequeno e médio porte, a gestão do ciclo de vida do certificado — **emitir, receber, validar, consolidar** — permanece **manual**.

## Slide 4 — Problema · As-Is × To-Be

- **Duas pontas, uma dor comum:** falta de ciclo digital do certificado.
- Aluno **descobre lacunas no fechamento curricular** às vésperas da colação.

![Diagrama As-Is vs To-Be — duas pontas (emissão/recepção), dois estados (hoje/plataforma)](./img/as-is-vs-to-be.png)

## Slide 5 — Pergunta de pesquisa

> _Substitui "Hipótese" do template de Muller — a pesquisa é aplicada, não hipotético-dedutiva._

- É possível **automatizar o ciclo de vida do certificado acadêmico** na FMPFM — **emissão** para eventos próprios e **validação** de certificados externos — por meio de uma plataforma web construída com **desenvolvimento acelerado em stack moderna**, **reduzindo latência e retrabalho** e mantendo níveis adequados de usabilidade para alunos e coordenadores?

## Slide 6 — Justificativa

- Digitalizar fluxos acadêmicos é um caminho reconhecido para **ganhar eficiência e transparência** em secretarias de instituições de ensino.
- A **ausência de emissão oficial** de certificados em eventos próprios de IES de pequeno/médio porte tira do aluno a prova material da própria formação — vazio documental com consequência direta no fechamento curricular.
- Ferramentas atuais de desenvolvimento web permitem **construir protótipos funcionais em prazo acadêmico** sem abrir mão de qualidade técnica.
- Trabalhos correlatos cobrem **partes isoladas** do problema — faltam soluções **integradas** tratando emissão **e** validação sob o mesmo ciclo, com **avaliação formal de usabilidade**.

## Slide 7 — Objetivos · Geral

> **Objetivo Geral**
> Desenvolver e avaliar um protótipo de plataforma web para **emissão de certificados de eventos próprios** e **validação de certificados externos** no âmbito das atividades complementares, tomando como estudo de caso o curso de Ciência da Computação da FMPFM.

## Slide 8 — Objetivos · Específicos

- **Mapear** o fluxo vigente (As-Is) de **emissão** e de **recepção/validação** de certificados na FMPFM e definir a matriz de regras por categoria.
- **Prototipar** a arquitetura utilizando desenvolvimento acelerado com ferramentas web modernas e banco de dados relacional.
- **Implementar** as áreas de emissão (eventos, participantes, geração de PDF), recepção (envio de certificados externos pelo aluno), avaliação (análise pela coordenação, aplicação das regras), consolidação (soma da carga horária) e emissão de documentos oficiais.
- **Avaliar** o protótipo quanto à usabilidade (questionário SUS) e ao tempo de execução — comparando o processo atual e o processo com a plataforma, nos dois cenários (emissão e validação).

## Slide 9 — Metodologia

- **Tipo de pesquisa:** aplicada, quanti-qualitativa, experimental, estudo de caso.
- **Fase 1 — Levantamento:** mapeamento do processo atual nas duas pontas (emissão e recepção), regulamento da instituição e lista de requisitos.
- **Fase 2 — Modelagem:** desenho do banco de dados, arquitetura em módulos, definição dos papéis (aluno e coordenação).
- **Fase 3 — Prototipagem acelerada:** telas do site e automações do servidor, construídas em ciclos curtos.
- **Fase 4 — Avaliação:** usabilidade pelo questionário SUS (10 perguntas; nota 68 ou mais é considerada acima da média) e comparação de tempo entre o processo atual e o processo com a plataforma, nos dois cenários (emissão de certificado em evento próprio e validação de certificado externo).

## Slide 10 — Arquitetura

- **Separação entre a parte visual (site) e a parte servidora (regras e dados):** o site não acessa o banco direto, o servidor não entrega páginas.
- **Dois caminhos para o certificado**: um emitido pela própria FMPFM, outro trazido pelo aluno — ambos passam pelo mesmo processo de validação.
- Diagrama no slide seguinte.

## Slide 12 — Fluxo caminho feliz da emissão

- 6 passos: cadastrar o evento, registrar os participantes, gerar o certificado em PDF, guardar o arquivo, avisar o aluno e somar as horas na ficha dele.
- Variações do fluxo (segunda via, correção) são tratadas pelo sistema, mas não aparecem neste slide.
- Diagrama no slide seguinte.

## Slide 14 — Resultados preliminares

> _Qualificação — protótipo em andamento; avaliação de usabilidade e medição de tempo ainda não executadas._

- **Processo atual da FMPFM mapeado** e documentado como ponto de partida da avaliação.
- **Banco de dados projetado** cobrindo alunos, envios, documentos, categorias, regras, eventos e histórico.
- **Servidor da aplicação pronto** com 9 áreas; fluxo completo de recepção e validação de certificado externo, com ciclo definido: aguardando envio, aguardando análise, em análise, aprovado, recusado ou pedido de correção.
- **Portal do aluno em funcionamento**: login, indicador de progresso de horas e consulta de categorias.
- **Em desenvolvimento até a defesa:** área de emissão de certificados para eventos próprios da FMPFM.
- Telas do portal no slide seguinte.

## Slide 16 — Cronograma

| Atividades | Ago | Set | Out | Nov |
|---|:-:|:-:|:-:|:-:|
| Levantamento de requisitos / regulamento | X | | | |
| Modelagem de dados e arquitetura | X | X | | |
| Prototipagem — recepção e validação | X | X | X | |
| Prototipagem — emissão de certificados | | | X | X |
| Testes de usabilidade (SUS) | | | | X |
| Medição As-Is × To-Be (emissão e validação) | | | | X |
| Escrita — Introdução e Fundamentação | X | | | |
| Escrita — Metodologia | | X | | |
| Escrita — Resultados e discussão | | | X | X |
| Considerações finais / revisão ABNT / preparação da banca | | | X | X |

## Slide 17 — Considerações parciais

- O mapeamento do As-Is confirmou **duas dores no ciclo de vida do certificado**: emissão ausente em eventos próprios da FMPFM e validação lenta de certificados externos.
- A opção por **ferramentas modernas como "desenvolvimento acelerado"** se mostrou viável em prazo acadêmico — fluxo de recepção e validação entregue em 2 meses (9 áreas no servidor e o portal do aluno).
- Decisões estruturantes consolidadas: separação entre site e servidor, histórico de auditoria preservado contra alteração, e envio seguro de arquivos direto para o armazenamento.
- **Próximos passos até a defesa:** implementar a área de **emissão** (cadastro de eventos, geração do PDF e entrega no portal do aluno), aplicar o questionário SUS e comparar o tempo do processo atual com o processo pela plataforma **nos dois cenários**.

## Slide 18 — Referências

Referências levantadas em 2026-10-23 para a pré-banca (Portaria 554/2019 destacada no reframe pela relevância à emissão oficial):

- BRASIL. Ministério da Educação. **Portaria nº 554, de 11 de março de 2019**. Dispõe sobre a emissão e o registro de diploma de graduação por meio digital pelas IES pertencentes ao Sistema Federal de Ensino. Diário Oficial da União: seção 1, Brasília, DF, 12 mar. 2019. Disponível em: https://www.in.gov.br/materia/-/asset_publisher/Kujrw0TZC2Mb/content/id/66544171/do1-2019-03-12-portaria-n-554-de-11-de-marco-de-2019-66543842. Acesso em: 23 out. 2026.
- BALDOW, Samuel Rodrigues et al. Low-Code e No-Code: democratizando o desenvolvimento de software. **REMUNOM: Revista Multidisciplinar do Nordeste Mineiro**, v. 11, n. 1, 2024. DOI: https://doi.org/10.61164/rmnm.v11i1.3032. Acesso em: 23 out. 2026.
- BRASIL. Ministério da Educação. Conselho Nacional de Educação. Câmara de Educação Superior. **Resolução CNE/CES nº 5, de 16 de novembro de 2016**. Institui as Diretrizes Curriculares Nacionais para os cursos de graduação na área da Computação. Diário Oficial da União: seção 1, Brasília, DF, 17 nov. 2016. Disponível em: https://abmes.org.br/arquivos/legislacoes/Res-CES-CNE-005-2016-11-16.pdf. Acesso em: 23 out. 2026.
- BROOKE, John. SUS: a "quick and dirty" usability scale. In: JORDAN, P. W. et al. (Ed.). **Usability Evaluation in Industry**. London: Taylor & Francis, 1996. p. 189-194.
- CARVALHO, Mariana Freitas Canielo de; AGANETTE, Elisângela Cristina; MACULAN, Benildes Coura Moreira dos Santos. BPM Acadêmico: uma metodologia para modelagem de processos em IES. **RDBCI: Revista Digital de Biblioteconomia e Ciência da Informação**, Campinas, v. 24, 2026. DOI: https://doi.org/10.20396/rdbci.v24i00.8680182. Disponível em: https://www.scielo.br/j/rdbci/a/K8JdxBsTTx6RdgsZgthSgCF/. Acesso em: 23 out. 2026.
- TOLEDO, Paulo Donizete Alves de; SIRQUEIRA, Tassio Ferenzini Martins. Horas complementares: um aplicativo de gestão de atividades acadêmicas. **Caderno de Estudos em Sistemas de Informação**, v. 8, n. 1, p. 1-12, 2021. DOI: https://doi.org/10.5281/zenodo.15042181. Disponível em: https://zenodo.org/records/15042181. Acesso em: 23 out. 2026.
- `[FALTA]` Regulamento oficial de horas complementares da FMPFM (quando obtido).

## Slide 19 — Obrigado

> **Obrigado!**
> Pedro Henrique Teixeira — ph.teixeira.ph2020@gmail.com

---

## Como regerar o arquivo .pptx

Pré-requisito único: `pip install --user python-pptx`.

Para gerar (ou regerar após editar este rascunho) a apresentação:

```bash
python3 scripts/build-pre-banca.py
```

O arquivo gerado é `~/Downloads/pre-banca.pptx` com **19 slides**. Os slots 11, 13 e 15 ficam vazios por construção — o autor posiciona manualmente ali o diagrama de arquitetura, o fluxograma de emissão e os screenshots do portal do aluno.

Lacunas `[FALTA: ...]` ficam em branco no slide — rastreio em [[dominio/pendencias]]. Imagem placeholder do slide 4 (diagrama Antes × Depois) ainda é inserida automaticamente pelo handler quando o arquivo existir; se ausente, o build loga aviso e segue.

**Spec:** [[superpowers/specs/2026-10-27-pre-banca-reframe-certificados-design]].

---

## Notas relacionadas

- [[tcc/visao-geral]] — identificação, objetivos e título do TCC.
- [[tcc/estrutura-artigo]] — estrutura canônica das 5 seções do artigo.
- [[tcc/metodologia]] — detalhamento do método (fases, SUS, As-Is × To-Be nos dois cenários).
- [[tcc/cronograma]] — plano temporal de 5 meses.
- [[tcc/rascunhos/01-introducao]] — rascunho da introdução.
- [[tcc/trabalhos-correlatos]] — material da seção 2 (impacta slide 15 Referências).
- [[tcc/rascunhos/pre-banca.backup-2026-10-27]] — backup pré-reframe.
