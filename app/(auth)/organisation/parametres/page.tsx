"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Bell, Shield, Palette, Globe, Monitor } from "lucide-react";
import { OrgAppSidebar } from "@/components/organisation/org-app-sidebar";
import { useTheme } from "@/providers/theme-provider";
import { useState } from "react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <OrgAppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Paramètres</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Paramètres</h1>
            <p className="text-muted-foreground">Configurez votre application selon vos préférences.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>Apparence</CardTitle>
                </div>
                <CardDescription>Personnalisez l&apos;interface de l&apos;application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Thème</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="mr-2 h-4 w-4" />
                      Clair
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="mr-2 h-4 w-4" />
                      Sombre
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      className="w-full"
                      onClick={() => setTheme("system")}
                    >
                      <Monitor className="mr-2 h-4 w-4" />
                      Système
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="theme">Thème de couleur</Label>
                  <Select defaultValue="blue">
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Bleu</SelectItem>
                      <SelectItem value="green">Vert</SelectItem>
                      <SelectItem value="purple">Violet</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Taille de police</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="font-size">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Petite</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>Gérez vos préférences de notification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications email</Label>
                    <p className="text-sm text-muted-foreground">Recevoir des emails</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications push</Label>
                    <p className="text-sm text-muted-foreground">Alertes en temps réel</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notifications SMS</Label>
                    <p className="text-sm text-muted-foreground">Messages texte</p>
                  </div>
                  <Switch />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="frequency">Fréquence</Label>
                  <Select defaultValue="instant">
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instantané</SelectItem>
                      <SelectItem value="hourly">Toutes les heures</SelectItem>
                      <SelectItem value="daily">Quotidien</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle>Région & Langue</CardTitle>
                </div>
                <CardDescription>Paramètres régionaux de l&apos;application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select defaultValue="fr">
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select defaultValue="paris">
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paris">Paris (GMT+1)</SelectItem>
                      <SelectItem value="london">Londres (GMT+0)</SelectItem>
                      <SelectItem value="newyork">New York (GMT-5)</SelectItem>
                      <SelectItem value="tokyo">Tokyo (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select defaultValue="eur">
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="xaf">XAF (FCFA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Sécurité</CardTitle>
                </div>
                <CardDescription>Protégez votre compte et vos données</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Authentification 2FA</Label>
                    <p className="text-sm text-muted-foreground">Double authentification</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Déconnexion auto</Label>
                    <p className="text-sm text-muted-foreground">Après 30 min d&apos;inactivité</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="password">Changer le mot de passe</Label>
                  <Input id="password" type="password" placeholder="Nouveau mot de passe" />
                </div>

                <Button variant="outline" className="w-full">
                  Mettre à jour le mot de passe
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
