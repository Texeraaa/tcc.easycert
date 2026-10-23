/**
 * Home do aluno — /aluno
 * Server Component.
 *
 * TODO (Round 4 T6): substituir dados mock pelo retorno real de /auth/me.
 */

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
  const nomeExibicao = user?.nome ?? "Aluno";

  return (
    <div className="space-y-8">
      {/* Saudacao */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Ola, {nomeExibicao}
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
