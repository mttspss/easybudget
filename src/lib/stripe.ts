import Stripe from 'stripe'

// Server-side Stripe ONLY (for API routes)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

// Price IDs for all plans
const PRICE_IDS = {
  // Monthly plans
  STARTER_MONTH: process.env.STRIPE_PRICE_STARTER_MONTH,
  PRO_MONTH: process.env.STRIPE_PRICE_PRO_MONTH,
  GROWTH_MONTH: process.env.STRIPE_PRICE_GROWTH_MONTH,
  
  // Yearly plans
  STARTER_YEAR: process.env.STRIPE_PRICE_STARTER_YEAR,
  PRO_YEAR: process.env.STRIPE_PRICE_PRO_YEAR,
  GROWTH_YEAR: process.env.STRIPE_PRICE_GROWTH_YEAR,
}

// Hard-coded price ID to plan mapping - fixes "always free" bug
export const PRICE_ID_TO_PLAN: Record<string, 'free' | 'starter' | 'pro' | 'growth'> = {
  [process.env.STRIPE_PRICE_STARTER_MONTH!]: 'starter',
  [process.env.STRIPE_PRICE_STARTER_YEAR!]: 'starter',
  [process.env.STRIPE_PRICE_PRO_MONTH!]: 'pro',
  [process.env.STRIPE_PRICE_PRO_YEAR!]: 'pro',
  [process.env.STRIPE_PRICE_GROWTH_MONTH!]: 'growth',
  [process.env.STRIPE_PRICE_GROWTH_YEAR!]: 'growth',
}

// Plan types and features
export const PLANS = {
  free: {
    name: 'Free',
    maxAccounts: 2,
    features: ['Basic transaction tracking', 'Simple categorization', 'Monthly reports']
  },
  starter: {
    name: 'Starter',
    maxAccounts: 10,
    features: [
      'Up to 10 connected accounts',
      'Advanced transaction categorization',
      'Monthly financial reports',
      'Goal tracking and forecasting',
      'Email support'
    ]
  },
  pro: {
    name: 'Pro',
    maxAccounts: -1, // unlimited
    features: [
      'Unlimited account connections',
      'Multi-user access (up to 5 users)',
      'Advanced analytics and reporting',
      'API access for integrations',
      'Priority support',
      'Custom categorization rules'
    ]
  },
  growth: {
    name: 'Growth',
    maxAccounts: -1, // unlimited
    features: [
      'Everything in Pro',
      'Unlimited users',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'On-premise deployment options',
      'Advanced security features'
    ]
  }
}

// Get plan type from price ID - NEW RELIABLE METHOD
export function getPlanType(priceId: string | null | undefined): 'free' | 'starter' | 'pro' | 'growth' {
  if (!priceId) return 'free'
  return PRICE_ID_TO_PLAN[priceId] || 'free'
}

// Get billing interval from price ID
export function getBillingInterval(priceId: string): 'month' | 'year' {
  if (priceId === PRICE_IDS.STARTER_YEAR || 
      priceId === PRICE_IDS.PRO_YEAR || 
      priceId === PRICE_IDS.GROWTH_YEAR) {
    return 'year'
  }
  return 'month'
}

// Check if user has access to features based on plan
export function hasFeatureAccess(planType: keyof typeof PLANS, feature: string): boolean {
  const plan = PLANS[planType]
  if (!plan) return false
  
  // Pro and Growth have all Starter features
  if ((planType === 'pro' || planType === 'growth') && 
      PLANS.starter.features.includes(feature)) {
    return true
  }
  
  // Growth has all Pro features
  if (planType === 'growth' && PLANS.pro.features.includes(feature)) {
    return true
  }
  
  return plan.features.includes(feature)
}

export { PRICE_IDS } 