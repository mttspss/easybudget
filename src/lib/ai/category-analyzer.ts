import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface CategorySuggestion {
  category: string
  confidence: number
  reasoning?: string
}

interface AIAnalysisRequest {
  description: string
  amount: number
  type: 'income' | 'expense'
  availableCategories: { name: string; type: 'income' | 'expense' }[]
  userContext?: {
    country?: string
    currency?: string
    previousCategories?: string[]
  }
}

export async function suggestCategoryWithAI(request: AIAnalysisRequest): Promise<CategorySuggestion> {
  try {
    const { description, amount, type, availableCategories, userContext } = request
    
    // Filter categories by type
    const relevantCategories = availableCategories.filter(cat => cat.type === type)
    const categoryNames = relevantCategories.map(cat => cat.name)
    
    // Detect likely country/region from transaction description
    const detectedContext = detectTransactionContext(description)
    const userCountry = userContext?.country || detectedContext.country || 'International'
    const userCurrency = userContext?.currency || detectedContext.currency || 'USD'
    
    // Build globally-aware smart prompt
    const prompt = `You are an expert global financial transaction categorizer with access to knowledge of ALL worldwide merchants, brands, companies, and financial institutions.

TRANSACTION DETAILS:
- Description: "${description}"
- Amount: ${amount} ${userCurrency}
- Type: ${type}
- Context: ${userCountry} context detected

AVAILABLE CATEGORIES (choose ONE from this list):
${categoryNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

INSTRUCTIONS:
1. Use your FULL knowledge of global merchants, brands, and companies
2. Recognize ANY company/brand from ANY country (US, UK, EU, Asia, etc.)
3. Understand payment processors, banks, fintech companies, trading platforms
4. Recognize subscription services, e-commerce, food delivery, crypto exchanges
5. Consider transaction description patterns (ATM, transfer, payroll, etc.)
6. Return high confidence (0.8+) when you're sure about the merchant/pattern
7. Consider amount and currency context for reasonableness

Your knowledge includes but is NOT limited to:
- E-commerce: Amazon, eBay, Shopify, AliExpress, etc.
- Food: McDonald's, Uber Eats, DoorDash, Deliveroo, Just Eat, etc.
- Fintech: Revolut, Wise, PayPal, Stripe, Square, Klarna, etc.
- Crypto: Binance, Coinbase, Kraken, etc.
- Trading: MyFundedFX, eToro, Plus500, etc.
- Streaming: Netflix, Spotify, Disney+, etc.
- Travel: Booking.com, Airbnb, Uber, Ryanair, etc.
- And thousands more from your training data!

RESPOND with ONLY this JSON format:
{
  "category": "exact_category_name_from_list",
  "confidence": 0.95,
  "reasoning": "brief explanation of what this merchant/transaction is"
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cheap for this task
      messages: [
        {
          role: "system",
          content: "You are a precise global financial transaction categorizer with knowledge of international merchants, banks, and payment patterns. Always respond with valid JSON only."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent results
      max_tokens: 200,
    })

    const response = completion.choices[0]?.message?.content?.trim()
    
    if (!response) {
      throw new Error('No response from AI')
    }

    // Parse AI response
    let aiResult: CategorySuggestion
    try {
      aiResult = JSON.parse(response)
    } catch {
      console.error('Failed to parse AI response:', response)
      throw new Error('Invalid AI response format')
    }

    // Validate category exists in available list
    const validCategory = categoryNames.find(name => 
      name.toLowerCase() === aiResult.category.toLowerCase()
    )

    if (!validCategory) {
      console.warn(`AI suggested invalid category: ${aiResult.category}`)
      // Fallback to enhanced global pattern matching
      return globalFallbackCategorization(description, type, categoryNames)
    }

    // Ensure confidence is reasonable (0.1 to 1.0)
    const confidence = Math.max(0.1, Math.min(1.0, aiResult.confidence || 0.5))

    return {
      category: validCategory,
      confidence,
      reasoning: aiResult.reasoning
    }

  } catch (error) {
    console.error('AI categorization failed:', error)
    
    // Fallback to enhanced global pattern matching if AI fails
    return globalFallbackCategorization(
      request.description, 
      request.type, 
      request.availableCategories.filter(c => c.type === request.type).map(c => c.name)
    )
  }
}

// Detect transaction context from description
function detectTransactionContext(description: string): { country?: string; currency?: string; region?: string } {
  const desc = description.toLowerCase()
  
  // European indicators
  if (desc.includes('eu') || desc.includes('sarl') || desc.includes('gmbh') || 
      desc.includes('conad') || desc.includes('esselunga') || desc.includes('lidl') ||
      desc.includes('carrefour') || desc.includes('tesco') || desc.includes('aldi')) {
    return { country: 'Europe', currency: 'EUR', region: 'EU' }
  }
  
  // UK indicators
  if (desc.includes('co.uk') || desc.includes('ltd') || desc.includes('tesco') || 
      desc.includes('sainsbury') || desc.includes('asda')) {
    return { country: 'United Kingdom', currency: 'GBP', region: 'UK' }
  }
  
  // US indicators
  if (desc.includes('.com') || desc.includes('walmart') || desc.includes('target') || 
      desc.includes('cvs') || desc.includes('wells fargo') || desc.includes('chase') ||
      desc.includes('inc') || desc.includes('llc')) {
    return { country: 'United States', currency: 'USD', region: 'US' }
  }
  
  // Italian specific (for existing users)
  if (desc.includes('conad') || desc.includes('esselunga') || desc.includes('tim') || 
      desc.includes('vodafone it') || desc.includes('enel') || desc.includes('eni') ||
      desc.includes('bonifico') || desc.includes('prelievo')) {
    return { country: 'Italy', currency: 'EUR', region: 'IT' }
  }
  
  // German indicators
  if (desc.includes('gmbh') || desc.includes('rewe') || desc.includes('edeka') || 
      desc.includes('aldi') || desc.includes('lidl')) {
    return { country: 'Germany', currency: 'EUR', region: 'DE' }
  }
  
  // French indicators
  if (desc.includes('sarl') || desc.includes('sas') || desc.includes('carrefour') || 
      desc.includes('leclerc') || desc.includes('virement')) {
    return { country: 'France', currency: 'EUR', region: 'FR' }
  }
  
  return { country: 'International', currency: 'USD', region: 'Global' }
}

// Enhanced global fallback categorization
function globalFallbackCategorization(description: string, type: 'income' | 'expense', availableCategories: string[]): CategorySuggestion {
  const desc = description.toLowerCase()
  
  // Global expense patterns (covering major international brands)
  const globalExpensePatterns = [
    // Food & Dining - Global
    { keywords: ['mcdonald', 'burger king', 'kfc', 'subway', 'starbucks', 'domino', 'pizza hut', 'costa coffee'], category: 'Food & Dining', confidence: 0.95 },
    { keywords: ['restaurant', 'cafe', 'coffee', 'dining', 'food', 'lunch', 'dinner', 'breakfast'], category: 'Food & Dining', confidence: 0.85 },
    
    // Food & Dining - Regional
    { keywords: ['conad', 'esselunga', 'coop', 'carrefour', 'tesco', 'sainsbury', 'walmart', 'target', 'kroger', 'lidl', 'aldi', 'rewe', 'edeka'], category: 'Food & Dining', confidence: 0.95 },
    
    // Transportation - Global
    { keywords: ['shell', 'bp', 'exxon', 'chevron', 'mobil', 'esso', 'total', 'eni', 'repsol'], category: 'Transportation', confidence: 0.90 },
    { keywords: ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'petrol', 'gasoline', 'parking'], category: 'Transportation', confidence: 0.90 },
    
    // Shopping - Global
    { keywords: ['amazon', 'ebay', 'walmart', 'target', 'costco', 'ikea', 'h&m', 'zara', 'nike', 'adidas'], category: 'Shopping', confidence: 0.95 },
    { keywords: ['paypal', 'stripe', 'square', 'shop', 'store', 'purchase', 'buy', 'order'], category: 'Shopping', confidence: 0.80 },
    
    // Entertainment - Global
    { keywords: ['netflix', 'spotify', 'apple music', 'youtube', 'disney', 'hulu', 'amazon prime', 'hbo'], category: 'Entertainment', confidence: 0.95 },
    { keywords: ['cinema', 'movie', 'theater', 'theatre', 'concert', 'gaming', 'steam'], category: 'Entertainment', confidence: 0.85 },
    
    // Bills & Utilities - Global patterns
    { keywords: ['electric', 'electricity', 'gas bill', 'water', 'internet', 'phone', 'mobile', 'broadband'], category: 'Bills & Utilities', confidence: 0.90 },
    { keywords: ['verizon', 'at&t', 'vodafone', 'orange', 'tim', 'wind', 'o2', 'ee'], category: 'Bills & Utilities', confidence: 0.90 },
    
    // Healthcare - Global
    { keywords: ['pharmacy', 'hospital', 'doctor', 'medical', 'health', 'clinic', 'dentist'], category: 'Healthcare', confidence: 0.90 },
    { keywords: ['cvs', 'walgreens', 'boots', 'lloyds pharmacy'], category: 'Healthcare', confidence: 0.95 },
    
    // Travel - Global
    { keywords: ['booking.com', 'expedia', 'airbnb', 'hotel', 'flight', 'airline', 'airport', 'rental car'], category: 'Travel', confidence: 0.90 },
    { keywords: ['emirates', 'lufthansa', 'british airways', 'american airlines', 'delta', 'ryanair'], category: 'Travel', confidence: 0.95 },
    
    // ATM/Cash - Global patterns
    { keywords: ['atm', 'cash', 'withdrawal', 'prelievo', 'retrait', 'abhebung'], category: 'Other Expenses', confidence: 0.75 }
  ]

  // Global income patterns
  const globalIncomePatterns = [
    { keywords: ['salary', 'payroll', 'wages', 'stipendio', 'salaire', 'gehalt', 'lohn'], category: 'Salary', confidence: 0.95 },
    { keywords: ['freelance', 'contract', 'consulting', 'invoice', 'freelancer', 'contractor'], category: 'Freelancing', confidence: 0.90 },
    { keywords: ['dividend', 'interest', 'investment', 'stock', 'bond', 'crypto', 'trading'], category: 'Investment', confidence: 0.85 },
    { keywords: ['transfer', 'deposit', 'refund', 'reimbursement', 'bonus', 'commission'], category: 'Other Income', confidence: 0.70 },
    { keywords: ['gift', 'regalo', 'cadeau', 'geschenk', 'from'], category: 'Other Income', confidence: 0.60 }
  ]

  const patterns = type === 'expense' ? globalExpensePatterns : globalIncomePatterns

  // Try to match patterns
  for (const pattern of patterns) {
    for (const keyword of pattern.keywords) {
      if (desc.includes(keyword)) {
        // Check if suggested category exists in available categories
        const matchingCategory = availableCategories.find(cat => 
          cat.toLowerCase() === pattern.category.toLowerCase()
        )
        
        if (matchingCategory) {
          return { 
            category: matchingCategory, 
            confidence: pattern.confidence 
          }
        }
      }
    }
  }

  // Default fallback
  const defaultCategory = type === 'expense' ? 'Other Expenses' : 'Other Income'
  const fallbackCategory = availableCategories.find(cat => 
    cat.toLowerCase().includes('other') || 
    cat.toLowerCase().includes('uncategorized')
  ) || availableCategories[0] // First available category as last resort

  return { 
    category: fallbackCategory || defaultCategory, 
    confidence: 0.1 
  }
}

// Batch processing for multiple transactions (future optimization)
export async function suggestCategoriesInBatch(requests: AIAnalysisRequest[]): Promise<CategorySuggestion[]> {
  // For now, process individually
  // TODO: Implement batching for better performance
  const results = await Promise.all(
    requests.map(request => suggestCategoryWithAI(request))
  )
  
  return results
} 