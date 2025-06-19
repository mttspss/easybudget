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
  canEditCategories: boolean;
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
    canEditCategories: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    maxDashboards: 2,
    maxTransactions: 500,
    maxCsvImports: 3,
    maxGoals: Infinity,
    hasAdvancedAnalytics: true,
    canEditCategories: true,
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    maxDashboards: 8,
    maxTransactions: Infinity,
    maxCsvImports: Infinity,
    maxGoals: Infinity,
    hasAdvancedAnalytics: true,
    canEditCategories: true,
  },
  free: { // Fallback for users without a plan or issues
    id: 'free',
    name: 'Free',
    maxDashboards: 0,
    maxTransactions: 5,
    maxCsvImports: 0,
    maxGoals: 1,
    hasAdvancedAnalytics: false,
    canEditCategories: false,
  }
};

interface SubscriptionContextType {
  plan: Plan;
  status: string | null;
  isLoading: boolean;
  transactionsThisMonth: number;
  csvImportsThisMonth: number;
  goalsCount: number;
  refreshUsage: () => void;
  canCreateDashboard: (currentCount: number) => boolean;
  canAddTransaction: () => boolean;
  canImportCsv: () => boolean;
  canCreateGoal: () => boolean;
  recordCsvImport: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [plan, setPlan] = useState<Plan>(PLANS.free)
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [transactionsThisMonth, setTransactionsThisMonth] = useState(0);
  const [csvImportsThisMonth, setCsvImportsThisMonth] = useState(0);
  const [goalsCount, setGoalsCount] = useState(0);

  const fetchUsageCounts = useCallback(async () => {
    if (!user) return;

    // Fetch transaction count for the current month
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
    
    const { count: transactionCount, error: transactionError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('date', startDate);

    if (transactionError) {
      console.error('Error fetching transaction count:', transactionError.message);
    } else {
      setTransactionsThisMonth(transactionCount || 0);
    }

    // Fetch CSV import count for the current month
    const { count: csvCount, error: csvCountError } = await supabase
      .from('csv_imports')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startDate);

    if (csvCountError) {
      console.error('Error fetching CSV import count:', csvCountError.message);
    } else {
      setCsvImportsThisMonth(csvCount || 0);
    }

    // Fetch goals count
    const { count: goalsCount, error: goalsCountError } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (goalsCountError) {
      console.error('Error fetching goals count:', goalsCountError.message);
    } else {
      setGoalsCount(goalsCount || 0);
    }
  }, [user]);

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
        setPlan(PLANS.free);
        setStatus(null);
      } else if (data) {
        const userPlan = PLANS[data.plan_type] || PLANS.free;
        setPlan(userPlan);
        setStatus(data.subscription_status);
      } else {
        setPlan(PLANS.free);
        setStatus(null);
      }
      
      await fetchUsageCounts();

    } catch (error) {
      console.error('An unexpected error occurred:', error);
      setPlan(PLANS.free);
      setStatus(null);
    } finally {
      setIsLoading(false)
    }
  }, [user, fetchUsageCounts])

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

  const canImportCsv = () => {
    if (plan.maxCsvImports === Infinity) return true;
    return csvImportsThisMonth < plan.maxCsvImports;
  };

  const canCreateGoal = () => {
    if (plan.maxGoals === Infinity) return true;
    return goalsCount < plan.maxGoals;
  };

  const recordCsvImport = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('csv_imports').insert({ user_id: user.id });
      if (error) throw error;
      // Manually increment count to update UI immediately
      setCsvImportsThisMonth(prev => prev + 1);
    } catch (error) {
      console.error("Error recording CSV import:", error);
    }
  };

  const value: SubscriptionContextType = {
    plan,
    status,
    isLoading,
    transactionsThisMonth,
    csvImportsThisMonth,
    goalsCount,
    refreshUsage: fetchUsageCounts,
    canCreateDashboard,
    canAddTransaction,
    canImportCsv,
    canCreateGoal,
    recordCsvImport,
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