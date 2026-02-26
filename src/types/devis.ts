export type DevisStatut = 'DRAFT' | 'ENVOYE' | 'ACCEPTE' | 'REFUSE';

export interface LigneDevis {
  id?: string;
  produitId?: string;
  description: string;
  quantite: number;
  prixUnitaireHt: number;
  tauxTva: number;
}

export interface Devis {
  id: string;
  organisationId: string;
  clientId: string;
  numero: string;
  statut: DevisStatut;
  montantHt: number;
  tva: number;
  dateExpiration: string;
  createdAt: string;
  client?: {
    id: string;
    nom: string;
    email: string;
  };
  lignes?: LigneDevis[];
}

export interface CreateDevisRequest {
  clientId: string;
  dateExpiration: string;
  lignes: LigneDevis[];
}

export interface UpdateDevisRequest {
  clientId?: string;
  dateExpiration?: string;
  lignes?: LigneDevis[];
}
