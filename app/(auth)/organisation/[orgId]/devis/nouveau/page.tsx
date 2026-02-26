'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { devisService, clientService, produitService } from '@/services';
import { createDevisSchema } from '@/lib/validations/devis';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

type FormData = z.infer<typeof createDevisSchema>;

export default function NouveauDevisPage() {
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
    resolver: zodResolver(createDevisSchema),
    defaultValues: {
      clientId: '',
      dateExpiration: '',
      lignes: [{ description: '', quantite: 1, prixUnitaireHt: 0, tauxTva: 20 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lignes',
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => devisService.create(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devis', orgId] });
      router.push(`/organisation/${orgId}/devis`);
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

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
        <h1 className="text-3xl font-bold">Nouveau devis</h1>
        <p className="text-muted-foreground">Créez un nouveau devis</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientsData?.clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateExpiration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date d'expiration</FormLabel>
                    <FormControl>
                      <Input type="date" min={new Date().toISOString().split('T')[0]} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lignes du devis</CardTitle>
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
                      <div>
                        <FormLabel>Produit (optionnel)</FormLabel>
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
                    <FormField
                      control={form.control}
                      name={`lignes.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`lignes.${index}.quantite`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantité</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`lignes.${index}.prixUnitaireHt`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prix unitaire HT</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`lignes.${index}.tauxTva`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TVA (%)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" max="100" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
              {mutation.isPending ? 'Création...' : 'Créer le devis'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
