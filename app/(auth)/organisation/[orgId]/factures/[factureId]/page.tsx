'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useFacture, useSendFacture, useMarkFacturePaid, useGenerateAvoir, useDeleteFacture, useGeneratePaymentLink } from '@/hooks';
import { factureService } from '@/services';
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
import { ArrowLeft, Send, CheckCircle, FileText, Download, Trash2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

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

export default function FactureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.orgId as string;
  const factureId = params.factureId as string;
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, isLoading } = useFacture(orgId, factureId);
  const sendMutation = useSendFacture(orgId, factureId);
  const markPaidMutation = useMarkFacturePaid(orgId, factureId);
  const avoirMutation = useGenerateAvoir(orgId, factureId);
  const deleteMutation = useDeleteFacture(orgId);
  const paymentLinkMutation = useGeneratePaymentLink(orgId, factureId);

  const handleSend = async () => {
    try {
      await sendMutation.mutateAsync();
      toast.success('Facture envoyée avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  const handleMarkPaid = async () => {
    try {
      await markPaidMutation.mutateAsync();
      toast.success('Facture marquée comme payée');
    } catch (error) {
      toast.error('Erreur lors du marquage');
    }
  };

  const handleGenerateAvoir = async () => {
    try {
      const result = await avoirMutation.mutateAsync();
      toast.success('Avoir généré avec succès');
      router.push(`/organisation/${orgId}/factures/${result.avoir.id}`);
    } catch (error) {
      toast.error('Erreur lors de la génération de l\'avoir');
    }
  };

  const handleGeneratePaymentLink = async (provider: 'stripe' | 'paypal') => {
    try {
      if (!facture.tokenAcces) {
        toast.error('Token manquant, veuillez envoyer la facture d\'abord');
        return;
      }
      const paymentUrl = `${window.location.origin}/facture/${factureId}/pay?token=${facture.tokenAcces}`;
      await navigator.clipboard.writeText(paymentUrl);
      toast.success('Lien de paiement copié dans le presse-papier');
    } catch (error) {
      toast.error('Erreur lors de la copie du lien');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(factureId);
      toast.success('Facture supprimée');
      router.push(`/organisation/${orgId}/factures`);
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
    setShowDeleteDialog(false);
  };

  if (isLoading) return <div className="p-6">Chargement...</div>;
  if (!data?.facture) return <div className="p-6">Facture non trouvée</div>;

  const facture = data.facture;
  const montantTTC = Number(facture.montantHt) + Number(facture.tvaMontant);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Facture {facture.numero}</h1>
            <p className="text-muted-foreground">Détails de la facture</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSend}>
            <Send className="mr-2 h-4 w-4" />
            Envoyer
          </Button>
          {facture.statut !== 'PAYEE' && facture.statut !== 'AVOIR' && (
            <Button variant="outline" onClick={handleMarkPaid}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Marquer payée
            </Button>
          )}
          {facture.statut === 'PAYEE' && (
            <Button variant="outline" onClick={handleGenerateAvoir}>
              <FileText className="mr-2 h-4 w-4" />
              Générer avoir
            </Button>
          )}
          <Button variant="outline" onClick={() => handleGeneratePaymentLink('stripe')}>
            <CreditCard className="mr-2 h-4 w-4" />
            Lien Stripe
          </Button>
          <Button variant="outline" onClick={() => factureService.downloadPdf(orgId, factureId)}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          {facture.statut === 'EMISE' && (
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          )}
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
              <span className="font-medium">{facture.numero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Statut:</span>
              {facture.statut === 'PAYEE' ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{statutLabels[facture.statut]}</Badge>
              ) : (
                <Badge variant={statutColors[facture.statut]}>{statutLabels[facture.statut]}</Badge>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date de création:</span>
              <span>{new Date(facture.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date d&apos;échéance:</span>
              <span>{new Date(facture.dateEcheance).toLocaleDateString()}</span>
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
              <span className="font-medium">{facture.client?.nom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span>{facture.client?.email}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lignes de la facture</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Prix unitaire HT</TableHead>
                <TableHead className="text-right">TVA (%)</TableHead>
                <TableHead className="text-right">Total HT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facture.lignes?.map((ligne: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{ligne.description}</TableCell>
                  <TableCell className="text-right">{ligne.quantite}</TableCell>
                  <TableCell className="text-right">{Number(ligne.prixUnitaireHt).toFixed(2)} €</TableCell>
                  <TableCell className="text-right">{ligne.tauxTva}%</TableCell>
                  <TableCell className="text-right">
                    {(ligne.quantite * Number(ligne.prixUnitaireHt)).toFixed(2)} €
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
            <span className="font-medium">{Number(facture.montantHt).toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>TVA:</span>
            <span className="font-medium">{Number(facture.tvaMontant).toFixed(2)} €</span>
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
            <AlertDialogTitle>Supprimer la facture</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la facture <strong>{facture.numero}</strong> ?
              Cette action est irréversible.
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
