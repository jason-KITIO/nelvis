'use client';

import type { Produit } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ProduitDetailsDialogProps {
  produit: Produit;
  trigger: React.ReactNode;
}

export function ProduitDetailsDialog({ produit, trigger }: ProduitDetailsDialogProps) {
  const prixTTC = produit.prixHt * (1 + produit.tauxTva / 100);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Détails du produit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Référence</p>
            <p className="font-medium">{produit.reference}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nom</p>
            <p className="font-medium">{produit.nom}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <Badge variant={produit.type === 'PRODUIT' ? 'default' : 'secondary'}>
              {produit.type === 'PRODUIT' ? 'Produit' : 'Service'}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Prix HT</p>
              <p className="font-medium">{produit.prixHt.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prix TTC</p>
              <p className="font-medium">{prixTTC.toFixed(2)} €</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Taux TVA</p>
            <p className="font-medium">{produit.tauxTva} %</p>
          </div>
          {produit.type === 'PRODUIT' && (
            <div>
              <p className="text-sm text-muted-foreground">Stock</p>
              <p className="font-medium">{produit.stock ?? 'Non géré'}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
