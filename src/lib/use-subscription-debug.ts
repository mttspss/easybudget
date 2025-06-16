import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export interface UserSubscription {
  id: string
  user_id: string
  subscription_id: string | null
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing'
  plan_type: 'free' | 'starter' | 'pro' | 'growth'
  billing_interval: 'month' | 'year' | null
  current_period_start: string | null
  current_period_end: string | null
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export function useSubscriptionDebug(userId: string | undefined) {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔍 useSubscriptionDebug - useEffect triggered, userId:', userId)
    
    if (!userId) {
      console.log('🔍 No userId, setting null')
      setSubscription(null)
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        console.log('🔍 Starting fetchSubscription for userId:', userId)
        setLoading(true)
        
        // SOLO SELECT - niente INSERT per ora
        console.log('🔍 Attempting SELECT...')
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single()

        console.log('🔍 SELECT result - data:', data, 'error:', error)

        if (error && error.code !== 'PGRST116') { 
          console.error('🔍 SELECT error (not PGRST116):', error)
          throw error
        }

        if (data) {
          console.log('🔍 Found existing subscription:', data)
          setSubscription(data)
        } else {
          console.log('🔍 No subscription found - setting null (no auto-create)')
          setSubscription(null)
        }
        
        console.log('🔍 fetchSubscription completed successfully')
      } catch (err) {
        console.error('🔍 Error in fetchSubscription:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
      } finally {
        console.log('🔍 Setting loading to false')
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [userId])

  return {
    subscription,
    loading,
    error
  }
} 