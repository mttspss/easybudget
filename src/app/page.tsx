"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Settings,
  HelpCircle,
  LogOut,
  TrendingUp,
  Home
} from "lucide-react"

export default function LandingPage() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
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

  const handleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen)
  }

  const handleSignOut = () => {
    signOut()
    setUserDropdownOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7aff01]/8 via-white to-[#7aff01]/4 relative overflow-hidden">
      {/* Subtle patterns for entire page */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(122,255,1,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.8),transparent_50%)]"></div>
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/70 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-lg px-6 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <Image src="/newicon1.png" alt="EasyBudget Logo" width={40} height={40} className="w-full h-full object-contain" />
              </div>
                <span className="text-2xl font-semibold">
                  <span className="text-black">easybudget</span>
                  <span style={{color: '#60ea8b'}}>.ing</span>
                </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
                <a href="#benefits" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Features</a>
                <a href="#journey" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Solutions</a>
                <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">How it Works</a>
                <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Pricing</a>
                <a href="#faq" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">FAQ</a>
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
                    <div className="relative">
                      <button
                        onClick={handleUserDropdown}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-semibold text-slate-900">
                            {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}
                  </div>
                          <div className="text-xs text-slate-500">Free Plan</div>
                </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm bg-gradient-to-br from-blue-500 to-blue-600">
                          {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      </button>
                      {userDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="font-medium text-slate-900">{user?.user_metadata?.full_name || user?.email}</div>
                            <div className="text-sm text-slate-500">Free Plan</div>
                    </div>
                          <div className="py-1">
                            <button 
                              className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-gray-50"
                              onClick={() => router.push('/dashboard/profile')}
                            >
                              <User className="w-4 h-4 mr-3" />
                              Profile Settings
                            </button>
                            <button 
                              className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-gray-50"
                              onClick={() => router.push('/dashboard/preferences')}
                            >
                              <Settings className="w-4 h-4 mr-3" />
                              Preferences
                            </button>
                            <button className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-gray-50">
                              <HelpCircle className="w-4 h-4 mr-3" />
                              Help & Support
                            </button>
                            <div className="border-t border-gray-100 mt-1 pt-1">
                              <button 
                                onClick={handleSignOut}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                              >
                                <LogOut className="w-4 h-4 mr-3" />
                                Sign out
                              </button>
                  </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
              ) : (
                <>
                    <Button 
                      variant="ghost" 
                      onClick={() => router.push('/auth/signin')} 
                      style={{backgroundColor: '#60ea8b'}}
                      className="hover:opacity-90 text-gray-900 font-medium px-4 py-2 rounded-lg transition-all"
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
                  <a href="#benefits" className="text-slate-600 hover:text-slate-900 px-2 py-1">Features</a>
                  <a href="#journey" className="text-slate-600 hover:text-slate-900 px-2 py-1">Solutions</a>
                  <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 px-2 py-1">How it Works</a>
                  <a href="#pricing" className="text-slate-600 hover:text-slate-900 px-2 py-1">Pricing</a>
                  <a href="#faq" className="text-slate-600 hover:text-slate-900 px-2 py-1">FAQ</a>
                  <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                    {user ? (
                      <>
                        <Button variant="ghost" onClick={() => router.push('/dashboard')}>Dashboard</Button>
                        <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
                    </>
                  ) : (
                    <>
                        <Button variant="ghost" onClick={() => router.push('/auth/signin')}>Sign In</Button>
                        <Button onClick={() => router.push('/auth/register')} className="bg-slate-900 hover:bg-slate-800">Sign Up</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-16 relative">        
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-slate-700 text-sm font-medium shadow-sm">
                  <Database className="w-4 h-4 mr-2 text-[#6fb01a]" />
                  Multiple Accounts, One Dashboard
              </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Stop Managing Money in
                  <span className="block" style={{color: '#60ea8b'}}> 
                    Spreadsheets
                  </span>
            </h1>
            
                <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                  Get a complete view of your finances in one place. Track expenses, predict cash flow, and generate reports automatically.
            </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => router.push('/auth/register')} 
                  className="bg-black hover:bg-gray-900 text-white font-medium px-6 py-3 text-base rounded-lg transition-all"
                >
                  Start Now
                </Button>
                <Button 
                  variant="outline"
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-6 py-3 text-base rounded-lg transition-all"
                  onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                >
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-slate-600 font-medium">SOC 2 Certified</span>
              </div>
              <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-slate-600 font-medium">Bank-Level Security</span>
              </div>
              <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-slate-600 font-medium">10K+ Banks</span>
              </div>
            </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold">JD</div>
                  <div className="w-10 h-10 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold">SM</div>
                  <div className="w-10 h-10 bg-purple-500 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold">AL</div>
                  <div className="w-10 h-10 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold">MR</div>
                  <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold">TB</div>
          </div>
                <div className="flex flex-col">
                  <div className="flex items-center space-x-1 mb-1">
                    {[1,2,3,4,5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
        </div>
                  <span className="text-sm font-medium text-slate-700">2,847+ finance professionals trust easybudget</span>
          </div>
                </div>
                </div>

            {/* Professional Dashboard Mock-up */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Browser Chrome */}
                <div className="flex items-center space-x-2 px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-gray-200">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 text-xs text-gray-500 font-mono">easybudget.ing/dashboard</div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900">Financial Overview</h3>
                    <div className="text-xs text-slate-500 bg-gray-100 px-2 py-1 rounded-md">Live</div>
                </div>
                  
                  {/* KPI Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-[#6fb01a]/10 to-[#85c926]/5 rounded-xl p-4 border border-[#6fb01a]/20">
                      <div className="text-xs text-slate-600 mb-1 font-medium">Total Assets</div>
                      <div className="text-2xl font-bold text-slate-900">$127,340</div>
                      <div className="text-xs text-green-600 font-semibold">+12.4%</div>
                </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-gray-200">
                      <div className="text-xs text-slate-600 mb-1 font-medium">Monthly Spend</div>
                      <div className="text-2xl font-bold text-slate-900">$4,890</div>
                      <div className="text-xs text-red-600 font-semibold">+3.2%</div>
                </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <div className="text-xs text-slate-600 mb-1 font-medium">Savings Rate</div>
                      <div className="text-2xl font-bold text-slate-900">28.5%</div>
                      <div className="text-xs text-green-600 font-semibold">+2.1%</div>
          </div>
        </div>

                  {/* Chart Area */}
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 h-28 flex items-center justify-center border border-gray-200">
                    <div className="space-y-2 w-full">
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
           </div>
                      <div className="h-16 bg-gradient-to-t from-slate-200 to-slate-100 rounded-lg flex items-end justify-around px-2">
                        <div className="w-8 bg-gradient-to-t from-[#6fb01a] to-[#85c926] rounded-t-md" style={{height: '60%'}}></div>
                        <div className="w-8 bg-gradient-to-t from-[#6fb01a] to-[#85c926] rounded-t-md" style={{height: '80%'}}></div>
                        <div className="w-8 bg-gradient-to-t from-[#6fb01a] to-[#85c926] rounded-t-md" style={{height: '45%'}}></div>
                        <div className="w-8 bg-gradient-to-t from-[#6fb01a] to-[#85c926] rounded-t-md" style={{height: '90%'}}></div>
                        <div className="w-8 bg-gradient-to-t from-[#6fb01a] to-[#85c926] rounded-t-md" style={{height: '70%'}}></div>
                        <div className="w-8 bg-gradient-to-t from-[#6fb01a] to-[#85c926] rounded-t-md" style={{height: '85%'}}></div>
                 </div>
               </div>
                 </div>
                  
                  {/* Transaction List */}
                  <div className="space-y-3">
                    <div className="text-sm font-bold text-slate-900">Recent Transactions</div>
                    <div className="space-y-3">
                      {[
                        { desc: "Salary Deposit", amount: "+$5,200", cat: "Income", color: "bg-green-50 border-green-200" },
                        { desc: "Rent Payment", amount: "-$1,800", cat: "Housing", color: "bg-red-50 border-red-200" },
                        { desc: "Grocery Store", amount: "-$156", cat: "Food", color: "bg-orange-50 border-orange-200" }
                      ].map((tx, i) => (
                        <div key={i} className={`flex justify-between items-center p-3 rounded-lg border ${tx.color}`}>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{tx.desc}</div>
                            <div className="text-xs text-slate-500">{tx.cat}</div>
                 </div>
                          <div className={`font-bold text-sm ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-slate-900'}`}>
                            {tx.amount}
               </div>
           </div>
                      ))}
         </div>
               </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </section>

      {/* Benefits/Features */}
      <section id="benefits" className="py-12 relative">
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything You Need to Take Control of Your Finances
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Stop juggling multiple apps and spreadsheets. Get complete financial visibility and insights in one place.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-6 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-5 h-5 text-slate-600" />
              </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed">{benefit.desc}</p>
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
      <section id="pricing" className="py-12 relative">
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Start with what you need today, upgrade as you grow. All plans include core features and security.
            </p>
                </div>
          <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className={`rounded-xl p-6 border transition-all hover:shadow-lg bg-white/70 backdrop-blur-sm ${plan.popular ? 'border-slate-900 shadow-md scale-105 ring-2 ring-slate-900' : 'border-gray-200 hover:border-gray-300'}`}>
                {plan.popular && (
                  <div className="text-center mb-4">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                </div>
                )}
                <div className="text-center mb-6">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    {plan.highlight}
                </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{plan.name}</h3>
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-slate-600">/month</span>}
                </div>
                  <p className="text-slate-600">{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-4 h-4 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full py-2 font-medium transition-all ${plan.popular ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => plan.price === "Custom" ? window.open('mailto:sales@easybudget.ing') : router.push('/auth/register')}
                >
                  {plan.cta}
                </Button>
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
              <Button 
                onClick={() => router.push('/auth/register')} 
                className="bg-black hover:bg-gray-900 text-white font-medium px-6 py-3 text-base rounded-lg transition-all"
              >
                Start Now
              </Button>
              <Button 
                variant="outline" 
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-6 py-3 text-base rounded-lg transition-all"
                onClick={() => window.open('mailto:sales@easybudget.ing')}
              >
                Talk to Sales
              </Button>
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
                <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a></li>
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
