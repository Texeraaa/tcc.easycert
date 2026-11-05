---
tipo: decisao
status: aceito
data: 2026-10-22
data-retroativo: 2026-11-04
---

# ADR-0006 — Tornar `AuditLog` append-only via `REVOKE UPDATE, DELETE` no role `easycert_app`

## Contexto
RF-26 do easycert exige **log de auditoria imutável**: uma vez gravado um evento (aprovação, revogação, criação de usuário etc.), ele não pode ser alterado nem apagado pela aplicação, mesmo se um atacante obtiver privilégio na app. Confiar apenas em disciplina de código ("ninguém escreve `UPDATE audit_log`") é frágil — um `PATCH` acidental por via de um ORM genérico quebra a invariante.

## Decisão
Dois roles Postgres: **`easycert_owner`** (dono do schema; roda migrations) e **`easycert_app`** (runtime). Migration Prisma versionada aplica `REVOKE UPDATE, DELETE ON audit_log FROM easycert_app`. A app só consegue `INSERT` e `SELECT`; qualquer tentativa de `UPDATE/DELETE` resulta em erro no Postgres, não em escrita silenciosa. Duas `DATABASE_URL` distintas em `.env.local`: `DATABASE_URL` (runtime, `easycert_app`) e `DATABASE_URL_MIGRATE` (migrations, `easycert_owner`).

## Alternativas consideradas
- **Imutabilidade só na aplicação** (ex.: não expor `AuditService.update()`) — rejeitada porque é reversível por qualquer bug, por qualquer dev novo, por qualquer migration que mude o service. Invariante no banco é irreversível por código.
- **Triggers Postgres** (`BEFORE UPDATE RAISE EXCEPTION`) — rejeitada porque distribui lógica entre schema e aplicação, é mais difícil auditar/revisar, e tem overhead de execução em cada escrita.
- **Log externo** (arquivo, SIEM, sink) — rejeitada porque perde FK para entidades do domínio, dificulta consultas ad-hoc por `entityId`, e exige infra adicional fora do escopo v1.

## Consequências
- **Positivas:** invariante garantida pelo Postgres (impossível violar por bug na app); consultas via Prisma como qualquer entidade; fácil auditar que a invariante existe (uma linha de SQL).
- **Negativas / trade-offs:** operação exige disciplina de rodar migrations com `easycert_owner` (duas URLs); `prisma migrate reset` em dev precisa reaplicar o `REVOKE` (ver débito técnico em [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]]).
- **Invariantes criadas:**
  - Role runtime da aplicação é `easycert_app` — **nunca** apontar `DATABASE_URL` para `easycert_owner` em produção.
  - Migration `REVOKE UPDATE, DELETE ON audit_log FROM easycert_app` existe versionada; `prisma migrate reset` reaplica.
  - `AuditService.log(...)` só faz `INSERT`; não há API de update/delete.

## Notas relacionadas
- [[STACK#Observabilidade]]
- [[STACK#CSRF & Segurança]]
- [[dominio/pendencias#Resolvidas após ratificação (2026-10-20+)]]
- [[superpowers/specs/2026-10-22-plano-mes-2]]
- [[superpowers/specs/2026-11-04-esquema-adr-design]]
