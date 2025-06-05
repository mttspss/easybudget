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
  Tooltip
} from 'recharts'

interface ReportData {
  monthlyData: any[]
  categoryData: any[]
  yearlyComparison: any[]
  topExpenses: any[]
  incomeVsExpenses: any[]
}

export default function ReportsPage() {
  const { user, loading } = useAuth()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("6months")

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

      setReportData({
        monthlyData,
        categoryData,
        yearlyComparison: [],
        topExpenses,
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
        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600 text-sm">Detailed insights into your financial data</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="12months">Last 12 Months</SelectItem>
                    <SelectItem value="24months">Last 24 Months</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Monthly Income</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${reportData?.monthlyData ? 
                          Math.round(reportData.monthlyData.reduce((sum, m) => sum + m.income, 0) / reportData.monthlyData.length).toLocaleString() 
                          : '0'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Avg Monthly Expenses</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${reportData?.monthlyData ? 
                          Math.round(reportData.monthlyData.reduce((sum, m) => sum + m.expenses, 0) / reportData.monthlyData.length).toLocaleString() 
                          : '0'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
                      <ArrowUpDown className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Net Average</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${reportData?.monthlyData ? 
                          Math.round(reportData.monthlyData.reduce((sum, m) => sum + m.net, 0) / reportData.monthlyData.length).toLocaleString() 
                          : '0'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Top Category</p>
                      <p className="text-xl font-bold text-gray-900">
                        {reportData?.categoryData?.[0]?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm">
                      <PieChart className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Income vs Expenses Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Income vs Expenses Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={reportData?.monthlyData || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']} />
                          <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
                          <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} />
                          <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expense Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Expense Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={reportData?.categoryData || []}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
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
            </div>

            {/* Top Expenses Table */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Top Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : reportData?.topExpenses && reportData.topExpenses.length > 0 ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-200/60">
                      <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        <div className="col-span-4">Description</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-3">Category</div>
                        <div className="col-span-3">Amount</div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100/60">
                      {reportData.topExpenses.slice(0, 10).map((transaction, index) => (
                        <div key={index} className="px-4 py-3 hover:bg-gray-50/50 transition-colors">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-4">
                              <span className="text-sm font-medium text-gray-900">{transaction.description}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-sm text-gray-600">
                                {new Date(transaction.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="col-span-3">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: transaction.categories?.color }} />
                                <span className="text-sm text-gray-600">{transaction.categories?.name}</span>
                              </div>
                            </div>
                            <div className="col-span-3">
                              <span className="text-sm font-medium text-gray-900">
                                ${Number(transaction.amount).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No expense data</h3>
                    <p className="text-xs text-gray-500">Add some expenses to see reports</p>
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