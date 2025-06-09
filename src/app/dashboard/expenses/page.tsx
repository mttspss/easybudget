"use client"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Plus,
  Search,
  Download,
  ArrowDownRight,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Calendar
} from "lucide-react"
import { useState, useEffect, useCallback, Suspense } from "react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
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
  categories?: {
    name: string
    color: string
  }
}

interface Category {
  id: string
  name: string
  color: string
  icon?: string
}

interface ExpensesPageProps {
  initialCategory?: string
}

function ExpensesPageContent({ initialCategory }: ExpensesPageProps) {
  const { user, loading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [customDateRange, setCustomDateRange] = useState<{startDate: string, endDate: string}>({
    startDate: "",
    endDate: ""
  })
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean
    type: 'single' | 'multiple'
    transactionId?: string
    transactionCount?: number
  }>({
    open: false,
    type: 'single'
  })
  const itemsPerPage = 10
  
  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    category_id: "",
    icon: "FileText"
  })

  // Set initial category from prop
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory)
    }
  }, [initialCategory])

  const fetchData = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Fetch expense categories
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .order('name')

      // Fetch expense transactions
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
        .eq('type', 'expense')
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
        
        toast.success('Expense updated successfully!')
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
            type: 'expense'
          })

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        
        toast.success('Expense added successfully!')
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
    setDeleteConfirmDialog({
      open: true,
      type: 'single',
      transactionId: id
    })
  }

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return
    setDeleteConfirmDialog({
      open: true,
      type: 'multiple',
      transactionCount: selectedItems.size
    })
  }

  const confirmDelete = async () => {
    try {
      if (deleteConfirmDialog.type === 'single' && deleteConfirmDialog.transactionId) {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', deleteConfirmDialog.transactionId)

        if (error) throw error
        toast.success('Expense deleted successfully!')
      } else if (deleteConfirmDialog.type === 'multiple') {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .in('id', Array.from(selectedItems))

        if (error) throw error
        toast.success(`${selectedItems.size} expense transactions deleted successfully!`)
        setSelectedItems(new Set())
      }
      
      setDeleteConfirmDialog({ open: false, type: 'single' })
      fetchData()
    } catch (error: any) {
      console.error('Error deleting transaction(s):', error)
      toast.error(`Error deleting transaction(s): ${error.message || 'Please try again.'}`)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || transaction.category_id === selectedCategory
    
    // Month filter logic
    let matchesMonth = true
    if (selectedMonth !== "all") {
      const transactionDate = new Date(transaction.date)
      const currentDate = new Date()
      
      switch (selectedMonth) {
        case "thisMonth":
          matchesMonth = transactionDate.getMonth() === currentDate.getMonth() && 
                       transactionDate.getFullYear() === currentDate.getFullYear()
          break
        case "lastMonth":
          const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
          matchesMonth = transactionDate.getMonth() === lastMonth.getMonth() && 
                       transactionDate.getFullYear() === lastMonth.getFullYear()
          break
        case "last3Months":
          const threeMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1)
          matchesMonth = transactionDate >= threeMonthsAgo
          break
        case "last6Months":
          const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1)
          matchesMonth = transactionDate >= sixMonthsAgo
          break
        case "custom":
          if (customDateRange.startDate && customDateRange.endDate) {
            const startDate = new Date(customDateRange.startDate)
            const endDate = new Date(customDateRange.endDate)
            matchesMonth = transactionDate >= startDate && transactionDate <= endDate
          }
          break
      }
    }
    
    return matchesSearch && matchesCategory && matchesMonth
  })

  // Calculate this month's expenses and pagination
  const thisMonthExpenses = filteredTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    const currentDate = new Date()
    return transactionDate.getMonth() === currentDate.getMonth() && 
           transactionDate.getFullYear() === currentDate.getFullYear()
  }).reduce((sum, t) => sum + Number(t.amount), 0)

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(paginatedTransactions.map(t => t.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedItems(newSelected)
  }

  const isAllSelected = paginatedTransactions.length > 0 && paginatedTransactions.every(t => selectedItems.has(t.id))

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-3">
          <div className="max-w-7xl mx-auto space-y-3">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Expenses</h1>
                <p className="text-gray-600 text-xs">Track and manage your expense transactions</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedItems.size > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Selected ({selectedItems.size})
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingTransaction(null)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg">
                        {editingTransaction ? 'Edit Expense' : 'Add New Expense'}
                      </DialogTitle>
                      <DialogDescription className="text-sm">
                        {editingTransaction ? 'Update expense details' : 'Add a new expense to track your spending'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-3">
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
                          placeholder="e.g., Grocery shopping at Whole Foods"
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
                                  <div 
                                    className="w-4 h-4 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: category.color + '20' }}
                                  >
                                    <IconRenderer 
                                      iconName={category.icon} 
                                      className="h-2.5 w-2.5"
                                      fallbackColor={category.color}
                                    />
                                  </div>
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
                          {editingTransaction ? 'Update' : 'Add'} Expense
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats and Search - Improved */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
              <div className="lg:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="lg:col-span-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="thisMonth">This Month</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                    <SelectItem value="last3Months">Last 3 Months</SelectItem>
                    <SelectItem value="last6Months">Last 6 Months</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedMonth === "custom" && (
                <div className="lg:col-span-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">
                          {customDateRange.startDate && customDateRange.endDate 
                            ? `${new Date(customDateRange.startDate).toLocaleDateString('en-GB')} - ${new Date(customDateRange.endDate).toLocaleDateString('en-GB')}`
                            : "Select date range"
                          }
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3" align="start">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">From Date</Label>
                          <Input
                            type="date"
                            value={customDateRange.startDate}
                            onChange={(e) => setCustomDateRange({...customDateRange, startDate: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">To Date</Label>
                          <Input
                            type="date"
                            value={customDateRange.endDate}
                            onChange={(e) => setCustomDateRange({...customDateRange, endDate: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            if (!customDateRange.startDate || !customDateRange.endDate) {
                              toast.error('Please select both start and end dates')
                            }
                          }}
                        >
                          Apply Range
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              <div className={selectedMonth === "custom" ? "lg:col-span-1" : "lg:col-span-2"}>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: category.color + '20' }}
                          >
                            <IconRenderer 
                              iconName={category.icon} 
                              className="h-2.5 w-2.5"
                              fallbackColor={category.color}
                            />
                          </div>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Transactions Table - Notion Style */}
            <Card className="border border-gray-200">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-3 space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : filteredTransactions.length > 0 ? (
                  <>
                    {/* Table Header */}
                    <div className="px-3 py-2 border-b border-gray-200/60">
                      <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        <div className="col-span-1 flex items-center">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAll}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="col-span-2 border-l border-gray-200/40 pl-3">Date</div>
                        <div className="col-span-3 border-l border-gray-200/40 pl-3">Description</div>
                        <div className="col-span-1 border-l border-gray-200/40 pl-3">Type</div>
                        <div className="col-span-2 border-l border-gray-200/40 pl-3">Category</div>
                        <div className="col-span-2 border-l border-gray-200/40 pl-3">Amount</div>
                        <div className="col-span-1 border-l border-gray-200/40 pl-3">Actions</div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-100/60">
                      {paginatedTransactions.map((transaction) => (
                        <div key={transaction.id} className="px-3 py-2 hover:bg-gray-50/50 transition-colors">
                          <div className="grid grid-cols-12 gap-3 items-center">
                            {/* Checkbox */}
                            <div className="col-span-1">
                              <Checkbox
                                checked={selectedItems.has(transaction.id)}
                                onCheckedChange={(checked) => handleSelectItem(transaction.id, checked)}
                                className="h-4 w-4"
                              />
                            </div>

                            {/* Date */}
                            <div className="col-span-2 border-l border-gray-200/40 pl-3">
                              <span className="text-xs text-gray-600">
                                {new Date(transaction.date).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Description with Icon */}
                            <div className="col-span-3 border-l border-gray-200/40 pl-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: transaction.categories?.color }}>
                                  <IconRenderer 
                                    iconName={transaction.icon} 
                                    className="h-3 w-3 text-white"
                                    fallbackColor="white"
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900 truncate">
                                  {transaction.description}
                                </span>
                              </div>
                            </div>

                            {/* Type */}
                            <div className="col-span-1 border-l border-gray-200/40 pl-3">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Expense
                              </span>
                            </div>

                            {/* Category */}
                            <div className="col-span-2 border-l border-gray-200/40 pl-3">
                              <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: transaction.categories?.color }} />
                                <span className="text-xs text-gray-600 truncate">
                                  {transaction.categories?.name}
                                </span>
                              </div>
                            </div>

                            {/* Amount */}
                            <div className="col-span-2 border-l border-gray-200/40 pl-3">
                              <span className="text-sm font-medium text-gray-600">
                                -${Number(transaction.amount).toFixed(2)}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 border-l border-gray-200/40 pl-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(transaction.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination - Always visible */}
                    <div className="border-t border-gray-200/60 px-3 py-2 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600">
                          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-7 px-2"
                          >
                            <ChevronLeft className="h-3 w-3" />
                            Previous
                          </Button>
                          
                          {/* Page Numbers */}
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                              const pageNum = i + 1;
                              return (
                                <Button
                                  key={pageNum}
                                  variant={currentPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(pageNum)}
                                  className="h-7 w-7 text-xs"
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                            {totalPages > 5 && (
                              <span className="text-xs text-gray-600 px-1">...</span>
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-7 px-2"
                          >
                            Next
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <ArrowDownRight className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No expenses found</h3>
                    <p className="text-xs text-gray-500 mb-3">Start tracking your expenses by adding your first transaction</p>
                    <Button onClick={() => setIsDialogOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Expense
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Info Bar - More elegant */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Expenses</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">This Month</p>
                    <p className="text-lg font-bold text-gray-900">
                      ${thisMonthExpenses.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Transactions</p>
                    <p className="text-lg font-bold text-gray-900">{filteredTransactions.length}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Last updated</p>
                  <p className="text-xs text-gray-700">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialog.open} onOpenChange={(open) => setDeleteConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {deleteConfirmDialog.type === 'single' ? 'Delete Transaction' : 'Delete Multiple Transactions'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {deleteConfirmDialog.type === 'single' 
                ? 'Are you sure you want to delete this expense transaction? This action cannot be undone.'
                : `Are you sure you want to delete ${deleteConfirmDialog.transactionCount} expense transactions? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setDeleteConfirmDialog({ open: false, type: 'single' })}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              size="sm"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteConfirmDialog.type === 'single' ? 'Delete Transaction' : `Delete ${deleteConfirmDialog.transactionCount} Transactions`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ExpensesPageWrapper() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  
  return <ExpensesPageContent initialCategory={categoryParam || undefined} />
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    </div>}>
      <ExpensesPageWrapper />
    </Suspense>
  )
} 