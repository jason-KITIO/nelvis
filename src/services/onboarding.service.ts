export type CreateOnboardingRequest = {
  name: string;
  pays: string;
  formeJuridique: string;
  adresse: string;
  siret?: string;
  siren?: string;
  logoUrl?: string;
  charteGraphique?: Record<string, unknown>;
  selectedPlan: string;
  modules: {
    juridique: boolean;
    facturation: boolean;
    comptabilite: boolean;
    rhPaie: boolean;
    vocal: boolean;
    logistique: boolean;
  };
};

export const onboardingService = {
  async createPaymentIntent(selectedPlan: string): Promise<{ clientSecret: string; amount: number; plan: string }> {
    const res = await fetch('/api/onboarding/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ selectedPlan }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async confirmPayment(paymentIntentId: string): Promise<{ success: boolean; status: string }> {
    const res = await fetch('/api/onboarding/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ paymentIntentId }),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async createWithPlan(data: CreateOnboardingRequest): Promise<{ organisation: any }> {
    const res = await fetch('/api/onboarding/create-with-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
};
