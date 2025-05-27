"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowUp,
  ArrowDown,
  Plus,
  MoreHorizontal,
  Calendar,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
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
  const stats = [
    {
      title: "Total Balance",
      value: "$12,847.50",
      change: "+5.2%",
      changeType: "increase",
      icon: DollarSign,
      description: "vs last month"
    },
    {
      title: "Monthly Income",
      value: "$5,420.00",
      change: "+12.3%",
      changeType: "increase", 
      icon: TrendingUp,
      description: "vs last month"
    },
    {
      title: "Monthly Expenses",
      value: "$3,210.75",
      change: "+8.1%",
      changeType: "increase",
      icon: TrendingDown,
      description: "vs last month"
    },
    {
      title: "Savings Goal",
      value: "$2,136.75",
      change: "71%",
      changeType: "neutral",
      icon: Target,
      description: "of $3,000 goal"
    }
  ]

  const recentTransactions = [
    {
      id: 1,
      description: "Grocery Store",
      category: "Food & Dining",
      amount: -85.42,
      date: "Today",
      status: "completed"
    },
    {
      id: 2,
      description: "Salary Deposit",
      category: "Income",
      amount: 2710.00,
      date: "Dec 1",
      status: "completed"
    },
    {
      id: 3,
      description: "Electric Bill",
      category: "Utilities",
      amount: -124.50,
      date: "Dec 1",
      status: "completed"
    },
    {
      id: 4,
      description: "Coffee Shop",
      category: "Food & Dining",
      amount: -12.50,
      date: "Yesterday",
      status: "completed"
    },
    {
      id: 5,
      description: "Gas Station",
      category: "Transportation",
      amount: -45.20,
      date: "Yesterday",
      status: "completed"
    }
  ]

  const categories = [
    { name: "Food & Dining", spent: 485.20, budget: 600, color: "#10B981" },
    { name: "Transportation", spent: 245.80, budget: 300, color: "#3B82F6" },
    { name: "Entertainment", spent: 156.40, budget: 200, color: "#8B5CF6" },
    { name: "Utilities", spent: 324.50, budget: 350, color: "#F59E0B" },
    { name: "Shopping", spent: 189.90, budget: 250, color: "#EF4444" }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Overview" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                                 <h1 className="text-2xl font-semibold text-gray-900">Good morning, {session.user?.name?.split(' ')[0] || 'there'}</h1>
                 <p className="text-gray-600 mt-1">Here&apos;s your financial overview for December 2024</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  December 2024
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <stat.icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="mt-4">
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="flex items-center mt-2">
                        {stat.changeType === "increase" && (
                          <ArrowUp className="h-4 w-4 text-green-500" />
                        )}
                        {stat.changeType === "decrease" && (
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ml-1 ${
                          stat.changeType === "increase" ? "text-green-600" : 
                          stat.changeType === "decrease" ? "text-red-600" : 
                          "text-gray-600"
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">{stat.description}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Transactions */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                      <Button variant="ghost" size="sm">View all</Button>
                    </div>
                    
                    <div className="space-y-4">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {transaction.amount > 0 ? (
                                <ArrowUp className="h-5 w-5 text-green-600" />
                              ) : (
                                <ArrowDown className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.description}</p>
                              <p className="text-sm text-gray-500">{transaction.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">{transaction.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Spending */}
              <div>
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Category Spending</h3>
                      <Button variant="ghost" size="sm">View all</Button>
                    </div>
                    
                    <div className="space-y-4">
                      {categories.map((category, index) => {
                        const percentage = (category.spent / category.budget) * 100
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <span className="text-sm font-medium text-gray-900">{category.name}</span>
                              </div>
                              <span className="text-sm text-gray-600">
                                ${category.spent} / ${category.budget}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${Math.min(percentage, 100)}%`,
                                  backgroundColor: category.color 
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
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