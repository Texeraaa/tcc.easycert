/**
 * Pagina de login — /login
 * Server Component (renderiza form client-side via componente filho).
 * Rota publica — excluida do matcher do middleware.
 */

import type { Metadata } from "next";
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

        <LoginForm />
      </div>
    </div>
  );
}
