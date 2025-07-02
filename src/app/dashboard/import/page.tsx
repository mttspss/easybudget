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
  
  // Drag & Drop state
  const [isDragOver, setIsDragOver] = useState(false)
  
  // Form state

  // Simple function to find category from existing transactions
  const findCategoryFromHistory = useCallback(async (description: string, type: 'income' | 'expense'): Promise<{ category: string, confidence: number } | null> => {
    if (!user) return null
    
    try {
      // Search for existing transactions with same description and type
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          description,
          type,
          category_id,
          categories (
            name,
            id
          )
        `)
        .eq('user_id', user.id)
        .eq('type', type)
        .ilike('description', `%${description.trim()}%`)
        .limit(50)

      if (error || !data || data.length === 0) {
        return null
      }

      // Filter transactions that actually have categories
      const categorizedTransactions = data.filter(tx => tx.category_id && tx.categories)

      if (categorizedTransactions.length === 0) {
        return null
      }

      // Count category usage
      const categoryCount = new Map<string, { name: string, count: number, id: string }>()
      
      categorizedTransactions.forEach(transaction => {
        const category = transaction.categories
        // Handle both single object and array cases
        const categoryData = Array.isArray(category) ? category[0] : category
        if (categoryData?.name) {
          const existing = categoryCount.get(categoryData.name) || { name: categoryData.name, count: 0, id: categoryData.id }
          existing.count++
          categoryCount.set(categoryData.name, existing)
        }
      })

      if (categoryCount.size === 0) {
        return null
      }

      // Find most used category
      const mostUsed = Array.from(categoryCount.values()).reduce((max, current) => 
        current.count > max.count ? current : max
      )

      // Calculate confidence based on usage
      const totalTransactions = categorizedTransactions.length
      const confidence = Math.min(0.95, 0.5 + (mostUsed.count / totalTransactions) * 0.4)

      return {
        category: mostUsed.name,
        confidence
      }
    } catch (error) {
      console.error('Error searching transaction history:', error)
      return null
    }
  }, [user])

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

  // AI-powered date parsing function
  const parseDate = async (dateStr: string): Promise<string | null> => {
    if (!dateStr || typeof dateStr !== 'string') return null
    
    const cleanDateStr = dateStr.trim()
    if (!cleanDateStr) return null
    
    // Console log for debugging
    console.log(`🗓️ Parsing date: "${cleanDateStr}"`)
    
    // First try: Standard formats (especially YYYY-MM-DD)
    try {
      // Extract date part from common formats (remove time if present)
      let dateOnly = cleanDateStr
      if (cleanDateStr.includes(' ')) {
        dateOnly = cleanDateStr.split(' ')[0]
      } else if (cleanDateStr.includes('T')) {
        dateOnly = cleanDateStr.split('T')[0]
      }
      
      // PRIORITY: Handle YYYY-MM-DD format (most common bank format)
      if (dateOnly.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const testDate = new Date(dateOnly + 'T00:00:00.000Z')
        if (!isNaN(testDate.getTime())) {
          const result = testDate.toISOString().split('T')[0]
          console.log(`✅ YYYY-MM-DD parsing successful: ${result}`)
          return result
        }
      }
      
      // Try direct parsing for other ISO formats
      const directDate = new Date(dateOnly)
      if (!isNaN(directDate.getTime()) && directDate.getFullYear() > 1900 && directDate.getFullYear() < 2100) {
        console.log(`✅ Direct parsing successful: ${directDate.toISOString().split('T')[0]}`)
        return directDate.toISOString().split('T')[0]
      }
      
      // Try common separators for DD/MM/YYYY and MM/DD/YYYY
      const patterns = [
        /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/, // DD-MM-YYYY or MM-DD-YYYY or DD/MM/YYYY or MM/DD/YYYY
        /(\d{1,2})\.(\d{1,2})\.(\d{4})/, // DD.MM.YYYY
      ]
      
      for (const pattern of patterns) {
        const match = dateOnly.match(pattern)
        if (match) {
          const [, part1, part2, part3] = match
          
          const year = parseInt(part3)
          const num1 = parseInt(part1)
          const num2 = parseInt(part2)
          
          let day, month
          // European format (DD/MM/YYYY) vs American format (MM/DD/YYYY)
          if (num1 > 12) {
            // Must be DD/MM/YYYY
            day = num1
            month = num2
          } else if (num2 > 12) {
            // Must be MM/DD/YYYY
            month = num1
            day = num2
          } else {
            // Ambiguous - default to DD/MM/YYYY (European)
            day = num1
            month = num2
          }
          
          // Validate ranges
          if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            const testDate = new Date(year, month - 1, day)
            if (testDate.getFullYear() === year && testDate.getMonth() === month - 1 && testDate.getDate() === day) {
              const result = testDate.toISOString().split('T')[0]
              console.log(`✅ Pattern parsing successful: ${result}`)
              return result
            }
          }
        }
      }
    } catch (error) {
      console.log(`⚠️ Standard parsing failed: ${error}`)
    }
    
    // AI fallback for problematic dates
    const aiEnabled = process.env.NEXT_PUBLIC_ENABLE_AI_CATEGORIZATION === 'true'
    if (aiEnabled) {
      try {
        console.log(`🤖 Trying AI parsing for: "${cleanDateStr}"`)
        
        const response = await fetch('/api/ai/categorize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: `Parse this date string and return ONLY a valid date in YYYY-MM-DD format: "${cleanDateStr}"`,
            amount: 0,
            type: 'expense',
            availableCategories: [],
            userContext: {
              task: 'date_parsing',
              dateString: cleanDateStr,
              instruction: 'Return only YYYY-MM-DD format. Examples: 2025-07-01, 2024-12-31. If you cannot parse the date, return "invalid".'
            }
          })
        })

        if (response.ok) {
          const result = await response.json()
          const aiDate = result.category || result.suggestion || ''
          
          // Validate AI response
          if (aiDate && aiDate !== "invalid" && aiDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const testDate = new Date(aiDate + 'T00:00:00.000Z')
            if (!isNaN(testDate.getTime())) {
              console.log(`🎯 AI parsing successful: ${aiDate}`)
              return aiDate
            }
          }
          
          console.log(`❌ AI could not parse date: "${cleanDateStr}"`)
        } else {
          console.log(`⚠️ AI API failed with status: ${response.status}`)
        }
      } catch (error) {
        console.log(`⚠️ AI parsing error: ${error}`)
      }
    } else {
      console.log(`ℹ️ AI disabled, skipping AI date parsing`)
    }
    
    // Last resort: try to extract any 4-digit year and reasonable month/day
    console.log(`🔧 Trying last resort parsing for: "${cleanDateStr}"`)
    
    const yearMatch = cleanDateStr.match(/\b(19|20)\d{2}\b/)
    const numberMatches = cleanDateStr.match(/\b\d{1,2}\b/g)
    
    if (yearMatch && numberMatches && numberMatches.length >= 2) {
      const year = parseInt(yearMatch[0])
      const nums = numberMatches.map(n => parseInt(n)).filter(n => n >= 1 && n <= 31)
      
      if (nums.length >= 2) {
        const month = Math.min(nums[0], 12)
        const day = Math.min(nums[1], 31)
        
        if (month >= 1 && day >= 1) {
          const fallbackDate = new Date(year, month - 1, day)
          if (!isNaN(fallbackDate.getTime())) {
            const result = fallbackDate.toISOString().split('T')[0]
            console.log(`🔧 Last resort successful: ${result}`)
            return result
          }
        }
      }
    }
    
    console.log(`❌ All date parsing methods failed for: "${cleanDateStr}"`)
    return null
  }

  // Enhanced suggestion function with context
  const suggestCategoryWithContext = async (description: string, amount: number, type: 'income' | 'expense', contextExamples: string = ''): Promise<{ category: string, confidence: number }> => {
    const aiEnabled = process.env.NEXT_PUBLIC_ENABLE_AI_CATEGORIZATION === 'true'
    
    if (aiEnabled) {
      try {
        const response = await fetch('/api/ai/categorize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description,
            amount,
            type,
            availableCategories: importState.categories.map(cat => ({ 
              name: cat.name, 
              type: cat.type 
            })),
            userContext: {
              country: 'International',
              currency: userCurrency?.code || 'USD',
              previousCategorizations: contextExamples // Add context for consistency
            }
          })
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        
        return {
          category: result.category,
          confidence: result.confidence
        }
      } catch (error) {
        console.warn('AI categorization failed, using fallback:', error)
      }
    }

    // Fallback logic
    const lowerDesc = description.toLowerCase()
    
    const patterns = [
      { keywords: ['restaurant', 'cafe', 'food', 'dining', 'lunch', 'dinner', 'mcdonald', 'burger', 'pizza'], category: 'Food & Dining', confidence: 0.8 },
      { keywords: ['gas', 'fuel', 'taxi', 'uber', 'parking', 'metro', 'transport'], category: 'Transportation', confidence: 0.8 },
      { keywords: ['amazon', 'shop', 'store', 'purchase', 'buy', 'market'], category: 'Shopping', confidence: 0.8 },
      { keywords: ['electric', 'internet', 'phone', 'bill', 'utility', 'subscription'], category: 'Bills & Utilities', confidence: 0.8 },
      { keywords: ['netflix', 'spotify', 'cinema', 'movie', 'gaming', 'entertainment'], category: 'Entertainment', confidence: 0.8 },
      { keywords: ['pharmacy', 'hospital', 'doctor', 'medical', 'health'], category: 'Healthcare', confidence: 0.8 },
      { keywords: ['salary', 'payroll', 'wage', 'income', 'bonus'], category: 'Salary', confidence: 0.9 },
      { keywords: ['freelance', 'contract', 'consulting'], category: 'Freelancing', confidence: 0.8 },
    ]

    for (const pattern of patterns) {
      for (const keyword of pattern.keywords) {
        if (lowerDesc.includes(keyword)) {
          const matchingCategory = importState.categories.find(cat => 
            cat.type === type && cat.name.toLowerCase() === pattern.category.toLowerCase()
          )
          
          if (matchingCategory) {
            return { 
              category: matchingCategory.name, 
              confidence: pattern.confidence 
            }
          }
        }
      }
    }

    const defaultCategories = importState.categories.filter(cat => cat.type === type)
    const defaultCategory = type === 'expense' 
      ? defaultCategories.find(cat => cat.name.toLowerCase().includes('other')) || defaultCategories[0]
      : defaultCategories.find(cat => cat.name.toLowerCase().includes('other')) || defaultCategories[0]

    return { 
      category: defaultCategory?.name || (type === 'expense' ? 'Other Expenses' : 'Other Income'), 
      confidence: 0.1 
    }
  }

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        await processFile(file)
      } else {
        toast.error('Please drop a CSV file')
      }
    }
  }

  const processFile = async (file: File) => {
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const parseTransactions = async () => {
    const { rawData, columnMapping } = importState
    const transactions: ParsedTransaction[] = []

    // Show progress for AI processing
    setIsProcessing(true)

    // Process in batches for efficiency
    const BATCH_SIZE = 10
    const batches = []
    for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
      batches.push(rawData.slice(i, i + BATCH_SIZE))
    }

    // Keep track of categorizations for consistency
    const categoryHistory = new Map<string, { category: string, confidence: number }>()

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      const batchPromises = []

      for (let localIndex = 0; localIndex < batch.length; localIndex++) {
        const globalIndex = batchIndex * BATCH_SIZE + localIndex
        const row = batch[localIndex]
        
        const transactionPromise = (async () => {
      const errors: string[] = []
      
          const description = row[columnMapping.description] || `Transaction ${globalIndex + 1}`
      const amountStr = row[columnMapping.amount]
      const dateStr = row[columnMapping.date]
      const typeStr = row[columnMapping.type || '']

      let amount = 0
      let isNegative = false
      if (amountStr) {
        const cleanAmount = amountStr.toString().replace(/[,$\s]/g, '')
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

          const parsedDate = await parseDate(dateStr)
      if (!parsedDate) {
        errors.push('Invalid or missing date')
      }

      let type: 'income' | 'expense' = 'expense'
      
          // Robust type detection - NEVER allow negative amounts to be income
      if (amountStr) {
            if (isNegative || amount < 0) {
              type = 'expense' // Negative amount = ALWAYS expense
        } else {
              type = 'income'  // Positive amount = income
        }
      } else if (typeStr) {
        const typeValue = typeStr.toString().toLowerCase()
        if (typeValue.includes('income') || typeValue.includes('credit') || typeValue.includes('deposit') || typeValue.includes('topup')) {
              // Double check: if it's supposed to be income but amount is negative, force expense
              if (isNegative || amount < 0) {
                type = 'expense'
              } else {
          type = 'income'
        }
            } else {
              type = 'expense'
            }
          }

          // Enhanced AI Categorization with consistency
          let suggestedCategory = type === 'income' ? 'Other Income' : 'Other Expenses'
          let confidence = 0.1
          let categoryId: string | undefined = undefined

          try {
            // Check if we've seen this exact description before
            const normalizedDesc = description.toLowerCase().trim()
            
            // First, check user's historical transactions (highest priority)
            const userPattern = await findCategoryFromHistory(normalizedDesc, type)
            if (userPattern) {
              suggestedCategory = userPattern.category
              confidence = Math.min(0.99, userPattern.confidence + 0.1) // Boost confidence for user patterns
            }
            // Then check current session cache
            else if (categoryHistory.has(normalizedDesc)) {
              const prevCategorization = categoryHistory.get(normalizedDesc)!
              suggestedCategory = prevCategorization.category
              confidence = Math.min(prevCategorization.confidence + 0.1, 0.99) // Increase confidence for consistency
            } else {
              // Build context from current session
              const contextExamplesStr = Array.from(categoryHistory.entries())
                .slice(-2) // Last 2 session categorizations
                .map(([desc, cat]) => `"${desc}" → ${cat.category}`)
                .join('\n')

              const result = await suggestCategoryWithContext(description, amount, type, contextExamplesStr)
              suggestedCategory = result.category
              confidence = result.confidence
              
              // Cache this categorization
              categoryHistory.set(normalizedDesc, { category: suggestedCategory, confidence })
            }

            // Auto-apply high-confidence suggestions (especially user patterns)
            const autoApplyThreshold = userPattern ? 0.7 : 0.8
            if (confidence >= autoApplyThreshold) {
              const matchingCategory = importState.categories.find(cat => 
                cat.type === type && cat.name.toLowerCase() === suggestedCategory.toLowerCase()
              )
              if (matchingCategory) {
                categoryId = matchingCategory.id
              }
            }

          } catch {
            suggestedCategory = type === 'income' ? 'Other Income' : 'Other Expenses'
          }

          return {
            id: `temp_${globalIndex}`,
        description,
        amount,
        date: parsedDate || new Date().toISOString().split('T')[0],
        type,
        suggested_category: suggestedCategory,
        confidence,
            category_id: categoryId, // Auto-applied if high confidence
            row_index: globalIndex + 1,
        errors
          }
        })()

        batchPromises.push(transactionPromise)
      }

      // Process batch in parallel
      const batchResults = await Promise.all(batchPromises)
      transactions.push(...batchResults)
    }

    setIsProcessing(false)

    setImportState(prev => ({
      ...prev,
      step: 'mapping',
      parsedTransactions: transactions
    }))
  }

  // Bulk categorization function
  const applyBulkCategorization = (sourceTransactionIndex: number, categoryId: string) => {
    const sourceTransaction = importState.parsedTransactions[sourceTransactionIndex]
    if (!sourceTransaction) return

    const updated = [...importState.parsedTransactions]
    let appliedCount = 0

    // Find all transactions with same description and type
    const normalizedSourceDesc = sourceTransaction.description.toLowerCase().trim()
    
    updated.forEach((transaction, index) => {
      const normalizedDesc = transaction.description.toLowerCase().trim()
      if (normalizedDesc === normalizedSourceDesc && 
          transaction.type === sourceTransaction.type && 
          index !== sourceTransactionIndex) {
        transaction.category_id = categoryId
        appliedCount++
      }
    })

    setImportState(prev => ({ ...prev, parsedTransactions: updated }))
    
    if (appliedCount > 0) {
      const categoryName = importState.categories.find(cat => cat.id === categoryId)?.name || 'Unknown'
      toast.success(`Applied "${categoryName}" to ${appliedCount + 1} similar transactions`)
    }
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Your Bank Transactions</h3>
                        <p className="text-gray-600 text-sm">
                          Upload your bank&apos;s CSV export file. We&apos;ll automatically detect columns and categorize transactions using AI.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        
                        {/* Drag & Drop Area */}
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
                            isDragOver 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="text-center">
                            <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`} />
                            <p className={`text-sm font-medium ${isDragOver ? 'text-blue-600' : 'text-gray-900'}`}>
                              {isDragOver ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              or click to browse files
                            </p>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessing || !canImportCsv()}
                          variant="outline"
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
                              Choose File
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
                          <p className="font-medium mb-1">Supported formats:</p>
                          <p>✅ CSV files from any bank</p>
                          <p>✅ YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY date formats</p>
                          <p>✅ Automatic amount and type detection</p>
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
                            {isProcessing && (
                              <p className="text-sm text-blue-600 mt-1">
                                🤖 AI categorizing transactions...
                              </p>
                            )}
                          </div>
                          <Button onClick={parseTransactions} disabled={isProcessing}>
                            {isProcessing ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                AI Processing...
                              </>
                            ) : (
                              <>
                            Continue to Mapping
                            <ArrowRight className="h-4 w-4 ml-2" />
                              </>
                            )}
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
                                    
                                    {/* Bulk Apply Button */}
                                    {transaction.category_id && (() => {
                                      const similarCount = importState.parsedTransactions.filter(t => 
                                        t.description.toLowerCase().trim() === transaction.description.toLowerCase().trim() &&
                                        t.type === transaction.type
                                      ).length
                                      
                                      return similarCount > 1 && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => applyBulkCategorization(index, transaction.category_id!)}
                                          className="shrink-0 text-xs"
                                          title={`Apply to ${similarCount} similar transactions`}
                                        >
                                          <RefreshCw className="h-3 w-3 mr-1" />
                                          Apply to {similarCount}
                                        </Button>
                                      )
                                    })()}
                                    
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