/**
 * Helper centralizado de fetch para comunicacao com a API NestJS.
 *
 * - Server-side (RSC, Server Actions): le cookies de `next/headers` e repassa
 *   como header Cookie + X-CSRF-Token em mutations.
 * - Client-side: use `clientApiFetch` que envia com `credentials: 'include'`.
 *
 * Nunca acessa banco. Nunca importa @easycert/db.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

/** Metodos que exigem header CSRF (mutations) */
const MUTATION_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

export interface ApiFetchResponse<T> {
  data: T | null;
  status: number;
  ok: boolean;
}

/**
 * Fetch server-side com reencaminhamento de cookie de sessao e CSRF.
 * Use em RSC e Server Actions.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<ApiFetchResponse<T>> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  const method = (options.method ?? "GET").toUpperCase();
  const isMutation = MUTATION_METHODS.has(method);

  // Monta header Cookie repasando todos os cookies do request Next
  const cookieHeader = cookieStore.toString();

  // Header CSRF apenas em mutations
  const csrfToken = cookieStore.get("csrf-token")?.value;
  const csrfHeader: Record<string, string> =
    isMutation && csrfToken ? { "X-CSRF-Token": csrfToken } : {};

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    ...csrfHeader,
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: options.cache ?? "no-store",
  });

  // Em 5xx, lanca erro
  if (response.status >= 500) {
    throw new Error(
      `Erro interno da API: ${response.status} em ${method} ${path}`,
    );
  }

  let data: T | null = null;

  if (
    response.ok &&
    response.status !== 204 &&
    response.headers.get("content-type")?.includes("application/json")
  ) {
    data = (await response.json()) as T;
  }

  return {
    data,
    status: response.status,
    ok: response.ok,
  };
}

/**
 * Variante simplificada: retorna direto o JSON parseado.
 * Lanca erro em qualquer status nao-ok.
 */
export async function apiFetchJson<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const result = await apiFetch<T>(path, options);

  if (!result.ok) {
    throw new Error(`API retornou ${result.status} em ${path}`);
  }

  if (result.data === null) {
    throw new Error(`API retornou resposta vazia em ${path}`);
  }

  return result.data;
}

/**
 * Helper client-side para uso em Client Components.
 * Usa `credentials: 'include'` para que o browser envie os cookies automaticamente.
 * Nao repassa cookies manualmente (isso e feito pelo browser).
 */
export async function clientApiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<ApiFetchResponse<T>> {
  const method = (options.method ?? "GET").toUpperCase();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status >= 500) {
    throw new Error(
      `Erro interno da API: ${response.status} em ${method} ${path}`,
    );
  }

  let data: T | null = null;

  if (
    response.ok &&
    response.status !== 204 &&
    response.headers.get("content-type")?.includes("application/json")
  ) {
    data = (await response.json()) as T;
  }

  return {
    data,
    status: response.status,
    ok: response.ok,
  };
}
