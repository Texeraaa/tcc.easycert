import { z } from "zod";

export const SubmissionStateSchema = z.enum([
  "AWAITING_UPLOAD",
  "PENDING",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "CORRECTION_REQUESTED",
  "UPLOAD_INVALID",
]);

export type SubmissionState = z.infer<typeof SubmissionStateSchema>;

export const SubmissionResponseSchema = z.object({
  id: z.string().uuid(),
  alunoId: z.string().uuid(),
  categoriaId: z.string().uuid(),
  cargaInformadaHoras: z.number(),
  estado: SubmissionStateSchema,
  instituicao: z.string().nullable(),
  motivoIndeferimento: z.string().nullable(),
  createdAt: z.string(), // ISO string na response
  updatedAt: z.string(),
});

export type SubmissionResponse = z.infer<typeof SubmissionResponseSchema>;
