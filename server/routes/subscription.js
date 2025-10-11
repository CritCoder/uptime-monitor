import express from 'express';
import Stripe from 'stripe';
import { prisma } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';
import { PRICING_PLANS } from '../config/pricing.js';

const router = express.Router();

// Initialize Stripe (will work when keys are added)
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Get current user's subscription
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    const subscription = user.subscriptions[0] || null;
    const plan = PRICING_PLANS[user.plan] || PRICING_PLANS.free;

    res.json({
      subscription,
      plan: {
        ...plan,
        current: user.plan
      }
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Get pricing plans
router.get('/plans', async (req, res) => {
  try {
    res.json({
      plans: Object.values(PRICING_PLANS).map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        interval: plan.interval,
        features: plan.features
      }))
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Create checkout session for upgrade
router.post('/create-checkout', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || plan === 'free') {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment system not configured. Please add Stripe keys to enable subscriptions.',
        demo: true 
      });
    }

    const planConfig = PRICING_PLANS[plan];
    if (!planConfig) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id
        }
      });
      customerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.stripePriceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.CLIENT_URL}/settings/subscription?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/settings/subscription?canceled=true`,
      metadata: {
        userId: user.id,
        plan: plan
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create portal session for managing subscription
router.post('/create-portal', authenticateToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment system not configured',
        demo: true 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/settings/subscription`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Create portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment system not configured',
        demo: true 
      });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.id,
        status: 'active'
      }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date()
      }
    });

    res.json({ message: 'Subscription will be canceled at period end' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Get invoices
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

export default router;

