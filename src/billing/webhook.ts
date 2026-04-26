import type { Context } from 'hono';
import { stripe } from './checkout.js';
import { db } from '../db/init.js';
import { randomUUID } from 'crypto';
import 'dotenv/config';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function handleStripeWebhook(c: Context) {
  const sig = c.req.header('stripe-signature');
  if (!sig) return c.text('missing signature', 400);

  const body = await c.req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook verification failed:', err.message);
    return c.text(`Webhook error: ${err.message}`, 400);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const email = session.customer_email ?? session.metadata?.email;
      const plan = session.metadata?.plan ?? 'starter';

      const id = randomUUID();
      db.prepare(
        `INSERT INTO customers (id, email, stripe_customer_id, stripe_subscription_id, plan, active)
         VALUES (?, ?, ?, ?, ?, 1)
         ON CONFLICT(email) DO UPDATE SET
           stripe_customer_id = excluded.stripe_customer_id,
           stripe_subscription_id = excluded.stripe_subscription_id,
           plan = excluded.plan,
           active = 1`
      ).run(id, email, session.customer, session.subscription, plan);

      console.log(`✓ Activated customer ${email} on ${plan}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as any;
      db.prepare(`UPDATE customers SET active = 0 WHERE stripe_subscription_id = ?`).run(sub.id);
      break;
    }
  }

  return c.json({ received: true });
}
