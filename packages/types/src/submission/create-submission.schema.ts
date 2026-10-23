import { z } from "zod";

export const CreateSubmissionSchema = z.object({
  categoriaId: z.string().uuid(),
  cargaInformadaHoras: z.number().int().positive().max(1000),
  instituicao: z.string().min(1).max(200).optional(),
});

export type CreateSubmissionDto = z.infer<typeof CreateSubmissionSchema>;
