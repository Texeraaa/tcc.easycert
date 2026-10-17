# STACK

Decisões de tecnologia do **easycert** e por quê. Esta nota registra escolhas feitas; para contexto de produto, ver [[dominio/visao-geral|visao-geral]].

---

## Monorepo

- **pnpm workspaces + Turborepo** — gerenciamento do monorepo (`pnpm-workspace.yaml`, `turbo.json`).

## Linguagem

- TypeScript 5.7 em todo o monorepo. Presets em `@easycert/tsconfig`.
- Node.js ≥ 20 (`engines.node` no `package.json`).

## Backend

- **Framework HTTP:** NestJS 11 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`).
- **ORM:** Prisma 6 — ver [[DATABASE]].
- **Validação:** _(pendente)_ — a decidir entre `class-validator`+`class-transformer` (padrão NestJS) e `zod`. Ver [[pendencias]].
- **Testes:** Jest + Supertest (configurado em `apps/api`).

## Frontend

- **Framework:** Next.js 15 com Turbopack.
- **React:** 19.
- **Roteamento:** App Router do Next.js.
- **Estilização / UI:** _(pendente)_ — biblioteca a decidir; `@easycert/ui` existe mas está vazio. Ver [[pendencias]].

## Banco de dados

Postgres via `docker-compose.yml`. ORM: Prisma 6. Detalhes em [[DATABASE]].

## Em aberto

> [!warning] Em aberto
> Lista de decisões ainda não tomadas vive em [[dominio/pendencias|pendencias]].

## A confirmar

> [!info] A confirmar
> Biblioteca de UI, biblioteca de validação de DTO e estratégia de autenticação ainda não ratificadas. Ver [[dominio/pendencias|pendencias]].

---

## Notas relacionadas

- [[ARCHITECTURE]] — como as peças se encaixam.
- [[dominio/visao-geral|visao-geral]] — requisitos de produto que orientaram a stack.
- [[dominio/pendencias|pendencias]] — decisões em aberto.
