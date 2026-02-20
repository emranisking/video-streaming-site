// apps/subscription-service/src/services/stripe.service.ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { IPaymentProvider, PaymentProviderResult } from '../interfaces/payment-provider.interface';


@Injectable()
export class StripeService implements IPaymentProvider {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: process.env.STRIPE_API_VERSION as any, // cast as string
});

  }

  async createPayment(amount: number, currency: string, userId: string): Promise<PaymentProviderResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      metadata: { userId },
    });

    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      status: paymentIntent.status === 'requires_payment_method' ? 'pending' : 'completed',
    };
  }
}
