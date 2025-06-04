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
  categories?: {
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

  // Calculate this month's income
  const thisMonthIncome = filteredTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    const currentDate = new Date()
    return transactionDate.getMonth() === currentDate.getMonth() && 
           transactionDate.getFullYear() === currentDate.getFullYear()
  }).reduce((sum, t) => sum + Number(t.amount), 0)

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Income</h1>
                <p className="text-gray-600 text-sm">Track and manage your income transactions</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingTransaction(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Income
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg">
                        {editingTransaction ? 'Edit Income' : 'Add New Income'}
                      </DialogTitle>
                      <DialogDescription className="text-sm">
                        {editingTransaction ? 'Update income details' : 'Add a new income to track your earnings'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="amount" className="text-sm">Amount *</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="date" className="text-sm">Date *</Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            className="mt-1"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description" className="text-sm">Description *</Label>
                        <Input
                          id="description"
                          placeholder="e.g., Salary from Company XYZ"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="mt-1"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="category" className="text-sm">Category *</Label>
                        <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="icon" className="text-sm">Icon</Label>
                        <IconSelector 
                          value={formData.icon} 
                          onValueChange={(value) => setFormData({...formData, icon: value})}
                          className="mt-1"
                        />
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" size="sm" onClick={() => {
                          setIsDialogOpen(false)
                          setEditingTransaction(null)
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit" size="sm">
                          {editingTransaction ? 'Update' : 'Add'} Income
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats and Search - Compact */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search income..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary Cards - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Total Income</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ArrowUpRight className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">This Month</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${thisMonthIncome.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CalendarDays className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Transactions</p>
                      <p className="text-xl font-bold text-gray-900">{filteredTransactions.length}</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <div className="h-5 w-5 bg-purple-600 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions List - Compact */}
            <Card>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : filteredTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {filteredTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${transaction.categories?.color}20` }}>
                            <IconRenderer 
                              iconName={transaction.icon} 
                              className="h-4 w-4"
                              fallbackColor={transaction.categories?.color}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: transaction.categories?.color }} />
                              <span className="text-xs text-gray-500">{transaction.categories?.name}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {new Date(transaction.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-green-600">
                            +${Number(transaction.amount).toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(transaction)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(transaction.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ArrowUpRight className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No income found</h3>
                    <p className="text-xs text-gray-500 mb-4">Start tracking your income by adding your first transaction</p>
                    <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Income
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