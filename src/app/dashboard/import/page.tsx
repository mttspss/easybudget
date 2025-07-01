"use client"

import { useAuth } from "@/lib/auth-context"
import { useDashboards } from "@/lib/dashboard-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  Upload,
  FileText,
  Database,
  Download,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
  Tag,
  Eye,
  Plus
} from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { createDefaultCategories } from "@/lib/default-categories"
import { getUserCurrency, formatCurrency, type CurrencyConfig } from "@/lib/currency"
import { DashboardIndicator } from "@/components/dashboard-indicator"
import { useSubscription } from "@/lib/subscription-context"
import { suggestCategoryWithAI } from "@/lib/ai/category-analyzer"

interface ParsedTransaction {
  id: string
  description: string
  amount: number
  date: string
  type: 'income' | 'expense'
  category_id?: string
  suggested_category?: string
  confidence: number
  row_index: number
  errors: string[]
}

interface ImportState {
  step: 'upload' | 'preview' | 'mapping' | 'processing' | 'complete'
  file: File | null
  rawData: any[]
  headers: string[]
  parsedTransactions: ParsedTransaction[]
  columnMapping: {
    description: string
    amount: string
    date: string
    type?: string
  }
  categories: any[]
  progress: number
  errors: string[]
  importedCount: number
  skippedCount: number
  duplicateCount: number
}

export default function ImportPage() {
  const { user, loading } = useAuth()
  const { activeDashboard } = useDashboards()
  const { plan, csvImportsThisMonth, canImportCsv, recordCsvImport } = useSubscription()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [importState, setImportState] = useState<ImportState>({
    step: 'upload',
    file: null,
    rawData: [],
    headers: [],
    parsedTransactions: [],
    columnMapping: {
      description: '',
      amount: '',
      date: '',
      type: ''
    },
    categories: [],
    progress: 0,
    errors: [],
    importedCount: 0,
    skippedCount: 0,
    duplicateCount: 0
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [newCategoryModal, setNewCategoryModal] = useState({
    open: false,
    transactionIndex: -1,
    name: '',
    color: '#3B82F6',
    icon: '💰',
    type: 'expense' as 'income' | 'expense'
  })

  const [userCurrency, setUserCurrency] = useState<CurrencyConfig | null>(null)

  const fetchCategories = useCallback(async () => {
    if (!user) return
    
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (!data || data.length === 0) {
        // Create default categories if none exist
        console.log('No categories found, creating default categories...')
        const success = await createDefaultCategories(user.id)
        
        if (success) {
          // Fetch the newly created categories
          const { data: newData } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id)
            .order('name')
          
          setImportState(prev => ({ ...prev, categories: newData || [] }))
        } else {
          setImportState(prev => ({ ...prev, categories: [] }))
        }
      } else {
        setImportState(prev => ({ ...prev, categories: data }))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setImportState(prev => ({ ...prev, categories: [] }))
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user, fetchCategories])

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    redirect("/")
  }

  const parseCSV = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length === 0) return { headers: [], data: [] }
    
    const parseCSVLine = (line: string) => {
      const result = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = parseCSVLine(lines[0])
    const data = lines.slice(1).map((line, index) => {
      const values = parseCSVLine(line)
      const row: any = { _rowIndex: index + 1 }
      headers.forEach((header, i) => {
        row[header] = values[i] || ''
      })
      return row
    })

    return { headers, data }
  }

  const detectColumnMapping = (headers: string[]) => {
    const mapping = {
      description: '',
      amount: '',
      date: '',
      type: ''
    }

    headers.forEach(header => {
      const lower = header.toLowerCase()
      
      if (!mapping.description && (
        lower.includes('description') || 
        lower.includes('memo') || 
        lower.includes('details') ||
        lower.includes('reference') ||
        lower.includes('payee')
      )) {
        mapping.description = header
      }
      
      if (!mapping.amount && (
        lower.includes('amount') || 
        lower.includes('value') || 
        lower.includes('sum') ||
        lower === 'debit' ||
        lower === 'credit'
      )) {
        mapping.amount = header
      }
      
      if (!mapping.date && (
        lower.includes('date') || 
        lower.includes('time') || 
        lower === 'when'
      )) {
        mapping.date = header
      }
      
      if (!mapping.type && (
        lower.includes('type') || 
        lower.includes('category') || 
        lower.includes('direction')
      )) {
        mapping.type = header
      }
    })

    return mapping
  }

  const suggestCategory = async (description: string, amount: number, type: 'income' | 'expense'): Promise<{ category: string, confidence: number }> => {
    // Check if AI is enabled via environment variable
    const aiEnabled = process.env.NEXT_PUBLIC_ENABLE_AI_CATEGORIZATION === 'true'
    
    if (aiEnabled) {
      try {
        // Use AI for categorization
        const aiRequest = {
          description,
          amount,
          type,
          availableCategories: importState.categories.map(cat => ({ 
            name: cat.name, 
            type: cat.type 
          })),
          userContext: {
            country: 'International', // Will be auto-detected by AI from transaction content
            currency: userCurrency?.code || 'USD'
          }
        }
        
        const aiResult = await suggestCategoryWithAI(aiRequest)
        return { 
          category: aiResult.category, 
          confidence: aiResult.confidence 
        }
        
      } catch (aiError) {
        console.warn('AI categorization failed, falling back to pattern matching:', aiError)
        // Fall through to legacy method
      }
    }
    
    // Legacy pattern matching (fallback)
    const desc = description.toLowerCase()
    
    const patterns = [
      { keywords: ['grocery', 'food', 'restaurant', 'cafe', 'dining'], category: 'Food & Dining', confidence: 0.9 },
      { keywords: ['gas', 'fuel', 'station', 'shell', 'exxon'], category: 'Transportation', confidence: 0.85 },
      { keywords: ['amazon', 'store', 'shop', 'market'], category: 'Shopping', confidence: 0.8 },
      { keywords: ['salary', 'payroll', 'income', 'wages'], category: 'Income', confidence: 0.95 },
      { keywords: ['rent', 'mortgage', 'utilities', 'electric', 'water'], category: 'Home', confidence: 0.9 },
      { keywords: ['netflix', 'spotify', 'entertainment', 'movie'], category: 'Entertainment', confidence: 0.85 }
    ]

    for (const pattern of patterns) {
      for (const keyword of pattern.keywords) {
        if (desc.includes(keyword)) {
          return { category: pattern.category, confidence: pattern.confidence }
        }
      }
    }

    return { category: 'Uncategorized', confidence: 0.1 }
  }

  const parseDate = (dateStr: string): string | null => {
    try {
      if (!dateStr || typeof dateStr !== 'string') return null
      
      const cleanDateStr = dateStr.trim()
      
      // Extract date part from common formats
      let dateOnly = cleanDateStr
      
      // If it contains time/timestamp, extract only the date part
      if (cleanDateStr.includes(' ')) {
        dateOnly = cleanDateStr.split(' ')[0] // Take everything before the first space
      } else if (cleanDateStr.includes('T')) {
        dateOnly = cleanDateStr.split('T')[0] // Take everything before 'T' (ISO format)
      }
      
      // Try to parse the date
      const date = new Date(dateOnly)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
      
      // If direct parsing fails, try with different separators
      const dateParts = dateOnly.match(/(\d{1,4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,4})/)
      if (dateParts) {
        const [, part1, part2, part3] = dateParts
        
        // Determine if it's YYYY-MM-DD or DD/MM/YYYY or MM/DD/YYYY
        let year, month, day
        
        if (part1.length === 4) {
          // YYYY-MM-DD format
          year = parseInt(part1)
          month = parseInt(part2)
          day = parseInt(part3)
        } else {
          // Assume DD/MM/YYYY or MM/DD/YYYY, try both
          year = parseInt(part3)
          // Try European format first (DD/MM/YYYY)
          month = parseInt(part2)
          day = parseInt(part1)
          
          // Validate and switch if day > 12 (likely MM/DD/YYYY)
          if (day > 12 && month <= 12) {
            [day, month] = [month, day]
          }
        }
        
        // Create date and validate
        const parsedDate = new Date(year, month - 1, day)
        if (!isNaN(parsedDate.getTime()) && 
            parsedDate.getFullYear() === year &&
            parsedDate.getMonth() === month - 1 &&
            parsedDate.getDate() === day) {
          return parsedDate.toISOString().split('T')[0]
        }
      }

      return null
    } catch {
      return null
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      toast.error('Please upload a CSV or Excel file')
      return
    }

    setIsProcessing(true)
    
    try {
      let content = ''
      
      if (file.name.match(/\.csv$/i)) {
        content = await file.text()
      } else {
        toast.error('Excel files not yet supported. Please convert to CSV.')
        setIsProcessing(false)
        return
      }

      const { headers, data } = parseCSV(content)
      
      if (headers.length === 0 || data.length === 0) {
        toast.error('The file appears to be empty or invalid')
        setIsProcessing(false)
        return
      }

      const detectedMapping = detectColumnMapping(headers)
      
      setImportState(prev => ({
        ...prev,
        step: 'preview',
        file,
        rawData: data,
        headers,
        columnMapping: detectedMapping
      }))

      toast.success(`File uploaded successfully! Found ${data.length} rows.`)
    } catch (error) {
      toast.error('Error reading file. Please check the format.')
      console.error('File upload error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const parseTransactions = async () => {
    const { rawData, columnMapping } = importState
    const transactions: ParsedTransaction[] = []

    for (let index = 0; index < rawData.length; index++) {
      const row = rawData[index]
      const errors: string[] = []
      
      const description = row[columnMapping.description] || `Transaction ${index + 1}`
      const amountStr = row[columnMapping.amount]
      const dateStr = row[columnMapping.date]
      const typeStr = row[columnMapping.type || '']

      let amount = 0
      let isNegative = false
      if (amountStr) {
        const cleanAmount = amountStr.toString().replace(/[,$\s]/g, '')
        // Check if the original amount was negative
        isNegative = cleanAmount.startsWith('-')
        const parsed = parseFloat(cleanAmount)
        if (!isNaN(parsed)) {
          amount = Math.abs(parsed)
        } else {
          errors.push('Invalid amount format')
        }
      } else {
        errors.push('Missing amount')
      }

      const parsedDate = parseDate(dateStr)
      if (!parsedDate) {
        errors.push('Invalid or missing date')
      }

      let type: 'income' | 'expense' = 'expense'
      
      // Priority 1: Amount sign (most reliable)
      if (amountStr) {
        if (!isNegative) {
          type = 'income'  // Positive amount = Income
        } else {
          type = 'expense' // Negative amount = Expense
        }
      } else if (typeStr) {
        // Priority 2: Type column (fallback only if no amount)
        const typeValue = typeStr.toString().toLowerCase()
        if (typeValue.includes('income') || typeValue.includes('credit') || typeValue.includes('deposit') || typeValue.includes('topup')) {
          type = 'income'
        }
      }

      const { category: suggestedCategory, confidence } = await suggestCategory(description, amount, type)

      transactions.push({
        id: `temp_${index}`,
        description,
        amount,
        date: parsedDate || new Date().toISOString().split('T')[0],
        type,
        suggested_category: suggestedCategory,
        confidence,
        row_index: index + 1,
        errors
      })
    }

    setImportState(prev => ({
      ...prev,
      step: 'mapping',
      parsedTransactions: transactions
    }))
  }

  const processImport = async () => {
    if (!user) return

    setIsProcessing(true)
    setImportState(prev => ({ ...prev, step: 'processing', progress: 0 }))

    try {
      const validTransactions = importState.parsedTransactions.filter(t => t.errors.length === 0)
      let imported = 0
      let skipped = 0

      console.log(`Processing ${validTransactions.length} valid transactions`)

      // Dashboard filter: assign transactions to active dashboard
      const dashboardFilter = activeDashboard?.id || null

      for (let i = 0; i < validTransactions.length; i++) {
        const transaction = validTransactions[i]
        
        console.log(`Processing transaction ${i + 1}:`, {
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date,
          type: transaction.type
        })
        
        // No duplicate checking - insert all transactions
        let categoryId = null
        if (transaction.category_id) {
          categoryId = transaction.category_id
        } else if (transaction.suggested_category) {
          const category = importState.categories.find(c => c.name === transaction.suggested_category)
          categoryId = category?.id || null
        }

        // If still no category, assign a default one based on type
        if (!categoryId) {
          const defaultCategory = importState.categories.find(c => 
            c.type === transaction.type && 
            (c.name === 'Other Expenses' || c.name === 'Other Income' || c.name === 'Uncategorized')
          ) || importState.categories.find(c => c.type === transaction.type)
          
          categoryId = defaultCategory?.id || null
        }

        // Skip transaction if we still don't have a category
        if (!categoryId) {
          console.error('No category available for transaction:', transaction.description)
          skipped++
          continue
        }

        console.log(`Inserting transaction with category:`, categoryId)

        const transactionData = {
          user_id: user.id,
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date,
          type: transaction.type,
          category_id: categoryId,
          dashboard_id: dashboardFilter
        }

        console.log('Transaction data to insert:', transactionData)

        const { data: insertedData, error } = await supabase
          .from('transactions')
          .insert(transactionData)
          .select()

        if (error) {
          console.error('Error inserting transaction:', error)
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          console.error('Transaction data that failed:', transactionData)
          skipped++
        } else {
          console.log('Transaction inserted successfully:', insertedData)
          imported++
        }

        const progress = ((i + 1) / validTransactions.length) * 100
        setImportState(prev => ({ ...prev, progress }))
      }

      console.log(`Import completed: ${imported} imported, ${skipped} skipped`)

      setImportState(prev => ({
        ...prev,
        step: 'complete',
        importedCount: imported,
        skippedCount: skipped
      }))

      if (imported > 0) {
        // Record the successful import
        await recordCsvImport()
        toast.success(`Import completed! ${imported} transactions imported to ${activeDashboard?.name || 'Main Dashboard'}.`)
      } else {
        toast.error(`Import failed. ${skipped} transactions had errors.`)
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Error during import. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetImport = () => {
    setImportState({
      step: 'upload',
      file: null,
      rawData: [],
      headers: [],
      parsedTransactions: [],
      columnMapping: {
        description: '',
        amount: '',
        date: '',
        type: ''
      },
      categories: importState.categories,
      progress: 0,
      errors: [],
      importedCount: 0,
      skippedCount: 0,
      duplicateCount: 0
    })
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const csvContent = "description,amount,date,type\nGrocery Store,-50.00,2024-01-15,expense\nSalary,3000.00,2024-01-01,income\nGas Station,-40.00,2024-01-10,expense"
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'easybudget_import_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Template downloaded!')
  }

  const goToPreviousStep = () => {
    const steps = ['upload', 'preview', 'mapping', 'processing', 'complete']
    const currentIndex = steps.indexOf(importState.step)
    if (currentIndex > 0) {
      setImportState(prev => ({ ...prev, step: steps[currentIndex - 1] as any }))
    }
  }

  const stepIndex = ['upload', 'preview', 'mapping', 'processing', 'complete'].indexOf(importState.step)

  const createNewCategory = async () => {
    if (!user || !newCategoryModal.name.trim()) return

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: newCategoryModal.name.trim(),
          color: newCategoryModal.color,
          icon: newCategoryModal.icon,
          type: newCategoryModal.type
        })
        .select()
        .single()

      if (error) throw error

      // Update categories list
      setImportState(prev => ({
        ...prev,
        categories: [...prev.categories, data].sort((a, b) => a.name.localeCompare(b.name))
      }))

      // Assign the new category to the transaction
      if (newCategoryModal.transactionIndex >= 0) {
        const updated = [...importState.parsedTransactions]
        updated[newCategoryModal.transactionIndex].category_id = data.id
        setImportState(prev => ({ ...prev, parsedTransactions: updated }))
      }

      // Reset modal
      setNewCategoryModal({
        open: false,
        transactionIndex: -1,
        name: '',
        color: '#3B82F6',
        icon: '💰',
        type: 'expense'
      })

      toast.success(`Category "${data.name}" created successfully!`)
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    }
  }

  const openNewCategoryModal = (transactionIndex: number, type: 'income' | 'expense') => {
    setNewCategoryModal({
      open: true,
      transactionIndex,
      name: '',
      color: type === 'income' ? '#10B981' : '#EF4444',
      icon: type === 'income' ? '💰' : '💸',
      type
    })
  }

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-full">
            <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                  <h1 className="text-2xl font-bold text-gray-900">Import Transactions</h1>
                  <p className="text-gray-600 text-sm mt-1">Import transactions from CSV files with intelligent categorization</p>
                </div>
                <div className="flex gap-2">
                  <DashboardIndicator />
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <Button variant="outline" onClick={resetImport}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart
                  </Button>
                  {stepIndex > 0 && stepIndex < 4 && (
                    <Button variant="outline" onClick={goToPreviousStep}>
                      <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                      Back
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center space-x-4 py-4">
                {[
                  { key: 'upload', label: 'Upload', icon: Upload },
                  { key: 'preview', label: 'Preview', icon: Eye },
                  { key: 'mapping', label: 'Mapping', icon: Tag },
                  { key: 'processing', label: 'Processing', icon: Database },
                  { key: 'complete', label: 'Complete', icon: CheckCircle }
                ].map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      stepIndex >= index 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <step.icon className="h-4 w-4" />
                      <span>{step.label}</span>
                    </div>
                    {index < 4 && (
                      <ArrowRight className="h-4 w-4 text-gray-400 mx-2" />
                    )}
                  </div>
                ))}
              </div>

              {/* Upload Step */}
              {importState.step === 'upload' && (
                <Card>
                  <CardContent className="p-8">
                    <div className="max-w-md mx-auto text-center">
                      <div className="mb-6">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileSpreadsheet className="h-10 w-10 text-blue-600" />
                      </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your Transaction File</h3>
                        <p className="text-gray-600 text-sm">
                          Upload a CSV file with your transaction data. We&apos;ll automatically detect columns and categorize transactions.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessing || !canImportCsv()}
                          className="w-full"
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Choose Files
                            </>
                          )}
                        </Button>

                        {!canImportCsv() ? (
                          <p className="text-xs text-red-500 mt-2">
                            You have reached your monthly limit of {plan.maxCsvImports} CSV import(s). Please upgrade for more.
                          </p>
                        ) : (
                          <div className="text-xs text-gray-500">
                            You have {plan.maxCsvImports - csvImportsThisMonth} import(s) remaining this month.
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Supported formats: CSV, Excel (.xlsx, .xls)
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Preview Step */}
              {importState.step === 'preview' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        File Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{importState.file?.name}</p>
                            <p className="text-sm text-gray-600">{importState.rawData.length} rows found</p>
                          </div>
                          <Button onClick={parseTransactions}>
                            Continue to Mapping
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>

                        {/* Column Mapping */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="description-mapping">Description Column</Label>
                            <Select 
                              value={importState.columnMapping.description} 
                              onValueChange={(value) => setImportState(prev => ({
                                ...prev,
                                columnMapping: { ...prev.columnMapping, description: value }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select column" />
                              </SelectTrigger>
                              <SelectContent>
                                {importState.headers.map(header => (
                                  <SelectItem key={header} value={header}>{header}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="amount-mapping">Amount Column</Label>
                            <Select 
                              value={importState.columnMapping.amount} 
                              onValueChange={(value) => setImportState(prev => ({
                                ...prev,
                                columnMapping: { ...prev.columnMapping, amount: value }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select column" />
                              </SelectTrigger>
                              <SelectContent>
                                {importState.headers.map(header => (
                                  <SelectItem key={header} value={header}>{header}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="date-mapping">Date Column</Label>
                            <Select 
                              value={importState.columnMapping.date} 
                              onValueChange={(value) => setImportState(prev => ({
                                ...prev,
                                columnMapping: { ...prev.columnMapping, date: value }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select column" />
                              </SelectTrigger>
                              <SelectContent>
                                {importState.headers.map(header => (
                                  <SelectItem key={header} value={header}>{header}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="type-mapping">Type Column (Optional)</Label>
                            <Select 
                              value={importState.columnMapping.type || undefined} 
                              onValueChange={(value) => setImportState(prev => ({
                                ...prev,
                                columnMapping: { ...prev.columnMapping, type: value }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Auto-detect" />
                              </SelectTrigger>
                              <SelectContent>
                                {importState.headers.map(header => (
                                  <SelectItem key={header} value={header}>{header}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Data Preview */}
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-2 border-b">
                            <h4 className="font-medium text-sm">Data Preview (First 5 rows)</h4>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  {importState.headers.map(header => (
                                    <th key={header} className="px-4 py-2 text-left font-medium text-gray-700 border-b">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {importState.rawData.slice(0, 5).map((row, index) => (
                                  <tr key={index} className="border-b">
                                    {importState.headers.map(header => (
                                      <td key={header} className="px-4 py-2 text-gray-900">
                                        {row[header] || '-'}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Mapping Step */}
              {importState.step === 'mapping' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Tag className="h-5 w-5" />
                          Review and Categorize Transactions
                        </CardTitle>
                        <Button onClick={processImport} disabled={isProcessing}>
                          Import {importState.parsedTransactions.filter(t => t.errors.length === 0).length} Transactions
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-medium text-green-900">Valid</span>
                            </div>
                            <p className="text-2xl font-bold text-green-900 mt-1">
                              {importState.parsedTransactions.filter(t => t.errors.length === 0).length}
                            </p>
                          </div>

                          <div className="bg-red-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-red-600" />
                              <span className="font-medium text-red-900">Errors</span>
                            </div>
                            <p className="text-2xl font-bold text-red-900 mt-1">
                              {importState.parsedTransactions.filter(t => t.errors.length > 0).length}
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <span className="font-medium text-blue-900">Total</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-900 mt-1">
                              {importState.parsedTransactions.length}
                            </p>
                          </div>
                        </div>

                        {/* Transaction List */}
                        <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                          <div className="bg-gray-50 px-4 py-2 border-b">
                            <h4 className="font-medium text-sm">Analyzed Transactions</h4>
                          </div>
                          <div className="space-y-2 p-4">
                            {importState.parsedTransactions.map((transaction, index) => (
                              <div key={index} className={`p-4 border rounded-lg ${
                                transaction.errors.length > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <span className="font-medium">{transaction.description}</span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        transaction.type === 'income' 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-red-100 text-red-700'
                                      }`}>
                                        {transaction.type === 'income' ? '+' : '-'}{userCurrency ? formatCurrency(transaction.amount, userCurrency).replace(/^[+\-]/, '') : `€${transaction.amount.toFixed(2)}`}
                                      </span>
                                      <span className="text-sm text-gray-600">{transaction.date}</span>
                                    </div>
                                    
                                    {transaction.suggested_category && (
                                      <div className="mt-1">
                                        <span className="text-xs text-gray-500">Suggested: </span>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                          {transaction.suggested_category} ({Math.round(transaction.confidence * 100)}% confidence)
                                        </span>
                                      </div>
                                    )}
                                    
                                    {transaction.errors.length > 0 && (
                                      <div className="mt-1 text-red-600 text-xs">
                                        {transaction.errors.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Select 
                                      value={transaction.category_id || undefined} 
                                      onValueChange={(value) => {
                                        const updated = [...importState.parsedTransactions]
                                        updated[index].category_id = value
                                        setImportState(prev => ({ ...prev, parsedTransactions: updated }))
                                      }}
                                    >
                                      <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {importState.categories
                                          .filter(cat => cat.type === transaction.type)
                                          .map(category => (
                                            <SelectItem key={category.id} value={category.id}>
                                              <div className="flex items-center gap-2">
                                                <div 
                                                  className="w-3 h-3 rounded-full" 
                                                  style={{ backgroundColor: category.color }}
                                                />
                                                {category.name}
                                              </div>
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                    
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openNewCategoryModal(index, transaction.type)}
                                      className="shrink-0"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Processing Step */}
              {importState.step === 'processing' && (
                <Card>
                  <CardContent className="p-8">
                    <div className="max-w-md mx-auto text-center">
                      <div className="mb-6">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Database className="h-10 w-10 text-blue-600 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Import</h3>
                        <p className="text-gray-600 text-sm">
                          Importing your transactions to the database...
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Progress value={importState.progress} className="w-full" />
                        <p className="text-sm text-gray-600">
                          {Math.round(importState.progress)}% completed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Complete Step */}
              {importState.step === 'complete' && (
                <Card>
                  <CardContent className="p-8">
                    <div className="max-w-md mx-auto text-center">
                      <div className="mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Completed!</h3>
                        <p className="text-gray-600 text-sm">
                          Your transactions have been successfully imported.
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{importState.importedCount}</p>
                          <p className="text-xs text-gray-600">Imported</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-600">{importState.skippedCount}</p>
                          <p className="text-xs text-gray-600">Skipped</p>
                        </div>
                      </div>

                      <Button onClick={resetImport} className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Import More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Category Modal */}
      <Dialog open={newCategoryModal.open} onOpenChange={(open) => setNewCategoryModal(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={newCategoryModal.name}
                onChange={(e) => setNewCategoryModal(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
              />
            </div>

            <div>
              <Label htmlFor="category-color">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="category-color"
                  type="color"
                  value={newCategoryModal.color}
                  onChange={(e) => setNewCategoryModal(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-8"
                />
                <span className="text-sm text-gray-600">{newCategoryModal.color}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="category-icon">Icon</Label>
              <Input
                id="category-icon"
                value={newCategoryModal.icon}
                onChange={(e) => setNewCategoryModal(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="Choose an emoji"
                className="w-20"
              />
            </div>

            <div>
              <Label>Type</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  newCategoryModal.type === 'income' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {newCategoryModal.type === 'income' ? 'Income' : 'Expense'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setNewCategoryModal(prev => ({ ...prev, open: false }))}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createNewCategory}
                disabled={!newCategoryModal.name.trim()}
                className="flex-1"
              >
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 