"use client"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker"
import { 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Filter,
  Download,
  Clock,
  BarChart3,
  Activity,
  Wallet,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart
} from 'recharts'
import { IconRenderer } from "@/components/ui/icon-renderer"

interface DashboardStats {
  totalBalance: number
  income: number
  expenses: number
  balance: number
  recentTransactions: any[]
  categorySpending: any[]
  monthlyData: any[]
  currentPeriod?: string
}

interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  type: 'income' | 'expense'
  icon?: string | null
  receipt_url?: string | null
  categories?: {
    name: string
    color: string
  } | null
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined)

  // Transaction columns for data table
  const transactionColumns: ColumnDef<Transaction>[] = useMemo(() => [
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <IconRenderer 
                iconName={transaction.icon} 
                className="h-4 w-4 text-gray-600"
                fallbackColor={transaction.categories?.color}
              />
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">{transaction.description}</div>
              <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.categories
        return (
          <div className="flex items-center gap-2">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: category?.color || '#gray' }}
            />
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {category?.name || 'Uncategorized'}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const transaction = row.original
        const amount = parseFloat(transaction.amount.toString())
        return (
          <div className="text-right">
            <div className="flex items-baseline gap-1 justify-end">
              <span className={`text-sm font-medium ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+$' : '-$'}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {Math.abs(amount).toFixed(2)}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: () => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [])

  const fetchDashboardStats = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Calculate date ranges
      const now = new Date()
      let startDate: Date
      let endDate: Date
      let periodLabel: string

      if (customDateRange?.from && customDateRange?.to) {
        // Custom date range
        startDate = customDateRange.from
        endDate = customDateRange.to
        periodLabel = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      } else {
        // Preset periods
        endDate = now
        switch (selectedPeriod) {
          case 'week':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
            periodLabel = 'Weekly'
            break
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            periodLabel = 'Yearly'
            break
          default: // month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            periodLabel = 'Monthly'
        }
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

      // Get recent transactions (last 5) with categories
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            color
          )
        `)
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

      // Generate monthly data for charts
      const monthlyData = []
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        
        const monthTransactions = (allTransactions || []).filter(t => {
          const tDate = new Date(t.date)
          return tDate >= monthStart && tDate <= monthEnd
        })
        
        const monthIncome = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0)
        
        const monthExpenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0)
        
        monthlyData.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          income: monthIncome,
          expenses: monthExpenses,
          balance: monthIncome - monthExpenses
        })
      }

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
        categorySpending: categorySpending.filter(c => c.spent > 0),
        monthlyData: monthlyData,
        currentPeriod: periodLabel
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedPeriod, customDateRange])

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

  const LoadingCard = () => (
    <Card className="bg-gradient-to-br from-gray-50/50 via-white to-white border border-gray-200/30 shadow-sm">
      <CardContent className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </CardContent>
    </Card>
  )

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4">
          {/* White Container for Dashboard Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-full">
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* Greeting Component - Aligned with sidebar */}
              <div className="flex items-center gap-3">
                <span className="text-2xl">👋</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Hello, {(() => {
                      // Try to get full name from user metadata
                      if (user.user_metadata?.full_name) {
                        return user.user_metadata.full_name.split(' ')[0]
                      }
                      // Try to get first name from user metadata
                      if (user.user_metadata?.first_name) {
                        return user.user_metadata.first_name
                      }
                      // Try to get name from user metadata
                      if (user.user_metadata?.name) {
                        return user.user_metadata.name.split(' ')[0]
                      }
                      // Fallback to email username but make it prettier
                      if (user.email) {
                        const emailName = user.email.split('@')[0]
                        // Convert "mttspss" to "Mttspss" 
                        return emailName.charAt(0).toUpperCase() + emailName.slice(1)
                      }
                      return 'there'
                    })()}
                  </h1>
                  <p className="text-gray-600 text-sm mt-1">
                    It&apos;s {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Period Selection */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Financial Overview</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {stats?.currentPeriod ? `${stats.currentPeriod} overview` : 'Track your income and expenses'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Quick Period Buttons */}
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                    {["week", "month", "year"].map((period) => (
                      <Button
                        key={period}
                        variant={selectedPeriod === period && !customDateRange ? "default" : "ghost"}
                        size="sm"
                        className={`h-8 px-3 text-xs transition-all ${
                          selectedPeriod === period && !customDateRange ? "bg-blue-600 text-white shadow-sm" : ""
                        }`}
                        onClick={() => {
                          setSelectedPeriod(period)
                          setCustomDateRange(undefined)
                        }}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Custom Date Range Picker */}
                  <DateRangePicker
                    value={customDateRange}
                    onValueChange={(range) => {
                      setCustomDateRange(range)
                      if (range?.from && range?.to) {
                        setSelectedPeriod("") // Clear preset selection when custom range is used
                      }
                    }}
                    className="h-8 text-xs"
                    placeholder="Custom range"
                  />
                  
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Filter className="h-3 w-3 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Download className="h-3 w-3 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Main Stats Cards - Reduced Height */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                  <>
                    <LoadingCard />
                    <LoadingCard />
                    <LoadingCard />
                  </>
                ) : (
                  <>
                    {/* Net Income - Blue Theme */}
                    <Card className="bg-gradient-to-br from-blue-50/50 via-white to-white border border-blue-200/30 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Net Income</p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-semibold text-blue-600">
                                $
                              </span>
                              <span className="text-2xl font-semibold text-gray-900">
                                {Math.abs(stats?.balance || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="p-2 bg-blue-100 rounded-full">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Income - Credit Card Style Icon */}
                    <Card className="bg-gradient-to-br from-green-50/50 via-white to-white border border-green-200/30 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">
                              {stats?.currentPeriod ? `${stats.currentPeriod} Income` : 'Income'}
                            </p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-semibold text-green-600">$</span>
                              <span className="text-2xl font-semibold text-gray-900">
                                {(stats?.income || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="p-2 bg-green-100 rounded-lg relative">
                            <Wallet className="h-5 w-5 text-green-600" />
                            <ArrowUpRight className="h-3 w-3 text-green-600 absolute -top-1 -right-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Expenses - Credit Card Style Icon */}
                    <Card className="bg-gradient-to-br from-red-50/50 via-white to-white border border-red-200/30 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">
                              {stats?.currentPeriod ? `${stats.currentPeriod} Expenses` : 'Expenses'}
                            </p>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-semibold text-red-600">$</span>
                              <span className="text-2xl font-semibold text-gray-900">
                                {(stats?.expenses || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="p-2 bg-red-100 rounded-lg relative">
                            <Wallet className="h-5 w-5 text-red-600" />
                            <ArrowDownRight className="h-3 w-3 text-red-600 absolute -top-1 -right-1" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Charts Section - With Icons */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Trend - With Icon */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg font-medium text-gray-900">Financial Trend</CardTitle>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Income, expenses and balance over time</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isLoading ? (
                      <div className="h-64 bg-gray-50 rounded-lg animate-pulse"></div>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stats?.monthlyData || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontSize: 11, fill: '#64748b' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: '#64748b' }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip 
                              formatter={(value: any, name: string) => [
                                `$${Number(value).toLocaleString()}`, 
                                name === 'balance' ? 'Net Balance' : 
                                name === 'income' ? 'Income' : 'Expenses'
                              ]}
                              labelStyle={{ color: '#374151', fontWeight: 'normal' }}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '13px',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="income" 
                              stroke="#10b981" 
                              strokeWidth={2}
                              dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                              activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 1 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="expenses" 
                              stroke="#ef4444" 
                              strokeWidth={2}
                              dot={{ fill: '#ef4444', strokeWidth: 0, r: 3 }}
                              activeDot={{ r: 4, stroke: '#ef4444', strokeWidth: 1 }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="balance" 
                              stroke="#3b82f6" 
                              strokeWidth={2.5}
                              dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
                              activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 1 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Comparison - Less Bold + Icon */}
                <Card className="bg-gradient-to-br from-purple-50/30 via-white to-white border border-purple-200/40 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-purple-600" />
                          <CardTitle className="text-lg font-medium text-gray-900">Monthly Comparison</CardTitle>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Income vs Expenses</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isLoading ? (
                      <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg animate-pulse"></div>
                    ) : (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats?.monthlyData || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
                              tick={{ fontSize: 11, fill: '#64748b' }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 11, fill: '#64748b' }}
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
                                borderRadius: '12px',
                                fontSize: '13px',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                              }}
                            />
                            <Bar 
                              dataKey="income" 
                              fill="url(#incomeBar)"
                              name="Income"
                              radius={[4, 4, 0, 0]}
                              maxBarSize={40}
                            />
                            <Bar 
                              dataKey="expenses" 
                              fill="url(#expenseBar)"
                              name="Expenses"
                              radius={[4, 4, 0, 0]}
                              maxBarSize={40}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions - With Icon and Better Font */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-lg font-medium text-gray-900">Recent Transactions</CardTitle>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Your latest financial activity</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 text-xs hover:bg-gray-50">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ) : stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                    <DataTable 
                      columns={transactionColumns} 
                      data={stats.recentTransactions} 
                      searchKey="description"
                      searchPlaceholder="Search transactions..."
                      showPagination={false}
                      showColumnToggle={false}
                      showSearch={false}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="h-6 w-6 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">No transactions yet</h3>
                      <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">Start tracking your finances by adding your first transaction.</p>
                      <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-3 w-3 mr-2" />
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