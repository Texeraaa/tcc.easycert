import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { getRequestId } from "../context/request-context";

/**
 * Filtro global de exceções HTTP.
 * Padroniza o formato de erro e inclui X-Request-Id no response
 * para rastreabilidade (lido do AsyncLocalStorage do RequestIdMiddleware).
 *
 * Também mapeia erros CSRF (csrf-csrf v4 lança com name='EFORBIDDEN')
 * para 403 com mensagem clara, ao invés de cair no fallback 500.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const requestId = getRequestId();

    if (requestId) {
      res.setHeader("X-Request-Id", requestId);
    }

    // Mapeamento de erros CSRF: csrf-csrf v4 lança um http-errors `ForbiddenError`
    // com { name: "ForbiddenError", code: "EBADCSRFTOKEN", status: 403 }.
    // Identificação ESTRITA via code (único) + name (segurança secundária).
    // Match por substring "csrf" foi evitado para não classificar
    // NotImplementedException("CSRF rotation pendente") como 403.
    const errAny = exception as { name?: string; code?: string };
    const isCsrfError =
      errAny?.code === "EBADCSRFTOKEN" ||
      (errAny?.name === "ForbiddenError" && errAny?.code?.startsWith("E"));

    if (isCsrfError) {
      res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        timestamp: new Date().toISOString(),
        path: req.url,
        requestId: requestId ?? null,
        message: "CSRF token ausente ou inválido",
      });
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Erro interno do servidor";

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      requestId: requestId ?? null,
      message:
        typeof message === "string"
          ? message
          : (message as { message?: string }).message ?? message,
    });
  }
}
