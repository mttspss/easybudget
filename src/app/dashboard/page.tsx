"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react"

export default function Dashboard() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/")
  }

  const kpiData = [
    {
      title: "Balance",
      value: "$12,345",
      trend: "+5.2%",
      isPositive: true,
      icon: DollarSign
    },
    {
      title: "Income", 
      value: "$5,420",
      trend: "+12.3%",
      isPositive: true,
      icon: TrendingUp
    },
    {
      title: "Expenses",
      value: "$3,210", 
      trend: "+8.1%",
      isPositive: false,
      icon: TrendingDown
    },
    {
      title: "Savings",
      value: "$2,135",
      trend: "+15.7%", 
      isPositive: true,
      icon: Target
    }
  ]

  const tasks = [
    { id: 1, title: "Review Q2 expenses", status: "pending", priority: "high" },
    { id: 2, title: "Upload bank statements", status: "pending", priority: "medium" },
    { id: 3, title: "Categorize transactions", status: "completed", priority: "low" },
    { id: 4, title: "Update savings goal", status: "pending", priority: "high" },
    { id: 5, title: "Monthly budget review", status: "overdue", priority: "high" }
  ]

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        
        <main className="flex-1 overflow-auto">
          <div className="main-grid">
            {/* Row 1: KPI Cards */}
            <div className="col-span-12 grid grid-cols-4 gap-6 mb-8">
              {kpiData.map((kpi, index) => (
                <div key={index} className="kpi-card">
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {kpi.title}
                    </span>
                    <kpi.icon 
                      className="h-4 w-4"
                      style={{ color: 'var(--text-secondary)' }}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <div className="kpi-number">{kpi.value}</div>
                    <div className={kpi.isPositive ? "trend-positive" : "trend-negative"}>
                      {kpi.isPositive ? (
                        <ArrowUp className="h-4 w-4" />
                      ) : (
                        <ArrowDown className="h-4 w-4" />
                      )}
                      {kpi.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2: Tasks List (span 8) + Goal Progress (span 4) */}
            <div className="col-span-8">
              <div 
                className="bg-white border rounded-3xl p-6"
                style={{
                  borderColor: 'var(--card-border)',
                  boxShadow: 'var(--elevation-1)'
                }}
              >
                <h3 
                  className="font-semibold mb-6"
                  style={{ 
                    fontSize: 'var(--text-md)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Financial Tasks
                </h3>
                
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0">
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5" style={{ color: 'var(--mint)' }} />
                        ) : task.status === 'overdue' ? (
                          <AlertCircle className="h-5 w-5" style={{ color: 'var(--error)' }} />
                        ) : (
                          <Clock className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p 
                          className="font-medium"
                          style={{ 
                            fontSize: 'var(--text-sm)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {task.title}
                        </p>
                        <p 
                          className="text-xs mt-1"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          Priority: {task.priority} • Status: {task.status}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'high' 
                              ? 'bg-red-50 text-red-700'
                              : task.priority === 'medium'
                              ? 'bg-yellow-50 text-yellow-700' 
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {task.priority}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-4">
              <div 
                className="bg-white border rounded-3xl p-6"
                style={{
                  borderColor: 'var(--card-border)',
                  boxShadow: 'var(--elevation-1)'
                }}
              >
                <h3 
                  className="font-semibold mb-6"
                  style={{ 
                    fontSize: 'var(--text-md)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Goal Progress
                </h3>
                
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#E5E9F0"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="var(--mint)"
                        strokeWidth="8"
                        strokeDasharray={`${68 * 2.51}, 251.2`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span 
                        className="font-bold"
                        style={{ 
                          fontSize: 'var(--text-lg)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        68%
                      </span>
                    </div>
                  </div>
                  
                  <p 
                    className="font-medium mb-2"
                    style={{ 
                      fontSize: 'var(--text-base)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    Emergency Fund
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    $3,400 of $5,000 goal
                  </p>
                </div>
              </div>
            </div>

            {/* Row 3: Cash-Flow Forecast (span 8) + Recurring Subscriptions (span 4) */}
            <div className="col-span-8 mt-6">
              <div 
                className="bg-white border rounded-3xl p-6"
                style={{
                  borderColor: 'var(--card-border)',
                  boxShadow: 'var(--elevation-1)'
                }}
              >
                <h3 
                  className="font-semibold mb-6"
                  style={{ 
                    fontSize: 'var(--text-md)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Cash-Flow Forecast
                </h3>
                
                <div className="h-40 flex items-end justify-between gap-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => {
                    const heights = [60, 75, 45, 90, 65, 85]
                    return (
                      <div key={month} className="flex flex-col items-center gap-2">
                        <div 
                          className="w-8 rounded-t"
                          style={{ 
                            height: `${heights[index]}%`,
                            backgroundColor: 'var(--mint)'
                          }}
                        ></div>
                        <span 
                          className="text-xs"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {month}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="col-span-4 mt-6">
              <div 
                className="bg-white border rounded-3xl p-6"
                style={{
                  borderColor: 'var(--card-border)',
                  boxShadow: 'var(--elevation-1)'
                }}
              >
                <h3 
                  className="font-semibold mb-6"
                  style={{ 
                    fontSize: 'var(--text-md)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Recurring Subscriptions
                </h3>
                
                <div className="space-y-4">
                  {[
                    { name: 'Netflix', amount: '$15.99', status: 'active' },
                    { name: 'Spotify', amount: '$9.99', status: 'active' },
                    { name: 'Adobe CC', amount: '$52.99', status: 'cancelled' }
                  ].map((sub, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p 
                          className="font-medium"
                          style={{ 
                            fontSize: 'var(--text-sm)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {sub.name}
                        </p>
                        <p 
                          className="text-xs"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {sub.status}
                        </p>
                      </div>
                      <span 
                        className="font-semibold"
                        style={{ 
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {sub.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 