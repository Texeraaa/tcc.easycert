import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { SubmissionService } from "./submission.service";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";
import { CreateSubmissionSchema } from "@easycert/types";
import { ZodValidationPipe } from "nestjs-zod";

/**
 * SubmissionController — ciclo de vida das submissões.
 *
 * POST /submissions             — cria submissão (aluno autenticado)
 * GET  /submissions/me          — lista submissões do aluno
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
   * Cria nova submissão.
   * STUB — T7 Round 4.
   */
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateSubmissionSchema)) body: unknown,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;
    return this.submissionService.create(user.userId, body);
  }

  /**
   * Lista submissões do aluno autenticado.
   * STUB — T7 Round 4.
   */
  @Get("me")
  findMine(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.submissionService.findByAluno(user.userId);
  }

  /**
   * Detalhe de uma submissão pelo ID.
   * STUB — T7 Round 4.
   */
  @Get(":id")
  findById(@Param("id") id: string) {
    return this.submissionService.findById(id);
  }

  /**
   * Confirma upload do documento: transiciona AWAITING_UPLOAD → PENDING.
   * STUB — T7 Round 4.
   */
  @Post(":id/confirm")
  confirm(@Param("id") id: string, @Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.submissionService.confirm(id, user.userId);
  }
}
