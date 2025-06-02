import { supabase } from './supabase'

export const defaultCategories = [
  // Income Categories
  { name: 'Salary', type: 'income', color: '#10b981', icon: '' },
  { name: 'Freelancing', type: 'income', color: '#059669', icon: '' },
  { name: 'Investment', type: 'income', color: '#047857', icon: '' },
  { name: 'Side Hustle', type: 'income', color: '#065f46', icon: '' },
  { name: 'Other Income', type: 'income', color: '#064e3b', icon: '' },

  // Expense Categories
  { name: 'Food & Dining', type: 'expense', color: '#dc2626', icon: '' },
  { name: 'Transportation', type: 'expense', color: '#ea580c', icon: '' },
  { name: 'Shopping', type: 'expense', color: '#ca8a04', icon: '' },
  { name: 'Entertainment', type: 'expense', color: '#9333ea', icon: '' },
  { name: 'Bills & Utilities', type: 'expense', color: '#2563eb', icon: '' },
  { name: 'Healthcare', type: 'expense', color: '#db2777', icon: '' },
  { name: 'Education', type: 'expense', color: '#7c3aed', icon: '' },
  { name: 'Travel', type: 'expense', color: '#0891b2', icon: '' },
  { name: 'Home & Garden', type: 'expense', color: '#65a30d', icon: '' },
  { name: 'Other Expenses', type: 'expense', color: '#4b5563', icon: '' }
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