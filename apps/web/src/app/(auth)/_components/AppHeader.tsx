/**
 * Header fixo da área autenticada do easycert.
 * Server Component — recebe dados do usuário já resolvidos pelo layout pai.
 */

import Link from "next/link";
import { UserMenu } from "./UserMenu";

interface AppHeaderProps {
  /** Nome do usuário autenticado (ou null se não disponível) */
  userName: string | null;
}

export function AppHeader({ userName }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo / wordmark */}
        <Link
          href="/aluno"
          className="text-lg font-bold tracking-tight text-[var(--foreground)]"
        >
          easycert
        </Link>

        {/* Navegacao e menu do usuario */}
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link
              href="/aluno"
              className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              Inicio
            </Link>
            <Link
              href="/aluno/submissoes"
              className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              Submissoes
            </Link>
          </nav>

          <UserMenu userName={userName} />
        </div>
      </div>
    </header>
  );
}
