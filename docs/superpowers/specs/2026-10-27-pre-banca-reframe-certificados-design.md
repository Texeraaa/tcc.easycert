# Spec — Reframe da pré-banca: foco em emissão e validação de certificados

- **Data:** 2026-10-27
- **Autor:** Pedro Henrique Teixeira
- **Status:** Executada em 2026-10-27. Rascunho e script atualizados; três placeholders de imagem (V1/V2/V3) permanecem pendentes.
- **Resolve pendência:** "Pré-banca (URGENTE)" em [[dominio/pendencias]] — reframing consolidado em sessão de brainstorming.
- **Artefatos impactados:**
  - `docs/tcc/rascunhos/pre-banca.md` (reescrita completa, 14 → 16 slides)
  - `scripts/build-pre-banca.py` (extensão de handlers para slides 10–11 novos, placeholder de imagem)
  - `docs/tcc/visao-geral.md` (título atualizado)
  - `docs/tcc/metodologia.md` (ajuste de métricas As-Is × To-Be para dois cenários)

---

## 1. Motivação

O rascunho atual constrói narrativa em torno de "horas complementares" como protagonista. **Decisão consolidada em 2026-10-27 (sessão com Pedro)**: o foco real do produto (nome do repo é `easycert`) é **emissão e validação de certificados acadêmicos**. Horas complementares viram **consequência contábil**, não protagonista.

Pré-banca atual (14 slides) não exibe fluxo nem arquitetura — lacuna grave para banca técnica avaliar escolhas estruturantes (separação web ↔ api, upload direto, máquina de estados).

Novo título (alinhado com Prof. Robson, segundo o autor):
> **Desenvolvimento de uma Plataforma Web para Emissão e Validação de Certificados Acadêmicos, Baseada em Desenvolvimento Acelerado**

Confirmação formal com o orientador registrada como pendência em [[dominio/pendencias]].

---

## 2. Decisões consolidadas

| # | Decisão | Escolha |
|---|---|---|
| D1 | Mensagem central | A (dor concreta FMPFM) + C (decisões arquiteturais defensáveis); B (stack acelerada) como meio |
| D2 | Narrativa | A → C (problema primeiro, arquitetura como prova) |
| D3 | Tempo-alvo | 12 minutos |
| D4 | Peso emissão × recepção | Emissão como foco narrativo até a defesa; recepção/validação mostra só o que roda (andamento honesto) |
| D5 | Título novo | "Desenvolvimento de uma Plataforma Web para Emissão e Validação de Certificados Acadêmicos, Baseada em Desenvolvimento Acelerado" |
| D6 | Visual As-Is × To-Be (V1, slide 4) | Tabela 2×2: duas pontas (emissão/recepção) × dois estados (hoje/plataforma), linguagem de pessoas, sem termos técnicos |
| D7 | Visual Arquitetura (V2, slide 10 NOVO) | Placeholder de imagem centralizada; 2 bullets de legenda: (i) separação estrita web ↔ api, (ii) dois caminhos para o certificado |
| D8 | Visual Fluxo de emissão (V3, slide 11 NOVO) | Placeholder de imagem; 6 passos horizontais; aviso "implementação em andamento" só na fala, não no slide |
| D9 | Escala de slides | 14 → 16 (slides 10–11 novos: arquitetura e fluxo) |

---

## 3. Estrutura dos 16 slides

**Bloco 1 — Abertura:**
1. **Capa** — Título novo + autor Pedro Henrique Teixeira + orientador Prof. Robson Leandro Carvalho Canato.
2. **Instituição** — Igual ao rascunho atual.

**Bloco 2 — Problema (A):**
3. **Contextualização** — Certificado como objeto central; DCN CNE/CES 2016 continua; duas pontas (IES emite / aluno traz); em IES pequeno, ciclo manual.
4. **Problema** — V1 (tabela 2×2 As-Is × To-Be) + 2 bullets: "duas pontas, uma dor comum: falta de ciclo digital"; "aluno descobre lacunas às vésperas da colação".
5. **Pergunta de pesquisa** — Reformulada: abrange emissão + validação, mantém "desenvolvimento acelerado em stack moderna".
6. **Justificativa** — BPM/BPA em IES + ausência de emissão oficial em eventos próprios (vazio documental) + stack moderna + lacuna integrada na literatura correlata.

**Bloco 3 — Resposta técnica (C):**
7. **Objetivo geral** — "Desenvolver e avaliar protótipo para emissão de certificados de eventos próprios e validação de certificados externos no âmbito das atividades complementares, estudo de caso FMPFM-CC."
8. **Objetivos específicos** — 4 bullets: (i) mapear As-Is emissão e recepção; (ii) prototipar arquitetura; (iii) implementar módulos emissão, recepção, avaliação, consolidação, emissão documentos oficiais; (iv) avaliar SUS + latência As-Is × To-Be em dois cenários.
9. **Metodologia** — Mantém 4 fases; Fase 1 inclui mapeamento As-Is das duas pontas; Fase 4 mede latência em dois cenários (emissão + validação).
10. **Arquitetura (NOVO)** — Placeholder de imagem + 2 bullets de legenda: (i) separação estrita web ↔ api; (ii) dois caminhos para o certificado convergindo no mesmo ciclo. Elementos-alvo no diagrama: portal web Next.js, API NestJS, PostgreSQL, Storage MinIO/S3, caminho de emissão (API → PDF → storage → notificação), caminho de recepção (portal → upload direto storage pulando API → registro API).
11. **Fluxo caminho feliz da emissão (NOVO)** — Placeholder de imagem + nota "ramificações tratadas no sistema mas fora deste slide". 6 passos: 1) coordenação cria evento (título, data, carga horária, categoria); 2) cadastra participantes; 3) sistema gera PDF; 4) armazena no storage; 5) notifica aluno; 6) credita horas na matriz.

**Bloco 4 — Fechamento:**
12. **Resultados preliminares** — Honesto. "Entregue até agora": mapeamento As-Is; schema Prisma 6; backend NestJS 11 com 9 módulos e fluxo recepção/validação ponta a ponta com máquina de estados; upload direto RF-06; portal do aluno. "Em desenvolvimento até a defesa": módulo de emissão. Screenshots atuais mantidos.
13. **Cronograma** — Tabela Ago/Set/Out/Nov com linhas: Levantamento (Ago); Modelagem (Ago-Set); **Prototipagem recepção e validação** (Ago-Out); **Prototipagem emissão de certificados** (Out-Nov); Testes SUS (Nov); Medição As-Is × To-Be dois cenários (Nov); Escrita Intro+Fundamentação (Ago); Escrita Metodologia (Set); Escrita Resultados (Out-Nov); Considerações finais / revisão ABNT (Nov); Preparação da banca (Out-Nov).
14. **Considerações parciais** — 4 bullets: (i) As-Is confirmou duas dores ciclo de vida do certificado; (ii) stack moderna viável em prazo acadêmico (9 módulos + portal em 2 meses); (iii) decisões estruturantes (separação web ↔ api, AuditLog append-only, upload direto); (iv) próximos passos até defesa (módulo emissão + SUS + medição dois cenários).
15. **Referências** — Mesmas 6 do rascunho atual + lacuna `[FALTA]` regulamento FMPFM. Portaria MEC 554/2019 (emissão digital de diploma) sobe em relevância — citar primeiro se banca tocar em "emissão oficial".
16. **Obrigado** — Igual ao rascunho atual.

---

## 4. Implicações para `scripts/build-pre-banca.py`

- Script hoje é fixo em 14 slides; passa a 16.
- Antigo slide 10 (Resultados) vira novo slide 12 — handler `process_slide_10` → `process_slide_12`.
- Antigo slide 11 (Cronograma) vira novo slide 13 — handler `process_slide_11` → `process_slide_13`.
- **Novos slides 10 (Arquitetura) e 11 (Fluxo):** precisam de handler novo que insere 1 imagem grande centralizada como placeholder (sem falhar se arquivo não existir).
- Template Muller tem só 14 slides — para 16, decisão de duplicar layouts fica para plano de execução.

---

## 5. Pendências novas abertas pela reframe

- **Diagrama de arquitetura (V2)** — desenho visual a consolidar; elemento obrigatório para banca técnica avaliar web ↔ api e dois caminhos do certificado.
- **Diagrama de fluxo de emissão (V3)** — desenho visual a consolidar; narrativa dos 6 passos (evento → participantes → PDF → storage → notificação → horas).
- **Avaliar nova referência emissão/assinatura digital** — Portaria MEC 554/2019 relevante; procurar literatura BR em assinatura digital de certificados em IES.
- **Reescrita de `docs/tcc/rascunhos/pre-banca.md`** — plano de execução separado (substitui 14 slides atuais pelos 16 novos com novo título e narrativa).
- **Extensão de `scripts/build-pre-banca.py`** — plano de execução separado (handlers slides 10–11, ajuste num slides, mapeamento handlers antigos).

---

## 6. O que esta spec NÃO decide

- Desenho visual concreto dos diagramas V2 (arquitetura) e V3 (fluxo de emissão) — fica com o autor.
- Mecânica da expansão de 14 → 16 slides no `.pptx` do template Muller — plano de execução separado (duplicação de layout ou ajuste manual).
- Conteúdo textual concreto de cada slide — fica para reescrita do `pre-banca.md` (plano de execução).
- Qual referência nova exatamente entra — pesquisa de literatura em assinatura digital em IES brasileiras (plano de execução).

---

## 7. Notas relacionadas

- [[tcc/rascunhos/pre-banca]] — será reescrita para 16 slides sob esta spec.
- [[tcc/visao-geral]] — título será atualizado para novo phrasing.
- [[tcc/metodologia]] — métricas As-Is × To-Be ampliam para dois cenários.
- [[superpowers/specs/2026-10-23-pre-banca-pptx-design]] — iteração anterior (14 slides, foco horas).
- [[dominio/pendencias]] — pendências novas listadas na seção 5.
