"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DashboardPreview } from "@/components/ui/dashboard-preview"
import { 
  Check, 
  Shield, 
  Target,
  ChevronDown,
  Menu,
  X,
  Upload,
  Twitter,
  Linkedin,
  BarChart3,
  Mail,
  Database,
  Brain,
  Lock,
  Activity,
  User,
  TrendingUp,
  Home,
  ArrowRight
} from "lucide-react"

export default function LandingPage() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [email, setEmail] = useState("")
  const router = useRouter()

  const benefits = [
    {
      icon: Database,
      title: "Connect All Your Financial Accounts", 
      desc: "Link 10,000+ banks and import CSV files instantly. Get a complete view of your finances in one dashboard instead of checking multiple apps and spreadsheets."
    },
    {
      icon: Brain,
      title: "Automatic Categorization & Insights",
      desc: "Stop manually tagging transactions. Our AI categorizes everything with 99.2% accuracy and shows you exactly where your money goes each month."
    },
    {
      icon: Activity,
      title: "Predict Future Cash Flow",
      desc: "See 30-90 day forecasts and get alerts before you run into cash flow problems. Never be surprised by unexpected expenses again."
    },
    {
      icon: BarChart3,
      title: "Generate Professional Reports",
      desc: "Create comprehensive financial reports in seconds. Export to Excel, PDF, or share with your accountant and business partners."
    },
    {
      icon: Target,
      title: "Track Goals & Stay Motivated",
      desc: "Set financial objectives and see your progress. Whether it's building an emergency fund or saving for a house - stay on track."
    },
    {
      icon: Lock,
      title: "Bank-Level Security You Can Trust",
      desc: "Your data is protected with the same security standards used by major banks. SOC 2 certified with 256-bit encryption."
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
        "Shared family dashboard access",
        "Multiple savings goals (vacation, education, etc.)",
        "Household expense categorization",
        "Family budget planning & tracking"
      ]
    }
  ]

  const steps = [
    { 
      icon: Upload, 
      title: "Connect Your Accounts", 
      desc: "Link your banks, credit cards, and investment accounts in 2 minutes. We use read-only connections so your credentials stay secure.",
      detail: "Works with 10,000+ financial institutions"
    },
    { 
      icon: Brain, 
      title: "We Organize Everything", 
      desc: "Our AI automatically categorizes transactions and identifies patterns in your spending. No manual work required.",
      detail: "99.2% accuracy with machine learning"
    },
    { 
      icon: Activity, 
      title: "Get Insights & Take Action", 
      desc: "Receive personalized recommendations and alerts. Generate reports, set budgets, and track your financial goals.",
      detail: "Real-time monitoring and smart alerts"
    }
  ]

  const plans = [
    {
      name: "Professional", 
      price: "$29", 
      desc: "Perfect for individuals and small businesses",
      highlight: "Individual & Small Business",
      features: [
        "Up to 10 connected accounts",
        "Advanced transaction categorization", 
        "Monthly financial reports",
        "Goal tracking and forecasting",
        "Email support"
      ],
      cta: "Get Professional"
    },
    {
      name: "Business", 
      price: "$89", 
      desc: "Best for growing teams and multiple users",
      highlight: "Most Popular",
      popular: true,
      features: [
        "Unlimited account connections",
        "Multi-user access (up to 5 users)",
        "Advanced analytics and reporting", 
        "API access for integrations",
        "Priority support",
        "Custom categorization rules"
      ],
      cta: "Get Business"
    },
    {
      name: "Enterprise", 
      price: "Custom", 
      desc: "For large organizations with custom needs",
      highlight: "Large Organizations",
      features: [
        "Everything in Business",
        "Unlimited users",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee", 
        "On-premise deployment options",
        "Advanced security features"
      ],
      cta: "Contact Sales"
    }
  ]

  const faqs = [
    {
      q: "How secure is my financial data?", 
      a: "We use bank-level security with 256-bit SSL encryption and SOC 2 Type II compliance. Your banking credentials are never stored on our servers, and all data is encrypted both in transit and at rest." 
    },
    { 
      q: "How quickly can I get started?", 
      a: "You can be up and running in under 5 minutes. Simply create an account, connect your bank accounts or upload a CSV file, and start tracking your finances immediately." 
    },
    { 
      q: "How accurate is the automated categorization?", 
      a: "Our machine learning algorithms achieve 99.2% accuracy in transaction categorization. The system continuously improves as it learns from your specific spending patterns." 
    },
    { 
      q: "Can I integrate with my existing business tools?", 
      a: "Yes, we offer RESTful APIs for seamless integration with accounting software, CRM systems, and business intelligence tools. Enterprise plans include custom integration support." 
    },
    { 
      q: "What happens to my data if I decide to leave?", 
      a: "You can export all your data in standard formats (CSV, Excel, PDF) at any time. We provide a 30-day grace period for data retrieval after cancellation, and your data is permanently deleted thereafter." 
    },
    { 
      q: "Do you offer customer support?", 
      a: "Yes! Professional plans include email support with 24-hour response time. Business plans get priority support, and Enterprise customers have access to a dedicated account manager." 
    },
    { 
      q: "Can I cancel my subscription anytime?", 
      a: "Absolutely. You can cancel your subscription at any time with no cancellation fees. Your service continues until the end of your current billing period." 
    }
  ]

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/auth/register?email=${encodeURIComponent(email)}`)
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
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/dashboard')} 
                  style={{backgroundColor: '#60ea8b'}}
                  className="hover:opacity-90 text-gray-900 font-medium px-4 py-2 rounded-lg transition-all"
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
                  className="text-gray-900 font-medium px-6 py-2 rounded-lg border-2 shadow-md hover:opacity-90 transition-all"
                  style={{borderColor: '#60ea8b'}}
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
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center text-center mb-12">
            <a className="text-[#777] font-medium text-[14px] px-[12px] py-[4px] bg-[#FFF] rounded-full shadow mb-6">
              All Your Finances in One Dashboard
            </a>
            
            <h1 className="text-[36px] md:text-[48px] font-extrabold text-[#333] whitespace-pre-line mb-6 leading-[42px] md:leading-[52px]">
              <span className="hidden md:block">Making money management{'\n'}so simple,{'\n'}it feels magic.</span>
              <span className="block md:hidden">Making money management so simple, it feels magic.</span>
            </h1>
            
            <p className="text-[16px] text-[#868686] md:text-[21px] leading-[22px] md:leading-[28px] max-w-[600px] mb-8">
              <span className="hidden md:block">Stop managing money in Spreadsheets, easybudget.ing automatically categorizes your transactions, giving you a complete financial overview in seconds.</span>
              <span className="block md:hidden">Stop managing money in Spreadsheets, easybudget.ing automatically categorizes your transactions, giving you a complete financial overview in seconds.</span>
            </p>
            
            <div className="flex gap-2">
              <button 
                onClick={() => user ? router.push('/dashboard') : router.push('/auth/register')} 
                className="text-white text-[17px] font-medium px-8 py-3 rounded-full shadow-md hover:opacity-65 transition-opacity inline-flex items-center gap-2"
                style={{background: 'linear-gradient(to bottom, #60ea8b 0%, #4ade80 100%)'}}
              >
                {user ? 'Dashboard' : 'Start Now'}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
              <button 
                onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                className="bg-white text-[#333] text-[17px] font-medium px-8 py-3 rounded-full shadow-md hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                Watch Demo
              </button>
            </div>
          </div>

          <div className="text-center text-gray-500 text-sm">
            2,847+ finance professionals already using EasyBudget
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

      {/* How It Works */}
      <section id="how-it-works" className="py-12 relative">
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get up and running in minutes with our simple 3-step process
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-lg font-bold text-white">{index + 1}</span>
                  </div>
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-slate-200"></div>
                  )}
                </div>
                <div className="space-y-3">
                  <step.icon className="w-6 h-6 text-slate-600 mx-auto" />
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                  <p className="text-sm text-slate-500 font-medium">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 relative bg-gradient-to-br from-white via-gray-50 to-white">
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
              <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Pricing</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
              Choose Your
              <span className="block" style={{color: '#60ea8b'}}>
                Perfect Plan
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Start with what you need today, upgrade as you grow. All plans include core features and security.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className={`group rounded-2xl p-6 border transition-all duration-300 bg-white/80 backdrop-blur-sm hover:scale-105 hover:-translate-y-1 ${plan.popular ? 'border-2 shadow-2xl shadow-green-200/50 scale-105 ring-2 ring-green-400' : 'border-gray-200/50 hover:border-gray-300/60 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/60'}`} style={plan.popular ? {borderColor: '#60ea8b'} : {}}>
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg" style={{background: 'linear-gradient(to bottom, #60ea8b 0%, #4ade80 100%)'}}>
                      ✨ Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="text-sm text-slate-600 font-bold mb-2 uppercase tracking-wider">
                    {plan.highlight}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-gray-900 transition-colors duration-300">{plan.name}</h3>
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-slate-600">/month</span>}
                  </div>
                  <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-green-600" />
                      </div>
                      <span className="text-slate-700 text-sm leading-relaxed group-hover:text-slate-800 transition-colors duration-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full py-3 px-4 rounded-full mb-6 font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${plan.popular ? 'text-white hover:opacity-90' : 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'}`}
                  style={plan.popular ? {background: 'linear-gradient(to bottom, #60ea8b 0%, #4ade80 100%)'} : {}}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => plan.price === "Custom" ? window.open('mailto:sales@easybudget.ing') : router.push('/auth/register')}
                >
                  {plan.cta}
                </Button>
                
                {/* Subtle accent line */}
                <div className={`w-16 h-1 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${plan.popular ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-purple-500 to-blue-500'}`}></div>
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
                onClick={() => window.open('mailto:sales@easybudget.ing')}
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <span className="font-semibold text-slate-900">No Setup Fees</span>
                <span className="text-sm text-slate-600">Start immediately</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <span className="font-semibold text-slate-900">Bank-Level Security</span>
                <span className="text-sm text-slate-600">SOC 2 certified</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <span className="font-semibold text-slate-900">Cancel Anytime</span>
                <span className="text-sm text-slate-600">No long-term commitment</span>
              </div>
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
                <li><a href="#" className="hover:text-slate-900 transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">API Documentation</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Company</h4>
              <ul className="space-y-4 text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
              <ul className="space-y-4 text-slate-600">
                <li><a href="/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-slate-900 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Security</a></li>
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
                  hello@easybudget.ing
                </span>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-slate-500">
                © 2024 EasyBudget. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
