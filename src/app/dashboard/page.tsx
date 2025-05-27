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
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  MoreHorizontal,
  CreditCard,
  Coffee,
  Car,
  Home,
  ShoppingBag
} from "lucide-react"

export default function Dashboard() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/")
  }

  // Static data - will be replaced with real data
  const balance = 24285.32
  const monthlyIncome = 8420.00
  const monthlyExpenses = 5847.50
  const savingsGoal = 15000
  const currentSavings = 11240

  const recentTransactions = [
    { id: 1, description: "Salary Deposit", amount: 8420.00, type: "income", date: "Dec 30", category: "Salary", icon: Wallet },
    { id: 2, description: "Grocery Store", amount: -127.45, type: "expense", date: "Dec 29", category: "Food", icon: ShoppingBag },
    { id: 3, description: "Coffee Shop", amount: -8.50, type: "expense", date: "Dec 29", category: "Food", icon: Coffee },
    { id: 4, description: "Gas Station", amount: -65.20, type: "expense", date: "Dec 28", category: "Transport", icon: Car },
    { id: 5, description: "Rent Payment", amount: -2200.00, type: "expense", date: "Dec 28", category: "Housing", icon: Home },
  ]

  const weeklySpending = [
    { day: "Mon", amount: 85.40 },
    { day: "Tue", amount: 120.30 },
    { day: "Wed", amount: 45.20 },
    { day: "Thu", amount: 210.80 },
    { day: "Fri", amount: 167.50 },
    { day: "Sat", amount: 298.20 },
    { day: "Sun", amount: 89.60 },
  ]

  const maxSpending = Math.max(...weeklySpending.map(d => d.amount))

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto space-y-4">
            
            {/* Welcome Section */}
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-slate-900 mb-1">
                Good morning, {session.user?.name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-sm text-slate-600">Here&apos;s what&apos;s happening with your money today</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              
              {/* Total Balance */}
              <Card className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 bg-slate-100 rounded-lg">
                      <Wallet className="h-4 w-4 text-slate-700" />
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Total Balance</p>
                    <p className="text-2xl font-bold text-slate-900">${balance.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Income */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 bg-emerald-200 rounded-lg">
                      <ArrowUpRight className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div className="flex items-center text-emerald-700">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span className="text-xs font-semibold">+12%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-800 uppercase tracking-wide">Monthly Income</p>
                    <p className="text-2xl font-bold text-emerald-900">+${monthlyIncome.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Expenses */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 bg-red-200 rounded-lg">
                      <ArrowDownRight className="h-4 w-4 text-red-700" />
                    </div>
                    <div className="flex items-center text-red-700">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      <span className="text-xs font-semibold">-5%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-800 uppercase tracking-wide">Monthly Expenses</p>
                    <p className="text-2xl font-bold text-red-900">-${monthlyExpenses.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Savings Goal */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 bg-blue-200 rounded-lg">
                      <Target className="h-4 w-4 text-blue-700" />
                    </div>
                    <div className="text-xs text-blue-700 font-semibold">
                      {Math.round((currentSavings / savingsGoal) * 100)}%
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-800 uppercase tracking-wide">Savings Goal</p>
                    <p className="text-2xl font-bold text-blue-900">${currentSavings.toLocaleString()}</p>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full transition-all"
                        style={{ width: `${(currentSavings / savingsGoal) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Recent Transactions */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          View All
                        </Button>
                        <Button size="sm" className="h-7 text-xs bg-slate-900 hover:bg-slate-800">
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${
                              transaction.type === 'income' 
                                ? 'bg-emerald-100' 
                                : 'bg-slate-100'
                            }`}>
                              <transaction.icon className={`h-3.5 w-3.5 ${
                                transaction.type === 'income' 
                                  ? 'text-emerald-700' 
                                  : 'text-slate-600'
                              }`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{transaction.description}</p>
                              <p className="text-xs text-slate-500">{transaction.category} • {transaction.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${
                              transaction.type === 'income' 
                                ? 'text-emerald-600' 
                                : 'text-slate-900'
                            }`}>
                              {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Spending Chart */}
              <div>
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-slate-900">This Week</h3>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {weeklySpending.map((day, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-600 w-8">{day.day}</span>
                          <div className="flex-1 mx-2">
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div 
                                className="bg-slate-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${(day.amount / maxSpending) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-slate-900 w-12 text-right">
                            ${day.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">Total</span>
                        <span className="text-sm font-bold text-slate-900">
                          ${weeklySpending.reduce((sum, day) => sum + day.amount, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-12 border-slate-200 hover:bg-slate-50">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
              <Button variant="outline" className="h-12 border-slate-200 hover:bg-slate-50">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay Bills
              </Button>
              <Button variant="outline" className="h-12 border-slate-200 hover:bg-slate-50">
                <Target className="h-4 w-4 mr-2" />
                Set Goal
              </Button>
              <Button variant="outline" className="h-12 border-slate-200 hover:bg-slate-50">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
} 