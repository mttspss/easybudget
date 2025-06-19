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
import confetti from 'canvas-confetti'
import { getUserCurrency, formatCurrency, type CurrencyConfig } from "@/lib/currency"
import { useSubscription } from "@/lib/subscription-context"

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
  const { plan, goalsCount, canCreateGoal } = useSubscription()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [userCurrency, setUserCurrency] = useState<CurrencyConfig | null>(null)
  
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

  const handleCompleteGoal = async (goal: Goal) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({
          current_amount: goal.target_amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', goal.id)

      if (error) throw error
      
      // Celebration confetti animation
      const duration = 3000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22c55e', '#16a34a', '#15803d']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22c55e', '#16a34a', '#15803d']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
      
      toast.success('🎉 Goal completed! Congratulations!')
      fetchGoals()
    } catch (error: any) {
      console.error('Error completing goal:', error)
      toast.error(`Error completing goal: ${error.message || 'Please try again.'}`)
    }
  }

  const filteredGoals = goals.filter(goal => 
    goal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalGoals = filteredGoals.length
  const completedGoals = filteredGoals.filter(g => g.current_amount >= g.target_amount).length
  const inProgressGoalsCount = totalGoals - completedGoals

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100)
  }

  const getDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return null
    const target = new Date(targetDate)
    const today = new Date()
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-3">
          <div className="max-w-7xl mx-auto space-y-3">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Goals</h1>
                <p className="text-gray-600 text-xs">Set and track your financial goals</p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => setEditingGoal(null)} disabled={!canCreateGoal()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Goal
                    </Button>
                  </DialogTrigger>
                  {!canCreateGoal() && (
                    <p className="text-xs text-red-500 ml-2">
                      Goal limit reached ({goalsCount}/{plan.maxGoals}).
                    </p>
                  )}
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg">
                        {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                      </DialogTitle>
                      <DialogDescription className="text-sm">
                        {editingGoal ? 'Update goal details' : 'Create a new financial goal to track your progress'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-3">
                      <div>
                        <Label htmlFor="name" className="text-sm">Goal Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Emergency Fund, Vacation"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="mt-1"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-sm">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Optional description of your goal"
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="mt-1"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="target_amount" className="text-sm">Target Amount *</Label>
                          <Input
                            id="target_amount"
                            type="number"
                            step="0.01"
                            placeholder="5000.00"
                            value={formData.target_amount}
                            onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="current_amount" className="text-sm">Current Amount</Label>
                          <Input
                            id="current_amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.current_amount}
                            onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="target_date" className="text-sm">Target Date</Label>
                        <Input
                          id="target_date"
                          type="date"
                          value={formData.target_date}
                          onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                          className="mt-1"
                        />
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" size="sm" onClick={() => {
                          setIsDialogOpen(false)
                          setEditingGoal(null)
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={!canCreateGoal() && !editingGoal}>
                          {editingGoal ? 'Update' : 'Create'} Goal
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Search - Compact */}
            <div className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search goals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Summary Cards - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Total Goals</p>
                      <p className="text-lg font-bold text-gray-900">{totalGoals}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Completed</p>
                      <p className="text-lg font-bold text-gray-900">{completedGoals}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">In Progress</p>
                      <p className="text-lg font-bold text-gray-900">{inProgressGoalsCount}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goals Table */}
            <Card className="border border-gray-200 overflow-hidden">
              <div className="p-0 m-0" style={{ padding: 0, margin: 0 }}>
                {isLoading ? (
                  <div className="p-4 space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : filteredGoals.length > 0 ? (
                  <>
                    {/* Table Header */}
                    <div className="px-4 py-3 border-b border-gray-200/60 bg-gray-50/30" style={{ marginTop: 0, paddingTop: '12px' }}>
                      <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        <div className="col-span-3">Goal Name</div>
                        <div className="col-span-2 border-l border-gray-200/40 pl-3">Status</div>
                        <div className="col-span-2 border-l border-gray-200/40 pl-3">Progress</div>
                        <div className="col-span-2 border-l border-gray-200/40 pl-3">Target Amount</div>
                        <div className="col-span-2 border-l border-gray-200/40 pl-3">Due Date</div>
                        <div className="col-span-1 border-l border-gray-200/40 pl-3">Actions</div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-100/60">
                      {filteredGoals
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .slice((currentPage - 1) * 8, currentPage * 8)
                        .map((goal) => {
                          const progress = getProgressPercentage(goal.current_amount, goal.target_amount)
                          const daysRemaining = getDaysRemaining(goal.target_date)
                          const isCompleted = goal.current_amount >= goal.target_amount
                          
                          return (
                            <div key={goal.id} className="px-4 py-3 hover:bg-gray-50/50 transition-colors border-l-4 border-transparent hover:border-l-blue-200">
                              <div className="grid grid-cols-12 gap-3 items-center">
                                {/* Goal Name */}
                                <div className="col-span-3">
                                  <h3 className="text-sm font-medium text-gray-900 truncate">{goal.name}</h3>
                                  {goal.description && (
                                    <p className="text-xs text-gray-500 truncate mt-0.5">{goal.description}</p>
                                  )}
                                </div>

                                {/* Status */}
                                <div className="col-span-2 border-l border-gray-200/40 pl-3">
                                  {isCompleted ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                      <CheckCircle className="h-3 w-3" />
                                      Completed
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                      <Clock className="h-3 w-3" />
                                      In Progress
                                    </span>
                                  )}
                                </div>

                                {/* Progress */}
                                <div className="col-span-2 border-l border-gray-200/40 pl-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-gray-600">{userCurrency ? formatCurrency(goal.current_amount, userCurrency) : `€${goal.current_amount.toLocaleString()}`}</span>
                                      <span className="font-medium text-gray-900">{progress}%</span>
                                    </div>
                                    <Progress value={progress} className="h-1.5" />
                                  </div>
                                </div>

                                {/* Target Amount */}
                                <div className="col-span-2 border-l border-gray-200/40 pl-3">
                                  <span className="text-sm font-medium text-gray-900">
                                    {userCurrency ? formatCurrency(goal.target_amount, userCurrency) : `€${goal.target_amount.toLocaleString()}`}
                                  </span>
                                </div>

                                {/* Due Date */}
                                <div className="col-span-2 border-l border-gray-200/40 pl-3">
                                  {goal.target_date ? (
                                    <div className="text-xs">
                                      <div className="text-gray-600">
                                        {new Date(goal.target_date).toLocaleDateString()}
                                      </div>
                                      {daysRemaining !== null && (
                                        <div className={`font-medium ${
                                          isCompleted 
                                            ? 'text-green-600' 
                                            : daysRemaining > 0 
                                            ? 'text-gray-600' 
                                            : 'text-red-600'
                                        }`}>
                                          {isCompleted 
                                            ? daysRemaining > 0 
                                              ? `${daysRemaining} days early` 
                                              : 'Completed'
                                            : daysRemaining > 0 
                                            ? `${daysRemaining} days left`
                                            : `${Math.abs(daysRemaining)} days overdue`
                                          }
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400">No deadline</span>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 border-l border-gray-200/40 pl-3">
                                  <div className="flex items-center gap-0.5">
                                    {!isCompleted && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCompleteGoal(goal)}
                                        className="h-6 w-6 p-0 text-xs bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                        title="Complete Goal"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(goal)}
                                      className="h-6 w-6 p-0"
                                      title="Edit Goal"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(goal.id)}
                                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      title="Delete Goal"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                    </div>

                    {/* Pagination - Only show if more than 8 goals */}
                    {filteredGoals.length > 8 && (
                      <div className="border-t border-gray-200/60 px-4 py-2 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-600">
                            Showing {((currentPage - 1) * 8) + 1} to {Math.min(currentPage * 8, filteredGoals.length)} of {filteredGoals.length} goals
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="h-7 px-2"
                            >
                              Previous
                            </Button>
                            
                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(Math.ceil(filteredGoals.length / 8), 5) }, (_, i) => {
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
                              {Math.ceil(filteredGoals.length / 8) > 5 && (
                                <span className="text-xs text-gray-600 px-1">...</span>
                              )}
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage >= Math.ceil(filteredGoals.length / 8)}
                              className="h-7 px-2"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No goals found</h3>
                    <p className="text-xs text-gray-500 mb-4">Set your first financial goal to start tracking your progress</p>
                    <Button size="sm" onClick={() => setIsDialogOpen(true)} disabled={!canCreateGoal()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Goal
                    </Button>
                    {!canCreateGoal() && (
                       <p className="text-xs text-red-500 mt-2">
                        Goal limit reached ({goalsCount}/{plan.maxGoals}). Please upgrade to add more.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 