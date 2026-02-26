"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePaymentHistory } from "@/hooks/use-organisation";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
export default function AbonnementsPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const { data: paymentData, isLoading } = usePaymentHistory(orgId);
  
  const modules = [
    {
      name: "Module Finance",
      active: true,
      description: "Facturation & Comptabilité",
    },
    {
      name: "Module Fondateur",
      active: true,
      description: "Création d'entreprise",
    },
    {
      name: "Module RH & Paie",
      active: false,
      description: "Gestion des employés",
    },
    {
      name: "Module Vocal",
      active: false,
      description: "Secrétariat & Recouvrement",
    },
    {
      name: "Module Logistique",
      active: false,
      description: "Transit & Douane",
    },
  ];
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-3xl font-bold">Modules & Abonnements</h1>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Modules actifs</CardTitle>
            <CardDescription>Gérez vos modules et abonnements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {modules.map((module) => (
              <div
                key={module.name}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{module.name}</h3>
                    <Badge variant={module.active ? "default" : "secondary"}>
                      {module.active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>
                </div>
                {!module.active && (
                  <Button variant="outline" size="sm">
                    Activer
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Historique des paiements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Chargement...</p>
            ) : !paymentData?.payments?.length ? (
              <p className="text-sm text-muted-foreground">
                Aucun paiement pour le moment
              </p>
            ) : (
              <div className="space-y-3">
                {paymentData.payments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{payment.module}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.debut), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{payment.montant.toString()} €</p>
                      <Badge variant={payment.statut === "ACTIF" ? "default" : "secondary"}>
                        {payment.statut}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
