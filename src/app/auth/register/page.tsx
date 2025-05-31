"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function RegisterPage() {
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authLoading, setAuthLoading] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      await signUpWithEmail(email, password)
      router.push('/')
    } catch (error) {
      console.error('Error signing up:', error)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setAuthLoading(true)
    try {
      await signInWithGoogle()
      router.push('/')
    } catch (error) {
      console.error('Error signing in with Google:', error)
    } finally {
      setAuthLoading(false)
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
              Welcome to{" "}
              <span className="text-gray-900">easybudget</span>
              <span className="bg-gradient-to-r from-[#7aff01] to-[#9eff31] bg-clip-text text-transparent">.ing</span>
            </h1>
            <p className="text-gray-600 text-sm">Create your account to get started</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Google Button */}
            <Button 
              type="button" 
              onClick={handleGoogleAuth} 
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md border-0" 
              disabled={authLoading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleAuth} className="space-y-3">
              <div>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Email" 
                  className="h-10 bg-white/80 backdrop-blur-sm border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#7aff01] focus:ring-[#7aff01]/20 shadow-sm text-sm" 
                  required 
                />
              </div>

              <div>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Password" 
                  className="h-10 bg-white/80 backdrop-blur-sm border-gray-300 text-gray-900 placeholder-gray-500 focus:border-[#7aff01] focus:ring-[#7aff01]/20 shadow-sm text-sm" 
                  required 
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-10 bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-md text-sm" 
                disabled={authLoading}
              >
                {authLoading ? "Creating Account..." : "Continue"}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="text-center space-y-3">
              <p className="text-gray-600 text-sm">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-[#7aff01] hover:text-[#9eff31] font-medium">
                  Sign in
                </Link>
              </p>
              
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <Link href="/privacy" className="hover:text-gray-700">
                  Privacy
                </Link>
                <span>•</span>
                <Link href="/terms" className="hover:text-gray-700">
                  Terms
                </Link>
              </div>
            </div>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 