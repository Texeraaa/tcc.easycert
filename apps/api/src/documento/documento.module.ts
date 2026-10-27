import { Module } from "@nestjs/common";
import { DocumentoService } from "./documento.service";
import { DocumentoController } from "./documento.controller";

/**
 * DocumentoModule — versionamento de PDFs + verificação pública via QRCode.
 */
@Module({
  controllers: [DocumentoController],
  providers: [DocumentoService],
  exports: [DocumentoService],
})
export class DocumentoModule {}
