import { z } from "zod";

// Papéis de usuário — espelha o enum Prisma.
export const RoleSchema = z.enum(["ALUNO", "COORDENADOR", "ADMIN"]);
export type Role = z.infer<typeof RoleSchema>;

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nome: z.string(),
  role: RoleSchema,
  dataIngresso: z.string(), // ISO string
  matricula: z.string().nullable(),
  curso: z.string().nullable(),
  ativo: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

export const UpdateUserSchema = z.object({
  nome: z.string().min(1).max(200).optional(),
  matricula: z.string().max(50).optional(),
  curso: z.string().max(200).optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
