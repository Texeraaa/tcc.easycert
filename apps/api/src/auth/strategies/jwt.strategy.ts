import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { Role } from "@easycert/types";

/**
 * Payload decodificado do JWT armazenado no cookie `easycert_session`.
 */
export interface JwtPayload {
  sub: string;
  role: Role;
  iat?: number;
  exp?: number;
}

/**
 * Objeto populado em req.user após validação JWT bem-sucedida.
 */
export interface AuthenticatedUser {
  userId: string;
  role: Role;
}

/**
 * Extrator de cookie: lê `easycert_session` do objeto cookies do Express.
 * O cookie-parser já deve ter parseado os cookies antes desta strategy rodar.
 */
function cookieExtractor(req: Request): string | null {
  if (!req?.cookies) return null;
  const cookies = req.cookies as Record<string, string | undefined>;
  return cookies["easycert_session"] ?? null;
}

/**
 * Strategy JWT: lê o cookie `easycert_session`, valida assinatura e expiry,
 * retorna { userId, role } que o NestJS popula em req.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return { userId: payload.sub, role: payload.role };
  }
}
