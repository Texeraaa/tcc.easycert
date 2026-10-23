import { z } from "zod";

export const ConfirmSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
});

export type ConfirmSubmissionDto = z.infer<typeof ConfirmSubmissionSchema>;
