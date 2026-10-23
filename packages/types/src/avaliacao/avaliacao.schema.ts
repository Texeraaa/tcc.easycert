import { z } from "zod";

export const AvaliacaoDecisaoSchema = z.enum([
  "APROVADO",
  "REJEITADO",
  "CORRECAO_SOLICITADA",
]);
export type AvaliacaoDecisao = z.infer<typeof AvaliacaoDecisaoSchema>;

export const CreateAvaliacaoSchema = z.object({
  submissionId: z.string().uuid(),
  decisao: AvaliacaoDecisaoSchema,
  comentario: z.string().max(2000).optional(),
});
export type CreateAvaliacaoDto = z.infer<typeof CreateAvaliacaoSchema>;

export const UpdateAvaliacaoSchema = z.object({
  comentario: z.string().max(2000).optional(),
});
export type UpdateAvaliacaoDto = z.infer<typeof UpdateAvaliacaoSchema>;

export const AvaliacaoResponseSchema = z.object({
  id: z.string().uuid(),
  submissionId: z.string().uuid(),
  coordenadorId: z.string().uuid(),
  decisao: AvaliacaoDecisaoSchema,
  comentario: z.string().nullable(),
  createdAt: z.string(),
});
export type AvaliacaoResponse = z.infer<typeof AvaliacaoResponseSchema>;
