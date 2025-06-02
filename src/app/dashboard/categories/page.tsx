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
  PieChart,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  FolderOpen,
  Palette
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from "sonner"

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

      setCategories(categoriesWithStats)
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
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-full">
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                  <p className="text-gray-600 text-sm mt-1">Organize your income and expenses</p>
                </div>
                <div className="flex items-center gap-3">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="h-8 text-sm text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 shadow-lg shadow-blue-500/50 font-medium rounded-lg px-5 py-2.5 border-0"
                      >
                        <Plus className="h-3 w-3 mr-2" />
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
              </div>

              {/* Stats - Categories-specific design */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-indigo-50/50 via-white to-white border border-indigo-200/30 shadow-sm">
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Total Categories</p>
                        <div className="text-2xl font-medium text-gray-900">
                          {filteredCategories.length}
                        </div>
                      </div>
                      <div className="p-2 bg-indigo-100 rounded-full">
                        <FolderOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50/50 via-white to-white border border-green-200/30 shadow-sm">
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Income Categories</p>
                        <div className="text-2xl font-medium text-gray-900">
                          {filteredCategories.filter(c => c.type === 'income').length}
                        </div>
                      </div>
                      <div className="p-2 bg-green-100 rounded-full">
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50/50 via-white to-white border border-red-200/30 shadow-sm">
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Expense Categories</p>
                        <div className="text-2xl font-medium text-gray-900">
                          {filteredCategories.filter(c => c.type === 'expense').length}
                        </div>
                      </div>
                      <div className="p-2 bg-red-100 rounded-full">
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50/50 via-white to-white border border-purple-200/30 shadow-sm">
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Colors Used</p>
                        <div className="text-2xl font-medium text-gray-900">
                          {new Set(filteredCategories.map(c => c.color)).size}
                        </div>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Palette className="h-5 w-5 text-purple-600" />
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
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income Categories</SelectItem>
                    <SelectItem value="expense">Expense Categories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categories Tabs */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Categories</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="expense">Expense</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredCategories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredCategories.map((category) => (
                        <Card key={category.id} className="hover:shadow-md transition-shadow group">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${category.color}20` }}
                              >
                                {category.type === 'income' ? (
                                  <ArrowUpRight className="h-6 w-6" style={{ color: category.color }} />
                                ) : (
                                  <ArrowDownRight className="h-6 w-6" style={{ color: category.color }} />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => handleEdit(category)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                      onClick={() => handleDelete(category.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    category.type === 'income' 
                                      ? 'bg-green-100 text-green-700' 
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {category.type === 'income' ? 'Income' : 'Expense'}
                                  </span>
                                  <span>{category.transaction_count} transactions</span>
                                  <span>${category.total_amount?.toFixed(2) || '0.00'}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PieChart className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
                      <p className="text-gray-600 mb-6 max-w-sm mx-auto">Create your first category to start organizing your transactions.</p>
                      <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Category
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="income" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {incomeCategories.map((category) => (
                      <Card key={category.id} className="hover:shadow-md transition-shadow group">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <ArrowUpRight className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEdit(category)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    onClick={() => handleDelete(category.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                <span>{category.transaction_count} transactions</span>
                                <span className="text-green-600 font-medium">+${category.total_amount?.toFixed(2) || '0.00'}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="expense" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expenseCategories.map((category) => (
                      <Card key={category.id} className="hover:shadow-md transition-shadow group">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                              <ArrowDownRight className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEdit(category)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    onClick={() => handleDelete(category.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                <span>{category.transaction_count} transactions</span>
                                <span className="text-red-600 font-medium">-${category.total_amount?.toFixed(2) || '0.00'}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 