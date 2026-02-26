export type ProduitType = 'PRODUIT' | 'SERVICE';

export interface Produit {
  id: string;
  organisationId: string;
  reference: string;
  nom: string;
  type: ProduitType;
  prixHt: number;
  tauxTva: number;
  stock?: number | null;
}

export interface CreateProduitRequest {
  reference: string;
  nom: string;
  type: ProduitType;
  prixHt: number;
  tauxTva: number;
  stock?: number;
}

export interface UpdateProduitRequest {
  reference?: string;
  nom?: string;
  type?: ProduitType;
  prixHt?: number;
  tauxTva?: number;
  stock?: number;
}
