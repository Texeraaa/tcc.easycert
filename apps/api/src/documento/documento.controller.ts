import { Controller, Get, Param, HttpStatus, HttpCode } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { DocumentoService } from "./documento.service";

/**
 * DocumentoController — verificação pública de documentos via QRCode.
 *
 * GET /v/:codigo — rota pública sem autenticação.
 *   Throttle override: 30 req/min (decisão B1; default global é 60 req/min).
 */
@Controller("v")
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  /**
   * Verifica autenticidade de documento pelo código opaco UUIDv4.
   * Rota pública — sem JwtAuthGuard.
   * Throttle reduzido a 30 req/min conforme decisão B1 ratificada.
   * STUB — T7 Round 4.
   */
  @Get(":codigo")
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @HttpCode(HttpStatus.NOT_IMPLEMENTED)
  verifyByCodigo(@Param("codigo") codigo: string) {
    // TODO: T7 Round 4 — buscar documento no banco e retornar status real
    return this.documentoService.verifyByCodigo(codigo);
  }
}
