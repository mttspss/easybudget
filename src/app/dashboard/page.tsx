"use client"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  Download,
  DollarSign,
  PiggyBank,
  Clock
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"

interface DashboardStats {
  totalBalance: number
  income: number
  expenses: number
  balance: number
  recentTransactions: any[]
  categorySpending: any[]
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  const fetchDashboardStats = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Calculate date ranges
      const now = new Date()
      let startDate: Date
      const endDate = now

      switch (selectedPeriod) {
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default: // month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }

      // Get transactions for the period
      const { data: periodTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      // Get all transactions for total balance
      const { data: allTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)

      // Get recent transactions (last 5)
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5)

      // Get categories
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)

      // Calculate stats
      const periodIncome = (periodTransactions || [])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const periodExpenses = (periodTransactions || [])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const totalIncome = (allTransactions || [])
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const totalExpenses = (allTransactions || [])
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      // Category spending with budgets
      const categorySpending = await Promise.all(
        (categories || []).map(async (category) => {
          const categoryTransactions = (periodTransactions || []).filter(t => t.category_id === category.id)
          const spent = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
          
          // Get budget for this category
          const { data: budgets } = await supabase
            .from('budgets')
            .select('*')
            .eq('category_id', category.id)
            .eq('user_id', user.id)
            .lte('start_date', endDate.toISOString().split('T')[0])
            .gte('end_date', startDate.toISOString().split('T')[0])
            .limit(1)

          const budget = budgets?.[0]

          return {
            category: category.name,
            color: category.color,
            spent,
            budget: budget?.amount || 0,
            percentage: budget?.amount ? (spent / budget.amount) * 100 : 0
          }
        })
      )

      setStats({
        totalBalance: totalIncome - totalExpenses,
        income: periodIncome,
        expenses: periodExpenses,
        balance: periodIncome - periodExpenses,
        recentTransactions: recentTransactions || [],
        categorySpending: categorySpending.filter(c => c.spent > 0)
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedPeriod])

  useEffect(() => {
    if (user) {
      fetchDashboardStats()
    }
  }, [user, fetchDashboardStats])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    redirect("/")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const LoadingCard = () => (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
                  <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user.user_metadata?.name?.split(' ')[0] || 'there'}
                </h1>
                <p className="text-gray-600 mt-1">Here&apos;s your financial overview</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1">
                  {["week", "month", "year"].map((period) => (
                    <Button
                      key={period}
                      variant={selectedPeriod === period ? "default" : "ghost"}
                      size="sm"
                      className={`h-8 px-3 text-xs transition-all ${
                        selectedPeriod === period ? "bg-blue-600 text-white shadow-sm" : ""
                      }`}
                      onClick={() => setSelectedPeriod(period)}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                <>
                  <LoadingCard />
                  <LoadingCard />
                  <LoadingCard />
                  <LoadingCard />
                </>
              ) : (
                <>
                  {/* Total Balance */}
                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <PiggyBank className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Balance</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(stats?.totalBalance || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Income */}
                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <ArrowUpRight className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Income
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(stats?.income || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Expenses */}
                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-red-50 rounded-lg">
                          <ArrowDownRight className="h-5 w-5 text-red-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Expenses
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(stats?.expenses || 0)}
                        </p>
                    </div>
                    </CardContent>
                  </Card>

                  {/* Net Income */}
                  <Card className="bg-white border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Net Income</p>
                        <p className={`text-2xl font-bold ${(stats?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(stats?.balance || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-center gap-4">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  ) : stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentTransactions.map((transaction, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{transaction.description}</div>
                            <div className="text-sm text-gray-500">{formatDate(transaction.date)}</div>
                          </div>
                          <div className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                      <p className="text-gray-500 mb-4">Start tracking your finances by adding your first transaction.</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Transaction
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Category Spending */}
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Category Spending</CardTitle>
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex justify-between mb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                          <div className="h-2 bg-gray-200 rounded"></div>
              </div>
                      ))}
            </div>
                  ) : stats?.categorySpending && stats.categorySpending.length > 0 ? (
                    <div className="space-y-4">
                      {stats.categorySpending.map((category, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }}
                        ></div>
                              <span className="font-medium text-gray-900">{category.category}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-600">
                              {formatCurrency(category.spent)}
                        </span>
                      </div>
                          {category.budget > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  category.percentage > 100 ? 'bg-red-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(category.percentage, 100)}%` }}
                              ></div>
                      </div>
                          )}
                    </div>
                  ))}
                </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No spending data</h3>
                      <p className="text-gray-500 mb-4">Create categories and add transactions to see your spending breakdown.</p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
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