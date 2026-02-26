"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard, CheckCircle2 } from "lucide-react"
import type { OnboardingData } from "./onboarding-flow"
import { useState, useEffect } from "react"
import { onboardingService } from "@/services"
import { useError } from "@/hooks"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const PLANS = [
  { id: "starter", name: "Starter", price: 49 },
  { id: "business", name: "Business", price: 149 },
  { id: "enterprise", name: "Enterprise", price: 399 },
]

type Props = {
  data: OnboardingData
  updateData: (partial: Partial<OnboardingData>) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}

function PaymentForm({ onPaymentSuccess, loading }: { onPaymentSuccess: () => void, loading: boolean }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const { showError } = useError()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || loading) return

    setProcessing(true)
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      })

      if (error) {
        showError(error.message || "Erreur de paiement")
      } else if (paymentIntent?.status === "succeeded") {
        onPaymentSuccess()
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : "Erreur lors du paiement")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || processing || loading} className="w-full">
        {processing ? "Traitement..." : loading ? "Création..." : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Payer et créer l'organisation
          </>
        )}
      </Button>
    </form>
  )
}

export function Step5Payment({ data, updateData, onSubmit, onBack, loading }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [initLoading, setInitLoading] = useState(false)
  const { showError } = useError()

  const selectedPlan = PLANS.find(p => p.id === data.selectedPlan)

  useEffect(() => {
    if (data.selectedPlan && !clientSecret && !data.paymentCompleted) {
      handleInitPayment()
    }
  }, [data.selectedPlan])

  const handleInitPayment = async () => {
    if (!data.selectedPlan) return

    setInitLoading(true)
    try {
      const { clientSecret } = await onboardingService.createPaymentIntent(data.selectedPlan)
      setClientSecret(clientSecret)
    } catch (error) {
      showError(error instanceof Error ? error.message : "Erreur lors de l'initialisation")
    } finally {
      setInitLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    updateData({ paymentCompleted: true })
    // Attendre que l'état soit mis à jour avant de soumettre
    setTimeout(() => {
      onSubmit()
    }, 100)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Paiement</h2>
        <p className="text-sm text-muted-foreground">Finalisez votre abonnement pour créer l'organisation</p>
      </div>

      {selectedPlan && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{selectedPlan.name}</p>
              <p className="text-sm text-muted-foreground">Abonnement mensuel</p>
            </div>
            <p className="text-2xl font-bold">{selectedPlan.price}€<span className="text-sm text-muted-foreground">/mois</span></p>
          </div>
        </div>
      )}

      {initLoading ? (
        <div className="text-center py-8">Initialisation du paiement...</div>
      ) : clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm onPaymentSuccess={handlePaymentSuccess} loading={loading} />
        </Elements>
      ) : (
        <div className="text-center py-8 text-muted-foreground">Erreur lors du chargement du formulaire de paiement</div>
      )}

      <Button onClick={onBack} variant="outline" className="w-full" disabled={loading}>
        Retour
      </Button>
    </div>
  )
}
