"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User,
  Bell,
  Shield,
  CreditCard,
  Download,
  Trash2,
  ChevronRight,
  AlertTriangle
} from "lucide-react"

export default function SettingsPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!session) {
    redirect("/")
  }

  const settingsSections = [
    {
      title: "Account",
      icon: User,
      items: [
        { name: "Profile Information", description: "Update your name, email, and profile picture", action: "Edit" },
        { name: "Password & Security", description: "Change password and enable two-factor authentication", action: "Manage" },
        { name: "Connected Accounts", description: "Link your bank accounts and third-party services", action: "View" }
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        { name: "Email Notifications", description: "Budget alerts, weekly summaries, and goal updates", action: "Configure" },
        { name: "Push Notifications", description: "Real-time alerts for your mobile device", action: "Configure" },
        { name: "SMS Alerts", description: "Critical alerts via text message", action: "Setup" }
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      items: [
        { name: "Data Privacy", description: "Control how your data is used and shared", action: "Review" },
        { name: "Session Management", description: "View and manage your active sessions", action: "Manage" },
        { name: "Export Data", description: "Download all your financial data", action: "Export" }
      ]
    },
    {
      title: "Billing",
      icon: CreditCard,
      items: [
        { name: "Subscription Plan", description: "Currently on Free Plan", action: "Upgrade" },
        { name: "Payment Methods", description: "Manage your payment methods", action: "Add" },
        { name: "Billing History", description: "View past invoices and payments", action: "View" }
      ]
    }
  ]

  const quickActions = [
    {
      title: "Export All Data",
      description: "Download your complete financial data",
      icon: Download,
      action: "Export",
      variant: "outline" as const
    },
    {
      title: "Two-Factor Auth",
      description: "Secure your account with 2FA",
      icon: Shield,
      action: "Enable",
      variant: "outline" as const
    },
    {
      title: "Delete Account",
      description: "Permanently delete your account and data",
      icon: Trash2,
      action: "Delete",
      variant: "destructive" as const
    }
  ]

  const recentActivity = [
    { action: "Password changed", time: "2 hours ago", location: "San Francisco, CA" },
    { action: "New session started", time: "1 day ago", location: "New York, NY" },
    { action: "Email updated", time: "3 days ago", location: "San Francisco, CA" },
    { action: "2FA enabled", time: "1 week ago", location: "San Francisco, CA" }
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Settings" />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account preferences and security settings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Settings */}
              <div className="lg:col-span-2 space-y-6">
                
                {settingsSections.map((section, index) => (
                  <Card key={index} className="border-0 shadow-sm bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <section.icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                      </div>
                      
                      <div className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <div>
                              <h4 className="font-medium text-gray-900">{item.name}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                {item.action}
                              </Button>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Danger Zone */}
                <Card className="border-0 shadow-sm bg-white border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Danger Zone</h3>
                        <p className="text-sm text-gray-600">These actions cannot be undone</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-red-900">Delete Account</h4>
                          <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Account Overview */}
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{session.user?.name || 'User'}</p>
                          <p className="text-sm text-gray-600">{session.user?.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Plan</span>
                          <Badge className="bg-green-50 text-green-700 border-green-200">Free</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Member since</span>
                          <span className="text-sm text-gray-900">Dec 2024</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Two-Factor Auth</span>
                          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Not enabled</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    
                    <div className="space-y-3">
                      {quickActions.map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              action.variant === 'destructive' 
                                ? 'bg-red-100' 
                                : 'bg-gray-100'
                            }`}>
                              <action.icon className={`h-4 w-4 ${
                                action.variant === 'destructive' 
                                  ? 'text-red-600' 
                                  : 'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{action.title}</p>
                              <p className="text-xs text-gray-600">{action.description}</p>
                            </div>
                          </div>
                          <Button variant={action.variant} size="sm">
                            {action.action}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-600">{activity.time} • {activity.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button variant="ghost" size="sm" className="w-full mt-4">
                      View All Activity
                    </Button>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 