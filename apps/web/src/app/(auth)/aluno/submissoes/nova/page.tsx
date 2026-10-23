/**
 * Nova submissao — /aluno/submissoes/nova
 * Server Component (renderiza o formulario client-side via componente filho).
 *
 * TODO (Round 4 T7): implementar fluxo completo de upload direto MinIO.
 */

import { NovaSubmissaoForm } from "./_components/NovaSubmissaoForm";

export default function NovaSubmissaoPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Nova submissao
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Envie um documento PDF para comprovacao de atividade complementar.
        </p>
      </div>

      <NovaSubmissaoForm />
    </div>
  );
}
