'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useFactures } from '@/hooks';
import { clientService } from '@/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Plus } from 'lucide-react';

const statutColors = {
  EMISE: 'default',
  PAYEE: 'default',
  IMPAYEE: 'destructive',
  AVOIR: 'secondary',
} as const;

const statutLabels = {
  EMISE: 'Émise',
  PAYEE: 'Payée',
  IMPAYEE: 'Impayée',
  AVOIR: 'Avoir',
};

export default function FacturesPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const [statutFilter, setStatutFilter] = useState<string>('ALL');

  const { data: facturesData, isLoading } = useFactures(orgId, statutFilter !== 'ALL' ? { statut: statutFilter } : undefined);
  const { data: clientsData } = useQuery({
    queryKey: ['clients', orgId],
    queryFn: () => clientService.getAll(orgId),
  });

  const factures = facturesData?.factures || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Factures</h1>
          <p className="text-muted-foreground">Gérez vos factures clients</p>
        </div>
        <Button onClick={() => router.push(`/organisation/${orgId}/factures/nouveau`)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Liste des factures</CardTitle>
            <Select value={statutFilter} onValueChange={setStatutFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous</SelectItem>
                <SelectItem value="EMISE">Émise</SelectItem>
                <SelectItem value="PAYEE">Payée</SelectItem>
                <SelectItem value="IMPAYEE">Impayée</SelectItem>
                <SelectItem value="AVOIR">Avoir</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : factures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucune facture trouvée</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead className="text-right">Montant HT</TableHead>
                  <TableHead className="text-right">TVA</TableHead>
                  <TableHead className="text-right">Total TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {factures.map((facture) => (
                  <TableRow key={facture.id}>
                    <TableCell className="font-medium">{facture.numero}</TableCell>
                    <TableCell>{facture.client?.nom}</TableCell>
                    <TableCell>{new Date(facture.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(facture.dateEcheance).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{Number(facture.montantHt).toFixed(2)} €</TableCell>
                    <TableCell className="text-right">{Number(facture.tvaMontant).toFixed(2)} €</TableCell>
                    <TableCell className="text-right">
                      {(Number(facture.montantHt) + Number(facture.tvaMontant)).toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      {facture.statut === 'PAYEE' ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          {statutLabels[facture.statut]}
                        </Badge>
                      ) : (
                        <Badge variant={statutColors[facture.statut]}>{statutLabels[facture.statut]}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/organisation/${orgId}/factures/${facture.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
