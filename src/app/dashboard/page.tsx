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
import { Badge } from "@/components/ui/badge"
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
  const itemsPerPage = 5

  const fetchDashboardData = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      
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

      // Calculate stats
      const currentIncome = (currentTransactions || [])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const currentExpenses = (currentTransactions || [])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const totalBalance = (allTransactions || [])
        .reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0)

      const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0

      // Calculate balance trend based on selected period
      const periods = {
        "1month": 1,
        "3months": 3,
        "6months": 6,
        "12months": 12,
        "alltime": 24
      }
      const monthsToShow = periods[balancePeriod as keyof typeof periods] || 3

      // Balance trend calculation
      const balanceTrend = []
      let runningBalance = 0
      
      // Get transactions in chronological order
      const sortedTransactions = (allTransactions || [])
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        
        const monthTransactions = sortedTransactions.filter(t => {
          const tDate = new Date(t.date)
          return tDate >= monthStart && tDate <= monthEnd
        })
        
        const monthlyBalance = monthTransactions
          .reduce((sum, t) => sum + (t.type === 'income' ? Number(t.amount) : -Number(t.amount)), 0)
        
        runningBalance += monthlyBalance
        
        balanceTrend.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          balance: runningBalance
        })
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
        savingsRate,
        recentTransactions: allTransactions?.slice(0, 50) || [],
        categorySpending: [],
        monthlyTrend,
        topCategories: [],
        balanceTrend
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
      change: 12.5,
      changeType: "increase",
      icon: Wallet,
      color: "bg-blue-500"
    },
    {
      title: "Monthly Income",
      amount: stats?.monthlyIncome || 0,
      change: 8.2,
      changeType: "increase",
      icon: DollarSign,
      color: "bg-green-500"
    },
    {
      title: "Monthly Expenses",
      amount: stats?.monthlyExpenses || 0,
      change: -3.1,
      changeType: "decrease",
      icon: CreditCard,
      color: "bg-orange-500"
    },
    {
      title: "Savings Rate",
      amount: stats?.savingsRate || 0,
      change: 2.4,
      changeType: "increase",
      icon: PiggyBank,
      color: "bg-purple-500"
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto space-y-4">
              
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}! 👋
                  </h1>
                <p className="text-gray-600 text-sm">
                  Here&apos;s your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                  </Button>
                </div>
              </div>

            {/* Quick Stats - More Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((stat, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                        <p className="text-xs font-medium text-gray-600">{stat.title}</p>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-bold text-gray-900">
                            {stat.title === "Savings Rate" ? `${stat.amount.toFixed(1)}%` : `$${stat.amount.toLocaleString()}`}
                              </span>
                          <Badge 
                            variant={stat.changeType === 'increase' ? 'default' : 'secondary'} 
                            className={`text-xs py-0 ${
                              stat.changeType === 'increase' 
                                ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                                : 'bg-red-100 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            {stat.changeType === 'increase' ? '+' : ''}{stat.change}%
                          </Badge>
                        </div>
                            </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                        {stat.title === "Total Balance" && <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm"><Wallet className="h-6 w-6 text-white" /></div>}
                        {stat.title === "Monthly Income" && <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm"><DollarSign className="h-6 w-6 text-white" /></div>}
                        {stat.title === "Monthly Expenses" && <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm"><CreditCard className="h-6 w-6 text-white" /></div>}
                        {stat.title === "Savings Rate" && <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm"><PiggyBank className="h-6 w-6 text-white" /></div>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
              ))}
              </div>

            {/* Main Dashboard Grid - Restructured */}
            <div className="space-y-4">
              
              {/* Charts Section - 2 Charts Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Total Balance Trend - Clean Area Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <CardTitle className="text-sm font-medium text-gray-900">Total Balance</CardTitle>
                      </div>
                      <Select value={balancePeriod} onValueChange={setBalancePeriod}>
                        <SelectTrigger className="w-32 h-8 text-xs">
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
                    <p className="text-xs text-gray-600">Balance progression over time</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isLoading ? (
                        <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
                    ) : (
                        <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.balanceTrend || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="month" 
                                tick={{ fontSize: 10, fill: '#64748b' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                                tick={{ fontSize: 10, fill: '#64748b' }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip 
                              formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Balance']}
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
                              type="monotone" 
                              dataKey="balance" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              fill="url(#balanceGradient)"
                              dot={{ fill: '#3b82f6', r: 3 }}
                            />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Comparison - Bar Chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-indigo-600" />
                      <CardTitle className="text-sm font-medium text-gray-900">Monthly Comparison</CardTitle>
                    </div>
                    <p className="text-xs text-gray-600">Income vs expenses comparison</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isLoading ? (
                      <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
                    ) : (
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats?.monthlyTrend || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontSize: 10, fill: '#64748b' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 10, fill: '#64748b' }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip 
                              formatter={(value: any, name: string) => [
                                `$${Number(value).toLocaleString()}`, 
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
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                              </linearGradient>
                              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
                              </linearGradient>
                            </defs>
                            <Bar dataKey="income" fill="url(#incomeGradient)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" fill="url(#expenseGradient)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
                    </div>

              {/* Recent Transactions Full Width */}
              <Card className="border border-gray-200">
                <CardHeader className="pb-2">
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
                    <div className="p-4 space-y-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                    <>
                      {/* Table Header */}
                      <div className="px-4 py-3 border-b border-gray-200/60">
                        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                          <div className="col-span-4">Description</div>
                          <div className="col-span-2 border-l border-gray-200/40 pl-4">Date</div>
                          <div className="col-span-2 border-l border-gray-200/40 pl-4">Type</div>
                          <div className="col-span-2 border-l border-gray-200/40 pl-4">Category</div>
                          <div className="col-span-2 border-l border-gray-200/40 pl-4">Amount</div>
                        </div>
                      </div>

                      {/* Table Body */}
                      <div className="divide-y divide-gray-100/60">
                        {stats.recentTransactions
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((transaction, index) => (
                            <div key={index} className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                              <div className="grid grid-cols-12 gap-4 items-center">
                                {/* Description with Icon */}
                                <div className="col-span-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                                         style={{ backgroundColor: `${transaction.categories?.color}20` }}>
                                      <IconRenderer 
                                        iconName={transaction.icon || transaction.categories?.icon} 
                                        className="h-4 w-4"
                                        fallbackColor={transaction.categories?.color}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 truncate">
                                      {transaction.description}
                                    </span>
                                  </div>
                                </div>

                                {/* Date */}
                                <div className="col-span-2 border-l border-gray-200/40 pl-4">
                                  <span className="text-sm text-gray-600">
                                    {new Date(transaction.date).toLocaleDateString()}
                                  </span>
                                </div>

                                {/* Type */}
                                <div className="col-span-2 border-l border-gray-200/40 pl-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {transaction.type === 'income' ? 'Income' : 'Expense'}
                                  </span>
                                </div>

                                {/* Category */}
                                <div className="col-span-2 border-l border-gray-200/40 pl-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: transaction.categories?.color }} />
                                    <span className="text-sm text-gray-600 truncate">
                                      {transaction.categories?.name}
                                    </span>
                                  </div>
                                </div>

                                {/* Amount */}
                                <div className="col-span-2 border-l border-gray-200/40 pl-4">
                                  <span className="text-sm font-medium text-gray-900">
                                    {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Pagination - Always visible */}
                      <div className="border-t border-gray-200/60 px-4 py-3 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, stats.recentTransactions.length)} of {stats.recentTransactions.length} results
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="h-8"
                            >
                              <ChevronLeft className="h-4 w-4" />
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
                                    className="h-8 w-8"
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                              {Math.ceil(stats.recentTransactions.length / itemsPerPage) > 5 && (
                                <span className="text-sm text-gray-600 px-2">...</span>
                              )}
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage >= Math.ceil(stats.recentTransactions.length / itemsPerPage)}
                              className="h-8"
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No recent activity</h3>
                      <p className="text-xs text-gray-500 mb-4">Start tracking your finances by adding transactions</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
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