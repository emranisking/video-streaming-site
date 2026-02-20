// subscription/interfaces/payment-provider.interface.ts
export interface IPaymentProvider {
  createPayment(amount: number, currency: string, userId: string): Promise<PaymentProviderResult>;
}

export interface PaymentProviderResult {
  id: string;
  clientSecret?: string;
  status: 'pending' | 'completed' | 'failed';
}
