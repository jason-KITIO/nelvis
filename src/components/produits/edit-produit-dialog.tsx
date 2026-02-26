'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { produitService } from '@/services';
import { updateProduitSchema } from '@/lib/validations/produit';
import { z } from 'zod';
import type { Produit } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type FormData = z.infer<typeof updateProduitSchema>;

interface EditProduitDialogProps {
  orgId: string;
  produit: Produit;
  trigger: React.ReactNode;
}

export function EditProduitDialog({ orgId, produit, trigger }: EditProduitDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(updateProduitSchema),
    defaultValues: {
      reference: produit.reference,
      nom: produit.nom,
      type: produit.type,
      prixHt: produit.prixHt,
      tauxTva: produit.tauxTva,
      stock: produit.stock ?? undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => produitService.update(orgId, produit.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produits', orgId] });
      setOpen(false);
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PRODUIT">Produit</SelectItem>
                      <SelectItem value="SERVICE">Service</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prixHt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix HT (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tauxTva"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taux TVA (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock (optionnel)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Modification...' : 'Modifier'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
