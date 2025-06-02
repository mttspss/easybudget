"use client"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Plus,
  Search,
  Download,
  ArrowUpRight,
  Edit,
  Trash2,
  CalendarDays
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { IconSelector } from "@/components/ui/icon-selector"
import { IconRenderer } from "@/components/ui/icon-renderer"

interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  category_id: string
  icon?: string | null
  receipt_url?: string | null
  category?: {
    name: string
    color: string
  }
}

interface Category {
  id: string
  name: string
  color: string
}

export default function IncomePage() {
  const { user, loading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    category_id: "",
    icon: "FileText"
  })

  const fetchData = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Fetch income categories
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .order('name')

      // Fetch income transactions
      const { data: transactionData } = await supabase
        .from('transactions')
        .select(`
          *,
          categories!inner (
            name,
            color
          )
        `)
        .eq('user_id', user.id)
        .eq('type', 'income')
        .order('date', { ascending: false })

      setCategories(categoryData || [])
      setTransactions(transactionData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, fetchData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    redirect("/")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.description || !formData.category_id) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (editingTransaction) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update({
            amount: parseFloat(formData.amount),
            description: formData.description,
            date: formData.date,
            category_id: formData.category_id,
            icon: formData.icon,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTransaction.id)

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        
        toast.success('Income updated successfully!')
      } else {
        // Create new transaction
        const { error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            amount: parseFloat(formData.amount),
            description: formData.description,
            date: formData.date,
            category_id: formData.category_id,
            icon: formData.icon,
            type: 'income'
          })

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        
        toast.success('Income added successfully!')
      }

      // Reset form and close dialog
      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        category_id: "",
        icon: "FileText"
      })
      setEditingTransaction(null)
      setIsDialogOpen(false)
      
      // Refresh data
      fetchData()
    } catch (error: any) {
      console.error('Error saving transaction:', error)
      toast.error(`Error saving transaction: ${error.message || 'Please try again.'}`)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date,
      category_id: transaction.category_id,
      icon: transaction.icon || "FileText"
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success('Income deleted successfully!')
      fetchData()
    } catch (error: any) {
      console.error('Error deleting transaction:', error)
      toast.error(`Error deleting transaction: ${error.message || 'Please try again.'}`)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || transaction.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const totalIncome = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)

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
                  <h1 className="text-2xl font-bold text-gray-900">Income Management</h1>
                  <p className="text-gray-600 text-sm mt-1">Track and manage your income sources</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Download className="h-3 w-3 mr-2" />
                    Export
                  </Button>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="h-8 text-sm text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 shadow-lg shadow-green-500/50 font-medium rounded-lg px-5 py-2.5 border-0"
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Add Income
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTransaction ? 'Edit Income' : 'Add New Income'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingTransaction ? 'Update the income details below.' : 'Enter the details for your new income.'}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            placeholder="0.00"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="e.g., Salary, Freelancing, etc."
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: category.color }}
                                    />
                                    {category.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="icon">Icon</Label>
                          <IconSelector value={formData.icon} onValueChange={(value) => setFormData({...formData, icon: value})} />
                        </div>

                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => {
                            setIsDialogOpen(false)
                            setEditingTransaction(null)
                            setFormData({
                              amount: "",
                              description: "",
                              date: new Date().toISOString().split('T')[0],
                              category_id: "",
                              icon: "FileText"
                            })
                          }}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingTransaction ? 'Update' : 'Add'} Income
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Stats - Less Bold */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-50/50 via-white to-white border border-green-200/30 shadow-sm">
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Total Income</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-medium text-green-600">$</span>
                          <span className="text-2xl font-medium text-gray-900">
                            {totalIncome.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-green-100 rounded-full">
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50/50 via-white to-white border border-blue-200/30 shadow-sm">
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Transactions</p>
                        <div className="text-2xl font-medium text-gray-900">
                          {filteredTransactions.length}
                        </div>
                      </div>
                      <div className="p-2 bg-blue-100 rounded-full">
                        <CalendarDays className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50/50 via-white to-white border border-purple-200/30 shadow-sm">
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Avg per Transaction</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-medium text-green-600">$</span>
                          <span className="text-2xl font-medium text-gray-900">
                            {filteredTransactions.length > 0 ? (totalIncome / filteredTransactions.length).toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-full">
                        <CalendarDays className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notion-Style Transactions List */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-3">
                  <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1">Icon</div>
                    <div className="col-span-3">Description</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-2">Actions</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100">
                  {isLoading ? (
                    <div className="space-y-0">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="px-6 py-4">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-1">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="col-span-3">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="col-span-2">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="col-span-2">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="col-span-2">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="col-span-2">
                              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredTransactions.length > 0 ? (
                    <>
                      {filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Icon */}
                            <div className="col-span-1">
                              <div className="w-6 h-6 flex items-center justify-center">
                                <IconRenderer 
                                  iconName={transaction.icon} 
                                  className="h-4 w-4 text-gray-600"
                                  fallbackColor={transaction.category?.color}
                                />
                              </div>
                            </div>

                            {/* Description */}
                            <div className="col-span-3">
                              <div className="font-medium text-gray-900 text-sm">
                                {transaction.description}
                              </div>
                            </div>

                            {/* Category */}
                            <div className="col-span-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2.5 h-2.5 rounded-full" 
                                  style={{ backgroundColor: transaction.category?.color }}
                                />
                                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                  {transaction.category?.name}
                                </span>
                              </div>
                            </div>

                            {/* Date */}
                            <div className="col-span-2">
                              <span className="text-sm text-gray-600">
                                {new Date(transaction.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>

                            {/* Amount */}
                            <div className="col-span-2">
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-medium text-green-600">+$</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {transaction.amount.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="col-span-2">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-gray-100"
                                  onClick={() => handleEdit(transaction)}
                                >
                                  <Edit className="h-3.5 w-3.5 text-gray-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-red-50"
                                  onClick={() => handleDelete(transaction.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowUpRight className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No income transactions yet</h3>
                      <p className="text-gray-600 mb-6 max-w-sm mx-auto">Start tracking your income by adding your first transaction.</p>
                      <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Income
                      </Button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 