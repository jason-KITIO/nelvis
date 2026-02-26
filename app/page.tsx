"use client"

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, Wallet, Users, Phone, Cpu, CheckCircle2, Rocket, ArrowRight, Mail } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-xl border-b border-border z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-black tracking-tighter text-primary">NELVIS</div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#piliers" className="text-sm font-medium hover:text-primary transition">Piliers</a>
            <a href="#tarifs" className="text-sm font-medium hover:text-primary transition">Tarifs</a>
            <a href="#vision" className="text-sm font-medium hover:text-primary transition">Vision</a>
            <Link href="/signup">
              <Button variant="default" size="sm" className="font-semibold">
                Connexion
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative px-6 py-32 md:py-48 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] -z-10" />
        <div className="mx-auto max-w-5xl">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary px-4 py-1 animate-pulse">
            Version 2026 Finale
          </Badge>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground md:text-7xl mb-8">
            L&apos;Intelligence Artificielle qui <span className="text-primary">gère votre entreprise</span> de A à Z
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Le premier <strong>&quot;Company OS&quot;</strong> agentique pour entrepreneurs. De la création
            de vos statuts à la relance de vos impayés par téléphone, Nelvis automatise votre succès.
          </p>
          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="h-14 px-8 text-lg font-bold">
              Créer mon entreprise <Rocket className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold">
              Explorer le Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* --- LES 5 PILIERS --- */}
      <section id="piliers" className="px-6 py-24 bg-slate-50/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Les 5 Piliers de l&apos;Écosystème</h2>
            <p className="text-muted-foreground">Une infrastructure complète pour piloter votre croissance.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* JURIDIQUE */}
            <PillarCard 
              icon={<Scale size={40} />}
              title="JURIDIQUE"
              subtitle="Birth & Governance"
              status="Opérationnel"
              features={["Questionnaire IA (Statuts/M0)", "Site Web Vitrine Offert", "PV d&apos;Assemblées Digitalisés"]}
            />

            {/* FINANCES */}
            <PillarCard 
              icon={<Wallet size={40} />}
              title="FINANCES"
              subtitle="Billing & Liaison"
              status="En déploiement"
              features={["Facturation Vocale/Texte", "Liaison Bancaire Auto", "Audit Cash-flow Prédictif"]}
              variant="secondary"
            />

            {/* RH & PAIE */}
            <PillarCard 
              icon={<Users size={40} />}
              title="RH & PAIE"
              subtitle="Social Management"
              status="En développement"
              features={["Contrats de travail instantanés", "Génération des bulletins", "Sortie de salarié auto"]}
              isUpcoming
            />

            {/* VOCAL */}
            <PillarCard 
              icon={<Phone size={40} />}
              title="SECRÉTARIAT VOCAL"
              subtitle="Voice Agent"
              status="En développement"
              features={["Standard IA 24/7", "Recouvrement Proactif", "Prise de RDV intelligente"]}
              isUpcoming
            />

            {/* AUTOMATION - THE CORE ENGINE */}
            <Card className="md:col-span-2 lg:col-span-1 border-primary bg-primary text-primary-foreground shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent animate-pulse" />
              <CardHeader>
                <Cpu size={48} className="mb-2 animate-spin-slow" />
                <CardTitle className="text-2xl">AUTOMATION</CardTitle>
                <CardDescription className="text-primary-foreground/80 font-semibold uppercase tracking-wider">
                  The Core Engine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} /> Flux interconnectés RH/Compta
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} /> Intelligence Proactive
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={16} /> Suggestions basées sur emails
                  </li>
                </ul>
                <Badge variant="secondary" className="bg-primary-foreground/20 text-white border-none">
                  🔄 Optimisation continue
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* --- TARIFICATION --- */}
      <section id="tarifs" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">Tarification Transparente</h2>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            
            <PricingCard 
              name="Pack Starter"
              price="149€"
              description="Création + Web"
              period="Paiement unique"
              features={["Statuts + M0", "Annonce Légale", "Site Web Offert"]}
              buttonText="Choisir"
            />

            <PricingCard 
              name="Pack Business"
              price="29€"
              description="Gestion & Finance"
              period="HT / mois"
              features={["Tout du Pack Starter", "Facturation intelligente", "Liaison Bancaire", "Audit Cash-flow"]}
              highlight
              buttonText="Choisir"
            />

            <PricingCard 
              name="Pack Empire"
              price="59€"
              description="Full Agentic"
              period="HT / mois"
              features={["Tout du Pack Business", "Gestion RH & Paie", "Secrétariat Vocal IA", "Automation complète"]}
              disabled
              buttonText="Bientôt disponible"
            />
          </div>
          <p className="mt-8 text-center text-muted-foreground flex items-center justify-center gap-2">
            Paiements sécurisés par PayPal
          </p>
        </div>
      </section>

      {/* --- VISION --- */}
      <section id="vision" className="px-6 py-32 bg-slate-900 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-6">La Vision Nelvis</h2>
          <blockquote className="text-3xl md:text-4xl font-medium leading-tight mb-10 italic">
            &ldquo;Nous ne créons pas un énième logiciel de comptabilité. Nous créons
            votre premier employé numérique. Un système qui ne dort jamais, ne
            fait pas d&apos;erreurs de saisie et défend votre trésorerie.&rdquo;
          </blockquote>
          <div className="flex flex-col items-center">
            <div className="w-16 h-1 w bg-primary mb-4" />
            <p className="text-xl font-bold">Elvis NGATSE</p>
            <p className="text-slate-400">Fondateur</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="px-6 py-16 bg-background border-t">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <div className="text-2xl font-black text-primary mb-6">NELVIS</div>
            <p className="text-muted-foreground max-w-xs">L&apos;OS nouvelle génération pour les entrepreneurs qui veulent se concentrer sur l&apos;essentiel.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Écosystème</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="https://www.nelvis-transit.fr" className="hover:text-primary transition">Nelvis Transit</a></li>
              <li><a href="https://www.nelvis-as.fr" className="hover:text-primary transition">Nelvis AS - Social</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition">Mentions Légales</a></li>
              <li><a href="#" className="hover:text-primary transition">CGV</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-6xl pt-8 border-t text-center text-sm text-muted-foreground">
          © 2026 NELVIS ASSURANCES ET CRÉDIT. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function PillarCard({ icon, title, subtitle, status, features, isUpcoming = false, variant = "default" }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: string;
  features: string[];
  isUpcoming?: boolean;
  variant?: string;
}) {
  return (
    <Card className={`group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isUpcoming ? 'opacity-80' : ''}`}>
      <CardHeader>
        <div className="p-3 w-fit rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors mb-4">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-primary font-bold tracking-wide uppercase text-xs">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-6">
          {features.map((f: string, i: number) => (
            <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/40" /> {f}
            </li>
          ))}
        </ul>
        <Badge variant={status === "Opérationnel" ? "default" : "secondary"} className="rounded-full">
          {status}
        </Badge>
      </CardContent>
      {isUpcoming && (
        <CardFooter>
          <Button variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/5">
            <Mail size={14} /> M&apos;avertir de la sortie
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function PricingCard({ name, price, description, period, features, highlight = false, disabled = false, buttonText }: {
  name: string;
  price: string;
  description: string;
  period: string;
  features: string[];
  highlight?: boolean;
  disabled?: boolean;
  buttonText: string;
}) {
  return (
    <Card className={`relative flex flex-col ${highlight ? 'border-primary shadow-2xl md:-translate-y-4 z-10' : ''}`}>
      {highlight && <div className="bg-primary text-white text-[10px] font-bold uppercase py-1 px-3 absolute -top-3 left-1/2 -translate-x-1/2 rounded-full tracking-widest">Recommandé</div>}
      <CardHeader className="text-center">
        <h3 className="font-bold text-xl">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-4">
          <span className="text-5xl font-black">{price}</span>
          <span className="text-muted-foreground ml-1">{period}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-4">
          {features.map((f: string, i: number) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <CheckCircle2 size={18} className="text-primary shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button className={`w-full h-12 font-bold ${highlight ? 'bg-primary' : ''}`} variant={highlight ? 'default' : 'outline'} disabled={disabled}>
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}