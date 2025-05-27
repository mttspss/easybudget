"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Hash
} from "lucide-react"

export default function ImportPage() {
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
      filename: "chase_checking_2024_05.csv",
      date: "2024-05-27",
      transactions: 34,
      status: "completed"
    },
    {
      filename: "bofa_savings_2024_05.csv", 
      date: "2024-05-26",
      transactions: 12,
      status: "completed"
    },
    {
      filename: "wells_credit_2024_05.csv",
      date: "2024-05-25", 
      transactions: 28,
      status: "failed"
    }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Import CSV Files"
          subtitle="Upload your bank statements to automatically categorize and track your transactions"
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Upload Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Upload CSV File
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Choose a CSV file to upload
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Drag and drop your bank statement CSV file here, or click to browse
                    </p>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                    <p className="text-xs text-gray-400 mt-4">
                      Supports CSV files up to 10MB. Auto-detects date, description, and amount columns.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Column Mapping Preview */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Hash className="h-5 w-5 text-blue-600" />
                    Column Mapping Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Date Column</p>
                        <p className="text-xs text-gray-500">Auto-detected</p>
                      </div>
                      <div className="text-center">
                        <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Description Column</p>
                        <p className="text-xs text-gray-500">Auto-detected</p>
                      </div>
                      <div className="text-center">
                        <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-medium">Amount Column</p>
                        <p className="text-xs text-gray-500">Auto-detected</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Our smart detection will automatically identify your columns. You can adjust if needed.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Imports */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Recent Imports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentImports.map((importItem, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">{importItem.filename}</p>
                            <p className="text-sm text-gray-500">{importItem.transactions} transactions • {importItem.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={importItem.status === 'completed' ? 'default' : 'destructive'}
                            className={importItem.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                          >
                            {importItem.status === 'completed' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            )}
                            {importItem.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
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
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Supported Formats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {supportedFormats.map((format, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{format.bank}</p>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="text-xs text-gray-600">{format.format}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tips */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Import Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600">
                        Ensure your CSV includes date, description, and amount columns
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600">
                        Use negative amounts for expenses, positive for income
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600">
                        Remove any header or footer text from your bank export
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600">
                        Our system will automatically categorize transactions
                      </p>
                    </div>
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