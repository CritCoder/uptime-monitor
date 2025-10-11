// Pricing Configuration
// Research shows competitors charge $10-75/month for 50-100 monitors with 1-5min intervals
// Our pricing: 5x better value

export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    features: {
      monitors: 5,
      checkInterval: 3600, // 1 hour in seconds
      alertsPerMonth: 100,
      statusPages: 1,
      teamMembers: 1,
      dataRetention: 30, // days
      multiRegion: false,
      sslMonitoring: false,
      customDomains: false,
      apiAccess: false,
      prioritySupport: false
    },
    limits: {
      minCheckInterval: 3600, // 1 hour
      maxMonitors: 5,
      maxStatusPages: 1
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 9, // $9/month - 5x better than competitors ($45-75 for similar features)
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY, // To be configured
    stripeProductId: process.env.STRIPE_PRODUCT_PRO,
    features: {
      monitors: 'Unlimited',
      checkInterval: 60, // 1 minute
      alertsPerMonth: 'Unlimited',
      statusPages: 'Unlimited',
      teamMembers: 10,
      dataRetention: 365, // days
      multiRegion: true,
      sslMonitoring: true,
      customDomains: true,
      apiAccess: true,
      prioritySupport: true,
      advancedAnalytics: true,
      incidentManagement: true,
      webhooks: true
    },
    limits: {
      minCheckInterval: 60, // 1 minute
      maxMonitors: -1, // unlimited
      maxStatusPages: -1 // unlimited
    }
  }
};

// Feature comparison helper
export const canUseFeature = (userPlan, feature) => {
  const plan = PRICING_PLANS[userPlan] || PRICING_PLANS.free;
  return plan.features[feature] !== false && plan.features[feature] !== 0;
};

// Check if user can create more monitors
export const canCreateMonitor = (userPlan, currentMonitorCount) => {
  const plan = PRICING_PLANS[userPlan] || PRICING_PLANS.free;
  if (plan.limits.maxMonitors === -1) return true; // unlimited
  return currentMonitorCount < plan.limits.maxMonitors;
};

// Get minimum allowed check interval for plan
export const getMinCheckInterval = (userPlan) => {
  const plan = PRICING_PLANS[userPlan] || PRICING_PLANS.free;
  return plan.limits.minCheckInterval;
};

// Validate check interval for plan
export const isValidCheckInterval = (userPlan, interval) => {
  const minInterval = getMinCheckInterval(userPlan);
  return interval >= minInterval;
};

