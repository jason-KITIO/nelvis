"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { User, Shield, Link2 } from "lucide-react";

export default function ParametresPage() {
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;

  const sections = [
    {
      title: "Profil utilisateur",
      description: "Gérez vos informations personnelles",
      icon: User,
      href: `/organisation/${orgId}/parametres/profil`,
    },
    {
      title: "Sécurité",
      description: "Mot de passe et authentification",
      icon: Shield,
      href: `/organisation/${orgId}/parametres/securite`,
    },
    {
      title: "Connexions",
      description: "Intégrations et API",
      icon: Link2,
      href: `/organisation/${orgId}/parametres/connexions`,
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <h1 className="text-3xl font-bold">Paramètres</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.href} className="cursor-pointer hover:border-primary" onClick={() => router.push(section.href)}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <CardTitle>{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
