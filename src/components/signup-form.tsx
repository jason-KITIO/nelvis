"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useRegister, useError } from "@/hooks"
import { useAuth } from "@/providers/auth-provider"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const register = useRegister()
  const { setAuth } = useAuth()
  const { showError } = useError()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch) return

    try {
      const result = await register.mutateAsync({
        email,
        password,
        firstName: email.split('@')[0],
        lastName: 'User',
      })
      setAuth(result.accessToken, result.refreshToken)
      router.push('/onboarding')
    } catch (error: any) {
      showError(error?.response?.data?.error || error?.message || "Échec de la création du compte.")
    }
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Créer votre compte</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Entrez votre email ci-dessous pour créer votre compte
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email <span className="text-red-500">*</span></FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@exemple.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Mot de passe <span className="text-red-500">*</span></FieldLabel>
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirmer le mot de passe <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input 
                      id="confirm-password" 
                      type={showPassword ? "text" : "password"}
                      required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Field>
                </Field>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="show-password"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <label htmlFor="show-password" className="text-sm cursor-pointer">
                    Afficher le mot de passe
                  </label>
                </div>
                <FieldDescription>
                  Doit contenir au moins 8 caractères. <br />
                  {passwordsMatch && <span className="text-green-600 font-semibold ml-2">✓ Mots de passe identique</span>}
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={register.isPending || !passwordsMatch}>
                  {register.isPending ? "Création..." : "Créer un compte"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Vous avez déjà un compte ? <a href="/login" className="text-primary hover:underline">Se connecter</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          
          <div className="hidden md:block m-5 ml-0">
            <div className="bg-muted xl:flex items-center justify-center h-full w-full rounded-xl">
              <Image
                src="/img/1.png"
                alt="Illustration"
                width={1000000}
                height={1000000}
                className="h-auto w-96 object-contain"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        En continuant, vous acceptez nos <a href="#">Conditions d&apos;utilisation</a>{" "}
        et notre <a href="#">Politique de confidentialité</a>.
      </FieldDescription>
    </div>
  )
}
