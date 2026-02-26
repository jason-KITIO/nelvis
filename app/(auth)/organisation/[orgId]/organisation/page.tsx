"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Building2, Palette, Users, CheckCircle2, Circle, FileText, Megaphone, Globe, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useOrganisation } from "@/hooks/use-organisation";

export default function OrganisationPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const router = useRouter();
  const { data: organisation, isLoading } = useOrganisation(orgId);

  const handleOpenAIChat = () => {
    router.push(`/organisation/${orgId}/chat?context=complete-setup`);
  };

  const steps = [
    { name: "Choix forme juridique", status: "complete" },
    { name: "Rédaction des statuts", status: "complete" },
    { name: "Signature du M0", status: "current" },
    { name: "Annonce légale", status: "pending" },
    { name: "Landing Page vitrine", status: "pending" },
  ];

  const modules = [
    {
      title: "Statuts Juridiques",
      description: "Générez vos statuts certifiés en quelques clics",
      icon: FileText,
      href: `/organisation/${orgId}/organisation/infos`,
      status: "complete",
    },
    {
      title: "Formulaire M0",
      description: "Complétez votre dossier d'immatriculation",
      icon: Building2,
      href: `/organisation/${orgId}/organisation/infos`,
      status: "current",
    },
    {
      title: "Annonce Légale",
      description: "Publiez votre annonce de création",
      icon: Megaphone,
      href: `/organisation/${orgId}/organisation/infos`,
      status: "pending",
    },
    {
      title: "Charte Graphique",
      description: "Logo, couleurs et identité visuelle",
      icon: Palette,
      href: `/organisation/${orgId}/organisation/charte`,
      status: "pending",
    },
    {
      title: "Landing Page",
      description: "Créez votre site vitrine professionnel",
      icon: Globe,
      href: `/organisation/${orgId}/organisation/charte`,
      status: "pending",
    },
    {
      title: "Membres & Rôles",
      description: "Invitez votre équipe et gérez les accès",
      icon: Users,
      href: `/organisation/${orgId}/organisation/membres`,
      status: "pending",
    },
  ];

  const completedSteps = steps.filter(s => s.status === "complete").length;
  const progressValue = Math.round((completedSteps / steps.length) * 100);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-6 gap-6 rounded-xl">
      {/* HEADER */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">Configuration de &ldquo;{organisation?.organisation.name}&rdquo;</h1>
          <Badge variant="secondary">En cours</Badge>
        </div>
        <p className="text-muted-foreground">Complétez les modules ci-dessous pour finaliser votre dossier.</p>
      </header>

      {/* PROGRESSION */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Progression</CardTitle>
          <div className="flex items-center justify-between pt-2">
            <span className="text-3xl font-bold text-primary">{progressValue}%</span>
            <span className="text-xs font-medium">{completedSteps} / {steps.length} étapes</span>
          </div>
          <Progress value={progressValue} className="h-2 mt-2" />
        </CardHeader>
        <CardContent>
          <nav className="flex gap-6 flex-wrap">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                {step.status === "complete" ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : step.status === "current" ? (
                  <Circle className="h-5 w-5 text-primary animate-pulse fill-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30" />
                )}
                <span className={`text-sm ${
                  step.status === "pending" ? "text-muted-foreground" : "font-medium"
                }`}>
                  {step.name}
                </span>
              </div>
            ))}
          </nav>
        </CardContent>
      </Card>

      {/* MODULES */}
      <div className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card 
                key={index} 
                className={`hover:border-primary cursor-pointer transition-all relative ${
                  module.status === "complete" ? "border-primary/30 bg-primary/5" : 
                  module.status === "current" ? "border-primary" : ""
                }`}
              >
                {module.status === "complete" && (
                  <CheckCircle2 className="absolute top-3 right-3 h-5 w-5 text-primary" />
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                  {module.status === "pending" ? null : (
                    <Link href={module.href}>
                      <Button 
                        variant={module.status === "current" ? "default" : "outline"} 
                        size="sm"
                        className="w-full"
                      >
                        Modifier
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
