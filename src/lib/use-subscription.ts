import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { PLANS } from './plans'

export interface UserSubscription {
  id: string
  user_id: string
  subscription_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
  plan_type: 'free' | 'starter' | 'pro' | 'growth' | 'full_monthly' | 'full_yearly' | 'lifetime'
  billing_interval: 'month' | 'year' | 'lifetime' | null
  current_period_start: string | null
  current_period_end: string | null
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export function useSubscription(userId: string | undefined) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setSubscription(null)
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single()

        // Handle 404 (no subscription found) gracefully
        if (error && error.code !== 'PGRST116') {
          throw error
        }

        // Set data (can be null for free users)
        setSubscription(data || null)
        
      } catch (err) {
        console.error('Error fetching subscription:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
        setSubscription(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [userId])

  // Helper functions
  const getPlanType = (): 'free' | 'starter' | 'pro' | 'growth' | 'full_monthly' | 'full_yearly' | 'lifetime' => {
    return subscription?.plan_type ?? 'free'
  }

  const hasFeature = (feature: string): boolean => {
    try {
    const planType = getPlanType()
      
      // Safety checks to prevent crashes
      if (!PLANS || typeof PLANS !== 'object') return false
      
    const plan = PLANS[planType]
      if (!plan || !plan.features || !Array.isArray(plan.features)) return false

      // Safety check: ensure starter plan exists before checking features
      if (!PLANS.starter || !PLANS.starter.features || !Array.isArray(PLANS.starter.features)) return false

    // Pro, Growth, and Full plans have all Starter features
    if ((planType === 'pro' || planType === 'growth' || planType === 'full_monthly' || planType === 'full_yearly' || planType === 'lifetime') && 
        PLANS.starter.features.includes(feature)) {
      return true
    }
    
    // Growth and Full plans have all Pro features
      if ((planType === 'growth' || planType === 'full_monthly' || planType === 'full_yearly' || planType === 'lifetime') && 
          PLANS.pro && 
          PLANS.pro.features && 
          Array.isArray(PLANS.pro.features) && 
          PLANS.pro.features.includes(feature)) {
      return true
    }
    
    return plan.features.includes(feature)
    } catch (err) {
      console.error('Error in hasFeature:', err)
      return false
    }
  }

  const isActive = (): boolean => {
    return subscription?.status === 'active' || subscription?.status === 'trialing'
  }

  const isPremium = (): boolean => {
    const planType = getPlanType()
    return (planType !== 'free' && isActive()) || planType === 'lifetime' // Lifetime is always premium
  }

  const canAccessFeature = (feature: string): boolean => {
    return isActive() && hasFeature(feature)
  }

  return {
    subscription,
    loading,
    error,
    planType: getPlanType(),
    hasFeature,
    isActive,
    isPremium,
    canAccessFeature,
  }
} 