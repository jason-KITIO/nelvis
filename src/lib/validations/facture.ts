import { z } from 'zod';

export const ligneFactureSchema = z.object({
  produitId: z.string().optional(),
  description: z.string().min(1, 'Description requise'),
  quantite: z.number().positive('Quantité doit être positive'),
  prixUnitaireHt: z.number().nonnegative('Prix unitaire doit être positif ou nul'),
  tauxTva: z.number().min(0).max(100, 'TVA doit être entre 0 et 100'),
});

export const createFactureSchema = z.object({
  clientId: z.string().uuid('Client ID invalide'),
  dateEcheance: z.string().datetime('Date d\'échéance invalide'),
  lignes: z.array(ligneFactureSchema).min(1, 'Au moins une ligne requise'),
});

export const updateFactureSchema = z.object({
  clientId: z.string().uuid().optional(),
  dateEcheance: z.string().datetime().optional(),
  lignes: z.array(ligneFactureSchema).optional(),
});

export const createFactureAISchema = z.object({
  commande: z.string().min(1, 'Commande requise'),
});
