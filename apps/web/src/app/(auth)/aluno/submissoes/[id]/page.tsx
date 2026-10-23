/**
 * Detalhe de submissao — /aluno/submissoes/[id]
 * Server Component.
 *
 * Chama GET /submissions/:id para buscar detalhe da submissao do aluno.
 * Se 404: renderiza notFound().
 * Se estado === UPLOAD_INVALID: mostra CTA de reupload (debito — link desabilitado por ora).
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-fetch";
import type { SubmissionResponse, SubmissionState } from "@easycert/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SubmissaoDetalhePageProps {
  params: Promise<{ id: string }>;
}

/** Configuracao visual dos estados PT-BR */
const ESTADO_CONFIG: Record<
  SubmissionState,
  {
    variant: "gray" | "blue" | "yellow" | "green" | "red" | "orange";
    label: string;
  }
> = {
  AWAITING_UPLOAD: { variant: "gray", label: "Aguardando upload" },
  PENDING: { variant: "blue", label: "Aguardando revisao" },
  UNDER_REVIEW: { variant: "yellow", label: "Em analise" },
  APPROVED: { variant: "green", label: "Aprovado" },
  REJECTED: { variant: "red", label: "Indeferido" },
  CORRECTION_REQUESTED: { variant: "orange", label: "Correcao solicitada" },
  UPLOAD_INVALID: { variant: "red", label: "Upload invalido" },
};

function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 border-b border-[var(--border)] py-3 last:border-0">
      <dt className="text-sm font-medium text-[var(--muted-foreground)]">
        {label}
      </dt>
      <dd className="text-sm text-[var(--foreground)]">{children}</dd>
    </div>
  );
}

export default async function SubmissaoDetalhePage({
  params,
}: SubmissaoDetalhePageProps) {
  const { id } = await params;

  const result = await apiFetch<SubmissionResponse>(`/submissions/${id}`);

  if (result.status === 404 || !result.data) {
    notFound();
  }

  // 401 → redireciona (middleware cuida, mas trata por seguranca)
  if (result.status === 401) {
    notFound();
  }

  const submission = result.data;
  const estadoConfig = ESTADO_CONFIG[submission.estado] ?? {
    variant: "gray" as const,
    label: submission.estado,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Cabecalho */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Submissao
          </h1>
          <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">
            {submission.id}
          </p>
        </div>
        <Badge variant={estadoConfig.variant} className="mt-1 shrink-0">
          {estadoConfig.label}
        </Badge>
      </div>

      {/* Dados da submissao */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do documento</CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            <Campo label="Categoria">
              {/* DEBITO: nome da categoria nao disponivel sem GET /categorias */}
              <span
                className="font-mono text-xs text-[var(--muted-foreground)]"
                title={submission.categoriaId}
              >
                {submission.categoriaId}
              </span>
            </Campo>

            <Campo label="Carga horaria">
              {submission.cargaInformadaHoras} hora
              {submission.cargaInformadaHoras !== 1 ? "s" : ""}
            </Campo>

            {submission.instituicao && (
              <Campo label="Instituicao">{submission.instituicao}</Campo>
            )}

            <Campo label="Enviado em">
              {formatarDataHora(submission.createdAt)}
            </Campo>

            <Campo label="Atualizado em">
              {formatarDataHora(submission.updatedAt)}
            </Campo>
          </dl>
        </CardContent>
      </Card>

      {/* Motivo de indeferimento (se houver) */}
      {submission.motivoIndeferimento && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-[var(--destructive)]">
              Motivo do indeferimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--foreground)]">
              {submission.motivoIndeferimento}
            </p>
          </CardContent>
        </Card>
      )}

      {/* CTA especifico para UPLOAD_INVALID */}
      {submission.estado === "UPLOAD_INVALID" && (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[var(--destructive)]">
                O arquivo enviado nao foi reconhecido como PDF valido.
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Verifique se o arquivo nao esta corrompido e tente novamente com
                um PDF gerado por um programa confiavel.
              </p>
              {/*
               * DEBITO: reupload nao implementado (fora de escopo Mes 2).
               * Quando implementado, este botao abrira o fluxo de reenvio
               * para a mesma submissao (novo presigned POST para o mesmo submission.id).
               */}
              <Button variant="outline" disabled title="Reenvio disponivel em breve">
                Fazer novo upload (em breve)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navegacao */}
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/aluno/submissoes">Voltar para a lista</Link>
        </Button>
        <Button asChild>
          <Link href="/aluno/submissoes/nova">Nova submissao</Link>
        </Button>
      </div>
    </div>
  );
}
