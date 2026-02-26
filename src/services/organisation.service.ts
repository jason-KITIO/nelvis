import type {
  Organisation,
  OrganisationWithModules,
  OrgMember,
  UserModule,
  CreateOrganisationRequest,
  UpdateOrganisationRequest,
  UpdateBrandingRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  ModuleName,
} from '@/types/organisation';

const API_URL = '/api/organisations';

export const organisationService = {
  async getAll(): Promise<{ organisations: OrganisationWithModules[] }> {
    const res = await fetch(API_URL, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async create(data: CreateOrganisationRequest): Promise<{ organisation: OrganisationWithModules }> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async getById(orgId: string): Promise<{ organisation: OrganisationWithModules }> {
    const res = await fetch(`${API_URL}/${orgId}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async update(orgId: string, data: UpdateOrganisationRequest): Promise<{ organisation: Organisation }> {
    const res = await fetch(`${API_URL}/${orgId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async delete(orgId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/${orgId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async updateBranding(orgId: string, data: UpdateBrandingRequest): Promise<{ organisation: Organisation }> {
    const res = await fetch(`${API_URL}/${orgId}/branding`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async getMembers(orgId: string): Promise<{ members: OrgMember[] }> {
    const res = await fetch(`${API_URL}/${orgId}/members`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async inviteMember(orgId: string, data: InviteMemberRequest): Promise<{ member: OrgMember }> {
    const res = await fetch(`${API_URL}/${orgId}/members/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async updateMemberRole(orgId: string, userId: string, data: UpdateMemberRoleRequest): Promise<{ member: OrgMember }> {
    const res = await fetch(`${API_URL}/${orgId}/members/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async removeMember(orgId: string, userId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/${orgId}/members/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async getModules(orgId: string): Promise<{ modules: UserModule }> {
    const res = await fetch(`${API_URL}/${orgId}/modules`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async activateModule(orgId: string, module: ModuleName): Promise<{ modules: UserModule }> {
    const res = await fetch(`${API_URL}/${orgId}/modules/${module}/activate`, {
      method: 'PATCH',
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async deactivateModule(orgId: string, module: ModuleName): Promise<{ modules: UserModule }> {
    const res = await fetch(`${API_URL}/${orgId}/modules/${module}/deactivate`, {
      method: 'PATCH',
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async getPaymentHistory(orgId: string): Promise<{ payments: any[] }> {
    const res = await fetch(`${API_URL}/${orgId}/subscriptions`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
};
