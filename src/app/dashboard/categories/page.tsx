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
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  FolderOpen,
  MoreHorizontal
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { createDefaultCategories } from "@/lib/default-categories"
import { IconSelector } from "@/components/ui/icon-selector"
import { IconRenderer } from "@/components/ui/icon-renderer"

interface Category {
  id: string
  name: string
  color: string
  type: 'income' | 'expense'
  icon?: string
  transaction_count?: number
  total_amount?: number
}

const colorOptions = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e'
]

export default function CategoriesPage() {
  const { user, loading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    color: colorOptions[0],
    type: "expense" as 'income' | 'expense',
    icon: "FolderOpen"
  })

  const fetchCategories = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Fetch categories with transaction counts and totals
      const { data: categoriesData } = await supabase
        .from('categories')
        .select(`
          *,
          transactions (
            id,
            amount
          )
        `)
        .eq('user_id', user.id)
        .order('name')

      const categoriesWithStats = (categoriesData || []).map(category => ({
        ...category,
        transaction_count: category.transactions?.length || 0,
        total_amount: category.transactions?.reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0
      }))

      // AUTO-CREATE DEFAULT CATEGORIES if user has no categories
      if (categoriesWithStats.length === 0) {
        console.log('No categories found, creating defaults...')
        const success = await createDefaultCategories(user.id)
        if (success) {
          // Refetch after creating defaults
          const { data: newCategoriesData } = await supabase
            .from('categories')
            .select(`
              *,
              transactions (
                id,
                amount
              )
            `)
            .eq('user_id', user.id)
            .order('name')

          const newCategoriesWithStats = (newCategoriesData || []).map(category => ({
            ...category,
            transaction_count: category.transactions?.length || 0,
            total_amount: category.transactions?.reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0
          }))
          
          setCategories(newCategoriesWithStats)
          toast.success('Welcome! Default categories have been created for you.')
        }
      } else {
        setCategories(categoriesWithStats)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user, fetchCategories])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    redirect("/")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.color) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            color: formData.color,
            type: formData.type,
            icon: formData.icon,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id)

        if (error) throw error
        toast.success('Category updated successfully!')
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: formData.name,
            color: formData.color,
            type: formData.type,
            icon: formData.icon
          })

        if (error) throw error
        toast.success('Category created successfully!')
      }

      // Reset form and close dialog
      setFormData({
        name: "",
        color: colorOptions[0],
        type: "expense",
        icon: "FolderOpen"
      })
      setEditingCategory(null)
      setIsDialogOpen(false)
      
      // Refresh data
      fetchCategories()
    } catch (error: any) {
      console.error('Error saving category:', error)
      toast.error(`Error saving category: ${error.message || 'Please try again.'}`)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      type: category.type,
      icon: category.icon || "FolderOpen"
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    // Check if category has transactions
    const category = categories.find(c => c.id === id)
    if (category && category.transaction_count! > 0) {
      toast.error(`Cannot delete category "${category.name}" because it has ${category.transaction_count} transactions. Please move or delete the transactions first.`)
      return
    }

    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success('Category deleted successfully!')
      fetchCategories()
    } catch (error: any) {
      console.error('Error deleting category:', error)
      toast.error(`Error deleting category: ${error.message || 'Please try again.'}`)
    }
  }

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-3">
          <div className="max-w-7xl mx-auto space-y-3">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Categories</h1>
                <p className="text-gray-600 text-xs">Organize your income and expense categories</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm"
                    onClick={() => {
                      setEditingCategory(null)
                      setFormData({
                        name: "",
                        type: "expense",
                        color: colorOptions[0],
                        icon: "FolderOpen"
                      })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-lg">
                      {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                      {editingCategory ? 'Update category details' : 'Create a new category to organize your transactions'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <Label htmlFor="name" className="text-sm">Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Groceries, Salary, etc."
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-1"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="type" className="text-sm">Type *</Label>
                      <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({...formData, type: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">
                            <div className="flex items-center gap-2">
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                              Expense
                            </div>
                          </SelectItem>
                          <SelectItem value="income">
                            <div className="flex items-center gap-2">
                              <ArrowUpRight className="h-4 w-4 text-green-500" />
                              Income
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Color *</Label>
                      <div className="grid grid-cols-6 gap-2 mt-1">
                        {colorOptions.map(color => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-gray-400' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setFormData({...formData, color})}
                          />
                        ))}
                      </div>
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
                        setEditingCategory(null)
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">
                        {editingCategory ? 'Update' : 'Create'} Category
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filters - Compact */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              <div className="lg:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Summary Cards - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Total Categories</p>
                      <p className="text-lg font-bold text-gray-900">{categories.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Income Categories</p>
                      <p className="text-lg font-bold text-gray-900">{incomeCategories.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                      <ArrowUpRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Expense Categories</p>
                      <p className="text-lg font-bold text-gray-900">{expenseCategories.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm">
                      <ArrowDownRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Categories Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Income Categories Column */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <ArrowUpRight className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-sm font-semibold text-gray-900">Income Categories</h2>
                    <span className="text-xs text-gray-500">({incomeCategories.length})</span>
                  </div>
                  
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : incomeCategories.length > 0 ? (
                    <div className="space-y-2">
                      {incomeCategories
                        .filter(category => category.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((category) => (
                        <div key={category.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: category.color }}
                              >
                                <IconRenderer 
                                  iconName={category.icon} 
                                  className="h-4 w-4 text-white"
                                  fallbackColor="white"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-500">
                                    {category.transaction_count || 0} transactions
                                  </span>
                                  <span className="text-xs font-medium text-[#53E489]">
                                    ${(category.total_amount || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(category)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(category.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <ArrowUpRight className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No income categories</h3>
                      <p className="text-xs text-gray-500 mb-3">Create categories for your income sources</p>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setFormData({...formData, type: 'income'})
                          setIsDialogOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Income Category
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expense Categories Column */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                      <ArrowDownRight className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-sm font-semibold text-gray-900">Expense Categories</h2>
                    <span className="text-xs text-gray-500">({expenseCategories.length})</span>
                  </div>
                  
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : expenseCategories.length > 0 ? (
                    <div className="space-y-2">
                      {expenseCategories
                        .filter(category => category.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((category) => (
                        <div key={category.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: category.color }}
                              >
                                <IconRenderer 
                                  iconName={category.icon} 
                                  className="h-4 w-4 text-white"
                                  fallbackColor="white"
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-500">
                                    {category.transaction_count || 0} transactions
                                  </span>
                                  <span className="text-xs font-medium text-[#EF0465]">
                                    ${(category.total_amount || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(category)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDelete(category.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <ArrowDownRight className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No expense categories</h3>
                      <p className="text-xs text-gray-500 mb-3">Create categories for your expenses</p>
                      <Button 
                        size="sm"
                        onClick={() => {
                          setFormData({...formData, type: 'expense'})
                          setIsDialogOpen(true)
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Expense Category
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 