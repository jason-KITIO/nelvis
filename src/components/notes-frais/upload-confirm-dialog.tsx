"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, X, FileText } from "lucide-react";

interface UploadConfirmDialogProps {
  file: File | null;
  preview: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  isUploading: boolean;
}

export function UploadConfirmDialog({
  file,
  preview,
  onConfirm,
  onCancel,
  isUploading,
}: UploadConfirmDialogProps) {
  const isDocument = file?.name.match(/\.(pdf|xlsx|xls|csv)$/i);

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer l'ajout du reçu</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isDocument ? (
            <div className="flex flex-col items-center gap-4 p-8 border rounded">
              <FileText className="h-16 w-16 text-muted-foreground" />
              <p className="text-sm font-medium">{file?.name}</p>
              <p className="text-xs text-muted-foreground">
                {file?.type || "Document"}
              </p>
            </div>
          ) : (
            preview && (
              <img
                src={preview}
                alt="Aperçu"
                className="w-full max-h-96 rounded border object-contain"
              />
            )
          )}
          <p className="text-sm text-muted-foreground">
            {isDocument
              ? "Le document sera enregistré et pourra être analysé manuellement."
              : "Le reçu sera analysé automatiquement par l'IA pour extraire les informations."}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isUploading}>
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          <Button onClick={onConfirm} disabled={isUploading}>
            <Check className="mr-2 h-4 w-4" />
            {isUploading ? "Analyse en cours..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
