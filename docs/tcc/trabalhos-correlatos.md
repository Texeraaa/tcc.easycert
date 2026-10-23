---
tipo: visão
status: v1
---

# TCC — Trabalhos correlatos e fundamentação teórica

Base teórica e análise comparativa de sistemas correlatos. Esta nota é um **esqueleto**; o preenchimento acontece durante o Mês 1 do [[tcc/cronograma]].

---

## Eixos teóricos

### Sistemas de informação acadêmica e BPM

CARVALHO, AGANETTE e MACULAN (2026) propõem a metodologia **BPM Acadêmico** — abordagem sistematizada em sete etapas, alinhada ao PMBOK e orientada a instituições de ensino superior com baixa maturidade em gestão de processos. A metodologia foi validada em contexto brasileiro (ECI/UFMG) e demonstra aplicabilidade direta ao problema de modelagem do fluxo de horas complementares.

### Prototipagem acelerada e Low-Code/No-Code

BALDOW et al. (2024) discutem a adoção de plataformas Low-Code e No-Code como estratégia de democratização do desenvolvimento de software, destacando ganho de produtividade e prototipagem rápida. O easycert adota uma variação pragmática desse paradigma — **desenvolvimento acelerado com stack moderna** — usando frameworks maduros (NestJS, Next.js, Prisma) para preservar flexibilidade arquitetural sem abrir mão da velocidade de entrega.

### Autenticidade e verificação de documentos digitais

A **Portaria MEC nº 554/2019** regulamenta a emissão de diploma digital no Brasil, exigindo assinatura ICP-Brasil (XAdES) e verificação por QRCode no padrão oficial do validador do MEC. Serve como referência normativa para o modelo de verificação pública adotado no easycert (rota `GET /v/:codigo`), ainda que o escopo da v1 do protótipo seja limitado a certificados internos de evento e não a diplomas.

### Diretrizes Curriculares de Computação

A **Resolução CNE/CES nº 5/2016** institui as DCN para cursos de graduação na área de Computação e enquadra as atividades complementares como componente curricular enriquecedor, limitadas a 20% da carga horária total do curso. Baseia a definição de categorias e tetos da matriz do easycert.

## Sistemas correlatos

TOLEDO e SIRQUEIRA (2021) descrevem um aplicativo de gestão de atividades complementares desenvolvido no Centro Universitário Academia (UniAcademia), com cobertura dos papéis de estudante, coordenador e supervisor, foco em registro e controle da integralização curricular. É o correlato brasileiro mais próximo do easycert e será usado como base de comparação na Seção 2 do artigo.

> [!info] A completar
> Levantar 1 segundo sistema correlato (comercial ou institucional) para fechar a matriz comparativa. Candidatos: Lyceum/TOTVS, SIGAA, módulos de atividades complementares em sistemas acadêmicos de IES federais.

## Lacunas identificadas

- Trabalhos correlatos cobrem **cadastro e registro**, mas não trazem **avaliação formal de usabilidade (SUS)** nem **medição de redução de tempo As-Is × To-Be**. O easycert endereça esse gap.
- Correlatos nacionais pouco documentam **arquitetura técnica** da solução; o TCC do easycert explicita decisões de stack e trade-offs do desenvolvimento acelerado.

---

## Notas relacionadas

- [[tcc/visao-geral]] — contexto.
- [[tcc/estrutura-artigo]] — onde isso aparece no artigo (seção 2).
- [[tcc/metodologia]] — como o conhecimento aqui orienta o método.
