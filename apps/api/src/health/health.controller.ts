import { Controller, Get, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";

/**
 * Rotas de saúde do serviço (sem autenticação).
 *
 * GET /health/live — verifica se o processo está vivo.
 * GET /health/ready — verifica se dependências externas estão acessíveis.
 */
@Controller("health")
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Liveness probe: processo está rodando.
   * Usado por orquestradores (Docker, k8s) para saber se reiniciar.
   */
  @Get("live")
  live() {
    return { status: "ok" };
  }

  /**
   * Readiness probe: dependências acessíveis.
   * Retorna 200 quando Postgres responde + MINIO_ENDPOINT está configurado.
   * Retorna 503 quando alguma dep falha — orquestrador para de rotear tráfego.
   */
  @Get("ready")
  async ready() {
    const checks: Record<string, "ok" | "error"> = {};

    // Checa Postgres via query mínima
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.postgres = "ok";
    } catch {
      checks.postgres = "error";
    }

    // Checa configuração de storage (stub — apenas valida que a env está setada)
    const minioEndpoint = this.configService.get<string>("MINIO_ENDPOINT");
    checks.storage = minioEndpoint ? "ok" : "error";

    const allOk = Object.values(checks).every((v) => v === "ok");

    if (!allOk) {
      throw new HttpException(
        { status: "degraded", checks },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return { status: "ok", checks };
  }
}
