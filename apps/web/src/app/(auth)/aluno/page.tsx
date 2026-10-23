/**
 * Home do aluno — /aluno
 * Server Component.
 *
 * Busca usuario real via GET /auth/me (getCurrentUser).
 * Se retornar null (sessao expirada sem middleware pegar), redireciona para /login.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/get-current-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AlunoHomePage() {
  const user = await getCurrentUser();

  // Middleware protege a rota, mas por seguranca: se /auth/me retornar null,
  // redireciona explicitamente (ex.: sessao expirou entre o check do middleware e aqui)
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8">
      {/* Saudacao */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Ola, {user.nome}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Gerencie suas horas complementares pelo easycert.
        </p>
      </div>

      {/* CTAs principais */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nova submissao</CardTitle>
            <CardDescription>
              Envie um PDF de atividade complementar para analise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full">
              <Link href="/aluno/submissoes/nova">Enviar documento</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Minhas submissoes</CardTitle>
            <CardDescription>
              Acompanhe o status de todos os documentos enviados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/aluno/submissoes">Ver submissoes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
