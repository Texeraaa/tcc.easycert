/**
 * Singleton do csrf-csrf — configurado uma única vez por processo.
 *
 * Exportado como módulo separado para que AppModule (middleware) e
 * AuthController (generateToken na rota csrf-token) compartilhem
 * a mesma instância sem introduzir dependência circular.
 */
import { doubleCsrf } from "csrf-csrf";
import { Request } from "express";

const isProd = process.env.NODE_ENV === "production";

export const {
  doubleCsrfProtection,
  generateCsrfToken: csrfGenerateToken,
} = doubleCsrf({
  getSecret: () => {
    const secret = process.env.CSRF_SECRET;
    if (!secret) {
      throw new Error(
        "CSRF_SECRET ausente em runtime — validateEnv deveria ter travado o boot",
      );
    }
    return secret;
  },
  getSessionIdentifier: (req: Request) => {
    // Usa cookie de sessão JWT como identificador. Fallback "anon" para pré-login.
    const cookies = req.cookies as Record<string, string | undefined>;
    return cookies["easycert_session"] ?? "anon";
  },
  cookieName: "csrf-token",
  cookieOptions: {
    httpOnly: false, // frontend JS precisa ler o cookie para enviar no header
    sameSite: "lax",
    secure: isProd,
    path: "/",
  },
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  skipCsrfProtection: (req: Request) => {
    // Rotas exempt conforme decisão ratificada (Q6.8 / CSRF exempt list)
    const url = req.url ?? "";
    const method = req.method?.toUpperCase() ?? "";

    if (method === "POST" && url.startsWith("/auth/login")) return true;
    if (method === "POST" && url.startsWith("/auth/logout")) return true;
    if (url.startsWith("/auth/csrf-token")) return true;

    return false;
  },
});
