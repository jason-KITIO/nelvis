"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Scale, FileText, Calculator, Users, Phone, Truck } from "lucide-react"
import type { OnboardingData } from "./onboarding-flow"

type Props = {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

const MODULES = [
  { key: "juridique", label: "Juridique", description: "Gestion des statuts et PV", icon: Scale },
  { key: "facturation", label: "Facturation", description: "Devis et factures", icon: FileText },
  { key: "comptabilite", label: "Comptabilité", description: "Écritures et TVA", icon: Calculator },
  { key: "rhPaie", label: "RH & Paie", description: "Employés et contrats", icon: Users },
  { key: "vocal", label: "Vocal", description: "Recouvrement automatisé", icon: Phone },
  { key: "logistique", label: "Logistique", description: "Douane et export", icon: Truck },
] as const

export function Step3Branding({ data, updateData, onNext, onBack }: Props) {
  const toggleModule = (key: keyof OnboardingData["modules"]) => {
    updateData({
      modules: {
        ...data.modules,
        [key]: !data.modules[key],
      },
    })
  }

  const selectedCount = Object.values(data.modules).filter(Boolean).length
  const canContinue = selectedCount >= 1

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Modules & Préférences</h2>
        <p className="text-sm text-muted-foreground">Choisissez les modules à activer</p>
      </div>

      <Field>
        <FieldLabel>Modules à activer</FieldLabel>
        <FieldDescription>Vous pourrez modifier ces choix plus tard</FieldDescription>
        <div className="space-y-3 mt-3">
          {MODULES.map((module) => {
            const Icon = module.icon
            const isSelected = data.modules[module.key]
            return (
              <div 
                key={module.key} 
                onClick={() => toggleModule(module.key)}
                className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                  isSelected ? 'bg-primary/10 border-primary' : ''
                }`}
              >
                <Checkbox
                  id={module.key}
                  checked={isSelected}
                  onCheckedChange={() => toggleModule(module.key)}
                />
                <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <label htmlFor={module.key} className="text-sm font-medium cursor-pointer">
                    {module.label}
                  </label>
                  <p className="text-xs text-muted-foreground">{module.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Field>

      <div className="flex gap-3">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Retour
        </Button>
        <Button onClick={onNext} disabled={!canContinue} className="flex-1">
          Continuer
        </Button>
      </div>
    </div>
  )
}
