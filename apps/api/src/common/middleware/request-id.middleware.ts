import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { requestContextStorage } from "../context/request-context";

/**
 * Garante um único X-Request-Id por request, consistente entre:
 *   - req.id setado por pino-http via genReqId (log structured)
 *   - response header X-Request-Id (cliente / proxy correlacionam)
 *   - AsyncLocalStorage (filtros, services, downstream)
 *
 * Ordem de precedência (herda em vez de regerar — evita divergência Pino↔header):
 *   1. req.id já setado por pino-http (quando LoggerModule rodou primeiro)
 *   2. header X-Request-Id do request (proxy upstream propagou)
 *   3. UUID novo
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const reqAny = req as unknown as { id?: string };
    const requestId =
      reqAny.id ??
      (req.headers["x-request-id"] as string | undefined) ??
      randomUUID();

    // Fixa req.id para quaisquer middlewares/handlers downstream
    reqAny.id = requestId;

    // Anexa ao response
    res.setHeader("X-Request-Id", requestId);

    // Roda o restante do pipeline dentro do contexto de storage
    requestContextStorage.run({ requestId }, () => {
      next();
    });
  }
}
