'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { factureService, clientService, produitService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  clientId: string;
  dateEcheance: string;
  lignes: {
    produitId?: string;
    description: string;
    quantite: number;
    prixUnitaireHt: number;
    tauxTva: number;
  }[];
}

export default function NouveauFacturePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orgId = params.orgId as string;

  const { data: clientsData } = useQuery({
    queryKey: ['clients', orgId],
    queryFn: () => clientService.getAll(orgId),
  });

  const { data: produitsData } = useQuery({
    queryKey: ['produits', orgId],
    queryFn: () => produitService.getAll(orgId),
  });

  const form = useForm<FormData>({
    defaultValues: {
      clientId: '',
      dateEcheance: '',
      lignes: [{ description: '', quantite: 1, prixUnitaireHt: 0, tauxTva: 20 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lignes',
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => factureService.create(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures', orgId] });
      toast.success('Facture créée avec succès');
      router.push(`/organisation/${orgId}/factures`);
    },
    onError: () => {
      toast.error('Erreur lors de la création de la facture');
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    if (!data.clientId) {
      toast.error('Client requis');
      return;
    }
    if (!data.dateEcheance) {
      toast.error('Date d\'échéance requise');
      return;
    }
    mutation.mutate({
      ...data,
      dateEcheance: new Date(data.dateEcheance).toISOString(),
    });
  });

  const addProduit = (index: number, produitId: string) => {
    const produit = produitsData?.produits.find(p => p.id === produitId);
    if (produit) {
      form.setValue(`lignes.${index}.description`, produit.nom);
      form.setValue(`lignes.${index}.prixUnitaireHt`, produit.prixHt);
      form.setValue(`lignes.${index}.tauxTva`, produit.tauxTva);
      form.setValue(`lignes.${index}.produitId`, produit.id);
    }
  };

  const totalHt = form.watch('lignes').reduce((sum, ligne) => 
    sum + (ligne.quantite * ligne.prixUnitaireHt), 0
  );

  const totalTva = form.watch('lignes').reduce((sum, ligne) => 
    sum + (ligne.quantite * ligne.prixUnitaireHt * ligne.tauxTva / 100), 0
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nouvelle facture</h1>
        <p className="text-muted-foreground">Créez une nouvelle facture</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Client</label>
              <Select onValueChange={(value) => form.setValue('clientId', value)} value={form.watch('clientId')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clientsData?.clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date d&apos;échéance</label>
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...form.register('dateEcheance')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Lignes de la facture</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: '', quantite: 1, prixUnitaireHt: 0, tauxTva: 20 })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ligne
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start border p-4 rounded-lg">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Produit (optionnel)</label>
                      <Select onValueChange={(value) => addProduit(index, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                        <SelectContent>
                          {produitsData?.produits.map((produit) => (
                            <SelectItem key={produit.id} value={produit.id}>
                              {produit.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input {...form.register(`lignes.${index}.description`)} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantité</label>
                      <Input
                        type="number"
                        min="1"
                        {...form.register(`lignes.${index}.quantite`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prix unitaire HT</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...form.register(`lignes.${index}.prixUnitaireHt`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">TVA (%)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...form.register(`lignes.${index}.tauxTva`, { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total HT</span>
              <span className="font-medium">{totalHt.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span>Total TVA</span>
              <span className="font-medium">{totalTva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total TTC</span>
              <span>{(totalHt + totalTva).toFixed(2)} €</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Création...' : 'Créer la facture'}
          </Button>
        </div>
      </form>
    </div>
  );
}
