"use client"

import { useAuth } from "@/lib/auth-context"
import { useDashboards } from "@/lib/dashboard-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker"
import { 
  PieChart,
  BarChart3,
  Activity,
  Download,
  Eye,
  Briefcase,
  Zap,
  Gauge,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2
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
import { IconRenderer } from "@/components/ui/icon-renderer"
import { getUserCurrency, formatCurrency, formatCurrencyShort, type CurrencyConfig } from "@/lib/currency"
import { DashboardIndicator } from "@/components/dashboard-indicator"
import { StatCard } from "@/components/ui/stat-card"
import { useSubscription } from "@/lib/subscription-context"
import { useRouter } from "next/navigation"

interface AnalyticsData {
  monthlyTrends: any[]
  categoryBreakdown: any[]
  weeklyPatterns: any[]
  comparisonData: any[]
  topExpenses: any[]
  topIncome: any[]
  insights: {
    topCategory: string
    trendDirection: 'up' | 'down' | 'stable'
    averageDaily: number
    projectedMonthly: number
    avgMonthlyIncome: number
    avgMonthlyExpenses: number
  }
  netCashFlow: number
  monthlyBurnRate: number
  runwayMonths: number
  profitMargin: number
  sankeyData: {
    nodes: { name: string }[]
    links: { source: number; target: number; value: number }[]
  }
  incomeCategoryBreakdown: any[]
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const { activeDashboard } = useDashboards()
  const { plan, isLoading: isSubscriptionLoading } = useSubscription()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("3months")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined)
  const [activeChart, setActiveChart] = useState<'trends' | 'categories' | 'patterns'>('trends')
  const [drillDownData, setDrillDownData] = useState<any>(null)
  const [topTransactionType, setTopTransactionType] = useState<'expenses' | 'income'>('expenses')
  const [userCurrency, setUserCurrency] = useState<CurrencyConfig | null>(null)
  const [activeBreakdown, setActiveBreakdown] = useState<'expense' | 'income'>('expense');

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

  const fetchAnalyticsData = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Dashboard filter: null for main dashboard, specific ID for custom dashboards
      const dashboardFilter = activeDashboard?.id || null
      
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

      // Fetch all transactions in the period with dashboard filter
      let transactionQuery = supabase
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

      // Apply dashboard filter
      if (dashboardFilter) {
        transactionQuery = transactionQuery.eq('dashboard_id', dashboardFilter)
      } else {
        transactionQuery = transactionQuery.is('dashboard_id', null)
      }

      const { data: transactions } = await transactionQuery

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

      const totalExpensesCategories = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.value, 0)
      const categoryBreakdown = Array.from(categoryMap.values())
        .map(cat => ({
          ...cat,
          percentage: totalExpensesCategories > 0 ? (cat.value / totalExpensesCategories) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8) // Top 8 categories

      // Generate income category breakdown
      const incomeCategoryMap = new Map()
      transactions.filter(t => t.type === 'income').forEach(t => {
        const categoryName = t.categories?.name || 'Uncategorized'
        const categoryColor = t.categories?.color || '#6B7280'
        
        if (incomeCategoryMap.has(categoryName)) {
          incomeCategoryMap.get(categoryName).value += Number(t.amount)
          incomeCategoryMap.get(categoryName).count += 1
        } else {
          incomeCategoryMap.set(categoryName, {
            name: categoryName,
            value: Number(t.amount),
            count: 1,
            color: categoryColor,
            percentage: 0
          })
        }
      })

      const totalIncomeForBreakdown = Array.from(incomeCategoryMap.values()).reduce((sum, cat) => sum + cat.value, 0)
      const incomeCategoryBreakdown = Array.from(incomeCategoryMap.values())
        .map(cat => ({
          ...cat,
          percentage: totalIncomeForBreakdown > 0 ? (cat.value / totalIncomeForBreakdown) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8)

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

      // --- Business-level metrics ---
      const totalIncomeAmount = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const netCashFlow = totalIncomeAmount - totalExpensesCategories
      // Placeholder monthlyBurnRate, will be calculated after avgMonthlyExpenses
      let monthlyBurnRate = 0
      let runwayMonths = monthlyBurnRate > 0 && netCashFlow > 0
        ? +(netCashFlow / monthlyBurnRate).toFixed(1)
        : 0
      const profitMargin = totalIncomeAmount > 0
        ? +((netCashFlow / totalIncomeAmount) * 100).toFixed(1)
        : 0

      // Sankey data (Income -> Expense categories & Savings)
      const sankeyNodes: { name: string }[] = [{ name: 'Total Income' }]
      const sankeyLinks: { source: number; target: number; value: number }[] = []

      // Add expense categories as nodes and links
      categoryBreakdown.forEach((cat, idx) => {
        sankeyNodes.push({ name: cat.name })
        sankeyLinks.push({ source: 0, target: idx + 1, value: cat.value })
      })

      const leftover = netCashFlow > 0 ? netCashFlow : 0
      if (leftover > 0) {
        const savingsIndex = sankeyNodes.length
        sankeyNodes.push({ name: 'Savings' })
        sankeyLinks.push({ source: 0, target: savingsIndex, value: leftover })
      }

      // --- End Business-level metrics ---

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

      // Calculate average monthly income and expenses
      const avgMonthlyIncome = monthlyTrends.length > 0 
        ? Math.round(monthlyTrends.reduce((sum, m) => sum + m.income, 0) / monthlyTrends.length)
        : 0
      
      const avgMonthlyExpenses = monthlyTrends.length > 0 
        ? Math.round(monthlyTrends.reduce((sum, m) => sum + m.expenses, 0) / monthlyTrends.length)
        : 0

      // Update monthlyBurnRate based on calculated avgMonthlyExpenses
      monthlyBurnRate = avgMonthlyExpenses
      runwayMonths = monthlyBurnRate > 0 && netCashFlow > 0
        ? +(netCashFlow / monthlyBurnRate).toFixed(1)
        : 0

      setAnalyticsData({
        monthlyTrends,
        categoryBreakdown,
        weeklyPatterns,
        comparisonData: monthlyTrends.slice(-6), // Last 6 months for comparison
        topExpenses,
        topIncome,
        netCashFlow,
        monthlyBurnRate,
        runwayMonths,
        profitMargin,
        sankeyData: {
          nodes: sankeyNodes,
          links: sankeyLinks
        },
        insights: {
          topCategory,
          trendDirection,
          averageDaily,
          projectedMonthly,
          avgMonthlyIncome,
          avgMonthlyExpenses
        },
        incomeCategoryBreakdown,
      })
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedPeriod, customDateRange, activeDashboard])

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
    }
  }, [user, fetchAnalyticsData])

  if (loading || isSubscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    redirect("/")
  }

  // Block access for users without advanced analytics
  if (!plan.hasAdvancedAnalytics) {
    return (
      <div className="flex h-screen bg-gray-50/50">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="bg-white p-8 rounded-lg shadow-md border border-yellow-200">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Upgrade to Unlock Analytics</h2>
            <p className="text-gray-600 mb-6">The Analytics page is a premium feature. Upgrade your plan to gain access to advanced insights.</p>
            <Button onClick={() => router.push('/#pricing')}>
              <TrendingUp className="h-4 w-4 mr-2" />
              View Plans
            </Button>
          </div>
        </div>
      </div>
    )
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
              <span className="font-medium">${Math.round(entry.value || 0).toLocaleString()}</span>
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
        <main className="flex-1 overflow-auto p-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 min-h-full">
          <div className="max-w-7xl mx-auto space-y-3">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Business Analytics</h1>
                  <p className="text-gray-600 text-xs mt-1">Advanced insights into your financial patterns</p>
              </div>
              <div className="flex items-center gap-2">
                  <DashboardIndicator />
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
                        className={`h-7 px-2 text-xs transition-all ${
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
                    className="h-7 text-xs"
                    placeholder="Custom range"
                  />
                  
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>

              {/* Key Insights Cards */}
              {!isLoading && analyticsData && (
                <div className="space-y-3">
                  {/* Business KPI Row */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Net Cash Flow" value={userCurrency ? formatCurrency(analyticsData.netCashFlow, userCurrency) : '...'} valueClassName={analyticsData.netCashFlow >=0 ? 'text-green-600':'text-red-600'} icon={<Briefcase className="h-4 w-4 text-blue-500"/>} />
                    <StatCard title="Monthly Burn Rate" value={userCurrency ? formatCurrency(analyticsData.monthlyBurnRate, userCurrency) : '...'} icon={<Zap className="h-4 w-4 text-orange-500"/>} />
                    <StatCard title="Runway" value={`${analyticsData.runwayMonths.toFixed(1)}`} unit=" mo" icon={<Gauge className="h-4 w-4 text-indigo-500"/>} />
                    <StatCard title="Profit Margin" value={`${analyticsData.profitMargin.toFixed(1)}`} unit="%" icon={<TrendingUp className="h-4 w-4 text-green-500"/>} />
                          </div>

                  {/* Standard Metrics Row */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                    <StatCard title="Avg Monthly Income" value={userCurrency ? formatCurrency(analyticsData.insights.avgMonthlyIncome, userCurrency) : '...'} icon={<TrendingUp className="h-4 w-4 text-green-500"/>} />
                    <StatCard title="Avg Monthly Expenses" value={userCurrency ? formatCurrency(analyticsData.insights.avgMonthlyExpenses, userCurrency) : '...'} icon={<TrendingDown className="h-4 w-4 text-red-500"/>} />
                    <StatCard title="Daily Avg Expense" value={userCurrency ? formatCurrency(analyticsData.insights.averageDaily, userCurrency) : '...'} icon={<DollarSign className="h-4 w-4 text-yellow-600"/>} />
                    <StatCard title="Monthly Projection" value={userCurrency ? formatCurrency(analyticsData.insights.projectedMonthly, userCurrency) : '...'} icon={<BarChart2 className="h-4 w-4 text-purple-500"/>} />
                  </div>
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
                      {activeChart === 'categories' ? (
                        <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-purple-600" />
                            {activeBreakdown === 'expense' ? 'Expense Categories' : 'Income Sources'}
                      </CardTitle>
                          <div className="flex items-center gap-2">
                            <Button variant={activeBreakdown === 'expense' ? 'default' : 'outline'} size="sm" onClick={() => setActiveBreakdown('expense')}>Expenses</Button>
                            <Button variant={activeBreakdown === 'income' ? 'default' : 'outline'} size="sm" onClick={() => setActiveBreakdown('income')}>Income</Button>
                          </div>
                        </div>
                      ) : (
                        <CardTitle className="flex items-center gap-2">
                          {activeChart === 'trends' && <><Activity className="h-5 w-5 text-blue-600" /><span>Income vs Expenses Trend</span></>}
                          {activeChart === 'patterns' && <><BarChart3 className="h-5 w-5 text-green-600" /><span>Weekly Spending Patterns</span></>}
                        </CardTitle>
                      )}
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
                                  tickFormatter={(value) => userCurrency ? formatCurrencyShort(value, userCurrency) : `€${(value / 1000).toFixed(0)}k`}
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
                                  data={activeBreakdown === 'expense' ? analyticsData.categoryBreakdown : analyticsData.incomeCategoryBreakdown}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={120}
                                  dataKey="value"
                                  onClick={(data) => handleChartClick(data, 'category')}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {(activeBreakdown === 'expense' ? analyticsData.categoryBreakdown : analyticsData.incomeCategoryBreakdown).map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={entry.color || COLORS[index % COLORS.length]} 
                                    />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value: number, name: string) => [
                                    userCurrency ? formatCurrency(value, userCurrency) : `€${value.toLocaleString()}`,
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
                                  tickFormatter={(value) => userCurrency ? formatCurrency(value, userCurrency) : `€${value.toFixed(0)}`}
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
                            <span className="font-medium">{userCurrency ? formatCurrency(drillDownData.value || drillDownData.amount || 0, userCurrency) : `€${(drillDownData.value || drillDownData.amount || 0).toLocaleString()}`}</span>
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
                        <CardTitle className="text-lg">
                          {activeBreakdown === 'expense' ? 'Top Categories' : 'Top Income Sources'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {(activeBreakdown === 'expense' ? analyticsData.categoryBreakdown : analyticsData.incomeCategoryBreakdown).slice(0, 5).map((category, index) => (
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
                                  {userCurrency ? formatCurrency(category.value, userCurrency) : `€${category.value.toLocaleString()}`}
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
                                {analyticsData.monthlyTrends?.reduce((sum, month) => sum + month.transactionCount, 0) || 0}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Categories Used</span>
                              <span className="font-medium">
                                {activeBreakdown === 'expense' 
                                ? analyticsData.categoryBreakdown.length 
                                : analyticsData.incomeCategoryBreakdown.length}
                              </span>
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

            {/* Top Expenses/Income Table */}
            <div className="mt-6">
              <Card className="border border-gray-200">
                <CardHeader className="pb-2 px-4 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-orange-600" />
                      {topTransactionType === 'expenses' ? 'Top Expenses' : 'Top Income'}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={topTransactionType === 'expenses' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTopTransactionType('expenses')}
                        className="h-8 px-3 py-2 text-sm"
                      >
                        Expenses
                      </Button>
                      <Button
                        variant={topTransactionType === 'income' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTopTransactionType('income')}
                        className="h-8 px-3 py-2 text-sm"
                      >
                        Income
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-4 space-y-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : (analyticsData?.topExpenses && analyticsData.topExpenses.length > 0) || (analyticsData?.topIncome && analyticsData.topIncome.length > 0) ? (
                    <>
                      <div className="px-6 py-3 border-b border-gray-200/60 bg-gray-50/30">
                        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                          <div className="col-span-4 flex items-center">Description</div>
                          <div className="col-span-2 flex items-center">Date</div>
                          <div className="col-span-3 flex items-center">Category</div>
                          <div className="col-span-3 flex items-center justify-end">Amount</div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100/60">
                        {(topTransactionType === 'expenses' ? analyticsData?.topExpenses : analyticsData?.topIncome)?.slice(0, 10).map((transaction, index) => (
                          <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                            <div className="grid grid-cols-12 gap-4 items-center">
                              <div className="col-span-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm" style={{ backgroundColor: transaction.categories?.color }}>
                                    <IconRenderer 
                                      iconName={transaction.icon} 
                                      className="h-4 w-4 text-white"
                                      fallbackColor="white"
                                    />
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 truncate">{transaction.description}</span>
                                </div>
                              </div>
                              <div className="col-span-2 flex items-center">
                                <span className="text-sm text-gray-600">
                                  {new Date(transaction.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="col-span-3 flex items-center">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: transaction.categories?.color }} />
                                  <span className="text-sm text-gray-600 truncate">{transaction.categories?.name}</span>
                                </div>
                              </div>
                              <div className="col-span-3 flex items-center justify-end">
                                <span className={`text-sm font-semibold ${
                                  topTransactionType === 'expenses' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {topTransactionType === 'expenses' ? '-' : '+'}{userCurrency ? formatCurrency(Number(transaction.amount), userCurrency).replace(/^[+\-]/, '') : `€${Number(transaction.amount).toLocaleString()}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No {topTransactionType} data</h3>
                      <p className="text-sm text-gray-500">Add some {topTransactionType} to see analytics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Cash Flow Sankey Chart removed as per user request */}

          </div>
        </main>
      </div>
    </div>
  )
} 