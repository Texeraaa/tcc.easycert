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
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Erro interno do servidor";

    const requestId = getRequestId();

    if (requestId) {
      res.setHeader("X-Request-Id", requestId);
    }

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
