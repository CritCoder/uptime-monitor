import express from 'express';
import Stripe from 'stripe';
import { prisma } from '../index.js';

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Stripe webhook endpoint (requires raw body)
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.log('Stripe not configured, skipping webhook');
    return res.status(200).json({ received: true });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Received Stripe event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Handle checkout session completed
async function handleCheckoutCompleted(session) {
  const { userId, plan } = session.metadata;

  if (!userId || !plan) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Update user plan
  await prisma.user.update({
    where: { id: userId },
    data: { plan: plan }
  });

  console.log(`User ${userId} upgraded to ${plan}`);
}

// Handle subscription update
async function handleSubscriptionUpdate(stripeSubscription) {
  const customerId = stripeSubscription.customer;

  // Find user by customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId }
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Determine plan from price ID
  const priceId = stripeSubscription.items.data[0].price.id;
  const plan = priceId === process.env.STRIPE_PRICE_PRO_MONTHLY ? 'pro' : 'free';

  // Upsert subscription
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: stripeSubscription.id },
    create: {
      userId: user.id,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      stripeProductId: stripeSubscription.items.data[0].price.product,
      plan: plan,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null,
      trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
      trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null
    },
    update: {
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null
    }
  });

  // Update user plan if subscription is active
  if (stripeSubscription.status === 'active') {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: plan }
    });
  }

  console.log(`Subscription updated for user ${user.id}: ${stripeSubscription.status}`);
}

// Handle subscription deleted
async function handleSubscriptionDeleted(stripeSubscription) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: stripeSubscription.id },
    include: { user: true }
  });

  if (!subscription) {
    console.error('Subscription not found:', stripeSubscription.id);
    return;
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'canceled',
      canceledAt: new Date()
    }
  });

  // Downgrade user to free plan
  await prisma.user.update({
    where: { id: subscription.userId },
    data: { plan: 'free' }
  });

  console.log(`Subscription canceled for user ${subscription.userId}`);
}

// Handle invoice paid
async function handleInvoicePaid(stripeInvoice) {
  const customerId = stripeInvoice.customer;

  // Find user by customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId }
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Create invoice record
  await prisma.invoice.upsert({
    where: { stripeInvoiceId: stripeInvoice.id },
    create: {
      userId: user.id,
      stripeInvoiceId: stripeInvoice.id,
      amount: stripeInvoice.amount_paid,
      currency: stripeInvoice.currency,
      status: stripeInvoice.status,
      invoiceUrl: stripeInvoice.hosted_invoice_url,
      invoicePdf: stripeInvoice.invoice_pdf,
      periodStart: new Date(stripeInvoice.period_start * 1000),
      periodEnd: new Date(stripeInvoice.period_end * 1000),
      paidAt: new Date(stripeInvoice.status_transitions.paid_at * 1000)
    },
    update: {
      status: stripeInvoice.status,
      paidAt: stripeInvoice.status_transitions.paid_at ? 
        new Date(stripeInvoice.status_transitions.paid_at * 1000) : null
    }
  });

  console.log(`Invoice paid for user ${user.id}: ${stripeInvoice.id}`);
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(stripeInvoice) {
  const customerId = stripeInvoice.customer;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId }
  });

  if (!user) {
    console.error('User not found for customer:', customerId);
    return;
  }

  // Update subscription status to past_due
  await prisma.subscription.updateMany({
    where: {
      userId: user.id,
      status: 'active'
    },
    data: {
      status: 'past_due'
    }
  });

  console.log(`Payment failed for user ${user.id}`);
  // Here you could send an email notification
}

export default router;
