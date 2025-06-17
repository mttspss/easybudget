// Plan types and features - Client-safe file (no server-side dependencies)
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