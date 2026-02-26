import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { noteFraisService } from "@/services";
import type { NoteDeFrais, UpdateNoteDeFraisRequest } from "@/types";
import { toast } from "sonner";

export function useNotesFrais(orgId: string) {
  return useQuery({
    queryKey: ["notes-frais", orgId],
    queryFn: () => noteFraisService.list(orgId),
  });
}

export function useNoteFrais(orgId: string, noteId: string) {
  return useQuery({
    queryKey: ["notes-frais", orgId, noteId],
    queryFn: () => noteFraisService.get(orgId, noteId),
    enabled: !!noteId,
  });
}

export function useUploadNoteFrais(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => noteFraisService.upload(orgId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", orgId] });
      toast.success("Reçu uploadé et analysé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'upload du reçu");
    },
  });
}

export function useUpdateNoteFrais(orgId: string, noteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNoteDeFraisRequest) =>
      noteFraisService.update(orgId, noteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", orgId] });
      queryClient.invalidateQueries({ queryKey: ["notes-frais", orgId, noteId] });
      toast.success("Note de frais mise à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
}

export function useDeleteNoteFrais(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => noteFraisService.delete(orgId, noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes-frais", orgId] });
      toast.success("Note de frais supprimée");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
}
