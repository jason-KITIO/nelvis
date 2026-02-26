import { z } from 'zod';

export const ligneDevisSchema = z.object({
  produitId: z.string().optional(),
  description: z.string().min(1, 'La description est requise'),
  quantite: z.number().min(1, 'La quantité doit être au minimum 1'),
  prixUnitaireHt: z.number().min(0, 'Le prix unitaire doit être positif ou nul'),
  tauxTva: z.number().min(0, 'Le taux de TVA doit être positif ou nul').max(100),
});

export const createDevisSchema = z.object({
  clientId: z.string().min(1, 'Le client est requis'),
  dateExpiration: z.string().min(1, 'La date d\'expiration est requise').refine(
    (date) => new Date(date) > new Date(),
    { message: 'La date d\'expiration doit être supérieure à la date actuelle' }
  ),
  lignes: z.array(ligneDevisSchema).min(1, 'Au moins une ligne est requise'),
});

export const updateDevisSchema = z.object({
  clientId: z.string().optional(),
  dateExpiration: z.string().optional(),
  lignes: z.array(ligneDevisSchema).optional(),
});
