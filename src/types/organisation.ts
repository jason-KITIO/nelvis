export type OrgMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Organisation {
  id: string;
  name: string;
  siret?: string | null;
  siren?: string | null;
  formeJuridique: string;
  pays: string;
  adresse: string;
  logoUrl?: string | null;
  charteGraphique?: Record<string, unknown>;
  createdAt: Date;
}

export interface OrganisationWithModules extends Organisation {
  role: OrgMemberRole;
  modules?: UserModule;
}

export interface UserModule {
  id: string;
  organisationId: string;
  juridique: boolean;
  facturation: boolean;
  comptabilite: boolean;
  rhPaie: boolean;
  vocal: boolean;
  logistique: boolean;
}

export interface OrgMember {
  id: string;
  userId: string;
  organisationId: string;
  role: OrgMemberRole;
  invitedAt: Date;
  acceptedAt?: Date | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
}

export interface CreateOrganisationRequest {
  name: string;
  siret?: string;
  siren?: string;
  formeJuridique: string;
  pays: string;
  adresse: string;
  logoUrl?: string;
  charteGraphique?: Record<string, unknown>;
  modules?: {
    juridique?: boolean;
    facturation?: boolean;
    comptabilite?: boolean;
    rhPaie?: boolean;
    vocal?: boolean;
    logistique?: boolean;
  };
}

export interface UpdateOrganisationRequest {
  name?: string;
  siret?: string;
  siren?: string;
  formeJuridique?: string;
  pays?: string;
  adresse?: string;
  logoUrl?: string;
}

export interface UpdateBrandingRequest {
  charteGraphique: Record<string, unknown>;
}

export interface InviteMemberRequest {
  email: string;
  role: OrgMemberRole;
}

export interface UpdateMemberRoleRequest {
  role: OrgMemberRole;
}

export type ModuleName = 'juridique' | 'facturation' | 'comptabilite' | 'rhPaie' | 'vocal' | 'logistique';

export interface AuditLog {
  id: string;
  organisationId: string;
  module: ModuleName;
  action: string;
  agentId: string;
  agentName: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

export interface AuditLogFilters {
  module?: ModuleName;
  startDate?: string;
  endDate?: string;
  agentId?: string;
}
