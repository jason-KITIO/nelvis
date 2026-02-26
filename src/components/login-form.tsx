"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin, useError } from "@/hooks";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const login = useLogin()
  const { showError } = useError()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await login.mutateAsync({ email, password })
      router.push('/organisation')
    } catch (error: any) {
      showError(error?.message || "Échec de la connexion. Vérifiez vos identifiants.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Se connecter</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Entrez vos identifiants pour accéder à votre compte
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
                <FieldLabel htmlFor="password">Mot de passe <span className="text-red-500">*</span></FieldLabel>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="show-password"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <label
                    htmlFor="show-password"
                    className="text-sm cursor-pointer"
                  >
                    Afficher le mot de passe
                  </label>
                </div>
                <FieldDescription>
                  <a href="/reset-password" className="text-primary hover:underline">
                    Mot de passe oublié ?
                  </a>
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={login.isPending}>
                  {login.isPending ? "Connexion..." : "Se connecter"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Pas encore de compte ? <a href="/signup" className="text-primary hover:underline">Créer un compte</a>
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="hidden md:block m-5 ml-0">
            <div className="bg-muted xl:flex items-center justify-center h-full w-full rounded-xl">
              <Image
                src="/img/2.png"
                alt="Illustration"
                width={1000000}
                height={1000000}
                className="h-auto w-72 object-contain"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        En continuant, vous acceptez nos{" "}
        <a href="#">Conditions d&apos;utilisation</a> et notre{" "}
        <a href="#">Politique de confidentialité</a>.
      </FieldDescription>
    </div>
  );
}
