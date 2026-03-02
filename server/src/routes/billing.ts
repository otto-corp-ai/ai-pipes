import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../lib/auth';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia' as any,
});

const PLANS: Record<string, { name: string; price: number; priceId: string; limits: Record<string, number> }> = {
  free: { name: 'Free', price: 0, priceId: '', limits: { workflows: 3, runs: 50 } },
  starter: { name: 'Starter', price: 2900, priceId: process.env.STRIPE_STARTER_PRICE_ID || '', limits: { workflows: 15, runs: 500 } },
  pro: { name: 'Pro', price: 4900, priceId: process.env.STRIPE_PRO_PRICE_ID || '', limits: { workflows: 50, runs: 2000 } },
  business: { name: 'Business', price: 7900, priceId: process.env.STRIPE_BUSINESS_PRICE_ID || '', limits: { workflows: 999999, runs: 10000 } },
};

router.get('/plans', (_req: Request, res: Response) => {
  res.json(Object.entries(PLANS).map(([id, plan]) => ({
    id, name: plan.name, price: plan.price, limits: plan.limits,
  })));
});

router.post('/checkout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];
    if (!plan || !plan.priceId) {
      res.status(400).json({ error: 'Invalid plan' });
      return;
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId)).limit(1);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
      customerId = customer.id;
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
    }
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?billing=success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/settings?billing=cancelled`,
      metadata: { userId: user.id, planId },
    });
    
    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch {
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    if (userId && planId) {
      await db.update(users).set({
        tier: planId,
        stripeSubscriptionId: session.subscription as string,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));
    }
  }
  
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    await db.update(users).set({ tier: 'free', stripeSubscriptionId: null, updatedAt: new Date() })
      .where(eq(users.stripeCustomerId, customerId));
  }
  
  res.json({ received: true });
});

router.post('/portal', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId)).limit(1);
    if (!user?.stripeCustomerId) { res.status(400).json({ error: 'No billing account' }); return; }
    
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/settings`,
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

export default router;
