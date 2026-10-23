import { AsyncLocalStorage } from "async_hooks";

// Contexto armazenado por request.
export interface RequestContext {
  requestId: string;
}

// Instância única compartilhada no processo.
export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Retorna o requestId do contexto atual, ou undefined se chamado
 * fora de um contexto de request (ex.: inicialização do app).
 */
export function getRequestId(): string | undefined {
  return requestContextStorage.getStore()?.requestId;
}
