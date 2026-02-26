'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { produitService } from '@/services';
import { AddProduitDialog } from '@/components/produits/add-produit-dialog';
import { EditProduitDialog } from '@/components/produits/edit-produit-dialog';
import { DeleteProduitDialog } from '@/components/produits/delete-produit-dialog';
import { ProduitDetailsDialog } from '@/components/produits/produit-details-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, Pencil, Trash2, Package, Eye } from 'lucide-react';

export default function CataloguePage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['produits', orgId],
    queryFn: () => produitService.getAll(orgId),
  });

  const filteredProduits = useMemo(() => {
    if (!data?.produits) return [];
    return data.produits.filter(
      (produit) =>
        produit.nom.toLowerCase().includes(search.toLowerCase()) ||
        produit.reference.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Catalogue produits</h1>
          <p className="text-muted-foreground">Gérez vos produits et services</p>
        </div>
        {!isLoading && data?.produits.length !== 0 && (
          <AddProduitDialog orgId={orgId} />
        )}
      </div>

      {!isLoading && data?.produits.length !== 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {isLoading ? (
        <div>Chargement...</div>
      ) : data?.produits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Aucun produit</h2>
          <p className="text-muted-foreground mb-6">
            Commencez par ajouter votre premier produit
          </p>
          <AddProduitDialog orgId={orgId} />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Prix HT</TableHead>
                <TableHead>TVA</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProduits.map((produit) => (
                <TableRow key={produit.id}>
                  <TableCell className="font-medium">{produit.reference}</TableCell>
                  <TableCell>{produit.nom}</TableCell>
                  <TableCell>
                    <Badge variant={produit.type === 'PRODUIT' ? 'default' : 'secondary'}>
                      {produit.type === 'PRODUIT' ? 'Produit' : 'Service'}
                    </Badge>
                  </TableCell>
                  <TableCell>{produit.prixHt.toFixed(2)} €</TableCell>
                  <TableCell>{produit.tauxTva} %</TableCell>
                  <TableCell>{produit.stock ?? '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <ProduitDetailsDialog
                          produit={produit}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Eye className="mr-2 h-4 w-4" />
                              Détails
                            </DropdownMenuItem>
                          }
                        />
                        <EditProduitDialog
                          orgId={orgId}
                          produit={produit}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                          }
                        />
                        <DeleteProduitDialog
                          orgId={orgId}
                          produitId={produit.id}
                          produitName={produit.nom}
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
