export interface EcritureComptable {
  id: string;
  organisationId: string;
  journal: string;
  compteDebit: string;
  compteCredit: string;
  montant: number;
  dateEcriture: string;
}

export interface CreateEcritureRequest {
  journal: string;
  compteDebit: string;
  compteCredit: string;
  montant: number;
  dateEcriture: string;
}

export interface UpdateEcritureRequest {
  journal?: string;
  compteDebit?: string;
  compteCredit?: string;
  montant?: number;
  dateEcriture?: string;
}

export interface RapportTVA {
  id: string;
  organisationId: string;
  periode: string;
  tvaCollectee: number;
  tvaDeductible: number;
  soldeTva: number;
  anomalies?: {
    anomalies: Array<{
      type: string;
      description: string;
      gravite: "LOW" | "MEDIUM" | "HIGH";
    }>;
    recommandations: string[];
  };
}

export interface AuditTVARequest {
  periode: string;
}
