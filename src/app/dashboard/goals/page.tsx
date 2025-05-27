"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react"

export default function GoalsPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/")
  }

  // Static data for now - will be replaced with real data from database
  const goals = [
    {
      id: 1,
      title: "Emergency Fund",
      description: "Build an emergency fund for unexpected expenses",
      targetAmount: 5000,
      currentAmount: 3400,
      deadline: "2024-06-30",
      status: "in_progress",
      category: "Savings",
      color: "#10B981"
    },
    {
      id: 2,
      title: "Vacation to Europe",
      description: "Save for a 2-week trip to Europe next summer",
      targetAmount: 4500,
      currentAmount: 1250,
      deadline: "2024-05-15",
      status: "in_progress",
      category: "Travel",
      color: "#3B82F6"
    },
    {
      id: 3,
      title: "New Laptop",
      description: "Buy a new MacBook Pro for work",
      targetAmount: 2500,
      currentAmount: 2500,
      deadline: "2024-03-01",
      status: "completed",
      category: "Technology",
      color: "#8B5CF6"
    },
    {
      id: 4,
      title: "Car Down Payment",
      description: "Save for down payment on a new car",
      targetAmount: 8000,
      currentAmount: 2100,
      deadline: "2024-12-31",
      status: "in_progress",
      category: "Transportation",
      color: "#F59E0B"
    },
    {
      id: 5,
      title: "Home Renovation",
      description: "Kitchen renovation project",
      targetAmount: 15000,
      currentAmount: 5200,
      deadline: "2024-08-01",
      status: "behind",
      category: "Home",
      color: "#EF4444"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "behind":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50"
      case "behind":
        return "text-red-600 bg-red-50"
      default:
        return "text-blue-600 bg-blue-50"
    }
  }

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getDaysRemaining = (dateString: string) => {
    const deadline = new Date(dateString)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const activeGoals = goals.filter(goal => goal.status !== "completed")
  const completedGoals = goals.filter(goal => goal.status === "completed")
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const overallProgress = (totalCurrentAmount / totalTargetAmount) * 100

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Goals" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Financial Goals</h1>
                <p className="text-gray-600 mt-1">Track your progress towards financial milestones</p>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Goals</p>
                      <p className="text-2xl font-bold text-gray-900">{activeGoals.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{completedGoals.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Saved</p>
                      <p className="text-2xl font-bold text-gray-900">${totalCurrentAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                      <p className="text-2xl font-bold text-gray-900">{overallProgress.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Goals */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeGoals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100
                  const daysRemaining = getDaysRemaining(goal.deadline)
                  
                  return (
                    <Card key={goal.id} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(goal.status)}
                            <div>
                              <h3 className="font-medium text-gray-900">{goal.title}</h3>
                              <p className="text-sm text-gray-500">{goal.category}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="font-semibold">{progress.toFixed(1)}%</span>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${Math.min(progress, 100)}%`,
                                backgroundColor: goal.color
                              }}
                            />
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {formatDeadline(goal.deadline)}
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(goal.status)}`}>
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Goals</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedGoals.map((goal) => (
                    <Card key={goal.id} className="border-0 shadow-sm bg-white opacity-75">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <div>
                              <h3 className="font-medium text-gray-900">{goal.title}</h3>
                              <p className="text-sm text-gray-500">{goal.category}</p>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                        
                        <div className="space-y-3">
                          <div className="w-full bg-green-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-green-500 w-full"
                            />
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              ${goal.targetAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                            </span>
                            <span className="text-green-600 font-medium">Completed!</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
} 