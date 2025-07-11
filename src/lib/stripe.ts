import Stripe from 'stripe'

// Server-side Stripe ONLY (for API routes)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

// Price IDs for all plans - USING SAME NAMES AS FRONTEND
const PRICE_IDS = {
  // Monthly plans
  STARTER_MONTH: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTH,
  PRO_MONTH: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTH,
  GROWTH_MONTH: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_MONTH,
  
  // Yearly plans
  STARTER_YEAR: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEAR,
  PRO_YEAR: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEAR,
  GROWTH_YEAR: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_YEAR,

  // New Full Plans
  FULL_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_FULL_MONTHLY,
  FULL_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_FULL_YEARLY,
  LIFETIME: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME,
}

// Hard-coded price ID to plan mapping - FIXED WITH CORRECT ENV VARS
export const PRICE_ID_TO_PLAN: Record<string, 'free' | 'starter' | 'pro' | 'growth' | 'full_monthly' | 'full_yearly' | 'lifetime'> = {
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTH!]: 'starter',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEAR!]: 'starter',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTH!]: 'pro',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEAR!]: 'pro',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_MONTH!]: 'growth',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_YEAR!]: 'growth',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FULL_MONTHLY!]: 'full_monthly',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_FULL_YEARLY!]: 'full_yearly',
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME!]: 'lifetime',
}

// Get plan type from price ID - NOW USING CORRECT MAPPING
export function getPlanType(priceId: string | null | undefined): 'free' | 'starter' | 'pro' | 'growth' | 'full_monthly' | 'full_yearly' | 'lifetime' {
  if (!priceId) {
    console.warn('getPlanType: No priceId provided, returning free')
    return 'free'
  }
  
  const planType = PRICE_ID_TO_PLAN[priceId]
  if (!planType) {
    console.error('getPlanType: Unknown priceId:', priceId, 'Available:', Object.keys(PRICE_ID_TO_PLAN))
  }
  
  return planType || 'free'
}

// Get billing interval from price ID
export function getBillingInterval(priceId: string): 'month' | 'year' | 'lifetime' {
  if (priceId === PRICE_IDS.STARTER_YEAR || 
      priceId === PRICE_IDS.PRO_YEAR || 
      priceId === PRICE_IDS.GROWTH_YEAR ||
      priceId === PRICE_IDS.FULL_YEARLY) {
    return 'year'
  }
  if (priceId === PRICE_IDS.LIFETIME) {
    return 'lifetime'
  }
  return 'month'
}

export { PRICE_IDS } 