-- Migration: torna audit_log imutável para o role de runtime (easycert_app).
-- Invariante RF-26: o role de aplicação jamais pode atualizar ou deletar registros
-- de auditoria. Apenas INSERT e SELECT são permitidos.
--
-- easycert_owner (migrations) mantém privilégios completos para DDL.
-- easycert_app  (runtime / PrismaService) fica restrito a INSERT + SELECT.
--
-- Esta migration é re-aplicada em todo `prisma migrate reset`,
-- garantindo idempotência da invariante de imutabilidade.

REVOKE UPDATE, DELETE ON audit_log FROM easycert_app;
GRANT INSERT, SELECT ON audit_log TO easycert_app;
