import { z } from "zod";

// ---------------------------------------------------------------------------
// Categoria
// ---------------------------------------------------------------------------

export const CreateCategoriaSchema = z.object({
  nome: z.string().min(1).max(200),
  descricao: z.string().max(1000).optional(),
});
export type CreateCategoriaDto = z.infer<typeof CreateCategoriaSchema>;

export const UpdateCategoriaSchema = z.object({
  nome: z.string().min(1).max(200).optional(),
  descricao: z.string().max(1000).optional(),
  ativo: z.boolean().optional(),
});
export type UpdateCategoriaDto = z.infer<typeof UpdateCategoriaSchema>;

export const CategoriaResponseSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  descricao: z.string().nullable(),
  ativo: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CategoriaResponse = z.infer<typeof CategoriaResponseSchema>;

// ---------------------------------------------------------------------------
// RegraMatriz
// ---------------------------------------------------------------------------

export const CreateRegraMatrizSchema = z.object({
  categoriaId: z.string().uuid(),
  tetoTotalHoras: z.number().int().positive(),
  tetoAtividadeHoras: z.number().int().positive(),
  cursoId: z.string().uuid().optional(),
  dataIngressoDesde: z.string(), // ISO date string (YYYY-MM-DD)
  dataIngressoAte: z.string().optional(),
});
export type CreateRegraMatrizDto = z.infer<typeof CreateRegraMatrizSchema>;

export const UpdateRegraMatrizSchema = z.object({
  tetoTotalHoras: z.number().int().positive().optional(),
  tetoAtividadeHoras: z.number().int().positive().optional(),
  dataIngressoAte: z.string().optional(),
});
export type UpdateRegraMatrizDto = z.infer<typeof UpdateRegraMatrizSchema>;

export const RegraMatrizResponseSchema = z.object({
  id: z.string().uuid(),
  categoriaId: z.string().uuid(),
  tetoTotalHoras: z.number(),
  tetoAtividadeHoras: z.number(),
  cursoId: z.string().nullable(),
  dataIngressoDesde: z.string(),
  dataIngressoAte: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type RegraMatrizResponse = z.infer<typeof RegraMatrizResponseSchema>;
