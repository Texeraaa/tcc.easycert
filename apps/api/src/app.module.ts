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

// Middleware CSRF importado dinamicamente para evitar problemas de import ESM
// csrf-csrf v4 usa getSecret + getSessionIdentifier (double-submit cookie)
import { doubleCsrf } from "csrf-csrf";
import cookieParser from "cookie-parser";
import { Request, Response, NextFunction } from "express";

// Configura o middleware CSRF uma única vez (singleton por processo).
// isProd avaliado após main.ts carregar .env.local via dotenv (Blocker #2 do review).
// Rotas exempt: POST /auth/login, POST /auth/logout, GET /auth/csrf-token.
const isProd = process.env.NODE_ENV === "production";

const { doubleCsrfProtection } = doubleCsrf({
  getSecret: () => {
    // CSRF_SECRET validado por validateEnv (min 32 chars) antes do boot continuar.
    // Sem fallback — ausência em runtime é bug de configuração (não deve acontecer).
    const secret = process.env.CSRF_SECRET;
    if (!secret) {
      throw new Error(
        "CSRF_SECRET ausente em runtime — validateEnv deveria ter travado o boot",
      );
    }
    return secret;
  },
  getSessionIdentifier: (req: Request) => {
    // Usa cookie de sessão JWT como identificador. Fallback "anon" (string
    // constante) para pré-login: o CSRF token amarrado a esse identificador
    // é indiferente porque todas as rotas pré-login são exempt. Evita vazar
    // req.ip (que pode ser compartilhado atrás de proxy sem trust proxy).
    const cookies = req.cookies as Record<string, string | undefined>;
    return cookies["easycert_session"] ?? "anon";
  },
  cookieName: "csrf-token",
  cookieOptions: {
    httpOnly: false, // frontend JS precisa ler o cookie para enviar no header
    sameSite: "lax",
    secure: isProd,
    path: "/",
  },
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  skipCsrfProtection: (req: Request) => {
    // Rotas exempt conforme decisão ratificada (Q6.8 / CSRF exempt list)
    const url = req.url ?? "";
    const method = req.method?.toUpperCase() ?? "";

    if (method === "POST" && url.startsWith("/auth/login")) return true;
    if (method === "POST" && url.startsWith("/auth/logout")) return true;
    if (url.startsWith("/auth/csrf-token")) return true;

    return false;
  },
});

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
