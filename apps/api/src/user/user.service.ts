import { Injectable, NotImplementedException } from "@nestjs/common";

/**
 * UserService — CRUD de usuários.
 * Implementação real em T6 Round 4.
 */
@Injectable()
export class UserService {
  /**
   * Busca usuário pelo ID.
   * STUB — T6 Round 4.
   */
  async findById(_id: string): Promise<never> {
    throw new NotImplementedException(
      "UserService.findById: implementação pendente — T6 Round 4",
    );
  }

  /**
   * Busca usuário pelo e-mail.
   * STUB — T6 Round 4 (usado por AuthService.validateUser).
   */
  async findByEmail(_email: string): Promise<never> {
    throw new NotImplementedException(
      "UserService.findByEmail: implementação pendente — T6 Round 4",
    );
  }

  /**
   * Cria novo usuário.
   * STUB — T6 Round 4.
   */
  async create(_data: unknown): Promise<never> {
    throw new NotImplementedException(
      "UserService.create: implementação pendente — T6 Round 4",
    );
  }

  /**
   * Atualiza dados do usuário.
   * STUB — T6 Round 4.
   */
  async update(_id: string, _data: unknown): Promise<never> {
    throw new NotImplementedException(
      "UserService.update: implementação pendente — T6 Round 4",
    );
  }
}
