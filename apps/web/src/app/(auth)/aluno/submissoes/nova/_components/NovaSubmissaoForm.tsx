"use client";

/**
 * Formulario de nova submissao com fluxo de upload direto ao MinIO.
 * Client Component — usa estado local, event handlers e fetch ao browser.
 *
 * Fluxo (T7):
 *  1. GET /auth/csrf-token  → seta cookie csrf-token
 *  2. POST /submissions     → recebe { submission, upload: { url, fields, key } }
 *  3. POST upload.url       → multipart/form-data com fields + arquivo (sem credentials)
 *  4. POST /submissions/:id/confirm com { storageKey: upload.key }
 *  5. Exibe sucesso ou erro
 *
 * Categoria: hardcode das 5 categorias CNE/MEC do seed.
 * DEBITO: GET /categorias nao implementado no backend (MatrizController stub).
 * Quando disponivel, buscar via Server Component e passar como prop.
 * Rastreado em docs/dominio/pendencias.md.
 */

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { clientApiFetch } from "@/lib/api-fetch";
import type { SubmissionResponse } from "@easycert/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Categorias hardcode do seed CNE/MEC usadas como fallback quando GET /categorias
 * nao esta disponivel no backend.
 *
 * DEBITO: IDs sao placeholders (UUIDs validos mas nao correspondem ao banco).
 * O submit real vai retornar 400 do backend enquanto GET /categorias nao for implementado.
 * Quando o endpoint existir, a page.tsx buscara categorias reais e passara como prop.
 * Rastreado em docs/dominio/pendencias.md.
 *
 * Os nomes correspondem ao seed de packages/db/prisma/seed.ts.
 */
const CATEGORIAS_SEED = [
  { id: "00000000-0000-4000-a000-000000000001", nome: "Ensino" },
  { id: "00000000-0000-4000-a000-000000000002", nome: "Pesquisa" },
  { id: "00000000-0000-4000-a000-000000000003", nome: "Extensao" },
  { id: "00000000-0000-4000-a000-000000000004", nome: "Cultural/Artistico" },
  { id: "00000000-0000-4000-a000-000000000005", nome: "Representacao Estudantil" },
] as const;

type Fase = "idle" | "csrf" | "criando" | "enviando" | "confirmando" | "sucesso" | "erro";

const FASE_LABEL: Record<Fase, string> = {
  idle: "Enviar documento",
  csrf: "Preparando...",
  criando: "Registrando submissao...",
  enviando: "Enviando arquivo...",
  confirmando: "Confirmando upload...",
  sucesso: "Enviado com sucesso!",
  erro: "Tentar novamente",
};

interface NovaSubmissaoFormProps {
  /**
   * Lista de categorias do backend.
   * Quando GET /categorias estiver disponivel, passar aqui.
   * Por enquanto usa CATEGORIAS_SEED como fallback.
   */
  categorias?: { id: string; nome: string }[];
}

export function NovaSubmissaoForm({ categorias }: NovaSubmissaoFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fase, setFase] = useState<Fase>("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [categoriaId, setCategoriaId] = useState<string>("");

  const isSubmitting = fase !== "idle" && fase !== "sucesso" && fase !== "erro";
  const listaCategoria = categorias ?? CATEGORIAS_SEED;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const cargaRaw = formData.get("cargaHoras") as string;
    const instituicao = (formData.get("instituicao") as string) || undefined;
    const arquivo = fileInputRef.current?.files?.[0];

    // Validacoes client-side basicas
    if (!categoriaId) {
      setErro("Selecione uma categoria.");
      return;
    }
    const cargaHoras = parseInt(cargaRaw, 10);
    if (!cargaRaw || isNaN(cargaHoras) || cargaHoras < 1 || cargaHoras > 1000) {
      setErro("Informe a carga horaria (entre 1 e 1000 horas).");
      return;
    }
    if (!arquivo) {
      setErro("Selecione um arquivo PDF.");
      return;
    }
    if (arquivo.type !== "application/pdf" && !arquivo.name.endsWith(".pdf")) {
      setErro("O arquivo deve ser um PDF.");
      return;
    }
    if (arquivo.size > 10 * 1024 * 1024) {
      setErro("O arquivo excede o limite de 10 MB.");
      return;
    }

    try {
      // Passo 1: garante cookie CSRF antes das mutations
      setFase("csrf");
      const csrfResult = await clientApiFetch<{ ok: boolean; csrfToken: string }>(
        "/auth/csrf-token",
        { method: "GET" },
      );
      if (!csrfResult.ok) {
        throw new Error("Nao foi possivel obter o token de seguranca.");
      }

      // Passo 2: cria a submissao na API
      setFase("criando");

      interface PostSubmissaoResponse {
        submission: SubmissionResponse;
        upload: {
          url: string;
          fields: Record<string, string>;
          key: string;
        };
      }

      const submissaoResult = await clientApiFetch<PostSubmissaoResponse>(
        "/submissions",
        {
          method: "POST",
          body: JSON.stringify({
            categoriaId,
            cargaInformadaHoras: cargaHoras,
            ...(instituicao ? { instituicao } : {}),
          }),
        },
      );

      if (!submissaoResult.ok || !submissaoResult.data) {
        if (submissaoResult.status === 401) {
          throw new Error("Sessao expirada. Faca login novamente.");
        }
        if (submissaoResult.status === 403) {
          throw new Error("Sem permissao para criar submissao.");
        }
        throw new Error(
          `Falha ao registrar submissao (status ${submissaoResult.status}).`,
        );
      }

      const { submission, upload } = submissaoResult.data;

      // Passo 3: upload direto ao MinIO via presigned POST
      // Importante: `file` DEVE ser o ultimo campo do FormData (requisito S3/MinIO)
      setFase("enviando");
      const uploadFormData = new FormData();
      for (const [key, value] of Object.entries(upload.fields)) {
        uploadFormData.append(key, value);
      }
      // Arquivo por ultimo (requisito do presigned POST do S3/MinIO)
      uploadFormData.append("file", arquivo);

      const uploadResponse = await fetch(upload.url, {
        method: "POST",
        body: uploadFormData,
        // NAO inclui credentials: o MinIO rejeitaria cookies da app no CORS
        credentials: "omit",
      });

      // MinIO retorna 204 em sucesso de presigned POST
      if (uploadResponse.status !== 204 && !uploadResponse.ok) {
        throw new Error(
          `Falha no envio do arquivo (status ${uploadResponse.status}). Verifique o PDF e tente novamente.`,
        );
      }

      // Passo 4: confirma upload na API (valida magic bytes %PDF-)
      setFase("confirmando");
      const confirmResult = await clientApiFetch(
        `/submissions/${submission.id}/confirm`,
        {
          method: "POST",
          body: JSON.stringify({ storageKey: upload.key }),
        },
      );

      if (!confirmResult.ok) {
        if (confirmResult.status === 422) {
          throw new Error(
            "O arquivo enviado nao e um PDF valido. O conteudo nao corresponde ao formato esperado.",
          );
        }
        throw new Error(
          `Falha na confirmacao do upload (status ${confirmResult.status}).`,
        );
      }

      // Sucesso
      setFase("sucesso");
    } catch (err) {
      setFase("erro");
      setErro(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
    }
  }

  // Estado de sucesso — exibe feedback e CTA para lista
  if (fase === "sucesso") {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-4">
          <p className="text-lg font-semibold text-[var(--foreground)]">
            Documento enviado com sucesso!
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Status: <strong>Aguardando revisao</strong>. Voce sera notificado quando houver atualizacao.
          </p>
          <Button onClick={() => router.push("/aluno/submissoes")}>
            Ver minhas submissoes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dados da atividade</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {/* Erro de API ou validacao */}
          {erro && (
            <Alert variant="destructive">
              <AlertDescription role="alert">{erro}</AlertDescription>
            </Alert>
          )}

          {/* Progresso por fase */}
          {isSubmitting && (
            <div className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-4 py-3">
              <p className="text-sm text-[var(--muted-foreground)]">
                {
                  {
                    csrf: "Preparando envio...",
                    criando: "Registrando submissao na plataforma...",
                    enviando: "Enviando arquivo para o servidor...",
                    confirmando: "Validando documento enviado...",
                  }[fase as "csrf" | "criando" | "enviando" | "confirmando"]
                }
              </p>
            </div>
          )}

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            {/*
             * DEBITO: lista hardcode das 5 categorias CNE/MEC do seed.
             * GET /categorias nao esta disponivel no backend (MatrizController stub).
             * Quando implementado, buscar via Server Component e passar como prop `categorias`.
             */}
            <Select
              value={categoriaId}
              onValueChange={setCategoriaId}
              disabled={isSubmitting}
              required
            >
              <SelectTrigger id="categoria" aria-label="Selecione uma categoria">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {listaCategoria.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Carga horaria */}
          <div className="space-y-2">
            <Label htmlFor="cargaHoras">Carga horaria informada (horas)</Label>
            <Input
              id="cargaHoras"
              name="cargaHoras"
              type="number"
              min="1"
              max="1000"
              placeholder="Ex: 40"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Instituicao (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="instituicao">
              Instituicao promotora{" "}
              <span className="text-[var(--muted-foreground)] font-normal">(opcional)</span>
            </Label>
            <Input
              id="instituicao"
              name="instituicao"
              placeholder="Ex: Universidade Federal de Minas Gerais"
              disabled={isSubmitting}
            />
          </div>

          {/* Upload PDF */}
          <div className="space-y-2">
            <Label htmlFor="arquivo">Comprovante (PDF, max 10 MB)</Label>
            <Input
              id="arquivo"
              name="arquivo"
              type="file"
              accept=".pdf,application/pdf"
              required
              disabled={isSubmitting}
              ref={fileInputRef}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {FASE_LABEL[fase]}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
