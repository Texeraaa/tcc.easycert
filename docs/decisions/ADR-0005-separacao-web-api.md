---
tipo: decisao
status: aceito
data: 2026-10-19
data-retroativo: 2026-11-04
---

# ADR-0005 — Manter separação estrita web↔api; frontend nunca importa `@easycert/db`

## Contexto
Next.js 15 oferece Server Actions e Route Handlers que permitem acessar o banco diretamente a partir do frontend. Essa facilidade acopla a UI ao schema Prisma e dilui a fronteira entre regra de negócio (api) e apresentação (web). Como o easycert tem hipótese de ter clientes futuros (mobile, integrações), a separação clara agora economiza refactor depois.

## Decisão
`apps/web` **nunca** importa `@easycert/db` nem toca Postgres. Toda leitura/escrita passa pela API NestJS em `apps/api`. Server Actions do Next, se usados, chamam a API via HTTP — não executam SQL/Prisma. Contratos web↔api vivem em `@easycert/types` (ver [[decisions/ADR-0001-zod-contrato-unico]]).

## Alternativas consideradas
- **Server Actions com acesso direto a Prisma** — rejeitada porque acopla o frontend ao schema do banco; qualquer mudança de modelo cascateia em `apps/web`; perde boundary entre BFF e domínio.
- **tRPC entre web e api** — rejeitada porque adiciona uma camada de RPC e type-sharing sem ganho claro sobre REST + Zod em `@easycert/types` (que já resolve o type-safety); mais código a manter, menos previsível para terceiros futuros.
- **Monolito único** (web e api no mesmo app Next) — rejeitada porque perde o isolamento de deploy, dificulta escalar backend independente, e amarra a API a um stack Next.

## Consequências
- **Positivas:** fronteira clara de domínio; backend pode evoluir independente; API pronta para clientes futuros (mobile, integrações externas); auditabilidade centralizada no backend ([[decisions/ADR-0006-auditlog-append-only]]).
- **Negativas / trade-offs:** mais latência que acesso direto (chamada HTTP extra); duplicação ocasional de tipos de domínio em DTOs (mitigado por `@easycert/types`).
- **Invariantes criadas:**
  - `apps/web/**` **não** contém `import ... from "@easycert/db"`.
  - `apps/web/**` **não** contém `new PrismaClient()` nem queries SQL.
  - Toda mutação vinda do browser passa por `apps/api` (controller NestJS → service → Prisma).
  - CI/lint deveria falhar se um import proibido aparecer em `apps/web` (futuro).

## Notas relacionadas
- [[ARCHITECTURE#Decisões arquiteturais]]
- [[MODULES]]
- [[decisions/ADR-0001-zod-contrato-unico]]
- [[decisions/ADR-0006-auditlog-append-only]]
- [[superpowers/specs/2026-11-04-esquema-adr-design]]
