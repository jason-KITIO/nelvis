'use client';

import { useState } from 'react';
import type { Client, ClientStatut } from '@/types/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ClientDetailsDialogProps {
  client: Client;
  trigger: React.ReactNode;
}

export function ClientDetailsDialog({ client, trigger }: ClientDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  const getStatutBadge = (statut?: ClientStatut) => {
    const s = statut || "PROSPECT";
    const config = {
      PROSPECT: { label: "Prospect", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
      PROPOSE: { label: "Proposé", className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
      NEGOCIE: { label: "Négocié", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
      GAGNE: { label: "Gagné", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
      PERDU: { label: "Perdu", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
    };
    return <Badge className={config[s].className}>{config[s].label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Détails du client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nom</p>
            <p className="text-base font-semibold">{client.nom}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-base">{client.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Type</p>
            <Badge variant={client.type === 'B2B' ? 'default' : 'secondary'}>
              {client.type}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Statut</p>
            {getStatutBadge(client.statut)}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">SIRET</p>
            <p className="text-base">{client.siret || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Adresse</p>
            <p className="text-base">{client.adresse}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
