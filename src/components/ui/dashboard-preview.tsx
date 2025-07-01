"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { 
  BarChart3, 
  CreditCard, 
  Target,
  Upload,
  Clock,
  TrendingUp
} from "lucide-react"

interface DashboardTab {
  id: string
  name: string
  icon: React.ElementType
  description: string
  image: string
  features: string[]
}

interface DashboardPreviewProps {
  user?: any
}

const dashboardTabs: DashboardTab[] = [
  {
    id: "overview",
    name: "Dashboard overview",
    icon: BarChart3,
    description: "Get a complete view of your finances at a glance",
    image: "/dashboard-preview-overview.png",
    features: [
      "Real-time balance tracking",
      "Monthly spending trends",
      "Quick transaction overview",
      "Savings rate monitoring"
    ]
  },
  {
    id: "analytics", 
    name: "Advanced Analytics",
    icon: Clock,
    description: "Deep insights into your financial patterns and habits",
    image: "/dashboard-preview-analytics.png",
    features: [
      "Spending pattern analysis",
      "Category breakdowns",
      "Income vs expense trends",
      "Monthly comparison charts"
    ]
  },
  {
    id: "transactions",
    name: "Transaction Management", 
    icon: CreditCard,
    description: "Organize and categorize all your financial transactions",
    image: "/dashboard-preview-transactions.png",
    features: [
      "Smart categorization",
      "Quick filtering options",
      "Bulk editing tools",
      "Search and sort capabilities"
    ]
  },
  {
    id: "import",
    name: "Import CSV",
    icon: Upload,
    description: "Easily import your financial data from any bank or platform",
    image: "/dashboard-preview-import.png",
    features: [
      "Support for all bank formats",
      "Smart duplicate detection",
      "Automatic categorization",
      "Instant data processing"
    ]
  },
  {
    id: "goals",
    name: "Financial Goals",
    icon: Target,
    description: "Set and track your financial objectives with visual progress",
    image: "/dashboard-preview-goals.png", 
    features: [
      "Custom goal setting",
      "Progress visualization",
      "Achievement milestones",
      "Smart recommendations for families"
    ]
  }
]

export function DashboardPreview({ user }: DashboardPreviewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [imageError, setImageError] = useState<Record<string, boolean>>({})
  const router = useRouter()
  const activeTabData = dashboardTabs.find(tab => tab.id === activeTab)

  const handleImageError = (tabId: string) => {
    setImageError(prev => ({ ...prev, [tabId]: true }))
  }

  const handleTryFeature = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/auth/register')
    }
  }

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See your dashboard in action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the powerful features that make EasyBudget the perfect financial companion
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto gap-2 justify-start sm:justify-center mb-8 sm:mb-12 pb-2 scrollbar-hide">
            {dashboardTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:border-green-500 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTabData && (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left side - Info */}
            <div className="space-y-6 sm:order-1 order-2 hidden sm:block">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#60ea8b]/10 flex items-center justify-center">
                    <activeTabData.icon className="h-6 w-6 text-[#60ea8b]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {activeTabData.name}
                  </h3>
                </div>
                <p className="text-lg text-gray-600">
                  {activeTabData.description}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {activeTabData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#60ea8b] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Button 
                  onClick={handleTryFeature}
                  size="lg"
                  className="bg-[#60ea8b] hover:bg-[#50da7b] text-white px-8 py-3 cursor-pointer"
                >
                  {user ? 'Go to Dashboard' : 'Try This Feature Now'}
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right side - Dashboard Preview */}
            <div className="relative sm:order-2 order-1">
              <Card className="overflow-hidden border-2 border-gray-200 shadow-xl">
                <CardContent className="p-0">
                  {/* Browser Bar */}
                  <div className="bg-gray-100 px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex-1 bg-white rounded-md px-3 py-1 ml-4">
                        <span className="text-xs text-gray-500">app.easybudget.com/{activeTab}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dashboard Preview Content */}
                  <div className="relative">
                    {!imageError[activeTab] ? (
                      // Try to show real screenshot first
                      <Image
                        src={activeTabData.image}
                        alt={`${activeTabData.name} screenshot`}
                        width={800}
                        height={600}
                        className="w-full h-auto object-contain"
                        onError={() => handleImageError(activeTab)}
                        priority={activeTab === "overview"}
                      />
                    ) : (
                      // Fallback to mockup component if image fails to load
                      <div className="w-full min-h-[400px] bg-[#FAFAFA] p-4">
                        {activeTab === "overview" && <OverviewPreview />}
                        {activeTab === "analytics" && <AnalyticsPreview />}
                        {activeTab === "transactions" && <TransactionsPreview />}
                        {activeTab === "import" && <ImportPreview />}
                        {activeTab === "goals" && <GoalsPreview />}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#60ea8b]/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// Preview Components for each tab
function OverviewPreview() {
  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-xs text-gray-500 mb-1">Total Balance</div>
          <div className="text-lg font-bold text-[#60ea8b]">€5,247</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-xs text-gray-500 mb-1">This Month</div>
          <div className="text-lg font-bold text-red-500">-€1,234</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-xs text-gray-500 mb-1">Savings Rate</div>
          <div className="text-lg font-bold text-blue-500">23%</div>
        </div>
      </div>
      
      {/* Chart Preview */}
      <div className="bg-white rounded-lg p-4 border h-48">
        <div className="text-sm font-semibold mb-3">Spending Trend</div>
        <div className="w-full h-32 bg-gradient-to-t from-[#60ea8b]/20 to-[#60ea8b]/5 rounded flex items-end justify-center">
          <div className="text-xs text-gray-500">Interactive Chart</div>
        </div>
      </div>
    </div>
  )
}

function AnalyticsPreview() {
  return (
    <div className="space-y-4">
      {/* Analytics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-xs text-gray-500 mb-1">Top Category</div>
          <div className="text-sm font-semibold">Food & Dining</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-xs text-gray-500 mb-1">Trend</div>
          <div className="text-sm font-semibold text-[#60ea8b]">Improving</div>
        </div>
      </div>
      
      {/* Pie Chart Preview */}
      <div className="bg-white rounded-lg p-4 border h-48">
        <div className="text-sm font-semibold mb-3">Category Breakdown</div>
        <div className="flex items-center justify-center h-32">
          <div className="w-24 h-24 rounded-full border-8 border-[#60ea8b] border-l-blue-500 border-b-red-500"></div>
        </div>
      </div>
    </div>
  )
}

function TransactionsPreview() {
  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <div className="text-sm font-semibold">Recent Transactions</div>
      </div>
      <div className="space-y-0">
        {[
          { desc: "Grocery Store", amount: "-€45.20", category: "Food", color: "bg-green-500" },
          { desc: "Salary Deposit", amount: "+€3,200", category: "Income", color: "bg-blue-500" },
          { desc: "Netflix", amount: "-€12.99", category: "Entertainment", color: "bg-purple-500" }
        ].map((tx, i) => (
          <div key={i} className="flex items-center justify-between p-3 border-b last:border-b-0">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${tx.color}`}></div>
              <div>
                <div className="text-sm font-medium">{tx.desc}</div>
                <div className="text-xs text-gray-500">{tx.category}</div>
              </div>
            </div>
            <div className={`text-sm font-semibold ${tx.amount.startsWith('+') ? 'text-[#60ea8b]' : 'text-red-500'}`}>
              {tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImportPreview() {
  return (
    <div className="space-y-4">
      {/* Import CSV Features */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-xs text-gray-500 mb-1">Support for 100+ bank formats</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-xs text-gray-500 mb-1">Drag & drop CSV upload</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-xs text-gray-500 mb-1">Automatic column mapping</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-xs text-gray-500 mb-1">Duplicate detection & merging</div>
        </div>
      </div>
    </div>
  )
}

function GoalsPreview() {
  return (
    <div className="space-y-4">
      {/* Goals List */}
      <div className="space-y-3">
        {[
          { name: "Emergency Fund", progress: 75, target: "€5,000", current: "€3,750" },
          { name: "Vacation Savings", progress: 45, target: "€2,000", current: "€900" },
          { name: "New Laptop", progress: 90, target: "€1,200", current: "€1,080" }
        ].map((goal, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-semibold">{goal.name}</div>
              <div className="text-xs text-gray-500">{goal.current} / {goal.target}</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#60ea8b] h-2 rounded-full transition-all"
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 