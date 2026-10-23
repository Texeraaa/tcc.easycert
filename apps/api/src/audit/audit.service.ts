import { Injectable, Logger } from "@nestjs/common";
import type { Prisma } from "@easycert/db";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Parâmetros de uma entrada de auditoria.
 * Todos primitivos — sem objetos Prisma para evitar acoplamento.
 *
 * Famílias de action ratificadas (Q3):
 *   submission.state_changed | user.created | user.updated | user.deactivated
 *   role.assigned | role.revoked | matriz.rule_created | matriz.rule_updated
 *   matriz.rule_deleted | certificate.issued | certificate.revoked
 *   event.created | event.updated | event.cancelled
 */
export interface AuditLogParams {
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  before?: Prisma.InputJsonValue;
  after?: Prisma.InputJsonValue;
  reason?: string;
  metadata?: Prisma.InputJsonValue;
}

/**
 * AuditService — registra eventos auditáveis em `audit_log`.
 *
 * Implementação REAL: insere via PrismaService (role easycert_app).
 * A invariante RF-26 (REVOKE UPDATE, DELETE em audit_log) garante que
 * o runtime nunca consiga modificar ou apagar entradas.
 *
 * Decorado @Global() em AuditModule para ser injetável em qualquer service
 * sem importação explícita do AuditModule.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra um evento auditável.
   * Falha silenciosa: se o INSERT falhar (ex.: banco indisponível), apenas loga
   * o erro sem propagar — a operação principal não deve ser abortada por falha de auditoria.
   */
  async log(params: AuditLogParams): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          actor: params.actorId,
          action: params.action,
          entityType: params.entity,
          entityId: params.entityId,
          before: params.before ?? undefined,
          after: params.after ?? undefined,
          reason: params.reason,
        },
      });
    } catch (err) {
      // Falha de auditoria não deve interromper o fluxo principal
      this.logger.error(
        `Falha ao registrar audit_log para action=${params.action} entity=${params.entity} entityId=${params.entityId}: ${String(err)}`,
      );
    }
  }
}
