import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { ErrorProvider } from "@/providers/error-provider";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "NELVIS - Company OS | Plateforme Agentique pour Entreprises",
  description:
    "Plateforme IA unifiée pour gérer juridique, facturation, comptabilité, RH, paie et secrétariat vocal. Automatisez l'intégralité du cycle de vie de votre entreprise en France et Afrique.",
  keywords: [
    "comptabilité",
    "facturation",
    "RH",
    "paie",
    "création entreprise",
    "IA",
    "automatisation",
  ],
  authors: [{ name: "Jason Kitio" }],
  openGraph: {
    title: "NELVIS Company OS",
    description: "L'OS intelligent pour piloter votre entreprise",
    url: "https://www.nelvis-compta.fr",
    siteName: "NELVIS - Company OS",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){const t=localStorage.getItem('theme')||'system';const r=document.documentElement;r.classList.remove('light','dark');if(t==='system'){r.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}else{r.classList.add(t)}})()`,
          }}
        />
      </head>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ErrorProvider>
            <QueryProvider>
              <AuthProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </AuthProvider>
            </QueryProvider>
          </ErrorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
