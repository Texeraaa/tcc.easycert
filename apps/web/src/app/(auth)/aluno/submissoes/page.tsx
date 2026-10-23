/**
 * Lista de submissoes do aluno — /aluno/submissoes
 * Server Component.
 *
 * Chama GET /submissions/me para buscar submissoes do aluno autenticado.
 * Paginacao cursor-based: MVP mostra primeiros 20, botao "Carregar mais" e debito.
 *
 * DEBITO: paginacao cursor-based nao implementada (MVP mostra apenas primeiros 20).
 * Implementar quando houver demanda de volume.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api-fetch";
import type { SubmissionResponse, SubmissionState } from "@easycert/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SubmissoesMeResponse {
  items: SubmissionResponse[];
  nextCursor: string | null;
}

/** Mapeamento de estado para variante de badge e texto PT-BR */
function EstadoBadge({ estado }: { estado: SubmissionState }) {
  const config: Record<
    SubmissionState,
    { variant: "gray" | "blue" | "yellow" | "green" | "red" | "orange"; label: string }
  > = {
    AWAITING_UPLOAD: { variant: "gray", label: "Aguardando upload" },
    PENDING: { variant: "blue", label: "Aguardando revisao" },
    UNDER_REVIEW: { variant: "yellow", label: "Em analise" },
    APPROVED: { variant: "green", label: "Aprovado" },
    REJECTED: { variant: "red", label: "Indeferido" },
    CORRECTION_REQUESTED: { variant: "orange", label: "Correcao solicitada" },
    UPLOAD_INVALID: { variant: "red", label: "Upload invalido" },
  };

  const { variant, label } = config[estado] ?? {
    variant: "gray",
    label: estado,
  };

  return <Badge variant={variant}>{label}</Badge>;
}

/** Formata data ISO para PT-BR */
function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function SubmissoesPage() {
  const result = await apiFetch<SubmissoesMeResponse>("/submissions/me");

  // 401 nao deve chegar aqui (middleware + layout), mas tratamos por seguranca
  if (result.status === 401) {
    notFound();
  }

  const items = result.data?.items ?? [];
  const nextCursor = result.data?.nextCursor ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Submissoes
          </h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Historico de documentos enviados para analise.
          </p>
        </div>

        <Button asChild>
          <Link href="/aluno/submissoes/nova">Enviar documento</Link>
        </Button>
      </div>

      {/* Tabela de submissoes */}
      <div className="rounded-lg border border-[var(--border)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Carga (h)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de envio</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-sm text-[var(--muted-foreground)]"
                >
                  Nenhuma submissao encontrada. Envie seu primeiro documento.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  {/* Exibe o ID da categoria enquanto GET /categorias nao resolve o nome */}
                  <TableCell className="font-medium">
                    <span
                      className="font-mono text-xs text-[var(--muted-foreground)]"
                      title={item.categoriaId}
                    >
                      {item.categoriaId.slice(0, 8)}…
                    </span>
                  </TableCell>
                  <TableCell>{item.cargaInformadaHoras}h</TableCell>
                  <TableCell>
                    <EstadoBadge estado={item.estado} />
                  </TableCell>
                  <TableCell>{formatarData(item.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/aluno/submissoes/${item.id}`}>Ver</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Indicador de paginacao (MVP: apenas aviso de limite) */}
      {nextCursor && (
        <p className="text-center text-sm text-[var(--muted-foreground)]">
          {/* DEBITO: paginacao cursor-based nao implementada. */}
          Existem mais submissoes. Paginacao sera implementada em versao futura.
        </p>
      )}
    </div>
  );
}
