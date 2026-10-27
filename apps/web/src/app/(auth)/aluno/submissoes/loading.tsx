/**
 * Estado de carregamento da lista de submissoes.
 * Exibido pelo Next.js enquanto o Server Component busca dados da API.
 */
export default function SubmissoesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded bg-[var(--muted)]" />
          <div className="h-4 w-72 animate-pulse rounded bg-[var(--muted)]" />
        </div>
        <div className="h-9 w-36 animate-pulse rounded bg-[var(--muted)]" />
      </div>

      <div className="rounded-lg border border-[var(--border)]">
        {/* Cabecalho da tabela skeleton */}
        <div className="flex gap-4 border-b border-[var(--border)] px-4 py-3">
          {[120, 80, 100, 100, 60].map((w, i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-[var(--muted)]"
              style={{ width: w }}
            />
          ))}
        </div>
        {/* Linhas skeleton */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-4 border-b border-[var(--border)] px-4 py-4 last:border-0"
          >
            {[120, 80, 100, 100, 60].map((w, j) => (
              <div
                key={j}
                className="h-4 animate-pulse rounded bg-[var(--muted)]"
                style={{ width: w }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
