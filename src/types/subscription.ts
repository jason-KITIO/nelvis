export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
export type PaymentProvider = 'STRIPE' | 'PAYPAL';

export interface Subscription {
  id: string;
  organisationId: string;
  provider: PaymentProvider;
  providerId: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date | null;
  amount: number;
  currency: string;
  createdAt: Date;
}

export interface CheckoutRequest {
  provider: PaymentProvider;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
}
