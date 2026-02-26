"use client";

import React from "react";
import { 
  TrendingUp, 
  FileText, 
  AlertCircle, 
  Euro, 
  Zap, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock,
  Plus
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";



// Données fictives pour le rendu visuel
const chartData = [
  { name: "Jan", total: 0 }, { name: "Fev", total: 2400 }, { name: "Mar", total: 1900 },
  { name: "Avr", total: 4500 }, { name: "Mai", total: 3800 }, { name: "Juin", total: 5200 },
];

const creationProgress = [{ name: 'Progress', value: 45, fill: 'hsl(var(--primary))' }];

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6 bg-background min-h-screen text-foreground rounded-xl">
      
      {/* Header avec bouton IA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">Pilotage intelligent de votre entreprise.</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-purple-500 hover:opacity-90 border-none">
          <Zap className="mr-2 h-4 w-4 fill-white" /> Action IA
        </Button>
      </div>

      {/* Stats Cards - Style Neumorphique */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Chiffre d'affaires" value="12,450 €" sub="Ce mois-ci" icon={<Euro />} color="text-green-500" />
        <StatCard title="Factures en attente" value="3" sub="2,100 € à encaisser" icon={<FileText />} color="text-primary" />
        <StatCard title="Dossiers Légaux" value="1" sub="En cours de création" icon={<TrendingUp />} color="text-purple-500" />
        <StatCard title="Alertes" value="0" sub="Tout est à jour" icon={<AlertCircle />} color="text-green-500" />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        
        {/* Graphique d'activité (Analyse de revenus) */}
        <Card className="md:col-span-4 bg-card border-border shadow-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" /> Flux de trésorerie
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00c896" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00c896" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#00c896" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tracker de Création (Le besoin client MVP) */}
        <Card className="md:col-span-3 bg-card border-border shadow-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Dossier de Création</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="relative h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="80%" outerRadius="100%" barSize={12} data={creationProgress} startAngle={90} endAngle={450}>
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">45%</span>
                <span className="text-xs text-muted-foreground">Avancement</span>
              </div>
            </div>
            <div className="mt-6 w-full space-y-3">
              <CreationStep label="Questionnaire IA" status="done" />
              <StepDivider />
              <CreationStep label="Génération des Statuts" status="current" />
              <StepDivider />
              <CreationStep label="Dépôt au greffe" status="todo" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau Activité Récente */}
      <Card className="bg-card border-border shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Activité récente</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary">Voir tout <ArrowUpRight className="ml-2 h-4 w-4" /></Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="border-border">
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-muted-foreground">Événement</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Statut</TableHead>
                <TableHead className="text-right text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-border hover:bg-accent/50 transition-colors">
                <TableCell className="font-medium">Création de l'Organisation</TableCell>
                <TableCell>Il y a 2 heures</TableCell>
                <TableCell><Badge className="bg-green-500/10 text-green-500 border-none">Terminé</Badge></TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm">Détails</Button></TableCell>
              </TableRow>
              {/* Plus de lignes ici */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// --- SOUS-COMPOSANTS DE STYLE ---

function StatCard({ title, value, sub, icon, color }: any) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-default group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-background group-hover:scale-110 transition-transform ${color}`}>
          {React.cloneElement(icon, { size: 16 })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function CreationStep({ label, status }: { label: string, status: 'done' | 'current' | 'todo' }) {
  return (
    <div className="flex items-center gap-3">
      {status === 'done' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
       status === 'current' ? <Clock className="h-5 w-5 text-primary animate-pulse" /> : 
       <div className="h-5 w-5 rounded-full border-2 border-border" />}
      <span className={`text-sm ${status === 'todo' ? 'text-muted-foreground' : 'text-foreground'}`}>{label}</span>
    </div>
  );
}

function StepDivider() {
  return <div className="ml-[9px] h-4 w-[2px] bg-border" />;
}