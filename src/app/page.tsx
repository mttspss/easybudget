"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
  Zap
} from "lucide-react"

export default function LandingPage() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const router = useRouter()

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
      savings: "Avg savings: $200/month"
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
      savings: "Avg savings: $500/month"
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
      savings: "Avg savings: $800/month"
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
              <a href="#benefits" className="text-gray-600 hover:text-gray-900">Benefits</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                    Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => router.push('/auth/signin')}>
                    Sign In
                  </Button>
                  <Button onClick={() => router.push('/auth/register')}>
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
                <a href="#benefits" className="text-gray-600 hover:text-gray-900 px-2 py-1">Benefits</a>
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
                      <Button onClick={() => router.push('/auth/register')}>Get Started Free</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
              <Star className="w-4 h-4 mr-2" />
              Join 10,000+ people who&apos;ve found $500+/month in hidden savings
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Stop Losing Money You 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Don&apos;t Even Know</span> You&apos;re Losing
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Most people waste <strong>$500+ every month</strong> on forgotten subscriptions, hidden fees, and money leaks. 
              EasyBudget finds and eliminates them automatically - so you can finally build real wealth.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl"
                onClick={() => router.push('/auth/register')}
              >
                Find My Hidden Money Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-xl">
                <Play className="mr-3 h-6 w-6" />
                Watch 2-Min Demo
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-green-600 mb-2">$500+</div>
                <div className="text-gray-600">Average monthly savings found</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">2 min</div>
                <div className="text-gray-600">Setup time required</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">60 days</div>
                <div className="text-gray-600">Money-back guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Finally Take Control of Your Financial Future
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop stressing about money and start building the life you actually want. Here&apos;s how EasyBudget transforms your finances.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
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
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              From Money Stress to Financial Freedom in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No complex budgeting. No spreadsheets. No financial expertise required. Just connect and watch the savings appear.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-bold text-white">{index + 1}</span>
                  </div>
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20"></div>
                  )}
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
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
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Path to Financial Freedom
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every plan pays for itself in the first month. Pick the one that fits your financial goals.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className={`rounded-3xl p-8 relative ${plan.popular ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white transform scale-110 shadow-2xl' : 'bg-white border-2 border-gray-200 shadow-lg'}`}>
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <span className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
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
                  <p className={`text-lg ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>{plan.desc}</p>
                  <div className={`mt-4 text-lg font-bold ${plan.popular ? 'text-green-300' : 'text-green-600'}`}>
                    {plan.savings}
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <Check className={`w-5 h-5 ${plan.popular ? 'text-green-300' : 'text-green-500'} mr-3 flex-shrink-0`} />
                      <span className={plan.popular ? "text-white" : "text-gray-700"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full py-4 text-lg font-bold ${plan.popular ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'}`}
                  onClick={() => router.push('/auth/register')}
                >
                  {plan.name === "Starter" && "Start Saving Money"}
                  {plan.name === "Pro" && "Get Pro - Save Most"}
                  {plan.name === "Family" && "Get Family Plan"}
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
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Questions? We&apos;ve Got Answers
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about transforming your financial life
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <button 
                  className="w-full px-6 py-6 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50" 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-bold text-gray-900 text-lg">{faq.q}</span>
                  <ChevronDown className={`w-6 h-6 text-gray-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
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
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-8 leading-tight">
            Stop Losing Money.<br />Start Building Wealth.
          </h2>
          <p className="text-xl lg:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Join 10,000+ people who&apos;ve taken control of their finances and found an average of <strong>$500+ in monthly savings</strong> they didn&apos;t know they had.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-6 text-xl font-bold shadow-lg"
              onClick={() => router.push('/auth/register')}
            >
              Find My Hidden Money - FREE
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-300 mr-2" />
              <span>60-day money-back guarantee</span>
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-300 mr-2" />
              <span>2-minute setup</span>
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-300 mr-2" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">EasyBudget</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                The smartest way to find hidden money and build real wealth. Join thousands who&apos;ve transformed their financial future.
              </p>
              <div className="flex items-center space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#benefits" className="hover:text-white transition-colors">Benefits</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 text-lg">Get Started</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-3"
                    onClick={() => router.push('/auth/register')}
                  >
                    Sign Up Free
                  </Button>
                </li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 EasyBudget. All rights reserved. Made with ❤️ for people who want financial freedom.
            </p>
            <p className="text-gray-500 text-sm mt-4 md:mt-0">
              hello@easybudget.ing
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
