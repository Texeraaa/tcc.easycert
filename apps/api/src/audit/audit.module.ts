import { Global, Module } from "@nestjs/common";
import { AuditService } from "./audit.service";

/**
 * AuditModule — módulo global de auditoria.
 *
 * @Global: qualquer módulo pode injetar AuditService sem precisar importar AuditModule.
 * Sem controller público (auditoria é cross-cutting, não exposta via HTTP).
 */
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
