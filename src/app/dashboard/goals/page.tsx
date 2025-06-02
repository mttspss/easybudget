"use client"

import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock
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
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface Goal {
  id: string
  name: string
  description?: string
  target_amount: number
  current_amount: number
  target_date?: string
  created_at: string
}

export default function GoalsPage() {
  const { user, loading } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    target_amount: "",
    current_amount: "",
    target_date: ""
  })

  const fetchGoals = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setGoals(data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchGoals()
    }
  }, [user, fetchGoals])

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
    
    if (!formData.name || !formData.target_amount) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      if (editingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from('goals')
          .update({
            name: formData.name,
            description: formData.description,
            target_amount: parseFloat(formData.target_amount),
            current_amount: parseFloat(formData.current_amount) || 0,
            target_date: formData.target_date || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingGoal.id)

        if (error) throw error
        toast.success('Goal updated successfully!')
      } else {
        // Create new goal
        const { error } = await supabase
          .from('goals')
          .insert({
            user_id: user.id,
            name: formData.name,
            description: formData.description,
            target_amount: parseFloat(formData.target_amount),
            current_amount: parseFloat(formData.current_amount) || 0,
            target_date: formData.target_date || null
          })

        if (error) throw error
        toast.success('Goal created successfully!')
      }

      // Reset form and close dialog
      setFormData({
        name: "",
        description: "",
        target_amount: "",
        current_amount: "",
        target_date: ""
      })
      setEditingGoal(null)
      setIsDialogOpen(false)
      
      // Refresh data
      fetchGoals()
    } catch (error: any) {
      console.error('Error saving goal:', error)
      toast.error(`Error saving goal: ${error.message || 'Please try again.'}`)
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      description: goal.description || "",
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      target_date: goal.target_date || ""
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success('Goal deleted successfully!')
      fetchGoals()
    } catch (error: any) {
      console.error('Error deleting goal:', error)
      toast.error(`Error deleting goal: ${error.message || 'Please try again.'}`)
    }
  }

  const filteredGoals = goals.filter(goal => 
    goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalGoals = filteredGoals.length
  const completedGoals = filteredGoals.filter(g => g.current_amount >= g.target_amount).length
  const inProgressGoals = totalGoals - completedGoals
  const totalTargetAmount = filteredGoals.reduce((sum, g) => sum + g.target_amount, 0)
  const totalCurrentAmount = filteredGoals.reduce((sum, g) => sum + g.current_amount, 0)

  const getProgressPercentage = (current: number, target: number) => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0
  }

  const getDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return null
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

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
                  <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
                  <p className="text-gray-600 text-sm mt-1">Set and track your financial objectives</p>
                </div>
                <div className="flex items-center gap-3">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-3 w-3 mr-2" />
                        Add Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingGoal ? 'Update your goal details.' : 'Create a new financial goal to stay motivated.'}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Goal Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g., Emergency Fund, New Car, etc."
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Describe your goal in detail..."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="target_amount">Target Amount</Label>
                            <Input
                              id="target_amount"
                              type="number"
                              step="0.01"
                              value={formData.target_amount}
                              onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                              placeholder="0.00"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="current_amount">Current Amount</Label>
                            <Input
                              id="current_amount"
                              type="number"
                              step="0.01"
                              value={formData.current_amount}
                              onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="target_date">Target Date (Optional)</Label>
                          <Input
                            id="target_date"
                            type="date"
                            value={formData.target_date}
                            onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                          />
                        </div>

                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => {
                            setIsDialogOpen(false)
                            setEditingGoal(null)
                            setFormData({
                              name: "",
                              description: "",
                              target_amount: "",
                              current_amount: "",
                              target_date: ""
                            })
                          }}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingGoal ? 'Update' : 'Create'} Goal
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Stats - Goals-specific design with mixed layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Main stats - larger cards */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50/50 via-white to-white border border-blue-200/30 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Total Goals</p>
                        <div className="text-3xl font-medium text-gray-900">{totalGoals}</div>
                        <p className="text-xs text-gray-500 mt-1">Active financial targets</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Target className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 bg-gradient-to-br from-purple-50/50 via-white to-white border border-purple-200/30 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Overall Progress</p>
                        <div className="text-3xl font-medium text-purple-600">
                          {totalTargetAmount > 0 ? Math.round((totalCurrentAmount / totalTargetAmount) * 100) : 0}%
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${totalTargetAmount > 0 ? Math.min(Math.round((totalCurrentAmount / totalTargetAmount) * 100), 100) : 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Secondary stats - smaller cards */}
                <Card className="bg-gradient-to-br from-green-50/50 via-white to-white border border-green-200/30 shadow-sm">
                  <CardContent className="p-2">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-2 bg-green-100 rounded-full mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-xl font-medium text-gray-900">{completedGoals}</div>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50/50 via-white to-white border border-orange-200/30 shadow-sm">
                  <CardContent className="p-2">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-2 bg-orange-100 rounded-full mb-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="text-xl font-medium text-gray-900">{inProgressGoals}</div>
                      <p className="text-xs text-gray-600">In Progress</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search goals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Goals List */}
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="h-5 bg-gray-200 rounded w-48"></div>
                              <div className="h-3 bg-gray-200 rounded w-32"></div>
                            </div>
                            <div className="h-8 w-16 bg-gray-200 rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                            <div className="h-2 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredGoals.length > 0 ? (
                <div className="space-y-4">
                  {filteredGoals.map((goal) => {
                    const progress = getProgressPercentage(goal.current_amount, goal.target_amount)
                    const daysRemaining = getDaysRemaining(goal.target_date)
                    const isCompleted = goal.current_amount >= goal.target_amount
                    
                    return (
                      <Card key={goal.id} className="hover:shadow-md transition-shadow group">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{goal.name}</h3>
                                {goal.description && (
                                  <p className="text-gray-600 text-sm mt-1">{goal.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                  <span>Target: ${goal.target_amount.toFixed(2)}</span>
                                  <span>Current: ${goal.current_amount.toFixed(2)}</span>
                                  {goal.target_date && (
                                    <span className={`flex items-center gap-1 ${
                                      daysRemaining !== null && daysRemaining < 0 
                                        ? 'text-red-600' 
                                        : daysRemaining !== null && daysRemaining < 30 
                                        ? 'text-orange-600' 
                                        : 'text-gray-500'
                                    }`}>
                                      <Calendar className="h-3 w-3" />
                                      {daysRemaining !== null && daysRemaining >= 0 
                                        ? `${daysRemaining} days left`
                                        : daysRemaining !== null && daysRemaining < 0
                                        ? `${Math.abs(daysRemaining)} days overdue`
                                        : new Date(goal.target_date).toLocaleDateString()
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  isCompleted 
                                    ? 'bg-green-100 text-green-700'
                                    : progress > 75
                                    ? 'bg-blue-100 text-blue-700'
                                    : progress > 25
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {isCompleted ? 'Completed' : 'In Progress'}
                                </span>
                                
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEdit(goal)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    onClick={() => handleDelete(goal.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium text-gray-900">{progress.toFixed(1)}%</span>
                              </div>
                              <Progress 
                                value={progress} 
                                className={`h-2 ${
                                  isCompleted 
                                    ? '[&>div]:bg-green-500'
                                    : progress > 75
                                    ? '[&>div]:bg-blue-500'
                                    : progress > 25
                                    ? '[&>div]:bg-orange-500'
                                    : '[&>div]:bg-gray-400'
                                }`}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">Set your first financial goal and start working towards it!</p>
                  <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Goal
                  </Button>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 