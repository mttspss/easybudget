"use client"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus,
  BarChart3,
  Wallet,
  CreditCard,
  PiggyBank,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  TrendingUp
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { IconRenderer } from "@/components/ui/icon-renderer"
import { getUserCurrency, formatCurrency, formatCurrencyShort, type CurrencyConfig } from "@/lib/currency"

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

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [balancePeriod, setBalancePeriod] = useState("3months")
  const [userCurrency, setUserCurrency] = useState<CurrencyConfig | null>(null)
  const itemsPerPage = 5

  const fetchDashboardData = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      
      // Get current month transactions
      const { data: currentTransactions } = await supabase
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

      // Get last month transactions for comparison
      const { data: lastMonthTransactions } = await supabase
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

      // Get all transactions for balance calculation
      const { data: allTransactions } = await supabase
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
      
      let balanceChange = 0
      if (Math.abs(lastMonthBalance) > 0) {
        balanceChange = ((totalBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100
      } else if (totalBalance !== 0) {
        balanceChange = totalBalance > 0 ? 100 : -100
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
    } finally {
      setIsLoading(false)
    }
  }, [user, balancePeriod])

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
      color: "bg-blue-500"
    },
    {
      title: "Monthly Income",
      amount: stats?.monthlyIncome || 0,
      change: stats?.incomeChange || 0,
      changeType: (stats?.incomeChange || 0) >= 0 ? "increase" : "decrease",
      icon: DollarSign,
      color: "bg-green-500"
    },
    {
      title: "Monthly Expenses",
      amount: stats?.monthlyExpenses || 0,
      change: stats?.expenseChange || 0,
      changeType: (stats?.expenseChange || 0) >= 0 ? "increase" : "decrease",
      icon: CreditCard,
      color: "bg-orange-500"
    },
    {
      title: "Savings Rate",
      amount: stats?.savingsRate || 0,
      change: stats?.savingsRateChange || 0,
      changeType: (stats?.savingsRateChange || 0) >= 0 ? "increase" : "decrease",
      icon: PiggyBank,
      color: "bg-purple-500"
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-3">
          <div className="max-w-7xl mx-auto space-y-3">
              
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                  Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}! 👋
                  </h1>
                <p className="text-gray-600 text-xs">
                  Here&apos;s your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Transaction
                  </Button>
                </div>
              </div>

            {/* Quick Stats - More Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickStats.map((stat, index) => (
                <Card key={index} className="relative overflow-hidden border-0 shadow-sm">
                  {/* Subtle gradient overlay based on icon color */}
                  <div className="absolute inset-0 opacity-5">
                    {stat.title === "Total Balance" && <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600"></div>}
                    {stat.title === "Monthly Income" && <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600"></div>}
                    {stat.title === "Monthly Expenses" && <div className="w-full h-full bg-gradient-to-br from-pink-500 to-pink-600"></div>}
                    {stat.title === "Savings Rate" && <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-600"></div>}
                  </div>
                  <CardContent className="p-4 relative">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-1">{stat.title}</p>
                        <div className="flex flex-col gap-1">
                          <span className="text-2xl font-bold text-gray-900">
                            {stat.title === "Savings Rate" 
                              ? `${stat.amount.toFixed(1)}%` 
                              : userCurrency 
                                ? formatCurrency(stat.amount, userCurrency)
                                : `€${stat.amount.toLocaleString()}`
                            }
                          </span>
                          <div className={`flex items-center text-xs font-medium ${
                              stat.changeType === 'increase' 
                                ? 'text-[#53E489]' 
                                : 'text-[#EF0465]'
                            }`}>
                            <span className="mr-1">{stat.changeType === 'increase' ? '↗' : '↘'}</span>
                            {Math.abs(stat.change).toFixed(1)}% from last month
                          </div>
                        </div>
                            </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center ml-3">
                        {stat.title === "Total Balance" && <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"><Wallet className="h-6 w-6 text-white" /></div>}
                        {stat.title === "Monthly Income" && <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center"><DollarSign className="h-6 w-6 text-white" /></div>}
                        {stat.title === "Monthly Expenses" && <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center"><CreditCard className="h-6 w-6 text-white" /></div>}
                        {stat.title === "Savings Rate" && <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center"><PiggyBank className="h-6 w-6 text-white" /></div>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
              ))}
              </div>

            {/* Main Dashboard Grid - Restructured */}
            <div className="space-y-3">
              
              {/* Charts Section - 2 Charts Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                
                {/* Total Balance Trend - Clean Area Chart */}
                <Card className="relative overflow-hidden">
                  {/* Simple Overlay Header */}
                  <div className="absolute top-3 left-4 right-4 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Total Balance</span>
                    </div>
                    <Select value={balancePeriod} onValueChange={setBalancePeriod}>
                      <SelectTrigger className="w-32 h-8 text-sm bg-white/90 backdrop-blur-sm border-gray-200 shadow-sm">
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
                  </div>
                  
                  <CardContent className="p-0 m-0">
                    {isLoading ? (
                        <div className="h-80 bg-gray-100 animate-pulse" />
                    ) : (
                        <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.balanceTrend || []} margin={{ top: 50, right: 40, left: 20, bottom: 20 }}>
                            <defs>
                              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12, fill: '#64748b' }}
                              axisLine={false}
                              tickLine={false}
                              domain={['dataMin', 'dataMax']}
                            />
                            <YAxis 
                              tick={{ fontSize: 12, fill: '#64748b' }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => userCurrency ? formatCurrencyShort(value, userCurrency) : `€${(value / 1000).toFixed(0)}k`}
                              domain={['dataMin - 1000', 'dataMax + 1000']}
                            />
                            <Tooltip 
                              formatter={(value: any) => [
                                userCurrency ? formatCurrency(Number(value), userCurrency) : `€${Number(value).toLocaleString()}`, 
                                'Balance'
                              ]}
                              labelStyle={{ color: '#374151', fontWeight: 'normal' }}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                fontSize: '12px'
                              }}
                            />
                            <Area 
                              type="linear" 
                              dataKey="balance" 
                              stroke="#3b82f6"
                              strokeWidth={2}
                              fill="url(#balanceGradient)"
                              dot={false}
                              activeDot={{ 
                                r: 4, 
                                stroke: '#3b82f6', 
                                strokeWidth: 2, 
                                fill: 'white' 
                              }}
                            />
                            </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Comparison - Bar Chart */}
                <Card className="relative overflow-hidden">
                  {/* Simple Overlay Header */}
                  <div className="absolute top-3 left-4 right-4 z-10 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium text-gray-900">Monthly Comparison</span>
                  </div>
                  
                  <CardContent className="p-0 m-0">
                    {isLoading ? (
                      <div className="h-80 bg-gray-100 animate-pulse" />
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats?.monthlyTrend || []} margin={{ top: 50, right: 40, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontSize: 12, fill: '#64748b' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 12, fill: '#64748b' }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => userCurrency ? formatCurrencyShort(value, userCurrency) : `€${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip 
                              formatter={(value: any, name: string) => [
                                userCurrency ? formatCurrency(Number(value), userCurrency) : `€${Number(value).toLocaleString()}`, 
                                name === 'income' ? 'Income' : 'Expenses'
                              ]}
                              labelStyle={{ color: '#374151', fontWeight: 'normal' }}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                fontSize: '12px'
                              }}
                            />
                            <defs>
                              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#53E489" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#53E489" stopOpacity={0.3}/>
                              </linearGradient>
                              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF0465" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#EF0465" stopOpacity={0.3}/>
                              </linearGradient>
                            </defs>
                            <Bar dataKey="income" fill="url(#incomeGradient)" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="expenses" fill="url(#expenseGradient)" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
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