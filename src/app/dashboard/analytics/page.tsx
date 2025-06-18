"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useDashboards } from '@/lib/dashboard-context'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sankey } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, BarChart2, AlertCircle, Briefcase, Zap, Gauge } from 'lucide-react'
import { formatCurrency, formatCurrencyShort, getUserCurrency, CurrencyConfig } from '@/lib/currency'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardSelector } from '@/components/dashboard-selector'

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
  sankeyData: { nodes: { name: string }[], links: { source: number, target: number, value: number }[] }
  netCashFlow: number
  burnRate: number
  runway: number
  profitMargin: number
    topCategory: string
  dailyAverage: number
  monthlyProjection: number
    avgMonthlyIncome: number
    avgMonthlyExpenses: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19D4FF'];

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { activeDashboard } = useDashboards()
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

        const buildQuery = (query: any) => {
          if (activeDashboard?.id) {
            return query.eq('dashboard_id', activeDashboard.id)
          }
          return query.is('dashboard_id', null)
        }

        const transactionQuery = supabase
        .from('transactions')
          .select('date, amount, type, categories ( name, color )')
        .eq('user_id', user.id)
          .gte('date', dateFrom.toISOString())

        const { data: transactions, error } = await buildQuery(transactionQuery)

        if (error) throw error
        if (!transactions || transactions.length === 0) {
            setData(null)
            setIsLoading(false)
        return
      }

        const typedTransactions = transactions as Transaction[];
        
        const expenses = typedTransactions.filter(t => t.type === 'expense')
        const income = typedTransactions.filter(t => t.type === 'income')
        const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)

        const categoryMap = new Map<string, { value: number, color: string }>()
        expenses.forEach(t => {
          const name = t.categories?.[0]?.name || 'Uncategorized'
          const color = t.categories?.[0]?.color || '#8884d8'
          if (!categoryMap.has(name)) categoryMap.set(name, { value: 0, color })
          categoryMap.get(name)!.value += t.amount
        })
        const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.value - a.value)

        const sankeyNodes: { name: string }[] = [{ name: 'Total Income' }]
        const sankeyLinks: { source: number; target: number; value: number }[] = []
        const nodeMap = new Map<string, number>([['Total Income', 0]])

        categoryBreakdown.forEach(cat => {
            if (!nodeMap.has(cat.name)) {
                nodeMap.set(cat.name, sankeyNodes.length)
                sankeyNodes.push({ name: cat.name })
            }
            sankeyLinks.push({ source: 0, target: nodeMap.get(cat.name)!, value: cat.value })
        })
        const netSavings = totalIncome - totalExpenses
        if (netSavings > 0) {
            if (!nodeMap.has('Savings')) {
                nodeMap.set('Savings', sankeyNodes.length)
                sankeyNodes.push({ name: 'Savings' })
            }
            sankeyLinks.push({ source: 0, target: nodeMap.get('Savings')!, value: netSavings })
        }
        const sankeyData = { nodes: sankeyNodes, links: sankeyLinks };
        
        const netCashFlow = totalIncome - totalExpenses
        const burnRate = months > 0 ? totalExpenses / months : 0
        
        let totalBalance = 0;
        if(activeDashboard?.id) {
            const { data: dashboardBalance } = await supabase.rpc('get_dashboard_balance', { p_dashboard_id: activeDashboard.id });
            totalBalance = dashboardBalance;
        } else {
            const { data: mainBalance } = await supabase.rpc('get_total_balance', { p_user_id: user.id });
            totalBalance = mainBalance;
        }

        const runway = totalBalance > 0 && burnRate > 0 ? totalBalance / burnRate : 0
        const profitMargin = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : 0

        const monthlyMap = new Map<string, { income: number; expenses: number }>()
        typedTransactions.forEach(t => {
          const month = new Date(t.date).toLocaleDateString('en-US', { year: '2-digit', month: 'short' })
          if (!monthlyMap.has(month)) monthlyMap.set(month, { income: 0, expenses: 0 })
          
          if (t.type === 'income') monthlyMap.get(month)!.income += t.amount
          else monthlyMap.get(month)!.expenses += t.amount
        })
        const monthlyBreakdown = Array.from(monthlyMap.entries()).map(([month, data]) => ({ month, ...data })).reverse()
        const topCategory = categoryBreakdown[0]?.name || 'N/A'
        const dailyAverage = months > 0 ? totalExpenses / (months * 30) : 0
        const currentMonthExpenses = expenses.filter(t => new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0)
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
        const dayOfMonth = new Date().getDate()
        const monthlyProjection = dayOfMonth > 0 ? (currentMonthExpenses / dayOfMonth) * daysInMonth : 0
        const avgMonthlyIncome = months > 0 ? totalIncome / months : 0
        const avgMonthlyExpenses = months > 0 ? totalExpenses / months : 0

        setData({
          monthlyBreakdown, categoryBreakdown, sankeyData, netCashFlow, burnRate,
          runway, profitMargin, topCategory, dailyAverage, monthlyProjection,
          avgMonthlyIncome, avgMonthlyExpenses
        })

      } catch (err: any) {
        setError(err.message || 'Failed to fetch analytics data.')
    } finally {
      setIsLoading(false)
    }
    }
    fetchAnalyticsData()
  }, [user, period, activeDashboard])
  
  const StatCard = ({ title, value, icon: Icon, unit }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}{unit}</div>
      </CardContent>
    </Card>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 mt-4">
        <BarChart2 className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Data for Analytics</h3>
        <p className="text-muted-foreground mb-4">There is no transaction data for the selected period or dashboard. <br/> Please select another period or import some transactions.</p>
      </div>
    )

  const LoadingState = () => (
    <div className="space-y-4">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse ml-auto"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>)}
            </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>)}
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
              <DashboardSelector />
            </div>
            <div className="border-b border-gray-200 my-4"></div>

            {isLoading ? <LoadingState /> : error ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Error Loading Analytics</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Try Again</Button>
                          </div>
            ) : !data ? <EmptyState /> : (
            <div className="space-y-4">
                <div className="flex items-center justify-end space-x-2">
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Select period" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3m">Last 3 Months</SelectItem>
                        <SelectItem value="6m">Last 6 Months</SelectItem>
                        <SelectItem value="12m">Last 12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                        </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard title="Net Cash Flow" value={currency ? formatCurrency(data.netCashFlow, currency) : '...'} icon={Briefcase} />
                  <StatCard title="Monthly Burn Rate" value={currency ? formatCurrency(data.burnRate, currency) : '...'} icon={Zap} />
                  <StatCard title="Runway" value={`${data.runway.toFixed(1)}`} unit=" months" icon={Gauge} />
                  <StatCard title="Profit Margin" value={`${data.profitMargin.toFixed(1)}`} unit="%" icon={TrendingUp} />
                            </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <StatCard title="Avg Monthly Income" value={currency ? formatCurrency(data.avgMonthlyIncome, currency) : '...'} icon={TrendingUp} />
                  <StatCard title="Avg Monthly Expenses" value={currency ? formatCurrency(data.avgMonthlyExpenses, currency) : '...'} icon={TrendingDown} />
                  <StatCard title="Daily Avg Expense" value={currency ? formatCurrency(data.dailyAverage, currency) : '...'} icon={DollarSign} />
                  <StatCard title="Monthly Projection" value={currency ? formatCurrency(data.monthlyProjection, currency) : '...'} icon={BarChart2} />
                  <StatCard title="Top Expense Category" value={data.topCategory} icon={PieIcon} />
                        </div>

                <div className="grid gap-4 md:grid-cols-1">
                    <Card><CardHeader><CardTitle>Cash Flow Sankey</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <>
                                    {data.sankeyData && data.sankeyData.nodes.length > 1 ? (
                                        <Sankey data={data.sankeyData} nodePadding={50} margin={{ top: 5, right: 5, bottom: 5, left: 5 }} link={{ stroke: '#B3C4D8' }}><Tooltip /></Sankey>
                                    ) : ( <div className="flex items-center justify-center h-full text-sm text-gray-500">Not enough data to display cash flow.</div> )}
                                </>
                            </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4"><CardHeader><CardTitle>Cash Flow (Income vs Expenses)</CardTitle></CardHeader>
                    <CardContent className="pl-2">
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data.monthlyBreakdown}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => currency ? formatCurrencyShort(value, currency) : value} /><Tooltip formatter={(value: number) => currency ? formatCurrency(value, currency) : value} /><Legend /><Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" /><Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" /></BarChart>
                      </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  <Card className="col-span-4 md:col-span-3"><CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie data={data.categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false}
                               label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                 const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                 const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                 const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                 return (percent > 0.05) ? <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>{`${(percent * 100).toFixed(0)}%`}</text> : null;
                               }}>
                            {data.categoryBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                          <Tooltip formatter={(value: number) => currency ? formatCurrency(value, currency) : value} /><Legend wrapperStyle={{fontSize: "12px"}}/>
                        </PieChart>
                            </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                    </div>
                  )}
        </main>
      </div>
    </div>
  )
} 