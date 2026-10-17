# DATABASE

Schema, entidades principais e estratégia de migrations do **easycert**.

Contexto: [[ARCHITECTURE]]. Módulos que consomem: [[MODULES]].

---

## Tecnologia

- SGBD: PostgreSQL (serviço `postgres` em `docker-compose.yml`, levantado via `pnpm db:up`).
- ORM: Prisma 6 (`packages/db`).
- Schema: `packages/db/prisma/schema.prisma`.
- Client gerado: consumido por `apps/api` via `@easycert/db`.

## Entidades

Entidades iniciais do domínio. Campos concretos ficam no `schema.prisma` quando criado.

| Entidade | Descrição | Relacionamentos |
|----------|-----------|-----------------|
| Aluno | Estudante que submete comprovantes | 1-N Submissão |
| Coordenador | Avaliador institucional | 1-N Avaliação |
| Administrador | Gestor institucional | — |
| Categoria | Grupo de atividade da matriz | 1-N RegraMatriz, 1-N Submissão |
| RegraMatriz | Regra de limite por categoria | N-1 Categoria |
| Submissão | Pedido de reconhecimento de horas | N-1 Aluno, N-1 Categoria, 1-N Avaliação, 1-N Documento |
| Avaliação | Decisão sobre uma submissão | N-1 Submissão, N-1 Coordenador |
| Documento | Comprovante (PDF enviado) ou declaração (emitida) | N-1 Submissão |

> [!info] A confirmar
> Modelagem concreta dos campos ainda não existe. Formato da RegraMatriz (JSON embarcado vs. tabela normalizada) está em [[pendencias]].

## Migrations

Prisma Migrate. Arquivos em `packages/db/prisma/migrations/`. Dev: `pnpm db:migrate`. Produção: `pnpm --filter @easycert/db migrate:deploy`.

## Seeds

`packages/db/prisma/seed.ts`, executado via `pnpm --filter @easycert/db seed`. Conteúdo seed = _(pendente)_, a definir quando o schema estiver estabilizado.

---

## Notas relacionadas

- [[ARCHITECTURE]] — visão geral.
- [[MODULES]] — módulos que acessam o banco.
- [[STACK]] — decisões de tecnologia.
