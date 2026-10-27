import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Guard JWT: exige cookie `easycert_session` válido.
 * Wrapper fino sobre passport-jwt para reutilização via @UseGuards(JwtAuthGuard).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
