"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useUploadNoteFrais } from "@/hooks";
import { useState } from "react";

export default function ScannerPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const router = useRouter();
  const uploadMutation = useUploadNoteFrais(orgId);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file) return;

    uploadMutation.mutate(file, {
      onSuccess: () => {
        router.push(`/organisation/${orgId}/notes-frais`);
      },
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <Link href={`/organisation/${orgId}/notes-frais`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Scanner un reçu</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload et analyse automatique</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              {preview && (
                <img
                  src={preview}
                  alt="Aperçu"
                  className="max-h-64 rounded border"
                />
              )}
              <Input
                type="file"
                name="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={uploadMutation.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploadMutation.isPending ? "Analyse en cours..." : "Analyser le reçu"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
