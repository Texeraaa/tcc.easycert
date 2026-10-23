import {
  Controller,
  Get,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { DocumentoService } from "./documento.service";

/**
 * DocumentoController — verificação pública de documentos via QRCode.
 *
 * GET /v/:codigo — rota pública sem autenticação.
 *   Throttle override: 30 req/min (decisão B1 + Q7.1 ratificadas).
 */
@Controller("v")
export class DocumentoController {
  constructor(private readonly documentoService: DocumentoService) {}

  /**
   * Verifica autenticidade de documento pelo código opaco UUIDv4.
   * Rota pública — sem JwtAuthGuard.
   * Throttle reduzido a 30 req/min conforme decisões B1 e Q7.1 ratificadas.
   *
   * Resposta pública — não vaza identificadores internos (storageKey, submissionId,
   * alunoId). Verificador externo (empresa, banca) só precisa saber se o documento
   * é autêntico, seu tipo e data de emissão.
   *
   *   - 404 se código não encontrado
   *   - { status: 'revogado', codigo, revogadoEm } se revogado
   *   - { status: 'valido', codigo, tipo, confirmedAt, version } se válido
   */
  @Get(":codigo")
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async verifyByCodigo(@Param("codigo") codigo: string) {
    const documento = await this.documentoService.verifyByCodigo(codigo);

    if (!documento) {
      throw new NotFoundException("documento não encontrado");
    }

    if (documento.revogadoEm !== null) {
      return {
        status: "revogado",
        codigo: documento.codigo,
        revogadoEm: documento.revogadoEm,
      };
    }

    return {
      status: "valido",
      codigo: documento.codigo,
      tipo: documento.tipo,
      confirmedAt: documento.confirmedAt,
      version: documento.version,
    };
  }
}
