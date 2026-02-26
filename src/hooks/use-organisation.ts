'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organisationService } from '@/services/organisation.service';
import { useAuth } from '@/providers/auth-provider';
import type {
  CreateOrganisationRequest,
  UpdateOrganisationRequest,
  UpdateBrandingRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  ModuleName,
} from '@/types/organisation';

export const useOrganisations = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['organisations'],
    queryFn: () => organisationService.getAll(),
    enabled,
  });
};

export const useOrganisation = (orgId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['organisation', orgId],
    queryFn: () => organisationService.getById(orgId!),
    enabled: enabled && !!orgId,
  });
};

export const useCreateOrganisation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrganisationRequest) =>
      organisationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] });
    },
  });
};

export const useUpdateOrganisation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: UpdateOrganisationRequest }) =>
      organisationService.update(orgId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organisation', variables.orgId] });
      queryClient.invalidateQueries({ queryKey: ['organisations'] });
    },
  });
};

export const useDeleteOrganisation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId }: { orgId: string }) =>
      organisationService.delete(orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisations'] });
    },
  });
};

export const useUpdateBranding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: UpdateBrandingRequest }) =>
      organisationService.updateBranding(orgId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organisation', variables.orgId] });
    },
  });
};

export const useOrgMembers = (orgId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['org-members', orgId],
    queryFn: () => organisationService.getMembers(orgId!),
    enabled: enabled && !!orgId,
  });
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: InviteMemberRequest }) =>
      organisationService.inviteMember(orgId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org-members', variables.orgId] });
    },
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, userId, data }: { orgId: string; userId: string; data: UpdateMemberRoleRequest }) =>
      organisationService.updateMemberRole(orgId, userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org-members', variables.orgId] });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, userId }: { orgId: string; userId: string }) =>
      organisationService.removeMember(orgId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org-members', variables.orgId] });
    },
  });
};

export const useOrgModules = (orgId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['org-modules', orgId],
    queryFn: () => organisationService.getModules(orgId!),
    enabled: enabled && !!orgId,
  });
};

export const useActivateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, module }: { orgId: string; module: ModuleName }) =>
      organisationService.activateModule(orgId, module),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org-modules', variables.orgId] });
      queryClient.invalidateQueries({ queryKey: ['organisation', variables.orgId] });
    },
  });
};

export const useDeactivateModule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, module }: { orgId: string; module: ModuleName }) =>
      organisationService.deactivateModule(orgId, module),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['org-modules', variables.orgId] });
      queryClient.invalidateQueries({ queryKey: ['organisation', variables.orgId] });
    },
  });
};

export const usePaymentHistory = (orgId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['payment-history', orgId],
    queryFn: () => organisationService.getPaymentHistory(orgId!),
    enabled: enabled && !!orgId,
  });
};
