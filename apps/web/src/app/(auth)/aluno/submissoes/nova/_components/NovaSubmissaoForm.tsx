"use client";

/**
 * Formulario de nova submissao.
 * Client Component — usa estado local e event handlers.
 *
 * TODO (Round 4 T7): integrar com POST /submissions + upload direto MinIO
 * + POST /submissions/:id/confirm.
 */

import { useState } from "react";
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

export function NovaSubmissaoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const data = new FormData(e.currentTarget);

    // TODO (Round 4 T7): substituir console.log pelo fluxo real de upload
    console.log("[NovaSubmissaoForm] payload (placeholder):", {
      categoria: data.get("categoria"),
      cargaHorariaInformada: data.get("cargaHorariaInformada"),
      instituicao: data.get("instituicao"),
      arquivo: data.get("arquivo"),
    });

    // Simula delay para UI feedback
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSubmitting(false);
    setError(
      "Integracao com API ainda nao implementada (Round 4 T7). Payload logado no console.",
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Dados da atividade</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Input
              id="categoria"
              name="categoria"
              placeholder="Ex: Ensino, Pesquisa, Extensao"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Carga horaria */}
          <div className="space-y-2">
            <Label htmlFor="cargaHorariaInformada">
              Carga horaria informada (horas)
            </Label>
            <Input
              id="cargaHorariaInformada"
              name="cargaHorariaInformada"
              type="number"
              min="1"
              max="1000"
              placeholder="Ex: 40"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Instituicao */}
          <div className="space-y-2">
            <Label htmlFor="instituicao">Instituicao promotora</Label>
            <Input
              id="instituicao"
              name="instituicao"
              placeholder="Ex: Universidade Federal de Minas Gerais"
              required
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
          <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar documento"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
