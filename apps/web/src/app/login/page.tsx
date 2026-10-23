/**
 * Pagina de login — /login
 * Server Component (renderiza form client-side via componente filho).
 * Rota publica — excluida do matcher do middleware.
 *
 * LoginForm usa useSearchParams() (para ler returnTo), por isso e envolvido
 * em Suspense conforme exigido pelo Next.js 15 (evita CSR bailout no build).
 */

import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Entrar - easycert",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Wordmark */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            easycert
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Acesse sua conta para continuar.
          </p>
        </div>

        {/* Suspense necessario pois LoginForm usa useSearchParams() */}
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

/** Skeleton minimo exibido enquanto LoginForm hidrata */
function LoginFormSkeleton() {
  return (
    <div className="rounded-lg border border-[var(--border)] p-6 space-y-4">
      <div className="h-5 w-20 animate-pulse rounded bg-[var(--muted)]" />
      <div className="space-y-3">
        <div className="h-9 animate-pulse rounded bg-[var(--muted)]" />
        <div className="h-9 animate-pulse rounded bg-[var(--muted)]" />
      </div>
      <div className="h-10 animate-pulse rounded bg-[var(--muted)]" />
    </div>
  );
}
