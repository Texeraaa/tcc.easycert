-- Script de inicialização do Postgres — dois roles por design.
--
-- Executado como superuser `postgres` (POSTGRES_USER do container) na primeira
-- subida do volume. Cria os dois roles reais da aplicação e transfere
-- ownership do database/schema public.
--
-- easycert_owner: dono do schema. Usado apenas por `prisma migrate`
--   (DATABASE_URL_MIGRATE). Tem ALL PRIVILEGES, cria tabelas/índices/enums.
--
-- easycert_app: role de runtime, usado pelo PrismaService.
--   Restrito a SELECT, INSERT, UPDATE, DELETE em tabelas públicas.
--   UPDATE e DELETE em audit_log são revogados pela migration
--   20261022233605_make_audit_log_immutable (invariante RF-26).
--
-- ⚠️ DEV ONLY — senhas em texto plano. Em deploy real (Mês 4+), parametrizar
-- via secrets injetados pelo entrypoint (envsubst) ou gestor de secrets.

CREATE ROLE easycert_owner WITH LOGIN PASSWORD 'owner_password';
CREATE ROLE easycert_app WITH LOGIN PASSWORD 'app_password';

-- Transfere ownership do database e do schema public para easycert_owner.
-- Postgres 15+ restringe CREATE no public schema ao owner — por isso o
-- transfer é obrigatório para que `prisma migrate` consiga criar tabelas.
ALTER DATABASE easycert OWNER TO easycert_owner;
ALTER SCHEMA public OWNER TO easycert_owner;

GRANT CONNECT ON DATABASE easycert TO easycert_app;
GRANT USAGE ON SCHEMA public TO easycert_app;

-- Default privileges: tabelas e sequences criadas pelo easycert_owner no
-- futuro já nascem com os grants corretos para easycert_app.
ALTER DEFAULT PRIVILEGES FOR ROLE easycert_owner IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO easycert_app;

ALTER DEFAULT PRIVILEGES FOR ROLE easycert_owner IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO easycert_app;
