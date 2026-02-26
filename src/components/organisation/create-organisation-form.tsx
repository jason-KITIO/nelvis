'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { useCreateOrganisation, useError } from '@/hooks';
import { useAuth } from '@/providers/auth-provider';

export function CreateOrganisationForm({ onSuccess }: { onSuccess?: () => void }) {
  const { token } = useAuth();
  const createOrg = useCreateOrganisation();
  const { showError } = useError();
  const [name, setName] = useState('');
  const [formeJuridique, setFormeJuridique] = useState('');
  const [pays, setPays] = useState('France');
  const [adresse, setAdresse] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await createOrg.mutateAsync({
        token,
        data: { name, formeJuridique, pays, adresse },
      });
      onSuccess?.();
    } catch (error: any) {
      showError(error?.message || "Échec de la création de l'organisation.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field>
        <FieldLabel>Nom de l'organisation <span className="text-red-500">*</span></FieldLabel>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Field>
      <Field>
        <FieldLabel>Forme juridique <span className="text-red-500">*</span></FieldLabel>
        <Input
          value={formeJuridique}
          onChange={(e) => setFormeJuridique(e.target.value)}
          placeholder="SAS, SARL, etc."
          required
        />
      </Field>
      <Field>
        <FieldLabel>Pays <span className="text-red-500">*</span></FieldLabel>
        <Input
          value={pays}
          onChange={(e) => setPays(e.target.value)}
          required
        />
      </Field>
      <Field>
        <FieldLabel>Adresse <span className="text-red-500">*</span></FieldLabel>
        <Input
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
          required
        />
      </Field>
      <Button type="submit" disabled={createOrg.isPending} className="w-full">
        {createOrg.isPending ? 'Création...' : 'Créer l\'organisation'}
      </Button>
    </form>
  );
}
