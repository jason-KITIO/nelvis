"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EntreprisePage() {
  const { orgId } = useParams();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-3xl font-bold">Mon entreprise</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Créer mon entreprise</CardTitle>
            <CardDescription>Questionnaire IA pour créer votre société</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/organisation/${orgId}/entreprise/creer`}>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Commencer
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mes documents</CardTitle>
            <CardDescription>Statuts, M0, Annonce légale</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/organisation/${orgId}/entreprise/documents`}>
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Voir les documents
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Procès-verbaux</CardTitle>
            <CardDescription>Registre des décisions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/organisation/${orgId}/entreprise/proces-verbaux`}>
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Accéder au registre
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
