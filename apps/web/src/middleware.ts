/**
 * Middleware de autenticacao do easycert.
 *
 * Protege todas as rotas sob /aluno/*.
 * Logica: verifica presenca do cookie easycert_session.
 * Se ausente: redireciona 302 para /login.
 * Se presente: passa adiante sem validar JWT (a API NestJS valida).
 *
 * /login NAO e protegido (excluido do matcher).
 */

import { type NextRequest, NextResponse } from "next/server";

/** Nome do cookie de sessao — deve ser igual ao Q6 da spec */
const SESSION_COOKIE = "easycert_session";

export function middleware(request: NextRequest): NextResponse {
  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    // Preserva URL de origem (incluindo query string) para redirect pos-login.
    // Ex: /aluno/submissoes/nova?draft=xyz → returnTo=/aluno/submissoes/nova?draft=xyz
    loginUrl.searchParams.set(
      "returnTo",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(loginUrl, { status: 302 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protege apenas rotas sob /aluno (e sub-rotas).
     * Exclui:
     *   - /login e /login/* (pagina publica)
     *   - /_next/* (assets do Next.js)
     *   - /favicon.ico e demais arquivos estaticos
     */
    "/aluno/:path*",
  ],
};
