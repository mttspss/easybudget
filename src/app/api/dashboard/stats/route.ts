import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { PrismaClient, Transaction } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month' // month, week, year

    // Calculate date ranges
    const now = new Date()
    let startDate: Date
    const endDate = now

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Get transactions for the period
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Calculate totals
    const income = transactions
      .filter((t: Transaction) => t.type === 'income')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

    const expenses = transactions
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

    const balance = income - expenses

    // Get all transactions for total balance
    const allTransactions = await prisma.transaction.findMany({
      where: { userId: user.id }
    })

    const totalIncome = allTransactions
      .filter((t: Transaction) => t.type === 'income')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

    const totalExpenses = allTransactions
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

    const totalBalance = totalIncome - totalExpenses

    // Get recent transactions (last 5)
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 5
    })

    // Get categories with their spending for the period
    const categories = await prisma.category.findMany({
      where: { userId: user.id }
    })

    const categorySpending = await Promise.all(
      categories.map(async (category) => {
        const categoryTransactions = transactions.filter((t: Transaction) => t.categoryId === category.id)
        const spent = categoryTransactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0)
        
        // Get budget for this category
        const budget = await prisma.budget.findFirst({
          where: {
            categoryId: category.id,
            userId: user.id,
            startDate: { lte: endDate },
            endDate: { gte: startDate }
          }
        })

        return {
          category: category.name,
          color: category.color,
          spent,
          budget: budget?.amount || 0,
          percentage: budget?.amount ? (spent / budget.amount) * 100 : 0
        }
      })
    )

    return NextResponse.json({
      period,
      totalBalance,
      income,
      expenses,
      balance,
      recentTransactions,
      categorySpending: categorySpending.filter(c => c.spent > 0)
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 