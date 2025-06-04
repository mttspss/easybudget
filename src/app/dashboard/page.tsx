"use client"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp,
  Activity,
  Target,
  Plus,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  PiggyBank,
  CheckCircle,
  Eye,
  Filter
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts'

interface DashboardStats {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  recentTransactions: any[]
  budgetProgress: any[]
  goalProgress: any[]
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
            type
          )
        `)
        .eq('user_id', user.id)
        .gte('date', currentMonthStart.toISOString().split('T')[0])
        .order('date', { ascending: false })

      // Get all transactions for total balance
      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)

      // Get budgets
      const { data: budgets } = await supabase
        .from('budgets')
        .select(`
          *,
          categories (
            name,
            color
          )
        `)
        .eq('user_id', user.id)

      // Get goals
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

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

      // Category spending with budget comparison
      const categorySpending = await Promise.all(
        (budgets || []).map(async (budget) => {
          const spent = (currentTransactions || [])
            .filter(t => t.category_id === budget.category_id && t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0)

          return {
            category: budget.categories?.name || 'Unknown',
            spent,
            budget: Number(budget.amount),
            color: budget.categories?.color || '#3B82F6',
            percentage: (spent / Number(budget.amount)) * 100
          }
        })
      )

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

      // Goals progress
      const goalProgress = (goals || []).map(goal => ({
        ...goal,
        percentage: (Number(goal.current_amount) / Number(goal.target_amount)) * 100
      }))

      setStats({
        totalBalance,
        monthlyIncome: currentIncome,
        monthlyExpenses: currentExpenses,
        savingsRate,
        recentTransactions: (currentTransactions || []).slice(0, 5),
        budgetProgress: categorySpending.filter(c => c.budget > 0),
        goalProgress: goalProgress,
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
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  Here&apos;s your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
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

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {stat.title === "Savings Rate" ? `${stat.amount.toFixed(1)}%` : `$${stat.amount.toLocaleString()}`}
                          </span>
                          <Badge variant={stat.changeType === 'increase' ? 'default' : 'secondary'} className="text-xs">
                            {stat.changeType === 'increase' ? '+' : ''}{stat.change}%
                          </Badge>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                        <stat.icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Spending Overview - Left Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Monthly Trend Chart */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-blue-600" />
                          Monthly Trend
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Income vs Expenses over time</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-80 bg-gray-100 rounded-lg animate-pulse" />
                    ) : (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats?.monthlyTrend || []}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip 
                              formatter={(value: any, name: string) => [
                                `$${Number(value).toLocaleString()}`,
                                name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Savings'
                              ]}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                              }}
                            />
                            <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Budget Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Budget Progress
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">How you&apos;re doing against your monthly budgets</p>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : stats?.budgetProgress && stats.budgetProgress.length > 0 ? (
                      <div className="space-y-4">
                        {stats.budgetProgress.map((budget, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: budget.color }} />
                                <span className="font-medium text-gray-900">{budget.category}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">${budget.spent.toLocaleString()} / ${budget.budget.toLocaleString()}</p>
                                <p className={`text-xs ${budget.percentage > 90 ? 'text-red-600' : budget.percentage > 70 ? 'text-orange-600' : 'text-gray-600'}`}>
                                  {budget.percentage.toFixed(1)}% used
                                </p>
                              </div>
                            </div>
                            <Progress 
                              value={Math.min(budget.percentage, 100)} 
                              className="h-2"
                              style={{
                                backgroundColor: budget.percentage > 100 ? '#FEE2E2' : '#F3F4F6'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-gray-900 mb-1">No budgets set</h3>
                        <p className="text-xs text-gray-500 mb-4">Create budgets to track your spending</p>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Budget
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                
                {/* Spending Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-orange-600" />
                      Top Categories
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Your biggest expenses this month</p>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
                    ) : stats?.topCategories && stats.topCategories.length > 0 ? (
                      <>
                        <div className="h-48 mb-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={stats.topCategories}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
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
                        <div className="space-y-2">
                          {stats.topCategories.slice(0, 3).map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                                <span className="text-sm font-medium text-gray-900">{category.name}</span>
                              </div>
                              <span className="text-sm text-gray-600">${category.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-gray-900 mb-1">No expenses yet</h3>
                        <p className="text-xs text-gray-500">Add transactions to see your spending breakdown</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Goals Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      Financial Goals
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Track your progress towards financial goals</p>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2].map(i => (
                          <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : stats?.goalProgress && stats.goalProgress.length > 0 ? (
                      <div className="space-y-4">
                        {stats.goalProgress.slice(0, 3).map((goal, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">{goal.name}</h4>
                              <span className="text-sm text-gray-600">
                                ${Number(goal.current_amount).toLocaleString()} / ${Number(goal.target_amount).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Progress value={Math.min(goal.percentage, 100)} className="flex-1 h-2" />
                              <span className="text-sm font-medium text-gray-900 min-w-[3rem]">
                                {goal.percentage.toFixed(0)}%
                              </span>
                            </div>
                            {goal.percentage >= 100 && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-xs font-medium">Goal completed!</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-sm font-medium text-gray-900 mb-1">No goals set</h3>
                        <p className="text-xs text-gray-500 mb-4">Set financial goals to track your progress</p>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Goal
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Your latest transactions</p>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                      <div className="space-y-3">
                        {stats.recentTransactions.map((transaction, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                                   style={{ backgroundColor: `${transaction.categories?.color}20` }}>
                                <div className="w-2 h-2 rounded-full" 
                                     style={{ backgroundColor: transaction.categories?.color }} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                                <p className="text-xs text-gray-500">{transaction.categories?.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${
                                transaction.type === 'income' ? 'text-green-600' : 'text-gray-900'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}${Number(transaction.amount).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
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