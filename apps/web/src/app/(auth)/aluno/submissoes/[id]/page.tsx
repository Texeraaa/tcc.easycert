/**
 * Detalhe de submissao — /aluno/submissoes/[id]
 * Server Component.
 *
 * TODO (Round 4 T7): integrar com GET /submissions/:id (detalhe + historico de estados).
 */

interface SubmissaoDetalhePageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmissaoDetalhePage({
  params,
}: SubmissaoDetalhePageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Submissao
        </h1>
        <p className="mt-1 font-mono text-sm text-[var(--muted-foreground)]">
          {id}
        </p>
      </div>

      {/* TODO (Round 4 T7): substituir pelo detalhe real de GET /submissions/:id */}
      <div className="rounded-lg border border-[var(--border)] p-6 text-sm text-[var(--muted-foreground)]">
        Detalhe da submissao sera implementado no Round 4 T7.
      </div>
    </div>
  );
}
