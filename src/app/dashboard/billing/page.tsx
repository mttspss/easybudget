"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useSubscription } from "@/lib/subscription-context"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { 
  CreditCard,
  ExternalLink,
  Settings,
  Crown,
  Zap,
  Rocket,
  DollarSign,
  Layers,
  FileText,
  Upload,
  Target as TargetIcon
} from "lucide-react"

export default function BillingPage() {
  const { user, loading } = useAuth()
  const { plan, status, isLoading: subscriptionLoading, transactionsThisMonth, csvImportsThisMonth, goalsCount, dashboardsCount } = useSubscription()
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const router = useRouter()

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    redirect("/")
  }

  const handleManageBilling = async () => {
    setIsPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ userId: user.id, }),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error('Could not access the billing portal.')
      }
    } catch (err) {
      console.error('Error accessing billing portal:', err)
      toast.error('Error accessing billing portal.')
    } finally {
      setIsPortalLoading(false)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter': return <Zap className="h-5 w-5" />;
      case 'pro': return <Crown className="h-5 w-5" />;
      case 'growth': return <Rocket className="h-5 w-5" />;
      case 'full_monthly':
      case 'full_yearly': 
      case 'lifetime': return <Crown className="h-5 w-5" />;
      default: return <DollarSign className="h-5 w-5" />;
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'starter': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pro': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'growth': return 'bg-green-100 text-green-800 border-green-300';
      case 'full_monthly':
      case 'full_yearly':
      case 'lifetime': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }
  
  const usageStats = [
    {
      title: 'Transactions',
      icon: FileText,
      current: transactionsThisMonth,
      limit: plan.maxTransactions,
    },
    {
      title: 'Custom Dashboards',
      icon: Layers,
      current: dashboardsCount, 
      limit: plan.maxDashboards,
    },
     {
      title: 'CSV Imports this month',
      icon: Upload,
      current: csvImportsThisMonth,
      limit: plan.maxCsvImports,
    },
    {
      title: 'Financial Goals',
      icon: TargetIcon,
      current: goalsCount,
      limit: plan.maxGoals,
    },
  ]

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-3">
          <div className="max-w-5xl mx-auto space-y-4">
            
            <div>
              <h1 className="text-lg font-bold text-gray-900">Billing & Subscription</h1>
              <p className="text-gray-600 text-xs">Manage your plan, see your usage, and view billing history.</p>
            </div>

            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="border-b border-gray-100 py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4 text-gray-600" />
                  Your Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getPlanColor(plan.id)}`}>
                      {getPlanIcon(plan.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{plan.name} Plan</h3>
                        <Badge className={getPlanColor(plan.id)}>{status || 'active'}</Badge>
                      </div>
                      <p className="text-gray-600 text-sm mt-0.5">
                        {plan.id === 'free' ? "Upgrade to unlock powerful features." : `You have access to all ${plan.name} features.`}
                      </p>
                    </div>
                  </div>
                  
                  {plan.id !== 'free' ? (
                    <Button onClick={handleManageBilling} disabled={isPortalLoading} size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      {isPortalLoading ? 'Loading...' : 'Manage Subscription'}
                    </Button>
                  ) : (
                     <Button onClick={() => router.push('/#pricing')} size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                       Upgrade Plan <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="pt-2">
               <h2 className="text-base font-semibold text-gray-900 mb-2">Your Usage</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {usageStats.map((stat) => (
                  <Card key={stat.title} className="bg-white border-0 shadow-sm">
                    <CardContent className="p-4">
                       <div className="flex items-center gap-3">
                        <stat.icon className="h-5 w-5 text-gray-500" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-gray-800">{stat.title}</p>
                            <p className="text-sm font-semibold">
                              {stat.current}
                              <span className="text-gray-500"> / {stat.limit === Infinity ? 'Unlimited' : stat.limit}</span>
                            </p>
                          </div>
                          {stat.limit !== Infinity && (
                            <Progress value={(stat.current / stat.limit) * 100} className="h-2 mt-2" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 