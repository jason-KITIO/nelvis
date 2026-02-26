"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Step1Identity } from "./step1-identity"
import { Step2Contact } from "./step2-contact"
import { Step3Branding } from "./step3-branding"
import { Step5Payment } from "./step5-payment"
import { Step4Summary } from "./step4-summary"
import { useAuth } from "@/providers/auth-provider"
import { useError } from "@/hooks"
import { onboardingService } from "@/services"

export type OnboardingData = {
  name: string
  pays: string
  formeJuridique: string
  adresse: string
  siret?: string
  siren?: string
  logoUrl?: string
  charteGraphique?: Record<string, unknown>
  selectedPlan?: string
  paymentCompleted?: boolean
  modules: {
    juridique: boolean
    facturation: boolean
    comptabilite: boolean
    rhPaie: boolean
    vocal: boolean
    logistique: boolean
  }
}

export function OnboardingFlow() {
  const router = useRouter()
  const { showError } = useError()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    name: "",
    pays: "FR",
    formeJuridique: "",
    adresse: "",
    paymentCompleted: false,
    modules: {
      juridique: false,
      facturation: false,
      comptabilite: false,
      rhPaie: false,
      vocal: false,
      logistique: false,
    },
  })

  const updateData = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }))
  }

  const handleNext = () => setStep((s) => Math.min(s + 1, 5))
  const handleBack = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = async () => {
    if (!data.selectedPlan) {
      showError("Veuillez sélectionner un plan")
      return
    }

    setLoading(true)
    try {
      await onboardingService.createWithPlan({
        name: data.name,
        pays: data.pays,
        formeJuridique: data.formeJuridique,
        adresse: data.adresse,
        siret: data.siret,
        siren: data.siren,
        logoUrl: data.logoUrl,
        charteGraphique: data.charteGraphique,
        selectedPlan: data.selectedPlan,
        modules: data.modules,
      })
      window.location.href = "/organisation"
    } catch (error) {
      showError(error instanceof Error ? error.message : "Erreur lors de la création")
      setLoading(false)
    }
  }

  const progress = (step / 5) * 100

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Créer votre organisation</h1>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">Étape {step} sur 5</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 1 && <Step1Identity data={data} updateData={updateData} onNext={handleNext} />}
          {step === 2 && <Step2Contact data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />}
          {step === 3 && <Step3Branding data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />}
          {step === 4 && <Step4Summary data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />}
          {step === 5 && <Step5Payment data={data} updateData={updateData} onSubmit={handleSubmit} onBack={handleBack} loading={loading} />}
        </CardContent>
      </Card>
    </div>
  )
}
