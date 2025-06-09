"use client"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  PieChart,
  TrendingUp,
  Download,
  FileText,
  DollarSign,
  ArrowUpDown
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
  Legend,
  AreaChart,
  Area
} from 'recharts'

interface ReportData {
  monthlyData: any[]
  categoryData: any[]
  yearlyComparison: any[]
  topExpenses: any[]
  topIncome: any[]
  incomeVsExpenses: any[]
}

export default function ReportsPage() {
  const { user, loading } = useAuth()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("6months")
  const [topTransactionType, setTopTransactionType] = useState<'expenses' | 'income'>('expenses')

  const fetchReportData = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Fetch all transactions
      const { data: transactions } = await supabase
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
        .order('date', { ascending: false })

      if (!transactions) return

      // Process data for charts
      const monthsToShow = selectedPeriod === "6months" ? 6 : selectedPeriod === "12months" ? 12 : 24
      
      // Monthly data for line chart
      const monthlyData = []
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date)
          return tDate >= monthStart && tDate <= monthEnd
        })
        
        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0)
        
        const expenses = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0)
        
        monthlyData.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          income,
          expenses,
          net: income - expenses
        })
      }

      // Category data for pie chart
      const categoryTotals = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const categoryName = t.categories?.name || 'Uncategorized'
          if (!acc[categoryName]) {
            acc[categoryName] = {
              amount: 0,
              color: t.categories?.color || '#6B7280'
            }
          }
          acc[categoryName].amount += Number(t.amount)
          return acc
        }, {} as Record<string, { amount: number; color: string }>)

      const categoryData = Object.entries(categoryTotals)
        .map(([name, dataItem]) => ({
          name,
          amount: (dataItem as { amount: number; color: string }).amount,
          color: (dataItem as { amount: number; color: string }).color
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6)

      // Top expenses
      const topExpenses = transactions
        .filter(t => t.type === 'expense')
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 10)

      // Top income
      const topIncome = transactions
        .filter(t => t.type === 'income')
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 10)

      setReportData({
        monthlyData,
        categoryData,
        yearlyComparison: [],
        topExpenses,
        topIncome,
        incomeVsExpenses: monthlyData
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedPeriod])

  useEffect(() => {
    if (user) {
      fetchReportData()
    }
  }, [user, fetchReportData])

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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-3">
          <div className="max-w-7xl mx-auto space-y-3">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-600 text-xs">Analyze your financial data and trends</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last3months">Last 3 Months</SelectItem>
                    <SelectItem value="last6months">Last 6 Months</SelectItem>
                    <SelectItem value="lastyear">Last 12 Months</SelectItem>
                    <SelectItem value="thisyear">This Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Monthly Income</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${reportData?.monthlyData ? 
                          Math.round(reportData.monthlyData.reduce((sum, m) => sum + m.income, 0) / reportData.monthlyData.length).toLocaleString() 
                          : '0'}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Monthly Expenses</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${reportData?.monthlyData ? 
                          Math.round(reportData.monthlyData.reduce((sum, m) => sum + m.expenses, 0) / reportData.monthlyData.length).toLocaleString() 
                          : '0'}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
                      <ArrowUpDown className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Net Average</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${reportData?.monthlyData ? 
                          Math.round(reportData.monthlyData.reduce((sum, m) => sum + m.net, 0) / reportData.monthlyData.length).toLocaleString() 
                          : '0'}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Top Category</p>
                      <p className="text-lg font-bold text-gray-900">
                        {reportData?.categoryData?.[0]?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                      <PieChart className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              
              {/* Total Balance Trend - AreaChart */}
              <Card>
                <CardHeader className="pb-1 px-2 pt-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Total Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-2 pb-2">
                  {isLoading ? (
                    <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
                  ) : (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={reportData?.monthlyData || []}>
                          <defs>
                            <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']} />
                          <Area type="monotone" dataKey="net" stroke="#3b82f6" fillOpacity={1} fill="url(#netGradient)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Income vs Expenses with Legend */}
              <Card>
                <CardHeader className="pb-1 px-2 pt-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Income vs Expenses Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-2 pb-2">
                  {isLoading ? (
                    <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
                  ) : (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={reportData?.monthlyData || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']} />
                          <Legend />
                          <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} name="Income" />
                          <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} name="Expenses" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Second Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Expense Categories */}
              <Card>
                <CardHeader className="pb-1 px-2 pt-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <PieChart className="h-4 w-4 text-purple-600" />
                    Expense Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-2 pb-2">
                  {isLoading ? (
                    <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
                  ) : (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={reportData?.categoryData || []}
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            dataKey="amount"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {(reportData?.categoryData || []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Placeholder for future chart */}
              <Card>
                <CardHeader className="pb-1 px-2 pt-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <PieChart className="h-4 w-4 text-orange-600" />
                    Monthly Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-2 pb-2">
                  <div className="h-48 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Coming Soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Expenses/Income Table */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-1 px-2 pt-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-orange-600" />
                    {topTransactionType === 'expenses' ? 'Top Expenses' : 'Top Income'}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant={topTransactionType === 'expenses' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTopTransactionType('expenses')}
                      className="text-xs px-2 py-1 h-7"
                    >
                      Expenses
                    </Button>
                    <Button
                      variant={topTransactionType === 'income' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTopTransactionType('income')}
                      className="text-xs px-2 py-1 h-7"
                    >
                      Income
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-3 space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (reportData?.topExpenses && reportData.topExpenses.length > 0) || (reportData?.topIncome && reportData.topIncome.length > 0) ? (
                  <>
                    <div className="px-2 py-2 border-b border-gray-200/60">
                      <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        <div className="col-span-4">Description</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-3">Category</div>
                        <div className="col-span-3">Amount</div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100/60">
                      {(topTransactionType === 'expenses' ? reportData?.topExpenses : reportData?.topIncome)?.slice(0, 10).map((transaction, index) => (
                        <div key={index} className="px-2 py-2 hover:bg-gray-50/50 transition-colors">
                          <div className="grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-4">
                              <span className="text-sm font-medium text-gray-900">{transaction.description}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-xs text-gray-600">
                                {new Date(transaction.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="col-span-3">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: transaction.categories?.color }} />
                                <span className="text-xs text-gray-600">{transaction.categories?.name}</span>
                              </div>
                            </div>
                            <div className="col-span-3">
                              <span className={`text-sm font-medium ${
                                topTransactionType === 'expenses' ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {topTransactionType === 'expenses' ? '-' : '+'}${Number(transaction.amount).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No {topTransactionType} data</h3>
                    <p className="text-xs text-gray-500">Add some {topTransactionType} to see reports</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 