export interface CreateSubscriptionRequest {
  module: string;
  type: 'ACTE' | 'ABONNEMENT';
  montant: number;
  provider: 'STRIPE' | 'PAYPAL';
}

export interface CreateSubscriptionResponse {
  subscriptionId: string;
  checkoutUrl: string;
}

const API_URL = '/api/organisations';

export const subscriptionService = {
  async create(token: string, orgId: string, data: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    const res = await fetch(`${API_URL}/${orgId}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },

  async list(token: string, orgId: string) {
    const res = await fetch(`${API_URL}/${orgId}/subscriptions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error((await res.json()).error);
    return res.json();
  },
};
