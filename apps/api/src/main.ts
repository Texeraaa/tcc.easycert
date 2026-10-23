import "reflect-metadata";
// Carrega .env.local ANTES de importar AppModule.
// Isso garante que avaliações top-level dentro do AppModule
// (ex.: isProd lido pelo doubleCsrf) vejam as envs corretas.
// Fixes Blocker #2 do code-review Round 2.
import { config as loadDotenv } from "dotenv";
import { resolve } from "path";
loadDotenv({ path: resolve(__dirname, "../../../.env.local") });
loadDotenv({ path: resolve(__dirname, "../../../.env") });

import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";
import { ZodValidationPipe } from "nestjs-zod";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Desativa logger padrão do NestJS — substituído por Pino abaixo
    bufferLogs: true,
  });

  // Substitui o logger padrão do NestJS pelo Pino (integrado com nestjs-pino)
  app.useLogger(app.get(Logger));

  // ValidationPipe global via nestjs-zod: rejeita payloads com campos desconhecidos
  app.useGlobalPipes(new ZodValidationPipe());

  // Security headers via helmet
  app.use(helmet());

  // CORS — origin controlado por WEB_ORIGIN validado no ConfigModule
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });

  // Exception filter global com X-Request-Id no response
  app.useGlobalFilters(new HttpExceptionFilter());

  // Hooks de shutdown limpos: garante $disconnect() do Prisma no SIGTERM
  // (resolve Débito #6 do tech-architect)
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3333);
  await app.listen(port);

  app.get(Logger).log(`[api] ouvindo em http://localhost:${port}`);
}

bootstrap();
