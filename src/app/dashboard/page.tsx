"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MoreHorizontal,
  Filter,
  Download,
  Zap,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Activity,
  Sparkles,
  Clock,
  ChevronRight
} from "lucide-react"
import { useState, useEffect } from "react"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/")
  }

  // Advanced financial data with intelligent calculations
  const monthlyData = [
    { month: "Jan", income: 7200, expenses: 4800, budget: 5000, forecast: 5100 },
    { month: "Feb", income: 7350, expenses: 5100, budget: 5000, forecast: 5050 },
    { month: "Mar", income: 7200, expenses: 4900, budget: 5000, forecast: 5200 },
    { month: "Apr", income: 7500, expenses: 5200, budget: 5200, forecast: 5300 },
    { month: "May", income: 7300, expenses: 4950, budget: 5000, forecast: 5150 },
    { month: "Jun", income: 8420, expenses: 5847, budget: 5500, forecast: 5600 },
  ]

  const categoryData = [
    { name: "Housing", value: 2200, percentage: 38, color: "#3B82F6", trend: 2.3, budget: 2300 },
    { name: "Food", value: 850, percentage: 15, color: "#10B981", trend: -5.1, budget: 800 },
    { name: "Transport", value: 650, percentage: 11, color: "#F59E0B", trend: 8.2, budget: 700 },
    { name: "Entertainment", value: 420, percentage: 7, color: "#8B5CF6", trend: -12.4, budget: 500 },
    { name: "Utilities", value: 380, percentage: 7, color: "#EF4444", trend: 15.8, budget: 350 },
    { name: "Shopping", value: 580, percentage: 10, color: "#06B6D4", trend: 23.1, budget: 450 },
    { name: "Other", value: 720, percentage: 12, color: "#84CC16", trend: -3.2, budget: 700 },
  ]

  const recentTransactions = [
    { id: 1, description: "Salary Deposit", amount: 8420.00, type: "income", date: "Dec 30", category: "Salary", time: "09:00" },
    { id: 2, description: "Rent Payment", amount: -2200.00, type: "expense", date: "Dec 30", category: "Housing", time: "08:30" },
    { id: 3, description: "Grocery Shopping", amount: -127.45, type: "expense", date: "Dec 29", category: "Food", time: "18:45" },
    { id: 4, description: "Electric Bill", amount: -124.50, type: "expense", date: "Dec 28", category: "Utilities", time: "14:20" },
    { id: 5, description: "Coffee Shop", amount: -8.50, type: "expense", date: "Dec 28", category: "Food", time: "11:15" },
  ]

  const currentMonth = monthlyData[monthlyData.length - 1]
  const previousMonth = monthlyData[monthlyData.length - 2]
  const netIncome = currentMonth.income - currentMonth.expenses
  const budgetUsage = (currentMonth.expenses / currentMonth.budget) * 100
  
  // Smart calculations
  const incomeChange = ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100
  const expenseChange = ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
  const netIncomeChange = ((netIncome - (previousMonth.income - previousMonth.expenses)) / (previousMonth.income - previousMonth.expenses)) * 100

  // Financial Health Score
  const healthScore = Math.round(
    (30 * Math.min(netIncome / 3000, 1)) + // Savings capacity
    (25 * Math.max(1 - (budgetUsage / 100), 0)) + // Budget adherence
    (25 * 0.68) + // Emergency fund (68%)
    (20 * 0.85) // Debt ratio
  )

  // Smart Insights
  const insights = [
    {
      type: "warning",
      title: "Weekend Spending Alert",
      message: "You spend 40% more on weekends. Consider setting weekend budgets.",
      action: "Set Limits"
    },
    {
      type: "success", 
      title: "Great Progress!",
      message: "You&apos;re on track to save $2,573 this month - 18% above target.",
      action: "View Goal"
    },
    {
      type: "info",
      title: "Subscription Review",
      message: "3 subscriptions unused in 30 days. Potential savings: $47/month.",
      action: "Review"
    }
  ]

  const LoadingCard = ({ className }: { className?: string }) => (
    <Card className={`bg-white border-0 shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
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
            
            {/* Header with Quick Filters */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {session.user?.name?.split(' ')[0] || 'there'}
                </h1>
                <p className="text-gray-600 mt-1">Here&apos;s your financial overview for June 2024</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1">
                  {["week", "month", "quarter"].map((period) => (
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

            {/* Financial Health Score */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-lg text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5" />
                      <span className="text-sm font-medium opacity-90">Financial Health Score</span>
                    </div>
                    <div className="text-4xl font-bold mb-1">{healthScore}/100</div>
                    <div className="text-sm opacity-75">Excellent financial health</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-semibold">+5 this month</span>
                    </div>
                    <div className="w-20 h-20 relative">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeDasharray={`${healthScore}, 100`}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6">
              
              {/* Top Row - Key Metrics */}
              <div className="col-span-3">
                {isLoading ? (
                  <LoadingCard />
                ) : (
                  <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Income</h3>
                        <div className={`flex items-center ${incomeChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {incomeChange >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                          <span className="text-sm font-semibold">{incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-gray-900">
                          ${currentMonth.income.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          vs ${previousMonth.income.toLocaleString()} last month
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="col-span-3">
                {isLoading ? (
                  <LoadingCard />
                ) : (
                  <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Expenses</h3>
                        <div className={`flex items-center ${expenseChange >= 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {expenseChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          <span className="text-sm font-semibold">{expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-gray-900">
                          ${currentMonth.expenses.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          vs ${previousMonth.expenses.toLocaleString()} last month
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="col-span-3">
                {isLoading ? (
                  <LoadingCard />
                ) : (
                  <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Net Income</h3>
                        <div className={`flex items-center ${netIncomeChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {netIncomeChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                          <span className="text-sm font-semibold">{netIncomeChange >= 0 ? '+' : ''}{netIncomeChange.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-gray-900">
                          ${netIncome.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Saved this month
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="col-span-3">
                {isLoading ? (
                  <LoadingCard />
                ) : (
                  <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Budget Usage</h3>
                        <div className="flex items-center text-orange-600">
                          <span className="text-sm font-semibold">{budgetUsage.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-3xl font-bold text-gray-900">
                          ${currentMonth.budget.toLocaleString()}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              budgetUsage > 100 ? 'bg-red-500' : budgetUsage > 80 ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                          />
                          {budgetUsage > 100 && (
                            <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${(currentMonth.budget - currentMonth.expenses).toLocaleString()} remaining
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Second Row */}
              {/* Enhanced Monthly Trends Chart */}
              <div className="col-span-8">
                <Card className="bg-white border-0 shadow-sm h-96">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Monthly Financial Trends</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Forecast enabled
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Chart Container with Tooltip */}
                    <div className="h-64 relative">
                      <div className="absolute inset-0 flex items-end justify-between px-4">
                        {monthlyData.map((data, index) => {
                          const maxValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses, d.budget, d.forecast)))
                          const incomeHeight = (data.income / maxValue) * 100
                          const expenseHeight = (data.expenses / maxValue) * 100
                          const budgetHeight = (data.budget / maxValue) * 100
                          const forecastHeight = (data.forecast / maxValue) * 100
                          
                          return (
                            <div 
                              key={index} 
                              className="flex flex-col items-center space-y-2 relative"
                              onMouseEnter={() => setActiveTooltip(`chart-${index}`)}
                              onMouseLeave={() => setActiveTooltip(null)}
                            >
                              <div className="flex items-end space-x-1" style={{ height: '200px' }}>
                                {/* Income Bar */}
                                <div 
                                  className="w-4 bg-emerald-500 rounded-t hover:bg-emerald-600 transition-colors cursor-pointer"
                                  style={{ height: `${incomeHeight}%` }}
                                  title={`Income: $${data.income}`}
                                />
                                {/* Expense Bar */}
                                <div 
                                  className="w-4 bg-red-500 rounded-t hover:bg-red-600 transition-colors cursor-pointer"
                                  style={{ height: `${expenseHeight}%` }}
                                  title={`Expenses: $${data.expenses}`}
                                />
                                {/* Budget Line */}
                                <div 
                                  className="w-4 bg-blue-400 rounded-t hover:bg-blue-500 transition-colors cursor-pointer"
                                  style={{ height: `${budgetHeight}%` }}
                                  title={`Budget: $${data.budget}`}
                                />
                                {/* Forecast (dashed) */}
                                <div 
                                  className="w-4 bg-purple-400 rounded-t opacity-60 hover:opacity-80 transition-opacity cursor-pointer"
                                  style={{ height: `${forecastHeight}%` }}
                                  title={`Forecast: $${data.forecast}`}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-600">{data.month}</span>
                              
                              {/* Tooltip */}
                              {activeTooltip === `chart-${index}` && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded-lg p-3 z-10 whitespace-nowrap">
                                  <div className="space-y-1">
                                    <div>Income: ${data.income.toLocaleString()}</div>
                                    <div>Expenses: ${data.expenses.toLocaleString()}</div>
                                    <div>Budget: ${data.budget.toLocaleString()}</div>
                                    <div>Forecast: ${data.forecast.toLocaleString()}</div>
                                  </div>
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* Enhanced Legend */}
                    <div className="flex justify-center items-center space-x-6 mt-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                        <span className="text-sm text-gray-600">Income</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-sm text-gray-600">Expenses</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-400 rounded"></div>
                        <span className="text-sm text-gray-600">Budget</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-400 rounded opacity-60"></div>
                        <span className="text-sm text-gray-600">Forecast</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Smart Insights */}
              <div className="col-span-4">
                <Card className="bg-white border-0 shadow-sm h-96">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Smart Insights</h3>
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-gray-500">AI-powered</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {insights.map((insight, index) => (
                        <div 
                          key={index} 
                          className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              insight.type === 'warning' ? 'bg-orange-100' :
                              insight.type === 'success' ? 'bg-emerald-100' : 'bg-blue-100'
                            }`}>
                              {insight.type === 'warning' ? (
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                              ) : insight.type === 'success' ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Zap className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-gray-900 mb-1">{insight.title}</h4>
                              <p className="text-xs text-gray-600 mb-3">{insight.message}</p>
                              <Button variant="ghost" size="sm" className="h-7 px-3 text-xs">
                                {insight.action}
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Donut Chart */}
              <div className="col-span-5">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Interactive Donut Chart */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-48 h-48">
                        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke="#f3f4f6"
                            strokeWidth="6"
                          />
                          {(() => {
                            let cumulativePercentage = 0
                            return categoryData.map((category, index) => {
                              const strokeDasharray = `${category.percentage * 2.51} ${251.2 - category.percentage * 2.51}`
                              const strokeDashoffset = -cumulativePercentage * 2.51
                              cumulativePercentage += category.percentage
                              
                              return (
                                <circle
                                  key={index}
                                  cx="50"
                                  cy="50"
                                  r="40"
                                  fill="transparent"
                                  stroke={category.color}
                                  strokeWidth="6"
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  className="transition-all duration-300 hover:stroke-8 cursor-pointer"
                                  onMouseEnter={() => setActiveTooltip(`donut-${index}`)}
                                  onMouseLeave={() => setActiveTooltip(null)}
                                />
                              )
                            })
                          })()}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              ${categoryData.reduce((sum, cat) => sum + cat.value, 0).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">Total Expenses</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Category List */}
                    <div className="space-y-3">
                      {categoryData.slice(0, 5).map((category, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-gray-900 font-medium">{category.name}</span>
                            <div className={`flex items-center text-xs ${
                              category.trend >= 0 ? 'text-red-600' : 'text-emerald-600'
                            }`}>
                              {category.trend >= 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {Math.abs(category.trend).toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">${category.value}</div>
                            <div className="text-xs text-gray-500">{category.percentage}% of total</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Recent Transactions */}
              <div className="col-span-7">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          Real-time
                        </Badge>
                        <Button variant="ghost" size="sm">View All</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {recentTransactions.map((transaction) => (
                        <div 
                          key={transaction.id} 
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110 ${
                              transaction.type === 'income' ? 'bg-emerald-100 group-hover:bg-emerald-200' : 'bg-gray-100 group-hover:bg-gray-200'
                            }`}>
                              {transaction.type === 'income' ? (
                                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                              ) : (
                                <ArrowDownRight className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-gray-700">
                                {transaction.description}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span>{transaction.category}</span>
                                <span>•</span>
                                <span>{transaction.date}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {transaction.time}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold transition-colors ${
                              transaction.type === 'income' ? 'text-emerald-600' : 'text-gray-900'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transaction.type === 'income' ? 'Received' : 'Spent'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 right-8">
              <Button 
                size="lg" 
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
} 