import { fetchWithAuth } from '@/lib/fetch-with-auth';
import type { Facture, CreateFactureRequest, UpdateFactureRequest, CreateFactureAIRequest, PaymentLinkResponse } from '@/types/facture';

interface GetFacturesResponse {
  factures: Facture[];
}

export const factureService = {
  async getAll(orgId: string, filters?: { statut?: string; clientId?: string; dateDebut?: string; dateFin?: string }): Promise<GetFacturesResponse> {
    const params = new URLSearchParams();
    if (filters?.statut) params.append('statut', filters.statut);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.dateDebut) params.append('dateDebut', filters.dateDebut);
    if (filters?.dateFin) params.append('dateFin', filters.dateFin);
    
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/factures?${params.toString()}`
    );
    if (!response.ok) throw new Error('Erreur lors de la récupération des factures');
    return response.json();
  },

  async getById(orgId: string, factureId: string): Promise<{ facture: Facture }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/factures/${factureId}`
    );
    if (!response.ok) throw new Error('Erreur lors de la récupération de la facture');
    return response.json();
  },

  async create(orgId: string, data: CreateFactureRequest): Promise<{ facture: Facture }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/factures`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error('Erreur lors de la création de la facture');
    return response.json();
  },

  async createWithAI(orgId: string, data: CreateFactureAIRequest): Promise<{ facture: Facture }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/factures/ai`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error('Erreur lors de la création de la facture par IA');
    return response.json();
  },

  async update(orgId: string, factureId: string, data: UpdateFactureRequest): Promise<{ facture: Facture }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/factures/${factureId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error('Erreur lors de la modification de la facture');
    return response.json();
  },

  async delete(orgId: string, factureId: string): Promise<{ success: boolean }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/factures/${factureId}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('Erreur lors de la suppression de la facture');
    return response.json();
  },

  async send(orgId: string, factureId: string): Promise<{ success: boolean; facture: Facture }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/factures/${factureId}/send`,
      { method: 'POST' }
    );
    if (!response.ok) throw new Error('Erreur lors de l\'envoi de la facture');
    return response.json();
  },

  async markPaid(orgId: string, factureId: string): Promise<{ facture: Facture }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/factures/${factureId}/mark-paid`,
      { method: 'POST' }
    );
    if (!response.ok) throw new Error('Erreur lors du marquage comme payée');
    return response.json();
  },

  async generateAvoir(orgId: string, factureId: string): Promise<{ avoir: Facture }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/factures/${factureId}/avoir`,
      { method: 'POST' }
    );
    if (!response.ok) throw new Error('Erreur lors de la génération de l\'avoir');
    return response.json();
  },

  async generatePaymentLink(orgId: string, factureId: string, provider: 'stripe' | 'paypal'): Promise<PaymentLinkResponse> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/factures/${factureId}/payment-link`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      }
    );
    if (!response.ok) throw new Error('Erreur lors de la génération du lien de paiement');
    return response.json();
  },

  async downloadPdf(orgId: string, factureId: string): Promise<void> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/factures/${factureId}/pdf`
    );
    if (!response.ok) throw new Error('Erreur lors du téléchargement du PDF');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facture-${factureId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
