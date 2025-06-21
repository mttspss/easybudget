"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  Calendar,
  Sparkles,
  Zap,
  Code,
  BarChart3
} from "lucide-react"
import { useRouter } from "next/navigation"

interface ChangelogEntry {
  version: string
  date: string
  type: 'feature' | 'improvement'
  title: string
  description: string
  changes: string[]
}

const futureChangelogData: ChangelogEntry[] = [
  {
    version: "3.0.0",
    date: "Est. Q4 2024",
    type: "feature",
    title: "Mobile App Launch & API Integrations",
    description: "Bringing EasyBudget to your pocket and connecting it to the tools you already use.",
    changes: [
      "Native iOS & Android apps for on-the-go transaction management.",
      "Public API release to allow developers to build on the EasyBudget platform.",
      "Official Zapier integration to connect with thousands of other apps without code."
    ]
  },
  {
    version: "2.5.0",
    date: "Est. Q3 2024",
    type: "feature",
    title: "Collaboration & AI-Powered Insights",
    description: "Introducing features for teams and leveraging AI to provide smarter financial forecasts.",
    changes: [
      "Shared Dashboards: Invite team members, family, or your accountant to view and collaborate on specific dashboards.",
      "User Roles & Permissions for shared dashboards.",
      "AI-Powered Cash Flow Forecasting to predict future financial states based on historical data."
    ]
  },
  {
    version: "2.4.0",
    date: "Est. Q2 2024",
    type: "improvement",
    title: "Advanced Data Management",
    description: "More powerful ways to get your data in and out of EasyBudget.",
    changes: [
      "PDF Imports: Extract transaction data directly from PDF bank statements.",
      "Export to PDF: Generate professional, shareable PDF reports from your analytics.",
      "Automated Subscription Categorization: Automatically detect and categorize recurring subscriptions like Netflix, Spotify, etc."
    ]
  },
  {
    version: "2.3.0",
    date: "Est. Q1 2024",
    type: "feature",
    title: "Automatic Bank Connection",
    description: "Securely connect your bank accounts for automatic transaction syncing, eliminating the need for manual CSV imports.",
    changes: [
      "Direct bank integration for real-time data synchronization.",
      "Support for thousands of financial institutions worldwide.",
      "End-to-end encryption to ensure your financial data remains secure."
    ]
  },
]

const typeConfig = {
  feature: {
    icon: Sparkles,
    color: "bg-green-500",
  },
  improvement: {
    icon: Zap,
    color: "bg-blue-500", 
  },
}

export default function ChangelogPageContent() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Our Roadmap
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A look at the exciting features we&apos;re planning to build. Your feedback can shape our priorities!
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200"></div>
          
          <div className="space-y-8">
            {futureChangelogData.map((entry, index) => {
              const config = typeConfig[entry.type]
              const IconComponent = config.icon
              
              return (
                <div key={index} className="relative">
                  <div className="absolute left-6 w-4 h-4 rounded-full bg-white border-4 border-gray-200 z-10"></div>
                  
                  <div className="ml-16">
                    <Card className="bg-white shadow-sm border-l-4" style={{ borderLeftColor: '#60ea8b' }}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
                              <IconComponent className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {entry.title}
                              </h3>
                              <div className="flex items-center gap-4 mt-1">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200`}>
                                  {entry.type === 'feature' ? 'Feature' : 'Improvement'}
                                </span>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Calendar className="h-4 w-4" />
                                  {entry.date}
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  v{entry.version}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {entry.description}
                        </p>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Key aspects:</h4>
                          <ul className="space-y-2">
                            {entry.changes.map((change, changeIndex) => (
                              <li key={changeIndex} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#60ea8b] mt-2 flex-shrink-0"></div>
                                <span className="text-gray-700 text-sm leading-relaxed">
                                  {change}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="mt-12 text-center bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Have an Idea?
          </h3>
          <p className="text-gray-600 mb-6">
            Help shape the future of EasyBudget by sharing your feedback and feature requests.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => router.push('/dashboard')}
              className="bg-[#60ea8b] hover:bg-[#50da7b] text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://github.com/mttspss/easybudget', '_blank')}
            >
              <Code className="h-4 w-4 mr-2" />
              View on GitHub
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 