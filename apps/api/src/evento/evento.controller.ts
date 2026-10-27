import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { EventoService } from "./evento.service";
import { AuthenticatedUser } from "../auth/strategies/jwt.strategy";

/**
 * EventoController — gerencia EventoInterno.
 *
 * GET    /eventos       — lista eventos (JWT obrigatório)
 * POST   /eventos       — cria evento (ADMIN)
 * PATCH  /eventos/:id   — atualiza evento (ADMIN)
 * DELETE /eventos/:id   — remove evento (ADMIN)
 */
@Controller("eventos")
@UseGuards(JwtAuthGuard)
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  /**
   * Lista eventos internos.
   * STUB — T6 Round 4.
   */
  @Get()
  findAll() {
    return this.eventoService.findAll();
  }

  /**
   * Cria novo evento interno.
   * Restrito a ADMIN.
   * STUB — T6 Round 4.
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  create(@Body() body: unknown, @Req() req: Request) {
    // TODO: validação de CreateEventoDto (validação pendente — ver docs/dominio/pendencias.md)
    const user = req.user as AuthenticatedUser;
    return this.eventoService.create(user.userId, body);
  }

  /**
   * Atualiza evento existente.
   * Restrito a ADMIN.
   * STUB — T6 Round 4.
   */
  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  update(@Param("id") id: string, @Body() body: unknown) {
    // TODO: validação de UpdateEventoDto (validação pendente — ver docs/dominio/pendencias.md)
    return this.eventoService.update(id, body);
  }

  /**
   * Remove evento.
   * Restrito a ADMIN.
   * STUB — T6 Round 4.
   */
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.eventoService.remove(id);
  }
}
