"use server";

/**
 * Server Action de logout.
 * Orquestra POST para /auth/logout na API NestJS.
 * Nunca acessa banco diretamente.
 */

import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-fetch";

export async function logoutAction(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // Logout silencioso — redireciona de qualquer forma
  }

  redirect("/login");
}
