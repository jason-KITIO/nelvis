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
import Link from "next/link";
import { useState } from "react";
import { Check, X } from "lucide-react";
import { AuthRedirect } from "@/components/guards";
import { useResetPassword } from "@/hooks/use-auth";
import { useSearchParams, useRouter } from "next/navigation";

export default function CreatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const isValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && token) {
      resetPassword({ token, password }, {
        onSuccess: () => router.push("/login"),
      });
    }
  };

  return (
    <AuthRedirect>
      <div className="flex min-h-screen items-center justify-center p-4">
      <div className={cn("flex flex-col gap-6 w-full max-w-xl")}>
        <Card className="overflow-hidden p-0">
          <CardContent className="p-0">
            <form className="p-6 md:p-8" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Créer un mot de passe</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Choisissez un mot de passe sécurisé pour votre compte
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="password">Nouveau mot de passe</FieldLabel>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirm-password">Confirmer le mot de passe</FieldLabel>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
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
                    Afficher les mots de passe
                  </label>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-medium">Le mot de passe doit contenir :</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {hasMinLength ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={hasMinLength ? "text-green-600" : "text-muted-foreground"}>
                        Au moins 8 caractères
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasUpperCase ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={hasUpperCase ? "text-green-600" : "text-muted-foreground"}>
                        Une lettre majuscule
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasLowerCase ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={hasLowerCase ? "text-green-600" : "text-muted-foreground"}>
                        Une lettre minuscule
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasNumber ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={hasNumber ? "text-green-600" : "text-muted-foreground"}>
                        Un chiffre
                      </span>
                    </div>
                    {confirmPassword && (
                      <div className="flex items-center gap-2">
                        {passwordsMatch ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                        <span className={passwordsMatch ? "text-green-600" : "text-destructive"}>
                          Les mots de passe correspondent
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Field>
                  <Button type="submit" className="w-full" disabled={!isValid || isPending}>
                    {isPending ? "Création..." : "Créer le mot de passe"}
                  </Button>
                </Field>

                <FieldDescription className="text-center">
                  <Link href="/login" className="text-primary hover:underline">
                    Retour à la connexion
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          En continuant, vous acceptez nos{" "}
          <a href="#">Conditions d&apos;utilisation</a> et notre{" "}
          <a href="#">Politique de confidentialité</a>.
        </FieldDescription>
      </div>
    </div>
    </AuthRedirect>
  );
}
