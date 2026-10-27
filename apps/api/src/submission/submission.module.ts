import { Module } from "@nestjs/common";
import { SubmissionService } from "./submission.service";
import { SubmissionController } from "./submission.controller";
import { DocumentoModule } from "../documento/documento.module";

/**
 * SubmissionModule — ciclo de vida das submissões de atividades complementares.
 * Importa DocumentoModule para que SubmissionService possa gerar presigned POST
 * e confirmar uploads via DocumentoService.
 */
@Module({
  imports: [DocumentoModule],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
