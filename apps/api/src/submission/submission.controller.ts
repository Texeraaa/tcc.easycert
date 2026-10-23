import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SubmissionService } from "./submission.service";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";
import { CreateSubmissionSchema, ConfirmSubmissionSchema } from "@easycert/types";
import { ZodValidationPipe } from "nestjs-zod";
import type { CreateSubmissionDto, ConfirmSubmissionDto } from "@easycert/types";

/**
 * SubmissionController — ciclo de vida das submissões.
 *
 * POST /submissions             — cria submissão (aluno autenticado)
 * GET  /submissions/me          — lista submissões do aluno (cursor-based)
 * GET  /submissions/:id         — detalhe de uma submissão
 * POST /submissions/:id/confirm — confirma upload (AWAITING_UPLOAD → PENDING)
 *
 * Todas as rotas exigem JWT.
 */
@Controller("submissions")
@UseGuards(JwtAuthGuard)
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  /**
   * Cria nova submissão para o aluno autenticado.
   * Retorna a submissão criada + dados para upload direto (presigned POST).
   */
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateSubmissionSchema)) body: CreateSubmissionDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.submissionService.create(user.userId, body);
  }

  /**
   * Lista submissões do aluno autenticado com cursor-based pagination.
   * Query params: cursor (opcional), limit (padrão 20).
   */
  @Get("me")
  findMine(
    @Req() req: Request,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.submissionService.listForAluno(
      user.userId,
      cursor,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * Detalhe de uma submissão pelo ID.
   * 403 se a submissão não pertencer ao aluno autenticado.
   */
  @Get(":id")
  findById(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.submissionService.findByIdForAluno(id, user.userId);
  }

  /**
   * Confirma upload do documento: valida magic bytes e transiciona estado.
   * Body: { storageKey: string } — o key retornado pelo presigned POST.
   */
  @Post(":id/confirm")
  confirm(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(ConfirmSubmissionSchema)) body: ConfirmSubmissionDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.submissionService.confirm(id, user.userId, body.storageKey);
  }
}
