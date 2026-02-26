"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ConnexionsPage() {
  const integrations = [
    {
      name: "Stripe",
      description: "Paiements en ligne",
      connected: false,
    },
    {
      name: "PayPal",
      description: "Paiements alternatifs",
      connected: false,
    },
    {
      name: "API Bancaire",
      description: "Synchronisation bancaire",
      connected: false,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-3xl font-bold">Connexions</h1>
      <Card>
        <CardHeader>
          <CardTitle>Intégrations</CardTitle>
          <CardDescription>Gérez vos connexions externes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{integration.name}</h3>
                  <Badge variant={integration.connected ? "default" : "secondary"}>
                    {integration.connected ? "Connecté" : "Non connecté"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {integration.description}
                </p>
              </div>
              <Button variant="outline" size="sm">
                {integration.connected ? "Déconnecter" : "Connecter"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
