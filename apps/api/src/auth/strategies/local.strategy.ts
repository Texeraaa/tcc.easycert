import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

/**
 * Strategy Passport local: valida email + senha no body.
 * Chama AuthService.validateUser() — implementação real em T6 Round 4.
 * Usa campo `email` em vez do padrão `username` do passport-local.
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: "email", passwordField: "senha" });
  }

  async validate(email: string, senha: string): Promise<unknown> {
    return this.authService.validateUser(email, senha);
  }
}
