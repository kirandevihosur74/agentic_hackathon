import Stripe from 'stripe';
import 'dotenv/config';

let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia' as any,
    });
  }
  return _stripe;
}
export const stripe = new Proxy({} as Stripe, {
  get: (_, prop) => (getStripe() as any)[prop],
});

export type Plan = 'starter' | 'pro';

const PRICE_IDS: Record<Plan, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  pro: process.env.STRIPE_PRICE_PRO!,
};

export async function createCheckout(email: string, plan: Plan) {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
    success_url: `${appUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/?canceled=1`,
    subscription_data: {
      trial_period_days: 7,
      metadata: { plan },
    },
    metadata: { plan, email },
  });

  return session;
}
