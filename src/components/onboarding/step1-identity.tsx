"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { OnboardingData } from "./onboarding-flow"

type Props = {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
  onNext: () => void
}

export function Step1Identity({ data, updateData, onNext }: Props) {
  const canContinue = data.name && data.pays && data.formeJuridique

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Identité de l&apos;entreprise</h2>
        <p className="text-sm text-muted-foreground">Informations de base sur votre organisation</p>
      </div>

      <Field>
        <FieldLabel>Nom de l&apos;entreprise <span className="text-red-500">*</span></FieldLabel>
        <Input
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          placeholder="Ex: Ma Société SAS"
        />
      </Field>

      <Field>
        <FieldLabel>Pays <span className="text-red-500">*</span></FieldLabel>
        <Select value={data.pays} onValueChange={(pays) => updateData({ pays })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FR">France</SelectItem>
            <SelectItem value="CI">Côte d&apos;Ivoire</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel>Forme juridique <span className="text-red-500">*</span></FieldLabel>
        <Select value={data.formeJuridique} onValueChange={(formeJuridique) => updateData({ formeJuridique })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SAS">SAS</SelectItem>
            <SelectItem value="SARL">SARL</SelectItem>
            <SelectItem value="EURL">EURL</SelectItem>
            <SelectItem value="SA">SA</SelectItem>
            <SelectItem value="SCI">SCI</SelectItem>
            <SelectItem value="Auto-entrepreneur">Auto-entrepreneur</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Button onClick={onNext} disabled={!canContinue} className="w-full">
        Continuer
      </Button>
    </div>
  )
}
