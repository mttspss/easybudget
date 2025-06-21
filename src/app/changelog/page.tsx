"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ArrowLeft,
  Calendar,
  Code,
  Sparkles,
  Bug,
  BarChart3,
  Shield,
  Zap,
  Smartphone,
  Users,
  Recycle,
  Banknote
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChangelogEntry {
  version: string
  date: string
  type: 'feature' | 'improvement' | 'bugfix' | 'security'
  title: string
  description: string
  changes: string[]
}

const roadmapData: {
  version: string
  date: string
  type: 'feature' | 'improvement'
  title: string
  description: string
  changes: string[]
  icon: React.ElementType
}[] = [
  {
    version: "3.0.0",
    date: "Est. Q4 2024",
    type: "feature",
    title: "Mobile App & API Integrations",
    description: "Bringing EasyBudget to your pocket and connecting it with the tools you already use.",
    changes: [
      "Native iOS & Android apps for on-the-go transaction management.",
      "Public API release for developers to build on the EasyBudget platform.",
      "Official Zapier integration to connect with thousands of other apps without code."
    ],
    icon: Smartphone
  },
  {
    version: "2.5.0",
    date: "Est. Q3 2024",
    type: "feature",
    title: "Collaboration & AI-Powered Insights",
    description: "Introducing features for teams and leveraging AI to provide smarter financial forecasts.",
    changes: [
      "Shared Dashboards: Invite team members or your accountant to collaborate.",
      "User Roles & Permissions for shared dashboards.",
      "AI-Powered Cash Flow Forecasting based on your historical data."
    ],
    icon: Users
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
      "Automated Subscription Categorization for recurring payments."
    ],
    icon: Recycle
  },
  {
    version: "2.3.0",
    date: "Est. Q1 2024",
    type: "feature",
    title: "Automatic Bank Connection",
    description: "Securely connect your bank accounts for automatic transaction syncing.",
    changes: [
      "Direct bank integration for real-time data synchronization.",
      "Support for thousands of financial institutions worldwide.",
      "End-to-end encryption to ensure your data remains secure."
    ],
    icon: Banknote
  },
]

const typeConfig = {
  feature: {
    icon: Sparkles,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    label: "New Feature"
  },
  improvement: {
    icon: Zap,
    color: "bg-blue-500", 
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    label: "Improvement"
  },
  bugfix: {
    icon: Bug,
    color: "bg-orange-500",
    bgColor: "bg-orange-50", 
    borderColor: "border-orange-200",
    textColor: "text-orange-700",
    label: "Bug Fix"
  },
  security: {
    icon: Shield,
    color: "bg-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-200", 
    textColor: "text-red-700",
    label: "Security"
  }
}

export default function ChangelogPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
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
              Changelog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay up to date with the latest features, improvements, and fixes for EasyBudget
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-200"></div>
          
          <div className="space-y-8">
            {roadmapData.map((entry, index) => {
              const config = typeConfig[entry.type]
              const IconComponent = config.icon
              
              return (
                <div key={index} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-6 w-4 h-4 rounded-full bg-white border-4 border-gray-200 z-10"></div>
                  
                  {/* Content card */}
                  <div className="ml-16">
                    <Card className="bg-white shadow-sm border-l-4" style={{ borderLeftColor: '#60ea8b' }}>
                      <CardContent className="p-6">
                        {/* Header */}
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
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} border`}>
                                  {config.label}
                                </span>
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(entry.date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  v{entry.version}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {entry.description}
                        </p>

                        {/* Changes list */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Changes:</h4>
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

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Stay Updated
          </h3>
          <p className="text-gray-600 mb-6">
            Follow our development journey and be the first to know about new features
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