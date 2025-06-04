"use client"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp,
  Activity,
  Plus,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  PiggyBank,
  Filter,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
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
  const itemsPerPage = 8

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

      // Get all transactions for total balance and recent activities
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
        .limit(50)

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

      // Top spending categories
      const categoryTotals = (currentTransactions || [])
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const categoryName = t.categories?.name || 'Uncategorized'
          acc[categoryName] = (acc[categoryName] || 0) + Number(t.amount)
          return acc
        }, {} as Record<string, number>)

      const topCategories = Object.entries(categoryTotals)
        .map(([name, amount]) => ({
          name,
          amount: amount as number,
          color: (currentTransactions || []).find(t => t.categories?.name === name)?.categories?.color || '#6B7280'
        }))
        .sort((a, b) => (b.amount as number) - (a.amount as number))
        .slice(0, 5)

      // Monthly trend (last 6 months)
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
          expenses,
          savings: income - expenses
        })
      }

      setStats({
        totalBalance,
        monthlyIncome: currentIncome,
        monthlyExpenses: currentExpenses,
        savingsRate,
        recentTransactions: allTransactions || [],
        categorySpending: topCategories,
        monthlyTrend,
        topCategories
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

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
      icon: TrendingUp,
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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

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
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                <Button size="sm">
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
                          <Badge variant={stat.changeType === 'increase' ? 'default' : 'secondary'} className="text-xs py-0">
                            {stat.changeType === 'increase' ? '+' : ''}{stat.change}%
                          </Badge>
                        </div>
                            </div>
                      <div className={`p-2 rounded-lg ${stat.color} bg-opacity-10`}>
                        <stat.icon className={`h-5 w-5 ${stat.color.replace('bg-', 'text-')}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
              ))}
              </div>

            {/* Main Dashboard Grid - Compact */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Left Column - Charts */}
              <div className="space-y-4">
                
                {/* Charts Section - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  
                  {/* Financial Trend - Line Chart */}
                  <Card>
                    <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <CardTitle className="text-sm font-medium text-gray-900">Financial Trend</CardTitle>
                    </div>
                      <p className="text-xs text-gray-600">Income, expenses and balance over time</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isLoading ? (
                        <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
                    ) : (
                        <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats?.monthlyTrend || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                                  name === 'savings' ? 'Net Balance' : 
                                name === 'income' ? 'Income' : 'Expenses'
                              ]}
                              labelStyle={{ color: '#374151', fontWeight: 'normal' }}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="income" 
                              stroke="#10b981" 
                              strokeWidth={2}
                                dot={{ fill: '#10b981', strokeWidth: 0, r: 2 }}
                                activeDot={{ r: 3, stroke: '#10b981', strokeWidth: 1 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="expenses" 
                              stroke="#ef4444" 
                              strokeWidth={2}
                                dot={{ fill: '#ef4444', strokeWidth: 0, r: 2 }}
                                activeDot={{ r: 3, stroke: '#ef4444', strokeWidth: 1 }}
                            />
                            <Line 
                              type="monotone" 
                                dataKey="savings" 
                              stroke="#3b82f6" 
                              strokeWidth={2.5}
                                dot={{ fill: '#3b82f6', strokeWidth: 0, r: 2 }}
                                activeDot={{ r: 3, stroke: '#3b82f6', strokeWidth: 1 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                  {/* Monthly Comparison - Bar Chart */}
                  <Card className="bg-gradient-to-br from-purple-50/30 via-white to-white border border-purple-200/40">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                        <CardTitle className="text-sm font-medium text-gray-900">Monthly Comparison</CardTitle>
                      </div>
                      <p className="text-xs text-gray-600">Income vs Expenses</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isLoading ? (
                        <div className="h-48 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg animate-pulse" />
                    ) : (
                        <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats?.monthlyTrend || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="incomeBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22c55e"/>
                                <stop offset="100%" stopColor="#16a34a"/>
                              </linearGradient>
                              <linearGradient id="expenseBar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444"/>
                                <stop offset="100%" stopColor="#dc2626"/>
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
                              formatter={(value: any, name: string) => [
                                `$${Number(value).toLocaleString()}`, 
                                name === 'income' ? 'Income' : 'Expenses'
                              ]}
                              labelStyle={{ color: '#1e293b', fontWeight: '600' }}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                              }}
                            />
                            <Bar 
                              dataKey="income" 
                              fill="url(#incomeBar)"
                              name="Income"
                                radius={[3, 3, 0, 0]}
                                maxBarSize={30}
                            />
                            <Bar 
                              dataKey="expenses" 
                              fill="url(#expenseBar)"
                              name="Expenses"
                                radius={[3, 3, 0, 0]}
                                maxBarSize={30}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

                {/* Top Categories - Compact */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <PieChart className="h-4 w-4 text-orange-600" />
                      Top Categories
                    </CardTitle>
                    <p className="text-xs text-gray-600">Your biggest expenses this month</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isLoading ? (
                      <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
                    ) : stats?.topCategories && stats.topCategories.length > 0 ? (
                      <>
                        <div className="h-32 mb-3">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={stats.topCategories}
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={55}
                                paddingAngle={2}
                                dataKey="amount"
                              >
                                {stats.topCategories.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-1">
                          {stats.topCategories.slice(0, 3).map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                                <span className="text-xs font-medium text-gray-900">{category.name}</span>
                              </div>
                              <span className="text-xs text-gray-600">${category.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <PieChart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <h3 className="text-xs font-medium text-gray-900 mb-1">No expenses yet</h3>
                        <p className="text-xs text-gray-500">Add transactions to see your spending breakdown</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Recent Activities Full Table */}
              <div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-blue-600" />
                      Recent Activities
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
                        <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                            <div className="col-span-4">Description</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-2">Type</div>
                            <div className="col-span-2">Category</div>
                            <div className="col-span-2">Amount</div>
                          </div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-gray-100">
                          {stats.recentTransactions
                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                            .map((transaction, index) => (
                              <div key={index} className="px-4 py-3 hover:bg-gray-50 transition-colors">
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
                                  <div className="col-span-2">
                                    <span className="text-sm text-gray-600">
                                      {new Date(transaction.date).toLocaleDateString()}
                                    </span>
                                  </div>

                                  {/* Type */}
                                  <div className="col-span-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {transaction.type === 'income' ? 'Income' : 'Expense'}
                                    </span>
                                  </div>

                                  {/* Category */}
                                  <div className="col-span-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: transaction.categories?.color }} />
                                      <span className="text-sm text-gray-600 truncate">
                                        {transaction.categories?.name}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Amount */}
                                  <div className="col-span-2">
                                    <span className="text-sm font-medium text-gray-900">
                                      {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {stats.recentTransactions.length > itemsPerPage && (
                          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
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
                                <span className="text-sm text-gray-600">
                                  Page {currentPage} / {Math.ceil(stats.recentTransactions.length / itemsPerPage)}
                                </span>
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
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-gray-900 mb-1">No recent activity</h3>
                        <p className="text-xs text-gray-500 mb-4">Start tracking your finances by adding transactions</p>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Transaction
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 