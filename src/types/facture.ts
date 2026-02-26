export type FactureStatut = 'EMISE' | 'PAYEE' | 'IMPAYEE' | 'AVOIR';

export interface LigneFacture {
  id?: string;
  produitId?: string;
  description: string;
  quantite: number;
  prixUnitaireHt: number;
  tauxTva: number;
}

export interface Facture {
  id: string;
  organisationId: string;
  clientId: string;
  devisId?: string;
  numero: string;
  statut: FactureStatut;
  montantHt: number;
  tvaMontant: number;
  dateEcheance: string;
  stripePaymentIntent?: string;
  createdAt: string;
  client?: {
    id: string;
    nom: string;
    email: string;
  };
  lignes?: LigneFacture[];
}

export interface CreateFactureRequest {
  clientId: string;
  dateEcheance: string;
  lignes: LigneFacture[];
}

export interface UpdateFactureRequest {
  clientId?: string;
  dateEcheance?: string;
  lignes?: LigneFacture[];
}

export interface CreateFactureAIRequest {
  commande: string;
}

export interface PaymentLinkResponse {
  url: string;
  provider: 'stripe' | 'paypal';
}
