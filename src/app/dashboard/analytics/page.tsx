"use client"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker"
import { 
  TrendingUp,
  PieChart,
  BarChart3,
  Activity,
  Target,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts'

interface AnalyticsData {
  monthlyTrends: any[]
  categoryBreakdown: any[]
  weeklyPatterns: any[]
  comparisonData: any[]
  insights: {
    topCategory: string
    trendDirection: 'up' | 'down' | 'stable'
    averageDaily: number
    projectedMonthly: number
  }
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("3months")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined)
  const [activeChart, setActiveChart] = useState<'trends' | 'categories' | 'patterns'>('trends')
  const [drillDownData, setDrillDownData] = useState<any>(null)

  const fetchAnalyticsData = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Calculate date ranges
      const now = new Date()
      let startDate: Date
      let endDate: Date

      if (customDateRange?.from && customDateRange?.to) {
        startDate = customDateRange.from
        endDate = customDateRange.to
      } else {
        endDate = now
        switch (selectedPeriod) {
          case '1month':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
            break
          case '6months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
            break
          case '1year':
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
            break
          default: // 3months
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        }
      }

      // Fetch all transactions in the period
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            color
          )
        `)
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (!transactions) {
        setAnalyticsData(null)
        return
      }

      // Generate monthly trends
      const monthlyTrends = []
      const startMonth = new Date(startDate)
      
      while (startMonth <= endDate) {
        const monthStart = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1)
        const monthEnd = new Date(startMonth.getFullYear(), startMonth.getMonth() + 1, 0)
        
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
        
        monthlyTrends.push({
          month: startMonth.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          income,
          expenses,
          net: income - expenses,
          transactionCount: monthTransactions.length
        })
        
        startMonth.setMonth(startMonth.getMonth() + 1)
      }

      // Generate category breakdown
      const categoryMap = new Map()
      transactions.filter(t => t.type === 'expense').forEach(t => {
        const categoryName = t.categories?.name || 'Uncategorized'
        const categoryColor = t.categories?.color || '#6B7280'
        
        if (categoryMap.has(categoryName)) {
          categoryMap.get(categoryName).value += Number(t.amount)
          categoryMap.get(categoryName).count += 1
        } else {
          categoryMap.set(categoryName, {
            name: categoryName,
            value: Number(t.amount),
            count: 1,
            color: categoryColor,
            percentage: 0
          })
        }
      })

      const totalExpenses = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.value, 0)
      const categoryBreakdown = Array.from(categoryMap.values())
        .map(cat => ({
          ...cat,
          percentage: totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8) // Top 8 categories

      // Generate weekly patterns
      const weeklyPatterns = []
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      
      for (let i = 0; i < 7; i++) {
        const dayTransactions = transactions.filter(t => new Date(t.date).getDay() === i)
        const avgAmount = dayTransactions.length > 0 
          ? dayTransactions.reduce((sum, t) => sum + Number(t.amount), 0) / dayTransactions.length 
          : 0
        
        weeklyPatterns.push({
          day: daysOfWeek[i],
          amount: avgAmount,
          count: dayTransactions.length
        })
      }

      // Generate insights
      const topCategory = categoryBreakdown[0]?.name || 'No data'
      const recentTrend = monthlyTrends.slice(-3)
      const trendDirection = recentTrend.length >= 2 
        ? recentTrend[recentTrend.length - 1].net > recentTrend[recentTrend.length - 2].net 
          ? 'up' : 'down'
        : 'stable'
      
      const averageDaily = transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + Number(t.amount), 0) / 
          Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0

      const projectedMonthly = averageDaily * 30

      setAnalyticsData({
        monthlyTrends,
        categoryBreakdown,
        weeklyPatterns,
        comparisonData: monthlyTrends.slice(-6), // Last 6 months for comparison
        insights: {
          topCategory,
          trendDirection,
          averageDaily,
          projectedMonthly
        }
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedPeriod, customDateRange])

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
    }
  }, [user, fetchAnalyticsData])

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

  const handleChartClick = (data: any, chartType: string) => {
    setDrillDownData({ ...data, chartType })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.dataKey}:</span>
              <span className="font-medium">${entry.value?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const LoadingChart = () => (
    <div className="h-80 bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading chart data...</div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-full">
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                  <p className="text-gray-600 text-sm mt-1">Advanced insights into your financial patterns</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Period Selection */}
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1">
                    {[
                      { key: "1month", label: "1M" },
                      { key: "3months", label: "3M" },
                      { key: "6months", label: "6M" },
                      { key: "1year", label: "1Y" }
                    ].map((period) => (
                      <Button
                        key={period.key}
                        variant={selectedPeriod === period.key && !customDateRange ? "default" : "ghost"}
                        size="sm"
                        className={`h-8 px-3 text-xs transition-all ${
                          selectedPeriod === period.key && !customDateRange ? "bg-blue-600 text-white shadow-sm" : ""
                        }`}
                        onClick={() => {
                          setSelectedPeriod(period.key)
                          setCustomDateRange(undefined)
                        }}
                      >
                        {period.label}
                      </Button>
                    ))}
                  </div>
                  
                  <DateRangePicker
                    value={customDateRange}
                    onValueChange={(range) => {
                      setCustomDateRange(range)
                      if (range?.from && range?.to) {
                        setSelectedPeriod("")
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

              {/* Key Insights Cards */}
              {!isLoading && analyticsData && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50/50 via-white to-white border border-blue-200/30">
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Top Category</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {analyticsData.insights.topCategory}
                          </p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-full">
                          <PieChart className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50/50 via-white to-white border border-green-200/30">
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Trend</p>
                          <div className="flex items-center gap-1 mt-1">
                            {analyticsData.insights.trendDirection === 'up' ? (
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                            ) : analyticsData.insights.trendDirection === 'down' ? (
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                            ) : null}
                            <span className="text-lg font-semibold text-gray-900">
                              {analyticsData.insights.trendDirection === 'up' ? 'Improving' : 
                               analyticsData.insights.trendDirection === 'down' ? 'Declining' : 'Stable'}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 bg-green-100 rounded-full">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50/50 via-white to-white border border-purple-200/30">
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Daily Average</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            ${analyticsData.insights.averageDaily.toFixed(0)}
                          </p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Activity className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-50/50 via-white to-white border border-orange-200/30">
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Monthly Projection</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            ${analyticsData.insights.projectedMonthly.toFixed(0)}
                          </p>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-full">
                          <Target className="h-5 w-5 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Chart Navigation */}
              <div className="flex items-center gap-2 border-b border-gray-200">
                {[
                  { key: 'trends', label: 'Financial Trends', icon: Activity },
                  { key: 'categories', label: 'Category Breakdown', icon: PieChart },
                  { key: 'patterns', label: 'Weekly Patterns', icon: BarChart3 }
                ].map(({ key, label, icon: Icon }) => (
                  <Button
                    key={key}
                    variant="ghost"
                    className={`h-10 px-4 rounded-none border-b-2 transition-all ${
                      activeChart === key 
                        ? "border-blue-600 text-blue-600 bg-blue-50/50" 
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => setActiveChart(key as any)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>

              {/* Interactive Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart Area */}
                <div className="lg:col-span-2">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {activeChart === 'trends' && <Activity className="h-5 w-5 text-blue-600" />}
                        {activeChart === 'categories' && <PieChart className="h-5 w-5 text-purple-600" />}
                        {activeChart === 'patterns' && <BarChart3 className="h-5 w-5 text-green-600" />}
                        {activeChart === 'trends' && 'Income vs Expenses Trend'}
                        {activeChart === 'categories' && 'Expense Categories'}
                        {activeChart === 'patterns' && 'Weekly Spending Patterns'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <LoadingChart />
                      ) : !analyticsData ? (
                        <div className="h-80 flex items-center justify-center text-gray-500">
                          No data available for the selected period
                        </div>
                      ) : (
                        <div className="h-80">
                          {activeChart === 'trends' && (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={analyticsData.monthlyTrends}>
                                <defs>
                                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
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
                                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                  type="monotone"
                                  dataKey="income"
                                  stackId="1"
                                  stroke="#10B981"
                                  fill="url(#incomeGradient)"
                                  strokeWidth={2}
                                  onClick={(data) => handleChartClick(data, 'income')}
                                  style={{ cursor: 'pointer' }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="expenses"
                                  stackId="2"
                                  stroke="#EF4444"
                                  fill="url(#expenseGradient)"
                                  strokeWidth={2}
                                  onClick={(data) => handleChartClick(data, 'expenses')}
                                  style={{ cursor: 'pointer' }}
                                />
                                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="2 2" />
                                <Brush dataKey="month" height={30} stroke="#3B82F6" />
                              </AreaChart>
                            </ResponsiveContainer>
                          )}

                          {activeChart === 'categories' && (
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={analyticsData.categoryBreakdown}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={120}
                                  dataKey="value"
                                  onClick={(data) => handleChartClick(data, 'category')}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {analyticsData.categoryBreakdown.map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={entry.color || COLORS[index % COLORS.length]} 
                                    />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value: number, name: string) => [
                                    `$${value.toLocaleString()}`,
                                    name
                                  ]}
                                />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          )}

                          {activeChart === 'patterns' && (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analyticsData.weeklyPatterns}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis 
                                  dataKey="day" 
                                  tick={{ fontSize: 12, fill: '#64748b' }}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis 
                                  tick={{ fontSize: 12, fill: '#64748b' }}
                                  axisLine={false}
                                  tickLine={false}
                                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar 
                                  dataKey="amount" 
                                  fill="#3B82F6"
                                  radius={[4, 4, 0, 0]}
                                  onClick={(data) => handleChartClick(data, 'weekly')}
                                  style={{ cursor: 'pointer' }}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                  {/* Drill-down Info */}
                  {drillDownData && (
                    <Card className="bg-gradient-to-br from-yellow-50/50 via-white to-white border border-yellow-200/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Eye className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-gray-900">Drill-down Data</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Selected:</span>
                            <span className="font-medium">{drillDownData.name || drillDownData.month || drillDownData.day}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Value:</span>
                            <span className="font-medium">${(drillDownData.value || drillDownData.amount || 0).toLocaleString()}</span>
                          </div>
                          {drillDownData.percentage && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Percentage:</span>
                              <span className="font-medium">{drillDownData.percentage.toFixed(1)}%</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Category Details */}
                  {!isLoading && analyticsData && activeChart === 'categories' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Top Categories</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {analyticsData.categoryBreakdown.slice(0, 5).map((category, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="text-sm text-gray-900">{category.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  ${category.value.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {category.percentage.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {!isLoading && analyticsData && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Total Transactions</span>
                              <span className="font-medium">
                                {analyticsData.monthlyTrends.reduce((sum, month) => sum + month.transactionCount, 0)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Categories Used</span>
                              <span className="font-medium">{analyticsData.categoryBreakdown.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Most Active Day</span>
                              <span className="font-medium">
                                {analyticsData.weeklyPatterns.reduce((prev, current) => 
                                  (prev.count > current.count) ? prev : current
                                ).day}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 