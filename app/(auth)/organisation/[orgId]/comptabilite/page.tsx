"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import { useEcritures, useRapportsTVA, useExportFEC, useExportSage, useAuditTVA } from "@/hooks";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Download, FileText, Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ComptabilitePage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { data: ecritures, isLoading: loadingEcritures } = useEcritures(orgId);
  const { data: rapportsTVA, isLoading: loadingTVA } = useRapportsTVA(orgId);
  const exportFEC = useExportFEC(orgId);
  const exportSage = useExportSage(orgId);
  const auditTVA = useAuditTVA(orgId);
  const [periode, setPeriode] = useState(format(new Date(), "yyyy-MM"));

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Comptabilité</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportFEC.mutate()}>
            <Download className="mr-2 h-4 w-4" />
            Export FEC
          </Button>
          <Button variant="outline" onClick={() => exportSage.mutate()}>
            <Download className="mr-2 h-4 w-4" />
            Export SAGE
          </Button>
        </div>
      </div>

      <Tabs defaultValue="ecritures">
        <TabsList>
          <TabsTrigger value="ecritures">Écritures</TabsTrigger>
          <TabsTrigger value="tva">TVA</TabsTrigger>
        </TabsList>

        <TabsContent value="ecritures">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Écritures comptables</CardTitle>
                <Link href={`/organisation/${orgId}/comptabilite/nouvelle-ecriture`}>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle écriture
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loadingEcritures ? (
                <p className="text-sm text-muted-foreground">Chargement...</p>
              ) : !ecritures || ecritures.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune écriture</p>
              ) : (
                <div className="space-y-2">
                  {ecritures.map((e) => (
                    <div key={e.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{e.journal}</p>
                        <p className="text-sm text-muted-foreground">
                          {e.compteDebit} → {e.compteCredit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{e.montant}€</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(e.dateEcriture), "dd MMM yyyy", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tva">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Rapports TVA</CardTitle>
                <Button
                  size="sm"
                  onClick={() => auditTVA.mutate({ periode })}
                  disabled={auditTVA.isPending}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Lancer audit IA
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTVA ? (
                <p className="text-sm text-muted-foreground">Chargement...</p>
              ) : !rapportsTVA || rapportsTVA.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun rapport TVA</p>
              ) : (
                <div className="space-y-4">
                  {rapportsTVA.map((r) => (
                    <div key={r.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">Période {r.periode}</p>
                        <p className="text-lg font-bold">{r.soldeTva}€</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">TVA collectée</p>
                          <p className="font-medium">{r.tvaCollectee}€</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">TVA déductible</p>
                          <p className="font-medium">{r.tvaDeductible}€</p>
                        </div>
                      </div>
                      {r.anomalies && r.anomalies.anomalies.length > 0 && (
                        <div className="mt-2 text-sm text-orange-600">
                          {r.anomalies.anomalies.length} anomalie(s) détectée(s)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
