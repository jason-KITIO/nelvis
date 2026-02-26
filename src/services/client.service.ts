import type { Client, CreateClientRequest, UpdateClientRequest } from '@/types/client';

const API_URL = '/api/organisations';

export const clientService = {
  async getAll(orgId: string, page = 1, limit = 10): Promise<{ clients: Client[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await fetch(`${API_URL}/${orgId}/clients?page=${page}&limit=${limit}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async getById(orgId: string, clientId: string): Promise<{ client: Client }> {
    const res = await fetch(`${API_URL}/${orgId}/clients/${clientId}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async create(orgId: string, data: CreateClientRequest): Promise<{ client: Client }> {
    const res = await fetch(`${API_URL}/${orgId}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async update(orgId: string, clientId: string, data: UpdateClientRequest): Promise<{ client: Client }> {
    const res = await fetch(`${API_URL}/${orgId}/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async delete(orgId: string, clientId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/${orgId}/clients/${clientId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
};
