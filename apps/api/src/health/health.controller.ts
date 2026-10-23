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
   * Checa Postgres via query mínima + MinIO via `/minio/health/ready`.
   * Retorna 503 quando alguma dep falha — orquestrador para de rotear tráfego.
   */
  @Get("ready")
  async ready() {
    const checks: Record<string, "ok" | "error" | "unconfigured"> = {};

    // Postgres
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.postgres = "ok";
    } catch {
      checks.postgres = "error";
    }

    // MinIO: HTTP GET em /minio/health/ready, 2s timeout.
    const minioEndpoint = this.configService.get<string>("MINIO_ENDPOINT");
    if (!minioEndpoint) {
      checks.storage = "unconfigured";
    } else {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${minioEndpoint}/minio/health/ready`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        checks.storage = res.ok ? "ok" : "error";
      } catch {
        checks.storage = "error";
      }
    }

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
