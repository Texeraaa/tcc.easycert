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
- **Validação:** **Zod + `nestjs-zod`** — schemas vivem em `@easycert/types` como contrato único consumido pelo backend (via `ValidationPipe` do `nestjs-zod`) e pelo frontend (via `@hookform/resolvers/zod` ou inferência de tipo com `z.infer`). Decisão em [[superpowers/specs/2026-10-19-requisitos-mes-1#8. Decisões técnicas resolvidas]].
- **Testes:** Jest + Supertest (configurado em `apps/api`).

## Frontend

- **Framework:** Next.js 15 com Turbopack.
- **React:** 19.
- **Roteamento:** App Router do Next.js.
- **Estilização / UI:** **shadcn/ui + Tailwind CSS + Radix UI** — shadcn é um gerador: `npx shadcn add <componente>` injeta o código em `apps/web/src/components/ui/`. Baseado em Radix (primitivos acessíveis, atende WCAG A/AA). `@easycert/ui` fica reservado para wrappers compartilhados entre múltiplos frontends futuros. Decisão em [[superpowers/specs/2026-10-19-requisitos-mes-1#8. Decisões técnicas resolvidas]].

## Autenticação

- **Login próprio local + JWT** via NestJS Passport (strategy local + estratégia JWT). Admin cria o aluno; aluno define senha no primeiro acesso. Hash com bcrypt ou argon2.
- Decisão **preliminar** — autor ratifica antes do Mês 2. Ver [[dominio/pendencias#A confirmar]].
- SSO institucional e OAuth externo ficam como trabalho futuro ([[dominio/visao-geral#Não-objetivos da v1]]).

## Banco de dados

Postgres via `docker-compose.yml`. ORM: Prisma 6. Detalhes em [[DATABASE]].

## Em aberto

> [!warning] Em aberto
> Lista de decisões ainda não tomadas vive em [[dominio/pendencias|pendencias]].

---

## Notas relacionadas

- [[ARCHITECTURE]] — como as peças se encaixam.
- [[dominio/visao-geral|visao-geral]] — requisitos de produto que orientaram a stack.
- [[dominio/pendencias|pendencias]] — decisões em aberto.
- [[AGENTS]] — agentes que respeitam as decisões de stack.
