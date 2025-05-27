"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  ArrowUp,
  ArrowDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Activity,
  DollarSign,
  Percent
} from "lucide-react"

export default function AnalyticsPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/")
  }

  // Static data for now - will be replaced with real data from database
  const spendingTrends = [
    { period: "Jan", amount: 3800, change: -5.2 },
    { period: "Feb", amount: 4100, change: 7.9 },
    { period: "Mar", amount: 3900, change: -4.9 },
    { period: "Apr", amount: 4200, change: 7.7 },
    { period: "May", amount: 3950, change: -6.0 },
    { period: "Jun", amount: 4050, change: 2.5 },
  ]

  const categoryInsights = [
    {
      category: "Food & Dining",
      currentSpend: 485.20,
      lastMonth: 420.15,
      budget: 600,
      trend: "increasing",
      insight: "Spending increased by 15% from last month"
    },
    {
      category: "Transportation",
      currentSpend: 245.80,
      lastMonth: 268.90,
      budget: 300,
      trend: "decreasing",
      insight: "Spending decreased by 9% - good progress!"
    },
    {
      category: "Entertainment",
      currentSpend: 156.40,
      lastMonth: 189.25,
      budget: 200,
      trend: "decreasing",
      insight: "Reduced entertainment spending by 17%"
    },
    {
      category: "Utilities",
      currentSpend: 324.50,
      lastMonth: 312.80,
      budget: 350,
      trend: "increasing",
      insight: "Slight increase due to winter heating"
    }
  ]

  const alerts = [
    {
      type: "warning",
      title: "Budget Alert: Food & Dining",
      message: "You've spent 81% of your monthly budget with 5 days remaining",
      severity: "medium"
    },
    {
      type: "success",
      title: "Goal Achievement",
      message: "You're on track to meet your savings goal this month!",
      severity: "low"
    },
    {
      type: "info",
      title: "Spending Pattern",
      message: "Your weekend spending is 40% higher than weekdays",
      severity: "low"
    },
    {
      type: "warning",
      title: "Subscription Review",
      message: "3 subscriptions haven't been used in the last 30 days",
      severity: "high"
    }
  ]

  const financialHealth = {
    score: 78,
    factors: [
      { name: "Emergency Fund", score: 85, status: "good" },
      { name: "Debt-to-Income", score: 72, status: "fair" },
      { name: "Savings Rate", score: 88, status: "excellent" },
      { name: "Budget Adherence", score: 65, status: "fair" }
    ]
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      default:
        return <Activity className="h-5 w-5 text-blue-600" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Analytics" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Financial Analytics</h1>
                <p className="text-gray-600 mt-1">Deep insights into your spending patterns and financial health</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last 6 months
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Financial Health Score */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Financial Health Score</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-3xl font-bold ${getScoreColor(financialHealth.score)}`}>
                      {financialHealth.score}
                    </span>
                    <span className="text-gray-500">/100</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {financialHealth.factors.map((factor, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{factor.name}</span>
                        <span className={`text-sm font-semibold ${getScoreColor(factor.score)}`}>
                          {factor.score}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${getScoreBgColor(factor.score)}`}
                          style={{ width: `${factor.score}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{factor.status}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Spending Trends */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Spending Trends</h3>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </div>
                    
                    <div className="space-y-4">
                      {spendingTrends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              trend.change > 0 ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                              {trend.change > 0 ? (
                                <TrendingUp className="h-5 w-5 text-red-600" />
                              ) : (
                                <TrendingDown className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{trend.period} 2024</p>
                              <p className="text-sm text-gray-500">${trend.amount.toLocaleString()} spent</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`flex items-center gap-1 ${
                              trend.change > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {trend.change > 0 ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : (
                                <ArrowDown className="h-4 w-4" />
                              )}
                              <span className="font-semibold">{Math.abs(trend.change)}%</span>
                            </div>
                            <p className="text-xs text-gray-500">vs prev month</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts */}
              <div>
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Alerts & Insights</h3>
                      <span className="text-sm text-gray-500">{alerts.length} active</span>
                    </div>
                    
                    <div className="space-y-4">
                      {alerts.map((alert, index) => (
                        <div key={index} className="p-3 rounded-lg border border-gray-200 space-y-2">
                          <div className="flex items-start gap-3">
                            {getAlertIcon(alert.type)}
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Category Insights */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryInsights.map((category, index) => {
                  const changePercent = ((category.currentSpend - category.lastMonth) / category.lastMonth) * 100
                  const budgetUsed = (category.currentSpend / category.budget) * 100
                  
                  return (
                    <Card key={index} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-gray-900">{category.category}</h3>
                          <div className={`flex items-center gap-1 ${
                            category.trend === 'increasing' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {category.trend === 'increasing' ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="text-sm font-semibold">{Math.abs(changePercent).toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Current Month</span>
                            <span className="font-semibold">${category.currentSpend.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Last Month</span>
                            <span className="text-sm text-gray-600">${category.lastMonth.toFixed(2)}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Budget Usage</span>
                              <span className="text-sm font-medium">{budgetUsed.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  budgetUsed > 80 ? 'bg-red-500' : budgetUsed > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-600">{category.insight}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Daily Spend</p>
                      <p className="text-2xl font-bold text-gray-900">$127.50</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Percent className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Budget Efficiency</p>
                      <p className="text-2xl font-bold text-gray-900">87%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Goals on Track</p>
                      <p className="text-2xl font-bold text-gray-900">3/4</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Categories</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
} 