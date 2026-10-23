import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@easycert/types";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { Request } from "express";

/**
 * Guard de autorização por papel (RBAC simples).
 * Lê metadata @Roles(...) via Reflector e compara com req.user.role.
 * Deve ser usado APÓS JwtAuthGuard (que popula req.user).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lê papéis exigidos pela rota (handler ou classe)
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sem @Roles → rota aberta (qualquer autenticado)
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as { userId: string; role: Role } | undefined;

    if (!user) return false;

    return required.includes(user.role);
  }
}
