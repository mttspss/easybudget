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
  ChevronDown,
  Menu,
  X,
  Upload,
  Bell,
  DollarSign,
  Twitter,
  Linkedin,
  Play,
  BarChart3,
  Mail,
  Database,
  Brain,
  Eye,
  Lock,
  Activity
} from "lucide-react"

export default function LandingPage() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [email, setEmail] = useState("")
  const router = useRouter()

  const features = [
    {
      icon: Database,
      title: "Universal Data Integration", 
      desc: "Connect with 10,000+ financial institutions. Import CSV, QIF, and OFX files. Real-time synchronization across all accounts with enterprise-grade security."
    },
    {
      icon: Brain,
      title: "Intelligent Categorization",
      desc: "Machine learning algorithms automatically categorize transactions with 99.2% accuracy. Custom rules engine for business-specific classification needs."
    },
    {
      icon: Activity,
      title: "Predictive Analytics",
      desc: "Advanced forecasting models analyze spending patterns to predict cash flow 30-90 days ahead. Anomaly detection for unusual spending behavior."
    },
    {
      icon: BarChart3,
      title: "Advanced Reporting Suite",
      desc: "Generate comprehensive financial reports with customizable metrics. Export to Excel, PDF, or integrate with your existing business intelligence tools."
    },
    {
      icon: Target,
      title: "Goal-Based Planning",
      desc: "Set financial objectives with milestone tracking. Monte Carlo simulations for retirement and investment planning with scenario analysis."
    },
    {
      icon: Bell,
      title: "Smart Monitoring System",
      desc: "Real-time alerts for unusual transactions, budget thresholds, and recurring payments. Customizable notification preferences via email, SMS, or API."
    }
  ]

  const benefits = [
    { 
      icon: TrendingUp, 
      title: "Optimize Financial Efficiency", 
      desc: "Identify cost reduction opportunities and eliminate redundant expenses. Users typically reduce monthly overhead by 15-25% within the first quarter."
    },
    { 
      icon: Clock, 
      title: "Automate Financial Operations", 
      desc: "Replace manual spreadsheet processes with automated workflows. Reduce financial administration time by up to 80% monthly."
    },
    { 
      icon: Target, 
      title: "Accelerate Goal Achievement", 
      desc: "Data-driven insights help you reach financial objectives faster. Optimize allocation strategies based on historical performance analysis."
    },
    { 
      icon: Shield, 
      title: "Risk Management & Compliance", 
      desc: "Automated compliance monitoring and risk assessment tools. Bank-level security with SOC 2 Type II certification and encryption at rest."
    },
    { 
      icon: Eye, 
      title: "Real-Time Financial Visibility", 
      desc: "Complete transparency across all financial accounts with live updates. Custom dashboards for different stakeholder needs and permissions."
    },
    { 
      icon: Lock, 
      title: "Enterprise Security Standards", 
      desc: "Multi-factor authentication, role-based access control, and audit trails. Meets GDPR, SOX, and other regulatory requirements."
    }
  ]

  const steps = [
    { 
      icon: Upload, 
      title: "Connect & Import", 
      desc: "Securely link financial accounts using read-only API connections. Import historical data from CSV/QIF files or direct bank integration.",
      detail: "Bank-grade 256-bit encryption • Read-only access • No credential storage"
    },
    { 
      icon: Brain, 
      title: "Analyze & Categorize", 
      desc: "AI-powered transaction analysis automatically categorizes and identifies patterns. Machine learning improves accuracy over time.",
      detail: "99.2% categorization accuracy • Pattern recognition • Anomaly detection"
    },
    { 
      icon: Activity, 
      title: "Monitor & Optimize", 
      desc: "Receive intelligent insights and recommendations. Set up automated alerts and generate custom reports for stakeholders.",
      detail: "Real-time monitoring • Predictive alerts • Custom reporting"
    }
  ]

  const plans = [
    {
      name: "Professional", 
      price: "$29", 
      desc: "For individuals and small businesses requiring comprehensive financial management",
      highlight: "Individual & Small Business",
      features: [
        "Up to 10 connected accounts",
        "Advanced transaction categorization", 
        "Monthly financial reports",
        "Goal tracking and forecasting",
        "Email support"
      ],
      cta: "Start Professional Trial"
    },
    {
      name: "Business", 
      price: "$89", 
      desc: "For growing businesses needing multi-user access and advanced analytics",
      highlight: "Most Popular for Teams",
      popular: true,
      features: [
        "Unlimited account connections",
        "Multi-user access (up to 5 users)",
        "Advanced analytics and reporting", 
        "API access for integrations",
        "Priority support",
        "Custom categorization rules"
      ],
      cta: "Start Business Trial"
    },
    {
      name: "Enterprise", 
      price: "Custom", 
      desc: "For large organizations requiring dedicated support and custom integrations",
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
      q: "What security measures protect my financial data?", 
      a: "We implement bank-level security with 256-bit SSL encryption, SOC 2 Type II compliance, and read-only API connections. Your banking credentials are never stored on our servers, and all data is encrypted both in transit and at rest." 
    },
    { 
      q: "How accurate is the automated transaction categorization?", 
      a: "Our machine learning algorithms achieve 99.2% accuracy in transaction categorization. The system continuously improves as it learns from your specific spending patterns and manual corrections." 
    },
    { 
      q: "Can I integrate EasyBudget with my existing business tools?", 
      a: "Yes, we offer RESTful APIs and webhooks for seamless integration with accounting software, CRM systems, and business intelligence tools. Enterprise plans include custom integration support." 
    },
    { 
      q: "What happens to my data if I cancel my subscription?", 
      a: "You can export all your data in standard formats (CSV, Excel, PDF) before cancellation. We provide a 30-day grace period for data retrieval, after which all data is permanently deleted from our servers." 
    },
    { 
      q: "Do you offer on-premise deployment for enterprise clients?", 
      a: "Yes, Enterprise plans include on-premise deployment options for organizations with strict data residency requirements. Our team provides full installation and configuration support." 
    }
  ]

  const handleEmailSignup = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/auth/register?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900">EasyBudget</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">How it Works</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Pricing</a>
              <a href="#faq" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">FAQ</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-slate-600 hover:text-slate-900">
                    Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => signOut()} className="border-slate-300 text-slate-700 hover:bg-slate-50">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => router.push('/auth/signin')} className="text-slate-600 hover:text-slate-900 font-medium">
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => router.push('/auth/register')} 
                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-2"
                  >
                    Get Started
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
                <a href="#features" className="text-slate-600 hover:text-slate-900 px-2 py-1">Features</a>
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
                      <Button onClick={() => router.push('/auth/register')} className="bg-slate-900 hover:bg-slate-800">Get Started</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 leading-tight">
                  Professional Financial
                  <span className="text-slate-600"> Management Platform</span>
                </h1>
                
                <p className="text-xl text-slate-600 leading-relaxed">
                  Enterprise-grade financial analytics and reporting for individuals and businesses. 
                  Automate workflows, gain insights, and make data-driven decisions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => router.push('/auth/register')} 
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-8 py-3 text-lg"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 text-lg font-medium"
                >
                  <Play className="mr-2 h-5 w-5" />
                  View Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-slate-600 font-medium">SOC 2 Certified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-slate-600 font-medium">Bank-Level Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-slate-600 font-medium">10K+ Banks</span>
                </div>
              </div>
            </div>

            {/* Professional Dashboard Mock-up */}
            <div className="relative">
              <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Browser Chrome */}
                <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="ml-4 text-xs text-gray-500 font-mono">easybudget.ing/dashboard</div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-900">Financial Overview</h3>
                    <div className="text-sm text-slate-500">Last updated: 2 mins ago</div>
                  </div>
                  
                  {/* KPI Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-sm text-slate-600 mb-1">Total Assets</div>
                      <div className="text-2xl font-bold text-slate-900">$127,340</div>
                      <div className="text-sm text-green-600">+12.4%</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-sm text-slate-600 mb-1">Monthly Spend</div>
                      <div className="text-2xl font-bold text-slate-900">$4,890</div>
                      <div className="text-sm text-red-600">+3.2%</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-sm text-slate-600 mb-1">Savings Rate</div>
                      <div className="text-2xl font-bold text-slate-900">28.5%</div>
                      <div className="text-sm text-green-600">+2.1%</div>
                    </div>
                  </div>
                  
                  {/* Chart Area */}
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-6 h-40 flex items-center justify-center">
                    <div className="space-y-2 w-full">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                      </div>
                      <div className="h-20 bg-gradient-to-t from-slate-200 to-slate-100 rounded flex items-end justify-around px-2">
                        <div className="w-8 bg-slate-600 rounded-t" style={{height: '60%'}}></div>
                        <div className="w-8 bg-slate-600 rounded-t" style={{height: '80%'}}></div>
                        <div className="w-8 bg-slate-600 rounded-t" style={{height: '45%'}}></div>
                        <div className="w-8 bg-slate-600 rounded-t" style={{height: '90%'}}></div>
                        <div className="w-8 bg-slate-600 rounded-t" style={{height: '70%'}}></div>
                        <div className="w-8 bg-slate-600 rounded-t" style={{height: '85%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Transaction List */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-900">Recent Transactions</div>
                    <div className="space-y-2">
                      {[
                        { desc: "Salary Deposit", amount: "+$5,200", cat: "Income" },
                        { desc: "Rent Payment", amount: "-$1,800", cat: "Housing" },
                        { desc: "Grocery Store", amount: "-$156", cat: "Food" }
                      ].map((tx, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <div>
                            <div className="font-medium text-slate-900">{tx.desc}</div>
                            <div className="text-slate-500">{tx.cat}</div>
                          </div>
                          <div className={`font-semibold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-slate-900'}`}>
                            {tx.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-slate-200 rounded-full opacity-20"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-slate-300 rounded-full opacity-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Enterprise-Grade Financial Intelligence
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Powerful tools and analytics designed for modern financial management
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-slate-200 transition-colors">
                  <feature.icon className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Streamline Your Financial Operations
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Reduce complexity, increase efficiency, and gain complete financial visibility
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                  <benefit.icon className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Implementation Process
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get up and running in minutes with our streamlined onboarding process
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-800 transition-colors">
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  </div>
                  {index < 2 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-slate-200"></div>
                  )}
                </div>
                <div className="space-y-4">
                  <step.icon className="w-8 h-8 text-slate-600 mx-auto" />
                  <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                  <p className="text-sm text-slate-500 font-medium">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs. All plans include core features and security.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className={`rounded-2xl p-8 border transition-all duration-300 hover:shadow-lg ${plan.popular ? 'border-slate-900 shadow-lg scale-105 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                {plan.popular && (
                  <div className="text-center mb-6">
                    <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <div className="text-sm text-slate-600 font-medium mb-2">
                    {plan.highlight}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-slate-600 text-lg">/month</span>}
                  </div>
                  <p className="text-slate-600">{plan.desc}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full py-3 font-medium transition-all duration-200 ${plan.popular ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
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
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know about our platform and security
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                <button 
                  className="w-full px-6 py-6 text-left flex justify-between items-center focus:outline-none hover:bg-gray-50 transition-colors" 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-slate-900 text-lg pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <p className="text-slate-600 leading-relaxed pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Transform Your Financial Management?
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Join thousands of professionals who trust EasyBudget for their financial operations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Button 
              onClick={() => router.push('/auth/register')} 
              className="bg-white text-slate-900 hover:bg-gray-100 font-medium px-8 py-3 text-lg"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="border-slate-600 text-white hover:bg-slate-800 px-8 py-3 text-lg"
              onClick={() => window.open('mailto:sales@easybudget.ing')}
            >
              Contact Sales
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-8 space-y-4 sm:space-y-0 text-sm text-slate-400">
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-green-500 mr-2" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Product */}
            <div>
              <h4 className="font-semibold mb-6 text-lg">Product</h4>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h4 className="font-semibold mb-6 text-lg">Company</h4>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-6 text-lg">Legal</h4>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Data Processing</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-6 text-lg">Get Started</h4>
              <div className="space-y-4">
                <p className="text-slate-400 text-sm">
                  Ready to streamline your financial operations?
                </p>
                <form onSubmit={handleEmailSignup} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <Input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Enter your email" 
                      className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-slate-500"
                      required 
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="w-full bg-white text-slate-900 hover:bg-gray-100 font-medium"
                  >
                    Start Free Trial
                  </Button>
                </form>
                <div className="pt-4 border-t border-slate-800">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/auth/signin')} 
                    className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-slate-900" />
                  </div>
                  <span className="text-xl font-semibold">EasyBudget</span>
                </div>
                <p className="text-slate-400 text-sm">
                  © 2024 EasyBudget. All rights reserved.
                </p>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
                <p className="text-slate-500 text-sm">
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
