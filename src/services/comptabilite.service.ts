import { fetchWithAuth } from "@/lib/fetch-with-auth";
import type {
  EcritureComptable,
  CreateEcritureRequest,
  UpdateEcritureRequest,
  RapportTVA,
  AuditTVARequest,
} from "@/types";

export const comptabiliteService = {
  async listEcritures(
    orgId: string,
    filters?: { journal?: string; dateDebut?: string; dateFin?: string }
  ): Promise<EcritureComptable[]> {
    const params = new URLSearchParams();
    if (filters?.journal) params.append("journal", filters.journal);
    if (filters?.dateDebut) params.append("dateDebut", filters.dateDebut);
    if (filters?.dateFin) params.append("dateFin", filters.dateFin);

    const res = await fetchWithAuth(
      `/api/organisations/${orgId}/comptabilite/ecritures?${params}`
    );
    return res.json();
  },

  async getEcriture(orgId: string, ecritureId: string): Promise<EcritureComptable> {
    const res = await fetchWithAuth(
      `/api/organisations/${orgId}/comptabilite/ecritures/${ecritureId}`
    );
    return res.json();
  },

  async createEcriture(
    orgId: string,
    data: CreateEcritureRequest
  ): Promise<EcritureComptable> {
    const res = await fetchWithAuth(
      `/api/organisations/${orgId}/comptabilite/ecritures`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    return res.json();
  },

  async updateEcriture(
    orgId: string,
    ecritureId: string,
    data: UpdateEcritureRequest
  ): Promise<EcritureComptable> {
    const res = await fetchWithAuth(
      `/api/organisations/${orgId}/comptabilite/ecritures/${ecritureId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    return res.json();
  },

  async listRapportsTVA(orgId: string): Promise<RapportTVA[]> {
    const res = await fetchWithAuth(
      `/api/organisations/${orgId}/comptabilite/tva`
    );
    return res.json();
  },

  async getRapportTVA(orgId: string, periode: string): Promise<RapportTVA> {
    const res = await fetchWithAuth(
      `/api/organisations/${orgId}/comptabilite/tva/${periode}`
    );
    return res.json();
  },

  async auditTVA(orgId: string, data: AuditTVARequest): Promise<RapportTVA> {
    const res = await fetchWithAuth(
      `/api/organisations/${orgId}/comptabilite/tva/audit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    return res.json();
  },

  async exportFEC(orgId: string, annee?: string): Promise<void> {
    const params = annee ? `?annee=${annee}` : "";
    const res = await fetchWithAuth(
      `/api/organisations/${orgId}/comptabilite/export/fec${params}`
    );
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FEC_${annee || new Date().getFullYear()}.txt`;
    a.click();
  },

  async exportSage(
    orgId: string,
    filters?: { dateDebut?: string; dateFin?: string }
  ): Promise<void> {
    const params = new URLSearchParams();
    if (filters?.dateDebut) params.append("dateDebut", filters.dateDebut);
    if (filters?.dateFin) params.append("dateFin", filters.dateFin);

    const res = await fetchWithAuth(
      `/api/organisations/${orgId}/comptabilite/export/sage?${params}`
    );
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export_sage.csv";
    a.click();
  },
};
