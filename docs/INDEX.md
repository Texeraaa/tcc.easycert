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

## Decisões
- [[decisions/ADR-0001-zod-contrato-unico]] — `aceito` (2026-10-19) · Zod + `nestjs-zod` como contrato único web↔api.
- [[decisions/ADR-0002-argon2id-senha]] — `aceito` (2026-10-22) · Hash de senha com argon2id via `@node-rs/argon2`.
- [[decisions/ADR-0003-jwt-cookie-httponly]] — `aceito` (2026-10-22) · JWT em cookie HttpOnly SameSite=Lax.
- [[decisions/ADR-0004-csrf-double-submit]] — `aceito` (2026-10-22) · Mitigação CSRF via `csrf-csrf` com double-submit cookie.
- [[decisions/ADR-0005-separacao-web-api]] — `aceito` (2026-10-19) · Separação estrita web↔api; frontend nunca importa `@easycert/db`.
- [[decisions/ADR-0006-auditlog-append-only]] — `aceito` (2026-10-22) · `AuditLog` append-only via `REVOKE UPDATE, DELETE` no role `easycert_app`.
- [[decisions/ADR-0007-shadcn-tailwind-radix]] — `aceito` (2026-10-19) · shadcn/ui + Tailwind CSS + Radix UI no frontend.

## Superpowers — Specs e Plans
- [[superpowers/specs/2026-10-19-requisitos-mes-1]] — requisitos e decisões técnicas do Mês 1.
- [[superpowers/specs/2026-10-20-design-system-easycert]] — sistema de design completo.
- [[superpowers/specs/2026-10-22-upload-de-pdf-design]] — fluxo de upload de PDF direto ao storage via POST policy (RF-06, RNF-03).
- [[superpowers/specs/2026-10-22-plano-mes-2]] — plano completo do Mês 2 (15 decisões, schema Prisma + 9 módulos NestJS + 2 fluxos E2E + half-circle aluno).
- [[superpowers/specs/2026-10-23-pre-banca-pptx-design]] — design do script Python para gerar o `.pptx` da pré-banca a partir do template Muller preservando o visual.
- [[superpowers/specs/2026-10-27-pre-banca-reframe-certificados-design]] — reframe para foco em emissão+validação de certificados (16 slides, dois novos visuais, novo título alinhado com orientador).
- [[superpowers/plans/2026-10-27-pre-banca-reframe-certificados-design]] — plano de 10 tasks para executar o reframe (extensão do script 14→16 slides + reescrita do rascunho).
- [[superpowers/specs/2026-11-04-esquema-adr-design]] — padrão de ADR (Architecture Decision Records): localização, template, ciclo de vida, gatilhos e plano de migração dos 7 ADRs retroativos essenciais.

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
