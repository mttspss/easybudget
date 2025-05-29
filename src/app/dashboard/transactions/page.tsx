"use client"

import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Plus,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  MoreHorizontal
} from "lucide-react"

export default function TransactionsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    redirect("/")
  }

  // Static data for now - will be replaced with real data from database
  const transactions = [
    {
      id: 1,
      description: "Whole Foods Market",
      category: "Food & Dining",
      amount: -127.85,
      date: "2024-12-27",
      time: "2:30 PM",
      status: "completed",
      account: "Chase Checking"
    },
    {
      id: 2,
      description: "Salary Deposit",
      category: "Income",
      amount: 2710.00,
      date: "2024-12-01",
      time: "9:00 AM",
      status: "completed",
      account: "Chase Checking"
    },
    {
      id: 3,
      description: "Electric Bill - ConEd",
      category: "Utilities",
      amount: -124.50,
      date: "2024-12-01",
      time: "10:15 AM",
      status: "completed",
      account: "Chase Checking"
    },
    {
      id: 4,
      description: "Starbucks Coffee",
      category: "Food & Dining",
      amount: -12.50,
      date: "2024-12-26",
      time: "8:45 AM",
      status: "completed",
      account: "Chase Checking"
    },
    {
      id: 5,
      description: "Shell Gas Station",
      category: "Transportation",
      amount: -45.20,
      date: "2024-12-26",
      time: "5:20 PM",
      status: "completed",
      account: "Chase Checking"
    },
    {
      id: 6,
      description: "Netflix Subscription",
      category: "Entertainment",
      amount: -15.99,
      date: "2024-12-25",
      time: "12:00 PM",
      status: "completed",
      account: "Chase Checking"
    },
    {
      id: 7,
      description: "Amazon Purchase",
      category: "Shopping",
      amount: -89.99,
      date: "2024-12-24",
      time: "3:15 PM",
      status: "completed",
      account: "Chase Checking"
    },
    {
      id: 8,
      description: "Freelance Payment",
      category: "Income",
      amount: 850.00,
      date: "2024-12-23",
      time: "11:30 AM",
      status: "completed",
      account: "Chase Checking"
    }
  ]

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Food & Dining": "#10B981",
      "Transportation": "#3B82F6", 
      "Entertainment": "#8B5CF6",
      "Utilities": "#F59E0B",
      "Shopping": "#EF4444",
      "Income": "#059669"
    }
    return colors[category] || "#6B7280"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

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
                <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
                <p className="text-gray-600 mt-1">Track and manage all your financial transactions</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last 30 days
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </div>
            </div>

            {/* Search and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">This Month</p>
                      <p className="text-xl font-bold text-gray-900">$2,589.25</p>
                      <p className="text-xs text-green-600">+12.3% vs last month</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Transactions Table */}
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-600">Description</th>
                        <th className="text-left p-4 font-medium text-gray-600">Category</th>
                        <th className="text-left p-4 font-medium text-gray-600">Account</th>
                        <th className="text-left p-4 font-medium text-gray-600">Date</th>
                        <th className="text-right p-4 font-medium text-gray-600">Amount</th>
                        <th className="w-12 p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                {transaction.amount > 0 ? (
                                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                                ) : (
                                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{transaction.description}</p>
                                <p className="text-sm text-gray-500">{transaction.time}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getCategoryColor(transaction.category) }}
                              />
                              <span className="text-sm text-gray-700">{transaction.category}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-600">{transaction.account}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-600">{formatDate(transaction.date)}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className={`font-semibold ${
                              transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
                            }`}>
                              {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  )
} 