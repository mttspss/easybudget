"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardPreview } from "@/components/ui/dashboard-preview"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Mail,
  ChevronDown, 
  Check, 
  Brain,
  Activity,
  X, 
  Menu,
  ArrowRight,
  TrendingUp,
  Home,
  User,
  Target,
  BarChart3,
  Upload,
  Twitter,
  Linkedin,
  CreditCard,
  TicketPercent
} from "lucide-react"

export default function LandingPage() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [email, setEmail] = useState("")
  const router = useRouter()
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [isCreatingCheckout, setIsCreatingCheckout] = useState<string | null>(null)

  const benefits = [
    {
      icon: Upload,
      title: "Simple CSV Import & Organization", 
      desc: "Upload your bank statements in any CSV format. Our smart system automatically detects columns and organizes your transactions in a clean, unified dashboard."
    },
    {
      icon: Brain,
      title: "Smart Transaction Categorization",
      desc: "Automatically categorize your expenses into meaningful categories like Food, Transport, Entertainment. Customize categories to match your spending habits."
    },
    {
      icon: BarChart3,
      title: "Beautiful Analytics Dashboard",
      desc: "Visualize your spending patterns with interactive charts and graphs. Track your balance trends, monthly comparisons, and expense breakdowns at a glance."
    },
    {
      icon: Target,
      title: "Financial Goals Tracking",
      desc: "Set savings goals and track your progress with visual indicators. Whether it's an emergency fund or vacation savings, stay motivated with clear milestones."
    },
    {
      icon: Activity,
      title: "Real-Time Financial Insights",
      desc: "Monitor your income vs expenses, monthly trends, and spending patterns. Get instant insights into your financial health without complex spreadsheets."
    },
    {
      icon: CreditCard,
      title: "Multi Account Management",
      desc: "Manage multiple bank accounts, credit cards, and business accounts in one unified dashboard. Track all your finances across different institutions seamlessly."
    }
  ]

  const journeyTypes = [
    {
      icon: User,
      title: "For Individuals",
      desc: "Perfect for students, young professionals, and anyone starting their financial journey.",
      color: "bg-blue-50 border-blue-200",
      iconColor: "bg-blue-100 text-blue-600",
      features: [
        "Single dashboard for all personal accounts",
        "Easy CSV import from any bank",
        "Personal goals & emergency fund tracking",
        "Subscription management"
      ]
    },
    {
      icon: TrendingUp,
      title: "For Entrepreneurs",
      desc: "Manage multiple businesses and personal finances without the complexity.",
      color: "bg-white border-2 border-slate-900 shadow-lg",
      iconColor: "bg-slate-100 text-slate-700",
      features: [
        "Multiple account dashboards (4+ credit cards, 2+ businesses)",
        "Separate business & personal tracking",
        "Advanced reporting & analytics",
        "Cash flow predictions for each business"
      ],
      highlighted: true
    },
    {
      icon: Home,
      title: "For Families",
      desc: "Coordinate household finances and teach kids about money management.",
      color: "bg-purple-50 border-purple-200",
      iconColor: "bg-purple-100 text-purple-600",
      features: [
        "Multiple account management",
        "Advanced analytics & insights", 
        "Goal tracking with milestones",
        "Built for families",
        "Export financial reports",
        "Premium customer support"
      ]
    }
  ]

  const plans = [
    {
      name: "Starter", 
      price: billingInterval === 'monthly' ? "$14" : "$150", 
      yearlyPrice: "$150",
      monthlyPrice: "$14",
      desc: "Perfect for individuals getting started with budgeting",
      highlight: "Personal Finance",
      features: [
        "Up to 100 transactions per month",
        "1 CSV import per month",
        "Smart transaction categorization",
        "Track up to 5 financial goals",
        "Single personal account"
      ],
      cta: isCreatingCheckout === 'starter' ? "Processing..." : "Get Starter",
      planType: 'starter' as const
    },
    {
      name: "Pro", 
      price: billingInterval === 'monthly' ? "$29" : "$290", 
      yearlyPrice: "$290",
      monthlyPrice: "$29",
      desc: "Ideal for professionals and small business owners",
      highlight: "Professional",
      popular: true,
      features: [
        "Up to 500 transactions",
        "Up to 3 CSV imports per month",
        "Advanced analytics & reporting",
        "Unlimited financial goals",
        "Connect 2 business accounts",
        "Priority email support"
      ],
      cta: isCreatingCheckout === 'pro' ? "Processing..." : "Get Pro",
      planType: 'pro' as const
    },
    {
      name: "Growth", 
      price: billingInterval === 'monthly' ? "$49" : "$390", 
      yearlyPrice: "$390",
      monthlyPrice: "$49",
      desc: "For growing businesses and power users",
      highlight: "Business & Teams",
      features: [
        "Unlimited transactions",
        "Unlimited CSV imports",
        "Full analytics suite",
        "Unlimited financial goals",
        "Connect up to 8 business accounts",
        "Priority support & mobile app access"
      ],
      cta: isCreatingCheckout === 'growth' ? "Processing..." : "Get Growth",
      planType: 'growth' as const
    }
  ]

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
      a: "The application will prevent you from performing actions that exceed your plan's limits. For example, if you reach your monthly transaction limit on the Starter plan, you won't be able to add new transactions until the next month or until you upgrade your plan. You will see clear messages in the app indicating your current usage."
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
    starter_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTH,
    starter_yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEAR,
    pro_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTH,
    pro_yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEAR,
    growth_monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_MONTH,
    growth_yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_YEAR,
  }

  const handleCheckout = async (planType: 'starter' | 'pro' | 'growth') => {
    if (!user) {
      router.push('/auth/register')
      return
    }

    const priceKey = `${planType}_${billingInterval}` as keyof typeof PRICE_IDS
    const priceId = PRICE_IDS[priceKey]

    if (!priceId) {
      console.error('Price ID not found for:', priceKey)
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
      {/* Simple Navbar */}
      <nav className="px-6 py-4">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <Image src="/newicon1.png" alt="EasyBudget Logo" width={32} height={32} className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-semibold">
              <span className="text-black font-bold">easybudget</span>
              <span style={{color: '#60ea8b'}} className="font-bold">.ing</span>
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-pointer ml-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                    <TicketPercent className="h-3 w-3" />
                    <span>40% OFF</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Use code: <span className="font-bold">50USERS</span></p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
            <a href="/changelog" className="text-gray-600 hover:text-gray-900 transition-colors">Changelog</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/dashboard')} 
                  className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg transition-all"
                >
                  Dashboard
                </Button>
                <Button 
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-gray-900"
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
                  className="text-gray-900 font-medium px-6 py-2 rounded-lg border-2 shadow-md hover:opacity-90 transition-all border-green-500"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => router.push('/auth/register')} 
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-2 rounded-lg"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pt-4 border-t border-gray-200 mt-3">
            <div className="flex flex-col space-y-4">
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 px-2 py-1">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 px-2 py-1">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 px-2 py-1">FAQ</a>
              <a href="/changelog" className="text-gray-600 hover:text-gray-900 px-2 py-1">Changelog</a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                {user ? (
                  <>
                    <Button variant="ghost" onClick={() => router.push('/dashboard')}>Dashboard</Button>
                    <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      onClick={() => router.push('/auth/signin')}
                      className="border-2 shadow-md hover:opacity-90 transition-all"
                      style={{borderColor: '#60ea8b'}}
                    >
                      Sign In
                    </Button>
                    <Button onClick={() => router.push('/auth/register')} className="bg-slate-900 hover:bg-slate-800">Sign Up</Button>
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
            <a className="text-gray-600 font-medium text-sm px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 mb-8">
              All Your Finances in One Dashboard
            </a>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-[1.1] max-w-4xl">
              Track your entire money life,<br />
              in one view<span className="inline-block w-3 h-3 bg-green-500 rounded-full ml-2"></span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mb-12">
              Your money deserves better than Excel. Easybudget turns every account, transaction, goal, and income stream into one live dashboard—giving you a complete financial overview in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={() => user ? router.push('/dashboard') : router.push('/auth/register')} 
                className="text-white text-lg font-semibold px-12 py-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center gap-3 transform hover:scale-105 bg-green-500 hover:bg-green-600"
              >
                {user ? 'Go to Dashboard' : 'Get instant access'}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
              <button 
                onClick={() => router.push('/auth/register')}
                className="bg-white text-gray-700 text-lg font-medium px-12 py-5 rounded-full shadow-md transition-all duration-300 inline-flex items-center justify-center gap-3 border border-gray-300 hover:border-gray-400"
              >
                Start for free
              </button>
            </div>

            {/* Featured On Section - moved below buttons */}
            <div>
              <p className="text-sm text-gray-500 mb-4 font-medium">FEATURED ON</p>
              <div className="flex items-center justify-center gap-8 opacity-60 grayscale">
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

      {/* Dashboard Preview Section */}
      <DashboardPreview />

      {/* Transaction Transformation Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Visual */}
            <div className="relative">
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
            <div className="space-y-6">
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

      {/* Benefits/Features */}
      <section id="benefits" className="py-12 relative bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500"></div>
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Features</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
              Everything You Need to Take
              <span className="block" style={{color: '#60ea8b'}}>
                Control of Your Finances
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Stop juggling multiple apps and spreadsheets. Get complete financial visibility and insights in one place.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="group p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300/60 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <benefit.icon className="w-6 h-6 text-slate-700 group-hover:text-slate-900 transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-gray-900 transition-colors duration-300">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">{benefit.desc}</p>
                
                {/* Subtle accent line */}
                <div className="mt-4 w-12 h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Every Financial Journey */}
      <section id="journey" className="py-12 relative">
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Built for Every Financial Journey
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From students tracking their first budget to entrepreneurs managing multiple businesses
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {journeyTypes.map((type, index) => (
              <div key={index} className={`rounded-xl p-6 ${type.color} transition-all hover:shadow-lg shadow-md bg-white/70 backdrop-blur-sm border border-gray-200`}>
                <div className="text-center mb-6">
                  <div className={`w-12 h-12 ${type.iconColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <type.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{type.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{type.desc}</p>
                </div>
                <ul className="space-y-3">
                  {type.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-4 h-4 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
                  onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
                  className={`w-12 h-6 rounded-full transition-colors duration-300 ${
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
              {billingInterval === 'yearly' && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Up to 4 months free
                </span>
              )}
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className={`group rounded-xl p-4 border transition-all duration-300 bg-white/80 backdrop-blur-sm hover:scale-105 hover:-translate-y-1 ${plan.popular ? 'border-2 shadow-xl shadow-green-200/50 scale-105 ring-2 ring-green-400' : 'border-2 border-black shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/60'}`} style={plan.popular ? {borderColor: '#60ea8b'} : {}}>
                {billingInterval === 'yearly' && (
                  <div className="text-center mb-2">
                    <span className="text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-lg bg-gradient-to-r from-red-500 to-red-600">
                      SAVE {plan.planType === 'starter' ? '$18' : plan.planType === 'pro' ? '$58' : '$198'}
                    </span>
                  </div>
                )}
                {plan.popular && (
                  <div className="text-center mb-3">
                    <span className="text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg bg-green-500">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-black mb-2 group-hover:text-gray-900 transition-colors duration-300">{plan.name}</h3>
                  
                  {billingInterval === 'yearly' ? (
                    <div className="mb-3">
                      {/* Yearly Pricing Display */}
                      <div className="relative">
                        {/* Original monthly price crossed out */}
                        <div className="text-xs text-slate-500 mb-0.5">
                          <span className="line-through">{plan.planType === 'starter' ? '$168/year' : plan.planType === 'pro' ? '$348/year' : '$588/year'}</span>
                          <span className="ml-1.5 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                            Save {plan.planType === 'starter' ? '$18' : plan.planType === 'pro' ? '$58' : '$198'}
                          </span>
                        </div>
                        {/* New yearly price */}
                        <div className="flex items-baseline justify-center">
                          <span className="text-3xl font-bold text-black">{plan.yearlyPrice}</span>
                          <span className="text-black ml-1 text-sm">/year</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          billed yearly • {plan.planType === 'starter' ? '1 month' : plan.planType === 'pro' ? '2 months' : '4 months'} free
                        </div>
                      </div>
                    </div>
                  ) : (
                  <div className="mb-3">
                      {/* Monthly Pricing Display */}
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold text-black">{plan.monthlyPrice}</span>
                        <span className="text-black ml-1 text-sm">/month</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">billed monthly</div>
                </div>
                  )}
                  <p className="text-sm text-black leading-relaxed group-hover:text-black transition-colors duration-300">{plan.desc}</p>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="w-3.5 h-3.5 bg-green-100 rounded-full flex items-center justify-center mr-2.5 flex-shrink-0 mt-0.5">
                        <Check className="w-2 h-2 text-green-600" />
                      </div>
                      <span className="text-black text-sm leading-relaxed group-hover:text-black transition-colors duration-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  className={`w-full py-5 px-8 rounded-full mb-4 font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-lg border-none cursor-pointer ${plan.popular ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-2 border-black text-black hover:bg-slate-50 bg-white'}`}
                  onClick={() => handleCheckout(plan.planType)}
                >
                  {plan.cta}
                </button>
                
                {/* Subtle accent line */}
                <div className={`w-12 h-0.5 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${plan.popular ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}></div>
              </div>
            ))}
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
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50/50 transition-colors" 
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

      {/* Final CTA */}
      <section className="py-20 relative border-t border-gray-100">
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Start Your Financial 
                <span className="block" style={{color: '#60ea8b'}}>
                  Transformation Today
                </span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Join 2,847+ professionals who have simplified their financial management. 
                Get complete visibility and control over your money in minutes.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => user ? router.push('/dashboard') : router.push('/auth/register')}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '18px',
                  background: 'linear-gradient(to bottom, #60ea8b 0%, #4ade80 100%)',
                  color: 'white',
                  padding: '0.8em 1.2em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  border: 'none',
                  borderRadius: '25px',
                  boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0px 8px 15px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0px 5px 10px rgba(0, 0, 0, 0.2)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                  e.currentTarget.style.boxShadow = '0px 2px 5px rgba(0, 0, 0, 0.2)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0px 8px 15px rgba(0, 0, 0, 0.3)';
                }}
              >
                {user ? 'Dashboard' : 'Start Now'}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
              <button 
                onClick={() => window.open('mailto:noreply@easybudget.ing')}
                style={{
                  fontFamily: 'inherit',
                  fontSize: '18px',
                  background: 'white',
                  color: '#374151',
                  padding: '0.8em 1.2em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #d1d5db',
                  borderRadius: '25px',
                  boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0px 8px 15px rgba(0, 0, 0, 0.2)';
                  e.currentTarget.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0px 5px 10px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.background = 'white';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                  e.currentTarget.style.boxShadow = '0px 2px 5px rgba(0, 0, 0, 0.1)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0px 8px 15px rgba(0, 0, 0, 0.2)';
                }}
              >
                Talk to Sales
              </button>
            </div>
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
                <li><a href="#benefits" className="hover:text-slate-900 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a></li>
                <li><a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a></li>
                <li><a href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Company</h4>
              <ul className="space-y-4 text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Blog</a></li>
                <li><a href="/changelog" className="hover:text-slate-900 transition-colors">Changelog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-slate-600">
                <li><a href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Compliance</a></li>
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
                  <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
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
