"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useSubscription } from "@/lib/use-subscription"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  CreditCard,
  Calendar,
  ExternalLink,
  Settings,
  Crown,
  Zap,
  Rocket
} from "lucide-react"

export default function BillingPage() {
  const { user, loading } = useAuth()
  const { subscription, planType, loading: subscriptionLoading } = useSubscription(user?.id)
  const [isLoading, setIsLoading] = useState(false)

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
    setIsLoading(true)
    try {
      console.log('=== OPENING CUSTOMER PORTAL ===')
      console.log('User ID:', user.id)
      
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        console.error('API Error:', data)
        toast.error(data.error || 'Failed to create portal session')
        return
      }

      if (data.url) {
        console.log('Redirecting to:', data.url)
        window.location.href = data.url
      } else {
        console.error('No URL in response:', data)
        toast.error('No portal URL received')
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
      toast.error('Network error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'starter': return <Zap className="h-5 w-5" />
      case 'pro': return <Crown className="h-5 w-5" />
      case 'growth': return <Rocket className="h-5 w-5" />
      default: return <Settings className="h-5 w-5" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'starter': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'pro': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'growth': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
                <p className="text-gray-600 mt-1">Manage your subscription, billing, and payment methods</p>
              </div>
            </div>

            {/* Current Plan */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${getPlanColor(planType)}`}>
                      {getPlanIcon(planType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {planType.charAt(0).toUpperCase() + planType.slice(1)} Plan
                        </h3>
                        <Badge className={getPlanColor(planType)}>
                          {subscription?.status || 'active'}
                        </Badge>
                      </div>
                      {subscription?.billing_interval && (
                        <p className="text-gray-600 mt-1">
                          Billed {subscription.billing_interval}ly
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {planType !== 'free' && (
                    <Button 
                      onClick={handleManageBilling}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      {isLoading ? 'Loading...' : 'Manage Billing'}
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Details */}
            {subscription && planType !== 'free' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Current Period</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Status</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {subscription.status}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Subscription ID</p>
                        <p className="text-sm text-gray-600 font-mono">
                          {subscription.subscription_id?.slice(-12) || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Free Plan Upgrade */}
            {planType === 'free' && (
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ready to unlock more features?
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Upgrade to a paid plan to access advanced analytics, unlimited transactions, and priority support.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/#pricing'}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      View Plans
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Section */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <p className="text-gray-600">
                    • <strong>Change Plan:</strong> Use the &ldquo;Manage Billing&rdquo; button to upgrade, downgrade, or cancel
                  </p>
                  <p className="text-gray-600">
                    • <strong>Update Payment:</strong> Add or change your payment method in the billing portal
                  </p>
                  <p className="text-gray-600">
                    • <strong>Download Invoices:</strong> Access all your invoices and receipts
                  </p>
                  <p className="text-gray-600">
                    • <strong>Support:</strong> Contact us at support@easybudget.ing for any billing questions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 