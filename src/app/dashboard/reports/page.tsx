"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Download,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  FileText
} from "lucide-react"

export default function ReportsPage() {
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
  const monthlyData = [
    { month: "Jan", income: 5200, expenses: 3800, savings: 1400 },
    { month: "Feb", income: 5350, expenses: 4100, savings: 1250 },
    { month: "Mar", income: 5200, expenses: 3900, savings: 1300 },
    { month: "Apr", income: 5500, expenses: 4200, savings: 1300 },
    { month: "May", income: 5300, expenses: 3950, savings: 1350 },
    { month: "Jun", income: 5420, expenses: 4050, savings: 1370 },
  ]

  const categoryBreakdown = [
    { category: "Food & Dining", amount: 485.20, percentage: 32, color: "#10B981" },
    { category: "Transportation", amount: 245.80, percentage: 16, color: "#3B82F6" },
    { category: "Utilities", amount: 324.50, percentage: 21, color: "#F59E0B" },
    { category: "Entertainment", amount: 156.40, percentage: 10, color: "#8B5CF6" },
    { category: "Shopping", amount: 189.90, percentage: 13, color: "#EF4444" },
    { category: "Other", amount: 120.85, percentage: 8, color: "#6B7280" },
  ]

  const reports = [
    {
      title: "Monthly Income Statement",
      description: "Detailed breakdown of income and expenses",
      period: "December 2024",
      type: "financial",
      status: "ready"
    },
    {
      title: "Category Analysis Report",
      description: "Spending patterns by category",
      period: "Last 6 months",
      type: "analysis",
      status: "ready"
    },
    {
      title: "Budget Performance Report",
      description: "Budget vs actual spending analysis",
      period: "December 2024",
      type: "budget",
      status: "ready"
    },
    {
      title: "Cash Flow Report",
      description: "Monthly cash flow trends and projections",
      period: "Last 12 months",
      type: "cashflow",
      status: "ready"
    },
    {
      title: "Tax Summary Report",
      description: "Tax-related transactions and deductions",
      period: "2024 YTD",
      type: "tax",
      status: "generating"
    }
  ]



  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Financial Reports</h1>
                <p className="text-gray-600 mt-1">Generate and download detailed financial reports</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  December 2024
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Income</p>
                      <p className="text-2xl font-bold text-gray-900">$32,170</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                      <p className="text-2xl font-bold text-gray-900">$24,000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Net Savings</p>
                      <p className="text-2xl font-bold text-gray-900">$8,170</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                      <p className="text-2xl font-bold text-gray-900">25.4%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Monthly Trends Chart */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </div>
                    
                    <div className="space-y-4">
                      {monthlyData.map((data, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{data.month}</span>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-green-600">+${data.income.toLocaleString()}</span>
                              <span className="text-red-600">-${data.expenses.toLocaleString()}</span>
                              <span className="text-blue-600 font-medium">${data.savings.toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-1 h-2">
                            {/* Income bar */}
                            <div 
                              className="bg-green-500 rounded-l"
                              style={{ width: `${(data.income / 6000) * 70}%` }}
                            />
                            {/* Expenses bar */}
                            <div 
                              className="bg-red-500"
                              style={{ width: `${(data.expenses / 6000) * 70}%` }}
                            />
                            {/* Savings bar */}
                            <div 
                              className="bg-blue-500 rounded-r"
                              style={{ width: `${(data.savings / 6000) * 70}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-sm text-gray-600">Income</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-sm text-gray-600">Expenses</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-sm text-gray-600">Savings</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Breakdown */}
              <div>
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
                      <PieChart className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="space-y-4">
                      {categoryBreakdown.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="text-sm font-medium text-gray-900">{category.category}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">${category.amount}</p>
                              <p className="text-xs text-gray-500">{category.percentage}%</p>
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full transition-all"
                              style={{ 
                                width: `${category.percentage}%`,
                                backgroundColor: category.color 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>

            {/* Available Reports */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Reports</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report, index) => (
                  <Card key={index} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <FileText className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{report.title}</h3>
                            <p className="text-sm text-gray-500">{report.period}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          report.status === 'ready' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {report.status === 'ready' ? 'Ready' : 'Generating...'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          disabled={report.status !== 'ready'}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          disabled={report.status !== 'ready'}
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
} 