-- Round 4a — adiciona coluna metadata (Json?) ao audit_log.
-- Permite registrar payload livre adicional (ex.: email tentado em auth.login_failed,
-- IP, user-agent) sem poluir o diff before/after da entidade.
--
-- RF-26 preservada: a migration roda com easycert_owner (DDL permitido).
-- A role easycert_app continua sem UPDATE/DELETE em audit_log (herda do REVOKE
-- aplicado em 20261022233605_make_audit_log_immutable, que persiste a nível de
-- tabela, não de coluna).

ALTER TABLE "audit_log" ADD COLUMN "metadata" JSONB;
