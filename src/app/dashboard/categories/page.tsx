"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  TrendingDown
} from "lucide-react"

export default function CategoriesPage() {
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
  const categories = [
    {
      id: 1,
      name: "Food & Dining",
      type: "expense",
      color: "#10B981",
      spent: 485.20,
      budget: 600,
      transactions: 24,
      change: "+12%"
    },
    {
      id: 2,
      name: "Transportation",
      type: "expense", 
      color: "#3B82F6",
      spent: 245.80,
      budget: 300,
      transactions: 12,
      change: "+8%"
    },
    {
      id: 3,
      name: "Entertainment",
      type: "expense",
      color: "#8B5CF6",
      spent: 156.40,
      budget: 200,
      transactions: 8,
      change: "-5%"
    },
    {
      id: 4,
      name: "Utilities",
      type: "expense",
      color: "#F59E0B",
      spent: 324.50,
      budget: 350,
      transactions: 6,
      change: "+2%"
    },
    {
      id: 5,
      name: "Shopping",
      type: "expense",
      color: "#EF4444",
      spent: 189.90,
      budget: 250,
      transactions: 15,
      change: "+25%"
    },
    {
      id: 6,
      name: "Salary",
      type: "income",
      color: "#059669",
      spent: 5420.00,
      budget: 5500,
      transactions: 2,
      change: "+0%"
    },
    {
      id: 7,
      name: "Freelance",
      type: "income",
      color: "#0D9488",
      spent: 850.00,
      budget: 1000,
      transactions: 3,
      change: "+15%"
    }
  ]

  const expenseCategories = categories.filter(cat => cat.type === "expense")
  const incomeCategories = categories.filter(cat => cat.type === "income")

  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.spent, 0)
  const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.spent, 0)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
                <p className="text-gray-600 mt-1">Organize your transactions and set budgets</p>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-gray-900">${totalExpenses.toFixed(2)}</div>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-500">This month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Income</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-gray-900">${totalIncome.toFixed(2)}</div>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-500">This month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Net Income</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-gray-900">${(totalIncome - totalExpenses).toFixed(2)}</div>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-500">This month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Expense Categories */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {expenseCategories.map((category) => {
                  const percentage = (category.spent / category.budget) * 100
                  const isOverBudget = percentage > 100
                  
                  return (
                    <Card key={category.id} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Spent</span>
                            <span className="font-semibold">${category.spent.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Budget</span>
                            <span className="text-sm text-gray-600">${category.budget.toFixed(2)}</span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                isOverBudget ? 'bg-red-500' : ''
                              }`}
                              style={{ 
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: !isOverBudget ? category.color : undefined
                              }}
                            />
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">{category.transactions} transactions</span>
                            <span className={`font-medium ${
                              category.change.startsWith('+') ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {category.change}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Income Categories */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Income Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incomeCategories.map((category) => (
                  <Card key={category.id} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Received</span>
                          <span className="font-semibold text-green-600">${category.spent.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{category.transactions} transactions</span>
                          <span className="text-green-600 font-medium">
                            {category.change}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
} 