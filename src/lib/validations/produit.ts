import { z } from 'zod';

export const createProduitSchema = z.object({
  reference: z.string().min(1, 'La référence est requise'),
  nom: z.string().min(1, 'Le nom est requis'),
  type: z.enum(['PRODUIT', 'SERVICE'], { required_error: 'Le type est requis' }),
  prixHt: z.number().positive('Le prix HT doit être positif'),
  tauxTva: z.number().min(0).max(100, 'Le taux de TVA doit être entre 0 et 100'),
  stock: z.number().int().min(0).optional(),
});

export const updateProduitSchema = z.object({
  reference: z.string().min(1).optional(),
  nom: z.string().min(1).optional(),
  type: z.enum(['PRODUIT', 'SERVICE']).optional(),
  prixHt: z.number().positive().optional(),
  tauxTva: z.number().min(0).max(100).optional(),
  stock: z.number().int().min(0).optional(),
});
