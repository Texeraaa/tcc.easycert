"use client";

/**
 * Formulario de login.
 * Client Component — usa estado local e event handlers.
 *
 * TODO (Round 4 T6): substituir console.log pelo POST real para /auth/login.
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

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const data = new FormData(e.currentTarget);
    const payload = {
      email: data.get("email") as string,
      senha: data.get("senha") as string,
    };

    // TODO (Round 4 T6): substituir pelo POST real para /auth/login
    console.log("[LoginForm] payload (placeholder):", {
      email: payload.email,
      senha: "[OMITIDO]",
    });

    // Simula delay para UI feedback
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSubmitting(false);
    setError(
      "Integracao com API ainda nao implementada (Round 4 T6). Payload logado no console.",
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Entrar</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription role="alert">{error}</AlertDescription>
            </Alert>
          )}

          {/* Email — label acima do input (design system) */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail institucional</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="aluno@fmpfm.edu.br"
              autoComplete="email"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              name="senha"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={isSubmitting}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
