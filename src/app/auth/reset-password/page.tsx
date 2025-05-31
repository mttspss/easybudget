"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if we have the necessary hash/access token from the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    
    if (!accessToken) {
      setError("Invalid reset link. Please request a new password reset.")
    }
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      alert("Password updated successfully! You can now sign in with your new password.")
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error updating password:', error)
      setError("Error updating password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7aff01]/8 via-white to-[#7aff01]/4 relative overflow-hidden">
      {/* Subtle patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(122,255,1,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.8),transparent_50%)]"></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-xs">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Image 
                src="/mainlogo.svg" 
                alt="EasyBudget Logo" 
                width={64} 
                height={64} 
                className="w-16 h-16 object-contain" 
              />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Reset Your Password
            </h1>
            <p className="text-gray-600 text-sm">Enter your new password</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"}
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="New Password" 
                className="h-10 bg-white/80 backdrop-blur-sm border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#7aff01] focus:ring-[#7aff01]/20 shadow-sm text-sm pr-10" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <Input 
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm New Password" 
                className="h-10 bg-white/80 backdrop-blur-sm border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#7aff01] focus:ring-[#7aff01]/20 shadow-sm text-sm pr-10" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-md text-sm" 
              disabled={loading || !!error}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>

          {/* Back to sign in */}
          <div className="mt-6 text-center">
            <Link href="/auth/signin" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 