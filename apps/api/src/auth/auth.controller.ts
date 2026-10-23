import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Inject,
} from "@nestjs/common";
import { Response, Request } from "express";
import { LoginSchema } from "@easycert/types";
import { ZodValidationPipe } from "nestjs-zod";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { AuthenticatedUser } from "./strategies/jwt.strategy";
import { CSRF_GENERATE_TOKEN } from "../common/csrf/csrf.module";

/**
 * AuthController — rotas de autenticação.
 *
 * POST /auth/login       — isentado do CSRF (ver csrf.setup.ts skipCsrfProtection)
 * GET  /auth/me          — retorna usuário autenticado (JWT guard)
 * POST /auth/logout      — limpa cookie de sessão (exempt CSRF)
 * GET  /auth/csrf-token  — emite cookie csrf-token via generateToken
 */
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    @Inject(CSRF_GENERATE_TOKEN)
    private readonly csrfGenerateToken: (req: Request, res: Response, options?: { overwrite?: boolean; validateOnReuse?: boolean }) => string,
  ) {}

  /**
   * Login: valida credenciais e seta cookie `easycert_session`.
   * Rota isenta de CSRF (primeiro turno — aluno ainda não tem cookie CSRF).
   * Decisão Q6.8 ratificada.
   */
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) body: { email: string; senha: string },
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const validated = await this.authService.validateUser(body.email, body.senha);

    if (!validated) {
      throw new UnauthorizedException("credenciais inválidas");
    }

    const token = await this.authService.login(validated);

    // Cookie HttpOnly SameSite=Lax — decisão Q6 ratificada.
    const isProd = process.env.NODE_ENV === "production";
    res.cookie("easycert_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias em ms
    });

    // Busca o usuário para montar a resposta (sem passwordHash).
    const user = await this.userService.findById(validated.id);

    return {
      user: {
        id: user!.id,
        email: user!.email,
        nome: user!.nome,
        role: user!.role,
      },
    };
  }

  /**
   * Me: retorna o usuário da sessão JWT atual.
   * 401 se token expirado ou usuário não encontrado (sessão órfã).
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    const authUser = req.user as AuthenticatedUser;
    const user = await this.userService.findById(authUser.userId);

    if (!user) {
      throw new UnauthorizedException("sessão inválida");
    }

    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      matricula: user.matricula,
      curso: user.curso,
      dataIngresso: user.dataIngresso,
    };
  }

  /**
   * Logout: limpa cookie de sessão. Exempt do CSRF (cookie pode estar expirado).
   */
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("easycert_session", { path: "/" });
  }

  /**
   * CSRF token: chama generateToken do csrf-csrf para emitir o cookie `csrf-token`.
   * O token é incluído no header `X-Csrf-Token` da response e no cookie.
   * Fluxo: login → GET /auth/csrf-token → próximas mutations incluem X-CSRF-Token.
   */
  @Get("csrf-token")
  csrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Gera (ou regenera) o token CSRF e seta o cookie `csrf-token`.
    const token = this.csrfGenerateToken(req, res);
    return { ok: true, csrfToken: token };
  }
}
