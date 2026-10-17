# EasyCert

Plataforma web para gestão de horas complementares em instituições de ensino superior.

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Next.js 15 (App Router + Turbopack) + React 19
- **Backend**: NestJS 11 (REST)
- **Banco**: PostgreSQL 16 + Prisma 6
- **Dev**: Docker Compose, TypeScript strict

## Estrutura

```
apps/
  web/              Next.js — portais do aluno/coordenador/admin
  api/              NestJS  — API REST
packages/
  db/               Prisma schema + client (@easycert/db)
  types/            Tipos/DTOs compartilhados (@easycert/types)
  ui/               Componentes React compartilhados (@easycert/ui)
  tsconfig/         tsconfig bases (@easycert/tsconfig)
```

## Setup inicial

```bash
# 1. Instalar dependências
pnpm install

# 2. Subir o Postgres
pnpm db:up

# 3. Copiar os .env
cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example apps/api/.env

# 4. Gerar client Prisma + rodar migration inicial
pnpm db:generate
pnpm db:migrate

# 5. Rodar web + api em paralelo
pnpm dev
```

Após o `pnpm dev`:
- Web: http://localhost:3000
- API: http://localhost:3333/health

## Scripts úteis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Roda `web` + `api` em paralelo via Turbo |
| `pnpm build` | Build de todos os packages |
| `pnpm typecheck` | Type-check em todos os packages |
| `pnpm db:up` / `db:down` | Sobe/derruba Postgres via Docker |
| `pnpm db:migrate` | Cria nova migration Prisma |
| `pnpm db:studio` | Abre Prisma Studio |

## Próximos passos (modelagem de domínio)

A modelagem completa (Curso, MatrizCurricular, CategoriaAtividade,
Submissao, Avaliacao, DocumentoEmitido) será feita em iteração próxima.
O schema atual (`packages/db/prisma/schema.prisma`) tem apenas `User` + `Role`
para validar o setup end-to-end.
