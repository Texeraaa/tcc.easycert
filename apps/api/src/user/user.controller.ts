import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserService } from "./user.service";

/**
 * UserController — gerencia perfil de usuário.
 *
 * GET  /users/:id   — detalhe do usuário
 * PATCH /users/:id  — atualiza perfil
 *
 * Todas as rotas exigem JWT.
 */
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retorna perfil do usuário pelo ID.
   * STUB — T6 Round 4.
   */
  @Get(":id")
  findById(@Param("id") id: string) {
    return this.userService.findById(id);
  }

  /**
   * Atualiza nome, matricula ou curso do usuário.
   * STUB — T6 Round 4.
   */
  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    // TODO: validação de UpdateUserDto (validação pendente — ver docs/dominio/pendencias.md)
    return this.userService.update(id, body);
  }
}
