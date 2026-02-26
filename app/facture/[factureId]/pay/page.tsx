'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Printer, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

async function getFacture(factureId: string, token: string) {
  const res = await fetch(`/api/facture/${factureId}/info?token=${token}`);
  if (!res.ok) throw new Error('Facture non trouvée');
  return res.json();
}

async function createPaymentIntent(factureId: string, token: string) {
  const res = await fetch(`/api/facture/${factureId}/create-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error('Erreur création paiement');
  return res.json();
}

function PaymentForm({ factureId, token, montantTTC }: { factureId: string; token: string; montantTTC: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/facture/${factureId}/pay?token=${token}&success=true`,
        },
      });

      if (error) {
        toast.error(error.message || 'Erreur lors du paiement');
      }
    } catch (err) {
      toast.error(`Erreur lors du paiement: ${err} `);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full" size="lg">
        <CreditCard className="mr-2 h-4 w-4" />
        {isProcessing ? 'Traitement...' : `Payer ${montantTTC.toFixed(2)} €`}
      </Button>
    </form>
  );
}

export default function PayFacturePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const factureId = params.factureId as string;
  const token = searchParams.get('token');
  const success = searchParams.get('success');
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (success === 'true' && token) {
      fetch(`/api/facture/${factureId}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    }
  }, [success, factureId, token]);

  const { data, isLoading } = useQuery({
    queryKey: ['facture-public', factureId, token],
    queryFn: () => getFacture(factureId, token || ''),
    enabled: !!token,
  });

  const handlePrint = () => {
    window.open(`/api/organisations/${data?.facture?.organisationId}/factures/${factureId}/pdf?token=${token}`, '_blank');
  };

  const handleInitPayment = async () => {
    try {
      const result = await createPaymentIntent(factureId, token || '');
      setClientSecret(result.clientSecret);
    } catch (error) {
      toast.error(`Erreur lors de l'initialisation du paiement: ${error} `);
    }
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

  if (success === 'true') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl text-primary">Paiement réussi !</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Votre paiement a été effectué avec succès.</p>
            <p className="text-sm text-muted-foreground">Un reçu vous a été envoyé par email.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!data?.facture) return <div className="min-h-screen flex items-center justify-center">Facture non trouvée</div>;

  const facture = data.facture;
  const montantTTC = Number(facture.montantHt) + Number(facture.tvaMontant);

  if (facture.statut === 'PAYEE') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Facture déjà payée</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Cette facture a déjà été réglée.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Payer la facture {facture.numero}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Entreprise</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{facture.organisation.name}</p>
                <p>{facture.organisation.adresse}</p>
                {facture.organisation.siret && <p>SIRET: {facture.organisation.siret}</p>}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Client</h3>
              <div className="text-sm space-y-1">
                <p className="font-medium">{facture.client.nom}</p>
                <p>{facture.client.adresse}</p>
                {facture.client.siret && <p>SIRET: {facture.client.siret}</p>}
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
                {facture.lignes?.map((ligne: { description: string; quantite: number; prixUnitaireHt: number; tauxTva: number }, index: number) => (
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
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>Total HT :</span>
              <span>{Number(facture.montantHt).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>TVA :</span>
              <span>{Number(facture.tvaMontant).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total TTC :</span>
              <span>{montantTTC.toFixed(2)} €</span>
            </div>
          </div>

          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm factureId={factureId} token={token} montantTTC={montantTTC} />
            </Elements>
          ) : (
            <div className="flex gap-3">
              <Button onClick={handleInitPayment} className="flex-1" size="lg">
                <CreditCard className="mr-2 h-4 w-4" />
                Payer maintenant
              </Button>
              <Button onClick={handlePrint} variant="outline" size="lg">
                <Printer className="mr-2 h-4 w-4" />
                Imprimer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
