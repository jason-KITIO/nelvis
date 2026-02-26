"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trash2, Eye, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useNotesFrais, useDeleteNoteFrais, useUploadNoteFrais } from "@/hooks";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useRef, useState } from "react";
import Link from "next/link";
import { CameraScanner } from "@/components/notes-frais/camera-scanner";
import { UploadConfirmDialog } from "@/components/notes-frais/upload-confirm-dialog";

export default function NotesFraisPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: notesDeFrais, isLoading } = useNotesFrais(orgId);
  const deleteMutation = useDeleteNoteFrais(orgId);
  const uploadMutation = useUploadNoteFrais(orgId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setPendingFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
      e.target.value = "";
    }
  };

  const handleCapture = (file: File) => {
    handleFileSelect(file);
  };

  const handleConfirm = () => {
    if (pendingFile) {
      uploadMutation.mutate(pendingFile);
      setPendingFile(null);
      setPreview(null);
    }
  };

  const handleCancel = () => {
    setPendingFile(null);
    setPreview(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notes de frais</h1>
        <div className="flex gap-2">
          <CameraScanner
            onCapture={handleCapture}
            disabled={uploadMutation.isPending}
          />
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importer
          </Button>
        </div>
      </div>

      <UploadConfirmDialog
        file={pendingFile}
        preview={preview}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isUploading={uploadMutation.isPending}
      />

      <Card>
        <CardHeader>
          <CardTitle>Liste des notes de frais</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || uploadMutation.isPending ? (
            <p className="text-sm text-muted-foreground">
              {uploadMutation.isPending ? "Analyse en cours..." : "Chargement..."}
            </p>
          ) : !notesDeFrais || notesDeFrais.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune note de frais pour le moment
            </p>
          ) : (
            <div className="space-y-4">
              {notesDeFrais.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={note.photoUrl}
                      alt="Reçu"
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {note.montantOcr ? `${note.montantOcr}€` : "N/A"}
                        </p>
                        <Badge
                          variant={note.statut === "VALIDE" ? "default" : "secondary"}
                        >
                          {note.statut === "VALIDE" ? "Validé" : "IA Check"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {note.categorieOcr || "Non catégorisé"} •{" "}
                        {note.dateOcr
                          ? format(new Date(note.dateOcr), "dd MMM yyyy", { locale: fr })
                          : "Date inconnue"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Par {note.user?.firstName} {note.user?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/organisation/${orgId}/notes-frais/${note.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate(note.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
