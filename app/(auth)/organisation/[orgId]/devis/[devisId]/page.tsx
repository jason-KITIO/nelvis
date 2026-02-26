'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { devisService } from '@/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Send, Check, X, FileCheck, Download, Trash2 } from 'lucide-react';

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

export default function DevisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const devisId = params.devisId as string;
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['devis', orgId, devisId],
    queryFn: () => devisService.getById(orgId, devisId),
  });

  const sendMutation = useMutation({
    mutationFn: () => devisService.send(orgId, devisId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devis', orgId, devisId] }),
  });

  const acceptMutation = useMutation({
    mutationFn: () => devisService.accept(orgId, devisId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devis', orgId, devisId] }),
  });

  const refuseMutation = useMutation({
    mutationFn: () => devisService.refuse(orgId, devisId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devis', orgId, devisId] }),
  });

  const convertMutation = useMutation({
    mutationFn: () => devisService.convert(orgId, devisId),
    onSuccess: () => router.push(`/organisation/${orgId}/factures`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => devisService.delete(orgId, devisId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devis', orgId] });
      router.push(`/organisation/${orgId}/devis`);
    },
  });

  const handleDeleteConfirm = () => {
    deleteMutation.mutate();
    setShowDeleteDialog(false);
  };

  if (isLoading) return <div className="p-6">Chargement...</div>;
  if (!data?.devis) return <div className="p-6">Devis non trouvé</div>;

  const devis = data.devis;
  const montantTTC = devis.montantHt + devis.tva;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button className="cursor-pointer" variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Devis {devis.numero}</h1>
            <p className="text-muted-foreground">Détails du devis</p>
          </div>
        </div>
        <div className="flex gap-2">
          {devis.statut === 'DRAFT' && (
            <Button className="cursor-pointer" onClick={() => sendMutation.mutate()}>
              <Send className="mr-2 h-4 w-4" />
              Envoyer
            </Button>
          )}
          {devis.statut === 'ACCEPTE' && (
            <Button className="cursor-pointer" onClick={() => convertMutation.mutate()}>
              <FileCheck className="mr-2 h-4 w-4" />
              Convertir en facture
            </Button>
          )}
          <Button className="cursor-pointer" variant="outline" onClick={() => devisService.downloadPdf(orgId, devisId)}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button className="cursor-pointer" variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Numéro:</span>
              <span className="font-medium">{devis.numero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut:</span>
              {devis.statut === 'ACCEPTE' ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{statutLabels[devis.statut]}</Badge>
              ) : (
                <Badge variant={statutColors[devis.statut]}>{statutLabels[devis.statut]}</Badge>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date de création:</span>
              <span>{new Date(devis.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date d&apos;expiration:</span>
              <span>{new Date(devis.dateExpiration).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nom:</span>
              <span className="font-medium">{devis.client?.nom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{devis.client?.email}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lignes du devis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Prix unitaire HT</TableHead>
                <TableHead className="text-right">TVA</TableHead>
                <TableHead className="text-right">Total HT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {devis.lignes?.map((ligne) => (
                <TableRow key={ligne.id}>
                  <TableCell>{ligne.description}</TableCell>
                  <TableCell className="text-right">{ligne.quantite}</TableCell>
                  <TableCell className="text-right">{ligne.prixUnitaireHt.toFixed(2)} €</TableCell>
                  <TableCell className="text-right">{ligne.tauxTva}%</TableCell>
                  <TableCell className="text-right">
                    {(ligne.quantite * ligne.prixUnitaireHt).toFixed(2)} €
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Totaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-lg">
            <span>Total HT:</span>
            <span className="font-medium">{devis.montantHt.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>TVA:</span>
            <span className="font-medium">{devis.tva.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span>Total TTC:</span>
            <span>{montantTTC.toFixed(2)} €</span>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le devis</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le devis <strong>{devis.numero}</strong> ?
              Cette action est irréversible et supprimera définitivement toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
