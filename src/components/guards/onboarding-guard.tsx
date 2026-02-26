'use client'

import { useAuth } from "@/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useOrganisations } from "@/hooks"

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const { data, isLoading } = useOrganisations()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!user || isLoading) return null

  return <>{children}</>
}
