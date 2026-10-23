import { z } from "zod";

export const CreateEventoSchema = z.object({
  titulo: z.string().min(1).max(500),
  descricao: z.string().max(2000).optional(),
  data: z.string(), // ISO date string (YYYY-MM-DD)
  cargaHoraria: z.number().int().positive().max(1000),
  categoriaId: z.string().uuid(),
});
export type CreateEventoDto = z.infer<typeof CreateEventoSchema>;

export const UpdateEventoSchema = z.object({
  titulo: z.string().min(1).max(500).optional(),
  descricao: z.string().max(2000).optional(),
  data: z.string().optional(),
  cargaHoraria: z.number().int().positive().max(1000).optional(),
});
export type UpdateEventoDto = z.infer<typeof UpdateEventoSchema>;

export const EventoResponseSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string(),
  descricao: z.string().nullable(),
  data: z.string(),
  cargaHoraria: z.number(),
  categoriaId: z.string().uuid(),
  organizadorId: z.string().uuid(),
  createdAt: z.string(),
});
export type EventoResponse = z.infer<typeof EventoResponseSchema>;
