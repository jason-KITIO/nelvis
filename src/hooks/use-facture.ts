import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { factureService } from '@/services';
import type { CreateFactureRequest, UpdateFactureRequest, CreateFactureAIRequest } from '@/types';

export function useFactures(orgId: string, filters?: { statut?: string; clientId?: string; dateDebut?: string; dateFin?: string }) {
  return useQuery({
    queryKey: ['factures', orgId, filters],
    queryFn: () => factureService.getAll(orgId, filters),
  });
}

export function useFacture(orgId: string, factureId: string) {
  return useQuery({
    queryKey: ['facture', orgId, factureId],
    queryFn: () => factureService.getById(orgId, factureId),
    enabled: !!factureId,
  });
}

export function useCreateFacture(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFactureRequest) => factureService.create(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures', orgId] });
    },
  });
}

export function useCreateFactureAI(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFactureAIRequest) => factureService.createWithAI(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures', orgId] });
    },
  });
}

export function useUpdateFacture(orgId: string, factureId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateFactureRequest) => factureService.update(orgId, factureId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facture', orgId, factureId] });
      queryClient.invalidateQueries({ queryKey: ['factures', orgId] });
    },
  });
}

export function useDeleteFacture(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (factureId: string) => factureService.delete(orgId, factureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures', orgId] });
    },
  });
}

export function useSendFacture(orgId: string, factureId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => factureService.send(orgId, factureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facture', orgId, factureId] });
    },
  });
}

export function useMarkFacturePaid(orgId: string, factureId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => factureService.markPaid(orgId, factureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facture', orgId, factureId] });
      queryClient.invalidateQueries({ queryKey: ['factures', orgId] });
    },
  });
}

export function useGenerateAvoir(orgId: string, factureId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => factureService.generateAvoir(orgId, factureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures', orgId] });
    },
  });
}

export function useGeneratePaymentLink(orgId: string, factureId: string) {
  return useMutation({
    mutationFn: (provider: 'stripe' | 'paypal') => factureService.generatePaymentLink(orgId, factureId, provider),
  });
}
