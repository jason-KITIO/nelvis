'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Printer } from 'lucide-react';

async function getDevis(devisId: string) {
  const res = await fetch(`/api/devis/${devisId}/info`);
  if (!res.ok) throw new Error('Devis non trouvé');
  return res.json();
}

async function acceptDevis(devisId: string, token: string) {
  const res = await fetch(`/api/devis/${devisId}/accept`, { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Erreur lors de l\'acceptation');
  }
  return res.json();
}

export default function AcceptDevisPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const devisId = params.devisId as string;
  const token = searchParams.get('token');

  const { data, isLoading } = useQuery({
    queryKey: ['devis-public', devisId],
    queryFn: () => getDevis(devisId),
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptDevis(devisId, token || ''),
  });

  const handlePrint = () => {
    window.open(`/api/devis/${devisId}/pdf`, '_blank');
  };

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
  const montantTTC = Number(devis.montantHt) + Number(devis.tva);

  if (acceptMutation.isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{acceptMutation.error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (acceptMutation.isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl text-primary">Devis accepté !</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Merci d&apos;avoir accepté le devis <strong>{devis.numero}</strong>.</p>
            <p>L&apos;entreprise <strong>{devis.organisation.name}</strong> va être notifiée de votre acceptation.</p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Montant TTC : <strong>{montantTTC.toFixed(2)} €</strong>
              </p>
            </div>
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
          <CardTitle>Accepter le devis {devis.numero}</CardTitle>
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
              <h3 className="font-semibold mb-2">Client</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{devis.client.nom}</p>
                <p>{devis.client.adresse}</p>
                {devis.client.siret && <p>SIRET: {devis.client.siret}</p>}
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
                  <TableHead className="text-right">TVA</TableHead>
                  <TableHead className="text-right">Total HT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devis.lignes?.map((ligne: { description: string; quantite: number; prixUnitaireHt: number; tauxTva: number }, index: number) => (
                  <TableRow key={index}>
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
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Total HT :</span>
              <span>{devis.montantHt.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>TVA :</span>
              <span>{devis.tva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total TTC :</span>
              <span>{montantTTC.toFixed(2)} €</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
              className="flex-1"
              size="lg"
            >
              {acceptMutation.isPending ? 'Acceptation...' : 'Accepter ce devis'}
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