---
tipo: visão
status: v1
---

# TCC — Metodologia

Método de pesquisa adotado no desenvolvimento e na avaliação do protótipo easycert. Esta nota corresponde à seção 3 do artigo (ver [[tcc/estrutura-artigo#3. Materiais e métodos (4–5 páginas)]]).

---

## Tipo de pesquisa

Pesquisa **aplicada**, **quanti-qualitativa**, **experimental**, baseada em **estudo de caso**.

## Procedimentos metodológicos

### Fase 1 — Levantamento de requisitos
- Mapeamento do processo atual de gestão de horas complementares (As-Is).
- Entrevistas/revisão de regulamentos para extrair regras por categoria.
- Saída: documento de requisitos funcionais e não funcionais; matriz de regras preliminar.

### Fase 2 — Modelagem
- Modelagem de banco de dados (schema Prisma).
- Arquitetura da aplicação: definição de módulos, fluxos e papéis.
- Saída: schema inicial, diagramas de componentes, especificação dos papéis.

### Fase 3 — Prototipagem e desenvolvimento acelerado
- Construção das interfaces (Next.js) e automações (NestJS) com ciclos curtos de iteração.
- Uso de ferramentas e padrões maduros (Prisma, NestJS, Next.js) como forma de **desenvolvimento acelerado com stack moderna** — alternativa pragmática ao Low-Code/No-Code sugerido na proposta original, preservando o espírito de produtividade e prototipagem ágil.
- Saída: protótipo funcional dos 4 módulos (portal-aluno, painel-coordenador, módulo-documentos, dashboard-gerencial).

### Fase 4 — Avaliação do protótipo
- Testes de usabilidade com amostra de alunos e avaliadores.
- Simulação de dois cenários: (i) emissão de certificado de evento próprio (ciclo coordenador → plataforma → aluno) e (ii) recepção/validação de certificado externo (aluno → plataforma → coordenador).
- Coleta de métricas de tempo e satisfação em cada cenário.

## Critérios de avaliação

### Usabilidade — SUS (System Usability Scale)
- Aplicação do questionário SUS a amostra de alunos e avaliadores (reais ou simulados).
- 10 afirmações em escala Likert de 5 pontos; cálculo do SUS score (0–100).
- Interpretação por faixas (ex.: ≥ 68 = acima da média).

### Desempenho operacional — As-Is vs. To-Be
Dois cenários distintos:

**Cenário 1 — Emissão de certificado de evento próprio:**
- Medição do tempo manual As-Is (coordenador escreve e-mail → aluno confere externos → coordenador emite PDF manual → aluno recebe).
- Medição do tempo To-Be (coordenador registra evento na plataforma → sistema gera PDF automaticamente → aluno notificado → horas creditadas).
- Comparação: redução percentual de tempo de ciclo completo.

**Cenário 2 — Recepção e validação de certificado externo:**
- Medição do tempo manual As-Is (aluno escaneia/envia certificado → coordenador abre e-mail → analisa → responde → aluno confere resposta).
- Medição do tempo To-Be (aluno upload direto na plataforma → sistema valida → coordenador avalia em painel → aluno recebe decisão).
- Comparação: redução percentual de tempo de ciclo completo.

---

## Notas relacionadas

- [[tcc/visao-geral]] — contexto acadêmico.
- [[tcc/estrutura-artigo]] — onde esta metodologia aparece no artigo.
- [[tcc/cronograma]] — quando cada fase acontece.
- [[dominio/as-is-fmpfm]] — baseline da comparação As-Is vs. To-Be.
- [[dominio/fluxo-aprovacao]] — processo To-Be medido.
