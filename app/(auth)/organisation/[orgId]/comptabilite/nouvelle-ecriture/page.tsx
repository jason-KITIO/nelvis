"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from "next/navigation";
import { useCreateEcriture } from "@/hooks";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NouvelleEcriturePage() {
  const { orgId } = useParams<{ orgId: string }>();
  const router = useRouter();
  const createMutation = useCreateEcriture(orgId);
  
  const [formData, setFormData] = useState({
    journal: "",
    compteDebit: "",
    compteCredit: "",
    montant: "",
    dateEcriture: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        ...formData,
        montant: parseFloat(formData.montant),
      },
      {
        onSuccess: () => {
          router.push(`/organisation/${orgId}/comptabilite`);
        },
      }
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <Link href={`/organisation/${orgId}/comptabilite`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Nouvelle écriture comptable</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'écriture</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="journal">Journal</Label>
                <Input
                  id="journal"
                  value={formData.journal}
                  onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                  placeholder="VE, AC, BQ..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateEcriture">Date</Label>
                <Input
                  id="dateEcriture"
                  type="date"
                  value={formData.dateEcriture}
                  onChange={(e) => setFormData({ ...formData, dateEcriture: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="compteDebit">Compte débit</Label>
                <Input
                  id="compteDebit"
                  value={formData.compteDebit}
                  onChange={(e) => setFormData({ ...formData, compteDebit: e.target.value })}
                  placeholder="411000"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compteCredit">Compte crédit</Label>
                <Input
                  id="compteCredit"
                  value={formData.compteCredit}
                  onChange={(e) => setFormData({ ...formData, compteCredit: e.target.value })}
                  placeholder="707000"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant">Montant (€)</Label>
              <Input
                id="montant"
                type="number"
                step="0.01"
                min="0"
                value={formData.montant}
                onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Création..." : "Créer l'écriture"}
              </Button>
              <Link href={`/organisation/${orgId}/comptabilite`}>
                <Button type="button" variant="outline">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
