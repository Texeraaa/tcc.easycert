/**
 * Helper server-side: busca o usuario autenticado via GET /auth/me.
 *
 * Retorna null em vez de lancar erro se o endpoint ainda nao existe
 * ou retornar 401/404 (Round 4 T6 implementa /auth/me de verdade).
 *
 * O middleware ja garante que chega aqui so com cookie presente;
 * este helper e apenas para popular dados de exibicao.
 */

import { apiFetch } from "./api-fetch";

export interface CurrentUser {
  id: string;
  nome: string;
  email: string;
  role: "ALUNO" | "COORDENADOR" | "ADMIN";
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const result = await apiFetch<CurrentUser>("/auth/me");

    if (!result.ok || !result.data) {
      return null;
    }

    return result.data;
  } catch {
    // /auth/me ainda nao existe (Round 4 T6) — retorna null silenciosamente
    return null;
  }
}
