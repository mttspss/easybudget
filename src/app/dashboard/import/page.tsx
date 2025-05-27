"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Calendar,
  DollarSign,
  Hash,
  HelpCircle,
  Database
} from "lucide-react"

export default function ImportPage() {
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

  const supportedFormats = [
    {
      bank: "Chase Bank",
      format: "Date, Description, Amount, Type",
      status: "supported"
    },
    {
      bank: "Bank of America", 
      format: "Transaction Date, Description, Amount",
      status: "supported"
    },
    {
      bank: "Wells Fargo",
      format: "Date, Amount, Description, Balance",
      status: "supported"
    },
    {
      bank: "Capital One",
      format: "Transaction Date, Posted Date, Description, Debit, Credit",
      status: "supported"
    }
  ]

  const recentImports = [
    {
      filename: "chase_checking_2024_12.csv",
      date: "2024-12-27",
      transactions: 34,
      status: "completed"
    },
    {
      filename: "bofa_savings_2024_12.csv", 
      date: "2024-12-26",
      transactions: 12,
      status: "completed"
    },
    {
      filename: "wells_credit_2024_12.csv",
      date: "2024-12-25", 
      transactions: 28,
      status: "failed"
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Import CSV" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Import Transactions</h1>
                <p className="text-gray-600 mt-1">Upload your bank CSV files to automatically import transactions</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help Guide
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Upload Section */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* File Upload Card */}
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Upload className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload CSV File</h3>
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                      <Upload className="mx-auto h-10 w-10 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Choose a CSV file to upload
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Drag and drop your bank statement CSV file here, or click to browse
                      </p>
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Browse Files
                      </Button>
                      <p className="text-xs text-gray-400 mt-3">
                        Supports CSV files up to 10MB. Auto-detects date, description, and amount columns.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Column Mapping Preview */}
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Hash className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Column Mapping Preview</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto mb-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Date Column</p>
                        <p className="text-xs text-gray-500">Auto-detected</p>
                      </div>
                      <div className="text-center">
                        <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto mb-2">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Description</p>
                        <p className="text-xs text-gray-500">Auto-detected</p>
                      </div>
                      <div className="text-center">
                        <div className="p-2 bg-orange-100 rounded-lg w-fit mx-auto mb-2">
                          <DollarSign className="h-5 w-5 text-orange-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Amount</p>
                        <p className="text-xs text-gray-500">Auto-detected</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 text-center mt-4">
                      Our smart detection automatically identifies your columns. You can adjust mappings if needed.
                    </p>
                  </CardContent>
                </Card>

                {/* Recent Imports */}
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Database className="h-5 w-5 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Recent Imports</h3>
                      </div>
                      <Button variant="ghost" size="sm">View All</Button>
                    </div>
                    
                    <div className="space-y-3">
                      {recentImports.map((importItem, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <FileText className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{importItem.filename}</p>
                              <p className="text-sm text-gray-500">{importItem.transactions} transactions • {importItem.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={importItem.status === 'completed' ? 'default' : 'destructive'}
                              className={`${
                                importItem.status === 'completed' 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {importItem.status === 'completed' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 mr-1" />
                              )}
                              {importItem.status}
                            </Badge>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                
                {/* Supported Formats */}
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Supported Banks</h3>
                    <div className="space-y-3">
                      {supportedFormats.map((format, index) => (
                        <div key={index} className="p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{format.bank}</h4>
                            <Badge className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Supported
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{format.format}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Don&apos;t see your bank? Most CSV formats work automatically.
                    </p>
                  </CardContent>
                </Card>

                {/* Import Tips */}
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Tips</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <CheckCircle className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Use UTF-8 encoding</p>
                          <p className="text-xs text-gray-600">Ensures special characters display correctly</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <CheckCircle className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Include headers</p>
                          <p className="text-xs text-gray-600">First row should contain column names</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="p-1 bg-blue-100 rounded-full">
                          <CheckCircle className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Review duplicates</p>
                          <p className="text-xs text-gray-600">We&apos;ll flag potential duplicate transactions</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 