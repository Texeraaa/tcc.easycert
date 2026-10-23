import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { LoginSchema } from "@easycert/types";
import { ZodValidationPipe } from "nestjs-zod";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

/**
 * AuthController — rotas de autenticação.
 *
 * POST /auth/login       — isentado do CSRF (ver AppModule.skipCsrfProtection)
 * GET  /auth/me          — retorna usuário autenticado (JWT guard)
 * POST /auth/logout      — limpa cookie de sessão
 * GET  /auth/csrf-token  — o middleware csrf-csrf já setou o cookie; responde { ok: true }
 */
@Controller("auth")
export class AuthController {
  /**
   * Login: valida credenciais e seta cookie `easycert_session`.
   *
   * STUB: AuthService.login está pendente (T6 Round 4).
   * A rota existe para que o csrf-csrf a reconheça como isenta e para que
   * o frontend já possa integrar o formulário de login.
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) _body: unknown,
    @Res({ passthrough: true }) _res: Response,
  ) {
    // TODO: T6 Round 4 — chamar authService.validateUser() + authService.login()
    // + res.cookie('easycert_session', token, { httpOnly: true, sameSite: 'lax', ... })
    throw Object.assign(new Error("Não implementado"), { status: 501 });
  }

  /**
   * Me: retorna usuário da sessão JWT atual.
   * STUB: T6 Round 4.
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  me() {
    // TODO: T6 Round 4 — retornar req.user populado pelo JwtStrategy
    throw Object.assign(new Error("Não implementado"), { status: 501 });
  }

  /**
   * Logout: limpa cookie de sessão. Exempt do CSRF (ver AppModule).
   */
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("easycert_session", { path: "/" });
  }

  /**
   * CSRF token: o middleware csrf-csrf já setou o cookie `csrf-token` antes
   * de chegarmos aqui. Apenas respondemos para o browser finalizar o GET.
   */
  @Get("csrf-token")
  csrfToken() {
    return { ok: true };
  }
}
