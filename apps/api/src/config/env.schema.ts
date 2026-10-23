import { z } from "zod";

/**
 * Schema de validação das variáveis de ambiente.
 * O boot falha imediatamente se qualquer variável obrigatória estiver ausente.
 */
export const envSchema = z.object({
  // Banco de dados
  DATABASE_URL: z.string().url(),
  DATABASE_URL_MIGRATE: z.string().url().optional(),

  // Autenticação e segurança
  // Secrets de 32+ chars (recomendação OWASP para HMAC-SHA256 / cookies).
  JWT_SECRET: z.string().min(32),
  CSRF_SECRET: z.string().min(32),

  // CORS
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),

  // Servidor
  PORT: z.coerce.number().int().positive().default(3333),

  // Storage (opcional em dev — readiness probe reporta degraded quando ausente)
  MINIO_ENDPOINT: z.string().url().optional(),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
  MINIO_BUCKET: z.string().optional(),

  // E-mail (opcional em dev)
  MAILTRAP_HOST: z.string().optional(),
  MAILTRAP_PORT: z.coerce.number().optional(),
  MAILTRAP_USER: z.string().optional(),
  MAILTRAP_PASSWORD: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Função de validação usada pelo ConfigModule.
 * Lança erro com detalhes Zod se as envs obrigatórias estiverem ausentes.
 */
export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");

    throw new Error(
      `Variáveis de ambiente inválidas ou ausentes:\n${formatted}\n` +
        `Verifique o arquivo .env.local.`,
    );
  }

  return result.data;
}
