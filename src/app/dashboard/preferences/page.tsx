"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { 
  Globe,
  Bell,
  Palette,
  Save
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface UserPreferences {
  currency: string
  date_format: string
  timezone: string
  theme: string
  email_notifications: boolean
  push_notifications: boolean
  weekly_reports: boolean
  budget_alerts: boolean
}

export default function PreferencesPage() {
  const { user, loading } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: "EUR",
    date_format: "DD/MM/YYYY",
    timezone: "Europe/Rome",
    theme: "light",
    email_notifications: true,
    push_notifications: false,
    weekly_reports: true,
    budget_alerts: true
  })

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return
      
      try {
        const { data } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (data) {
          setPreferences(data)
        }
      } catch {
        console.log("No preferences found, using defaults")
      }
    }

    loadPreferences()
  }, [user])

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

  const handleSavePreferences = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      // Clear currency cache to force refresh
      if (typeof window !== 'undefined') {
        // Force currency cache refresh
        const { getUserCurrency } = await import('@/lib/currency')
        await getUserCurrency(user.id)
      }
      
      toast.success("Preferences saved successfully!", {
        description: "Your changes have been applied.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast.error("Failed to save preferences", {
        description: "Please try again later.",
        duration: 4000,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const currencies = [
    { value: "EUR", label: "EUR - Euro" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "GBP", label: "GBP - British Pound" },
    { value: "JPY", label: "JPY - Japanese Yen" },
    { value: "CAD", label: "CAD - Canadian Dollar" },
    { value: "AUD", label: "AUD - Australian Dollar" },
    { value: "CHF", label: "CHF - Swiss Franc" },
    { value: "CNY", label: "CNY - Chinese Yuan" }
  ]

  const dateFormats = [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024)" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" },
    { value: "DD MMM YYYY", label: "DD MMM YYYY (31 Dec 2024)" }
  ]

  const timezones = [
    { value: "Europe/Rome", label: "Rome (CET)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Australia/Sydney", label: "Sydney (AEST)" }
  ]

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-3">
          <div className="max-w-7xl mx-auto space-y-3">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Preferences</h1>
                <p className="text-gray-600 text-xs">Customize your app experience</p>
              </div>
            </div>

            {/* Regional Settings */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-gray-600" />
                  Regional Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select 
                      value={preferences.currency} 
                      onValueChange={(value) => updatePreference('currency', value)}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">This will change the currency symbol displayed throughout the app (€, $, £, etc.). No conversion is applied - only the display format changes.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select 
                      value={preferences.date_format} 
                      onValueChange={(value) => updatePreference('date_format', value)}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dateFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select 
                    value={preferences.timezone} 
                    onValueChange={(value) => updatePreference('timezone', value)}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((timezone) => (
                        <SelectItem key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-gray-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive updates and alerts via email</p>
                    </div>
                    <Switch 
                      checked={preferences.email_notifications}
                      onCheckedChange={(checked: boolean) => updatePreference('email_notifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Get instant notifications in your browser</p>
                    </div>
                    <Switch 
                      checked={preferences.push_notifications}
                      onCheckedChange={(checked: boolean) => updatePreference('push_notifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-gray-500">Receive weekly spending summaries</p>
                    </div>
                    <Switch 
                      checked={preferences.weekly_reports}
                      onCheckedChange={(checked: boolean) => updatePreference('weekly_reports', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Budget Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified when approaching budget limits</p>
                    </div>
                    <Switch 
                      checked={preferences.budget_alerts}
                      onCheckedChange={(checked: boolean) => updatePreference('budget_alerts', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-5 w-5 text-gray-600" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select 
                    value={preferences.theme} 
                    onValueChange={(value) => updatePreference('theme', value)}
                  >
                    <SelectTrigger className="bg-gray-50 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Choose your preferred theme for the interface</p>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSavePreferences}
                disabled={isUpdating}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? "Saving..." : "Save Preferences"}
              </Button>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
} 