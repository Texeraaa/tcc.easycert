---
tipo: rascunho
status: v1
---

# TCC — Introdução (rascunho)

## Contextualização

As **atividades complementares** constituem componente curricular obrigatório na educação superior brasileira, regulamentadas pelas Diretrizes Curriculares Nacionais do Conselho Nacional de Educação. Por meio delas, espera-se que o estudante amplie sua formação para além da sala de aula, engajando-se em iniciativas de ensino, pesquisa, extensão, representação estudantil e produção cultural — cada uma com teto de carga horária definido pelo projeto pedagógico do curso [CITAÇÃO: Resolução CNE/CES pertinente]. A integralização dessas horas é condição para a colação de grau, o que confere ao processo um peso institucional relevante tanto para o aluno quanto para a coordenação do curso.

Apesar dessa relevância, a gestão das **horas complementares** permanece, em grande parte das instituições de ensino superior (IES) de pequeno e médio porte, apoiada em instrumentos manuais e presenciais. Estudos sobre automação de processos em ambientes acadêmicos indicam que fluxos baseados em papel ou planilhas eletrônicas são especialmente vulneráveis a inconsistências, perda de registros e alta latência decisória [CITAÇÃO: BPM em IES]. O crescimento da oferta de ferramentas de desenvolvimento de software modernas — com alto nível de abstração, ciclos curtos de entrega e ecosistemas maduros de bibliotecas — abre espaço para que instituições de menor porte construam ou adotem soluções digitais sob medida sem os custos tradicionalmente associados ao desenvolvimento de sistemas corporativos [CITAÇÃO: desenvolvimento acelerado / stack moderna].

## Problema

Na Faculdade Municipal Professor Franco Montoro (FMPFM), curso de Ciência da Computação, o processo de validação de horas complementares ocorre de forma inteiramente presencial e assíncrona. O estudante reúne seus comprovantes — impressos ou em mídia física —, leva-os até a coordenação e aguarda o agendamento de análise. O resultado não é comunicado de forma ativa: cabe ao aluno retornar presencialmente para obter a resposta. A latência típica entre a entrega e a decisão é estimada em aproximadamente um mês [CITAÇÃO: levantamento próprio — declaração do autor, coleta formal prevista na Fase 4 da metodologia]. Em caso de indeferimento, a justificativa é fornecida de modo verbal e informal, dificultando eventuais recursos.

A consolidação da carga horária acumulada pelo aluno é mantida em planilha eletrônica gerida manualmente pela coordenação, sem integração com os comprovantes entregues. Esse arranjo apresenta fragilidades conhecidas: versões desatualizadas, perda de registros físicos em trocas de gestão e ausência de histórico auditável. O ônus de reconstituir o próprio acúmulo recai inteiramente sobre o estudante, que frequentemente descobre lacunas apenas no momento do fechamento curricular, às vésperas da colação. A carga horária total exigida pelo curso é de _(pendente — aguarda regulamento oficial da FMPFM)_ horas, distribuídas em categorias com limites máximos por grupo de atividade.

Esse cenário configura um problema de múltiplas dimensões: para o estudante, implica incerteza sobre o próprio progresso e risco real de não integralização; para a coordenação, impõe retrabalho operacional contínuo e exposição a inconsistências difíceis de rastrear; para a instituição, representa uma lacuna de governança sobre um requisito curricular obrigatório.

## Justificativa

A digitalização de fluxos acadêmicos — em particular os de submissão, avaliação e consolidação de documentos — tem sido apontada na literatura como vetor relevante de ganho de eficiência e transparência em secretarias acadêmicas [CITAÇÃO: sistemas de informação acadêmica]. Plataformas que centralizam o ciclo completo do processo, desde a submissão do comprovante até a emissão do documento de conclusão, eliminam pontos de falha associados à comunicação informal e à manutenção manual de registros.

Do ponto de vista do desenvolvimento de software, a disponibilidade de frameworks e ferramentas com alto grau de maturidade — como os adotados neste trabalho — permite construir protótipos funcionais em prazos compatíveis com o contexto acadêmico, sem abrir mão de padrões de qualidade técnica. Essa abordagem, aqui denominada **desenvolvimento acelerado com stack moderna**, aproxima-se do espírito de produtividade proposto por paradigmas como Low-Code/No-Code, com a vantagem de preservar flexibilidade arquitetural e rastreabilidade do código [CITAÇÃO: desenvolvimento acelerado]. Trabalhos correlatos na área de sistemas para IES exploram soluções pontuais para partes desse problema — cadastro de atividades, emissão de declarações, painéis administrativos —, mas a literatura ainda carece de soluções integradas que cubram o ciclo completo com avaliação formal de usabilidade [CITAÇÃO: lacuna identificada nos correlatos — a desenvolver na Seção 2].

Diante desse contexto, a construção e avaliação de um protótipo de plataforma voltado ao problema específico da FMPFM representa uma contribuição concreta tanto para a comunidade acadêmica local quanto para a literatura aplicada sobre automação de processos em IES.

## Objetivos

### Objetivo geral

Desenvolver e avaliar um protótipo de plataforma web para a gestão centralizada de atividades complementares e automação de fluxos acadêmicos, tomando como estudo de caso o curso de Ciência da Computação da Faculdade Municipal Professor Franco Montoro.

### Objetivos específicos

- Mapear o fluxo vigente de validação de horas complementares na instituição-alvo e definir a matriz de regras por categoria de atividade.
- Prototipar a arquitetura da solução utilizando abordagens de desenvolvimento acelerado com stack moderna (NestJS, Next.js, Prisma e PostgreSQL).
- Implementar os módulos de submissão de comprovantes, avaliação pela coordenação, consolidação de carga horária e emissão de documentos comprobatórios.
- Avaliar o protótipo quanto à usabilidade, por meio do System Usability Scale (SUS), e quanto ao desempenho operacional, por meio da comparação do tempo de ciclo entre o processo manual (As-Is) e o processo digitalizado (To-Be).

---

## Notas relacionadas

- [[tcc/visao-geral]] — objetivos e título do TCC.
- [[tcc/estrutura-artigo]] — estrutura canônica das 5 seções do artigo.
- [[tcc/metodologia]] — detalhamento do método (fases, SUS, As-Is vs. To-Be).
- [[dominio/as-is-fmpfm]] — base factual do processo atual utilizada na contextualização e no problema.
- [[dominio/visao-geral]] — objetivo do produto e não-objetivos da v1.
- [[dominio/horas-complementares]] — modelo de categorias e limites de carga horária.
- [[tcc/trabalhos-correlatos]] — correlatos a citar na Seção 2 (esqueleto a preencher).
