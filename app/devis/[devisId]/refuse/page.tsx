'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { XCircle, Printer } from 'lucide-react';

async function getDevis(devisId: string) {
  const res = await fetch(`/api/devis/${devisId}/info`);
  if (!res.ok) throw new Error('Devis non trouvé');
  return res.json();
}

async function refuseDevis(devisId: string, motif: string, token: string) {
  const res = await fetch(`/api/devis/${devisId}/refuse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motif, token }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erreur lors du refus');
  }
  return res.json();
}

export default function RefuseDevisPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const devisId = params.devisId as string;
  const token = searchParams.get('token');
  const [motif, setMotif] = useState('');

  const handlePrint = () => {
    window.open(`/api/devis/${devisId}/pdf`, '_blank');
  };

  const { data, isLoading } = useQuery({
    queryKey: ['devis-public', devisId],
    queryFn: () => getDevis(devisId),
  });

  const refuseMutation = useMutation({
    mutationFn: () => refuseDevis(devisId, motif, token || ''),
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accès non autorisé</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Le lien d&apos;accès est invalide ou a expiré.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!data?.devis) return <div className="min-h-screen flex items-center justify-center">Devis non trouvé</div>;

  const devis = data.devis;

  if (refuseMutation.isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{refuseMutation.error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (refuseMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl text-destructive">Devis refusé</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Vous avez refusé le devis <strong>{devis.numero}</strong>.</p>
            <p>L&apos;entreprise <strong>{devis.organisation.name}</strong> va être notifiée de votre refus.</p>
            {motif && (
              <div className="bg-muted p-4 rounded-lg text-left">
                <p className="text-sm text-muted-foreground">
                  <strong>Motif :</strong> {motif}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (devis.statut !== 'ENVOYE') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Devis déjà traité</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Ce devis a déjà été {devis.statut === 'ACCEPTE' ? 'accepté' : 'refusé'}.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Refuser le devis {devis.numero}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Entreprise</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{devis.organisation.name}</p>
                <p>{devis.organisation.adresse}</p>
                {devis.organisation.siret && <p>SIRET: {devis.organisation.siret}</p>}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Informations</h3>
              <div className="text-sm space-y-1">
                <p>Date d&apos;expiration : {new Date(devis.dateExpiration).toLocaleDateString('fr-FR')}</p>
                <p className="font-medium">Montant TTC : {(Number(devis.montantHt) + Number(devis.tva)).toFixed(2)} €</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Détail des prestations</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">Prix HT</TableHead>
                  <TableHead className="text-right">Total HT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devis.lignes?.map((ligne: { description: string; quantite: number; prixUnitaireHt: number }, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{ligne.description}</TableCell>
                    <TableCell className="text-right">{ligne.quantite}</TableCell>
                    <TableCell className="text-right">{ligne.prixUnitaireHt.toFixed(2)} €</TableCell>
                    <TableCell className="text-right">
                      {(ligne.quantite * ligne.prixUnitaireHt).toFixed(2)} €
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motif">Motif du refus (optionnel)</Label>
            <Textarea
              id="motif"
              placeholder="Expliquez pourquoi vous refusez ce devis..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => refuseMutation.mutate()}
              disabled={refuseMutation.isPending}
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              {refuseMutation.isPending ? 'Refus...' : 'Refuser ce devis'}
            </Button>
            <Button 
              onClick={handlePrint}
              variant="outline"
              size="lg"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}