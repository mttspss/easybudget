"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Palette,
  Target
} from "lucide-react"
import { useState, useEffect } from "react"

interface Category {
  id: string
  name: string
  color: string
  icon?: string
  type: string
}

interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  period: string
  categoryId: string
}

interface CategoryWithBudget extends Category {
  budget?: Budget
  spent: number
  transactionCount: number
}

export default function CategoriesPage() {
  const { data: session, status } = useSession()
  const [categories, setCategories] = useState<CategoryWithBudget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showBudgetForm, setShowBudgetForm] = useState<string | null>(null)

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'expense',
    color: '#3B82F6'
  })

  const [budgetForm, setBudgetForm] = useState({
    name: '',
    amount: '',
    period: 'monthly'
  })

  useEffect(() => {
    if (session) {
      fetchCategories()
    }
  }, [session])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/categories')
      const categoriesData = await categoriesResponse.json()
      
      // Fetch budgets
      const budgetsResponse = await fetch('/api/budgets')
      const budgetsData = await budgetsResponse.json()
      
      // Fetch transactions for spending calculation
      const transactionsResponse = await fetch('/api/transactions')
      const transactionsData = await transactionsResponse.json()
      
      // Combine data
      const categoriesWithBudgets = categoriesData.map((category: Category) => {
        const budget = budgetsData.find((b: Budget) => b.categoryId === category.id)
        const categoryTransactions = transactionsData.transactions?.filter(
          (t: any) => t.categoryId === category.id
        ) || []
        
        const spent = categoryTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
        
        return {
          ...category,
          budget,
          spent,
          transactionCount: categoryTransactions.length
        }
      })
      
      setCategories(categoriesWithBudgets)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryForm),
      })

      if (response.ok) {
        setCategoryForm({ name: '', type: 'expense', color: '#3B82F6' })
        setShowAddForm(false)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleAddBudget = async (e: React.FormEvent, categoryId: string) => {
    e.preventDefault()
    try {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)

      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...budgetForm,
          categoryId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }),
      })

      if (response.ok) {
        setBudgetForm({ name: '', amount: '', period: 'monthly' })
        setShowBudgetForm(null)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error creating budget:', error)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCategories()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleDeleteBudget = async (id: string) => {
    try {
      const response = await fetch(`/api/budgets?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCategories()
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const expenseCategories = categories.filter(cat => cat.type === 'expense')
  const incomeCategories = categories.filter(cat => cat.type === 'income')
  
  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.spent, 0)
  const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.spent, 0)

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
                <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                <p className="text-gray-600 mt-1">Organize your transactions and manage budgets</p>
              </div>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Income</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Net Income</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalIncome - totalExpenses)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add Category Form */}
            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <Input
                          type="text"
                          placeholder="Category name"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type
                        </label>
                        <select 
                          value={categoryForm.type} 
                          onChange={(e) => setCategoryForm({...categoryForm, type: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Color
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={categoryForm.color}
                            onChange={(e) => setCategoryForm({...categoryForm, color: e.target.value})}
                            className="w-12 h-10 p-1 border border-gray-300 rounded-md"
                          />
                          <Palette className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Add Category</Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Expense Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center gap-4 p-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : expenseCategories.length > 0 ? (
                  <div className="space-y-4">
                    {expenseCategories.map((category) => (
                      <div key={category.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{category.name}</h3>
                              <p className="text-sm text-gray-500">{category.transactionCount} transactions</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {category.budget ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Budget Progress</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">
                                  {formatCurrency(category.spent)} / {formatCurrency(category.budget.amount)}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteBudget(category.budget!.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  (category.spent / category.budget.amount) > 1 ? 'bg-red-500' : 'bg-blue-500'
                                }`}
                                style={{ 
                                  width: `${Math.min((category.spent / category.budget.amount) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {category.spent > category.budget.amount ? 
                                `Over budget by ${formatCurrency(category.spent - category.budget.amount)}` :
                                `${formatCurrency(category.budget.amount - category.spent)} remaining`
                              }
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-3">
                            {showBudgetForm === category.id ? (
                              <form onSubmit={(e) => handleAddBudget(e, category.id)} className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    type="text"
                                    placeholder="Budget name"
                                    value={budgetForm.name}
                                    onChange={(e) => setBudgetForm({...budgetForm, name: e.target.value})}
                                    required
                                  />
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="Amount"
                                    value={budgetForm.amount}
                                    onChange={(e) => setBudgetForm({...budgetForm, amount: e.target.value})}
                                    required
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button type="submit" size="sm">Add Budget</Button>
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowBudgetForm(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowBudgetForm(category.id)}
                              >
                                <Target className="h-4 w-4 mr-2" />
                                Set Budget
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingDown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No expense categories</h3>
                    <p className="text-gray-500 mb-4">Create your first expense category to start tracking spending.</p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Income Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Income Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {incomeCategories.length > 0 ? (
                  <div className="space-y-4">
                    {incomeCategories.map((category) => (
                      <div key={category.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{category.name}</h3>
                              <p className="text-sm text-gray-500">
                                {formatCurrency(category.spent)} • {category.transactionCount} transactions
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No income categories</h3>
                    <p className="text-gray-500 mb-4">Create income categories to track your revenue sources.</p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
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