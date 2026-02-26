import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { comptabiliteService } from "@/services";
import type { EcritureComptable, CreateEcritureRequest, UpdateEcritureRequest, AuditTVARequest } from "@/types";
import { toast } from "sonner";

export function useEcritures(orgId: string, filters?: { journal?: string; dateDebut?: string; dateFin?: string }) {
  return useQuery({
    queryKey: ["ecritures", orgId, filters],
    queryFn: () => comptabiliteService.listEcritures(orgId, filters),
  });
}

export function useEcriture(orgId: string, ecritureId: string) {
  return useQuery({
    queryKey: ["ecritures", orgId, ecritureId],
    queryFn: () => comptabiliteService.getEcriture(orgId, ecritureId),
    enabled: !!ecritureId,
  });
}

export function useCreateEcriture(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEcritureRequest) => comptabiliteService.createEcriture(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ecritures", orgId] });
      toast.success("Écriture créée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'écriture");
    },
  });
}

export function useUpdateEcriture(orgId: string, ecritureId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEcritureRequest) => comptabiliteService.updateEcriture(orgId, ecritureId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ecritures", orgId] });
      queryClient.invalidateQueries({ queryKey: ["ecritures", orgId, ecritureId] });
      toast.success("Écriture mise à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
}

export function useRapportsTVA(orgId: string) {
  return useQuery({
    queryKey: ["rapports-tva", orgId],
    queryFn: () => comptabiliteService.listRapportsTVA(orgId),
  });
}

export function useRapportTVA(orgId: string, periode: string) {
  return useQuery({
    queryKey: ["rapports-tva", orgId, periode],
    queryFn: () => comptabiliteService.getRapportTVA(orgId, periode),
    enabled: !!periode,
  });
}

export function useAuditTVA(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AuditTVARequest) => comptabiliteService.auditTVA(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rapports-tva", orgId] });
      toast.success("Audit TVA terminé");
    },
    onError: () => {
      toast.error("Erreur lors de l'audit TVA");
    },
  });
}

export function useExportFEC(orgId: string) {
  return useMutation({
    mutationFn: (annee?: string) => comptabiliteService.exportFEC(orgId, annee),
    onSuccess: () => {
      toast.success("Export FEC téléchargé");
    },
    onError: () => {
      toast.error("Erreur lors de l'export FEC");
    },
  });
}

export function useExportSage(orgId: string) {
  return useMutation({
    mutationFn: (filters?: { dateDebut?: string; dateFin?: string }) => comptabiliteService.exportSage(orgId, filters),
    onSuccess: () => {
      toast.success("Export SAGE téléchargé");
    },
    onError: () => {
      toast.error("Erreur lors de l'export SAGE");
    },
  });
}
