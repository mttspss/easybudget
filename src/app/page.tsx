"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Target,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Star,
  Users,
  BarChart3,
  Smartphone,
  Lock,
  Zap,
  Plus,
  Minus,
  LogOut,
  User
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  const faqs = [
    {
      question: "How is EasyBudget different from other budgeting apps?",
      answer: "EasyBudget focuses on simplicity and actionable insights. While other apps overwhelm you with features, we help you understand exactly where your money goes and how to optimize it with clear, visual guidance."
    },
    {
      question: "Is my financial data secure?",
      answer: "Absolutely. We use bank-level encryption and never store your banking credentials. Your data is encrypted both in transit and at rest, and we're SOC 2 compliant."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. No long-term contracts, no cancellation fees. Your data remains accessible during your billing period."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied with EasyBudget within the first 30 days, we'll refund your payment in full."
    },
    {
      question: "Can I import data from other budgeting apps?",
      answer: "Yes, we support importing data from most major budgeting apps including Mint, YNAB, and Personal Capital. Our team can help you migrate your data seamlessly."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EasyBudget</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
              
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{session.user?.name}</span>
                  </div>
                  <Button onClick={() => signOut()} variant="ghost" size="sm">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Button onClick={() => signIn("google")} variant="outline" size="sm">
                    Sign In
                  </Button>
                  <Button onClick={() => signIn("google")} size="sm" className="bg-primary hover:bg-primary/90">
                    Get Started
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
                <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
                <div className="flex flex-col space-y-2 pt-4">
                  {session ? (
                    <>
                      <Link href="/dashboard">
                        <Button variant="outline" size="sm" className="w-full">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <div className="text-sm text-gray-600 px-2">
                        Welcome, {session.user?.name}
                      </div>
                      <Button onClick={() => signOut()} variant="ghost" size="sm">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => signIn("google")} variant="outline" size="sm">
                        Sign In
                      </Button>
                      <Button onClick={() => signIn("google")} size="sm" className="bg-primary hover:bg-primary/90">
                        Get Started
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {session && (
              <div className="mb-8 p-6 bg-primary/10 rounded-lg border border-primary/20">
                <h2 className="text-2xl font-bold text-primary mb-2">
                  Welcome back, {session.user?.name}! 👋
                </h2>
                <p className="text-gray-600 mb-4">
                  Ready to take control of your finances today?
                </p>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
            
            <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
              💳 Multiple Accounts, One Dashboard
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Manage All Your Finances
              <span className="text-primary block">In One Intelligent Dashboard</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Whether you have 1 account or 10+ (personal cards, business accounts, multiple banks), EasyBudget consolidates everything. Import CSV files, track expenses & income, get smart predictions, and never lose control of your money again.
            </p>

            {!session && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  onClick={() => signIn("google")}
                  className="bg-primary hover:bg-primary/90 text-lg px-8 py-4 h-auto"
                >
                  Start Your Financial Transformation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-4 h-auto"
                >
                  Watch 2-Min Demo
                </Button>
              </div>
            )}

            {/* Social Proof */}
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>10,000+ users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Bank-level security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Complete Financial Control
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From simple expense tracking to complex multi-business financial management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Multi-Account Dashboard</CardTitle>
                <CardDescription className="text-base">
                  Manage unlimited accounts in one place. Personal cards, business accounts, multiple banks - all synchronized and categorized automatically.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">CSV Import & Smart Tracking</CardTitle>
                <CardDescription className="text-base">
                  Import bank statements from any institution. Track daily, weekly, monthly, and yearly spending with intelligent categorization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Smart Predictions & Alerts</CardTitle>
                <CardDescription className="text-base">
                  Get 30/60/90-day forecasts based on your spending patterns. Receive alerts before potential cash flow problems.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Goals & Emergency Funds</CardTitle>
                <CardDescription className="text-base">
                  Set and track financial goals like emergency funds, vacation savings, or debt payoff. Visual progress tracking keeps you motivated.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Advanced Reports & Analytics</CardTitle>
                <CardDescription className="text-base">
                  Beautiful charts and detailed reports show spending trends, income patterns, and financial health metrics across all your accounts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Smartphone className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Subscription & Recurring Tracking</CardTitle>
                <CardDescription className="text-base">
                  Never miss a subscription payment. Track all recurring expenses and income, with automatic detection and management.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

             {/* User Types Section */}
       <section className="py-24 bg-white">
         <div className="container mx-auto px-4">
           <div className="text-center mb-16">
             <h2 className="text-4xl font-bold text-gray-900 mb-4">
               Built for Every Financial Journey
             </h2>
             <p className="text-xl text-gray-600 max-w-3xl mx-auto">
               From students tracking their first budget to entrepreneurs managing multiple businesses
             </p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
             {/* Individuals */}
             <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-8">
               <div className="text-center">
                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Users className="h-8 w-8 text-blue-600" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-4">For Individuals</h3>
                 <p className="text-gray-600 mb-6">
                   Perfect for students, young professionals, and anyone starting their financial journey.
                 </p>
                 <ul className="text-left space-y-3 text-gray-600">
                   <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span>Single dashboard for all personal accounts</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span>Easy CSV import from any bank</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span>Personal goals & emergency fund tracking</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span>Subscription management</span>
                   </li>
                 </ul>
               </div>
             </Card>

             {/* Entrepreneurs */}
             <Card className="border-2 border-primary shadow-xl scale-105 p-8">
               <div className="text-center">
                 <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                   <TrendingUp className="h-8 w-8 text-primary" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-4">For Entrepreneurs</h3>
                 <p className="text-gray-600 mb-6">
                   Manage multiple businesses and personal finances without the complexity.
                 </p>
                 <ul className="text-left space-y-3 text-gray-600">
                   <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span>Multiple account dashboards (4+ credit cards, 2+ businesses)</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span>Separate business & personal tracking</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span>Advanced reporting & analytics</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span>Cash flow predictions for each business</span>
                   </li>
                 </ul>
               </div>
             </Card>

             {/* Families */}
             <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 p-8">
               <div className="text-center">
                 <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Shield className="h-8 w-8 text-purple-600" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 mb-4">For Families</h3>
                 <p className="text-gray-600 mb-6">
                   Coordinate household finances and teach kids about money management.
                 </p>
                 <ul className="text-left space-y-3 text-gray-600">
                   <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span>Shared family dashboard access</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span>Multiple savings goals (vacation, education, etc.)</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span>Household expense categorization</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                     <span>Family budget planning & tracking</span>
                   </li>
                 </ul>
               </div>
             </Card>
           </div>
         </div>
       </section>

       {/* CSV Import Highlight */}
       <section className="py-24 bg-gradient-to-br from-primary/5 to-primary/10">
         <div className="container mx-auto px-4">
           <div className="max-w-4xl mx-auto text-center">
             <h2 className="text-4xl font-bold text-gray-900 mb-6">
               Import Any Bank Statement in Seconds
             </h2>
             <p className="text-xl text-gray-600 mb-12">
               Our smart CSV parser automatically detects dates, descriptions, and amounts from any bank format. 
               Positive amounts = income, negative = expenses. It&apos;s that simple.
             </p>
             
             <div className="grid md:grid-cols-2 gap-12 items-center">
               <div className="text-left">
                 <h3 className="text-2xl font-bold text-gray-900 mb-6">Supported Features:</h3>
                 <ul className="space-y-4">
                   <li className="flex items-center">
                     <CheckCircle className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                     <span className="text-lg">Auto-detect date formats (DD/MM/YYYY, MM/DD/YYYY, etc.)</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                     <span className="text-lg">Smart amount parsing (+ for income, - for expenses)</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                     <span className="text-lg">Description cleaning & categorization</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                     <span className="text-lg">Support for all major bank formats</span>
                   </li>
                   <li className="flex items-center">
                     <CheckCircle className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                     <span className="text-lg">Bulk import thousands of transactions</span>
                   </li>
                 </ul>
               </div>
               
               <div className="bg-white rounded-lg shadow-xl p-8">
                 <h4 className="text-lg font-semibold text-gray-900 mb-4">Sample CSV Format:</h4>
                 <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                   <div className="text-gray-600 mb-2">Date,Description,Amount</div>
                   <div className="text-green-600">2024-01-15,Salary Deposit,+3200.00</div>
                   <div className="text-red-600">2024-01-16,Grocery Store,-85.50</div>
                   <div className="text-red-600">2024-01-17,Gas Station,-45.00</div>
                   <div className="text-green-600">2024-01-18,Freelance Payment,+500.00</div>
                 </div>
                 <p className="text-sm text-gray-500 mt-4">
                   EasyBudget automatically categorizes and organizes your data
                 </p>
               </div>
             </div>
           </div>
         </div>
       </section>

       {/* How It Works */}
       <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How EasyBudget Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From setup to financial mastery in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Import Your Data</h3>
              <p className="text-gray-600 text-lg">
                Upload CSV files from any bank or manually add your accounts. Connect personal cards, business accounts, and multiple institutions in minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Track Everything Automatically</h3>
              <p className="text-gray-600 text-lg">
                Watch as your expenses and income get categorized automatically. See daily, weekly, monthly, and yearly spending patterns with beautiful charts.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Plan & Predict Your Future</h3>
              <p className="text-gray-600 text-lg">
                Set goals, track subscriptions, and get smart predictions for the next 30-90 days. Never be surprised by your finances again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Path to Financial Freedom
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every plan pays for itself by helping you find and eliminate wasteful spending
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="border-2 border-gray-200 hover:border-primary/50 transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$9</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <CardDescription className="text-base mt-4">
                  Perfect for individuals ready to take control of their spending
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Connect up to 3 accounts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Automatic expense categorization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Monthly spending insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Basic budget tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Mobile app access</span>
                </div>
                <Button 
                  className="w-full mt-8 bg-primary hover:bg-primary/90"
                  onClick={() => signIn("google")}
                >
                  Start Saving Money
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-primary shadow-xl scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$19</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <CardDescription className="text-base mt-4">
                  For serious savers who want to optimize every dollar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Unlimited account connections</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>AI-powered spending optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Goal tracking & recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Bill tracking & alerts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Investment tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Priority customer support</span>
                </div>
                <Button 
                  className="w-full mt-8 bg-primary hover:bg-primary/90"
                  onClick={() => signIn("google")}
                >
                  Maximize Your Savings
                </Button>
              </CardContent>
            </Card>

            {/* Wealth Plan */}
            <Card className="border-2 border-gray-200 hover:border-primary/50 transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900">Wealth</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">$39</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <CardDescription className="text-base mt-4">
                  For families and high earners building serious wealth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Everything in Pro</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Family account sharing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Advanced investment analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Tax optimization insights</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Personal finance coaching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>White-glove onboarding</span>
                </div>
                <Button 
                  className="w-full mt-8 bg-primary hover:bg-primary/90"
                  onClick={() => signIn("google")}
                >
                  Build Generational Wealth
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">All plans include a 30-day money-back guarantee</p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>SOC 2 compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about EasyBudget
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200">
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {faq.question}
                    </CardTitle>
                    {openFaq === index ? (
                      <Minus className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {openFaq === index && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stop Losing Money You Don&apos;t Even Know You&apos;re Losing
            </h2>
            <p className="text-xl mb-10 opacity-90 max-w-3xl mx-auto">
              Join 10,000+ people who&apos;ve taken control of their finances and found an average of $500+ in monthly savings they didn&apos;t know they had.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                onClick={() => signIn("google")}
                className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-4 h-auto font-semibold"
              >
                Start Your Financial Transformation Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm opacity-80">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Setup in under 5 minutes</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">EasyBudget</span>
              </div>
              <p className="text-gray-400 mb-4">
                The smartest way to understand and control your money flow.
              </p>
              <p className="text-gray-400 text-sm">
                hello@easybudget.ing
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 EasyBudget. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
