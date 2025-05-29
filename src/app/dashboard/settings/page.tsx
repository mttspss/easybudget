"use client"

import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Settings,
  User,
  Shield
} from "lucide-react"

export default function SettingsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    redirect("/")
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account and preferences</p>
              </div>
            </div>

            {/* Coming Soon Message */}
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="flex justify-center space-x-4 mb-6">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Settings className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <User className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Shield className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Settings Panel Coming Soon
                  </h2>
                  
                  <p className="text-gray-600 mb-6">
                    We&apos;re building comprehensive settings including profile management, 
                    security options, and customization features. Check back soon!
                  </p>
                  
                  <div className="flex flex-col space-y-2 text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Profile and account management</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Security and privacy settings</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>Theme and customization options</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  )
} 