import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { randomUUID } from "crypto";
import { resolve } from "path";

import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { AuditModule } from "./audit/audit.module";
import { NotificationModule } from "./notification/notification.module";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { SubmissionModule } from "./submission/submission.module";
import { DocumentoModule } from "./documento/documento.module";
import { AvaliacaoModule } from "./avaliacao/avaliacao.module";
import { MatrizModule } from "./matriz/matriz.module";
import { EventoModule } from "./evento/evento.module";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";
import { validateEnv } from "./config/env.schema";
import { doubleCsrfProtection } from "./common/csrf/csrf.setup";
import { CsrfModule } from "./common/csrf/csrf.module";
import cookieParser from "cookie-parser";
import { Request, Response, NextFunction } from "express";

@Module({
  imports: [
    // ConfigModule global com validação Zod — falha o boot se env inválido.
    // O .env.local fica na raiz do monorepo (3 níveis acima de apps/api/src/
    // ou apps/api/dist/). Usamos __dirname para ser robusto ao cwd de invocação.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(__dirname, "../../../.env.local"),
        resolve(__dirname, "../../../.env"),
        ".env.local",
        ".env",
      ],
      validate: validateEnv,
    }),

    // Logger Pino global com redaction de dados sensíveis.
    // genReqId prefere req.id (setado por fluxos onde pino-http vier primeiro)
    // ou header X-Request-Id (gerado por proxy upstream). O RequestIdMiddleware
    // herda esse req.id — garante convergência entre log Pino e response header.
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => {
          const reqAny = req as unknown as { id?: string };
          return (
            reqAny.id ??
            (req.headers["x-request-id"] as string | undefined) ??
            randomUUID()
          );
        },
        redact: {
          paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "*.password",
            "*.token",
            "*.passwordHash",
            "*.secret",
          ],
          censor: "[REDACTED]",
        },
        // Em dev, usa pretty-print; em prod, JSON estruturado
        transport:
          process.env.NODE_ENV !== "production"
            ? { target: "pino-pretty", options: { colorize: true } }
            : undefined,
      },
    }),

    // Rate limiting global: 60 req/min (memory store em dev).
    // Decisão B1 ratificada — requer APP_GUARD abaixo para ter efeito real.
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => [
        {
          ttl: 60_000,
          limit: 60,
        },
      ],
    }),

    PrismaModule,
    HealthModule,

    // Cross-cutting: CsrfModule @Global exporta generateToken para injeção em AuthController.
    CsrfModule,

    // Cross-cutting (AuditModule é @Global — demais módulos não precisam importar)
    AuditModule,
    NotificationModule,

    // Domínio — 9 módulos por entidade conforme Q7.
    AuthModule,
    UserModule,
    SubmissionModule,
    DocumentoModule,
    AvaliacaoModule,
    MatrizModule,
    EventoModule,
  ],
  providers: [
    // Guard global do throttler. Sem isso, ThrottlerModule configurado
    // é inerte (nenhuma rota é limitada). Fix do Blocker #1 do review Round 2.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // cookie-parser deve vir antes do CSRF (precisa parsear cookies)
    consumer
      .apply(
        cookieParser(),
        // Middleware request-id: gera/lê X-Request-Id e armazena no AsyncLocalStorage
        RequestIdMiddleware,
        // CSRF protection (double-submit cookie)
        (req: Request, res: Response, next: NextFunction) => {
          doubleCsrfProtection(req, res, next);
        },
      )
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
