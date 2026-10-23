import {
  Injectable,
  NotImplementedException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import type { Submission } from "@easycert/db";
import type { CreateSubmissionDto } from "@easycert/types";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { DocumentoService, PresignedPostResult } from "../documento/documento.service";

/**
 * Resultado da criação de submissão: submissão + dados para upload direto ao storage.
 */
export interface CreateSubmissionResult {
  submission: Submission;
  upload: PresignedPostResult;
}

/**
 * SubmissionService — ciclo de vida das submissões de atividades complementares.
 */
@Injectable()
export class SubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly documentoService: DocumentoService,
  ) {}

  /**
   * Cria nova submissão para o aluno autenticado.
   *
   * Estado inicial: AWAITING_UPLOAD.
   * Retorna a submissão criada + presigned POST para upload direto ao MinIO.
   * O frontend usa o presigned POST para enviar o PDF, depois chama confirm.
   */
  async create(
    alunoId: string,
    data: CreateSubmissionDto,
  ): Promise<CreateSubmissionResult> {
    const submission = await this.prisma.submission.create({
      data: {
        alunoId,
        categoriaId: data.categoriaId,
        cargaInformadaHoras: data.cargaInformadaHoras,
        instituicao: data.instituicao,
        estado: "AWAITING_UPLOAD",
      },
    });

    await this.auditService.log({
      actorId: alunoId,
      action: "submission.state_changed",
      entity: "Submission",
      entityId: submission.id,
      after: { estado: "AWAITING_UPLOAD" },
    });

    const upload = await this.documentoService.createPresignedPost(
      submission.id,
      alunoId,
    );

    return { submission, upload };
  }

  /**
   * Lista submissões do aluno com cursor-based pagination.
   * Apenas retorna submissões do próprio aluno (alunoId como filtro).
   */
  async listForAluno(
    alunoId: string,
    cursor?: string,
    limit = 20,
  ): Promise<{ items: Submission[]; nextCursor: string | null }> {
    const take = Math.min(limit, 100); // limita a 100 por página

    const items = await this.prisma.submission.findMany({
      where: { alunoId },
      orderBy: { createdAt: "desc" },
      take: take + 1, // busca 1 a mais para detectar próxima página
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1, // pula o cursor atual
          }
        : {}),
    });

    const hasNext = items.length > take;
    const page = hasNext ? items.slice(0, take) : items;
    const nextCursor = hasNext ? (page[page.length - 1]?.id ?? null) : null;

    return { items: page, nextCursor };
  }

  /**
   * Retorna detalhe de uma submissão, verificando que pertence ao aluno.
   *
   * Lança 404 tanto se não existir quanto se pertencer a outro aluno — padrão
   * correto para rotas de recurso privadas (não vaza existência do ID por 403).
   * Decisão: UUIDv4 reduz impacto prático de enumeração, mas unificar em 404
   * evita confirmar IDs em share links antigos ou vazamentos em logs.
   */
  async findByIdForAluno(
    submissionId: string,
    alunoId: string,
  ): Promise<Submission> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission || submission.alunoId !== alunoId) {
      throw new NotFoundException("submissão não encontrada");
    }

    return submission;
  }

  /**
   * Confirma que o upload foi realizado: valida magic bytes PDF e transiciona
   * o estado da submissão de AWAITING_UPLOAD para PENDING (ou UPLOAD_INVALID).
   *
   * O frontend envia o storageKey retornado pelo presigned POST.
   * O service valida que o key pertence ao aluno e à submissão antes de confirmar.
   */
  async confirm(
    submissionId: string,
    alunoId: string,
    storageKey: string,
  ): Promise<Submission> {
    const submission = await this.findByIdForAluno(submissionId, alunoId);

    if (submission.estado !== "AWAITING_UPLOAD") {
      throw new BadRequestException(
        `submissão não está aguardando upload (estado atual: ${submission.estado})`,
      );
    }

    // Valida que o key pertence ao aluno e à submissão (evita IDOR)
    const expectedPrefix = `_tmp/${alunoId}/${submissionId}/`;
    if (!storageKey.startsWith(expectedPrefix)) {
      throw new BadRequestException("storageKey inválido para esta submissão");
    }

    const confirmResult = await this.documentoService.confirmUpload(
      submissionId,
      storageKey,
    );

    if (confirmResult.ok) {
      const updated = await this.prisma.submission.update({
        where: { id: submissionId },
        data: { estado: "PENDING" },
      });

      await this.auditService.log({
        actorId: alunoId,
        action: "submission.state_changed",
        entity: "Submission",
        entityId: submissionId,
        before: { estado: "AWAITING_UPLOAD" },
        after: { estado: "PENDING" },
      });

      return updated;
    } else {
      const updated = await this.prisma.submission.update({
        where: { id: submissionId },
        data: { estado: "UPLOAD_INVALID" },
      });

      await this.auditService.log({
        actorId: alunoId,
        action: "submission.state_changed",
        entity: "Submission",
        entityId: submissionId,
        before: { estado: "AWAITING_UPLOAD" },
        after: { estado: "UPLOAD_INVALID" },
        reason: confirmResult.reason,
      });

      return updated;
    }
  }

  /**
   * Realiza transição de estado da submissão (uso futuro pelo coordenador).
   * STUB — Mês 3.
   */
  async transitionState(_id: string, _newState: string): Promise<never> {
    throw new NotImplementedException(
      "SubmissionService.transitionState: implementação pendente — Mês 3",
    );
  }
}
