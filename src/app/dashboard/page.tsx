"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Filter,
  Search,
  MoreVertical,
  Calendar
} from "lucide-react"
import { Input } from "@/components/ui/input"

export default function Dashboard() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/")
  }

  const statsCards = [
    {
      title: "Total Balance",
      value: "$12,345",
      change: "+5",
      changeType: "increase",
      period: "vs last month",
      icon: DollarSign,
      color: "text-blue-600"
    },
    {
      title: "Monthly Income",
      value: "$5,420",
      change: "+2",
      changeType: "increase", 
      period: "vs last month",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Monthly Expenses",
      value: "$3,210",
      change: "+12",
      changeType: "increase",
      period: "vs last month", 
      icon: TrendingDown,
      color: "text-red-600"
    },
    {
      title: "Savings Rate",
      value: "68%",
      change: "+15",
      changeType: "increase",
      period: "vs last week",
      icon: Target,
      color: "text-purple-600"
    }
  ]

  const todaysTasks = [
    {
      name: "Review Q2 expenses",
      category: "Monthly Review",
      due: "27 May 2024",
      status: "pending"
    },
    {
      name: "Upload bank statements",
      category: "Data Import",
      due: "27 May 2024", 
      status: "pending"
    },
    {
      name: "Update savings goal",
      category: "Goal Planning",
      due: "27 May 2024",
      status: "pending"
    },
    {
      name: "Categorize transactions",
      category: "Data Management",
      due: "27 May 2024",
      status: "pending"
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={`Welcome Back, ${session.user?.name?.split(' ')[0]}! 👋`}
          subtitle={`4 Tasks Due Today, 2 Overdue Tasks, 8 Upcoming Deadlines (This Week)`}
        />
        
        <main className="flex-1 overflow-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className={`text-xs flex items-center mt-1 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.changeType === 'increase' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.change} {stat.period}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Tasks */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-bold">Today&apos;s Financial Tasks</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input placeholder="Search here..." className="pl-10 w-64" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {todaysTasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <div>
                            <p className="font-medium text-gray-900">{task.name}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {task.category}
                              </Badge>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {task.due}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <div>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gray-900">86%</div>
                    <p className="text-sm text-green-600 flex items-center justify-center mt-1">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      +15% vs last Week
                    </p>
                  </div>
                  
                  {/* Simple Chart Placeholder */}
                  <div className="space-y-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => {
                      const heights = [60, 75, 90, 65, 85]
                      return (
                        <div key={day} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-8">{day}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${heights[index]}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-8">+{[82, 51, 86, 45, 82][index]}%</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 