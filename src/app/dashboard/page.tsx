"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  MoreHorizontal,
  Calendar,
  Filter,
  Download
} from "lucide-react"

export default function Dashboard() {
  const { data: session, status } = useSession()

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

  // Advanced financial data
  const monthlyData = [
    { month: "Jan", income: 7200, expenses: 4800, budget: 5000 },
    { month: "Feb", income: 7350, expenses: 5100, budget: 5000 },
    { month: "Mar", income: 7200, expenses: 4900, budget: 5000 },
    { month: "Apr", income: 7500, expenses: 5200, budget: 5200 },
    { month: "May", income: 7300, expenses: 4950, budget: 5000 },
    { month: "Jun", income: 8420, expenses: 5847, budget: 5500 },
  ]

  const categoryData = [
    { name: "Housing", value: 2200, percentage: 38, color: "#3B82F6" },
    { name: "Food", value: 850, percentage: 15, color: "#10B981" },
    { name: "Transport", value: 650, percentage: 11, color: "#F59E0B" },
    { name: "Entertainment", value: 420, percentage: 7, color: "#8B5CF6" },
    { name: "Utilities", value: 380, percentage: 7, color: "#EF4444" },
    { name: "Shopping", value: 580, percentage: 10, color: "#06B6D4" },
    { name: "Other", value: 720, percentage: 12, color: "#84CC16" },
  ]

  const recentTransactions = [
    { id: 1, description: "Salary Deposit", amount: 8420.00, type: "income", date: "Dec 30", category: "Salary" },
    { id: 2, description: "Rent Payment", amount: -2200.00, type: "expense", date: "Dec 30", category: "Housing" },
    { id: 3, description: "Grocery Shopping", amount: -127.45, type: "expense", date: "Dec 29", category: "Food" },
    { id: 4, description: "Electric Bill", amount: -124.50, type: "expense", date: "Dec 28", category: "Utilities" },
    { id: 5, description: "Coffee Shop", amount: -8.50, type: "expense", date: "Dec 28", category: "Food" },
  ]

  const currentMonth = monthlyData[monthlyData.length - 1]
  const netIncome = currentMonth.income - currentMonth.expenses
  const budgetUsage = (currentMonth.expenses / currentMonth.budget) * 100

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
                  Welcome back, {session.user?.name?.split(' ')[0] || 'there'}
                </h1>
                <p className="text-gray-600 mt-1">Here&apos;s your financial overview for June 2024</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  June 2024
                </Button>
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

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-6">
              
              {/* Top Row - Key Metrics */}
              <div className="col-span-3">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Income</h3>
                      <div className="flex items-center text-emerald-600">
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        <span className="text-sm font-semibold">+12%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-gray-900">
                        ${currentMonth.income.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">This month</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-3">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Expenses</h3>
                      <div className="flex items-center text-red-600">
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                        <span className="text-sm font-semibold">+8%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-gray-900">
                        ${currentMonth.expenses.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">This month</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-3">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Net Income</h3>
                      <div className="flex items-center text-blue-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span className="text-sm font-semibold">+18%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-gray-900">
                        ${netIncome.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">This month</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="col-span-3">
                <Card className="bg-white border-0 shadow-sm">
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
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            budgetUsage > 100 ? 'bg-red-500' : budgetUsage > 80 ? 'bg-orange-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Second Row */}
              {/* Monthly Trends Chart */}
              <div className="col-span-8">
                <Card className="bg-white border-0 shadow-sm h-96">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Monthly Financial Trends</h3>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Chart Container */}
                    <div className="h-64 relative">
                      <div className="absolute inset-0 flex items-end justify-between px-4">
                        {monthlyData.map((data, index) => {
                          const maxValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses, d.budget)))
                          const incomeHeight = (data.income / maxValue) * 100
                          const expenseHeight = (data.expenses / maxValue) * 100
                          const budgetHeight = (data.budget / maxValue) * 100
                          
                          return (
                            <div key={index} className="flex flex-col items-center space-y-2">
                              <div className="flex items-end space-x-1" style={{ height: '200px' }}>
                                {/* Income Bar */}
                                <div 
                                  className="w-4 bg-emerald-500 rounded-t"
                                  style={{ height: `${incomeHeight}%` }}
                                  title={`Income: $${data.income}`}
                                />
                                {/* Expense Bar */}
                                <div 
                                  className="w-4 bg-red-500 rounded-t"
                                  style={{ height: `${expenseHeight}%` }}
                                  title={`Expenses: $${data.expenses}`}
                                />
                                {/* Budget Line */}
                                <div 
                                  className="w-4 bg-blue-400 rounded-t"
                                  style={{ height: `${budgetHeight}%` }}
                                  title={`Budget: $${data.budget}`}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-600">{data.month}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    
                    {/* Legend */}
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
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Expense Categories Donut */}
              <div className="col-span-4">
                <Card className="bg-white border-0 shadow-sm h-96">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Donut Chart */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-40 h-40">
                        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke="#f3f4f6"
                            strokeWidth="8"
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
                                  strokeWidth="8"
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  className="transition-all duration-300 hover:stroke-width-10"
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
                            <div className="text-sm text-gray-500">Total</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Category List */}
                    <div className="space-y-2">
                      {categoryData.slice(0, 4).map((category, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-gray-600">{category.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">${category.value}</span>
                            <span className="text-gray-500">{category.percentage}%</span>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-gray-100">
                        <Button variant="ghost" size="sm" className="w-full text-xs">
                          View all categories
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              <div className="col-span-8">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">View All</Button>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Transaction
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.type === 'income' ? 'bg-emerald-100' : 'bg-gray-100'
                            }`}>
                              {transaction.type === 'income' ? (
                                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                              ) : (
                                <ArrowDownRight className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{transaction.description}</div>
                              <div className="text-sm text-gray-500">{transaction.category} • {transaction.date}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${
                              transaction.type === 'income' ? 'text-emerald-600' : 'text-gray-900'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="col-span-4">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Savings Rate</span>
                          <span className="text-sm font-semibold text-gray-900">30.5%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full w-1/3"></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Emergency Fund</span>
                          <span className="text-sm font-semibold text-gray-900">68%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full w-2/3"></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Investment Goal</span>
                          <span className="text-sm font-semibold text-gray-900">45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full w-1/2"></div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">$11,240</div>
                          <div className="text-sm text-gray-500">Total Savings</div>
                        </div>
                      </div>
                    </div>
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