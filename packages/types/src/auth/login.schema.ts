import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  // argon2 limita input em 72 bytes; min 8 para segurança mínima
  senha: z.string().min(8).max(72),
});

export type LoginDto = z.infer<typeof LoginSchema>;
