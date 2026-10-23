/**
 * Lista de submissoes do aluno — /aluno/submissoes
 * Server Component.
 *
 * TODO (Round 4 T7): integrar com GET /submissions/me (cursor-based).
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SubmissoesPage() {
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

      {/* Tabela — placeholder ate Round 4 T7 */}
      <div className="rounded-lg border border-[var(--border)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Documento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de envio</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={4}
                className="py-12 text-center text-sm text-[var(--muted-foreground)]"
              >
                {/* TODO (Round 4 T7): substituir por lista real de GET /submissions/me */}
                Nenhuma submissao encontrada. Envie seu primeiro documento.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
