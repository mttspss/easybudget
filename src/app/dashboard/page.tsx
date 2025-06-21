"use client"

import { useAuth } from "@/lib/auth-context"
import { useDashboards } from "@/lib/dashboard-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus,
  Wallet,
  CreditCard,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  BarChart3
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { XAxis, YAxis, CartesianGrid, BarChart, Bar, Area, AreaChart } from 'recharts'
import { IconRenderer } from "@/components/ui/icon-renderer"
import { getUserCurrency, formatCurrency, formatCurrencyShort, type CurrencyConfig } from "@/lib/currency"
import { useOnboarding } from "@/lib/onboarding-context"

interface DashboardStats {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  recentTransactions: any[]
  categorySpending: any[]
  monthlyTrend: any[]
  topCategories: any[]
  balanceTrend: any[]
  balanceChange: number
  incomeChange: number
  expenseChange: number
  savingsRateChange: number
}

interface QuickStat {
  title: string
  amount: number
  change: number
  changeType: 'increase' | 'decrease'
  icon: any
    color: string
}

// Chart configurations for shadcn
const balanceChartConfig = {
  balance: {
    label: "Balance",
    color: "hsl(217.2 91.2% 59.8%)", // Blue from shadcn
  },
} satisfies ChartConfig

const monthlyChartConfig = {
  income: {
    label: "Income",
    color: "hsl(142.1 76.2% 36.3%)", // Green
  },
  expenses: {
    label: "Expenses", 
    color: "hsl(346.8 77.2% 49.8%)", // Red/Pink
  },
} satisfies ChartConfig

export default function Dashboard() {
  const { user, loading } = useAuth()
  const { activeDashboard } = useDashboards()
  const { startTour } = useOnboarding()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [balancePeriod, setBalancePeriod] = useState("3months")
  const [userCurrency, setUserCurrency] = useState<CurrencyConfig | null>(null)
  const itemsPerPage = 5

  const fetchDashboardData = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      
      // Dashboard filter: null for main dashboard, specific ID for custom dashboards
      const dashboardFilter = activeDashboard?.id || null
      
      // Base query with dashboard filter
      const buildQuery = (query: any) => {
        if (dashboardFilter) {
          return query.eq('dashboard_id', dashboardFilter)
        } else {
          return query.is('dashboard_id', null)
        }
      }
      
      // Fetch user preferences to check onboarding status
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('has_completed_onboarding')
        .eq('user_id', user.id)
        .single()

      if (preferences && !preferences.has_completed_onboarding) {
        startTour()
      }
      
      // Get current month transactions
      let currentQuery = supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            color,
            type,
            icon
          )
        `)
        .eq('user_id', user.id)
        .gte('date', currentMonthStart.toISOString().split('T')[0])
        .order('date', { ascending: false })
      
      currentQuery = buildQuery(currentQuery)
      const { data: currentTransactions } = await currentQuery

      // Get last month transactions for comparison
      let lastMonthQuery = supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            color,
            type,
            icon
          )
        `)
        .eq('user_id', user.id)
        .gte('date', lastMonthStart.toISOString().split('T')[0])
        .lte('date', lastMonthEnd.toISOString().split('T')[0])
        .order('date', { ascending: false })
      
      lastMonthQuery = buildQuery(lastMonthQuery)
      const { data: lastMonthTransactions } = await lastMonthQuery

      // Get all transactions for balance calculation
      let allQuery = supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            color,
            type,
            icon
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
      
      allQuery = buildQuery(allQuery)
      const { data: allTransactions } = await allQuery

      // Calculate current month stats
      const currentIncome = (currentTransactions || [])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const currentExpenses = (currentTransactions || [])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      // Calculate last month stats for comparison
      const lastMonthIncome = (lastMonthTransactions || [])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const lastMonthExpenses = (lastMonthTransactions || [])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const totalBalance = (allTransactions || [])
        .reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0)

      const currentSavingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0
      const lastMonthSavingsRate = lastMonthIncome > 0 ? ((lastMonthIncome - lastMonthExpenses) / lastMonthIncome) * 100 : 0

      // Calculate percentage changes with proper bounds and fallbacks
      let incomeChange = 0
      if (lastMonthIncome > 0) {
        incomeChange = ((currentIncome - lastMonthIncome) / lastMonthIncome) * 100
      } else if (currentIncome > 0) {
        incomeChange = 100 // New income appeared
      }
      
      let expenseChange = 0
      if (lastMonthExpenses > 0) {
        expenseChange = ((currentExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      } else if (currentExpenses > 0) {
        expenseChange = 100 // New expenses appeared
      }
      
      // Savings rate change is already a percentage difference
      const savingsRateChange = currentSavingsRate - lastMonthSavingsRate

      // For balance change, compare current total with total from last month
      const lastMonthBalance = (allTransactions || [])
        .filter(t => new Date(t.date) <= lastMonthEnd)
        .reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0)
      
      let balanceChange = 0;
      if (lastMonthBalance !== 0) {
        balanceChange = ((totalBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100;
      } else if (totalBalance !== 0) {
        balanceChange = 100; // If starting from 0, any change is a 100% change
      }

      // Cap percentage changes to reasonable values (-200% to +200%)
      const capPercentage = (value: number) => Math.max(-200, Math.min(200, value))
      
      const boundedBalanceChange = capPercentage(balanceChange)
      const boundedIncomeChange = capPercentage(incomeChange)  
      const boundedExpenseChange = capPercentage(expenseChange)
      const boundedSavingsRateChange = capPercentage(savingsRateChange)

      // Calculate balance trend based on selected period - DAILY PROGRESSION
      const periods = {
        "1month": 30,
        "3months": 90,
        "6months": 180,
        "12months": 365,
        "alltime": 730 // 2 years max
      }
      const daysToShow = periods[balancePeriod as keyof typeof periods] || 90

      // Balance trend calculation - DAILY - STARTING FROM 0
      const balanceTrend = []
      let runningBalance = 0
      
      // Get transactions in chronological order
      const sortedTransactions = (allTransactions || [])
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // Start from the oldest date we want to show
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysToShow)

      // ALWAYS start from 0 balance, don't include pre-transactions
      // This ensures the chart shows the growth from 0
      
      // Add initial point at 0 if we have transactions
      if (sortedTransactions.length > 0) {
        balanceTrend.push({
          date: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          balance: 0
        })
      }

      // Generate daily balance points
      for (let i = daysToShow - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)
        
        // Only count transactions from startDate onwards
        const dayTransactions = sortedTransactions.filter(t => {
          const tDate = new Date(t.date)
          return tDate.getTime() >= Math.max(dayStart.getTime(), startDate.getTime()) && tDate.getTime() <= dayEnd.getTime()
        })
        
        const dailyNet = dayTransactions
          .reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0)
        
        runningBalance += dailyNet
        
        // Only add every 7th point for longer periods to avoid overcrowding
        if (daysToShow <= 30 || i % Math.ceil(daysToShow / 30) === 0) {
          balanceTrend.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            balance: runningBalance
          })
        }
      }

      // Monthly comparison (last 6 months for consistency)
      const monthlyTrend = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        
        const monthTransactions = (allTransactions || []).filter(t => {
          const tDate = new Date(t.date)
          return tDate >= monthStart && tDate <= monthEnd
        })
        
        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0)
        
        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0)
        
        monthlyTrend.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          income,
          expenses
        })
      }

      setStats({
        totalBalance,
        monthlyIncome: currentIncome,
        monthlyExpenses: currentExpenses,
        savingsRate: currentSavingsRate,
        recentTransactions: allTransactions?.slice(0, 50) || [],
        categorySpending: [],
        monthlyTrend,
        topCategories: [],
        balanceTrend,
        // Add percentage changes
        balanceChange: boundedBalanceChange,
        incomeChange: boundedIncomeChange,
        expenseChange: boundedExpenseChange,
        savingsRateChange: boundedSavingsRateChange
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError("Failed to load your dashboard. Please try again in a moment.")
    } finally {
      setIsLoading(false)
    }
  }, [user, balancePeriod, activeDashboard, startTour])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, fetchDashboardData])

  // Load user currency
  useEffect(() => {
    const loadCurrency = async () => {
      if (!user) return
      
      try {
        const currency = await getUserCurrency(user.id)
        setUserCurrency(currency)
      } catch (error) {
        console.error('Error loading currency:', error)
      }
    }

    loadCurrency()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50/50">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="bg-white p-8 rounded-lg shadow-md border border-red-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong.</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchDashboardData}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 animate-spin-slow"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    redirect("/")
  }

  const quickStats: QuickStat[] = [
    {
      title: "Total Balance",
      amount: stats?.totalBalance || 0,
      change: stats?.balanceChange || 0,
      changeType: (stats?.balanceChange || 0) >= 0 ? "increase" : "decrease",
      icon: Wallet,
      color: "text-blue-500"
    },
    {
      title: "Monthly Income",
      amount: stats?.monthlyIncome || 0,
      change: stats?.incomeChange || 0,
      changeType: (stats?.incomeChange || 0) >= 0 ? "increase" : "decrease",
      icon: DollarSign,
      color: "text-green-500"
    },
    {
      title: "Monthly Expenses",
      amount: stats?.monthlyExpenses || 0,
      change: stats?.expenseChange || 0,
      changeType: (stats?.expenseChange || 0) >= 0 ? "increase" : "decrease",
      icon: CreditCard,
      color: "text-red-500"
    },
    {
      title: "Savings Rate",
      amount: stats?.savingsRate || 0,
      change: stats?.savingsRateChange || 0,
      changeType: (stats?.savingsRateChange || 0) >= 0 ? "increase" : "decrease",
      icon: PiggyBank,
      color: "text-purple-500"
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-3">
          <div className="max-w-7xl mx-auto space-y-3">
              
            {/* Header */}
            <DashboardHeader user={user} />

            {/* Quick Stats - More Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickStats.map((stat, index) => (
                <Card key={index} className="border-gray-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <span className={stat.color}><stat.icon className="h-4 w-4" /></span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                            {stat.title === "Savings Rate" 
                              ? `${stat.amount.toFixed(1)}%` 
                              : userCurrency 
                                ? formatCurrency(stat.amount, userCurrency)
                                : `€${stat.amount.toLocaleString()}`
                            }
                    </div>
                    <p className={`text-xs ${
                        stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                      {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(1)}% from last month
                    </p>
                      </CardContent>
                    </Card>
              ))}
              </div>

            {/* Main Dashboard Grid - Restructured */}
            <div className="space-y-3">
              
              {/* Charts Section - 2 Charts Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                
                {/* Total Balance Trend - Clean Area Chart */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <CardTitle className="text-base font-semibold">Total Balance</CardTitle>
                    </div>
                    <Select value={balancePeriod} onValueChange={setBalancePeriod}>
                      <SelectTrigger className="w-28 h-7 text-xs bg-white/95 backdrop-blur-sm border-gray-200 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1month">1 Month</SelectItem>
                        <SelectItem value="3months">3 Months</SelectItem>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="12months">12 Months</SelectItem>
                        <SelectItem value="alltime">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent className="pl-2 pt-4">
                    {isLoading ? (
                        <div className="h-72 bg-gray-100 animate-pulse rounded" />
                    ) : (
                        <div className="h-72">
                        <ChartContainer config={balanceChartConfig}>
                            <AreaChart data={stats?.balanceTrend || []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(217.2 91.2% 59.8%)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(217.2 91.2% 59.8%)" stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 11, fill: '#6b7280' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: '#6b7280' }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => userCurrency ? formatCurrencyShort(value, userCurrency) : `€${(value / 1000).toFixed(0)}k`}
                              width={60}
                            />
                            <ChartTooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                      <p className="text-sm text-gray-600 mb-1">{`Date: ${label}`}</p>
                                      <p className="text-sm font-medium text-gray-900">
                                        <span className="text-blue-600">Balance:</span> {userCurrency ? formatCurrency(Number(payload[0].value), userCurrency) : `€${Number(payload[0].value).toLocaleString()}`}
                                      </p>
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="balance" 
                              stroke="hsl(217.2 91.2% 59.8%)"
                              strokeWidth={3}
                              fill="url(#balanceGradient)"
                              dot={false}
                              activeDot={{ 
                                r: 5, 
                                stroke: "hsl(217.2 91.2% 59.8%)", 
                                strokeWidth: 2, 
                                fill: 'white',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                              }}
                            />
                            </AreaChart>
                        </ChartContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Comparison - Bar Chart */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-gray-500" />
                        <CardTitle className="text-base font-semibold">Monthly Comparison</CardTitle>
                  </div>
                  </CardHeader>
                  <CardContent className="pl-2 pt-4">
                    {isLoading ? (
                      <div className="h-72 bg-gray-100 animate-pulse rounded" />
                    ) : (
                      <div className="h-72">
                        <ChartContainer config={monthlyChartConfig}>
                          <BarChart data={stats?.monthlyTrend || []} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontSize: 11, fill: '#6b7280' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: '#6b7280' }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => userCurrency ? formatCurrencyShort(value, userCurrency) : `€${(value / 1000).toFixed(0)}k`}
                              width={60}
                            />
                            <ChartTooltip 
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                      <p className="text-sm text-gray-600 mb-2">{`Month: ${label}`}</p>
                                      {payload.map((entry, index) => (
                                        <p key={index} className="text-sm font-medium text-gray-900 mb-1">
                                          <span className={entry.dataKey === 'income' ? 'text-green-600' : 'text-red-600'}>
                                            {entry.dataKey === 'income' ? 'Income:' : 'Expenses:'}
                                          </span> {userCurrency ? formatCurrency(Number(entry.value), userCurrency) : `€${Number(entry.value).toLocaleString()}`}
                                        </p>
                                      ))}
                                    </div>
                                  )
                                }
                                return null
                              }}
                            />
                            <defs>
                              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0.6}/>
                              </linearGradient>
                              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(346.8 77.2% 49.8%)" stopOpacity={0.9}/>
                                <stop offset="95%" stopColor="hsl(346.8 77.2% 49.8%)" stopOpacity={0.6}/>
                              </linearGradient>
                            </defs>
                            <Bar dataKey="income" fill="url(#incomeGradient)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" fill="url(#expenseGradient)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions Full Width */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-1 px-4 pt-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Recent Transactions
                    <span className="mx-1 text-gray-400">•</span>
                    <span className="text-xs font-normal text-gray-500">
                      {stats?.recentTransactions?.length || 0} total
                    </span>
                  </CardTitle>
                  <p className="text-xs text-gray-600">Your latest financial activities</p>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-4 space-y-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                    <>
                      {/* Table Header */}
                      <div className="px-6 py-2 border-b border-gray-200/60 bg-gray-50/30">
                        <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                          <div className="col-span-4">Description</div>
                          <div className="col-span-2 border-l border-gray-200/40 pl-3">Date</div>
                          <div className="col-span-2 border-l border-gray-200/40 pl-3">Type</div>
                          <div className="col-span-2 border-l border-gray-200/40 pl-3">Category</div>
                          <div className="col-span-2 border-l border-gray-200/40 pl-3">Amount</div>
                        </div>
                      </div>

                      {/* Table Body */}
                      <div className="divide-y divide-gray-100/60">
                        {stats.recentTransactions
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((transaction, index) => (
                            <div key={index} className="px-6 py-2.5 hover:bg-gray-50/50 transition-colors border-l-4 border-transparent hover:border-l-blue-200">
                              <div className="grid grid-cols-12 gap-3 items-center">
                                {/* Description with Icon */}
                                <div className="col-span-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shadow-sm" 
                                         style={{ backgroundColor: transaction.categories?.color }}>
                                      <IconRenderer 
                                        iconName={transaction.icon || transaction.categories?.icon} 
                                        className="h-3 w-3 text-white"
                                        fallbackColor="white"
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 truncate">
                                      {transaction.description}
                                    </span>
                                  </div>
                                </div>

                                {/* Date */}
                                <div className="col-span-2 border-l border-gray-200/40 pl-3">
                                  <span className="text-xs text-gray-600">
                                    {new Date(transaction.date).toLocaleDateString()}
                                  </span>
                                </div>

                                {/* Type */}
                                <div className="col-span-2 border-l border-gray-200/40 pl-3">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                    transaction.type === 'income' ? 'bg-emerald-50 text-[#53E489] border border-emerald-100' : 'bg-pink-50 text-[#EF0465] border border-pink-100'
                                  }`}>
                                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                                  </span>
                                </div>

                                {/* Category */}
                                <div className="col-span-2 border-l border-gray-200/40 pl-3">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: transaction.categories?.color }} />
                                    <span className="text-xs text-gray-600 truncate">
                                      {transaction.categories?.name}
                                    </span>
                                  </div>
                                </div>

                                {/* Amount */}
                                <div className="col-span-2 border-l border-gray-200/40 pl-3">
                                  <span className={`text-sm font-medium ${
                                    transaction.type === 'income' ? 'text-[#53E489]' : 'text-[#EF0465]'
                                  }`}>
                                    {transaction.type === 'income' ? '+' : '-'}{userCurrency ? formatCurrency(Number(transaction.amount), userCurrency).replace(/^[+\-]/, '') : `€${Number(transaction.amount).toFixed(2)}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Pagination - Always visible */}
                      <div className="border-t border-gray-200/60 px-6 py-2 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-600">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, stats.recentTransactions.length)} of {stats.recentTransactions.length} results
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="h-7 px-2"
                            >
                              <ChevronLeft className="h-3 w-3" />
                              Previous
                            </Button>
                            
                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(Math.ceil(stats.recentTransactions.length / itemsPerPage), 5) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className="h-7 w-7 text-xs"
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                              {Math.ceil(stats.recentTransactions.length / itemsPerPage) > 5 && (
                                <span className="text-xs text-gray-600 px-1">...</span>
                              )}
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage >= Math.ceil(stats.recentTransactions.length / itemsPerPage)}
                              className="h-7 px-2"
                            >
                              Next
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No recent activity</h3>
                      <p className="text-xs text-gray-500 mb-3">Start tracking your finances by adding transactions</p>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Transaction
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 