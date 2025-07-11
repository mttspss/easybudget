"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardPreview } from "@/components/ui/dashboard-preview"
import {
  Mail,
  ChevronDown,
  Check,
  X,
  Menu,
  ArrowRight,
  Twitter
} from "lucide-react"

// User Count Section Component
function UserCountSection() {
  const [userCount, setUserCount] = useState(0)
  const [userInitials, setUserInitials] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch('/api/stats/users')
        if (response.ok) {
          const data = await response.json()
          setUserCount(data.totalUsers || 0)
          setUserInitials(data.userInitials || ['M', 'A', 'S', 'L', 'E', 'R', 'C', 'D'])
        }
      } catch (error) {
        console.error('Error fetching user count:', error)
        // Fallback to reasonable defaults if API fails
        setUserCount(48)
        setUserInitials(['M', 'A', 'S', 'L', 'E', 'R', 'C', 'D'])
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserCount()
  }, [])

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* User Avatars - Simple circles with initials like CodeFast */}
      <div className="flex -space-x-2">
        {userInitials.slice(0, 8).map((initial, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold"
            style={{
              background: `linear-gradient(135deg, hsl(${200 + i * 30}, 70%, 60%), hsl(${220 + i * 25}, 65%, 50%))`
            }}
          >
            {initial}
          </div>
        ))}
      </div>

      {/* User Count Text */}
      <div className="text-center">
        <p className="text-gray-600 text-base">
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            <>
              <span className="font-semibold text-gray-900">{formatNumber(userCount)} people</span>
              <span className="italic"> managing their finances</span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [email, setEmail] = useState("")
  const router = useRouter()
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [isCreatingCheckout, setIsCreatingCheckout] = useState<string | null>(null)
  const [showMoneyAnimation, setShowMoneyAnimation] = useState(false)

  // Function to handle billing toggle with animation
  const handleBillingToggle = () => {
    setShowMoneyAnimation(true)
    setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')
    setTimeout(() => setShowMoneyAnimation(false), 2000)
  }

  // Money animation component
  function MoneyAnimation() {
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s'
            }}
          >
            <span className="text-2xl">💰</span>
          </div>
        ))}
      </div>
    )
  }

  // New plans configuration
  const fullPlan = {
    name: "Full Access",
    monthlyPrice: 22,
    yearlyPrice: 108, // $9/month * 12 months
    monthlyPerMonth: 9, // For yearly display
    features: [
      "Unlimited transactions",
      "Unlimited dashboards", 
      "Unlimited CSV imports",
      "Advanced analytics & reporting",
      "Unlimited financial goals",
      "Priority support",
      "Mobile app access (coming soon)",
      "Export capabilities"
    ]
  }

  const lifetimePlan = {
    name: "Lifetime Access",
    price: 159,
    features: [
      "Everything in Full Access",
      "Lifetime updates",
      "Priority support forever",
      "One-time payment"
    ]
  }

  // Simple announcement banner (replaces discount banner)
  function AnnouncementBanner() {
    return (
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 border border-green-200 text-gray-700 px-4 py-2 text-sm rounded-full font-medium flex items-center gap-2 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span>All your finances in one powerful dashboard</span>
      </div>
    )
  }

  const faqs = [
    {
      q: "Is my financial data secure with EasyBudget?",
      a: "Yes. Security is our top priority. We use Supabase for our backend, which provides robust, enterprise-grade security. Your data is encrypted both in transit and at rest. We never store sensitive credentials and rely on secure authentication methods."
    },
    {
      q: "What file formats can I import?",
      a: "Currently, we support importing transaction data from any CSV file. Our smart import system is designed to automatically detect the correct columns for date, description, and amount, regardless of your bank's format."
    },
    {
      q: "Can I use EasyBudget for both personal and business finances?",
      a: "Absolutely. Our Pro and Growth plans allow you to create multiple dashboards, so you can keep your personal finances completely separate from your business accounts, all while managing them from a single login."
    },
    {
      q: "What happens if I exceed my plan's limits?",
      a: "The application will prevent you from performing actions that exceed your plan's limits. For example, if you reach your monthly transaction limit on the Starter plan, you won&apos;t be able to add new transactions until the next month or until you upgrade your plan. You will see clear messages in the app indicating your current usage."
    },
    {
      q: "Can I change or cancel my plan at any time?",
      a: "Yes. You can manage your subscription, upgrade, downgrade, or cancel at any time through your billing page. Changes will take effect from the next billing cycle."
    },
    {
      q: "Do you offer customer support?",
      a: "Yes! All users can access support via our community channels. Users on our paid plans (Pro and Growth) get access to priority email support for faster response times."
    }
  ]

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/auth/register?email=${encodeURIComponent(email)}`)
  }

  // Price mapping for Stripe
  const PRICE_IDS = {
    full_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FULL_MONTHLY,
    full_yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_FULL_YEARLY,
    lifetime: process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME,
  }

  const handleCheckout = async (planType: 'full_monthly' | 'full_yearly' | 'lifetime') => {
    if (!user) {
      router.push('/auth/register')
      return
    }

    let priceId: string | undefined
    
    if (planType === 'full_monthly') {
      priceId = PRICE_IDS.full_monthly
    } else if (planType === 'full_yearly') {
      priceId = PRICE_IDS.full_yearly  
    } else if (planType === 'lifetime') {
      priceId = PRICE_IDS.lifetime
    }

    if (!priceId) {
      console.error('Price ID not found for:', planType)
      return
    }

    setIsCreatingCheckout(planType)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
    } finally {
      setIsCreatingCheckout(null)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 px-6 py-4 bg-white/80 backdrop-blur supports-backdrop-blur:bg-white/30">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <Image src="/newicon1.png" alt="EasyBudget Logo" width={32} height={32} className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-semibold">
              <span className="text-black font-bold">easybudget</span>
              <span style={{color: '#60ea8b'}} className="font-bold">.ing</span>
            </span>
          </div>

          <div className="hidden md:flex items-center justify-center flex-1">
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors px-4 cursor-pointer">Pricing</a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors px-4 cursor-pointer">FAQ</a>
            <a href="/changelog" className="text-gray-600 hover:text-gray-900 transition-colors px-4 cursor-pointer">Changelog</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/dashboard')} 
                  className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition-all cursor-pointer"
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-gray-900 cursor-pointer"
                  variant="ghost"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/auth/signin')} 
                  className="text-gray-900 font-medium px-6 py-2 rounded-lg border-2 shadow-md hover:opacity-90 transition-all border-green-500 cursor-pointer"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => router.push('/auth/register')} 
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-2 rounded-lg cursor-pointer"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="cursor-pointer">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pt-4 border-t border-gray-200 mt-3">
            <div className="flex flex-col space-y-4">
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 px-2 py-1 cursor-pointer">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 px-2 py-1 cursor-pointer">FAQ</a>
              <a href="/changelog" className="text-gray-600 hover:text-gray-900 px-2 py-1 cursor-pointer">Changelog</a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <Button variant="ghost" onClick={() => router.push('/dashboard')} className="cursor-pointer">Dashboard</Button>
                    <Button variant="outline" onClick={() => signOut()} className="cursor-pointer">Sign Out</Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      onClick={() => router.push('/auth/signin')}
                      className="border-2 shadow-md hover:opacity-90 transition-all cursor-pointer"
                      style={{borderColor: '#60ea8b'}}
                    >
                      Sign In
                    </Button>
                    <Button onClick={() => router.push('/auth/register')} className="bg-slate-900 hover:bg-slate-800 cursor-pointer">Sign Up</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center">
            <AnnouncementBanner />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-[1.1] max-w-4xl">
              Track your entire money life,<br />
              in one view<span className="inline-block w-3 h-3 bg-green-500 rounded-full ml-2"></span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mb-12">
              Your money deserves better than Excel. Easybudget turns every account, transaction, goal, and income stream into one live dashboard—giving you a complete financial overview in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
              <button 
                onClick={() => user ? router.push('/dashboard') : router.push('/auth/register')} 
                className="text-white text-lg font-semibold px-12 py-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-3 transform hover:scale-105 bg-green-500 hover:bg-green-600 cursor-pointer w-full sm:w-auto"
              >
                {user ? 'Go to Dashboard' : 'Get instant access'}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
              
              <button 
                onClick={() => router.push('/auth/register')} 
                className="text-gray-900 text-lg font-semibold px-12 py-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-3 transform hover:scale-105 bg-white hover:bg-gray-50 border-2 border-gray-900 cursor-pointer w-full sm:w-auto"
              >
                Start for Free
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>

            {/* User Count Section - Social Proof */}
            <div className="mb-12">
              <UserCountSection />
            </div>

            {/* Featured On Section - moved below buttons */}
            <div>
              <p className="text-sm text-gray-500 mb-4 font-medium">FEATURED ON</p>
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 opacity-60 grayscale">
                {/* Product Hunt */}
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 240 240" fill="#da552f">
                    <path d="M240 120c0 66.274-53.726 120-120 120S0 186.274 0 120 53.726 0 120 0s120 53.726 120 120z"/>
                    <path d="M146.326 86.5H93.5v67h21.5v-24h31.326c11.593 0 21-9.407 21-21s-9.407-21-21-21z" fill="#fff"/>
                    <circle cx="115" cy="108" r="10.5" fill="#da552f"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-600">Product Hunt</span>
                </div>

                {/* X.com Logo - Corrected */}
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 1200 1227" fill="#000000">
                    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L22.11 1226.31H127.973L538.327 750.225L864.089 1226.31H1221.42L714.163 519.284ZM596.177 686.039L551.042 623.5L145.899 44.226H306.216L643.099 500.414L688.234 562.913L1094.61 1180.12H934.29L596.177 686.039Z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-600">X.com</span>
                </div>
                
                {/* TinyLaunch */}
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-600">TinyLaunch</span>
                </div>
                
                {/* Reddit */}
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff4500">
                    <circle cx="9" cy="12" r="1.5"/>
                    <circle cx="15" cy="12" r="1.5"/>
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-600">Reddit</span>
                </div>
                
                {/* Hacker News */}
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff6600">
                    <path d="M0 24V0h24v24H0zM6.951 5.896l4.112 7.708v5.064h1.583v-4.972l4.148-7.799h-1.749l-2.457 4.875c-.372.745-.688 1.434-.688 1.434s-.297-.708-.651-1.434L8.831 5.896h-1.88z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-600">Hacker News</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - First Part: ONLY PROBLEMS */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Problem Statement */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Your Money Slips Away,<br /> and You Don&apos;t Know Why.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              You work hard for your money. Isn&apos;t it time to know exactly where it goes?
            </p>
          </div>

          {/* 3 Problems ONLY - WITH ARROWS */}
          <div className="grid md:grid-cols-5 gap-4 items-center">
            {/* Problem 1 */}
            <div className="space-y-3">
              <div className="text-4xl mb-3">💸</div>
              <h3 className="text-base font-semibold text-gray-900">
                Spend without thinking
              </h3>
              <p className="text-gray-600 text-sm">
                Money disappears and you have no idea where it went
              </p>
            </div>
            
            {/* Red Arrow 1 */}
            <div className="hidden md:flex justify-center">
              <svg className="w-10 fill-red-500 opacity-100 -rotate-90" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path fillRule="evenodd" clipRule="evenodd" d="M72.9644 5.31431C98.8774 43.8211 83.3812 88.048 54.9567 120.735C54.4696 121.298 54.5274 122.151 55.0896 122.639C55.6518 123.126 56.5051 123.068 56.9922 122.506C86.2147 88.9044 101.84 43.3918 75.2003 3.80657C74.7866 3.18904 73.9486 3.02602 73.3287 3.44222C72.7113 3.85613 72.5484 4.69426 72.9644 5.31431Z"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M56.5084 121.007C56.9835 118.685 57.6119 115.777 57.6736 115.445C59.3456 106.446 59.5323 97.67 58.4433 88.5628C58.3558 87.8236 57.6824 87.2948 56.9433 87.3824C56.2042 87.4699 55.6756 88.1435 55.7631 88.8828C56.8219 97.7138 56.6432 106.225 55.0203 114.954C54.926 115.463 53.5093 121.999 53.3221 123.342C53.2427 123.893 53.3688 124.229 53.4061 124.305C53.5887 124.719 53.8782 124.911 54.1287 125.015C54.4123 125.13 54.9267 125.205 55.5376 124.926C56.1758 124.631 57.3434 123.699 57.6571 123.487C62.3995 120.309 67.4155 116.348 72.791 113.634C77.9171 111.045 83.3769 109.588 89.255 111.269C89.9704 111.475 90.7181 111.057 90.9235 110.342C91.1288 109.626 90.7117 108.878 89.9963 108.673C83.424 106.794 77.3049 108.33 71.5763 111.223C66.2328 113.922 61.2322 117.814 56.5084 121.007Z"></path>
                </g>
              </svg>
            </div>
            
            {/* Problem 2 */}
            <div className="space-y-3">
              <div className="text-4xl mb-3">🤷‍♂️</div>
              <h3 className="text-base font-semibold text-gray-900">
                Forget where money goes
              </h3>
              <p className="text-gray-600 text-sm">
                No clue about your spending patterns or habits
              </p>
            </div>
            
            {/* Red Arrow 2 */}
            <div className="hidden md:flex justify-center">
              <svg className="w-10 fill-red-500 opacity-100 -rotate-90" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path fillRule="evenodd" clipRule="evenodd" d="M72.9644 5.31431C98.8774 43.8211 83.3812 88.048 54.9567 120.735C54.4696 121.298 54.5274 122.151 55.0896 122.639C55.6518 123.126 56.5051 123.068 56.9922 122.506C86.2147 88.9044 101.84 43.3918 75.2003 3.80657C74.7866 3.18904 73.9486 3.02602 73.3287 3.44222C72.7113 3.85613 72.5484 4.69426 72.9644 5.31431Z"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M56.5084 121.007C56.9835 118.685 57.6119 115.777 57.6736 115.445C59.3456 106.446 59.5323 97.67 58.4433 88.5628C58.3558 87.8236 57.6824 87.2948 56.9433 87.3824C56.2042 87.4699 55.6756 88.1435 55.7631 88.8828C56.8219 97.7138 56.6432 106.225 55.0203 114.954C54.926 115.463 53.5093 121.999 53.3221 123.342C53.2427 123.893 53.3688 124.229 53.4061 124.305C53.5887 124.719 53.8782 124.911 54.1287 125.015C54.4123 125.13 54.9267 125.205 55.5376 124.926C56.1758 124.631 57.3434 123.699 57.6571 123.487C62.3995 120.309 67.4155 116.348 72.791 113.634C77.9171 111.045 83.3769 109.588 89.255 111.269C89.9704 111.475 90.7181 111.057 90.9235 110.342C91.1288 109.626 90.7117 108.878 89.9963 108.673C83.424 106.794 77.3049 108.33 71.5763 111.223C66.2328 113.922 61.2322 117.814 56.5084 121.007Z"></path>
                </g>
              </svg>
            </div>
            
            {/* Problem 3 */}
            <div className="space-y-3">
              <div className="text-4xl mb-3">🔄</div>
              <h3 className="text-base font-semibold text-gray-900">
                Repeat the same mistakes
              </h3>
              <p className="text-gray-600 text-sm">
                Never learning from past spending decisions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section - Second Part: ONLY SOLUTIONS */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Solution Statement */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              From chaos to clarity in seconds
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Take control of your money with simple steps
            </p>
          </div>

          {/* 3 Solutions ONLY - WITH ARROWS */}
          <div className="grid md:grid-cols-5 gap-4 items-center">
            {/* Solution 1 */}
            <div className="space-y-3">
              <div className="text-4xl mb-3">📤</div>
              <h3 className="text-base font-semibold text-gray-900">
                Import
              </h3>
              <p className="text-gray-600 text-sm">
                Upload bank data, get instant financial overview
              </p>
            </div>
            
            {/* Green Arrow 1 */}
            <div className="hidden md:flex justify-center">
              <svg className="w-10 opacity-100 -rotate-90" style={{fill: '#60ea8b'}} viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path fillRule="evenodd" clipRule="evenodd" d="M72.9644 5.31431C98.8774 43.8211 83.3812 88.048 54.9567 120.735C54.4696 121.298 54.5274 122.151 55.0896 122.639C55.6518 123.126 56.5051 123.068 56.9922 122.506C86.2147 88.9044 101.84 43.3918 75.2003 3.80657C74.7866 3.18904 73.9486 3.02602 73.3287 3.44222C72.7113 3.85613 72.5484 4.69426 72.9644 5.31431Z"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M56.5084 121.007C56.9835 118.685 57.6119 115.777 57.6736 115.445C59.3456 106.446 59.5323 97.67 58.4433 88.5628C58.3558 87.8236 57.6824 87.2948 56.9433 87.3824C56.2042 87.4699 55.6756 88.1435 55.7631 88.8828C56.8219 97.7138 56.6432 106.225 55.0203 114.954C54.926 115.463 53.5093 121.999 53.3221 123.342C53.2427 123.893 53.3688 124.229 53.4061 124.305C53.5887 124.719 53.8782 124.911 54.1287 125.015C54.4123 125.13 54.9267 125.205 55.5376 124.926C56.1758 124.631 57.3434 123.699 57.6571 123.487C62.3995 120.309 67.4155 116.348 72.791 113.634C77.9171 111.045 83.3769 109.588 89.255 111.269C89.9704 111.475 90.7181 111.057 90.9235 110.342C91.1288 109.626 90.7117 108.878 89.9963 108.673C83.424 106.794 77.3049 108.33 71.5763 111.223C66.2328 113.922 61.2322 117.814 56.5084 121.007Z"></path>
                </g>
              </svg>
            </div>
            
            {/* Solution 2 */}
            <div className="space-y-3">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-base font-semibold text-gray-900">
                Understand
              </h3>
              <p className="text-gray-600 text-sm">
                See exactly where every euro goes with clear charts
              </p>
            </div>
            
            {/* Green Arrow 2 */}
            <div className="hidden md:flex justify-center">
              <svg className="w-10 opacity-100 -rotate-90" style={{fill: '#60ea8b'}} viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g>
                  <path fillRule="evenodd" clipRule="evenodd" d="M72.9644 5.31431C98.8774 43.8211 83.3812 88.048 54.9567 120.735C54.4696 121.298 54.5274 122.151 55.0896 122.639C55.6518 123.126 56.5051 123.068 56.9922 122.506C86.2147 88.9044 101.84 43.3918 75.2003 3.80657C74.7866 3.18904 73.9486 3.02602 73.3287 3.44222C72.7113 3.85613 72.5484 4.69426 72.9644 5.31431Z"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M56.5084 121.007C56.9835 118.685 57.6119 115.777 57.6736 115.445C59.3456 106.446 59.5323 97.67 58.4433 88.5628C58.3558 87.8236 57.6824 87.2948 56.9433 87.3824C56.2042 87.4699 55.6756 88.1435 55.7631 88.8828C56.8219 97.7138 56.6432 106.225 55.0203 114.954C54.926 115.463 53.5093 121.999 53.3221 123.342C53.2427 123.893 53.3688 124.229 53.4061 124.305C53.5887 124.719 53.8782 124.911 54.1287 125.015C54.4123 125.13 54.9267 125.205 55.5376 124.926C56.1758 124.631 57.3434 123.699 57.6571 123.487C62.3995 120.309 67.4155 116.348 72.791 113.634C77.9171 111.045 83.3769 109.588 89.255 111.269C89.9704 111.475 90.7181 111.057 90.9235 110.342C91.1288 109.626 90.7117 108.878 89.9963 108.673C83.424 106.794 77.3049 108.33 71.5763 111.223C66.2328 113.922 61.2322 117.814 56.5084 121.007Z"></path>
                </g>
              </svg>
            </div>
            
            {/* Solution 3 */}
            <div className="space-y-3">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-base font-semibold text-gray-900">
                Achieve
              </h3>
              <p className="text-gray-600 text-sm">
                Hit savings goals with progress that motivates you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center leading-tight mb-10">
            <span className="text-green-400">Budgeting</span> is for&nbsp;<span className="text-pink-400">everyone</span>,<br className="hidden md:block"/> not just spreadsheet pros.
          </h2>
          <p className="max-w-3xl mx-auto text-center text-lg text-slate-300 mb-16">
            A clear budget means fewer surprises and better sleep.<br />
            Let EasyBudget crunch the numbers so you can focus on life, not formulas.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Spreadsheets & old methods */}
            <div className="relative p-8 rounded-3xl border border-pink-400/60 bg-slate-900/40">
              <h3 className="text-2xl font-bold text-pink-300 mb-4 flex items-center gap-2">
                Excel &amp; paper
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-pink-500/20">
                  <X className="w-4 h-4 text-pink-400" />
                </span>
              </h3>
              <ul className="space-y-3 text-sm md:text-base list-disc pl-4 marker:text-pink-400">
                <li>Easy to make errors and miss expenses</li>
                <li>Takes hours and constant updates</li>
                <li>Numbers, not insights</li>
                <li>Difficult to spot patterns</li>
                <li>You do all the heavy lifting</li>
              </ul>
            </div>

            {/* EasyBudget */}
            <div className="relative p-8 rounded-3xl border border-green-400/60 bg-slate-900/40">
              <h3 className="text-2xl font-bold text-green-300 mb-4 flex items-center gap-2">
                EasyBudget
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500/20">
                  <Check className="w-4 h-4 text-green-400" />
                </span>
              </h3>
              <ul className="space-y-3 text-sm md:text-base list-disc pl-4 marker:text-green-400">
                <li>Set it up once, then let it run</li>
                <li>Your spending is organised for you</li>
                <li>Friendly charts show trends at a glance</li>
                <li>Know if it&apos;s safe to spend today</li>
                <li>More clarity, less time on a screen</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <DashboardPreview user={user} />

      {/* Transaction Transformation Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Visual */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                {/* Before State - Messy Transactions */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-gray-500 mb-4">Before - Raw Bank Data</h4>
                  <div className="space-y-3">
                    {[
                      { desc: "AMZN MKTP US*2K4LK8901", amount: "-$23.47", raw: true },
                      { desc: "SQ *COFFEE SHOP NYC", amount: "-$8.99", raw: true },
                      { desc: "PAYPAL *NETFLIX", amount: "-$15.99", raw: true },
                      { desc: "WHOLEFDS #123 NYC", amount: "-$127.84", raw: true }
                    ].map((tx, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-500 font-mono truncate">{tx.desc}</div>
                        <div className="text-sm font-medium text-gray-900">{tx.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center mb-8">
                  <div className="flex items-center">
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                    <ArrowRight className="h-5 w-5 text-gray-400 mx-2" />
                    <div className="w-12 h-0.5 bg-gray-300"></div>
                  </div>
                </div>

                {/* After State - Clean Categorized */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-4">After - Automatically Categorized</h4>
                  <div className="space-y-3">
                    {[
                      { desc: "Amazon Purchase", amount: "-$23.47", category: "Shopping", icon: "🛒", color: "bg-blue-50 border-blue-200" },
                      { desc: "Coffee Shop", amount: "-$8.99", category: "Food & Dining", icon: "☕", color: "bg-orange-50 border-orange-200" },
                      { desc: "Netflix Subscription", amount: "-$15.99", category: "Entertainment", icon: "🎬", color: "bg-purple-50 border-purple-200" },
                      { desc: "Whole Foods", amount: "-$127.84", category: "Groceries", icon: "🛒", color: "bg-green-50 border-green-200" }
                    ].map((tx, i) => (
                      <div key={i} className={`flex justify-between items-center p-3 rounded-lg border ${tx.color}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{tx.icon}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{tx.desc}</div>
                            <div className="text-xs text-gray-500">{tx.category}</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{tx.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="space-y-4">
                <h3 className="text-4xl font-bold underline" style={{color: '#60ea8b'}}>
                  The Spreadsheet Killer
                </h3>
                <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                  100% accuracy from the first import.
                </h2>
              </div>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                easybudget.ing was trained to understand any bank statement format. No more manual sorting. We do the heavy lifting so you can focus on your goals.
              </p>

              <div className="flex items-center space-x-4 pt-4">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600 font-medium">Works with 10,000+ banks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600 font-medium">AI-powered categorization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-8 relative bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-200 mb-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Pricing</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3 leading-tight">
              Choose Your
              <span className="block" style={{color: '#60ea8b'}}>
                Perfect Plan
              </span>
            </h2>
            <p className="text-base text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Start with what you need today, upgrade as you grow. All plans include core features and security.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
                Monthly
              </span>
              <div className="relative">
                <button
                  onClick={handleBillingToggle}
                  className={`w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${
                    billingInterval === 'yearly' ? 'bg-green-500' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${
                      billingInterval === 'yearly' ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <span className={`text-sm font-medium ${billingInterval === 'yearly' ? 'text-slate-900' : 'text-slate-500'}`}>
                Yearly
              </span>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Left Column - Monthly/Yearly Plans */}
            <div className="relative p-8 rounded-3xl border-2 border-gray-200 bg-white flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">EasyBudget</h3>
                <p className="text-slate-600">Simple pricing. All EasyBudget features.</p>
              </div>

              {/* Pricing Display */}
              <div className="mb-6">
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold text-slate-900">
                    ${billingInterval === 'monthly' ? fullPlan.monthlyPrice : fullPlan.monthlyPerMonth}
                  </span>
                  <span className="text-lg text-slate-600 ml-2">/month</span>
                </div>
                <p className="text-sm text-slate-500">
                  {billingInterval === 'monthly' 
                    ? 'Per month billed monthly. Switch to yearly anytime.' 
                    : 'Per month billed yearly.'}
                </p>
              </div>

              {/* Billing Toggle */}
              <div className="mb-8">
                <div className="flex items-center gap-4">
                  <button
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      billingInterval === 'yearly' ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                    onClick={handleBillingToggle}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                        billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-600">Billed yearly</span>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                className="w-full bg-green-500 text-white font-semibold py-4 px-6 rounded-full hover:bg-green-600 transition-colors mb-8"
                onClick={() => handleCheckout(billingInterval === 'monthly' ? 'full_monthly' : 'full_yearly')}
              >
                {isCreatingCheckout === 'full_monthly' || isCreatingCheckout === 'full_yearly' 
                  ? "Processing..." 
                  : "Get Started"}
              </button>

              {/* Features */}
              <div className="flex-1">
                <ul className="space-y-3">
                  {fullPlan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column - Lifetime Plan */}
            <div className="relative p-8 rounded-3xl border-2 border-slate-200 bg-white flex flex-col">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Pay once</h3>
                <p className="text-slate-600">Your copy forever & one year of updates.</p>
              </div>

              {/* Pricing Display */}
              <div className="mb-6">
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold text-slate-900">${lifetimePlan.price}</span>
                </div>
                <p className="text-sm text-slate-500">One-time payment. Includes one year of updates.</p>
              </div>

              {/* Empty space to match toggle section */}
              <div className="mb-8">
                <div className="h-6"></div>
              </div>

              {/* CTA Button */}
              <button 
                className="w-full bg-slate-900 text-white font-semibold py-4 px-6 rounded-full hover:bg-slate-800 transition-colors mb-8"
                onClick={() => handleCheckout('lifetime')}
              >
                {isCreatingCheckout === 'lifetime' ? "Processing..." : "Get Started"}
              </button>

              {/* Features */}
              <div className="flex-1 mb-8">
                <ul className="space-y-3">
                  {lifetimePlan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Note */}
              <div className="p-4 bg-slate-50 rounded-lg mt-auto">
                <p className="text-xs text-slate-600">
                  This is the only payment you&apos;ll ever make. No recurring fees, no subscriptions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - After Pricing */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            {/* User Avatars - Simple circles with initials like CodeFast */}
            <div className="flex -space-x-2">
              {['M', 'A', 'S', 'L', 'E', 'R', 'C', 'D'].map((initial, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold"
                  style={{
                    background: `linear-gradient(135deg, hsl(${200 + i * 30}, 70%, 60%), hsl(${220 + i * 25}, 65%, 50%))`
                  }}
                >
                  {initial}
                </div>
              ))}
            </div>

            {/* User Count Text */}
            <div className="text-center">
              <p className="text-gray-600 text-base">
                <span className="font-semibold text-gray-900">48 people</span>
                <span className="italic"> saving their money</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 relative">
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need to know about our platform and security
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white/70 backdrop-blur-sm">
                <button 
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50/50 transition-colors cursor-pointer" 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-slate-900 pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 border-t border-gray-100">
                    <p className="text-slate-600 leading-relaxed pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-gray-200 py-16">
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-4 gap-8 mb-12">
            {/* Product */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Product</h4>
              <ul className="space-y-4 text-slate-600">
                <li><a href="#pricing" className="hover:text-slate-900 transition-colors cursor-pointer">Pricing</a></li>
                <li><a href="#faq" className="hover:text-slate-900 transition-colors cursor-pointer">FAQ</a></li>
                <li><a href="/dashboard" className="hover:text-slate-900 transition-colors cursor-pointer">Dashboard</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Company</h4>
              <ul className="space-y-4 text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors cursor-pointer">About</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors cursor-pointer">Blog</a></li>
                <li><a href="/changelog" className="hover:text-slate-900 transition-colors cursor-pointer">Changelog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-slate-600">
                <li><a href="/privacy" className="hover:text-slate-900 transition-colors cursor-pointer">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-slate-900 transition-colors cursor-pointer">Terms of Service</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors cursor-pointer">Compliance</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Get Started</h4>
              <div className="space-y-4">
                <p className="text-slate-600">
                  Ready to take control of your finances?
                </p>
                <form onSubmit={handleEmailSignup} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Enter your email" 
                      className="pl-10 bg-white/80 border-gray-300 text-slate-900 placeholder-slate-400 focus:border-[#6fb01a] focus:ring-[#6fb01a]/20 backdrop-blur-sm"
                      required 
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium"
                  >
                    Get Started
                  </Button>
                </form>
                <div className="pt-3 border-t border-gray-200">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/auth/signin')} 
                    className="w-full text-slate-600 hover:text-slate-900 hover:bg-gray-50/50"
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <Image src="/newicon1.png" alt="EasyBudget Logo" width={32} height={32} className="w-full h-full object-contain" />
                </div>
                <span className="text-xl font-bold">
                  <span className="text-slate-900">easybudget</span>
                  <span style={{color: '#60ea8b'}}>.ing</span>
                </span>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <a href="https://x.com/creatorLLM" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
                <span className="text-slate-600">
                  noreply@easybudget.ing
                </span>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-slate-500">
                © 2025 EasyBudget. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
