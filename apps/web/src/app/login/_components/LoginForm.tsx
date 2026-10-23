"use client";

/**
 * Formulario de login.
 * Client Component — usa react-hook-form + Zod + clientApiFetch real.
 *
 * Fluxo:
 *  1. Valida localmente via LoginSchema de @easycert/types.
 *  2. POST /auth/login — em sucesso: redireciona para returnTo (query) ou /aluno.
 *  3. Em 401: exibe "Email ou senha invalidos".
 *  4. Em erro de rede / 5xx: exibe "Erro ao conectar com o servidor".
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginSchema, type LoginDto } from "@easycert/types";
import { clientApiFetch } from "@/lib/api-fetch";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(payload: LoginDto) {
    setApiError(null);

    try {
      const result = await clientApiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (result.status === 401) {
        setApiError("Email ou senha invalidos. Verifique as credenciais.");
        return;
      }

      if (!result.ok) {
        setApiError("Erro ao conectar com o servidor. Tente novamente.");
        return;
      }

      // Login bem-sucedido: busca CSRF token antes de redirecionar
      // (garante que o cookie csrf-token exista para as proximas mutations)
      await clientApiFetch("/auth/csrf-token", { method: "GET" });

      const returnTo = searchParams.get("returnTo") ?? "/aluno";
      router.push(returnTo);
    } catch {
      setApiError("Erro ao conectar com o servidor. Tente novamente.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Entrar</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Erro de API (401 ou rede) */}
          {apiError && (
            <Alert variant="destructive">
              <AlertDescription role="alert">{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Email — label acima do input (design system) */}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail institucional</Label>
            <Input
              id="email"
              type="email"
              placeholder="aluno@fmpfm.edu.br"
              autoComplete="email"
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-[0.8rem] font-medium text-[var(--destructive)]" role="alert">
                {errors.email.message ?? "Email invalido"}
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isSubmitting}
              aria-invalid={!!errors.senha}
              {...register("senha")}
            />
            {errors.senha && (
              <p className="text-[0.8rem] font-medium text-[var(--destructive)]" role="alert">
                {errors.senha.message ?? "Senha invalida"}
              </p>
            )}
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
