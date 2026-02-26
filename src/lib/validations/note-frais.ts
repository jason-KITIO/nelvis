import { z } from "zod";

export const updateNoteDeFraisSchema = z.object({
  montantOcr: z.number().positive().optional(),
  dateOcr: z.string().datetime().optional(),
  categorieOcr: z.string().optional(),
  statut: z.enum(["EN_ATTENTE", "VALIDE"]).optional(),
});

export type UpdateNoteDeFraisInput = z.infer<typeof updateNoteDeFraisSchema>;
