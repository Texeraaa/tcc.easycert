import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { AvaliacaoService } from "./avaliacao.service";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

/**
 * AvaliacaoController — decisão do coordenador sobre submissões.
 * Exige JWT + papel COORDENADOR.
 *
 * POST  /avaliacoes      — cria avaliação
 * PATCH /avaliacoes/:id  — atualiza comentário
 */
@Controller("avaliacoes")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("COORDENADOR")
export class AvaliacaoController {
  constructor(private readonly avaliacaoService: AvaliacaoService) {}

  /**
   * Cria nova avaliação.
   * STUB — T6 Round 4.
   */
  @Post()
  create(@Body() body: unknown, @Req() req: Request) {
    // TODO: validação de CreateAvaliacaoDto (validação pendente — ver docs/dominio/pendencias.md)
    const user = req.user as AuthenticatedUser;
    return this.avaliacaoService.create(user.userId, body);
  }

  /**
   * Atualiza comentário de avaliação existente.
   * STUB — T6 Round 4.
   */
  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    // TODO: validação de UpdateAvaliacaoDto (validação pendente — ver docs/dominio/pendencias.md)
    return this.avaliacaoService.update(id, body);
  }
}
