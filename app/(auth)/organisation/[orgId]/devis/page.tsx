'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devisService } from '@/services';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MoreVertical, Plus, FileText, Send, Check, X, FileCheck, Download, Eye } from 'lucide-react';

const statutColors = {
  DRAFT: 'secondary',
  ENVOYE: 'default',
  ACCEPTE: 'default',
  REFUSE: 'destructive',
} as const;

const statutLabels = {
  DRAFT: 'Brouillon',
  ENVOYE: 'Envoyé',
  ACCEPTE: 'Accepté',
  REFUSE: 'Refusé',
};

export default function DevisPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<string>('ALL');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['devis', orgId, statutFilter],
    queryFn: () => devisService.getAll(orgId, statutFilter !== 'ALL' ? { statut: statutFilter } : undefined),
  });

  const sendMutation = useMutation({
    mutationFn: (devisId: string) => devisService.send(orgId, devisId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devis', orgId] }),
  });

  const acceptMutation = useMutation({
    mutationFn: (devisId: string) => devisService.accept(orgId, devisId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devis', orgId] }),
  });

  const refuseMutation = useMutation({
    mutationFn: (devisId: string) => devisService.refuse(orgId, devisId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devis', orgId] }),
  });

  const convertMutation = useMutation({
    mutationFn: (devisId: string) => devisService.convert(orgId, devisId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devis', orgId] });
      router.push(`/organisation/${orgId}/factures`);
    },
  });

  const filteredDevis = useMemo(() => {
    if (!data?.devis) return [];
    return data.devis.filter(
      (devis) =>
        devis.numero.toLowerCase().includes(search.toLowerCase()) ||
        devis.client?.nom.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Devis</h1>
          <p className="text-muted-foreground">Gérez vos devis</p>
        </div>
        <Button onClick={() => router.push(`/organisation/${orgId}/devis/nouveau`)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau devis
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro ou client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statutFilter} onValueChange={setStatutFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            <SelectItem value="DRAFT">Brouillon</SelectItem>
            <SelectItem value="ENVOYE">Envoyé</SelectItem>
            <SelectItem value="ACCEPTE">Accepté</SelectItem>
            <SelectItem value="REFUSE">Refusé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div>Chargement...</div>
      ) : data?.devis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Aucun devis</h2>
          <p className="text-muted-foreground mb-6">
            Commencez par créer votre premier devis
          </p>
          <Button onClick={() => router.push(`/organisation/${orgId}/devis/nouveau`)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Montant HT</TableHead>
                <TableHead>Montant TTC</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevis.map((devis) => (
                <TableRow key={devis.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/organisation/${orgId}/devis/${devis.id}`)}>
                  <TableCell className="font-medium">{devis.numero}</TableCell>
                  <TableCell>{devis.client?.nom}</TableCell>
                  <TableCell>{devis.montantHt.toFixed(2)} €</TableCell>
                  <TableCell>{(devis.montantHt + devis.tva).toFixed(2)} €</TableCell>
                  <TableCell>
                    {devis.statut === 'ACCEPTE' ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {statutLabels[devis.statut]}
                      </Badge>
                    ) : (
                      <Badge variant={statutColors[devis.statut]}>
                        {statutLabels[devis.statut]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(devis.dateExpiration).toLocaleDateString()}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/organisation/${orgId}/devis/${devis.id}`); }}>
                          <Eye className="mr-2 h-4 w-4" />
                          Détails
                        </DropdownMenuItem>
                        {devis.statut === 'DRAFT' && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); sendMutation.mutate(devis.id); }}>
                            <Send className="mr-2 h-4 w-4" />
                            Envoyer
                          </DropdownMenuItem>
                        )}
                        {devis.statut === 'ACCEPTE' && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); convertMutation.mutate(devis.id); }}>
                            <FileCheck className="mr-2 h-4 w-4" />
                            Convertir en facture
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); devisService.downloadPdf(orgId, devis.id); }}>
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger PDF
                        </DropdownMenuItem>
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
