import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { PLANS } from './stripe'

export interface UserSubscription {
  id: string
  user_id: string
  subscription_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
  plan_type: keyof typeof PLANS
  billing_interval: 'month' | 'year' | null
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
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          throw error
        }

        if (data) {
          setSubscription(data)
        } else {
          // Create default free subscription
          const defaultSubscription = {
            user_id: userId,
            subscription_id: null,
            status: 'active' as const,
            plan_type: 'free' as const,
            billing_interval: null,
            current_period_start: null,
            current_period_end: null,
            canceled_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          const { data: newData, error: insertError } = await supabase
            .from('user_subscriptions')
            .insert(defaultSubscription)
            .select()
            .single()

          if (insertError) {
            throw insertError
          }

          setSubscription(newData)
        }
      } catch (err) {
        console.error('Error fetching subscription:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [userId])

  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false
    
    const plan = PLANS[subscription.plan_type]
    if (!plan) return false

    // Pro and Growth have all Starter features
    if ((subscription.plan_type === 'pro' || subscription.plan_type === 'growth') && 
        PLANS.starter.features.includes(feature)) {
      return true
    }
    
    // Growth has all Pro features
    if (subscription.plan_type === 'growth' && PLANS.pro.features.includes(feature)) {
      return true
    }
    
    return plan.features.includes(feature)
  }

  const isActive = (): boolean => {
    return subscription?.status === 'active' || subscription?.status === 'trialing'
  }

  const isPremium = (): boolean => {
    return subscription?.plan_type !== 'free' && isActive()
  }

  const canAccessFeature = (feature: string): boolean => {
    return isActive() && hasFeature(feature)
  }

  return {
    subscription,
    loading,
    error,
    hasFeature,
    isActive,
    isPremium,
    canAccessFeature,
    refetch: () => {
      if (userId) {
        setLoading(true)
        // Re-trigger the effect
        const fetchSubscription = async () => {
          try {
            const { data, error } = await supabase
              .from('user_subscriptions')
              .select('*')
              .eq('user_id', userId)
              .single()

            if (error && error.code !== 'PGRST116') {
              throw error
            }

            setSubscription(data || null)
          } catch (err) {
            console.error('Error refetching subscription:', err)
            setError(err instanceof Error ? err.message : 'Failed to refetch subscription')
          } finally {
            setLoading(false)
          }
        }
        fetchSubscription()
      }
    }
  }
} 