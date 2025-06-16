"use client"

import { useAuth } from "@/lib/auth-context"
import { useDashboards } from "@/lib/dashboard-context"
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
  ArrowUpRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight
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
import { getUserCurrency, formatCurrency, type CurrencyConfig } from "@/lib/currency"
import { DashboardIndicator } from "@/components/dashboard-indicator"

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
  icon?: string
}

interface IncomePageProps {
  initialCategory?: string
}

function IncomePageContent({ initialCategory }: IncomePageProps) {
  const { user, loading } = useAuth()
  const { activeDashboard } = useDashboards()
  const searchParams = useSearchParams()
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
  const [changeCategoryDialog, setChangeCategoryDialog] = useState<{
    open: boolean
    newCategoryId: string
  }>({
    open: false,
    newCategoryId: ""
  })
  const [userCurrency, setUserCurrency] = useState<CurrencyConfig | null>(null)
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

  // Auto-open dialog if add=true in URL
  useEffect(() => {
    const shouldAdd = searchParams.get('add')
    if (shouldAdd === 'true') {
      setIsDialogOpen(true)
      // Clean the URL by removing the add parameter
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('add')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams])

  // Load user currency
  useEffect(() => {
    const loadCurrency = async () => {
      if (!user) return
      
      try {
        const currency = await getUserCurrency(user.id)
        setUserCurrency(currency)
      } catch (error) {
        console.error('Error loading currency:', error)
      }
    }

    loadCurrency()
  }, [user])

  const fetchData = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Dashboard filter: null for main dashboard, specific ID for custom dashboards
      const dashboardFilter = activeDashboard?.id || null
      
      // Fetch income categories (not filtered by dashboard)
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .order('name')

      // Fetch income transactions with dashboard filter
      let transactionQuery = supabase
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

      // Apply dashboard filter
      if (dashboardFilter) {
        transactionQuery = transactionQuery.eq('dashboard_id', dashboardFilter)
      } else {
        transactionQuery = transactionQuery.is('dashboard_id', null)
      }

      const { data: transactionData } = await transactionQuery

      setCategories(categoryData || [])
      setTransactions(transactionData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, activeDashboard])

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
        // Create new transaction with dashboard assignment
        const dashboardFilter = activeDashboard?.id || null
        
        const { error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            amount: parseFloat(formData.amount),
            description: formData.description,
            date: formData.date,
            category_id: formData.category_id,
            icon: formData.icon,
            type: 'income',
            dashboard_id: dashboardFilter
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
        toast.success('Income deleted successfully!')
      } else if (deleteConfirmDialog.type === 'multiple') {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .in('id', Array.from(selectedItems))

        if (error) throw error
        toast.success(`${selectedItems.size} income transactions deleted successfully!`)
        setSelectedItems(new Set())
      }
      
      setDeleteConfirmDialog({ open: false, type: 'single' })
      fetchData()
    } catch (error: any) {
      console.error('Error deleting transaction(s):', error)
      toast.error(`Error deleting transaction(s): ${error.message || 'Please try again.'}`)
    }
  }

  const handleBulkCategoryChange = () => {
    if (selectedItems.size === 0) return
    setChangeCategoryDialog({
      open: true,
      newCategoryId: ""
    })
  }

  const confirmCategoryChange = async () => {
    if (!changeCategoryDialog.newCategoryId) {
      toast.error('Please select a category')
      return
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          category_id: changeCategoryDialog.newCategoryId,
          updated_at: new Date().toISOString()
        })
        .in('id', Array.from(selectedItems))

      if (error) throw error

      const selectedCategory = categories.find(c => c.id === changeCategoryDialog.newCategoryId)
      toast.success(`${selectedItems.size} transaction(s) moved to ${selectedCategory?.name}!`)
      
      setSelectedItems(new Set())
      setChangeCategoryDialog({ open: false, newCategoryId: "" })
      fetchData()
    } catch (error: any) {
      console.error('Error changing category:', error)
      toast.error(`Error changing category: ${error.message || 'Please try again.'}`)
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

  // Calculate this month's income and pagination
  const thisMonthIncome = filteredTransactions.filter(transaction => {
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
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-3">
          <div className="max-w-7xl mx-auto space-y-3">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Income</h1>
                <p className="text-gray-600 text-xs">Track and manage your income sources</p>
              </div>
              <div className="flex items-center gap-2">
                <DashboardIndicator />
                {selectedItems.size > 0 && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleBulkCategoryChange}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Change Category ({selectedItems.size})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleBulkDelete}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Selected ({selectedItems.size})
                    </Button>
                  </>
                )}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm"
                      onClick={() => {
                        setEditingTransaction(null)
                        setFormData({
                          amount: "",
                          description: "",
                          date: new Date().toISOString().split('T')[0],
                          category_id: "",
                          icon: "FileText"
                        })
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
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
                                  <div 
                                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: category.color }}
                                  >
                                    <IconRenderer 
                                      iconName={category.icon} 
                                      className="h-3 w-3 text-white"
                                      fallbackColor="white"
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
                          {editingTransaction ? 'Update' : 'Add'} Income
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats and Search - Improved */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
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
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                Income
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
                                +{userCurrency ? formatCurrency(Number(transaction.amount), userCurrency).replace(/^[+\-]/, '') : `€${Number(transaction.amount).toFixed(2)}`}
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
                    <ArrowUpRight className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No income found</h3>
                    <p className="text-xs text-gray-500 mb-3">Start tracking your income by adding your first transaction</p>
                    <Button onClick={() => setIsDialogOpen(true)} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Income
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
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Income</p>
                    <p className="text-lg font-bold text-gray-900">
                      {userCurrency ? formatCurrency(filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0), userCurrency) : `€${filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString()}`}
                    </p>
                  </div>
                  <div className="h-8 w-px bg-gray-200"></div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">This Month</p>
                    <p className="text-lg font-bold text-gray-900">
                      {userCurrency ? formatCurrency(thisMonthIncome, userCurrency) : `€${thisMonthIncome.toLocaleString()}`}
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
      <Dialog open={deleteConfirmDialog.open} onOpenChange={(open) => setDeleteConfirmDialog({ ...deleteConfirmDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Confirm Delete</DialogTitle>
            <DialogDescription className="text-sm">
              {deleteConfirmDialog.type === 'single' 
                ? 'Are you sure you want to delete this income transaction? This action cannot be undone.'
                : `Are you sure you want to delete ${deleteConfirmDialog.transactionCount} income transactions? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmDialog({ open: false, type: 'single' })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Category Dialog */}
      <Dialog open={changeCategoryDialog.open} onOpenChange={(open) => setChangeCategoryDialog({ ...changeCategoryDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Change Category</DialogTitle>
            <DialogDescription className="text-sm">
              Select a new category for {selectedItems.size} selected transaction(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="newCategory" className="text-sm">New Category *</Label>
              <Select value={changeCategoryDialog.newCategoryId} onValueChange={(value) => setChangeCategoryDialog({ ...changeCategoryDialog, newCategoryId: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
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
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setChangeCategoryDialog({ open: false, newCategoryId: "" })}>
              Cancel
            </Button>
            <Button onClick={confirmCategoryChange}>
              Change Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function IncomePageWrapper() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  
  return <IncomePageContent initialCategory={categoryParam || undefined} />
}

export default function IncomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    </div>}>
      <IncomePageWrapper />
    </Suspense>
  )
} 