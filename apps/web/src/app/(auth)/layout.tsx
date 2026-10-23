/**
 * Layout da area autenticada do easycert.
 * Server Component — busca usuario via /auth/me antes de renderizar.
 *
 * Paginas sob (auth)/:
 *   /aluno               — home do aluno (T6)
 *   /aluno/submissoes    — lista de submissoes (T7)
 *   /aluno/submissoes/nova    — form de upload (T7)
 *   /aluno/submissoes/[id]   — detalhe (T7)
 */

import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/get-current-user";
import { AppHeader } from "./_components/AppHeader";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Busca usuario — retorna null silenciosamente se /auth/me ainda nao existe (Round 4)
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--background)]">
      <AppHeader userName={user?.nome ?? null} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  );
}
