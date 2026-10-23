import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserService } from "./user.service";

/**
 * UserController — gerencia perfil de usuário.
 *
 * GET  /users/:id   — detalhe do usuário (real: T6 Round 4)
 * PATCH /users/:id  — atualiza perfil (stub: Mês 3)
 *
 * Todas as rotas exigem JWT.
 */
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retorna perfil do usuário pelo ID.
   * 404 se não encontrado. Exclui passwordHash da resposta.
   */
  @Get(":id")
  async findById(@Param("id") id: string) {
    const user = await this.userService.findById(id);

    if (!user) {
      throw new NotFoundException("usuário não encontrado");
    }

    const { passwordHash: _, ...userWithoutHash } = user;
    return userWithoutHash;
  }

  /**
   * Atualiza nome, matricula ou curso do usuário.
   * STUB — Mês 3.
   */
  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    // TODO: validação de UpdateUserDto (validação pendente — ver docs/dominio/pendencias.md)
    return this.userService.update(id, body);
  }
}
