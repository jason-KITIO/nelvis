"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Upload, X, Loader2 } from "lucide-react"
import { cloudinaryService } from "@/services"
import type { OnboardingData } from "./onboarding-flow"

type Props = {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export function Step2Contact({ data, updateData, onNext, onBack }: Props) {
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logoUrl || null)
  const [uploading, setUploading] = useState(false)
  const canContinue = data.adresse

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      try {
        const reader = new FileReader()
        reader.onloadend = () => setLogoPreview(reader.result as string)
        reader.readAsDataURL(file)

        const cloudinaryUrl = await cloudinaryService.uploadImage(file)
        updateData({ logoUrl: cloudinaryUrl })
      } catch (error) {
        console.error('Erreur upload:', error)
        setLogoPreview(null)
      } finally {
        setUploading(false)
      }
    }
  }

  const removeLogo = () => {
    setLogoPreview(null)
    updateData({ logoUrl: undefined })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Coordonnées</h2>
        <p className="text-sm text-muted-foreground">Adresse et identifiants légaux</p>
      </div>

      <Field>
        <FieldLabel>Adresse complète <span className="text-red-500">*</span></FieldLabel>
        <Input
          value={data.adresse}
          onChange={(e) => updateData({ adresse: e.target.value })}
          placeholder="Ex: 123 Rue de la Paix, 75001 Paris"
        />
      </Field>

      <Field>
        <FieldLabel>SIRET (optionnel)</FieldLabel>
        <Input
          value={data.siret || ""}
          onChange={(e) => updateData({ siret: e.target.value })}
          placeholder="14 chiffres"
          maxLength={14}
        />
        <FieldDescription>Vous pourrez le renseigner plus tard</FieldDescription>
      </Field>

      <Field>
        <FieldLabel>SIREN (optionnel)</FieldLabel>
        <Input
          value={data.siren || ""}
          onChange={(e) => updateData({ siren: e.target.value })}
          placeholder="9 chiffres"
          maxLength={9}
        />
        <FieldDescription>Vous pourrez le renseigner plus tard</FieldDescription>
      </Field>

      <Field>
        <FieldLabel>Logo (optionnel)</FieldLabel>
        {uploading ? (
          <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
            <span className="text-sm text-muted-foreground">Upload en cours...</span>
          </div>
        ) : logoPreview ? (
          <div className="relative inline-block">
            <img src={logoPreview} alt="Logo" className="h-24 w-24 object-contain border rounded-lg" />
            <button
              onClick={removeLogo}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Cliquez pour ajouter un logo</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
          </label>
        )}
        <FieldDescription>Format recommandé: PNG ou JPG, max 2 Mo</FieldDescription>
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
