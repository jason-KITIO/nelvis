"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useNoteFrais, useUpdateNoteFrais } from "@/hooks";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function NoteFraisDetailPage() {
  const { orgId, noteId } = useParams<{ orgId: string; noteId: string }>();
  const router = useRouter();
  const { data: noteDeFrais, isLoading } = useNoteFrais(orgId, noteId);
  const updateMutation = useUpdateNoteFrais(orgId, noteId);

  const [montant, setMontant] = useState("");
  const [date, setDate] = useState("");
  const [categorie, setCategorie] = useState("");

  useEffect(() => {
    if (noteDeFrais) {
      setMontant(noteDeFrais.montantOcr?.toString() || "");
      setDate(
        noteDeFrais.dateOcr
          ? format(new Date(noteDeFrais.dateOcr), "yyyy-MM-dd")
          : ""
      );
      setCategorie(noteDeFrais.categorieOcr || "");
    }
  }, [noteDeFrais]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(
      {
        montantOcr: parseFloat(montant),
        dateOcr: new Date(date).toISOString(),
        categorieOcr: categorie,
        statut: "VALIDE",
      },
      {
        onSuccess: () => {
          router.push(`/organisation/${orgId}/notes-frais`);
        },
      }
    );
  };

  if (isLoading) {
    return <div className="p-4">Chargement...</div>;
  }

  if (!noteDeFrais) {
    return <div className="p-4">Note de frais introuvable</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <Link href={`/organisation/${orgId}/notes-frais`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Détail de la note de frais</h1>
        <Badge variant={noteDeFrais.statut === "VALIDE" ? "default" : "secondary"}>
          {noteDeFrais.statut === "VALIDE" ? "Validé" : "En attente"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reçu scanné</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={noteDeFrais.photoUrl}
              alt="Reçu"
              className="w-full rounded border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Données extraites (OCR)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="montant">Montant (€)</Label>
                <Input
                  id="montant"
                  type="number"
                  step="0.01"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="categorie">Catégorie</Label>
                <Input
                  id="categorie"
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value)}
                  placeholder="Ex: TRANSPORT, RESTAURATION"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={updateMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? "Enregistrement..." : "Valider"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
