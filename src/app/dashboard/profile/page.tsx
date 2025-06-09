"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { 
  User,
  Shield,
  Trash2,
  Upload,
  Save,
  Eye,
  EyeOff
} from "lucide-react"

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  // Profile form state
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "")
  const [email] = useState(user?.email || "")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

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

  const handleUpdateProfile = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })
      
      if (error) throw error
      
      toast.success("Profile updated successfully!", {
        description: "Your profile information has been saved.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Error updating profile", {
        description: "Please try again later.",
        duration: 4000,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both password fields match.",
        duration: 4000,
      })
      return
    }
    
    if (newPassword.length < 6) {
      toast.error("Password too short", {
        description: "Password must be at least 6 characters long.",
        duration: 4000,
      })
      return
    }

    setIsUpdating(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Password updated successfully!", {
        description: "Your password has been changed.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error("Error updating password", {
        description: "Please try again later.",
        duration: 4000,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-3">
          <div className="max-w-7xl mx-auto space-y-3">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 text-xs">Manage your account information and security</p>
              </div>
            </div>

            {/* Profile Information */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-gray-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Avatar Section */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 ring-4 ring-gray-100">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt="Profile" />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                      {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Profile Picture</h3>
                    <p className="text-sm text-gray-500">Update your profile picture</p>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload New
                    </Button>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed. Contact support if needed.</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={isUpdating}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4" />
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-gray-600" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Change Password</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input 
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleChangePassword}
                      disabled={isUpdating || !newPassword || !confirmPassword}
                      variant="outline"
                      className="gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      {isUpdating ? "Updating..." : "Change Password"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-white border-0 shadow-sm border-red-200">
              <CardHeader className="border-b border-red-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-red-600">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Delete Account</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  
                  <Button 
                    variant="destructive"
                    className="gap-2"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                        alert("Account deletion feature will be implemented soon.")
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  )
} 