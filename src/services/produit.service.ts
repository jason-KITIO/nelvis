import { fetchWithAuth } from '@/lib/fetch-with-auth';
import type { Produit, CreateProduitRequest, UpdateProduitRequest } from '@/types/produit';

interface GetProduitsResponse {
  produits: Produit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const produitService = {
  async getAll(orgId: string, page = 1, limit = 10): Promise<GetProduitsResponse> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/produits?page=${page}&limit=${limit}`
    );
    if (!response.ok) throw new Error('Erreur lors de la récupération des produits');
    return response.json();
  },

  async getById(orgId: string, produitId: string): Promise<{ produit: Produit }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/produits/${produitId}`
    );
    if (!response.ok) throw new Error('Erreur lors de la récupération du produit');
    return response.json();
  },

  async create(orgId: string, data: CreateProduitRequest): Promise<{ produit: Produit }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/produits`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error('Erreur lors de la création du produit');
    return response.json();
  },

  async update(
    orgId: string,
    produitId: string,
    data: UpdateProduitRequest
  ): Promise<{ produit: Produit }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/produits/${produitId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    if (!response.ok) throw new Error('Erreur lors de la modification du produit');
    return response.json();
  },

  async delete(orgId: string, produitId: string): Promise<{ success: boolean }> {
    const response = await fetchWithAuth(
      `/api/organisations/${orgId}/produits/${produitId}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('Erreur lors de la suppression du produit');
    return response.json();
  },
};
