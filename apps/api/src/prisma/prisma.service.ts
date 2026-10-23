import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@easycert/db";

/**
 * Serviço Prisma que encapsula o PrismaClient.
 *
 * INVARIANTE RF-26: o cliente é construído com DATABASE_URL (role easycert_app),
 * que possui apenas INSERT + SELECT em audit_log — NUNCA DATABASE_URL_MIGRATE.
 * Isso garante que o runtime não consiga alterar ou excluir registros de auditoria,
 * mesmo que algum código tente chamar .update() ou .delete() em AuditLog.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    // Usa DATABASE_URL (role easycert_app) — não DATABASE_URL_MIGRATE (role owner)
    super({
      datasources: {
        db: {
          url: configService.getOrThrow<string>("DATABASE_URL"),
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    this.logger.log("Conectando ao banco de dados...");
    await this.$connect();
    this.logger.log("Banco de dados conectado.");
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log("Desconectando do banco de dados...");
    await this.$disconnect();
  }
}
