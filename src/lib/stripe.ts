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

// Get plan type from price ID - NEW RELIABLE METHOD
export function getPlanType(priceId: string | null | undefined): 'free' | 'starter' | 'pro' | 'growth' {
  if (!priceId) {
    return 'free'
  }
  
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

export { PRICE_IDS } 