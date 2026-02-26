import { z } from 'zod';

export const createClientSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  siret: z.string().optional(),
  adresse: z.string().min(1, 'L\'adresse est requise'),
  type: z.enum(['B2B', 'B2C']),
  statut: z.enum(['PROSPECT', 'PROPOSE', 'NEGOCIE', 'GAGNE', 'PERDU']).optional(),
});

export const updateClientSchema = z.object({
  nom: z.string().min(1).optional(),
  email: z.string().email().optional(),
  siret: z.string().optional(),
  adresse: z.string().min(1).optional(),
  type: z.enum(['B2B', 'B2C']).optional(),
  statut: z.enum(['PROSPECT', 'PROPOSE', 'NEGOCIE', 'GAGNE', 'PERDU']).optional(),
});
