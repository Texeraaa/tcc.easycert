import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";

/**
 * Módulo de saúde — expõe /health/live e /health/ready.
 * PrismaService e ConfigService são globais, não precisam ser importados aqui.
 */
@Module({
  controllers: [HealthController],
})
export class HealthModule {}
