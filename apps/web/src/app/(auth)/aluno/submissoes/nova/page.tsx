/**
 * Nova submissao — /aluno/submissoes/nova
 * Server Component — tenta buscar categorias da API para popular o Select.
 *
 * DEBITO: GET /categorias esta como stub (NotImplementedException) no backend.
 * Quando implementado, as categorias serao buscadas aqui e passadas como prop.
 * O form usa hardcode das 5 categorias CNE/MEC enquanto o endpoint nao existe.
 */

import { apiFetch } from "@/lib/api-fetch";
import { NovaSubmissaoForm } from "./_components/NovaSubmissaoForm";

interface CategoriaDto {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
}

export default async function NovaSubmissaoPage() {
  // Tenta buscar categorias da API. Se endpoint nao existir (501) ou falhar,
  // o formulario usa hardcode das 5 categorias CNE/MEC do seed.
  let categorias: { id: string; nome: string }[] | null = null;

  try {
    const result = await apiFetch<CategoriaDto[]>("/categorias");
    if (result.ok && result.data && Array.isArray(result.data)) {
      categorias = result.data
        .filter((c) => c.ativo)
        .map((c) => ({ id: c.id, nome: c.nome }));
    }
  } catch {
    // GET /categorias ainda nao implementado — formulario usa hardcode
    categorias = null;
  }

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

      <NovaSubmissaoForm categorias={categorias ?? undefined} />
    </div>
  );
}
