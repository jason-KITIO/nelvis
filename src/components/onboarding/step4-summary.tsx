"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { OnboardingData } from "./onboarding-flow"

type Props = {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export function Step4Summary({ data, updateData, onNext, onBack }: Props) {
  const activeModules = Object.entries(data.modules)
    .filter(([_, active]) => active)
    .map(([key]) => key)

  const selectPlan = (planId: string) => {
    updateData({ selectedPlan: planId })
  }

  const PLANS = [
    { id: "starter", name: "Starter", price: 49 },
    { id: "business", name: "Business", price: 149 },
    { id: "enterprise", name: "Enterprise", price: 399 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Récapitulatif</h2>
        <p className="text-sm text-muted-foreground">Vérifiez vos informations avant de procéder au paiement</p>
      </div>

      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-xs text-muted-foreground">Nom de l&apos;entreprise</p>
          <p className="font-medium">{data.name}</p>
        </div>
        {data.logoUrl && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Logo</p>
            <img src={data.logoUrl} alt="Logo" className="h-16 w-16 object-contain border rounded" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Pays</p>
            <p className="font-medium">{data.pays}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Forme juridique</p>
            <p className="font-medium">{data.formeJuridique}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Adresse</p>
          <p className="font-medium">{data.adresse}</p>
        </div>
        {(data.siret || data.siren) && (
          <div className="grid grid-cols-2 gap-4">
            {data.siret && (
              <div>
                <p className="text-xs text-muted-foreground">SIRET</p>
                <p className="font-medium">{data.siret}</p>
              </div>
            )}
            {data.siren && (
              <div>
                <p className="text-xs text-muted-foreground">SIREN</p>
                <p className="font-medium">{data.siren}</p>
              </div>
            )}
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Modules activés</p>
          {activeModules.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeModules.map((mod) => (
                <Badge key={mod} variant="secondary">
                  {mod}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun module activé</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Sélectionnez votre formule</p>
        <div className="grid gap-3 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => selectPlan(plan.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                data.selectedPlan === plan.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <h3 className="font-semibold">{plan.name}</h3>
              <p className="text-2xl font-bold">{plan.price}€<span className="text-sm text-muted-foreground">/mois</span></p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Retour
        </Button>
        <Button onClick={onNext} disabled={!data.selectedPlan} className="flex-1">
          Procéder au paiement
        </Button>
      </div>
    </div>
  )
}
