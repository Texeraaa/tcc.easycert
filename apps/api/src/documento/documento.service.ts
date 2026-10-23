import { Injectable, NotImplementedException } from "@nestjs/common";

/**
 * DocumentoService — versionamento de PDFs e emissão de certificados.
 * Implementação real em T7 Round 4.
 */
@Injectable()
export class DocumentoService {
  /**
   * Verifica documento pelo código opaco UUIDv4 (rota pública /v/:codigo).
   * STUB — T7 Round 4.
   */
  async verifyByCodigo(_codigo: string): Promise<never> {
    throw new NotImplementedException(
      "DocumentoService.verifyByCodigo: implementação pendente — T7 Round 4",
    );
  }

  /**
   * Gera presigned POST para upload direto ao MinIO.
   * STUB — T7 Round 4.
   */
  async generatePresignedPost(_submissionId: string): Promise<never> {
    throw new NotImplementedException(
      "DocumentoService.generatePresignedPost: implementação pendente — T7 Round 4",
    );
  }
}
