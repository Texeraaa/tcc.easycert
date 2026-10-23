# INDEX

> Este arquivo só referencia outros .md. Conteúdo real fica nos arquivos linkados.

## Arquitetura
- [[ARCHITECTURE]] — visão geral do sistema e como as partes se encaixam.
- [[MODULES]] — módulos do backend e frontend, com responsabilidades.
- [[DATABASE]] — schema, entidades, migrations.
- [[INFRASTRUCTURE]] — hospedagem, CI/CD, integrações externas.
- [[STACK]] — decisões de tecnologia.
- [[AGENTS]] — roster de 6 agentes e protocolo de interação.
- [[design/DESIGN]] — design system do easycert (tokens, componentes, motion, guardrails).

## API
- [[API_ROUTES]] — rotas HTTP agrupadas por módulo.

## Superpowers — Specs e Plans
- [[superpowers/specs/2026-10-19-requisitos-mes-1]] — requisitos e decisões técnicas do Mês 1.
- [[superpowers/specs/2026-10-20-design-system-easycert]] — sistema de design completo.
- [[superpowers/specs/2026-10-22-upload-de-pdf-design]] — fluxo de upload de PDF direto ao storage via POST policy (RF-06, RNF-03).
- [[superpowers/specs/2026-10-22-plano-mes-2]] — plano completo do Mês 2 (15 decisões, schema Prisma + 9 módulos NestJS + 2 fluxos E2E + half-circle aluno).

## Domínio
- [[dominio/visao-geral|visao-geral]] — objetivo, atores, requisito central, não-objetivos.
- [[dominio/horas-complementares|horas-complementares]] — modelo de horas, categorias, limites.
- [[dominio/fluxo-aprovacao|fluxo-aprovacao]] — ciclo de submissão, análise e aprovação.
- [[dominio/atores-e-papeis|atores-e-papeis]] — alunos, coordenadores, instituição.
- [[dominio/eventos-internos|eventos-internos]] — eventos da instituição, certificados com QRCode (RF-22, RF-23, RF-27), rate-limit 30 req/min.
- [[dominio/pendencias|pendencias]] — decisões em aberto.
- [[dominio/as-is-fmpfm|as-is-fmpfm]] — processo atual manual da FMPFM; baseline do As-Is da Fase 4.

## TCC
- [[tcc/visao-geral|visao-geral]] — objetivos, título refinado, foco acadêmico.
- [[tcc/estrutura-artigo|estrutura-artigo]] — 5 seções do artigo com páginas-alvo.
- [[tcc/metodologia|metodologia]] — tipo de pesquisa, 4 fases, SUS, As-Is vs. To-Be.
- [[tcc/cronograma|cronograma]] — 5 meses com entregáveis.
- [[tcc/trabalhos-correlatos|trabalhos-correlatos]] — esqueleto da fundamentação teórica (Mês 1).
- [[tcc/rascunhos/01-introducao|01-introducao]] — rascunho da introdução.
- [[tcc/rascunhos/pre-banca|pre-banca]] — esqueleto dos 14 slides da pré-banca.
