import { fetchWithAuth } from '@/lib/fetch-with-auth';
import type { Devis, CreateDevisRequest, UpdateDevisRequest } from '@/types/devis';

interface GetDevisResponse {
  devis: Devis[];
}

export const devisService = {
  async getAll(orgId: string, filters?: { statut?: string; clientId?: string }): Promise<GetDevisResponse> {
    const params = new URLSearchParams();
    if (filters?.statut) params.append('statut', filters.statut);
    if (filters?.clientId) params.append('clientId', filters.clientId);
    
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/devis?${params.toString()}`
    );
    if (!response.ok) throw new Error('Erreur lors de la récupération des devis');
    return response.json();
  },

  async getById(orgId: string, devisId: string): Promise<{ devis: Devis }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/devis/${devisId}`
    );
    if (!response.ok) throw new Error('Erreur lors de la récupération du devis');
    return response.json();
  },

  async create(orgId: string, data: CreateDevisRequest): Promise<{ devis: Devis }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/devis`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error('Erreur lors de la création du devis');
    return response.json();
  },

  async update(orgId: string, devisId: string, data: UpdateDevisRequest): Promise<{ devis: Devis }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/devis/${devisId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error('Erreur lors de la modification du devis');
    return response.json();
  },

  async delete(orgId: string, devisId: string): Promise<{ success: boolean }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/devis/${devisId}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('Erreur lors de la suppression du devis');
    return response.json();
  },

  async accept(orgId: string, devisId: string): Promise<{ devis: Devis }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/devis/${devisId}/accept`,
      { method: 'POST' }
    );
    if (!response.ok) throw new Error('Erreur lors de l\'acceptation du devis');
    return response.json();
  },

  async refuse(orgId: string, devisId: string): Promise<{ devis: Devis }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/devis/${devisId}/refuse`,
      { method: 'POST' }
    );
    if (!response.ok) throw new Error('Erreur lors du refus du devis');
    return response.json();
  },

  async send(orgId: string, devisId: string): Promise<{ success: boolean; devis: Devis }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/devis/${devisId}/send`,
      { method: 'POST' }
    );
    if (!response.ok) throw new Error('Erreur lors de l\'envoi du devis');
    return response.json();
  },

  async convert(orgId: string, devisId: string): Promise<{ facture: any }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/devis/${devisId}/convert`,
      { method: 'POST' }
    );
    if (!response.ok) throw new Error('Erreur lors de la conversion du devis');
    return response.json();
  },

  async downloadPdf(orgId: string, devisId: string): Promise<void> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/devis/${devisId}/pdf`
    );
    if (!response.ok) throw new Error('Erreur lors du téléchargement du PDF');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devis-${devisId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
