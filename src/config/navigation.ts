import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Receipt,
  Package,
  Kanban,
  CreditCard,
  Calculator,
  Settings,
  Briefcase,
  CreditCard as CardIcon,
} from "lucide-react";

export const mvpNavigation = {
  main: [
    {
      title: "Tableau de bord",
      url: "/organisation/[orgId]/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Clients",
      url: "/organisation/[orgId]/clients",
      icon: Users,
    },
    {
      title: "Devis",
      url: "/organisation/[orgId]/devis",
      icon: FileText,
    },
    {
      title: "Factures",
      url: "/organisation/[orgId]/factures",
      icon: Receipt,
    },
    {
      title: "Catalogue",
      url: "/organisation/[orgId]/catalogue",
      icon: Package,
    },
    // {
    //   title: "CRM Pipeline",
    //   url: "/organisation/[orgId]/crm",
    //   icon: Kanban,
    // },
    {
      title: "Notes de frais",
      url: "/organisation/[orgId]/notes-frais",
      icon: CreditCard,
      // items: [
      //   {
      //     title: "Scanner un reçu",
      //     url: "/organisation/[orgId]/notes-frais/scanner",
      //   },
      //   {
      //     title: "Liste des notes",
      //     url: "/organisation/[orgId]/notes-frais",
      //   },
      // ],
    },
    {
      title: "Comptabilité",
      url: "/organisation/[orgId]/comptabilite",
      icon: Calculator,
      // items: [
      //   {
      //     title: "Comptes bancaires",
      //     url: "/organisation/[orgId]/comptabilite/comptes",
      //   },
      //   {
      //     title: "Rapprochement bancaire",
      //     url: "/organisation/[orgId]/comptabilite/rapprochement",
      //   },
      //   {
      //     title: "Reste-à-facturer",
      //     url: "/organisation/[orgId]/comptabilite/reste-a-facturer",
      //   },
      //   {
      //     title: "Export FEC / SAGE",
      //     url: "/organisation/[orgId]/comptabilite/export",
      //   },
      //   {
      //     title: "Rapport TVA",
      //     url: "/organisation/[orgId]/comptabilite/tva",
      //   },
      // ],
    },
  ],
  settings: [
    {
      title: "Mon organisation",
      url: "/organisation/[orgId]/organisation",
      icon: Briefcase,
      items: [
        {
          title: "Informations légales",
          url: "/organisation/[orgId]/organisation/infos",
        },
        {
          title: "Charte graphique",
          url: "/organisation/[orgId]/organisation/charte",
        },
        {
          title: "Membres & rôles",
          url: "/organisation/[orgId]/organisation/membres",
        },
      ],
    },
    {
      title: "Modules & Abonnements",
      url: "/organisation/[orgId]/abonnements",
      icon: CardIcon,
      items: [
        {
          title: "Modules actifs",
          url: "/organisation/[orgId]/abonnements/modules",
        },
        {
          title: "Historique des paiements",
          url: "/organisation/[orgId]/abonnements/historique",
        },
      ],
    },
    {
      title: "Paramètres",
      url: "/organisation/[orgId]/parametres",
      icon: Settings,
      items: [
        // {
        //   title: "Mon entreprise",
        //   url: "/organisation/[orgId]/entreprise",
        // },
        {
          title: "Profil utilisateur",
          url: "/organisation/[orgId]/parametres/profil",
        },
        {
          title: "Sécurité",
          url: "/organisation/[orgId]/parametres/securite",
        },
        {
          title: "Connexions",
          url: "/organisation/[orgId]/parametres/connexions",
        },
      ],
    },
  ],
};
