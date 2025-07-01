import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

// Initialize OpenAI client server-side
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Server-side only, secure!
})

interface CategorySuggestion {
  category: string
  confidence: number
  reasoning?: string
}

interface CategoryRequest {
  description: string
  amount: number
  type: 'income' | 'expense'
  availableCategories: { name: string; type: 'income' | 'expense' }[]
  userContext?: {
    country?: string
    currency?: string
  }
}

async function suggestCategoryWithAI(request: CategoryRequest): Promise<CategorySuggestion> {
  try {
    const { description, amount, type, availableCategories, userContext } = request
    
    // Filter categories by type
    const relevantCategories = availableCategories.filter(cat => cat.type === type)
    const categoryNames = relevantCategories.map(cat => cat.name)
    
    const userCountry = userContext?.country || 'International'
    const userCurrency = userContext?.currency || 'USD'
    
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
      // Return a fallback category
      return {
        category: categoryNames[0] || 'Other Expenses',
        confidence: 0.1,
        reasoning: 'AI suggested invalid category, using fallback'
      }
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
    
    // Return a safe fallback
    const relevantCategories = request.availableCategories.filter(cat => cat.type === request.type)
    const fallbackCategory = relevantCategories.find(cat => 
      cat.name.toLowerCase().includes('other')
    ) || relevantCategories[0]
    
    return {
      category: fallbackCategory?.name || (request.type === 'expense' ? 'Other Expenses' : 'Other Income'),
      confidence: 0.1,
      reasoning: 'AI failed, using fallback categorization'
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { description, amount, type, availableCategories, userContext }: CategoryRequest = req.body

    // Validate required fields
    if (!description || !amount || !type || !availableCategories) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const result = await suggestCategoryWithAI({
      description,
      amount,
      type,
      availableCategories,
      userContext
    })

    res.status(200).json(result)
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 