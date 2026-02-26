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
import { ArrowLeft } from "lucide-react";
import { AuthRedirect } from "@/components/guards";
import { useForgotPassword } from "@/hooks/use-auth";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword({ email }, {
      onSuccess: () => setSubmitted(true),
    });
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
                  <h1 className="text-2xl font-bold">
                    Réinitialiser le mot de passe
                  </h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    {submitted
                      ? "Un email de réinitialisation a été envoyé"
                      : "Entrez votre email pour recevoir un lien de réinitialisation"}
                  </p>
                </div>

                {!submitted ? (
                  <>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
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
                      <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Envoi..." : "Envoyer le lien"}
                      </Button>
                    </Field>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Vérifiez votre boîte mail <strong>{email}</strong> pour le
                      lien de réinitialisation.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSubmitted(false);
                        forgotPassword({ email }, {
                          onSuccess: () => setSubmitted(true),
                        });
                      }}
                      disabled={isPending}
                    >
                      {isPending ? "Envoi..." : "Renvoyer l'email"}
                    </Button>
                  </div>
                )}

                <FieldDescription className="text-center">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 text-primary hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4" />
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
