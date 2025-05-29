"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowRight, 
  Check, 
  TrendingUp, 
  Shield, 
  Clock,
  Target,
  Users,
  ChevronDown,
  Menu,
  X,
  Upload,
  Search,
  Bell,
  DollarSign,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Play,
  Star,
  Zap,
  BarChart3,
  CreditCard,
  PieChart,
  Mail
} from "lucide-react"

export default function LandingPage() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [email, setEmail] = useState("")
  const router = useRouter()

  const features = [
    {
      icon: Upload,
      title: "CSV Import & Smart Tracking", 
      desc: "Import bank statements from any institution. Track daily, weekly, monthly, and yearly spending with intelligent categorization."
    },
    {
      icon: CreditCard,
      title: "Multi-Account Dashboard",
      desc: "Manage unlimited accounts in one place. Personal cards, business accounts, multiple banks - all synchronized and categorized automatically."
    },
    {
      icon: TrendingUp,
      title: "Smart Predictions & Alerts",
      desc: "Get 30/60/90-day forecasts based on your spending patterns. Receive alerts before potential cash flow problems."
    },
    {
      icon: BarChart3,
      title: "Advanced Reports & Analytics",
      desc: "Beautiful charts and detailed reports show spending trends, income patterns, and financial health metrics across all your accounts."
    },
    {
      icon: Target,
      title: "Goals & Emergency Funds",
      desc: "Set and track financial goals like emergency funds, vacation savings, or debt payoff. Visual progress tracking keeps you motivated."
    },
    {
      icon: Bell,
      title: "Subscription & Recurring Tracking",
      desc: "Never miss a subscription payment. Track all recurring expenses and income, with automatic detection and management."
    }
  ]

  const benefits = [
    { 
      icon: TrendingUp, 
      title: "Save $500+ Every Month", 
      desc: "Our users discover an average of $500+ in hidden spending every month - subscriptions they forgot about, duplicate charges, and unnecessary fees."
    },
    { 
      icon: Clock, 
      title: "Save 10+ Hours Per Month", 
      desc: "Stop spending weekends organizing spreadsheets. Get complete financial clarity in 5 minutes, not 5 hours."
    },
    { 
      icon: Target, 
      title: "Reach Goals 3x Faster", 
      desc: "Whether it's buying a house, paying off debt, or building an emergency fund - our smart recommendations get you there faster."
    },
    { 
      icon: Shield, 
      title: "Never Miss Bills Again", 
      desc: "Get personalized alerts before you overdraft or miss payments. Protect your credit score and avoid expensive fees."
    },
    { 
      icon: Users, 
      title: "Get Your Family On Board", 
      desc: "Finally get everyone aligned on spending. Share budgets, set family goals, and teach kids healthy money habits."
    },
    { 
      icon: Zap, 
      title: "Stress-Free Money Management", 
      desc: "Sleep better knowing exactly where your money goes and that you're making progress toward your financial dreams."
    }
  ]

  const steps = [
    { 
      icon: Upload, 
      title: "Connect Your Accounts", 
      desc: "Securely link all your bank accounts, credit cards, and investments in under 2 minutes. Bank-level security protects your data.",
      detail: "Connect unlimited accounts from 10,000+ banks and financial institutions"
    },
    { 
      icon: Search, 
      title: "We Find Your Money Leaks", 
      desc: "Our AI immediately scans everything and shows you exactly where you're losing money - forgotten subscriptions, fees, and overspending.",
      detail: "Most users find $200-800 in savings in the first week"
    },
    { 
      icon: Bell, 
      title: "Start Saving Automatically", 
      desc: "Get personalized action plans, smart alerts, and automatic optimizations. Watch your savings grow without changing your lifestyle.",
      detail: "Set it and forget it - we handle the heavy lifting"
    }
  ]

  const plans = [
    {
      name: "Starter", 
      price: "$9", 
      desc: "Perfect for individuals starting their financial journey",
      highlight: "Best for singles",
      features: [
        "Up to 3 bank accounts",
        "Basic expense tracking", 
        "Monthly money insights",
        "Bill due date reminders",
        "Mobile app access"
      ],
      savings: "Avg savings: $200/month",
      cta: "Start Saving Money"
    },
    {
      name: "Pro", 
      price: "$19", 
      desc: "For people serious about optimizing every dollar",
      highlight: "Most Popular - Best Value",
      popular: true,
      features: [
        "Unlimited accounts",
        "AI spending optimization",
        "Goal tracking & forecasts", 
        "Bill negotiation assistance",
        "Investment portfolio tracking",
        "Priority customer support"
      ],
      savings: "Avg savings: $500/month",
      cta: "Get Pro - Save Most"
    },
    {
      name: "Family", 
      price: "$39", 
      desc: "For families building serious wealth together",
      highlight: "Best for families",
      features: [
        "Everything in Pro",
        "Up to 6 family members",
        "Kids financial education tools",
        "Advanced investment analysis",
        "Tax optimization insights", 
        "Personal finance coaching calls"
      ],
      savings: "Avg savings: $800/month",
      cta: "Get Family Plan"
    }
  ]

  const faqs = [
    { 
      q: "How much money will I actually save?", 
      a: "Our users save an average of $500+ per month in the first 90 days. Most find forgotten subscriptions worth $50-200/month alone, plus we help eliminate bank fees, negotiate better rates, and optimize spending patterns." 
    },
    { 
      q: "Is my financial data completely secure?", 
      a: "Yes. We use military-grade 256-bit encryption and never store your banking passwords. We're SOC 2 certified and use the same security standards as major banks. Your data is actually safer with us than on your phone." 
    },
    { 
      q: "How is this different from other budgeting apps?", 
      a: "Most apps just track your spending. EasyBudget actively finds money you're losing and shows you exactly how to save it. We focus on increasing your wealth, not just tracking where it goes." 
    },
    { 
      q: "What if I don't save money?", 
      a: "We're so confident you'll save money that we offer a 60-day money-back guarantee. If you don't find significant savings in your first 60 days, we'll refund every penny - no questions asked." 
    },
    { 
      q: "Can I cancel anytime?", 
      a: "Absolutely. Cancel with one click, anytime. No contracts, no cancellation fees, no hassles. Most people never want to cancel once they see how much money they're saving." 
    }
  ]

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/auth/register?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EasyBudget</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => router.push('/dashboard')} className="hover:-translate-y-0.5 transition-transform">
                    Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => signOut()} className="hover:-translate-y-0.5 transition-transform">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => router.push('/auth/signin')} className="text-[#0050B5] font-semibold hover:-translate-y-0.5 transition-transform">
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => router.push('/auth/register')} 
                    className="bg-[#32D29A] hover:bg-[#2BC08A] text-white font-semibold px-6 py-2 rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                    style={{ width: '180px', height: '56px' }}
                  >
                    Get Started Free
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
            <div className="md:hidden py-4 border-t border-gray-200 bg-white">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 px-2 py-1">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 px-2 py-1">How it Works</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 px-2 py-1">Pricing</a>
                <a href="#faq" className="text-gray-600 hover:text-gray-900 px-2 py-1">FAQ</a>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  {user ? (
                    <>
                      <Button variant="ghost" onClick={() => router.push('/dashboard')}>Dashboard</Button>
                      <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" onClick={() => router.push('/auth/signin')}>Sign In</Button>
                      <Button onClick={() => router.push('/auth/register')} className="bg-[#32D29A] hover:bg-[#2BC08A]">Get Started Free</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                <Star className="w-4 h-4 mr-2" />
                Join 10,000+ people who&apos;ve found $500+/month in hidden savings
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Stop Losing Money You 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Don&apos;t Even Know</span> You&apos;re Losing
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Most people waste <strong>$500+ every month</strong> on forgotten subscriptions, hidden fees, and money leaks. 
                EasyBudget finds and eliminates them automatically - so you can finally build real wealth.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => router.push('/auth/register')} 
                  className="bg-[#32D29A] hover:bg-[#2BC08A] text-white font-semibold px-8 py-4 rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 text-lg"
                  style={{ width: '180px', height: '56px' }}
                >
                  Find My Hidden Money
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-[#0050B5] text-[#0050B5] font-semibold px-8 py-4 rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 text-lg"
                  style={{ height: '56px' }}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch 2-Min Demo
                </Button>
              </div>
            </div>

            {/* Mock-up */}
            <div className="relative lg:ml-8">
              <div className="relative z-10 transform hover:translate-y-[-40px] transition-transform duration-700">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-16 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-bold">+$2,340</span>
                      </div>
                      <div className="h-16 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-red-600 font-bold">-$1,890</span>
                      </div>
                      <div className="h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold">$450</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <PieChart className="w-16 h-16 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background decorations */}
              <div className="absolute top-10 -right-10 w-24 h-24 bg-blue-500 rounded-full opacity-10 animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500 rounded-full opacity-10 animate-pulse delay-1000"></div>
            </div>
          </div>

          {/* Counter real */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-8 bg-white rounded-2xl px-8 py-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900">12,847</span>
                <span className="text-gray-600">users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">4.9/5</span>
                <span className="text-gray-600">rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">Bank-level security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for Complete Financial Control
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From simple expense tracking to complex multi-business financial management
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-gray-50 rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Finally Take Control of Your Financial Future
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop stressing about money and start building the life you actually want. Here&apos;s how EasyBudget transforms your finances.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              From Money Stress to Financial Freedom in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No complex budgeting. No spreadsheets. No financial expertise required. Just connect and watch the savings appear.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl font-bold text-white">{index + 1}</span>
                  </div>
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20"></div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <step.icon className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{step.desc}</p>
                  <p className="text-sm text-blue-600 font-medium">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Path to Financial Freedom
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every plan pays for itself in the first month. Pick the one that fits your financial goals.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className={`rounded-3xl p-8 relative transition-all duration-300 hover:-translate-y-2 ${plan.popular ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white transform scale-105 shadow-2xl border-4 border-[#32D29A]' : 'bg-white border-2 border-gray-200 shadow-lg hover:shadow-xl'}`}>
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#32D29A] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      🔥 MOST POPULAR
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <div className={`text-sm font-medium mb-2 ${plan.popular ? 'text-blue-100' : 'text-blue-600'}`}>
                    {plan.highlight}
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className={`text-lg ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>/month</span>
                  </div>
                  <p className={`text-lg mb-4 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>{plan.desc}</p>
                  <div className={`text-lg font-bold ${plan.popular ? 'text-[#32D29A]' : 'text-green-600'}`}>
                    {plan.savings}
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-[#32D29A]' : 'text-green-500'} mr-3 flex-shrink-0 mt-0.5`} />
                      <span className={`${plan.popular ? "text-white" : "text-gray-700"} leading-relaxed`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full py-4 text-lg font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${plan.popular ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-[#32D29A] hover:bg-[#2BC08A] text-white'}`}
                  onClick={() => router.push('/auth/register')}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Questions? We&apos;ve Got Answers
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about transforming your financial life
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <button 
                  className="w-full px-6 py-6 text-left flex justify-between items-center focus:outline-none hover:bg-gray-100 transition-colors" 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-bold text-gray-900 text-lg pr-4">{faq.q}</span>
                  <ChevronDown className={`w-6 h-6 text-gray-500 transition-transform flex-shrink-0 ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
            Stop Losing Money.<br />Start Building Wealth.
          </h2>
          <p className="text-xl lg:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Join 12,847+ people who&apos;ve taken control of their finances and found an average of <strong>$500+ in monthly savings</strong> they didn&apos;t know they had.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button 
              onClick={() => router.push('/auth/register')} 
              className="bg-[#32D29A] hover:bg-[#2BC08A] text-white font-bold px-12 py-6 text-xl shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
              style={{ width: '180px', height: '56px' }}
            >
              Find My Hidden Money - FREE
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-8 space-y-4 sm:space-y-0 text-sm">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-[#32D29A] mr-2" />
              <span>60-day money-back guarantee</span>
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-[#32D29A] mr-2" />
              <span>2-minute setup</span>
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-[#32D29A] mr-2" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Product */}
            <div>
              <h4 className="font-bold mb-6 text-lg">Product</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-bold mb-6 text-lg">Company</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investors</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-bold mb-6 text-lg">Legal</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>

            {/* Start Here */}
            <div>
              <h4 className="font-bold mb-6 text-lg">Start Here</h4>
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Get started with your financial transformation today. Enter your email to begin.
                </p>
                <form onSubmit={handleEmailSignup} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="your@email.com" 
                      className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-[#32D29A]"
                      required 
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-[#32D29A] hover:bg-[#2BC08A] text-white font-semibold hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Get Started Free
                  </Button>
                </form>
                <div className="pt-4 border-t border-gray-800">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/auth/signin')} 
                    className="w-full text-gray-400 hover:text-white"
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">EasyBudget</span>
                </div>
                <p className="text-gray-400 text-sm">
                  © 2024 EasyBudget. All rights reserved.
                </p>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
                <p className="text-gray-500 text-sm">
                  hello@easybudget.ing
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
