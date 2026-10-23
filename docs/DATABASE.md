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
| User | Ator na plataforma. Campo `role: Role` enum único (`ALUNO \| COORDENADOR \| ADMIN`) — um papel por usuário. Eventos `role.assigned`/`role.revoked` no `AuditLog` registram mudança desse valor. | 1-N Submissão (se Aluno), 1-N Avaliação (se Coordenador) |
| Categoria | Grupo de atividade da matriz curricular | 1-N RegraMatriz, 1-N Submissão |
| RegraMatriz | Regra de limite por categoria (tetos, períodos de ingresso, versionamento) | N-1 Categoria |
| Submissão | Pedido de reconhecimento de horas | N-1 User (aluno), N-1 Categoria, 1-N Avaliação, 1-N Documento |
| Avaliação | Decisão coordenador sobre submissão (aprovação, indeferimento, correção) | N-1 Submissão, N-1 User (coordenador) |
| Documento | Comprovante PDF, relatório ou certificado (contém `codigo` UUIDv4 para QRCode, `revogadoEm` para rastreamento) | N-1 Submissão (opcional) ou evento interno |
| EventoInterno | Evento interno da instituição (ex: Semana de Computação) | 1-N Documento (certificados emitidos) |
| AuditLog | Registro imutável (append-only) de eventos de negócio | — (tabela sem FK, rastreamento apenas) |
| Notification | Notificação enviada a um usuário (tipo, corpo, timestamp) | N-1 User |

**Formato da `RegraMatriz`:** tabela normalizada N-1 para `Categoria`, com campos `tetoTotalHoras`, `tetoAtividadeHoras`, `cursoId: UUID?` (null = global), `dataIngressoDesde: Date`, `dataIngressoAte: Date?` (versionamento). Decisão Q4 ratificada em 2026-10-22 — ver [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]]. Campos concretos finais ficam no `schema.prisma` quando materializado em T4b do [[superpowers/specs/2026-10-22-plano-mes-2]].

---

## Imutabilidade do AuditLog (RF-26)

**Estratégia:** append-only via SQL `REVOKE` na tabela `audit_log`.

**Implementação:**

1. **Dois Postgres roles distintos:**
   - `easycert_owner` — dono do schema, roda `prisma migrate deploy`. Tem permissão para CREATE TABLE e ALTER TABLE.
   - `easycert_app` — usado pela aplicação em **runtime**. Tem permissão apenas para `INSERT` e `SELECT` em `audit_log`, **nenhuma** permissão para UPDATE ou DELETE.

2. **Migration SQL manual após CREATE TABLE:**
   ```sql
   REVOKE UPDATE, DELETE ON audit_log FROM easycert_app;
   GRANT INSERT, SELECT ON audit_log TO easycert_app;
   ```
   Arquivo em `packages/db/prisma/migrations/YYYYMMDDHHMMSS_make_audit_log_immutable/migration.sql`.

3. **Prisma mantém funcionalidade normal:**
   - `INSERT` via `prisma.auditLog.create(...)` — funciona normalmente.
   - `SELECT` via `prisma.auditLog.findMany(...)` — funciona normalmente.
   - `UPDATE` / `DELETE` — falham com erro de permissão PostgreSQL no runtime.

4. **Configuração `.env.local`:**
   ```
   DATABASE_URL=postgresql://easycert_app:password@localhost:5432/easycert
   DATABASE_URL_MIGRATE=postgresql://easycert_owner:password@localhost:5432/easycert
   ```
   - `DATABASE_URL` — usado pela aplicação.
   - `DATABASE_URL_MIGRATE` — usado apenas por `prisma migrate deploy` (script CI/CD).

5. **Documentação em Prisma schema:**
   - Campo `createdAt` com `@db.Timestamptz()` para auditoria temporal.
   - Nenhum campo de UPDATE timestamp (é append-only, não há updates).

**Compliance RF-26:** Auditoria imutável em nível de DB (impossível burlar via aplicação; exigeria acesso direto ao role `easycert_owner`).

---

## Campos especiais

### Revogação de certificados (RF-27)

Entidade `Documento` contém campo `revogadoEm` (timestamp nullable) para registrar quando um certificado interno foi revogado pelo administrador. Usado em [[RF-27]] (admin pode revogar certificado emitido indevidamente). Campo parte do **Mês 2**. Auditoria: transição de revogação é registrada em `AuditLog`.

---

## Migrations

Prisma Migrate. Arquivos em `packages/db/prisma/migrations/`. Dev: `pnpm db:migrate`. Produção: `pnpm --filter @easycert/db migrate:deploy`.

## Seeds

`packages/db/prisma/seed.ts`, executado via `pnpm --filter @easycert/db seed`. Conteúdo seed = _(pendente)_, a definir quando o schema estiver estabilizado.

---

## Notas relacionadas

- [[ARCHITECTURE]] — visão geral.
- [[MODULES]] — módulos que acessam o banco.
- [[STACK]] — decisões de tecnologia.
- [[superpowers/specs/2026-10-22-plano-mes-2#T5a]] — schema Prisma será materializado em T5a do Mês 2.
- [[AGENTS]] — `backend-builder` executa mudanças de schema.
