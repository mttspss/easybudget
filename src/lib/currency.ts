import { supabase } from './supabase'

export interface CurrencyConfig {
  code: string
  symbol: string
  position: 'before' | 'after'
}

export const currencies: Record<string, CurrencyConfig> = {
  EUR: { code: 'EUR', symbol: '€', position: 'after' },
  USD: { code: 'USD', symbol: '$', position: 'before' },
  GBP: { code: 'GBP', symbol: '£', position: 'before' },
  JPY: { code: 'JPY', symbol: '¥', position: 'before' },
  CAD: { code: 'CAD', symbol: 'C$', position: 'before' },
  AUD: { code: 'AUD', symbol: 'A$', position: 'before' },
  CHF: { code: 'CHF', symbol: 'CHF', position: 'after' },
  CNY: { code: 'CNY', symbol: '¥', position: 'before' }
}

let cachedUserCurrency: CurrencyConfig | null = null
let cacheUserId: string | null = null

export async function getUserCurrency(userId: string): Promise<CurrencyConfig> {
  // Use cache if same user
  if (cacheUserId === userId && cachedUserCurrency) {
    return cachedUserCurrency
  }

  try {
    const { data } = await supabase
      .from('user_preferences')
      .select('currency')
      .eq('user_id', userId)
      .single()
    
    const currencyCode = data?.currency || 'EUR'
    const currency = currencies[currencyCode] || currencies.EUR
    
    // Cache the result
    cacheUserId = userId
    cachedUserCurrency = currency
    
    return currency
  } catch {
    // Default to EUR if error
    const defaultCurrency = currencies.EUR
    cacheUserId = userId
    cachedUserCurrency = defaultCurrency
    return defaultCurrency
  }
}

export function formatCurrency(amount: number, currency: CurrencyConfig): string {
  const formattedAmount = amount.toLocaleString()
  
  if (currency.position === 'before') {
    return `${currency.symbol}${formattedAmount}`
  } else {
    return `${formattedAmount}${currency.symbol}`
  }
}

export function formatCurrencyShort(amount: number, currency: CurrencyConfig): string {
  const shortAmount = (amount / 1000).toFixed(0)
  
  if (currency.position === 'before') {
    return `${currency.symbol}${shortAmount}k`
  } else {
    return `${shortAmount}k${currency.symbol}`
  }
}

// React hook version for easier use in components
export function useCurrency() {
  // This will be called from components, they should provide user ID
  return {
    formatCurrency,
    formatCurrencyShort,
    getUserCurrency,
    currencies
  }
} 