"use client"

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { OnboardingGuard } from "@/components/guards"

export default function OnboardingPage() {
  return (
    <OnboardingGuard>
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6">
        <OnboardingFlow />
      </div>
    </OnboardingGuard>
  )
}
