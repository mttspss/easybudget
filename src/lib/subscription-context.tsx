"use client"

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'
import { useAuth } from './auth-context'

// Define the structure of a user's subscription plan
export interface Plan {
  id: 'starter' | 'pro' | 'growth' | 'free'; // 'free' as a fallback
  name: string;
  maxDashboards: number;
  maxTransactions: number;
  maxCsvImports: number;
  maxGoals: number;
  hasAdvancedAnalytics: boolean;
}

// Define all available plans
const PLANS: Record<string, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    maxDashboards: 0, // Cannot create new ones, only use main
    maxTransactions: 100,
    maxCsvImports: 1,
    maxGoals: 5,
    hasAdvancedAnalytics: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    maxDashboards: 2,
    maxTransactions: 500,
    maxCsvImports: 3,
    maxGoals: Infinity,
    hasAdvancedAnalytics: true,
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    maxDashboards: 8,
    maxTransactions: Infinity,
    maxCsvImports: Infinity,
    maxGoals: Infinity,
    hasAdvancedAnalytics: true,
  },
  free: { // Fallback for users without a plan or issues
    id: 'free',
    name: 'Free',
    maxDashboards: 0,
    maxTransactions: 100,
    maxCsvImports: 1,
    maxGoals: 5,
    hasAdvancedAnalytics: false,
  }
};

interface SubscriptionContextType {
  plan: Plan;
  status: string | null;
  isLoading: boolean;
  transactionsThisMonth: number;
  canCreateDashboard: (currentCount: number) => boolean;
  canAddTransaction: () => boolean;
  // Add other permission checks here later
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [plan, setPlan] = useState<Plan>(PLANS.free)
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [transactionsThisMonth, setTransactionsThisMonth] = useState(0);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setIsLoading(false)
      return;
    }

    setIsLoading(true);
    try {
      // Use the new user_details view
      const { data, error } = await supabase
        .from('user_details')
        .select('subscription_status, plan_type')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription details:', error.message);
        // Fallback to free plan if user details not found or error
        setPlan(PLANS.free);
        setStatus(null);
        return;
      }
      
      if (data) {
        const userPlan = PLANS[data.plan_type] || PLANS.free;
        setPlan(userPlan);
        setStatus(data.subscription_status);
      } else {
        setPlan(PLANS.free);
        setStatus(null);
      }
      
      // Also fetch transaction count for the current month
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      
      const { count, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('date', startDate);

      if (countError) {
        console.error('Error fetching transaction count:', countError.message);
      } else {
        setTransactionsThisMonth(count || 0);
      }

    } catch (error) {
      console.error('An unexpected error occurred:', error);
      setPlan(PLANS.free);
      setStatus(null);
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  // Permission check functions
  const canCreateDashboard = (currentCount: number) => {
    if (plan.maxDashboards === Infinity) return true;
    return currentCount < plan.maxDashboards;
  };
  
  const canAddTransaction = () => {
    if (plan.maxTransactions === Infinity) return true;
    return transactionsThisMonth < plan.maxTransactions;
  };

  const value: SubscriptionContextType = {
    plan,
    status,
    isLoading,
    transactionsThisMonth,
    canCreateDashboard,
    canAddTransaction,
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
} 