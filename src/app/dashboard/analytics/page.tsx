"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, BarChart2, AlertCircle } from 'lucide-react'
import { formatCurrency, formatCurrencyShort, getUserCurrency, CurrencyConfig } from '@/lib/currency'
import { Button } from '@/components/ui/button'

type Transaction = {
  date: string;
  amount: number;
  type: 'income' | 'expense';
  categories: {
    name: string;
    color: string;
  }[] | null;
};

interface AnalyticsData {
  monthlyBreakdown: { month: string; income: number; expenses: number }[]
  categoryBreakdown: { name: string; value: number; color: string }[]
  topCategory: string
  dailyAverage: number
  monthlyProjection: number
  avgMonthlyIncome: number
  avgMonthlyExpenses: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19D4FF'];

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('6m')
  const [currency, setCurrency] = useState<CurrencyConfig | null>(null)

  useEffect(() => {
    if (user) {
      const fetchCurrency = async () => {
        const c = await getUserCurrency(user.id)
        setCurrency(c)
      }
      fetchCurrency()
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const fetchAnalyticsData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const dateFrom = new Date()
        const months = period === '3m' ? 3 : period === '6m' ? 6 : 12
        dateFrom.setMonth(dateFrom.getMonth() - months)

        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('date, amount, type, categories ( name, color )')
          .eq('user_id', user.id)
          .gte('date', dateFrom.toISOString())

        if (error) throw error
        if (!transactions) throw new Error("No transactions found")

        const typedTransactions = transactions as Transaction[];

        // 1. Monthly Breakdown
        const monthlyMap = new Map<string, { income: number; expenses: number }>()
        typedTransactions.forEach(t => {
          const month = new Date(t.date).toLocaleDateString('en-US', { year: '2-digit', month: 'short' })
          if (!monthlyMap.has(month)) monthlyMap.set(month, { income: 0, expenses: 0 })
          
          if (t.type === 'income') monthlyMap.get(month)!.income += t.amount
          else monthlyMap.get(month)!.expenses += t.amount
        })
        const monthlyBreakdown = Array.from(monthlyMap.entries()).map(([month, data]) => ({ month, ...data })).reverse()

        // 2. Category Breakdown
        const categoryMap = new Map<string, { value: number, color: string }>()
        typedTransactions.filter(t => t.type === 'expense').forEach(t => {
          const name = t.categories?.[0]?.name || 'Uncategorized'
          const color = t.categories?.[0]?.color || '#8884d8'
          if (!categoryMap.has(name)) categoryMap.set(name, { value: 0, color })
          categoryMap.get(name)!.value += t.amount
        })
        const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.value - a.value)
        
        // 3. Key Metrics
        const expenses = typedTransactions.filter(t => t.type === 'expense')
        const income = typedTransactions.filter(t => t.type === 'income')
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
        
        const topCategory = categoryBreakdown[0]?.name || 'N/A'
        const dailyAverage = totalExpenses / (months * 30)
        
        const currentMonthExpenses = expenses.filter(t => new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0)
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
        const dayOfMonth = new Date().getDate()
        const monthlyProjection = (currentMonthExpenses / dayOfMonth) * daysInMonth
        
        const avgMonthlyIncome = totalIncome / months
        const avgMonthlyExpenses = totalExpenses / months

        setData({
          monthlyBreakdown,
          categoryBreakdown,
          topCategory,
          dailyAverage,
          monthlyProjection,
          avgMonthlyIncome,
          avgMonthlyExpenses
        })

      } catch (err: any) {
        setError(err.message || 'Failed to fetch analytics data.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [user, period])
  
  const StatCard = ({ title, value, icon: Icon, change, changeType }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
            {change} vs last period
          </p>
        )}
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>)}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-80 bg-gray-200 rounded animate-pulse lg:col-span-2"></div>
          <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Analytics</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Avg Monthly Income" value={currency ? formatCurrency(data?.avgMonthlyIncome || 0, currency) : '...'} icon={TrendingUp} />
        <StatCard title="Avg Monthly Expenses" value={currency ? formatCurrency(data?.avgMonthlyExpenses || 0, currency) : '...'} icon={TrendingDown} />
        <StatCard title="Daily Avg Expense" value={currency ? formatCurrency(data?.dailyAverage || 0, currency) : '...'} icon={DollarSign} />
        <StatCard title="Monthly Projection" value={currency ? formatCurrency(data?.monthlyProjection || 0, currency) : '...'} icon={BarChart2} />
        <StatCard title="Top Expense Category" value={data?.topCategory} icon={PieIcon} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Cash Flow (Income vs Expenses)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data?.monthlyBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => currency ? formatCurrencyShort(value, currency) : value} />
                <Tooltip formatter={(value: number) => currency ? formatCurrency(value, currency) : value} />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 md:col-span-3">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={data?.categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false}
                     label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                       const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                       const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                       const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                       return (percent > 0.05) ? <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>{`${(percent * 100).toFixed(0)}%`}</text> : null;
                     }}>
                  {data?.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => currency ? formatCurrency(value, currency) : value} />
                <Legend wrapperStyle={{fontSize: "12px"}}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 