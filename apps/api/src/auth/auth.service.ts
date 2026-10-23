import { Injectable, NotImplementedException } from "@nestjs/common";

/**
 * AuthService — implementação real em T6 Round 4.
 *
 * validateUser: valida credenciais via argon2 + busca no banco.
 * login: gera JWT e configura cookie.
 */
@Injectable()
export class AuthService {
  /**
   * Valida email + senha.
   * STUB: lança NotImplementedException — T6 Round 4 implementa via argon2 + UserService.
   */
  async validateUser(_email: string, _senha: string): Promise<never> {
    throw new NotImplementedException(
      "AuthService.validateUser: implementação pendente — T6 Round 4",
    );
  }

  /**
   * Gera JWT para o usuário validado e retorna token.
   * STUB: lança NotImplementedException — T6 Round 4.
   */
  async login(_userId: string, _role: string): Promise<never> {
    throw new NotImplementedException(
      "AuthService.login: implementação pendente — T6 Round 4",
    );
  }
}
