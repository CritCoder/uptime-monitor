# Subscription System Implementation

## Overview
Comprehensive subscription system with Stripe integration offering 5x better value than competitors.

## Pricing Plans

### Competitive Analysis
- **Industry Standard**: $10-75/month for 50-100 monitors with 1-5 minute intervals
- **Our Pricing**: **5x Better Value**

### Free Plan
- **Price**: $0/month
- **Monitors**: 5 monitors
- **Check Interval**: 1 hour (minimum)
- **Alerts**: 100/month
- **Status Pages**: 1
- **Team Members**: 1
- **Data Retention**: 30 days

### Pro Plan  
- **Price**: $9/month
- **Monitors**: Unlimited
- **Check Interval**: 1 minute (minimum)
- **Alerts**: Unlimited
- **Status Pages**: Unlimited
- **Team Members**: 10
- **Data Retention**: 365 days
- **Features**: Multi-region monitoring, SSL monitoring, Custom domains, API access, Priority support, Advanced analytics, Webhooks

## Technical Implementation

### Database Models
- `Subscription`: Tracks user subscriptions with Stripe
- `Invoice`: Stores billing history
- User model extended with `stripeCustomerId` and `plan` fields

### Backend Routes

#### `/api/subscription`
- `GET /current` - Get user's current subscription
- `GET /plans` - Get available pricing plans
- `POST /create-checkout` - Create Stripe checkout session
- `POST /create-portal` - Create Stripe customer portal session
- `POST /cancel` - Cancel subscription (at period end)
- `GET /invoices` - Get user's invoice history

#### `/webhooks/stripe`
- Handles all Stripe webhook events
- `checkout.session.completed` - Upgrades user plan
- `customer.subscription.created/updated` - Syncs subscription status
- `customer.subscription.deleted` - Downgrades to free plan
- `invoice.paid` - Creates invoice record
- `invoice.payment_failed` - Marks subscription as past_due

### Plan Enforcement

#### Monitor Creation Limits
```javascript
// Free plan: Max 5 monitors
// Pro plan: Unlimited monitors
if (!canCreateMonitor(user.plan, currentMonitorCount)) {
  return error with upgradeRequired flag
}
```

#### Check Interval Validation
```javascript
// Free plan: Minimum 1 hour (3600 seconds)
// Pro plan: Minimum 1 minute (60 seconds)
if (!isValidCheckInterval(user.plan, interval)) {
  return error with minimum interval and upgradeRequired flag
}
```

### Email Verification Enforcement
- Users MUST verify email before accessing dashboard
- Authentication middleware checks `isEmailVerified`
- Returns `EMAIL_NOT_VERIFIED` error code
- Frontend redirects to verification page

## Environment Variables Required

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRODUCT_PRO=prod_...

# Existing
JWT_SECRET=...
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=... (for AI incident summaries)
```

## Frontend Integration

### Features to Implement
1. ✅ Email verification enforcement
2. ✅ Subscription system backend
3. ✅ Plan limit checks in monitor creation
4. 🔄 Subscription management UI (Settings page)
5. 🔄 Upgrade prompts with crown icons
6. 🔄 Invoice history page
7. 🔄 Billing portal integration
8. 🔄 Plan comparison on pricing page
9. 🔄 Monitor creation with interval restrictions UI
10. 🔄 Automated tests for subscription flows

### Upgrade Prompts
Show upgrade prompts when:
- Monitor limit reached (Free plan: 5 monitors)
- Trying to set check interval < 1 hour on Free plan
- Accessing Pro features

Display with:
- Crown icon
- Clear message about limits
- "Upgrade to Pro" button
- Pricing information ($9/month)

## Testing Requirements

### Manual Testing Checklist
- [ ] User registration with email verification
- [ ] Login blocks until email verified
- [ ] Free plan limited to 5 monitors
- [ ] Free plan limited to 1-hour intervals
- [ ] Stripe checkout creates subscription
- [ ] Webhook updates subscription status
- [ ] Pro plan allows unlimited monitors
- [ ] Pro plan allows 1-minute intervals
- [ ] Subscription cancellation works
- [ ] Billing portal accessible
- [ ] Invoice generation
- [ ] Downgrade after cancellation

### Automated Tests (to be added in /testing folder)
- Authentication with email verification
- Monitor creation with plan limits
- Subscription upgrade flow
- Webhook event handling
- Plan downgrade scenarios

## Deployment Checklist
- [ ] Add Stripe keys to server environment
- [ ] Configure Stripe webhook endpoint
- [ ] Create Stripe products and prices
- [ ] Update environment variables
- [ ] Test webhook delivery
- [ ] Verify email service configured
- [ ] Run automated test suite
- [ ] Deploy to production
- [ ] Monitor Stripe dashboard
- [ ] Test live payment flow

## Notes
- Stripe keys NOT committed to Git (security)
- Demo mode when Stripe not configured
- Webhook endpoint must handle raw body
- Email verification required for all users
- Plan checks enforced at API level
- Frontend shows appropriate upgrade prompts

