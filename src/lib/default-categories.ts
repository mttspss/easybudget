import { supabase } from './supabase'

export const defaultCategories = [
  // Income Categories
  { name: 'Salary', type: 'income', color: '#22c55e', icon: '💼' },
  { name: 'Freelancing', type: 'income', color: '#10b981', icon: '💻' },
  { name: 'Investment', type: 'income', color: '#059669', icon: '📈' },
  { name: 'Side Hustle', type: 'income', color: '#047857', icon: '🎯' },
  { name: 'Other Income', type: 'income', color: '#065f46', icon: '💰' },

  // Expense Categories
  { name: 'Food & Dining', type: 'expense', color: '#ef4444', icon: '🍽️' },
  { name: 'Transportation', type: 'expense', color: '#f97316', icon: '🚗' },
  { name: 'Shopping', type: 'expense', color: '#eab308', icon: '🛍️' },
  { name: 'Entertainment', type: 'expense', color: '#a855f7', icon: '🎬' },
  { name: 'Bills & Utilities', type: 'expense', color: '#3b82f6', icon: '💡' },
  { name: 'Healthcare', type: 'expense', color: '#ec4899', icon: '🏥' },
  { name: 'Education', type: 'expense', color: '#8b5cf6', icon: '📚' },
  { name: 'Travel', type: 'expense', color: '#06b6d4', icon: '✈️' },
  { name: 'Home & Garden', type: 'expense', color: '#84cc16', icon: '🏠' },
  { name: 'Other Expenses', type: 'expense', color: '#6b7280', icon: '📋' }
] as const

export async function createDefaultCategories(userId: string) {
  try {
    const categoriesToInsert = defaultCategories.map(category => ({
      user_id: userId,
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon
    }))

    const { error } = await supabase
      .from('categories')
      .insert(categoriesToInsert)

    if (error) {
      console.error('Error creating default categories:', error)
      return false
    }

    console.log('Default categories created successfully for user:', userId)
    return true
  } catch (error) {
    console.error('Error in createDefaultCategories:', error)
    return false
  }
} 