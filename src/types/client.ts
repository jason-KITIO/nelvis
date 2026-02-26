export type ClientType = 'B2B' | 'B2C';
export type ClientStatut = 'PROSPECT' | 'PROPOSE' | 'NEGOCIE' | 'GAGNE' | 'PERDU';

export interface Client {
  id: string;
  organisationId: string;
  nom: string;
  email: string;
  siret?: string | null;
  adresse: string;
  type: ClientType;
  statut?: ClientStatut;
}

export interface CreateClientRequest {
  nom: string;
  email: string;
  siret?: string;
  adresse: string;
  type: ClientType;
  statut?: ClientStatut;
}

export interface UpdateClientRequest {
  nom?: string;
  email?: string;
  siret?: string;
  adresse?: string;
  type?: ClientType;
  statut?: ClientStatut;
}
