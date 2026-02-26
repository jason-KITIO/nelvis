export type DossierStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';

export interface DossierJuridique {
  id: string;
  organisationId: string;
  titre: string;
  status: DossierStatus;
  questionnaire: Record<string, unknown>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDossierRequest {
  titre: string;
  questionnaire: Record<string, unknown>;
}

export interface UpdateDossierRequest {
  titre?: string;
  status?: DossierStatus;
  questionnaire?: Record<string, unknown>;
}
