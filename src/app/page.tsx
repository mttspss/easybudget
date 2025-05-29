"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  Check, 
  TrendingUp, 
  Shield, 
  Zap,
  BarChart3,
  Target,
  Users,
  ChevronDown,
  Menu,
  X,
  Upload,
  PieChart,
  DollarSign,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Play
} from "lucide-react"

export default function LandingPage() {
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  if (user) {
    window.location.href = "/dashboard"
    return null
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setAuthLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Google auth error:', error)
    } finally {
      setAuthLoading(false)
    }
  }

  const features = [
    { icon: TrendingUp, title: "Find Hidden Money Drains", desc: "Automatically discover forgotten subscriptions, duplicate charges, and unnecessary fees." },
    { icon: Target, title: "Reach Your Goals Faster", desc: "Set meaningful financial goals and get personalized recommendations to achieve them 3x faster." },
    { icon: Shield, title: "Prevent Financial Stress", desc: "Get alerts before potential cash flow problems and receive actionable advice." },
    { icon: BarChart3, title: "Make Smarter Decisions", desc: "Beautiful insights and forecasts help you understand your money patterns." },
    { icon: Zap, title: "Save Time & Energy", desc: "Spend 5 minutes instead of 5 hours managing your finances. Automation handles the boring stuff." },
    { icon: Users, title: "Family Financial Harmony", desc: "Share budgets, coordinate spending, and teach kids about money." }
  ]

  const steps = [
    { icon: Upload, title: "Connect Your Accounts", desc: "Securely link your bank accounts, credit cards, and financial accounts." },
    { icon: PieChart, title: "AI Analyzes Everything", desc: "Our smart algorithms automatically categorize transactions, find patterns." },
    { icon: TrendingUp, title: "Watch Your Wealth Grow", desc: "Get actionable insights, automated savings recommendations, and track progress." }
  ]

  const plans = [
    {
      name: "Starter", price: "$9", desc: "Perfect for individuals ready to take control of their spending",
      features: ["Connect up to 3 accounts", "Automatic expense categorization", "Monthly spending insights", "Basic budget tracking", "Mobile app access"]
    },
    {
      name: "Pro", price: "$19", desc: "For serious savers who want to optimize every dollar", popular: true,
      features: ["Unlimited account connections", "AI-powered spending optimization", "Goal tracking & recommendations", "Bill tracking & alerts", "Investment tracking", "Priority customer support"]
    },
    {
      name: "Wealth", price: "$39", desc: "For families and high earners building serious wealth",
      features: ["Everything in Pro", "Family account sharing", "Advanced investment analysis", "Tax optimization insights", "Personal finance coaching", "White-glove onboarding"]
    }
  ]

  const faqs = [
    { q: "How is EasyBudget different from other budgeting apps?", a: "Unlike basic expense trackers, EasyBudget uses AI to actively find money you're wasting and provides personalized recommendations to optimize your spending." },
    { q: "Is my financial data secure?", a: "Absolutely. We use bank-level 256-bit encryption and never store your banking credentials. We're SOC 2 certified and partner with Plaid for secure data connections." },
    { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel anytime with no questions asked. We also offer a 30-day money-back guarantee." },
    { q: "Do you offer refunds?", a: "We offer a full 30-day money-back guarantee. If EasyBudget doesn't help you save money within the first month, we'll refund every penny." },
    { q: "Can I import data from other budgeting apps?", a: "Yes! We support imports from most major budgeting apps including Mint, YNAB, Personal Capital, and others." }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EasyBudget</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setIsSignUp(false)}>Sign In</Button>
              <Button onClick={() => setIsSignUp(true)}>Get Started</Button>
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
                  <Button variant="ghost" onClick={() => setIsSignUp(false)}>Sign In</Button>
                  <Button onClick={() => setIsSignUp(true)}>Get Started</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
                <TrendingUp className="w-4 h-4 mr-2" />
                Join 10,000+ Smart Savers
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Stop Losing Money You 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Don&apos;t Even Know</span> You&apos;re Losing
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Most people waste $500+ monthly on forgotten subscriptions, hidden fees, and impulse purchases. 
                EasyBudget automatically finds and eliminates these money drains in minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg" onClick={() => setIsSignUp(true)}>
                  Start Saving Money Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                  <Play className="mr-2 h-5 w-5" />
                  Watch 2-Min Demo
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />30-day money-back guarantee</div>
                <div className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Setup in under 5 minutes</div>
                <div className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Cancel anytime</div>
              </div>
            </div>

            {/* Auth Form */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {isSignUp ? "Start Your Financial Transformation" : "Welcome Back"}
                </h3>
                <p className="text-gray-600">
                  {isSignUp ? "Join thousands who&apos;ve taken control of their finances" : "Sign in to your account"}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="pl-10 h-12" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 pr-10 h-12" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={authLoading}>
                  {authLoading ? "Loading..." : (isSignUp ? "Create Account" : "Sign In")}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                  <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
                </div>

                <Button type="button" variant="outline" onClick={handleGoogleAuth} className="w-full h-12" disabled={authLoading}>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button onClick={() => setIsSignUp(!isSignUp)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  {isSignUp ? "Already have an account? Sign in" : "Don&apos;t have an account? Sign up"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Why Smart People Choose EasyBudget</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Stop worrying about money and start building wealth. Here&apos;s how we help you take control.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">From Financial Chaos to Complete Control in 3 Steps</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Get started in minutes, not hours. No complex setup or financial expertise required.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <step.icon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Choose Your Path to Financial Freedom</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Every plan pays for itself by helping you find and eliminate wasteful spending</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className={`rounded-2xl p-8 relative ${plan.popular ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white transform scale-105' : 'bg-white border border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={plan.popular ? "text-blue-100" : "text-gray-600"}>/month</span>
                  </div>
                  <p className={plan.popular ? "text-blue-100" : "text-gray-600"}>{plan.desc}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-green-400' : 'text-green-500'} mr-3 flex-shrink-0`} />
                      <span className={plan.popular ? "" : "text-gray-700"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full ${plan.popular ? 'bg-white text-blue-600 hover:bg-gray-100' : ''}`} variant={plan.popular ? undefined : "outline"}>
                  {plan.name === "Starter" && "Start Saving Money"}
                  {plan.name === "Pro" && "Maximize Your Savings"}
                  {plan.name === "Wealth" && "Build Generational Wealth"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about EasyBudget</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200">
                <button className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4"><p className="text-gray-600">{faq.a}</p></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Stop Losing Money You Don&apos;t Even Know You&apos;re Losing</h2>
          <p className="text-xl mb-8 text-blue-100">Join 10,000+ people who&apos;ve taken control of their finances and found an average of $500+ in monthly savings they didn&apos;t know they had.</p>
          <div className="flex justify-center mb-8">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg" onClick={() => setIsSignUp(true)}>
              Start Your Financial Transformation Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center"><Check className="w-4 h-4 text-green-400 mr-2" />30-day money-back guarantee</div>
            <div className="flex items-center"><Check className="w-4 h-4 text-green-400 mr-2" />Setup in under 5 minutes</div>
            <div className="flex items-center"><Check className="w-4 h-4 text-green-400 mr-2" />Cancel anytime</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">EasyBudget</span>
              </div>
              <p className="text-gray-400 mb-6">The smartest way to understand and control your money flow.</p>
              <p className="text-gray-400 text-sm">hello@easybudget.ing</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 EasyBudget. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
