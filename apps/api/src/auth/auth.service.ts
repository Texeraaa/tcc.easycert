import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { verify } from "@node-rs/argon2";
import type { Role } from "@easycert/db";
import { UserService } from "../user/user.service";
import { AuditService } from "../audit/audit.service";

/**
 * Hash argon2id de uma string descartável, usado quando o usuário NÃO existe.
 * Garante custo computacional constante entre "usuário inexistente" e "senha errada",
 * fechando o oráculo de enumeração de emails via timing.
 *
 * Gerado uma vez via `argon2.hash("timing-attack-mitigation-placeholder")` com
 * parâmetros default do @node-rs/argon2 (m=19456, t=2, p=1 — Q5 ratificada).
 * Valor fixo: pode ser commitado (não é segredo, é só uma string hashada).
 */
const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$FRkoH2pPRNieDdYIYALp+g$1TsyEU48iMlXU/ideqaqDgIzD88InZBSb4FoHQANWGo";

/**
 * AuthService — autenticação via argon2 + JWT.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Valida email + senha (argon2id).
   *
   * Retorna { id, role } se credenciais válidas e usuário ativo.
   * Retorna null e registra audit auth.login_failed em caso de falha.
   * Login bem-sucedido NÃO vai no AuditLog (decisão Q3 — apenas Pino).
   *
   * Timing constante: quando o usuário não existe (ou está inativo), ainda roda
   * o `verify` contra DUMMY_PASSWORD_HASH para igualar o custo computacional
   * (~50-200ms) ao caso "usuário existe + senha errada". Fecha oráculo de
   * enumeração de email por timing.
   */
  async validateUser(
    email: string,
    senha: string,
  ): Promise<{ id: string; role: Role } | null> {
    const user = await this.userService.findByEmail(email);

    // Caso usuário não existe OU inativo: roda verify dummy para timing constante.
    if (!user || !user.ativo) {
      await verify(DUMMY_PASSWORD_HASH, senha);
      await this.auditService.log({
        actorId: null,
        action: "auth.login_failed",
        entity: "User",
        entityId: user?.id ?? null,
        metadata: { email, reason: user ? "inactive" : "no_such_user" },
      });
      return null;
    }

    const senhaValida = await verify(user.passwordHash, senha);

    if (!senhaValida) {
      await this.auditService.log({
        actorId: null,
        action: "auth.login_failed",
        entity: "User",
        entityId: user.id,
        metadata: { email, reason: "wrong_password" },
      });
      return null;
    }

    return { id: user.id, role: user.role };
  }

  /**
   * Gera JWT para o usuário autenticado.
   * Retorna o token assinado (será armazenado no cookie pelo controller).
   */
  async login(user: { id: string; role: Role }): Promise<string> {
    return this.jwtService.sign({ sub: user.id, role: user.role });
  }
}
