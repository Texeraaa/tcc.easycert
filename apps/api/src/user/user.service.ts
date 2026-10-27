import { Injectable, NotImplementedException } from "@nestjs/common";
import type { User } from "@easycert/db";
import { PrismaService } from "../prisma/prisma.service";

/**
 * UserService — CRUD de usuários.
 */
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Busca usuário pelo ID. Retorna null se não existir.
   */
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Busca usuário pelo e-mail. Retorna null se não existir.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Cria novo usuário.
   * STUB — admin cria usuários no Mês 3.
   */
  async create(_data: unknown): Promise<never> {
    throw new NotImplementedException(
      "UserService.create: criação via admin pendente — Mês 3",
    );
  }

  /**
   * Atualiza dados do usuário.
   * STUB — Mês 3.
   */
  async update(_id: string, _data: unknown): Promise<never> {
    throw new NotImplementedException(
      "UserService.update: implementação pendente — Mês 3",
    );
  }
}
