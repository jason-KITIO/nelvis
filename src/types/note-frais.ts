export interface NoteDeFrais {
  id: string;
  organisationId: string;
  userId: string;
  photoUrl: string;
  montantOcr: number | null;
  dateOcr: Date | null;
  categorieOcr: string | null;
  statut: NoteFraisStatut;
  user?: {
    firstName: string;
    lastName: string;
    email?: string;
  };
}

export enum NoteFraisStatut {
  EN_ATTENTE = "EN_ATTENTE",
  VALIDE = "VALIDE",
}

export interface CreateNoteDeFraisRequest {
  file: File;
}

export interface UpdateNoteDeFraisRequest {
  montantOcr?: number;
  dateOcr?: string;
  categorieOcr?: string;
  statut?: NoteFraisStatut;
}

export interface OcrExtractionResult {
  montant: number | null;
  date: Date | null;
  categorie: string | null;
  marchand: string | null;
  tva: number | null;
}
