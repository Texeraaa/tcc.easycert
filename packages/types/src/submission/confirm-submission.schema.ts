import { z } from "zod";

/**
 * Schema de confirmação de upload.
 * submissionId vem do path param — body carrega apenas storageKey.
 * O key deve seguir o padrão _tmp/<alunoId>/<submissionId>/<uuid>.pdf
 * (validado no service antes de chamar confirmUpload).
 */
export const ConfirmSubmissionSchema = z.object({
  storageKey: z.string().min(1),
});

export type ConfirmSubmissionDto = z.infer<typeof ConfirmSubmissionSchema>;
