"use client"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Palette,
  MoreHorizontal,
  Building
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
    icon: ""
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
        icon: ""
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
      icon: category.icon || ""
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

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || category.type === selectedType
    return matchesSearch && matchesType
  })

  const incomeCategories = filteredCategories.filter(c => c.type === 'income')
  const expenseCategories = filteredCategories.filter(c => c.type === 'expense')

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            
            {/* Header - Professional */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                <p className="text-gray-600 mt-1">Organize and manage your transaction categories</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingCategory ? 'Update the category details below.' : 'Create a new category to organize your transactions.'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Category Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., Groceries, Salary, etc."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">
                            <div className="flex items-center gap-2">
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                              Expense
                            </div>
                          </SelectItem>
                          <SelectItem value="income">
                            <div className="flex items-center gap-2">
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                              Income
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="color">Color</Label>
                      <div className="grid grid-cols-6 gap-2 mt-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setFormData({...formData, color})}
                          />
                        ))}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => {
                        setIsDialogOpen(false)
                        setEditingCategory(null)
                        setFormData({
                          name: "",
                          color: colorOptions[0],
                          type: "expense",
                          icon: ""
                        })
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingCategory ? 'Update' : 'Create'} Category
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards - Professional Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Total Categories</p>
                      <p className="text-3xl font-bold text-gray-900">{filteredCategories.length}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FolderOpen className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Income Categories</p>
                      <p className="text-3xl font-bold text-green-600">{incomeCategories.length}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <ArrowUpRight className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Expense Categories</p>
                      <p className="text-3xl font-bold text-red-600">{expenseCategories.length}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <ArrowDownRight className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Active Colors</p>
                      <p className="text-3xl font-bold text-purple-600">{new Set(filteredCategories.map(c => c.color)).size}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Palette className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters - Professional */}
            <Card className="border-0 shadow-lg bg-white mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="income">Income Only</SelectItem>
                      <SelectItem value="expense">Expense Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Categories List - Professional Table-like Design */}
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-semibold text-gray-900">All Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6">
                    <div className="animate-pulse space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                          <div className="w-20 h-4 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : filteredCategories.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredCategories.map((category) => (
                      <div key={category.id} className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors group">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {category.type === 'income' ? (
                            <ArrowUpRight className="h-6 w-6" style={{ color: category.color }} />
                          ) : (
                            <ArrowDownRight className="h-6 w-6" style={{ color: category.color }} />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{category.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              category.type === 'income' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {category.type === 'income' ? 'Income' : 'Expense'}
                            </span>
                            <span>{category.transaction_count} transactions</span>
                            <span className="font-medium">${category.total_amount?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(category.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Building className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {searchTerm ? 'No categories match your search criteria.' : 'You don\'t have any categories yet. Create your first category to get started.'}
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Category
                      </Button>
                    )}
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