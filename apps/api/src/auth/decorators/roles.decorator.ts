import { SetMetadata } from "@nestjs/common";
import { Role } from "@easycert/types";

/**
 * Decorator que define os papéis exigidos para acessar uma rota.
 * Usado em conjunto com RolesGuard.
 *
 * Exemplo: @Roles('COORDENADOR', 'ADMIN')
 */
export const ROLES_KEY = "roles";
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
